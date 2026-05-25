// grok-content.js
// May 25 2026: Grok wrapper for Algom Alpha educational posts.
// Uses xAI rhino-sneezing-lemon team credits ($5 at time of writing).
// Strategy: only educational/commodity content goes here; high-value brand
// posts (aideazz, client_pitch, monetization) stay on Claude via aideazz-content-generator.
//
// Bonus angle: Grok has X-native real-time access. Prompts ask it to ground
// crypto education in current X conversation, making posts timely (not evergreen).
//
// Fallback: throws on 4xx/5xx so caller can fall back to Claude/CMC engine.

const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const XAI_MODEL   = "grok-4.20-0309-non-reasoning"; // cheap, fast; upgrade to grok-4 later if budget allows

// Track consecutive failures so we can stop calling after credits depleted
let _consecutiveFailures = 0;
const FAILURE_THRESHOLD = 3;

export function isGrokTemporarilyDisabled() {
  return _consecutiveFailures >= FAILURE_THRESHOLD;
}

export function resetGrokFailureCounter() {
  _consecutiveFailures = 0;
}

const EDUCATIONAL_TOPICS = [
  'risk management for new crypto traders',
  'how to read a candlestick chart (the 3 patterns that actually matter)',
  'position sizing — why 1-2% per trade matters',
  'order types: market vs limit vs stop-loss (when to use which)',
  'common scam patterns on crypto Twitter (and how to spot them)',
  'spot vs futures trading: the risk asymmetry beginners miss',
  'why dollar-cost averaging beats timing the market for most people',
  'understanding leverage: the difference between 2x and 10x in liquidation risk',
  'reading order books: what bid/ask depth actually tells you',
  'trading psychology: the three biases that wreck beginner portfolios',
];

function pickRandomTopic() {
  return EDUCATIONAL_TOPICS[Math.floor(Math.random() * EDUCATIONAL_TOPICS.length)];
}

/**
 * Generate an educational crypto post via Grok with X-realtime grounding.
 * Throws on API failure so the caller can fall back to Claude/CMC engine.
 */
export async function generateEducationalWithGrok(opts = {}) {
  if (!process.env.XAI_API_KEY) {
    throw new Error('XAI_API_KEY not set');
  }

  const topic = opts.topic || pickRandomTopic();

  const systemPrompt = `You are Elena Revicheva (@reviceva), an AI builder and crypto educator.
You write SHORT (under 270 chars, fits in one tweet), CLEAR, NON-HYPE crypto education.
You are NOT a financial advisor — you're a builder who teaches what she knows.
Voice: direct, honest, skeptical of get-rich-quick narratives, respectful of beginners.
Never use the words "moon", "lambo", "to the moon", "ape in", "DYOR" (cliche).
You may use 1-2 emojis MAX. Never hashtag spam (max 2 hashtags total).
Prefer concrete examples over abstract principles.
Always close with a single specific actionable tip the reader can use today.`;

  const userPrompt = `Topic: ${topic}

Use your access to the live X conversation to GROUND this post in what crypto people on X are talking about RIGHT NOW. Reference a current concern, debate, or pattern you can see in real-time. Do not name specific accounts or tokens. Generic patterns only.

Write the tweet. Output ONLY the tweet text — no preamble, no quotes, no markdown.`;

  const body = {
    model: XAI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userPrompt },
    ],
    max_tokens: 200,
    temperature: 0.7,
  };

  let response;
  try {
    response = await fetch(XAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    _consecutiveFailures++;
    throw new Error(`Grok network error: ${e.message}`);
  }

  if (!response.ok) {
    _consecutiveFailures++;
    const errText = await response.text().catch(() => '<no body>');
    // Specifically detect credit depletion so caller can permanently fall back
    if (response.status === 402) {
      throw new Error(`Grok credits depleted (402): ${errText.slice(0, 200)}`);
    }
    if (response.status === 429) {
      throw new Error(`Grok rate-limited (429): ${errText.slice(0, 200)}`);
    }
    throw new Error(`Grok HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  if (!text) {
    _consecutiveFailures++;
    throw new Error('Grok returned empty content');
  }

  // success — reset failure counter
  _consecutiveFailures = 0;
  return text;
}
