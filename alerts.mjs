/**
 * Telegram alerts for dragontrade / Algom Alpha.
 *
 * Why this exists (2026-08-16): X API credits hit zero in late May. The last
 * successful post was 13 June. Between then and today the bots attempted to
 * post 1,552 times — roughly 30 a day for nine weeks — and every one failed
 * with 402 credits-depleted. Nothing told Elena, because this repo had no
 * Telegram integration of any kind. The bots kept running, kept generating
 * content, and threw all of it at a wall.
 *
 * That is the failure mode this module exists to end. It is not about the
 * credits — those get topped up. It is about a nine-week outage being
 * indistinguishable from a quiet week.
 *
 * Two rules, both learned from that outage:
 *
 *   1. ALERT ONCE, THEN GO QUIET. Thirty identical messages a day trains you to
 *      mute the bot, which is worse than no alert at all. Each distinct problem
 *      pages once, then at most once every ALERT_COOLDOWN_H hours until it
 *      clears.
 *   2. SAY WHAT TO DO. "Posting failed" is not actionable at 3am. A 402 says
 *      which page to open and that auto-recharge is the permanent fix.
 *
 * State lives in a small JSON file so the cooldown survives a pm2 restart —
 * otherwise every restart would re-page for a problem you already know about.
 */
import fs from 'fs';
import path from 'path';

const STATE_PATH = path.join(process.cwd(), 'data', 'alert-state.json');
const ALERT_COOLDOWN_H = Number(process.env.ALERT_COOLDOWN_H || 12);

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return {};
  }
}

function writeState(s) {
  try {
    fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
    fs.writeFileSync(STATE_PATH, JSON.stringify(s, null, 2));
  } catch (e) {
    console.warn('[alerts] state write failed:', e.message?.slice(0, 80));
  }
}

/** Turn a raw error into a stable key + a message that says what to DO about it. */
function classify(context, err) {
  const msg = String(err?.message || err || '');
  const blob = `${msg} ${JSON.stringify(err?.data || {})}`;

  if (/402|credits.depleted|Payment Required/i.test(blob)) {
    return {
      key: 'x-credits',
      text:
        `🔴 X API credits are gone — ${context} cannot post\n\n` +
        `Every post will fail until this is topped up.\n\n` +
        `Top up: https://console.x.com/accounts/1910676161845186560/billing/credits\n\n` +
        `⚠️ Turn ON Auto Recharge while you are there. This exact outage ran from ` +
        `13 June to 16 August — 1,552 failed posts — because the balance hit $0 ` +
        `with auto-recharge off and nothing alerted.`,
    };
  }
  if (/\b401\b|Unauthorized|invalid.token/i.test(blob)) {
    return {
      key: 'x-auth',
      text:
        `🔴 X API rejected our credentials — ${context}\n\n${msg.slice(0, 200)}\n\n` +
        `Usually a rotated or expired key: https://developer.x.com/en/portal/dashboard`,
    };
  }
  if (/\b403\b|Forbidden/i.test(blob)) {
    return {
      key: 'x-forbidden',
      text:
        `🟠 X API refused the action (403) — ${context}\n\n${msg.slice(0, 200)}\n\n` +
        `Often a plan/tier limit rather than a bug.`,
    };
  }
  if (/\b429\b|rate limit/i.test(blob)) {
    return { key: 'x-rate', text: `🟡 X rate limit hit — ${context}. Usually self-clears.` };
  }
  return { key: `other:${context}`, text: `⚠️ ${context} failed\n\n${msg.slice(0, 300)}` };
}

/**
 * Alert Elena that posting failed — at most once per problem per cooldown.
 *
 * Never throws and never blocks the caller: an alerting bug must not take down
 * the bot it is watching.
 */
export async function alertPostingFailure(context, err) {
  try {
    const token = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
    const chat = (process.env.CONCIERGE_TG_CHAT || '').trim();
    if (!token || !chat) return false;

    const { key, text } = classify(context, err);
    const state = readState();
    const last = state[key]?.lastAlertAt ? Date.parse(state[key].lastAlertAt) : 0;
    const sinceH = (Date.now() - last) / 3_600_000;

    state[key] = {
      lastSeenAt: new Date().toISOString(),
      count: (state[key]?.count || 0) + 1,
      lastAlertAt: state[key]?.lastAlertAt,
    };

    if (last && sinceH < ALERT_COOLDOWN_H) {
      writeState(state); // count it, stay quiet
      return false;
    }

    const suffix = state[key].count > 1 ? `\n\n(${state[key].count} occurrences so far)` : '';
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: (text + suffix).slice(0, 4000), disable_web_page_preview: true }),
    });
    if (r.ok) {
      state[key].lastAlertAt = new Date().toISOString();
      console.log(`[alerts] Telegram alert sent for "${key}"`);
    } else {
      console.error(`[alerts] Telegram send failed ${r.status}: ${(await r.text()).slice(0, 120)}`);
    }
    writeState(state);
    return r.ok;
  } catch (e) {
    console.warn('[alerts] non-fatal:', e.message?.slice(0, 100));
    return false;
  }
}

/**
 * Clear a problem once it starts working again, so the next occurrence pages
 * immediately instead of sitting inside a stale cooldown.
 */
export function alertRecovered(key = 'x-credits') {
  try {
    const state = readState();
    if (state[key]) {
      delete state[key];
      writeState(state);
      console.log(`[alerts] "${key}" cleared — posting is working again`);
    }
  } catch {
    /* never let bookkeeping break a successful post */
  }
}
