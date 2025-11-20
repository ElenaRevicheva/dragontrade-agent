// 🚀 AIDEAZZ CONTENT GENERATOR - Full Strategy Implementation
// Based on Elena's CMO AIPA Content Strategy v1.0
// Implements: Daily themes, 4 content pillars, day-of-week logic

import Groq from 'groq-sdk';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 🎯 ELENA'S COMPLETE BRAND CONTEXT
const BRAND_CONTEXT = `
You are CMO AIPA, Elena Revicheva's AI Marketing Co-Founder for AIdeazz.

About Elena:
- Former Chief Legal Officer & IT Executive in E-Government (7 years) - SUCCESSFUL CAREER
- Strategic career pivot to AI (2025) - NOT a failure, a deliberate transition
- Self-taught AI founder building innovative products
- Built 6 AI products in 7 months for <$15K
- Solo founder using "vibe coding" (AI-assisted development)
- 98% more capital efficient than traditional startups
- Building AI co-founders (meta story!)
- Based in Panama, Innovation Smart District member
- Single mother building in public

CRITICAL: NEVER frame Elena's legal/executive background as "failed" or negative.
She was a successful CLO/Executive who chose to pivot to AI. Frame it as:
✅ "Former CLO turned AI founder"
✅ "Ex-Legal Executive building AI"
✅ "From E-Government to AI innovation"
✅ "Career transition from law to tech"
❌ NEVER: "Failed lawyer", "couldn't make it as", "gave up on"

Products:
- EspaLuz: WhatsApp AI Spanish tutor with emotional intelligence (detects 50+ emotions)
- ALGOM Alpha: Autonomous crypto trading advisor with paper trading
- JobVibe: AI job application system
- VibeAgent: AI development assistant
- TeleVibeAgent: Telegram bot integration
- 6 total live products

Mission:
- Emotionally Intelligent AI Personal Assistants
- Evolving with users On-The-Go
- For 280M+ expats worldwide

Current Status:
- Pre-revenue, ~10 users
- Seeking $100K-500K pre-seed
- Building in public approach

Your voice (Elena's):
- Authentic (share real wins AND struggles)
- Technical but accessible
- Ambitious but humble
- Data-driven (specific numbers, metrics)
- First person ("I built", "My journey")
- Human-first (AI amplifies, doesn't replace)
`;

// 📅 DAILY THEMES (Elena's Content Strategy)
const DAILY_THEMES = {
  1: { // Monday
    day: 'Monday',
    theme: 'Week goals + what I\'m building',
    pillar: 'building_in_public'
  },
  2: { // Tuesday
    day: 'Tuesday',
    theme: 'Technical insights + how I built X',
    pillar: 'ai_human_collaboration'
  },
  3: { // Wednesday
    day: 'Wednesday',
    theme: 'Product updates (EspaLuz/ALGOM demos)',
    pillar: 'emotional_ai'
  },
  4: { // Thursday
    day: 'Thursday',
    theme: 'Founder stories + lessons learned',
    pillar: 'founder_journey'
  },
  5: { // Friday
    day: 'Friday',
    theme: 'Week wins + metrics',
    pillar: 'building_in_public'
  },
  6: { // Saturday
    day: 'Saturday',
    theme: 'Vision/inspiration',
    pillar: 'emotional_ai'
  },
  0: { // Sunday
    day: 'Sunday',
    theme: 'Community engagement',
    pillar: 'founder_journey'
  }
};

