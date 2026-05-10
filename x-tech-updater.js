/**
 * x-tech-updater.js
 * Dragontrade-agent module: posts Elena's tech milestones to X/@reviceva.
 *
 * HOW IT WORKS:
 *   1. Calls GET /api/x-updates on CMO AIPA (Oracle VM)
 *   2. If a pending milestone is found, formats it as a ≤280-char tweet
 *   3. Posts via the twitterClient passed in
 *   4. Calls POST /api/x-updates/mark to record it as done
 *
 * SAFE: If CMO AIPA is unreachable or returns no data, returns false
 * and the bot falls back to its normal content rotation.
 *
 * SETUP (Oracle VM — dragontrade-agent and CMO AIPA are on the SAME machine):
 *   Default: http://127.0.0.1:8080 (no config needed — same VM)
 *   Optional override via env: CMO_API_URL=http://127.0.0.1:8080
 *   Optional auth: X_UPDATES_SECRET=<same value as in VJH .env>
 *
 * Add to /home/ubuntu/dragontrade-agent/.env:
 *   X_UPDATES_SECRET=your_secret_here
 * (CMO_API_URL not needed — defaults to localhost:8080)
 */

import https from 'https';
import http from 'http';

// Same Oracle VM — CMO AIPA runs on port 8080 (vibejobhunter-web systemd service)
const CMO_API_URL = (process.env.CMO_API_URL || 'http://127.0.0.1:8080').replace(/\/$/, '');
const X_UPDATES_SECRET = process.env.X_UPDATES_SECRET || '';

/** Hashtag bank — rotate to avoid repetition */
const HASHTAG_SETS = [
  '#AI #BuildInPublic #AIFounder',
  '#AIAgents #BuildingInPublic #TechFounder',
  '#LLM #AIStartup #BuildInPublic',
  '#AIBuilder #Panama #BuildInPublic',
  '#AppliedAI #AIAgents #TechFounder',
];

function pickHashtags(index) {
  return HASHTAG_SETS[index % HASHTAG_SETS.length];
}

/**
 * Use Claude/Groq to translate a raw commit-style tech update into
 * a human-readable X post. Falls back to plain formatting on failure.
 */
async function generateHumanTweet(update, hashtagIndex) {
  const rawTitle = (update.title || '').trim();
  const rawDesc = (update.description || '').trim();
  const tags = pickHashtags(hashtagIndex);

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
  const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

  const systemPrompt = `You write X (Twitter) posts for Elena Revicheva — AI entrepreneur, builder in Panama.
She builds AI agents (voice, Kanban, job search, crypto coaching) and shares her journey publicly.

Rules for the post:
- Explain the FEATURE in plain language — what it does for the USER, not how it was coded
- Avoid developer jargon: no "NLP-gate", "keyword trigger", "detectTrelloTrigger", "isTask:true", commit prefixes like "feat:", "fix:"
- Write like a founder sharing an exciting product update — conversational, first-person or product-focused
- Max 200 characters for the body (hashtags come separately)
- One emoji max at the start
- No links, no @ mentions`;

  const userPrompt = `Turn this technical change into a plain-language X post (max 200 chars body):

Feature: "${rawTitle}"
Detail: "${rawDesc}"

Return ONLY the post body — no hashtags, no quotes, no explanation.`;

  // Try Claude Haiku first (fast + cheap)
  if (ANTHROPIC_API_KEY) {
    try {
      const resp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 120,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        const body = data?.content?.[0]?.text?.trim() || '';
        if (body.length > 10) {
          const tweet = `${body}\n${tags}`;
          console.log(`[X-Tech] Claude-generated tweet (${tweet.length} chars)`);
          return tweet.slice(0, 280);
        }
      }
    } catch (e) {
      console.warn('[X-Tech] Claude tweet gen failed:', e.message);
    }
  }

  // Groq fallback
  if (GROQ_API_KEY) {
    try {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 120,
          temperature: 0.5,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        const body = data?.choices?.[0]?.message?.content?.trim() || '';
        if (body.length > 10) {
          const tweet = `${body}\n${tags}`;
          console.log(`[X-Tech] Groq-generated tweet (${tweet.length} chars)`);
          return tweet.slice(0, 280);
        }
      }
    } catch (e) {
      console.warn('[X-Tech] Groq tweet gen failed:', e.message);
    }
  }

  // Plain fallback — at least strip commit syntax from the title
  const cleanTitle = rawTitle
    .replace(/^(feat|fix|docs|chore|refactor|ci|test)[:(]\w*\)?:\s*/i, '')
    .replace(/\s*[-–—]\s*[\w\s]+$/, '') // strip long trailing clauses
    .trim();
  const tweet = `🚀 ${cleanTitle}\n${tags}`;
  console.log('[X-Tech] Using plain fallback tweet');
  return tweet.slice(0, 280);
}

