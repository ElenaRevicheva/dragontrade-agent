// 🚀 AIDEAZZ CONTENT GENERATOR
// Integrates AIdeazz marketing content into ALGOM Alpha
// Created: 2025-11-18
// Updated for 20-post cycle with 30% distribution

import Groq from 'groq-sdk';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 🎯 AIDEAZZ BRAND CONTEXT
const AIDEAZZ_CONTEXT = `
Elena Revicheva's AIdeazz - Where Human Intuition Meets AI Potential

FOUNDER: Elena Revicheva
- Solo founder, CEO & CTO
- "Vibe coding" philosophy - fast, intuitive, capital-efficient development
- Built 6 apps for <$15K (98% cost reduction vs traditional dev)
- No co-founders by choice - building AI co-founders instead
- Open about mental health, ADHD, autism - radical authenticity

PRODUCTS:
- EspaLuz: AI companion with emotional intelligence (15K+ messages, real user retention)
- ALGOM Alpha: Paper trading bot with educational mission
- JobVibe: AI job application system
- VibeAgent: AI development assistant
- TeleVibeAgent: Telegram bot integration

MISSION: Capital-efficient development meets emotional intelligence in AI

TRACTION:
- 6 functional products
- Real users with genuine engagement
- Built everything for <$15K total
- Growing community of believers

FUNDING JOURNEY:
- Bootstrapped, seeking pre-seed
- Transparent about challenges and wins
- Building in public approach

VOICE:
- Authentic, vulnerable, inspiring
- Technical but accessible
- Story-driven, human-first
- No corporate BS, real founder journey
`;

// 🎨 CONTENT THEMES (6 variations for 20-post cycle)
const CONTENT_THEMES = [
  {
    id: 'building_in_public',
    focus: 'Real-time development updates, wins, and lessons',
    examples: ['Just shipped X feature', 'Here\'s what broke today', 'Hit milestone Y']
  },
  {
    id: 'founder_journey',
    focus: 'Elena\'s personal story, challenges, growth',
    examples: ['Why I chose solo', 'Dealing with burnout', 'The loneliness of founding']
  },
  {
    id: 'product_demo',
    focus: 'Show EspaLuz, ALGOM, or other products in action',
    examples: ['Watch EspaLuz respond', 'ALGOM just learned X', 'User feedback on Y']
  },
  {
    id: 'vibe_coding',
    focus: 'Fast development philosophy, AI-assisted coding',
    examples: ['How I built X in 2 days', 'AI tools that work', 'Capital efficiency secrets']
  },
  {
    id: 'metrics_update',
    focus: 'Real numbers, traction, growth (or lack thereof)',
    examples: ['15K messages on EspaLuz', 'Cost breakdown', 'User retention stats']
  },
  {
    id: 'behind_scenes',
    focus: 'Raw founder life, decision-making, daily reality',
    examples: ['My tech stack', 'Why I chose X over Y', '3am debugging sessions']
  }
];

// 🎲 Get specific theme by ID
function getTheme(themeId) {
  return CONTENT_THEMES.find(t => t.id === themeId) || CONTENT_THEMES[0];
}

// 📝 GENERATE DRAFT (Groq - Fast & Free)
async function generateDraft(theme) {
  const prompt = `
You are Elena Revicheva's CMO AI, crafting an authentic X (Twitter) post about AIdeazz.

CONTEXT:
${AIDEAZZ_CONTEXT}

THEME: ${theme.focus}

GUIDELINES:
- Max 280 characters (X limit)
- Authentic Elena voice (vulnerable, technical, inspiring)
- Include specific details (numbers, product names, real experiences)
- Use emojis strategically (1-3 max)
- NO generic startup BS
- Make it human and relatable
- Can include a call to action if natural

EXAMPLES OF THE VIBE:
- "Built EspaLuz's emotional memory in 48hrs using Supabase + GPT-4. Cost? $12. This is vibe coding. 🚀"
- "15,347 messages later, EspaLuz users keep coming back. Not for AI features. For how it makes them FEEL. 💙"
- "Pitched 3 investors today. All asked 'where's your co-founder?' Building AI ones instead. Stay tuned. 🤖"

Generate ONE post about: ${theme.focus}
`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    max_tokens: 150
  });

  return completion.choices?.[0]?.message?.content || '';
}

// ✨ REFINE DRAFT (Claude - Quality Polish)
async function refineDraft(draft) {
  const prompt = `
You are refining a Twitter/X post for Elena Revicheva's AIdeazz.

ORIGINAL DRAFT:
${draft}

Make it:
1. More authentic and vulnerable (Elena's voice)
2. Punchy and tweet-ready (280 char max)
3. Specific with details (replace vague with concrete)
4. Emotional resonance without being cheesy

Keep emojis if they work, remove if forced.
Return ONLY the refined tweet, no explanation.
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

// 🎯 MAIN CONTENT GENERATOR
export async function generateAIdeazzContent(themeId) {
  try {
    // Get specific theme
    const theme = getTheme(themeId);

    console.log(`🎨 Generating AIdeazz content: ${theme.id}`);

    // Generate draft with Groq (fast)
    const draft = await generateDraft(theme);
    console.log(`📝 Draft: ${draft}`);

    // Refine with Claude (quality)
    const refined = await refineDraft(draft);
    console.log(`✨ Refined: ${refined}`);

    return {
      type: 'aideazz_marketing',
      content: refined,
      theme: theme.id,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Error generating AIdeazz content:', error.message);
    
    // FALLBACK: Return a safe default post if APIs fail
    const fallbackPosts = [
      "Building 6 products for <$15K taught me: capital efficiency isn't a constraint, it's a superpower. 🚀",
      "EspaLuz hit 15K messages. Not because of fancy AI. Because it actually listens. 💙",
      "Solo founder doesn't mean alone. Building AI co-founders that actually understand the vision. 🤖",
      "Vibe coding = intuition + AI tools + speed. Traditional dev = overthinking. I choose speed. ⚡",
      "Every investor asks: 'Where's your technical co-founder?' I am the technical co-founder. 💪",
      "6 apps. $15K total. 98% cost reduction. This is what AI-powered development looks like. 🎯"
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
  console.log('🧪 Testing AIdeazz Content Generator...\n');
  
  const themes = ['building_in_public', 'product_demo', 'vibe_coding'];
  
  for (const theme of themes) {
    console.log(`\n--- Testing theme: ${theme} ---`);
    const content = await generateAIdeazzContent(theme);
    console.log(`✅ Generated: ${content.content}\n`);
  }
}

// Run test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  test();
}
