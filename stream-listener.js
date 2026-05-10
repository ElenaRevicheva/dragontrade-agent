/**
 * stream-listener.js — Algom Alpha X Filtered Stream
 *
 * Monitors keywords across ALL of X in real-time.
 * When matching tweet found → auto-like + optional follow + queue for reply.
 *
 * Target keywords: people who need fractional CTO / AI engineer / CRM help.
 * = Elena's ideal clients arriving in real-time, not hunted one by one.
 *
 * Wired into dragontrade index.js via startFilteredStream().
 * State persisted in stream_state.json (liked/followed/seen dedup).
 */

import { TwitterApi } from 'twitter-api-v2';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STATE_FILE = resolve(__dirname, 'stream_state.json');

// ── Stream rules: Elena's ideal client signals ───────────────────────────────
const STREAM_RULES = [
  { value: '"fractional CTO" -is:retweet lang:en', tag: 'fractional_cto' },
  { value: '("need CTO" OR "looking for CTO" OR "hire CTO") -is:retweet lang:en', tag: 'need_cto' },
  { value: '"AI engineer" (hiring OR need OR looking) -is:retweet lang:en', tag: 'ai_engineer_hiring' },
  { value: '("HubSpot" OR "CRM") ("leads" OR "pipeline" OR "not working") -is:retweet lang:en', tag: 'crm_pain' },
  { value: '("build AI" OR "AI product") (founder OR startup OR building) -is:retweet lang:en', tag: 'ai_founder' },
];

const SPAM_RE = /follow me|check my bio|dm me|pump|100x|airdrop|nft mint|\$[A-Z]{2,5}\s+moon/i;
const CRYPTO_RE = /\$BTC|\$ETH|\$SOL|bitcoin price|ethereum price|altcoin/i;

function loadState() {
  try { if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); } catch {}
  return { liked: {}, followed: {}, seen: [] };
}
function saveState(s) {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(s, null, 2)); } catch {}
}

function isQuality(tweet, author) {
  const text = tweet.text || '';
  const followers = author?.public_metrics?.followers_count || 0;
  if (SPAM_RE.test(text)) return false;
  if (CRYPTO_RE.test(text)) return false;
  if (followers < 30) return false;
  if (text.length < 20) return false;
  return true;
}

/** Register or verify stream rules. Safe to call multiple times. */
export async function setupStreamRules(client) {
  try {
    const existing = (await client.v2.streamRules())?.data || [];
    const existingTags = new Set(existing.map(r => r.tag));
    const toAdd = STREAM_RULES.filter(r => !existingTags.has(r.tag));
    if (toAdd.length === 0) {
      console.log(`[Stream] ${existing.length} rules already active`);
      return true;
    }
    await client.v2.updateStreamRules({ add: toAdd });
    console.log(`[Stream] Added ${toAdd.length} rules: ${toAdd.map(r => r.tag).join(', ')}`);
    return true;
  } catch (err) {
    console.warn('[Stream] Rule setup failed:', err?.data?.detail || err?.message || err);
    return false;
  }
}

/** Start the filtered stream. Returns stream object or null if tier doesn't allow. */
export async function startFilteredStream(client, opts = {}) {
  const { autoLike = true, autoFollow = true, maxActionsPerHour = 15 } = opts;

  let actionsThisHour = 0;
  setInterval(() => { actionsThisHour = 0; }, 60 * 60 * 1000);

  try {
    const me = await client.v2.me();
    const myId = me.data?.id;
    if (!myId) { console.warn('[Stream] Cannot get own user ID'); return null; }

    await setupStreamRules(client);

    const stream = await client.v2.searchStream({
      'tweet.fields': ['author_id', 'text', 'created_at', 'public_metrics'],
      'user.fields':  ['name', 'username', 'public_metrics', 'description'],
      'expansions':   ['author_id'],
    });
    stream.autoReconnect = true;

    console.log('[Stream] ✅ Connected to X filtered stream — monitoring prospects in real-time');

    stream.on('data', async (event) => {
      try {
        const tweet = event.data;
        const author = (event.includes?.users || []).find(u => u.id === tweet?.author_id);
        const tweetId = tweet?.id;
        const text = tweet?.text || '';
        const rule = event.matching_rules?.[0];
        if (!tweetId || tweet?.author_id === myId) return;

        const state = loadState();
        if (state.seen.includes(tweetId)) return;
        state.seen.push(tweetId);
        if (state.seen.length > 2000) state.seen = state.seen.slice(-2000);

        console.log(`[Stream] 🎯 [${rule?.tag}] @${author?.username}: "${text.slice(0, 90)}"`);

        if (!isQuality(tweet, author)) { saveState(state); return; }
        if (actionsThisHour >= maxActionsPerHour) { saveState(state); return; }

        // Auto-like
        if (autoLike && !state.liked[tweetId]) {
          try {
            await client.v2.like(myId, tweetId);
            state.liked[tweetId] = Date.now();
            actionsThisHour++;
            console.log(`[Stream] ❤️  Liked @${author?.username}`);
            await new Promise(r => setTimeout(r, 2500));
          } catch (e) {
            if (!String(e?.message || e).includes('already')) {
              console.warn('[Stream] Like error:', e?.data?.detail || e?.message);
            }
          }
        }

        // Auto-follow high-intent (explicit "need CTO" / "hiring AI engineer")
        const highIntent = /(need|looking for|hiring|seeking|want).*(CTO|AI engineer|fractional)/i.test(text);
        if (autoFollow && highIntent && !state.followed[tweet.author_id] && actionsThisHour < maxActionsPerHour) {
          try {
            await client.v2.follow(myId, tweet.author_id);
            state.followed[tweet.author_id] = Date.now();
            actionsThisHour++;
            console.log(`[Stream] ➕ Followed @${author?.username} (high-intent: ${rule?.tag})`);
            await new Promise(r => setTimeout(r, 3000));
          } catch (e) {
            console.warn('[Stream] Follow error:', e?.data?.detail || e?.message);
          }
        }

        saveState(state);
      } catch (err) {
        console.warn('[Stream] Event error:', err?.message);
      }
    });

    stream.on('error', err => console.warn('[Stream] Error:', err?.message || err));
    return stream;

  } catch (err) {
    const msg = String(err?.data?.detail || err?.message || err);
    if (msg.includes('403') || msg.includes('client-not-enrolled')) {
      console.warn('[Stream] Filtered stream requires Basic plan ($200/mo) — skipping. Engagement loop still active.');
    } else if (msg.includes('429')) {
      console.warn('[Stream] Rate limited — will retry on next restart');
    } else {
      console.warn('[Stream] Failed to start:', msg.slice(0, 200));
    }
    return null;
  }
}
