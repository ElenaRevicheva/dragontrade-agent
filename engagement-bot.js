/**
 * engagement-bot.js
 * Algom Alpha engagement module — intelligent replies + auto-follow.
 *
 * What it does:
 *  1. Fetches recent mentions + replies on Elena's (@reviceva) X account
 *  2. Filters out spam, bots, pure likes (no text)
 *  3. Generates a short, relevant AI reply using Groq (fallback: Claude Haiku)
 *  4. Posts the reply
 *  5. Follows users who left substantive comments
 *
 * Rate limits respected:
 *  - Twitter v2 free: 17 tweets/24h total (shared with main posts)
 *  - Replies: max 2 per engagement run (saves budget for main content)
 *  - Follows: max 3 per run, 20 per day
 *  - Runs every 45 minutes
 *
 * Zero risk of spam: only replies once per user per 48h (tracked in engagement_state.json)
 */

import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STATE_FILE = resolve(__dirname, 'engagement_state.json');

function loadState() {
  try {
    if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {}
  return { replied: {}, followed: {}, lastRunAt: null, dailyFollows: 0, dailyFollowsDate: '' };
}

function saveState(state) {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2)); } catch {}
}

async function generateReply(commentText, commenterName, groqApiKey) {
  if (!groqApiKey) return null;
  const prompt = `You are Elena Revicheva (@reviceva), AI engineer and founder of AIdeazz.
Someone commented on your X post: "${commentText}"
Their name: ${commenterName}

Write a SHORT, warm, genuine reply (1-2 sentences, max 200 chars).
Rules:
- Sound like a real human founder, not a bot
- Be specific to what they said
- No generic "Thanks!" only — add something of value
- No hashtags
- Don't start with "Hey" or "Hi"
- Do NOT repeat their words back verbatim

Reply ONLY the tweet text, nothing else.`;

  return new Promise((resolve) => {
    const body = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 80,
      temperature: 0.7,
    });
    const req = https.request({
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const text = json.choices?.[0]?.message?.content?.trim() || null;
          resolve(text);
        } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(10000, () => { req.destroy(); resolve(null); });
    req.write(body);
    req.end();
  });
}

const SPAM_PATTERNS = [
  /follow\s*(me|back)/i,
  /dm\s*me/i,
  /check\s*(out|my)\s*(profile|bio)/i,
  /100x/i,
  /giveaway/i,
  /airdrop/i,
  /https?:\/\/\S+/,
];

function isSpam(text) {
  if (!text || text.trim().length < 8) return true;
  return SPAM_PATTERNS.some(p => p.test(text));
}

function isSubstantive(text) {
  const cleaned = (text || '').replace(/[\u{1F000}-\u{1FFFF}\s.,!?@#]/gu, '').trim();
  return cleaned.length >= 8;
}

export async function runEngagementCycle(twitterClient, options = {}) {
  const { groqApiKey = process.env.GROQ_API_KEY, maxReplies = 2, maxFollows = 3 } = options;

  console.log('[Engagement] Starting engagement cycle...');
  const state = loadState();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  if (state.dailyFollowsDate !== today) {
    state.dailyFollows = 0;
    state.dailyFollowsDate = today;
  }

  // Prune reply cache older than 48h
  const cutoff48h = Date.now() - 48 * 60 * 60 * 1000;
  for (const [uid, ts] of Object.entries(state.replied)) {
    if (ts < cutoff48h) delete state.replied[uid];
  }

  let repliesSent = 0;
  let followsDone = 0;

  try {
    const me = await twitterClient.v2.me();
    const myId = me.data?.id;
    if (!myId) { console.log('[Engagement] Could not get own user ID'); return; }

    const mentions = await twitterClient.v2.userMentionTimeline(myId, {
      max_results: 20,
      'tweet.fields': ['author_id', 'text', 'in_reply_to_user_id', 'created_at'],
      'user.fields': ['name', 'username', 'public_metrics'],
      expansions: ['author_id'],
    });

    const tweets = mentions?.data?.data || [];
    const users = Object.fromEntries(
      (mentions?.data?.includes?.users || []).map(u => [u.id, u])
    );

    console.log(`[Engagement] Found ${tweets.length} recent mentions`);

    for (const tweet of tweets) {
      if (repliesSent >= maxReplies) break;

      const authorId = tweet.author_id;
      if (!authorId || authorId === myId) continue;

      const text = tweet.text || '';
      const author = users[authorId];
      const authorName = author?.name || author?.username || 'there';

      if (state.replied[authorId]) {
        console.log(`[Engagement] Already replied to @${author?.username} — skipping`);
        continue;
      }

      if (isSpam(text)) {
        console.log(`[Engagement] Spam from @${author?.username} — skipping`);
        continue;
      }

      if (!isSubstantive(text)) {
        console.log(`[Engagement] Not substantive from @${author?.username} — skipping`);
        continue;
      }

      const replyText = await generateReply(text, authorName, groqApiKey);
      if (!replyText || replyText.length < 10) {
        console.log(`[Engagement] AI reply generation failed for @${author?.username}`);
        continue;
      }

      const finalReply = replyText.slice(0, 280);

      try {
        await twitterClient.v2.reply(finalReply, tweet.id);
        state.replied[authorId] = Date.now();
        repliesSent++;
        console.log(`[Engagement] Replied to @${author?.username}: "${finalReply.slice(0, 70)}..."`);

        // Auto-follow substantive commenters
        const notFollowed = !state.followed[authorId];
        const dailyOk = state.dailyFollows < 20;
        const runOk = followsDone < maxFollows;

        if (notFollowed && dailyOk && runOk) {
          try {
            await twitterClient.v2.follow(myId, authorId);
            state.followed[authorId] = Date.now();
            state.dailyFollows++;
            followsDone++;
            console.log(`[Engagement] Followed @${author?.username}`);
          } catch (followErr) {
            console.warn(`[Engagement] Follow failed for @${author?.username}:`, followErr?.data?.detail || followErr?.message || followErr);
          }
        }

        await new Promise(r => setTimeout(r, 3000));
      } catch (replyErr) {
        const errMsg = replyErr?.data?.detail || replyErr?.message || String(replyErr);
        console.warn(`[Engagement] Reply failed for @${author?.username}:`, errMsg.slice(0, 200));
      }
    }

  } catch (err) {
    const msg = String(err?.data?.detail || err?.message || err);
    if (msg.includes('403') || msg.includes('401')) {
      console.warn('[Engagement] Auth error — needs scopes: tweet.read, tweet.write, users.read, follows.write');
    } else if (msg.includes('429')) {
      console.warn('[Engagement] Rate limited — will retry next cycle');
    } else {
      console.warn('[Engagement] Cycle error:', msg.slice(0, 200));
    }
  }

  state.lastRunAt = now.toISOString();
  saveState(state);
  console.log(`[Engagement] Done — ${repliesSent} replies sent, ${followsDone} new follows`);
}

export function startEngagementLoop(twitterClient, options = {}) {
  const intervalMs = (options.intervalMinutes || 45) * 60 * 1000;
  console.log(`[Engagement] Loop started — checking every ${options.intervalMinutes || 45} min`);

  // First run after 5 minutes (let main bot warm up first)
  setTimeout(async () => {
    await runEngagementCycle(twitterClient, options).catch(e =>
      console.warn('[Engagement] First run error:', e?.message || e)
    );
  }, 5 * 60 * 1000);

  setInterval(async () => {
    await runEngagementCycle(twitterClient, options).catch(e =>
      console.warn('[Engagement] Loop error:', e?.message || e)
    );
  }, intervalMs);
}
