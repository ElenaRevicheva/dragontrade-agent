import * as elizaCore from '@elizaos/core';
import * as twitterPlugin from '@elizaos/plugin-twitter';
import { TwitterApi } from 'twitter-api-v2';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// 🔍 DEBUG: Comprehensive Environment Variables Check
console.log('🔍 DEBUG: Starting Environment Variables Check...');
console.log('═══════════════════════════════════════');
console.log('TWITTER_API_KEY:', process.env.TWITTER_API_KEY ? `SET (length: ${process.env.TWITTER_API_KEY.length})` : '❌ NOT SET');
console.log('TWITTER_API_SECRET:', process.env.TWITTER_API_SECRET ? `SET (length: ${process.env.TWITTER_API_SECRET.length})` : '❌ NOT SET');
console.log('TWITTER_ACCESS_TOKEN:', process.env.TWITTER_ACCESS_TOKEN ? `SET (length: ${process.env.TWITTER_ACCESS_TOKEN.length})` : '❌ NOT SET');
console.log('TWITTER_ACCESS_TOKEN_SECRET:', process.env.TWITTER_ACCESS_TOKEN_SECRET ? `SET (length: ${process.env.TWITTER_ACCESS_TOKEN_SECRET.length})` : '❌ NOT SET');
console.log('ANTHROPIC_API_KEY:', process.env.ANTHROPIC_API_KEY ? `SET (length: ${process.env.ANTHROPIC_API_KEY.length})` : '❌ NOT SET');

// Check alternative names
console.log('\n🔍 Checking Alternative Variable Names:');
console.log('TWITTER_CONSUMER_KEY:', process.env.TWITTER_CONSUMER_KEY ? `SET (length: ${process.env.TWITTER_CONSUMER_KEY.length})` : '❌ NOT SET');
console.log('TWITTER_CONSUMER_SECRET:', process.env.TWITTER_CONSUMER_SECRET ? `SET (length: ${process.env.TWITTER_CONSUMER_SECRET.length})` : '❌ NOT SET');
console.log('TWITTER_BEARER_TOKEN:', process.env.TWITTER_BEARER_TOKEN ? `SET (length: ${process.env.TWITTER_BEARER_TOKEN.length})` : '❌ NOT SET');
console.log('TWITTER_USERNAME:', process.env.TWITTER_USERNAME ? `SET: ${process.env.TWITTER_USERNAME}` : '❌ NOT SET');

// Show first/last few characters for verification (safe for logs)
if (process.env.TWITTER_API_KEY) {
  const key = process.env.TWITTER_API_KEY;
  console.log(`TWITTER_API_KEY preview: ${key.substring(0, 8)}...${key.substring(key.length - 4)}`);
}
if (process.env.TWITTER_ACCESS_TOKEN) {
  const token = process.env.TWITTER_ACCESS_TOKEN;
  console.log(`TWITTER_ACCESS_TOKEN preview: ${token.substring(0, 8)}...${token.substring(token.length - 4)}`);
}

console.log('═══════════════════════════════════════\n');

// Force all required environment variables
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

// Manual Twitter Client Class with Enhanced Debugging
class ManualTwitterClient {
  constructor() {
    console.log('🐦 Creating Manual Twitter Client...');
    
    // Use primary or fallback credentials
    const apiKey = process.env.TWITTER_API_KEY || process.env.TWITTER_CONSUMER_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET || process.env.TWITTER_CONSUMER_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
    
    console.log('🔑 Using credentials:');
    console.log('- API Key:', apiKey ? '✅ Found' : '❌ Missing');
    console.log('- API Secret:', apiSecret ? '✅ Found' : '❌ Missing');
    console.log('- Access Token:', accessToken ? '✅ Found' : '❌ Missing');
    console.log('- Access Secret:', accessSecret ? '✅ Found' : '❌ Missing');
    
    if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
      console.error('❌ Missing required Twitter credentials!');
      console.error('Required variables: TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET');
      this.isActive = false;
      this.postInterval = null;
      return;
    }
    