// 🎨 4 CONTENT PILLARS (Elena's Strategy)
const CONTENT_PILLARS = {
  building_in_public: {
    name: 'Building in Public',
    topics: [
      'Built WhatsApp Emotionally Intelligent Bilingual AI Tutor using Claude in 2 months',
      'Zero to 10 users: What I learned',
      'Why I chose emotional intelligence as my moat',
      'Daily progress: wins AND struggles (honest)',
      'Code snippets and behind-the-scenes process',
      'Real metrics and traction numbers'
    ]
  },
  ai_human_collaboration: {
    name: 'AI x Human Collaboration',
    topics: [
      'How I use Cursor to code 10x faster',
      'Building AI co-founders with AI (meta!)',
      'Solo founder playbook: AI stack breakdown',
      'Vibe coding philosophy: intuition + AI tools + speed',
      'Capital efficiency: $15K for 6 products (98% cost reduction)',
      'AI as co-founder, not replacement'
    ]
  },
  emotional_ai: {
    name: 'Emotional AI / Product Vision',
    topics: [
      'EspaLuz detects 50+ emotions in Spanish learners',
      'Why WhatsApp? 90%+ penetration in LATAM',
      'Emotionally intelligent AI: The missing piece',
      'AIPAs that evolve with users On-The-Go',
      'Solving for 280M+ expats worldwide',
      'Multi-platform strategy: WhatsApp, Telegram, Web'
    ]
  },
  founder_journey: {
    name: 'Founder Journey',
    topics: [
      'From CLO/E-Government Executive to AI Founder: Strategic career pivot',
      'Self-taught AI engineering: Month-by-month journey',
      'Building AIdeazz from Panama City',
      'Single mother in tech: Real challenges',
      'Innovation Smart District community',
      'Successful legal career → AI innovation: Why I made the leap'
    ]
  }
};

// 💎 CORE MESSAGES (Rotate for consistency)
const CORE_MESSAGES = [
  'Vibe Coding: Built 6 AI products for <$15K',
  'AI Co-Founders: Building AI to scale solo (meta story!)',
  'Emotionally Intelligent AI Personal Assistants: Evolving with users On-The-Go',
  'Founder Journey: Former CLO/Exec → AI Founder (strategic pivot, not failure)'
];

