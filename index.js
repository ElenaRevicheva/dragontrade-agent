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
    console.log('🚀 Starting DragonTrade Agent (Minimal Mode)...');
    console.log('⏰ Time:', new Date().toISOString());
    
    // Check essential environment variables
    const requiredEnvVars = {
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      TWITTER_USERNAME: process.env.TWITTER_USERNAME,
      TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
      TWITTER_EMAIL: process.env.TWITTER_EMAIL
    };
    
    console.log('\n🔐 Environment Check:');
    for (const [key, value] of Object.entries(requiredEnvVars)) {
      console.log(`${key}: ${value ? '✅ SET' : '❌ MISSING'}`);
    }
    
    // Determine which API to use
    const useOpenAI = !process.env.ANTHROPIC_API_KEY && process.env.OPENAI_API_KEY;
    const modelProvider = useOpenAI ? 'openai' : 'anthropic';
    const apiKey = useOpenAI ? process.env.OPENAI_API_KEY : process.env.ANTHROPIC_API_KEY;
    
    console.log(`🤖 Model Provider: ${modelProvider.toUpperCase()}`);
    console.log(`🔑 API Key: ${apiKey ? 'SET' : 'MISSING'}`);
    
    if (!apiKey) {
      throw new Error('No valid API key found');
    }
    
    // Load and simplify character to avoid knowledge processing issues
    console.log('\n📋 Loading character...');
    const originalCharacter = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
    
    // Create ultra-minimal character with NO knowledge processing
    const minimalCharacter = {
      name: originalCharacter.name,
      clients: ['twitter'],
      modelProvider: modelProvider,
      plugins: originalCharacter.plugins,
      
      // Minimal bio without complex content
      bio: [
        "🐉 DragonTrade - AI Trading Assistant",
        "Expert crypto market analysis and insights",
        "Powered by advanced AI for Web3 trading"
      ],
      
      // Remove all complex knowledge that causes embedding issues
      knowledge: [],
      
      // Keep essential message examples
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
              "text": "🔥 Markets are showing interesting movement! Let me analyze the current trends and provide you with actionable insights. | aideazz.xyz"
            }
          }
        ]
      ],
      
      // Keep post examples for Twitter posting
      postExamples: originalCharacter.postExamples,
      
      // Essential style and topics
      style: {
        all: ["Analytical", "Professional", "Insightful"],
        chat: ["Helpful", "Detailed", "Strategic"],
        post: ["Concise", "Informative", "Engaging"]
      },
      
      topics: [
        "Cryptocurrency trading",
        "Market analysis",
        "DeFi protocols",
        "Trading strategies"
      ],
      
      adjectives: [
        "Knowledgeable",
        "Professional", 
        "Data-driven",
        "Strategic"
      ]
    };
    
    console.log(`✅ Minimal character created: ${minimalCharacter.name}`);
    console.log(`📝 Bio items: ${minimalCharacter.bio.length}`);
    console.log(`🧠 Knowledge items: ${minimalCharacter.knowledge.length} (intentionally empty)`);
    console.log(`📱 Post examples: ${minimalCharacter.postExamples.length}`);
    
    // Ultra-simple database adapter
    class UltraSimpleAdapter extends elizaCore.DatabaseAdapter {
      constructor() {
        super();
        this.storage = new Map();
        console.log('🗄️ Ultra-simple database adapter initialized');
      }
      
      // Memory methods - minimal implementation
      async getMemoryById(id) { return null; }
      async getMemories(params = {}) { return []; }
      async createMemory(memory) { return { ...memory, id: Date.now().toString() }; }
      async removeMemory(id) { return true; }
      
      // Relationship methods
      async getRelationships(params = {}) { return []; }
      async createRelationship(rel) { return { ...rel, id: Date.now().toString() }; }
      
      // Goal methods
      async getGoals(params = {}) { return []; }
      async createGoal(goal) { return { ...goal, id: Date.now().toString() }; }
      async updateGoal(goal) { return goal; }
      async removeGoal(id) { return true; }
      
      // Room methods
      async getRoom(id) { return null; }
      async createRoom(room) { return { ...room, id: Date.now().toString() }; }
      
      // Participant methods
      async getParticipantsForAccount(userId) { return []; }
      async getParticipantUserState(roomId, userId) { return null; }
      async setParticipantUserState(roomId, userId, state) { return state; }
      
      // Embedding methods - return null to completely skip
      async getCachedEmbeddings(text) { 
        console.log('🚫 Skipping embedding cache (minimal mode)');
        return null; 
      }
      
      async setCachedEmbeddings(text, embeddings) { 
        console.log('🚫 Skipping embedding storage (minimal mode)');
        return true; 
      }
      
      // Account methods
      async getAccountById(userId) { return null; }
      async createAccount(account) { return account; }
      
      // Search methods
      async searchMemoriesByEmbedding(embedding, params = {}) { return []; }
      
      // Logging
      async log(params) { 
        console.log('📝 DB Log:', typeof params === 'string' ? params : JSON.stringify(params));
        return true; 
      }
    }
    
    const databaseAdapter = new UltraSimpleAdapter();
    console.log('✅ Ultra-simple database adapter created');
    
    // Load only essential plugins
    console.log('\n🔌 Loading essential plugins...');
    const plugins = [];
    
    // Twitter plugin (most important)
    try {
      const twitter = twitterPlugin.default || twitterPlugin;
      plugins.push(twitter);
      console.log('✅ Twitter plugin loaded');
    } catch (err) {
      console.log('⚠️ Twitter plugin failed:', err.message);
    }
    
    console.log(`✅ Total plugins: ${plugins.length}`);
    
    // Minimal runtime configuration
    const runtimeConfig = {
      character: minimalCharacter,
      modelProvider: modelProvider,
      token: apiKey,
      databaseAdapter: databaseAdapter,
      plugins: plugins
    };
    
    console.log('\n🤖 Creating minimal AgentRuntime...');
    console.log('Config summary:', {
      characterName: runtimeConfig.character.name,
      modelProvider: runtimeConfig.modelProvider,
      hasToken: !!runtimeConfig.token,
      pluginCount: runtimeConfig.plugins.length,
      knowledgeItems: runtimeConfig.character.knowledge.length
    });
    
    // Create runtime
    const runtime = new elizaCore.AgentRuntime(runtimeConfig);
    console.log('✅ AgentRuntime created successfully');
    
    // Try to initialize with minimal processing
    console.log('\n🔄 Initializing runtime (minimal mode - no knowledge processing)...');
    
    try {
      await runtime.initialize();
      console.log('✅ Runtime initialization completed!');
    } catch (initError) {
      console.error('❌ Initialization failed:', initError.message);
      
      // Try to continue anyway for Twitter posting
      console.log('⚠️ Attempting to continue with partial initialization...');
    }
    
    // Check runtime status
    console.log('\n📊 Runtime Status:');
    console.log('- Character name:', runtime.character?.name);
    console.log('- Model provider:', runtime.modelProvider);
    console.log('- Has database:', !!runtime.databaseAdapter);
    console.log('- Has clients:', !!runtime.clients);
    
    if (runtime.clients) {
      console.log('- Available clients:', Object.keys(runtime.clients));
      if (runtime.clients.twitter) {
        console.log('✅ Twitter client is available!');
      } else {
        console.log('⚠️ Twitter client not found');
      }
    } else {
      console.log('⚠️ No clients available');
    }
    
    console.log('\n🎉 DRAGONTRADE AGENT RUNNING! 🐉');
    console.log('═══════════════════════════════════════════');
    console.log('🤖 AI Model:', modelProvider.toUpperCase());
    console.log('📱 Twitter: @reviceva');
    console.log('🏷️ Branding: aideazz.xyz and $AZ');
    console.log('⏰ Mode: Minimal (Knowledge processing disabled)');
    console.log('💰 Cost: ~$5-15/month');
    console.log('═══════════════════════════════════════════');
    console.log('⏰ Started at:', new Date().toISOString());
    
    // Simple monitoring loop
    let minutes = 0;
    setInterval(() => {
      minutes++;
      const timestamp = new Date().toISOString();
      
      if (minutes % 15 === 0) {
        console.log(`\n📊 [${timestamp}] DragonTrade Status:`);
        console.log(`   ⏱️  Running: ${minutes} minutes`);
        console.log(`   🤖 Model: ${modelProvider.toUpperCase()}`);
        console.log(`   🐦 Twitter: ${runtime.clients?.twitter ? 'ACTIVE' : 'INACTIVE'}`);
        console.log(`   💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        console.log(`   ⏰ Next post: ${90 - (minutes % 90)}-${180 - (minutes % 180)} min`);
      } else {
        console.log(`[${timestamp}] 🐉 DragonTrade: ${minutes}min active`);
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
    
    // Error handling
    process.on('uncaughtException', (err) => {
      console.error('💥 Uncaught exception:', err.message);
      // Don't exit - try to continue
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Unhandled rejection:', reason);
      // Don't exit - try to continue
    });
    
  } catch (error) {
    console.error('\n💥 FATAL ERROR:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    console.error('\n🔍 Debug Info:');
    console.error('- ANTHROPIC_API_KEY:', !!process.env.ANTHROPIC_API_KEY);
    console.error('- OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY);
    console.error('- TWITTER_USERNAME:', !!process.env.TWITTER_USERNAME);
    console.error('- Character file exists:', fs.existsSync(characterPath));
    
    process.exit(1);
  }
}

console.log('🌟 Starting DragonTrade Agent (Minimal Mode - No Knowledge Processing)...');
main().catch(err => {
  console.error('💥 Main function failed:', err);
  process.exit(1);
});