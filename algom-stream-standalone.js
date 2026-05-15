/**
 * algom-stream-standalone.js
 * Standalone process: X filtered stream → auto-like + auto-follow + HubSpot CRM
 * Runs independently of ElizaOS crash loop.
 * PM2: algom-stream
 */

import dotenv from 'dotenv';
dotenv.config();

import { TwitterApi } from 'twitter-api-v2';
import { setupStreamRules, startFilteredStream } from './stream-listener.js';

const TWITTER_API_KEY             = process.env.TWITTER_API_KEY;
const TWITTER_API_SECRET          = process.env.TWITTER_API_SECRET;
const TWITTER_ACCESS_TOKEN        = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_TOKEN_SECRET = process.env.TWITTER_ACCESS_TOKEN_SECRET;

if (!TWITTER_API_KEY || !TWITTER_API_SECRET || !TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_TOKEN_SECRET) {
  console.error('[algom-stream] Missing Twitter credentials — check .env');
  process.exit(1);
}

const userClient = new TwitterApi({
  appKey:            TWITTER_API_KEY,
  appSecret:         TWITTER_API_SECRET,
  accessToken:       TWITTER_ACCESS_TOKEN,
  accessSecret:      TWITTER_ACCESS_TOKEN_SECRET,
});

async function main() {
  console.log('[algom-stream] Starting standalone filtered stream...');

  const stream = await startFilteredStream(userClient, {
    autoLike:          true,
    autoFollow:        true,
    maxActionsPerHour: 20,
  });

  if (!stream) {
    console.error('[algom-stream] Stream failed to start. Check credentials and tier. Exiting.');
    process.exit(1);
  }

  console.log('[algom-stream] Stream active. Monitoring for prospects 24/7.');
  // Keep alive — stream.on(data) is async event-driven
  setInterval(() => {}, 60 * 60 * 1000);
}

process.on('uncaughtException', (err) => {
  console.error('[algom-stream] uncaughtException:', err.message);
  // Don't exit — let PM2 decide. Log and continue.
});
process.on('unhandledRejection', (reason) => {
  const msg = String(reason?.message || reason || '');
  if (msg.includes('Body Timeout') || msg.includes('SseError') || msg.includes('terminated')) {
    console.warn('[algom-stream] MCP SSE timeout (non-fatal)');
    return;
  }
  console.error('[algom-stream] unhandledRejection:', msg.slice(0, 200));
});

main().catch(err => {
  console.error('[algom-stream] Fatal init error:', err.message);
  process.exit(1);
});
