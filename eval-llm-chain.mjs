/**
 * Provider chain eval for dragontrade / Algom Alpha.
 *
 *     node eval-llm-chain.mjs
 *
 * Fourth in the fleet, same three questions as the others:
 *
 *   1. Can each provider answer at the budget this bot really sends?
 *   2. Is the answer USABLE — here that means it fits in a tweet, has no
 *      markdown, and is not wrapped in quotes. "Non-empty" is not the bar:
 *      a 600-character reply is a failed tweet, and every site here says
 *      "Output ONLY the tweet text".
 *   3. Does the chain survive losing providers?
 *
 * Why (2026-08-16): three sites called Groq with the model id hard-coded to the
 * retired llama-3.3-70b, at 80/100/120 tokens. Groq's replacements need ~200
 * before they write anything, so all three would have returned "" — and each
 * site falls back to static content, so the bots would have stopped producing
 * AI tweets with nothing in the logs to say why.
 *
 * Exit 1 if the chain cannot produce a usable tweet.
 */
import 'dotenv/config';
import { PROFILE_BULK, PROVIDER_KEYS, TWEET_TOKENS, callProvider, complete } from './llm-chain.mjs';

const PROMPT =
  'Write ONE tweet for Elena Revicheva, an AI builder in Panama, about shipping ' +
  'five-provider LLM failover so no vendor outage can stop her agents. ' +
  'Under 240 characters. Output ONLY the tweet text — no quotes, no markdown, no hashtags.';

const TWEET_LIMIT = 280;

/** Reasons this output would NOT post cleanly. Empty array == fits. */
function fitness(text) {
  const t = text.trim();
  const problems = [];
  if (t.length < 20) problems.push(`too short (${t.length} chars)`);
  if (t.length > TWEET_LIMIT) problems.push(`too long for X (${t.length} > ${TWEET_LIMIT})`);
  if (/\*\*|^#{1,6}\s|\n#{1,6}\s/.test(t)) problems.push('contains markdown');
  if (/^["'“].*["'”]$/s.test(t)) problems.push('wrapped in quotes (prompt said no quotes)');
  return problems;
}

const answered = {};
const unfit = {};

console.log(`=== 1. can each provider answer? (tweet job, ${TWEET_TOKENS} tokens) ===`);
for (const provider of PROFILE_BULK) {
  if (!(process.env[PROVIDER_KEYS[provider]] || '').trim()) {
    console.log(`  ${provider.padEnd(8)} SKIP   no ${PROVIDER_KEYS[provider]}`);
    continue;
  }
  const t0 = Date.now();
  try {
    const text = (await callProvider(provider, null, PROMPT, TWEET_TOKENS)) || '';
    const ms = Date.now() - t0;
    if (!text.trim()) {
      console.log(`  ${provider.padEnd(8)} FAIL   EMPTY at ${TWEET_TOKENS} tokens`);
      continue;
    }
    answered[provider] = text.trim();
    console.log(`  ${provider.padEnd(8)} ok  ${String(ms).padStart(5)}ms  ${JSON.stringify(text.trim().slice(0, 42))}`);
  } catch (e) {
    console.log(`  ${provider.padEnd(8)} FAIL   ${String(e.message).slice(0, 78)}`);
  }
}

console.log('\n=== 2. would it actually POST cleanly? (X limit, no markdown/quotes) ===');
for (const [provider, text] of Object.entries(answered)) {
  const problems = fitness(text);
  if (problems.length) {
    unfit[provider] = problems;
    console.log(`  ${provider.padEnd(8)} UNFIT  ${problems.join('; ')}  [${text.length} chars]`);
  } else {
    console.log(`  ${provider.padEnd(8)} fits   [${text.length} chars]`);
  }
}

console.log('\n=== 3. does the chain survive losing providers? ===');
const broken = PROFILE_BULK.slice(0, 2);
const saved = {};
for (const p of broken) {
  saved[PROVIDER_KEYS[p]] = process.env[PROVIDER_KEYS[p]];
  process.env[PROVIDER_KEYS[p]] = 'broken-on-purpose';
}
let survived = false;
try {
  const { text, errors, provider } = await complete(PROMPT);
  survived = Boolean(text.trim());
  console.log(`  broke ${broken.join(', ')} → ${survived ? `still produced a tweet via ${provider} ✅` : 'chain DIED ❌'}`);
  if (errors.length) console.log(`  skipped: ${errors.join('; ').slice(0, 120)}`);
} finally {
  for (const [k, v] of Object.entries(saved)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
}

console.log('\n=== verdict ===');
if (!survived) {
  console.log('❌ chain produced nothing with two providers down — do not deploy');
  process.exit(1);
}
if (Object.keys(unfit).length) {
  console.log(`⚠️  ${Object.keys(unfit).length} provider(s) answer but would not post cleanly: ${Object.keys(unfit).join(', ')}`);
  console.log('   Keep them LATE in PROFILE_BULK, or trim before posting.');
}
console.log('✅ chain produces a postable tweet and survives losing providers');
process.exit(0);