// 📝 GENERATE DRAFT (Groq - Fast & Free)
async function generateDraft(themeId) {
  // Get day-specific theme
  const today = new Date().getDay();
  const dailyTheme = DAILY_THEMES[today];
  const pillar = CONTENT_PILLARS[dailyTheme.pillar];
  
  // Pick random topic from today's pillar
  const topic = pillar.topics[Math.floor(Math.random() * pillar.topics.length)];
  
  // Pick random core message
  const coreMessage = CORE_MESSAGES[Math.floor(Math.random() * CORE_MESSAGES.length)];
  
  const prompt = `
${BRAND_CONTEXT}

Today is ${dailyTheme.day}.
Daily Theme: ${dailyTheme.theme}
Content Pillar: ${pillar.name}
Specific Topic: ${topic}
Core Message to weave in: ${coreMessage}

Write a Twitter/X post following these guidelines:
- MAX 280 characters (STRICT!)
- Hook in first 5 words
- Elena's voice: first person, authentic, vulnerable
- Include specific numbers/examples from Elena's journey
- Share wins AND struggles (be honest)
- Technical but accessible
- End with value or question

CRITICAL FRAMING RULES:
- NEVER use "failed" or negative framing for her legal/executive background
- She was a SUCCESSFUL CLO/Executive who chose to pivot
- Frame as: "Former CLO", "Ex-Legal Executive", "From E-Gov to AI"
- Emphasize strategic choice, not desperation or failure

Examples of Elena's voice:
- "Built EspaLuz's emotional memory in 48hrs using Supabase + GPT-4. Cost? $12. This is vibe coding."
- "Month 3 into AI: Former CLO to founder. Scariest moment was deploying first app with zero users. Now 6 apps live. Momentum builds."
- "EspaLuz detects 50+ emotions in Spanish learners. 'I'm frustrated'→bot adapts difficulty+tone. Emotional intelligence matters."

Generate ONLY the post text, nothing else:
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    max_tokens: 100
  });

  return completion.choices?.[0]?.message?.content || '';
}

// ✨ REFINE DRAFT (Claude - Quality Polish)
async function refineDraft(draft) {
  const prompt = `
You are CMO AIPA refining a Twitter/X post for Elena Revicheva.

ORIGINAL DRAFT:
${draft}

Make it:
1. More engaging (stronger hook in first 5 words)
2. More specific (concrete details from Elena's real journey)
3. More authentic (vulnerable, human, Elena's voice)
4. More actionable (clear takeaway or question)
5. MUST stay under 280 characters!

Keep emojis if they enhance the message, remove if forced.
Return ONLY the improved post, nothing else.
`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 150,
    messages: [{
      role: "user",
      content: prompt
    }]
  });

  const firstContent = message.content?.[0];
  return firstContent && firstContent.type === 'text' ? firstContent.text : draft;
}

// 🎯 MAIN CONTENT GENERATOR (Bot Integration)
export async function generateAIdeazzContent(themeId) {
  try {
    // Get today's theme for context
    const today = new Date().getDay();
    const dailyTheme = DAILY_THEMES[today];
    
    console.log(`🎨 CMO AIPA: ${dailyTheme.day} - ${dailyTheme.theme}`);
    console.log(`📚 Pillar: ${dailyTheme.pillar}`);

    // Generate draft with Groq (fast, free)
    const draft = await generateDraft(themeId);
    console.log(`📝 Draft generated (${draft.length} chars)`);

    // Refine with Claude (quality)
    const final = await refineDraft(draft);
    console.log(`✨ Final content ready (${final.length} chars)`);

    return {
      type: 'aideazz_marketing',
      content: final,
      theme: dailyTheme.pillar,
      day: dailyTheme.day,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ CMO AIPA error:', error.message);
    
    // FALLBACK: Real example posts from Elena's strategy
    const fallbackPosts = [
      "Built EspaLuz in 2 months: WhatsApp AI tutor detecting 50+ emotions. 'I'm frustrated'→bot adapts difficulty. Emotional intelligence isn't optional anymore.",
      "CLO→AI founder, month 3: Deployed first app to zero users. Terrifying. Now 6 apps live with real users. Momentum builds when you keep shipping.",
      "Vibe coding = $15K for 6 products. Traditional dev = $500K+. AI tools changed everything for solo founders. 98% more capital efficient.",
      "Building AI co-founders with AI. Meta? Yes. Working? Also yes. Solo doesn't mean alone anymore. 🤖",
      "Panama→Innovation Smart District→AIdeazz. From legal contracts to code. Career pivots aren't easy, but they're possible.",
      "EspaLuz tech stack: TypeScript + React + Claude + WhatsApp API. Why WhatsApp? 90%+ LATAM penetration. Go where users are. 🌍",
      "Self-taught AI engineering in 2025: Month 3. Not easy. Very possible. Building 6 products taught me more than any bootcamp could.",
      "Single mother building AI products from Panama. Not looking for sympathy. Looking for investors who see the vision. Let's build.",
      "How I use Cursor to code 10x faster: AI suggests, I decide, we ship. That's the new founder playbook.",
      "~10 users but 40% retention. Small numbers. Real engagement. That's traction. Building something people need, not just want."
    ];
    
    return {
      type: 'aideazz_marketing',
      content: fallbackPosts[Math.floor(Math.random() * fallbackPosts.length)],
      theme: 'fallback',
      timestamp: new Date().toISOString()
    };
  }
}

// 🧪 TEST FUNCTION (for local testing)
async function test() {
  console.log('🧪 Testing AIdeazz Content Generator with Full Strategy...\n');
  
  const today = new Date().getDay();
  const dailyTheme = DAILY_THEMES[today];
  
  console.log(`📅 Today: ${dailyTheme.day}`);
  console.log(`🎯 Theme: ${dailyTheme.theme}`);
  console.log(`📚 Pillar: ${dailyTheme.pillar}\n`);
  
  const themes = ['building_in_public', 'product_demo', 'vibe_coding'];
  
  for (const theme of themes) {
    console.log(`\n--- Testing theme: ${theme} ---`);
    const content = await generateAIdeazzContent(theme);
    console.log(`✅ Generated (${content.content.length} chars): ${content.content}\n`);
  }
}

// Run test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  test();
}
