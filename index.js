import * as elizaCore from '@elizaos/core';
import * as webSearchPlugin from '@elizaos/plugin-web-search';
import * as coinmarketcapPlugin from '@elizaos/plugin-coinmarketcap';
import * as twitterPlugin from '@elizaos/plugin-twitter';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const characterPath = resolve(__dirname, 'character.json');

async function main() {
  try {
    console.log('🚀 Starting DragonTrade Agent (Twitter Debug Mode)...');
    console.log('⏰ Time:', new Date().toISOString());
    
    // Enhanced Twitter credential check
    console.log('\n🔐 Twitter Credentials Check:');
    const twitterCreds = {
      TWITTER_USERNAME: process.env.TWITTER_USERNAME,
      TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
      TWITTER_EMAIL: process.env.TWITTER_EMAIL,
      TWITTER_2FA_SECRET: process.env.TWITTER_2FA_SECRET
    };
    
    for (const [key, value] of Object.entries(twitterCreds)) {
      console.log(`${key}: ${value ? '✅ SET' : '❌ MISSING'}`);
      if (!value) {
        throw new Error(`Missing Twitter credential: ${key}`);
      }
    }
    
    // Check API keys
    console.log('\n🔑 API Keys Check:');
    const useOpenAI = !process.env.ANTHROPIC_API_KEY && process.env.OPENAI_API_KEY;
    const modelProvider = useOpenAI ? 'openai' : 'anthropic';
    const apiKey = useOpenAI ? process.env.OPENAI_API_KEY : process.env.ANTHROPIC_API_KEY;
    
    console.log(`Model Provider: ${modelProvider.toUpperCase()}`);
    console.log(`API Key: ${apiKey ? 'SET' : 'MISSING'}`);
    
    if (!apiKey) {
      throw new Error('No valid API key found');
    }
    
    // Load character
    console.log('\n📋 Loading character...');
    const originalCharacter = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
    
    // Create character optimized for Twitter posting
    const twitterOptimizedCharacter = {
      name: originalCharacter.name,
      clients: ['twitter'], // Explicitly specify Twitter
      modelProvider: modelProvider,
      plugins: originalCharacter.plugins,
      
      bio: [
        "🐉 DragonTrade - AI Trading Assistant",
        "Expert crypto market analysis and insights", 
        "Powered by advanced AI for Web3 trading",
        "Automated posting every 90-180 minutes"
      ],
      
      knowledge: [], // Keep empty to avoid issues
      
      messageExamples: [
        [
          {
            "user": "{{user1}}",
            "content": {
              "text": "What's the market looking like?"
            }
          },
          {
            "user": "Algom",
            "content": {
              "text": "🔥 Markets are showing interesting movement! Current analysis shows strong momentum in key altcoins. Let me break down the trends for you. | aideazz.xyz"
            }
          }
        ]
      ],
      
      postExamples: originalCharacter.postExamples || [
        "🐉 CRYPTO ALERT: Major market movement detected! Bitcoin showing strength above key support levels. Watch for breakout! 📈 #Bitcoin | aideazz.xyz",
        "⚡️ DeFi UPDATE: Yield farming opportunities heating up across multiple chains. Smart money is accumulating! 🔥 #DeFi | $AZ",
        "📊 MARKET PULSE: Altcoin season indicators flashing green! Time to watch your favorite projects closely. | Powered by $AZ"
      ],
      
      style: {
        all: ["Analytical", "Professional", "Engaging"],
        chat: ["Helpful", "Detailed", "Strategic"],
        post: ["Concise", "Informative", "Exciting"]
      },
      
      topics: [
        "Cryptocurrency trading",
        "Market analysis", 
        "DeFi protocols",
        "Trading strategies",
        "Web3 trends"
      ],
      
      adjectives: [
        "Knowledgeable",
        "Professional",
        "Data-driven", 
        "Strategic",
        "Alpha-hunting"
      ],
      
      // Add Twitter-specific settings
      settings: {
        secrets: {
          TWITTER_USERNAME: process.env.TWITTER_USERNAME,
          TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
          TWITTER_EMAIL: process.env.TWITTER_EMAIL,
          TWITTER_2FA_SECRET: process.env.TWITTER_2FA_SECRET,
          POST_IMMEDIATELY: "true",
          ENABLE_ACTION_PROCESSING: "true",
          MAX_ACTIONS_PROCESSING: "10",
          POST_INTERVAL_MIN: "90",
          POST_INTERVAL_MAX: "180",
          TWITTER_POLL_INTERVAL: "120"
        }
      }
    };
    
    console.log(`✅ Twitter-optimized character created: ${twitterOptimizedCharacter.name}`);
    console.log(`📱 Post examples: ${twitterOptimizedCharacter.postExamples.length}`);
    console.log(`🐦 Twitter settings configured: ${!!twitterOptimizedCharacter.settings.secrets.TWITTER_USERNAME}`);
    
    // Simple database adapter
    class TwitterOptimizedAdapter extends elizaCore.DatabaseAdapter {
      constructor() {
        super();
        this.storage = new Map();
        console.log('🗄️ Twitter-optimized database adapter initialized');
      }
      
      async getMemoryById(id) { return null; }
      async getMemories(params = {}) { return []; }
      async createMemory(memory) { return { ...memory, id: Date.now().toString() }; }
      async removeMemory(id) { return true; }
      async getRelationships(params = {}) { return []; }
      async createRelationship(rel) { return { ...rel, id: Date.now().toString() }; }
      async getGoals(params = {}) { return []; }
      async createGoal(goal) { return { ...goal, id: Date.now().toString() }; }
      async updateGoal(goal) { return goal; }
      async removeGoal(id) { return true; }
      async getRoom(id) { return null; }
      async createRoom(room) { return { ...room, id: Date.now().toString() }; }
      async getParticipantsForAccount(userId) { return []; }
      async getParticipantUserState(roomId, userId) { return null; }
      async setParticipantUserState(roomId, userId, state) { return state; }
      async getCachedEmbeddings(text) { return null; }
      async setCachedEmbeddings(text, embeddings) { return true; }
      async getAccountById(userId) { return null; }
      async createAccount(account) { return account; }
      async searchMemoriesByEmbedding(embedding, params = {}) { return []; }
      async log(params) { 
        console.log('📝 DB Log:', typeof params === 'string' ? params : JSON.stringify(params));
        return true; 
      }
    }
    
    const databaseAdapter = new TwitterOptimizedAdapter();
    console.log('✅ Database adapter created');
    
    // Load Twitter plugin with enhanced debugging
    console.log('\n🐦 Loading Twitter plugin...');
    const plugins = [];
    
    try {
      const twitter = twitterPlugin.default || twitterPlugin;
      if (twitter) {
        plugins.push(twitter);
        console.log('✅ Twitter plugin loaded successfully');
        console.log('🔍 Twitter plugin type:', typeof twitter);
        console.log('🔍 Twitter plugin name:', twitter.name || 'unnamed');
      } else {
        throw new Error('Twitter plugin is null or undefined');
      }
    } catch (err) {
      console.error('❌ Twitter plugin failed to load:', err.message);
      console.error('❌ Available exports:', Object.keys(twitterPlugin));
      throw new Error('Cannot continue without Twitter plugin');
    }
    
    console.log(`✅ Total plugins loaded: ${plugins.length}`);
    
    // Runtime configuration with Twitter focus
    const runtimeConfig = {
      character: twitterOptimizedCharacter,
      modelProvider: modelProvider,
      token: apiKey,
      databaseAdapter: databaseAdapter,
      plugins: plugins
    };
    
    console.log('\n🤖 Creating AgentRuntime...');
    console.log('Config:', {
      characterName: runtimeConfig.character.name,
      modelProvider: runtimeConfig.modelProvider,
      hasToken: !!runtimeConfig.token,
      hasTwitterCreds: !!runtimeConfig.character.settings.secrets.TWITTER_USERNAME,
      pluginCount: runtimeConfig.plugins.length
    });
    
    // Create and initialize runtime
    const runtime = new elizaCore.AgentRuntime(runtimeConfig);
    console.log('✅ AgentRuntime created');
    
    console.log('\n🔄 Initializing runtime...');
    await runtime.initialize();
    console.log('✅ Runtime initialization completed');
    
    // Enhanced Twitter client debugging
    console.log('\n🐦 Twitter Client Status Check:');
    console.log('- Runtime has clients property:', !!runtime.clients);
    console.log('- Clients type:', typeof runtime.clients);
    
    if (runtime.clients) {
      console.log('- Available clients:', Object.keys(runtime.clients));
      console.log('- Twitter client exists:', !!runtime.clients.twitter);
      
      if (runtime.clients.twitter) {
        console.log('✅ Twitter client found!');
        console.log('- Twitter client type:', typeof runtime.clients.twitter);
        console.log('- Twitter client constructor:', runtime.clients.twitter.constructor.name);
        
        // Try to get client methods
        try {
          const methods = Object.getOwnPropertyNames(runtime.clients.twitter);
          console.log('- Available methods:', methods.slice(0, 10));
        } catch (err) {
          console.log('- Could not inspect methods:', err.message);
        }
      } else {
        console.error('❌ Twitter client not found in runtime.clients');
        console.log('- Available clients:', Object.keys(runtime.clients));
      }
    } else {
      console.error('❌ No clients property on runtime');
    }
    
    // Force Twitter client initialization if needed
    if (!runtime.clients?.twitter) {
      console.log('\n🔧 Attempting to force Twitter client initialization...');
      
      try {
        // Try to manually initialize Twitter client
        const TwitterClient = elizaCore.Clients?.TWITTER || elizaCore.TwitterClient;
        if (TwitterClient) {
          console.log('🔄 Found Twitter client class, attempting manual initialization...');
          // This might need adjustment based on ElizaOS API
        }
      } catch (err) {
        console.log('⚠️ Manual Twitter client initialization failed:', err.message);
      }
    }
    
    console.log('\n🎉 DRAGONTRADE AGENT STATUS:');
    console.log('═══════════════════════════════════════════');
    console.log('🤖 AI Model:', modelProvider.toUpperCase());
    console.log('📱 Twitter Account: @reviceva');
    console.log('🏷️ Branding: aideazz.xyz and $AZ');
    console.log('🐦 Twitter Status:', runtime.clients?.twitter ? 'ACTIVE ✅' : 'INACTIVE ❌');
    console.log('⏰ Expected Posting: Every 90-180 minutes');
    console.log('💰 Cost: ~$5-15/month');
    console.log('═══════════════════════════════════════════');
    console.log('⏰ Started at:', new Date().toISOString());
    
    // Enhanced monitoring with Twitter status
    let minutes = 0;
    setInterval(() => {
      minutes++;
      const timestamp = new Date().toISOString();
      
      if (minutes % 15 === 0) {
        console.log(`\n📊 [${timestamp}] DragonTrade Status:`);
        console.log(`   ⏱️  Running: ${minutes} minutes`);
        console.log(`   🤖 Model: ${modelProvider.toUpperCase()}`);
        console.log(`   🐦 Twitter: ${runtime.clients?.twitter ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);
        console.log(`   💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        console.log(`   ⏰ Next post window: ${90 - (minutes % 90)}-${180 - (minutes % 180)} min`);
        
        // Show posting schedule
        if (minutes >= 90 && !runtime.clients?.twitter) {
          console.log(`   ⚠️  Twitter inactive for ${minutes} minutes - posting may be blocked`);
        }
      } else {
        console.log(`[${timestamp}] 🐉 DragonTrade: ${minutes}min | Twitter: ${runtime.clients?.twitter ? 'ACTIVE' : 'INACTIVE'}`);
      }
    }, 60000);
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down DragonTrade Agent...');
      try {
        if (runtime?.stop) await runtime.stop();
        console.log('✅ Shutdown complete');
      } catch (err) {
        console.error('❌ Shutdown error:', err.message);
      }
      process.exit(0);
    });
    
  } catch (error) {
    console.error('\n💥 FATAL ERROR:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    console.error('\n🔍 Debug Info:');
    console.error('- ANTHROPIC_API_KEY:', !!process.env.ANTHROPIC_API_KEY);
    console.error('- TWITTER_USERNAME:', !!process.env.TWITTER_USERNAME);
    console.error('- TWITTER_PASSWORD:', !!process.env.TWITTER_PASSWORD);
    console.error('- TWITTER_EMAIL:', !!process.env.TWITTER_EMAIL);
    console.error('- TWITTER_2FA_SECRET:', !!process.env.TWITTER_2FA_SECRET);
    
    process.exit(1);
  }
}

console.log('🌟 Starting DragonTrade Agent (Twitter Debug Mode)...');
main().catch(err => {
  console.error('💥 Startup failed:', err);
  process.exit(1);
});