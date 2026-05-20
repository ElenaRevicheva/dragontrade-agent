/**
 * algom-poll.js — X Recent Search polling fallback
 * Polls v2/tweets/search/recent every 3 minutes for same keywords as stream rules.
 * Works on Basic tier where filtered stream delivers 0 events.
 * Actions: auto-like quality tweets, auto-follow high-intent, push to HubSpot CRM.
 */

import dotenv from 'dotenv';
dotenv.config();
import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const STATE_FILE = resolve(__dirname, 'stream_state.json');
const POLL_MS    = 30 * 60 * 1000;

const QUERIES = [
  { q: '"fractional CTO" -is:retweet lang:en',                                                tag: 'fractional_cto' },
  { q: '("need CTO" OR "looking for CTO" OR "hire CTO") -is:retweet lang:en',                tag: 'need_cto' },
  { q: '"AI engineer" (hiring OR need OR looking) -is:retweet lang:en',                       tag: 'ai_engineer_hiring' },
  { q: '("HubSpot" OR "CRM") ("leads" OR "pipeline" OR "not working") -is:retweet lang:en',  tag: 'crm_pain' },
  { q: '("build AI" OR "AI product") (founder OR startup OR building) -is:retweet lang:en',  tag: 'ai_founder' },
];

const SPAM_RE       = /follow me|check my bio|dm me|pump|100x|airdrop|nft mint|\$[A-Z]{2,5}\s+moon/i;
const CRYPTO_RE     = /\$BTC|\$ETH|\$SOL|bitcoin price|ethereum price|altcoin/i;
const HIGH_INTENT   = /(need|looking for|hiring|seeking|want).*(CTO|AI engineer|fractional)/i;

function extractBioUrl(bio) {
  if (!bio) return null;
  var m = bio.match(/https?:\/\/[^\s"'<>]+/);
  return m ? m[0].replace(/[.,;)]+$/, '') : null;
}

function loadState() {
  try { if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch {}
  return { liked: {}, followed: {}, seen: [] };
}
function saveState(s) {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); } catch {}
}

function isQuality(tweet, author) {
  const text      = tweet.text || '';
  const followers = author?.public_metrics?.followers_count || 0;
  if (SPAM_RE.test(text))   return false;
  if (CRYPTO_RE.test(text)) return false;
  if (followers < 30)       return false;
  if (text.length < 20)     return false;
  return true;
}

async function pushToCRM({ tag, username, name, text, tweetUrl, domain }) {
  const secret = (process.env.OUTREACH_SECRET || '').trim();
  const base   = (process.env.CTO_AIPA_WEBHOOK_URL || 'https://webhook.aideazz.xyz/cto').replace(/\/$/, '');
  if (!secret) return;
  try {
    const res = await fetch(base + '/api/crm-event', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + secret },
      body:    JSON.stringify({
        source:   'algom_poll',
        domain:   domain || undefined,
        type:     'prospect',
        pipeline: 'client',
        sourcePrefix: 'CLIENT-ALGOM',
        name,
        context:  '[X/' + tag + '] @' + username + ': ' + text.slice(0, 400) + '\n' + tweetUrl,
        urgency:  tag === 'need_cto' ? 5 : tag === 'ai_engineer_hiring' ? 4 : 3,
      }),
    });
    if (res.ok) console.log('[Poll] CRM pushed: @' + username + ' (' + tag + ')');
  } catch (e) {
    // non-fatal
  }
}

