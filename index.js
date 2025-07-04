import * as elizaCore from '@elizaos/core';
import * as twitterPlugin from '@elizaos/plugin-twitter';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Force Twitter environment variables
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
    console.log('🚀 Starting Manual Twitter Client Test...');
    console.log('⏰ Time:', new Date().toISOString());
    
    // Credential check
    console.log('\n🔐 Credentials:');
    console.log('ANTHROPIC_API_KEY:', !!process.env.ANTHROPIC_API_KEY ? '✅' : '❌');
    console.log('TWITTER_USERNAME:', !!process.env.TWITTER_USERNAME ? '✅' : '❌');
    console.log('TWITTER_PASSWORD:', !!process.env.TWITTER_PASSWORD ? '✅' : '❌');
    console.log('TWITTER_EMAIL:', !!process.env.TWITTER_EMAIL ? '✅' : '❌');
    console.log('TWITTER_2FA_SECRET:', !!process.env.TWITTER_2FA_SECRET ? '✅' : '❌');
    
    // Explore ElizaOS structure to find client classes
    console.log('\n🔍 ElizaOS Structure Analysis:');
    console.log('Available ElizaCore exports:', Object.keys(elizaCore).filter(key => key.includes('Client') || key.includes('Twitter')));
    console.log('Available in Clients enum:', elizaCore.Clients ? Object.keys(elizaCore.Clients) : 'No Clients enum');
    
    // Check if there's a direct Twitter client class
    console.log('\n🐦 Twitter Plugin Analysis:');
    console.log('Twitter plugin type:', typeof twitterPlugin);
    console.log('Twitter plugin keys:', Object.keys(twitterPlugin));
    console.log('Default export:', twitterPlugin.default ? typeof twitterPlugin.default : 'none');
    console.log('TwitterPlugin export:', twitterPlugin.twitterPlugin ? typeof twitterPlugin.twitterPlugin : 'none');
    
    // Try to find Twitter client class in different places
    let TwitterClientClass = null;
    
    // Method 1: Look for TwitterClient in ElizaCore
    if (elizaCore.TwitterClient) {
      TwitterClientClass = elizaCore.TwitterClient;
      console.log('✅ Found TwitterClient in elizaCore');
    }
    // Method 2: Look in Clients enum
    else if (elizaCore.Clients && elizaCore.Clients.TWITTER) {
      TwitterClientClass = elizaCore.Clients.TWITTER;
      console.log('✅ Found Twitter in Clients enum');
    }
    // Method 3: Look in twitter plugin
    else if (twitterPlugin.TwitterClient) {
      TwitterClientClass = twitterPlugin.TwitterClient;
      console.log('✅ Found TwitterClient in plugin');
    }
    else {
      console.log('❌ No TwitterClient class found');
    }
    
    // Minimal character
    const character = {
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
      style: { all: ["Professional"], post: ["Concise"] },
      topics: ["Cryptocurrency"],
      adjectives: ["Strategic"]
    };
    
    // Simple database adapter
    class SimpleAdapter extends elizaCore.DatabaseAdapter {
      constructor() {
        super();
        this.data = new Map();
      }
      
      async getMemoryById() { return null; }
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
        console.log('✅ Added participant');
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
    
    console.log('\n🤖 Creating AgentRuntime...');
    
    const config = {
      character: character,
      modelProvider: "anthropic",
      token: process.env.ANTHROPIC_API_KEY,
      databaseAdapter: new SimpleAdapter(),
      plugins: [twitterPlugin.default || twitterPlugin]
    };
    
    const runtime = new elizaCore.AgentRuntime(config);
    console.log('✅ AgentRuntime created');
    
    console.log('\n🔄 Initializing runtime...');
    await runtime.initialize();
    console.log('✅ Runtime initialized');
    
    console.log('\n🔍 Runtime Analysis:');
    console.log('- Runtime has clients:', !!runtime.clients);
    console.log('- Runtime keys:', Object.keys(runtime).filter(key => key.includes('client') || key.includes('Client')));
    
    // Try to manually create Twitter client if runtime doesn't have one
    if (!runtime.clients || !runtime.clients.twitter) {
      console.log('\n🔧 Attempting manual Twitter client creation...');
      
      try {
        if (TwitterClientClass) {
          console.log('🔄 Creating Twitter client manually...');
          
          const twitterConfig = {
            username: process.env.TWITTER_USERNAME,
            password: process.env.TWITTER_PASSWORD,
            email: process.env.TWITTER_EMAIL,
            twoFactorSecret: process.env.TWITTER_2FA_SECRET,
            runtime: runtime
          };
          
          const twitterClient = new TwitterClientClass(twitterConfig);
          console.log('✅ Twitter client created manually');
          
          // Try to attach it to runtime
          if (!runtime.clients) {
            runtime.clients = {};
          }
          runtime.clients.twitter = twitterClient;
          console.log('✅ Twitter client attached to runtime');
          
          // Try to initialize the client
          if (twitterClient.start) {
            await twitterClient.start();
            console.log('✅ Twitter client started');
          }
          
        } else {
          console.log('❌ Cannot create Twitter client - no class found');
        }
      } catch (clientError) {
        console.error('❌ Manual client creation failed:', clientError.message);
      }
    }
    
    // Final status check
    console.log('\n🎯 FINAL STATUS:');
    console.log('═══════════════════════════════════════');
    console.log('🐦 Twitter Status:', runtime.clients?.twitter ? 'ACTIVE ✅' : 'INACTIVE ❌');
    console.log('📱 Account: @reviceva');
    console.log('⏰ Expected posting: 90-180 minutes');
    console.log('═══════════════════════════════════════');
    
    if (runtime.clients?.twitter) {
      console.log('\n🎉 SUCCESS! Twitter client is now active!');
      console.log('- Client type:', typeof runtime.clients.twitter);
      console.log('- Constructor:', runtime.clients.twitter.constructor?.name);
    } else {
      console.log('\n❌ Twitter client still inactive');
      console.log('- This might be a limitation of the current ElizaOS version');
      console.log('- Or the Twitter plugin may need different initialization');
    }
    
    // Monitor with enhanced Twitter status
    let minutes = 0;
    setInterval(() => {
      minutes++;
      const twitterActive = runtime.clients?.twitter ? 'ACTIVE' : 'INACTIVE';
      console.log(`[${new Date().toISOString()}] 🐉 Manual Test: ${minutes}min | Twitter: ${twitterActive}`);
      
      if (minutes % 30 === 0) {
        console.log(`📊 Status Check: ${minutes} minutes running`);
        console.log(`   🐦 Twitter: ${twitterActive}`);
        console.log(`   💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        
        if (runtime.clients?.twitter) {
          console.log(`   🔥 Twitter client active - posting should begin soon!`);
        } else {
          console.log(`   ⚠️  Twitter client still inactive after ${minutes} minutes`);
        }
      }
    }, 60000);
    
  } catch (error) {
    console.error('\n💥 FATAL ERROR:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    
    console.error('\n🔍 Debug Info:');
    console.error('- ElizaCore available:', !!elizaCore);
    console.error('- AgentRuntime available:', !!elizaCore.AgentRuntime);
    console.error('- TwitterPlugin available:', !!twitterPlugin);
    console.error('- Environment vars set:', {
      ANTHROPIC_API_KEY: !!process.env.ANTHROPIC_API_KEY,
      TWITTER_USERNAME: !!process.env.TWITTER_USERNAME
    });
    
    process.exit(1);
  }
}

console.log('🌟 Starting Manual Twitter Client Test...');
main().catch(err => {
  console.error('💥 Main failed:', err.message);
  process.exit(1);
});