/** Keep the sync formatTweet export for tests — now wraps the async generator */
function formatTweet(update, hashtagIndex) {
  // Sync fallback only — callers should use generateHumanTweet
  const title = (update.title || '')
    .replace(/^(feat|fix|docs|chore|refactor|ci|test)[:(]\w*\)?:\s*/i, '')
    .trim();
  const tags = pickHashtags(hashtagIndex);
  return `🚀 ${title}\n${tags}`.slice(0, 280);
}

/** Simple HTTP/HTTPS GET that returns parsed JSON or null */
function apiGet(path) {
  return new Promise((resolve) => {
    const url = `${CMO_API_URL}${path}`;
    const lib = url.startsWith('https') ? https : http;
    const headers = X_UPDATES_SECRET
      ? { Authorization: `Bearer ${X_UPDATES_SECRET}` }
      : {};
    const req = lib.get(url, { headers }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.setTimeout(8000, () => { req.destroy(); resolve(null); });
  });
}

/** Simple HTTP/HTTPS POST with JSON body */
function apiPost(path, data) {
  return new Promise((resolve) => {
    const url = `${CMO_API_URL}${path}`;
    const parsed = new URL(url);
    const bodyStr = JSON.stringify(data);
    const lib = parsed.protocol === 'https:' ? https : http;
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(bodyStr),
      ...(X_UPDATES_SECRET ? { Authorization: `Bearer ${X_UPDATES_SECRET}` } : {}),
    };
    const req = lib.request(
      { hostname: parsed.hostname, port: parsed.port, path: parsed.pathname,
        method: 'POST', headers },
      (res) => { res.resume(); res.on('end', resolve); }
    );
    req.on('error', () => resolve(null));
    req.setTimeout(8000, () => { req.destroy(); resolve(null); });
    req.write(bodyStr);
    req.end();
  });
}

/**
 * Main export: call from dragontrade-agent's content cycle.
 *
 * @param {object} twitterClient  — the already-authenticated Twitter v2 client
 * @param {number} postCount      — current post count (for hashtag rotation)
 * @returns {boolean}             — true if a tech tweet was posted, false otherwise
 *
 * HOW TO WIRE INTO index.js (dragontrade-agent on Oracle VM — ES module):
 *
 *   import { checkAndPostTechUpdate } from './x-tech-updater.js';
 *
 *   // Inside createAuthenticPost(), after the DISABLE_POSTING check:
 *   // Every 5th post, try to post a tech milestone first
 *   if (this.postCount % 5 === 0) {
 *     try {
 *       const posted = await checkAndPostTechUpdate(this.client, this.postCount);
 *       if (posted) return null; // used the slot — skip regular content
 *     } catch (_) { } // safe fallback
 *   }
 */
async function checkAndPostTechUpdate(twitterClient, postCount = 0) {
  try {
    if (!CMO_API_URL) {
      console.log('[X-Tech] CMO_API_URL not set — skipping tech update check');
      return false;
    }

    const result = await apiGet('/api/x-updates?limit=1');
    if (!result || !result.ok || !result.pending || result.pending.length === 0) {
      console.log('[X-Tech] No pending tech updates for X');
      return false;
    }

    const update = result.pending[0];
    const tweet = await generateHumanTweet(update, postCount);

    console.log(`[X-Tech] Posting tech milestone: ${update.title}`);
    console.log(`[X-Tech] Tweet (${tweet.length} chars):\n${tweet}`);

    await twitterClient.v2.tweet({ text: tweet });

    // Mark as posted
    await apiPost('/api/x-updates/mark', {
      repo: update.repo,
      timestamp: update.timestamp || update.received_at || '',
      title: update.title || '',
    });

    console.log(`[X-Tech] ✅ Posted and marked: ${update.title}`);
    return true;
  } catch (err) {
    console.error(`[X-Tech] ⚠️ Error posting tech update: ${err.message}`);
    return false; // SAFE FALLBACK — bot continues normally
  }
}

export { checkAndPostTechUpdate, formatTweet };
