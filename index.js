import * as elizaCore from '@elizaos/core';
import * as twitterPlugin from '@elizaos/plugin-twitter';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Force all Twitter environment variables
process.env.ENABLE_ACTION_PROCESSING = 'true';
process.env.POST_IMMEDIATELY = 'true';
process.env.MAX_ACTIONS_PROCESSING = '10';
process.env.POST_INTERVAL_MIN = '90';
process.env.POST_INTERVAL_MAX = '180';
process.env.TWITTER_POLL_INTERVAL = '120';
process.env.ACTION_TIMELINE_TYPE = 'foryou';
process.env.TWITTER_SPACES_ENABLE = 'false';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  try {
    console.log('🚀 Starting MINIMAL Twitter Test Agent...');
    console.log('⏰ Time:', new Date().toISOString());
    
    // Quick credential check
    console.log('\n🔐 Essential Credentials:');
    console.log('ANTHROPIC_API_KEY:', !!process.env.ANTHROPIC_API_KEY ? '✅' : '❌');
    console.log('TWITTER_USERNAME:', !!process.env.TWITTER_USERNAME ? '✅' : '❌');
    console.log('TWITTER_PASSWORD:', !!process.env.TWITTER_PASSWORD ? '✅' : '❌');
    console.log('TWITTER_EMAIL:', !!process.env.TWITTER_EMAIL ? '✅' : '❌');
    console.log('TWITTER_2FA_SECRET:', !!process.env.TWITTER_2FA_SECRET ? '✅' : '❌');
    
    // Ultra-minimal character - just what's needed for Twitter
    const minimalCharacter = {
      name: "Algom",
      clients: ["twitter"],
      modelProvider: "anthropic",
      
      bio: ["🐉 DragonTrade - AI Trading Assistant"],
      knowledge: [],
      
      postExamples: [
        "🐉 CRYPTO ALERT: Market movement detected! 📈 | aideazz.xyz",
        "⚡️ DeFi UPDATE: Opportunities emerging! 🔥 | $AZ", 
        "📊 MARKET PULSE: Trends looking strong! | Powered by $AZ"
      ],
      
      style: {
        all: ["Professional"],
        post: ["Concise"]
      },
      
      topics: ["Cryptocurrency"],
      adjectives: ["Strategic"]
    };
    
    console.log('\n📋 Minimal character created');
    
    // Ultra-simple database adapter - absolute minimum
    class MinimalAdapter extends elizaCore.DatabaseAdapter {
      constructor() {
        super();
        this.data = new Map();
      }
      
      // Only implement the most critical methods
      async getMemoryById(id) { return null; }
      async getMemories() { return []; }
      async createMemory(memory) { return { ...memory, id: Date.now().toString() }; }
      async removeMemory() { return true; }
      async getRelationships() { return []; }
      async createRelationship(rel) { return { ...rel, id: Date.now().toString() }; }
      async getGoals() { return []; }
      async createGoal(goal) { return { ...goal, id: Date.now().toString() }; }
      async updateGoal(goal) { return goal; }
      async removeGoal() { return true; }
      async getRoom() { return null; }
      async createRoom(room) { return { ...room, id: Date.now().toString() }; }
      async getParticipantsForAccount() { return []; }
      async getParticipantUserState() { return null; }
      async setParticipantUserState(roomId, userId, state) { return state; }
      async addParticipant(userId, roomId) { 
        console.log('✅ Added participant (minimal)');
        return { userId, roomId, id: Date.now().toString() }; 
      }
      async removeParticipant() { return true; }
      async getAccountById() { return null; }
      async createAccount(account) { return account; }
      async getCachedEmbeddings() { return null; }
      async setCachedEmbeddings() { return true; }
      async searchMemoriesByEmbedding() { return []; }
      async log(params) { 
        console.log('📝', typeof params === 'string' ? params : JSON.stringify(params));
        return true; 
      }
    }
    
    console.log('\n🗄️ Minimal database adapter ready');
    
    // Load ONLY Twitter plugin
    console.log('\n🐦 Loading Twitter plugin...');
    const twitterPluginInstance = twitterPlugin.default || twitterPlugin;
    
    if (!twitterPluginInstance) {
      throw new Error('Twitter plugin is null or undefined');
    }
    
    console.log('✅ Twitter plugin loaded');
    
    // Minimal runtime config
    const config = {
      character: minimalCharacter,
      modelProvider: "anthropic",
      token: process.env.ANTHROPIC_API_KEY,
      databaseAdapter: new MinimalAdapter(),
      plugins: [twitterPluginInstance]
    };
    
    console.log('\n🤖 Creating minimal AgentRuntime...');
    console.log('Config summary:', {
      hasCharacter: !!config.character,
      hasToken: !!config.token,
      hasDatabase: !!config.databaseAdapter,
      pluginCount: config.plugins.length
    });
    
    try {
      const runtime = new elizaCore.AgentRuntime(config);
      console.log('✅ AgentRuntime created successfully');
      
      console.log('\n🔄 Initializing runtime...');
      await runtime.initialize();
      console.log('✅ Runtime initialization completed');
      
      // Check Twitter client
      console.log('\n🐦 Twitter Client Check:');
      console.log('- Has clients:', !!runtime.clients);
      console.log('- Clients type:', typeof runtime.clients);
      
      if (runtime.clients) {
        console.log('- Available clients:', Object.keys(runtime.clients));
        
        if (runtime.clients.twitter) {
          console.log('\n🎉 SUCCESS! TWITTER CLIENT IS ACTIVE! 🎉');
          console.log('- Twitter client type:', typeof runtime.clients.twitter);
          console.log('- Constructor name:', runtime.clients.twitter.constructor?.name);
        } else {
          console.log('\n❌ Twitter client not found in clients object');
          console.log('- Available clients:', Object.keys(runtime.clients));
        }
      } else {
        console.log('\n❌ No clients object found on runtime');
      }
      
      console.log('\n🎯 FINAL STATUS:');
      console.log('═══════════════════════════════════════');
      console.log('🐦 Twitter Status:', runtime.clients?.twitter ? 'ACTIVE ✅' : 'INACTIVE ❌');
      console.log('📱 Account: @reviceva');
      console.log('⏰ Expected posting: 90-180 minutes');
      console.log('═══════════════════════════════════════');
      
      // Simple monitoring
      let minutes = 0;
      setInterval(() => {
        minutes++;
        const twitterActive = runtime.clients?.twitter ? 'ACTIVE' : 'INACTIVE';
        console.log(`[${new Date().toISOString()}] 🐉 Test Agent: ${minutes}min | Twitter: ${twitterActive}`);
        
        if (minutes % 30 === 0) {
          console.log(`📊 Status: Running ${minutes} minutes | Twitter: ${twitterActive}`);
        }
      }, 60000);
      
    } catch (runtimeError) {
      console.error('\n💥 Runtime creation/initialization failed:');
      console.error('Error:', runtimeError.message);
      console.error('Stack:', runtimeError.stack);
      throw runtimeError;
    }
    
  } catch (error) {
    console.error('\n💥 FATAL ERROR:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    console.error('\n🔍 Environment Debug:');
    console.error('- ANTHROPIC_API_KEY exists:', !!process.env.ANTHROPIC_API_KEY);
    console.error('- TWITTER_USERNAME exists:', !!process.env.TWITTER_USERNAME);
    console.error('- ElizaCore available:', !!elizaCore);
    console.error('- AgentRuntime available:', !!elizaCore.AgentRuntime);
    console.error('- TwitterPlugin available:', !!twitterPlugin);
    
    process.exit(1);
  }
}

console.log('🌟 Starting Minimal Twitter Test...');
main().catch(err => {
  console.error('💥 Main function failed:', err.message);
  process.exit(1);
});