    try {
      this.client = new TwitterApi({
        appKey: apiKey,
        appSecret: apiSecret,
        accessToken: accessToken,
        accessSecret: accessSecret,
      });
      this.isActive = false;
      this.postInterval = null;
      console.log('🐦 Manual Twitter client created successfully');
    } catch (error) {
      console.error('❌ Failed to create Twitter client:', error.message);
      this.isActive = false;
      this.postInterval = null;
    }
  }

  async initialize() {
    if (!this.client) {
      console.error('❌ Twitter client not created - missing credentials');
      return false;
    }
    
    try {
      console.log('🔍 Testing Twitter API connection...');
      
      // Test the connection
      const user = await this.client.v2.me();
      console.log('✅ Twitter client connected successfully!');
      console.log('📱 Connected as:', user.data.username);
      console.log('👤 Display name:', user.data.name);
      console.log('🆔 User ID:', user.data.id);
      
      this.isActive = true;
      this.startPosting();
      return true;
    } catch (error) {
      console.error('❌ Twitter client initialization failed!');
      console.error('Error code:', error.code || 'Unknown');
      console.error('Error message:', error.message);
      
      if (error.code === 401) {
        console.error('🔧 401 Error Solutions:');
        console.error('1. Check if API keys are correct in Railway Variables');
        console.error('2. Verify app has "Read and Write" permissions');
        console.error('3. Try regenerating Access Token and Secret');
        console.error('4. Make sure no extra spaces in variable values');
      } else if (error.code === 403) {
        console.error('🔧 403 Error Solutions:');
        console.error('1. App may not have posting permissions');
        console.error('2. Check app permissions in Twitter Developer Portal');
      }
      
      this.isActive = false;
      return false;
    }
  }

  startPosting() {
    const minInterval = parseInt(process.env.POST_INTERVAL_MIN) * 60 * 1000; // 90 minutes
    const maxInterval = parseInt(process.env.POST_INTERVAL_MAX) * 60 * 1000; // 180 minutes
    
    const schedulePost = () => {
      const randomInterval = Math.random() * (maxInterval - minInterval) + minInterval;
      const minutesUntilPost = Math.round(randomInterval / 60000);
      console.log(`📅 Next post scheduled in ${minutesUntilPost} minutes`);
      
      this.postInterval = setTimeout(async () => {
        await this.createPost();
        schedulePost(); // Schedule the next post
      }, randomInterval);
    };

    // Start the posting cycle
    schedulePost();
  }

  async createPost() {
    try {
      const posts = [
        "🚀 DeFi markets heating up! $AZ holders get first access to alpha signals at aideazz.xyz 📊",
        "⚡ Smart money is accumulating while retail sleeps. Are you positioned for the next leg up? 💎",
        "🔥 Layer 2 tokens showing strength. Time to dig deeper into the fundamentals 🧠 #DeFi",
        "📈 When others are fearful, be greedy. When others are greedy, be strategic 🎯 $AZ",
        "🌟 Building in bear markets creates bull market legends. What are you building? 💪",
        "⚠️ Risk management > profit maximization. Protect your capital first 🛡️",
        "🎯 Alpha isn't about being first, it's about being right. Quality > speed 💯",
        "🔍 On-chain data tells the real story. Learn to read between the lines 📊 aideazz.xyz",
        "💡 The best opportunities come disguised as problems. What problem are you solving? 🔥",
        "🎪 Market volatility = opportunity for those who stay disciplined 📈 $AZ alpha at aideazz.xyz"
      ];

      const randomPost = posts[Math.floor(Math.random() * posts.length)];
      
      console.log('🐦 Attempting to post to Twitter...');
      console.log('📝 Content:', randomPost.substring(0, 50) + '...');
      
      const tweet = await this.client.v2.tweet(randomPost);
      
      console.log('✅ Tweet posted successfully!');
      console.log('🔗 Tweet ID:', tweet.data.id);
      console.log('📊 Tweet text length:', randomPost.length);
      
      return tweet;
    } catch (error) {
      console.error('❌ Failed to post tweet!');
      console.error('Error code:', error.code || 'Unknown');
      console.error('Error message:', error.message);
      return null;
    }
  }

  getStatus() {
    return this.isActive ? 'ACTIVE' : 'INACTIVE';
  }

  stop() {
    if (this.postInterval) {
      clearTimeout(this.postInterval);
      this.postInterval = null;
    }
    this.isActive = false;
    console.log('🔴 Twitter posting stopped');
  }
}

