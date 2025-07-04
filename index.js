import * as elizaCore from '@elizaos/core';
import * as webSearchPlugin from '@elizaos/plugin-web-search';
import * as coinmarketcapPlugin from '@elizaos/plugin-coinmarketcap';
import * as twitterPlugin from '@elizaos/plugin-twitter';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// ⭐ FORCE TWITTER ENVIRONMENT VARIABLES
process.env.ENABLE_ACTION_PROCESSING = process.env.ENABLE_ACTION_PROCESSING || 'true';
process.env.POST_IMMEDIATELY = process.env.POST_IMMEDIATELY || 'true';
process.env.MAX_ACTIONS_PROCESSING = process.env.MAX_ACTIONS_PROCESSING || '10';
process.env.POST_INTERVAL_MIN = process.env.POST_INTERVAL_MIN || '90';
process.env.POST_INTERVAL_MAX = process.env.POST_INTERVAL_MAX || '180';
process.env.TWITTER_POLL_INTERVAL = process.env.TWITTER_POLL_INTERVAL || '120';
process.env.ACTION_TIMELINE_TYPE = process.env.ACTION_TIMELINE_TYPE || 'foryou';
process.env.TWITTER_SPACES_ENABLE = process.env.TWITTER_SPACES_ENABLE || 'false';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const characterPath = resolve(__dirname, 'character.json');

