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
  '#AI #LangGraph #pgvector #BuildInPublic',
  '#AIEngineer #RAG #OpenSource #TechFounder',
  '#LLM #AgentAI #BuildingInPublic #Python',
  '#AIStartup #LangGraph #VectorDB #Panama',
  '#AppliedAI #AIAgents #pgvector #Coding',
];

function pickHashtags(index) {
  return HASHTAG_SETS[index % HASHTAG_SETS.length];
}

/**
 * Format a tech update into a tweet (≤280 chars).
 * Priority: title + punchy hook from description + hashtags + CTA.
 */
function formatTweet(update, hashtagIndex) {
  const title = (update.title || '').trim();
  const desc = (update.description || '').trim();
  const repo = (update.repo || '').replace(/^.*\//, ''); // strip org prefix
  const tags = pickHashtags(hashtagIndex);

  // Build a punchy one-liner from description (first sentence, max 120 chars)
  const firstSentence = desc.split(/[.\n]/)[0]?.trim() || desc;
  const hook = firstSentence.length > 120
    ? firstSentence.slice(0, 117) + '...'
    : firstSentence;

  // Assemble and check length
  const lines = [
    `🚀 ${title}`,
    hook,
    `→ ${repo}`,
    tags,
  ];
  let tweet = lines.join('\n');
  if (tweet.length > 275) {
    // Trim hook further
    const overflow = tweet.length - 275;
    const trimmedHook = hook.slice(0, Math.max(30, hook.length - overflow - 3)) + '...';
    tweet = [`🚀 ${title}`, trimmedHook, `→ ${repo}`, tags].join('\n');
  }
  return tweet.slice(0, 280);
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
    const tweet = formatTweet(update, postCount);

    console.log(`[X-Tech] Posting tech milestone: ${update.title}`);
    console.log(`[X-Tech] Tweet (${tweet.length} chars):\n${tweet}`);

    await twitterClient.v2.tweet({ text: tweet });

    // Mark as posted
    await apiPost('/api/x-updates/mark', {
      repo: update.repo,
      timestamp: update.timestamp,
    });

    console.log(`[X-Tech] ✅ Posted and marked: ${update.title}`);
    return true;
  } catch (err) {
    console.error(`[X-Tech] ⚠️ Error posting tech update: ${err.message}`);
    return false; // SAFE FALLBACK — bot continues normally
  }
}

export { checkAndPostTechUpdate, formatTweet };