async function main() {
  try {
    console.log('🚀 Starting DragonTrade Agent...');
    console.log('⏰ Time:', new Date().toISOString());
    console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
    console.log('📂 Working Directory:', process.cwd());
    
    console.log('\n📋 Loading character with empty knowledge...');
    const characterPath = resolve(__dirname, 'character.json');
    const originalCharacter = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
    
    // Create character with EMPTY knowledge to avoid embedding issues
    const fixedCharacter = {
      ...originalCharacter,
      clients: ["twitter"],
      modelProvider: "anthropic",
      knowledge: [], // EMPTY to avoid embedding processing
      
      settings: {
        secrets: {
          TWITTER_API_KEY: process.env.TWITTER_API_KEY,
          TWITTER_API_SECRET: process.env.TWITTER_API_SECRET,
          TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
          TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET,
          POST_IMMEDIATELY: "true",
          ENABLE_ACTION_PROCESSING: "true",
          MAX_ACTIONS_PROCESSING: "10",
          POST_INTERVAL_MAX: "180",
          POST_INTERVAL_MIN: "90",
          TWITTER_SPACES_ENABLE: "false",
          ACTION_TIMELINE_TYPE: "foryou",
          TWITTER_POLL_INTERVAL: "120"
        },
        voice: {
          model: "en_US-neural-medium"
        }
      }
    };
    
    console.log('✅ Character configured with empty knowledge');
    console.log('- Knowledge items:', fixedCharacter.knowledge.length);
    
    // Fixed database adapter with safe embedding methods
    class SafeAdapter extends elizaCore.DatabaseAdapter {
      constructor() {
        super();
        this.data = new Map();
        console.log('🗄️ Safe database adapter initialized');
      }
      
      // Memory methods
      async getMemoryById(id) { return this.data.get(`memory_${id}`) || null; }
      async getMemories(params = {}) { 
        const memories = Array.from(this.data.values()).filter(item => item.type === 'memory');
        if (params.roomId) return memories.filter(m => m.roomId === params.roomId);
        if (params.count) return memories.slice(0, params.count);
        return memories;
      }
      async createMemory(memory) { 
        const id = memory.id || Date.now().toString();
        const mem = { ...memory, id, type: 'memory', createdAt: Date.now() };
        this.data.set(`memory_${id}`, mem);
        return mem;
      }
      async removeMemory(id) { return this.data.delete(`memory_${id}`); }
      async updateMemory(memory) {
        if (this.data.has(`memory_${memory.id}`)) {
          this.data.set(`memory_${memory.id}`, { ...memory, type: 'memory' });
          return memory;
        }
        return null;
      }
      
      async getRelationships(params = {}) { return []; }
      async createRelationship(rel) { 
        const id = rel.id || Date.now().toString();
        return { ...rel, id, type: 'relationship' };
      }
      async getRelationship(params) { return null; }
      
      async getGoals(params = {}) { return []; }
      async createGoal(goal) { 
        const id = goal.id || Date.now().toString();
        return { ...goal, id, type: 'goal', status: 'IN_PROGRESS' };
      }
      async updateGoal(goal) { return goal; }
      async removeGoal(id) { return true; }
      
      async getRoom(id) { return this.data.get(`room_${id}`) || null; }
      async createRoom(room) { 
        const id = room.id || Date.now().toString();
        const r = { ...room, id, type: 'room' };
        this.data.set(`room_${id}`, r);
        return r;
      }
      async removeRoom(id) { return this.data.delete(`room_${id}`); }
      
      async getParticipantsForAccount(userId) { return []; }
      async getParticipantsForRoom(roomId) { return []; }
      async getParticipantUserState(roomId, userId) { return null; }
      async setParticipantUserState(roomId, userId, state) { 
        const participantState = { 
          roomId, userId, ...state, type: 'participant', updatedAt: Date.now()
        };
        this.data.set(`participant_${roomId}_${userId}`, participantState);
        return participantState;
      }
      async addParticipant(userId, roomId) {
        const participant = {
          userId, roomId, id: `${userId}_${roomId}`, type: 'participant', joinedAt: Date.now()
        };
        this.data.set(`participant_${roomId}_${userId}`, participant);
        console.log('✅ Added participant:', userId, 'to room:', roomId);
        return participant;
      }
      async removeParticipant(userId, roomId) { return true; }
      
      async getAccountById(userId) { return null; }
      async createAccount(account) { 
        const id = account.id || account.userId || Date.now().toString();
        return { ...account, id, type: 'account' }; 
      }
      async updateAccount(account) { return account; }
      
      // ⭐ FIXED: Safe embedding methods that handle any input type
      async getCachedEmbeddings(text) { 
        // Always return null to skip caching and avoid crashes
        return null;
      }
      
      async setCachedEmbeddings(text, embeddings) { 
        // Always return true to indicate success but don't actually cache
        return true; 
      }
      
      async searchMemoriesByEmbedding(embedding, params = {}) { return []; }
      async log(params) { 
        console.log('📝 DB Log:', typeof params === 'string' ? params : JSON.stringify(params));
        return true; 
      }
      async getActorDetails(params) { return null; }
      async searchMemories(params) { return []; }
      async countMemories(roomId, unique = true) { return 0; }
      async removeAllMemories(roomId) { return true; }
    }
    
    console.log('\n🔌 Loading Twitter plugin...');
    const plugins = [twitterPlugin.default || twitterPlugin];
    
    console.log('✅ Plugin loaded');
    
    // Create manual Twitter client
    console.log('\n🐦 Creating manual Twitter client...');
    const manualTwitter = new ManualTwitterClient();
    
    const runtimeConfig = {
      character: fixedCharacter,
      modelProvider: "anthropic",
      token: process.env.ANTHROPIC_API_KEY,
      databaseAdapter: new SafeAdapter(),
      plugins: plugins
    };
    
    console.log('\n🤖 Creating AgentRuntime...');
    console.log('Config:', {
      hasCharacter: !!runtimeConfig.character,
      characterName: runtimeConfig.character.name,
      knowledgeCount: runtimeConfig.character.knowledge.length,
      hasTwitterSettings: !!runtimeConfig.character.settings?.secrets?.TWITTER_API_KEY,
      modelProvider: runtimeConfig.modelProvider,
      hasToken: !!runtimeConfig.token,
      pluginCount: runtimeConfig.plugins.length,
      hasManualTwitter: !!manualTwitter
    });
    
    const runtime = new elizaCore.AgentRuntime(runtimeConfig);
    console.log('✅ AgentRuntime created');
    
    console.log('\n🔄 Initializing runtime (safe mode)...');
    try {
      await runtime.initialize();
      console.log('✅ Runtime initialization completed successfully!');
    } catch (initError) {
      console.error('❌ Initialization failed:', initError.message);
      console.error('Stack:', initError.stack);
      throw initError;
    }
    
    // Initialize manual Twitter client
    console.log('\n🐦 Initializing manual Twitter client...');
    const twitterSuccess = await manualTwitter.initialize();
    
    console.log('\n🔍 Twitter Client Check:');
    console.log('- Runtime has clients:', !!runtime.clients);
    console.log('- Clients type:', typeof runtime.clients);
    console.log('- Manual Twitter active:', manualTwitter.isActive);
    
    if (runtime.clients) {
      console.log('- Available clients:', Object.keys(runtime.clients));
      if (runtime.clients.twitter) {
        console.log('🎉 ELIZAOS TWITTER CLIENT IS ACTIVE!');
        console.log('- Type:', typeof runtime.clients.twitter);
        console.log('- Constructor:', runtime.clients.twitter.constructor?.name);
      }
    }
    
    console.log('\n🎯 FINAL STATUS:');
    console.log('═══════════════════════════════════════');
    console.log('🐦 ElizaOS Twitter:', runtime.clients?.twitter ? 'ACTIVE ✅' : 'INACTIVE ❌');
    console.log('🐦 Manual Twitter:', manualTwitter.getStatus(), manualTwitter.isActive ? '✅' : '❌');
    console.log('📱 Account: @reviceva');
    console.log('🏷️ Branding: aideazz.xyz and $AZ');
    console.log('⏰ Posting: Every 90-180 minutes');
    console.log('🧠 Knowledge: Disabled (to avoid embedding crashes)');
    console.log('═══════════════════════════════════════');
    
    if (manualTwitter.isActive) {
      console.log('\n🎉 SUCCESS! Your DragonTrade agent is LIVE with manual Twitter!');
      console.log('🐦 Twitter client is active and will start posting within 90-180 minutes!');
    } else if (runtime.clients?.twitter) {
      console.log('\n🎉 SUCCESS! Your DragonTrade agent is LIVE with ElizaOS Twitter!');
      console.log('Twitter client is active and will start posting within 90-180 minutes!');
    } else {
      console.log('\n⚠️ Twitter client not active, but agent is running');
      console.log('🔧 Check the debug output above for missing environment variables');
    }
    
    // Monitor for activity
    let minutes = 0;
    setInterval(() => {
      minutes++;
      const elizaTwitterStatus = runtime.clients?.twitter ? 'ACTIVE' : 'INACTIVE';
      const manualTwitterStatus = manualTwitter.getStatus();
      const overallStatus = (elizaTwitterStatus === 'ACTIVE' || manualTwitterStatus === 'ACTIVE') ? 'ACTIVE' : 'INACTIVE';
      
      console.log(`[${new Date().toISOString()}] 🐉 DragonTrade: ${minutes}min | Twitter: ${overallStatus}`);
      
      if (minutes % 30 === 0) {
        console.log(`\n📊 Status Update: ${minutes} minutes running`);
        console.log(`   🐦 ElizaOS Twitter: ${elizaTwitterStatus}`);
        console.log(`   🐦 Manual Twitter: ${manualTwitterStatus}`);
        console.log(`   💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        console.log(`   🗄️  DB entries: ${runtime.databaseAdapter?.data?.size || 0}`);
        
        if (minutes >= 90) {
          console.log(`   ⏰ In posting window! Agent has been running ${minutes} minutes`);
        } else {
          console.log(`   ⏰ Posting window opens in ${90 - minutes} minutes`);
        }
      }
    }, 60000);
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🔴 Shutting down gracefully...');
      manualTwitter.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('\n💥 FATAL ERROR:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('\nEnvironment check:');
    console.error('- ANTHROPIC_API_KEY:', !!process.env.ANTHROPIC_API_KEY);
    console.error('- TWITTER_API_KEY:', !!process.env.TWITTER_API_KEY);
    console.error('- TWITTER_API_SECRET:', !!process.env.TWITTER_API_SECRET);
    console.error('- TWITTER_ACCESS_TOKEN:', !!process.env.TWITTER_ACCESS_TOKEN);
    console.error('- TWITTER_ACCESS_TOKEN_SECRET:', !!process.env.TWITTER_ACCESS_TOKEN_SECRET);
    process.exit(1);
  }
}

console.log('🌟 Starting DragonTrade Agent with Full Debugging...');
main().catch(err => {
  console.error('💥 Main failed:', err.message);
  process.exit(1);
});