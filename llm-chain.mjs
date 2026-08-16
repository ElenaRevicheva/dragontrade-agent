/**
 * Provider fallback chain for dragontrade / Algom Alpha.
 *
 * Fourth in the fleet, after VibeJobHunter (evals/test_provider_chain.py),
 * cto-aipa (scripts/eval-llm-chain.cjs) and EspaLuz Influencer (llm_chain.py).
 * Same rules, adapted to this repo: ESM, and the output is TWEETS.
 *
 * Why (2026-08-16): three sites here called Groq directly with the model id
 * hard-coded to llama-3.3-70b-versatile, which Groq retired that day. Worse,
 * their budgets are tiny by design — 80, 100 and 120 tokens, because a tweet is
 * short. Groq's replacements are REASONING models with a measured floor of ~200
 * tokens before they emit anything, so every one of those calls would have
 * returned "" and the bots would have quietly stopped tweeting: each site
 * degrades to static content on failure, so nothing would have alerted.
 *
 * TWEET_TOKENS is the fix for that: a ceiling, not a target. Asking for 300
 * costs nothing when the model stops after 40 words, and it is the price of
 * admission for a model that thinks first.
 *
 * Order is the BULK profile — scheduled social content, nobody waiting:
 *
 *     gemini -> groq -> openai -> grok -> claude
 *
 * Claude last: it writes the best copy but this account posts constantly, and
 * reaching Claude means four providers are already down.
 */

const MIN_TOKENS = 300;

/**
 * Tweets are short; deciding WHAT to tweet is not.
 *
 * Measured 2026-08-16 against openai/gpt-oss-120b on this repo's real tweet
 * prompt (persona + topic + a 240-character limit):
 *
 *     300 tokens  -> EMPTY
 *     500 tokens  -> 31 chars, truncated mid-sentence
 *     800 tokens  -> 145 chars, a complete tweet
 *    1200 tokens  -> 152 chars, no better
 *
 * So the floor is NOT a fixed number for the fleet. Classification needed
 * ~200-300; creative writing under constraints needs ~800, because a reasoning
 * model's private thinking scales with how hard the DECISION is, not with how
 * long the answer is. Sizing this from the classification figure would have
 * looked generous and still returned nothing.
 *
 * Costs nothing on the other four providers — max_tokens is a ceiling and they
 * all stop after ~150 characters.
 */
export const TWEET_TOKENS = 800;

export const PROFILE_BULK = ['gemini', 'groq', 'openai', 'grok', 'claude'];

export const PROVIDER_KEYS = {
  gemini: 'GEMINI_API_KEY',
  groq: 'GROQ_API_KEY',
  openai: 'OPENAI_API_KEY',
  grok: 'XAI_API_KEY',
  claude: 'ANTHROPIC_API_KEY',
};

const URLS = {
  groq: 'https://api.groq.com/openai/v1/chat/completions',
  openai: 'https://api.openai.com/v1/chat/completions',
  grok: 'https://api.x.ai/v1/chat/completions',
  claude: 'https://api.anthropic.com/v1/messages',
};

function modelFor(provider) {
  if (provider === 'groq') {
    // THE one Groq switch — same GROQ_MODEL env var as the rest of the fleet.
    return (process.env.GROQ_MODEL || '').trim() || 'openai/gpt-oss-120b';
  }
  return {
    // 2.5-flash writes better prose than flash-lite, and this bot only writes prose.
    gemini: (process.env.GEMINI_MODEL || '').trim() || 'gemini-2.5-flash',
    openai: (process.env.OPENAI_CHAIN_MODEL || '').trim() || 'gpt-4o-mini',
    grok: (process.env.XAI_MODEL || '').trim() || 'grok-4.20-0309-non-reasoning',
    claude: (process.env.CLAUDE_CHAIN_MODEL || '').trim() || 'claude-haiku-4-5-20251001',
  }[provider];
}

async function callGemini(key, model, system, prompt, maxTokens) {
  // thinkingBudget:0 stops REASONING models spending the budget thinking — without
  // it gemini-2.5-flash returns a post truncated mid-sentence. But PLAIN models
  // (flash-lite) reject the parameter with 400 INVALID_ARGUMENT, so try, then
  // retry without. Asking the API beats maintaining a list that rots each release.
  const body = (withThinking) => ({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
      ...(withThinking ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
    },
  });
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const send = async (withThinking) => {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body(withThinking)),
    });
    if (!r.ok) {
      const t = await r.text();
      const err = new Error(`gemini ${r.status}: ${t.slice(0, 90)}`);
      err.status = r.status;
      throw err;
    }
    const j = await r.json();
    return j.candidates?.[0]?.content?.parts?.[0]?.text || '';
  };
  try {
    return await send(true);
  } catch (e) {
    if (e.status !== 400) throw e;
    return send(false);
  }
}

async function callAnthropic(key, model, system, prompt, maxTokens) {
  const r = await fetch(URLS.claude, {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!r.ok) throw new Error(`claude ${r.status}: ${(await r.text()).slice(0, 90)}`);
  const j = await r.json();
  return (j.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
}

async function callOpenAiStyle(provider, key, model, system, prompt, maxTokens) {
  const headers = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  // Cloudflare fronts api.groq.com and 403s a default UA.
  if (provider === 'groq') headers['User-Agent'] = 'Mozilla/5.0 (algom)';
  const messages = system
    ? [{ role: 'system', content: system }, { role: 'user', content: prompt }]
    : [{ role: 'user', content: prompt }];
  const r = await fetch(URLS[provider], {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, temperature: 0.7 }),
  });
  if (!r.ok) throw new Error(`${provider} ${r.status}: ${(await r.text()).slice(0, 90)}`);
  const j = await r.json();
  return j.choices?.[0]?.message?.content || '';
}

export async function callProvider(provider, system, prompt, maxTokens) {
  const key = (process.env[PROVIDER_KEYS[provider]] || '').trim();
  if (!key) throw new Error(`no ${PROVIDER_KEYS[provider]}`);
  const model = modelFor(provider);
  if (provider === 'gemini') return callGemini(key, model, system, prompt, maxTokens);
  if (provider === 'claude') return callAnthropic(key, model, system, prompt, maxTokens);
  return callOpenAiStyle(provider, key, model, system, prompt, maxTokens);
}

/**
 * Walk the chain until a provider returns real text.
 *
 * Returns { text, errors }. An EMPTY reply counts as a failure and advances the
 * chain — returning "" verbatim is exactly how a reasoning model turns into a
 * bot that silently stops posting.
 */
export async function complete(prompt, { system = null, maxTokens = TWEET_TOKENS, order = PROFILE_BULK } = {}) {
  const budget = Math.max(Number(maxTokens) || 0, MIN_TOKENS);
  const errors = [];
  for (const provider of order) {
    try {
      const text = (await callProvider(provider, system, prompt, budget)) || '';
      if (text.trim()) return { text: text.trim(), errors, provider };
      errors.push(`${provider}: empty response`);
    } catch (e) {
      errors.push(`${provider}: ${String(e.message).slice(0, 110)}`);
    }
  }
  return { text: '', errors, provider: null };
}