async function main() {
  try {
    console.log('🚀 Starting DragonTrade Agent (Force Twitter Mode)...');
    console.log('⏰ Time:', new Date().toISOString());
    
    // Enhanced environment check including Twitter-specific vars
    console.log('\n🔐 All Environment Variables Check:');
    const allEnvVars = {
      // Core credentials
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      TWITTER_USERNAME: process.env.TWITTER_USERNAME,
      TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
      TWITTER_EMAIL: process.env.TWITTER_EMAIL,
      TWITTER_2FA_SECRET: process.env.TWITTER_2FA_SECRET,
      
      // Twitter behavior settings
      ENABLE_ACTION_PROCESSING: process.env.ENABLE_ACTION_PROCESSING,
      POST_IMMEDIATELY: process.env.POST_IMMEDIATELY,
      MAX_ACTIONS_PROCESSING: process.env.MAX_ACTIONS_PROCESSING,
      POST_INTERVAL_MIN: process.env.POST_INTERVAL_MIN,
      POST_INTERVAL_MAX: process.env.POST_INTERVAL_MAX,
      TWITTER_POLL_INTERVAL: process.env.TWITTER_POLL_INTERVAL,
      ACTION_TIMELINE_TYPE: process.env.ACTION_TIMELINE_TYPE,
      TWITTER_SPACES_ENABLE: process.env.TWITTER_SPACES_ENABLE
    };
    
    for (const [key, value] of Object.entries(allEnvVars)) {
      console.log(`${key}: ${value ? '✅ SET' : '❌ MISSING'}`);
    }
    
    // Determine API
    const useOpenAI = !process.env.ANTHROPIC_API_KEY && process.env.OPENAI_API_KEY;
    const modelProvider = useOpenAI ? 'openai' : 'anthropic';
    const apiKey = useOpenAI ? process.env.OPENAI_API_KEY : process.env.ANTHROPIC_API_KEY;
    
    console.log(`\n🤖 Model Provider: ${modelProvider.toUpperCase()}`);
    console.log(`🔑 API Key: ${apiKey ? 'SET' : 'MISSING'}`);
    
    if (!apiKey) {
      throw new Error('No valid API key found');
    }
    
    // Load character
    console.log('\n📋 Loading character...');
    const originalCharacter = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
    
    // Create Twitter-focused character with explicit client configuration
    const twitterCharacter = {
      name: originalCharacter.name,
      clients: ['twitter'], // Explicit Twitter client
      modelProvider: modelProvider,
      plugins: ['@elizaos/plugin-twitter'], // Explicit Twitter plugin
      
      bio: originalCharacter.bio || [
        "🐉 DragonTrade - AI Trading Assistant",
        "Expert crypto market analysis and insights", 
        "Powered by advanced AI for Web3 trading"
      ],
      
      knowledge: [], // Keep empty
      
      messageExamples: originalCharacter.messageExamples || [
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
              "text": "🔥 Markets are showing strong momentum! Let me analyze the current trends and opportunities for you. | aideazz.xyz"
            }
          }
        ]
      ],
      
      postExamples: originalCharacter.postExamples || [
        "🐉 CRYPTO ALERT: Major market movement detected! Bitcoin showing strength above key support levels. Watch for breakout! 📈 #Bitcoin | aideazz.xyz",
        "⚡️ DeFi UPDATE: Yield farming opportunities heating up across multiple chains. Smart money is accumulating! 🔥 #DeFi | $AZ",
        "📊 MARKET PULSE: Altcoin season indicators flashing green! Time to watch your favorite projects closely. | Powered by $AZ"
      ],
      
      style: originalCharacter.style || {
        all: ["Analytical", "Professional", "Engaging"],
        chat: ["Helpful", "Detailed", "Strategic"],
        post: ["Concise", "Informative", "Exciting"]
      },
      
      topics: originalCharacter.topics || [
        "Cryptocurrency trading",
        "Market analysis", 
        "DeFi protocols",
        "Trading strategies"
      ],
      
      adjectives: originalCharacter.adjectives || [
        "Knowledgeable",
        "Professional",
        "Data-driven", 
        "Strategic"
      ],
      
      // ⭐ EXPLICIT Twitter settings in character
      settings: {
        secrets: {
          TWITTER_USERNAME: process.env.TWITTER_USERNAME,
          TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
          TWITTER_EMAIL: process.env.TWITTER_EMAIL,
          TWITTER_2FA_SECRET: process.env.TWITTER_2FA_SECRET,
          POST_IMMEDIATELY: process.env.POST_IMMEDIATELY,
          ENABLE_ACTION_PROCESSING: process.env.ENABLE_ACTION_PROCESSING,
          MAX_ACTIONS_PROCESSING: process.env.MAX_ACTIONS_PROCESSING,
          POST_INTERVAL_MIN: process.env.POST_INTERVAL_MIN,
          POST_INTERVAL_MAX: process.env.POST_INTERVAL_MAX,
          TWITTER_POLL_INTERVAL: process.env.TWITTER_POLL_INTERVAL,
          ACTION_TIMELINE_TYPE: process.env.ACTION_TIMELINE_TYPE,
          TWITTER_SPACES_ENABLE: process.env.TWITTER_SPACES_ENABLE
        }
      }
    };
    
    console.log(`✅ Twitter-focused character created: ${twitterCharacter.name}`);
    console.log(`📱 Post examples: ${twitterCharacter.postExamples.length}`);
    console.log(`🐦 Explicit Twitter client: ${twitterCharacter.clients.includes('twitter')}`);
    
    // Complete database adapter (same as before)
    class CompleteDatabaseAdapter extends elizaCore.DatabaseAdapter {
      constructor() {
        super();
        this.storage = new Map();
        console.log('🗄️ Complete database adapter initialized');
      }
      
      async getMemoryById(id) { return this.storage.get(`memory_${id}`) || null; }
      async getMemories(params = {}) { 
        const memories = Array.from(this.storage.values()).filter(item => item.type === 'memory');
        if (params.roomId) return memories.filter(m => m.roomId === params.roomId);
        if (params.count) return memories.slice(0, params.count);
        return memories;
      }
      async createMemory(memory) { 
        const id = memory.id || Date.now().toString();
        const mem = { ...memory, id, type: 'memory', createdAt: Date.now() };
        this.storage.set(`memory_${id}`, mem);
        return mem;
      }
      async removeMemory(id) { return this.storage.delete(`memory_${id}`); }
      async updateMemory(memory) {
        if (this.storage.has(`memory_${memory.id}`)) {
          this.storage.set(`memory_${memory.id}`, { ...memory, type: 'memory' });
          return memory;
        }
        return null;
      }
      
      async getRelationships(params = {}) { return Array.from(this.storage.values()).filter(item => item.type === 'relationship'); }
      async createRelationship(rel) { 
        const id = rel.id || Date.now().toString();
        const relationship = { ...rel, id, type: 'relationship' };
        this.storage.set(`rel_${id}`, relationship);
        return relationship;
      }
      async getRelationship(params) {
        const relationships = await this.getRelationships();
        return relationships.find(r => 
          (r.userId1 === params.userId1 && r.userId2 === params.userId2) ||
          (r.userId1 === params.userId2 && r.userId2 === params.userId1)
        ) || null;
      }
      
      async getGoals(params = {}) { 
        const goals = Array.from(this.storage.values()).filter(item => item.type === 'goal');
        if (params.userId) return goals.filter(g => g.userId === params.userId);
        if (params.roomId) return goals.filter(g => g.roomId === params.roomId);
        if (params.onlyInProgress) return goals.filter(g => g.status === 'IN_PROGRESS');
        if (params.count) return goals.slice(0, params.count);
        return goals;
      }
      async createGoal(goal) { 
        const id = goal.id || Date.now().toString();
        const g = { ...goal, id, type: 'goal', status: goal.status || 'IN_PROGRESS' };
        this.storage.set(`goal_${id}`, g);
        return g;
      }
      async updateGoal(goal) { 
        this.storage.set(`goal_${goal.id}`, { ...goal, type: 'goal' });
        return goal;
      }
      async removeGoal(id) { return this.storage.delete(`goal_${id}`); }
      
      async getRoom(id) { return this.storage.get(`room_${id}`) || null; }
      async createRoom(room) { 
        const id = room.id || Date.now().toString();
        const r = { ...room, id, type: 'room' };
        this.storage.set(`room_${id}`, r);
        return r;
      }
      async removeRoom(id) { return this.storage.delete(`room_${id}`); }
      
      async getParticipantsForAccount(userId) { 
        return Array.from(this.storage.values()).filter(item => 
          item.type === 'participant' && item.userId === userId
        );
      }
      async getParticipantsForRoom(roomId) {
        return Array.from(this.storage.values()).filter(item => 
          item.type === 'participant' && item.roomId === roomId
        );
      }
      async getParticipantUserState(roomId, userId) { 
        return this.storage.get(`participant_${roomId}_${userId}`) || null; 
      }
      async setParticipantUserState(roomId, userId, state) { 
        const participantState = { 
          roomId, userId, ...state, type: 'participant', updatedAt: Date.now()
        };
        this.storage.set(`participant_${roomId}_${userId}`, participantState);
        return participantState;
      }
      
      // Critical methods that were missing
      async addParticipant(userId, roomId) {
        const participant = {
          userId, roomId, id: `${userId}_${roomId}`, type: 'participant', joinedAt: Date.now()
        };
        this.storage.set(`participant_${roomId}_${userId}`, participant);
        console.log('✅ Added participant:', userId, 'to room:', roomId);
        return participant;
      }
      async removeParticipant(userId, roomId) {
        const removed = this.storage.delete(`participant_${roomId}_${userId}`);
        console.log('🗑️ Removed participant:', userId, 'from room:', roomId);
        return removed;
      }
      
      async getAccountById(userId) { return this.storage.get(`account_${userId}`) || null; }
      async createAccount(account) { 
        const id = account.id || account.userId || Date.now().toString();
        const acc = { ...account, id, type: 'account' };
        this.storage.set(`account_${id}`, acc);
        return acc; 
      }
      async updateAccount(account) {
        if (account.id) {
          this.storage.set(`account_${account.id}`, { ...account, type: 'account' });
          return account;
        }
        return null;
      }
      
      async getCachedEmbeddings(text) { 
        if (!text) return null;
        const cached = this.storage.get(`embedding_${text.slice(0, 50)}`);
        return cached ? cached.embeddings : null;
      }
      async setCachedEmbeddings(text, embeddings) { 
        if (!text || !embeddings) return false;
        const key = `embedding_${text.slice(0, 50)}`;
        this.storage.set(key, { 
          text: text.slice(0, 100), embeddings, type: 'embedding', createdAt: Date.now() 
        });
        return true; 
      }
      
      async searchMemoriesByEmbedding(embedding, params = {}) { 
        const memories = await this.getMemories(params);
        return memories.slice(0, params.count || 5);
      }
      async log(params) { 
        const message = typeof params === 'string' ? params : (params.message || JSON.stringify(params));
        console.log('📝 DB Log:', message);
        return true; 
      }
      async getActorDetails(params) { return null; }
      async searchMemories(params) { return await this.getMemories(params); }
      async countMemories(roomId, unique = true) {
        const memories = await this.getMemories({ roomId });
        return memories.length;
      }
      async removeAllMemories(roomId) {
        const memories = await this.getMemories({ roomId });
        for (const memory of memories) {
          await this.removeMemory(memory.id);
        }
        return true;
      }
    }
    
    const databaseAdapter = new CompleteDatabaseAdapter();
    console.log('✅ Complete database adapter ready');
    
    // Load Twitter plugin with enhanced error handling
    console.log('\n🐦 Loading Twitter plugin...');
    const plugins = [];
    
    try {
      const twitter = twitterPlugin.default || twitterPlugin;
      if (twitter) {
        plugins.push(twitter);
        console.log('✅ Twitter plugin loaded');
        console.log('🔍 Plugin structure:', typeof twitter);
      } else {
        throw new Error('Twitter plugin is null');
      }
    } catch (err) {
      console.error('❌ Twitter plugin error:', err.message);
      throw err;
    }
    
    // Create runtime with Twitter-optimized config
    const runtimeConfig = {
      character: twitterCharacter,
      modelProvider: modelProvider,
      token: apiKey,
      databaseAdapter: databaseAdapter,
      plugins: plugins
    };
    
    console.log('\n🤖 Creating AgentRuntime...');
    console.log('Config check:', {
      hasCharacter: !!runtimeConfig.character,
      characterClients: runtimeConfig.character.clients,
      modelProvider: runtimeConfig.modelProvider,
      hasDatabase: !!runtimeConfig.databaseAdapter,
      hasToken: !!runtimeConfig.token,
      pluginCount: runtimeConfig.plugins.length,
      hasTwitterSettings: !!runtimeConfig.character.settings?.secrets?.TWITTER_USERNAME
    });
    
    const runtime = new elizaCore.AgentRuntime(runtimeConfig);
    console.log('✅ AgentRuntime created');
    
    console.log('\n🔄 Initializing runtime...');
    await runtime.initialize();
    console.log('✅ Runtime initialization completed');
    
    // Enhanced Twitter client verification
    console.log('\n🐦 TWITTER CLIENT VERIFICATION:');
    console.log('- Runtime has clients property:', !!runtime.clients);
    console.log('- Runtime clients type:', typeof runtime.clients);
    
    if (runtime.clients) {
      console.log('- Available clients:', Object.keys(runtime.clients));
      console.log('- Twitter client exists:', !!runtime.clients.twitter);
      
      if (runtime.clients.twitter) {
        console.log('🎉 TWITTER CLIENT IS ACTIVE!');
        console.log('- Twitter client type:', typeof runtime.clients.twitter);
        console.log('- Twitter client name:', runtime.clients.twitter.constructor?.name);
      } else {
        console.log('❌ Twitter client missing from runtime');
        
        // Try to debug why client wasn't created
        console.log('🔍 Character clients config:', runtime.character?.clients);
        console.log('🔍 Available client types in ElizaOS:', Object.keys(elizaCore.Clients || {}));
      }
    } else {
      console.log('❌ No clients property found on runtime');
    }
    
    console.log('\n🎉 DRAGONTRADE AGENT STATUS:');
    console.log('═══════════════════════════════════════════');
    console.log('🤖 AI Model:', modelProvider.toUpperCase());
    console.log('🐦 Twitter Status:', runtime.clients?.twitter ? 'ACTIVE ✅' : 'INACTIVE ❌');
    console.log('📱 Twitter Account: @reviceva');
    console.log('🏷️ Branding: aideazz.xyz and $AZ');
    console.log('⏰ Posting Intervals: 90-180 minutes');
    console.log('💰 Monthly Cost: ~$5-15');
    console.log('═══════════════════════════════════════════');
    console.log('⏰ Started at:', new Date().toISOString());
    
    // Monitoring with Twitter focus
    let minutes = 0;
    setInterval(() => {
      minutes++;
      const timestamp = new Date().toISOString();
      const twitterStatus = runtime.clients?.twitter ? 'ACTIVE ✅' : 'INACTIVE ❌';
      
      if (minutes % 30 === 0) {
        console.log(`\n📊 [${timestamp}] DragonTrade Status:`);
        console.log(`   ⏱️  Running: ${minutes} minutes`);
        console.log(`   🐦 Twitter: ${twitterStatus}`);
        console.log(`   💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        console.log(`   🗄️  DB entries: ${runtime.databaseAdapter?.storage?.size || 0}`);
        console.log(`   ⏰ Next post window: ${90 - (minutes % 90)}-${180 - (minutes % 180)} min`);
        
        if (runtime.clients?.twitter && minutes >= 90) {
          console.log(`   🔥 Ready to post! Twitter client active for ${minutes} minutes`);
        }
      } else {
        console.log(`[${timestamp}] 🐉 DragonTrade: ${minutes}min | Twitter: ${twitterStatus}`);
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
    process.exit(1);
  }
}

console.log('🌟 Starting DragonTrade Agent (Force Twitter Mode)...');
main().catch(err => {
  console.error('💥 Startup failed:', err);
  process.exit(1);
});