async function poll(client, myId, actionsRef) {
  const state = loadState();
  let newSeen = 0, liked = 0, followed = 0;

  for (const entry of QUERIES) {
    let results;
    try {
      results = await client.v2.search(entry.q, {
        'tweet.fields': ['author_id', 'text', 'created_at', 'public_metrics'],
        'user.fields':  ['name', 'username', 'public_metrics', 'description'],
        'expansions':   ['author_id'],
        max_results:    10,
      });
    } catch (e) {
      console.warn('[Poll] search error (' + entry.tag + '):', (e && e.data && e.data.detail) || (e && e.message && e.message.slice(0, 80)));
      continue;
    }

    const tweets = (results && results.data && results.data.data) || [];
    const users  = (results && results.data && results.data.includes && results.data.includes.users) || [];

    for (const tweet of tweets) {
      const tweetId = tweet.id;
      if (!tweetId || tweet.author_id === myId) continue;
      if (state.seen.includes(tweetId)) continue;

      state.seen.push(tweetId);
      if (state.seen.length > 2000) state.seen = state.seen.slice(-2000);
      newSeen++;

      const author   = users.find(function(u) { return u.id === tweet.author_id; });
      const text     = tweet.text || '';
      const username = (author && author.username) || 'unknown';
      console.log('[Poll] [' + entry.tag + '] @' + username + ': "' + text.slice(0, 80) + '"');

      if (!isQuality(tweet, author)) { console.log('[Poll]   quality-rejected'); continue; }
      if (actionsRef.count >= 20)    { console.log('[Poll]   hourly cap reached'); continue; }

      if (!state.liked[tweetId]) {
        try {
          await client.v2.like(myId, tweetId);
          state.liked[tweetId] = Date.now();
          actionsRef.count++;
          liked++;
          console.log('[Poll]   Liked @' + username);
          await new Promise(function(r) { setTimeout(r, 2000); });
        } catch (e) {
          var msg = String((e && e.message) || e);
          if (!msg.includes('already'))
            console.warn('[Poll]   Like error:', (e && e.data && e.data.detail) || msg.slice(0, 60));
        }
      }

      var highIntent = HIGH_INTENT.test(text);
      if (highIntent && !state.followed[tweet.author_id] && actionsRef.count < 20) {
        try {
          await client.v2.follow(myId, tweet.author_id);
          state.followed[tweet.author_id] = Date.now();
          actionsRef.count++;
          followed++;
          console.log('[Poll]   Followed @' + username + ' (' + entry.tag + ')');
          await new Promise(function(r) { setTimeout(r, 2500); });
        } catch (e) {
          console.warn('[Poll]   Follow error:', (e && e.data && e.data.detail) || (e && e.message && e.message.slice(0, 60)));
        }
      }

      if (highIntent && username !== 'unknown') {
        pushToCRM({
          tag: entry.tag, username,
          name:     (author && author.name) || username,
          text,
          tweetUrl: 'https://x.com/' + username + '/status/' + tweetId,
          domain:   extractBioUrl(author && author.description),
        }).catch(function() {});
      }
    }

    await new Promise(function(r) { setTimeout(r, 1200); });
  }

  saveState(state);
  console.log('[Poll] Cycle done — new:' + newSeen + ' liked:' + liked + ' followed:' + followed + ' actions_hr:' + actionsRef.count);
}

async function main() {
  var apiKey    = process.env.TWITTER_API_KEY;
  var apiSecret = process.env.TWITTER_API_SECRET;
  var accToken  = process.env.TWITTER_ACCESS_TOKEN;
  var accSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accToken || !accSecret) {
    console.error('[Poll] Missing Twitter credentials');
    process.exit(1);
  }

  var client = new TwitterApi({ appKey: apiKey, appSecret: apiSecret, accessToken: accToken, accessSecret: accSecret });
  var me     = await client.v2.me();
  var myId   = me.data && me.data.id;
  if (!myId) { console.error('[Poll] Cannot get own user ID'); process.exit(1); }

  console.log('[Poll] Started as @' + me.data.username + ' — polling 5 keyword sets every 3min');

  var actionsRef = { count: 0 };
  setInterval(function() { actionsRef.count = 0; }, 60 * 60 * 1000);

  await poll(client, myId, actionsRef);

  setInterval(async function() {
    try { await poll(client, myId, actionsRef); }
    catch (e) { console.warn('[Poll] Cycle error:', e && e.message && e.message.slice(0, 100)); }
  }, POLL_MS);

  setInterval(function() {}, 60 * 60 * 1000);
}

process.on('uncaughtException', function(err) { console.error('[Poll] uncaughtException:', err.message); });
process.on('unhandledRejection', function(reason) { console.warn('[Poll] unhandledRejection:', String(reason).slice(0, 100)); });

main().catch(function(err) { console.error('[Poll] Fatal:', err.message); process.exit(1); });
