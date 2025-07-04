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
    console.log('🚀 Starting DragonTrade Agent (Complete Database Mode)...');
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
      clients: ['twitter'],
      modelProvider: modelProvider,
      plugins: originalCharacter.plugins,
      
      bio: [
        "🐉 DragonTrade - AI Trading Assistant",
        "Expert crypto market analysis and insights", 
        "Powered by advanced AI for Web3 trading"
      ],
      
      knowledge: [],
      
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
      
      postExamples: originalCharacter.postExamples,
      
      style: {
        all: ["Analytical", "Professional", "Engaging"],
        chat: ["Helpful", "Detailed", "Strategic"],
        post: ["Concise", "Informative", "Exciting"]
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
    
    console.log(`✅ Character loaded: ${twitterOptimizedCharacter.name}`);
    console.log(`📱 Post examples: ${twitterOptimizedCharacter.postExamples.length}`);
    
    // Complete database adapter with ALL required methods
    class CompleteDatabaseAdapter extends elizaCore.DatabaseAdapter {
      constructor() {
        super();
        this.storage = new Map();
        console.log('🗄️ Complete database adapter initialized');
      }
      
      // Memory methods
      async getMemoryById(id) { 
        return this.storage.get(`memory_${id}`) || null; 
      }
      
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
      
      async removeMemory(id) { 
        return this.storage.delete(`memory_${id}`); 
      }
      
      async updateMemory(memory) {
        if (this.storage.has(`memory_${memory.id}`)) {
          this.storage.set(`memory_${memory.id}`, { ...memory, type: 'memory' });
          return memory;
        }
        return null;
      }
      
      // Relationship methods
      async getRelationships(params = {}) { 
        return Array.from(this.storage.values()).filter(item => item.type === 'relationship');
      }
      
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
      
      // Goal methods
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
      
      async removeGoal(id) { 
        return this.storage.delete(`goal_${id}`); 
      }
      
      // Room methods
      async getRoom(id) { 
        return this.storage.get(`room_${id}`) || null; 
      }
      
      async createRoom(room) { 
        const id = room.id || Date.now().toString();
        const r = { ...room, id, type: 'room' };
        this.storage.set(`room_${id}`, r);
        return r;
      }
      
      async removeRoom(id) {
        return this.storage.delete(`room_${id}`);
      }
      
      // Participant methods - THESE WERE MISSING!
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
          roomId, 
          userId, 
          ...state, 
          type: 'participant',
          updatedAt: Date.now()
        };
        this.storage.set(`participant_${roomId}_${userId}`, participantState);
        return participantState;
      }
      
      // ⭐ CRITICAL: Missing addParticipant method
      async addParticipant(userId, roomId) {
        const participant = {
          userId,
          roomId,
          id: `${userId}_${roomId}`,
          type: 'participant',
          joinedAt: Date.now()
        };
        this.storage.set(`participant_${roomId}_${userId}`, participant);
        console.log('✅ Added participant:', userId, 'to room:', roomId);
        return participant;
      }
      
      // ⭐ CRITICAL: Missing removeParticipant method
      async removeParticipant(userId, roomId) {
        const removed = this.storage.delete(`participant_${roomId}_${userId}`);
        console.log('🗑️ Removed participant:', userId, 'from room:', roomId);
        return removed;
      }
      
      // Account methods
      async getAccountById(userId) { 
        return this.storage.get(`account_${userId}`) || null; 
      }
      
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
      
      // Embedding methods
      async getCachedEmbeddings(text) { 
        if (!text) return null;
        const cached = this.storage.get(`embedding_${text.slice(0, 50)}`);
        return cached ? cached.embeddings : null;
      }
      
      async setCachedEmbeddings(text, embeddings) { 
        if (!text || !embeddings) return false;
        const key = `embedding_${text.slice(0, 50)}`;
        this.storage.set(key, { 
          text: text.slice(0, 100), 
          embeddings, 
          type: 'embedding',
          createdAt: Date.now() 
        });
        return true; 
      }
      
      // Search methods
      async searchMemoriesByEmbedding(embedding, params = {}) { 
        const memories = await this.getMemories(params);
        return memories.slice(0, params.count || 5);
      }
      
      // Logging
      async log(params) { 
        const message = typeof params === 'string' ? params : (params.message || JSON.stringify(params));
        console.log('📝 DB Log:', message);
        return true; 
      }
      
      // Additional methods that might be needed
      async getActorDetails(params) {
        return null;
      }
      
      async searchMemories(params) {
        return await this.getMemories(params);
      }
      
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
    console.log('✅ Complete database adapter created with all required methods');
    
    // Load Twitter plugin
    console.log('\n🐦 Loading Twitter plugin...');
    const plugins = [];
    
    try {
      const twitter = twitterPlugin.default || twitterPlugin;
      if (twitter) {
        plugins.push(twitter);
        console.log('✅ Twitter plugin loaded successfully');
      } else {
        throw new Error('Twitter plugin is null');
      }
    } catch (err) {
      console.error('❌ Twitter plugin failed:', err.message);
      throw err;
    }
    
    console.log(`✅ Total plugins loaded: ${plugins.length}`);
    
    // Runtime configuration
    const runtimeConfig = {
      character: twitterOptimizedCharacter,
      modelProvider: modelProvider,
      token: apiKey,
      databaseAdapter: databaseAdapter,
      plugins: plugins
    };
    
    console.log('\n🤖 Creating AgentRuntime...');
    const runtime = new elizaCore.AgentRuntime(runtimeConfig);
    console.log('✅ AgentRuntime created');
    
    console.log('\n🔄 Initializing runtime...');
    await runtime.initialize();
    console.log('✅ Runtime initialization completed');
    
    // Check Twitter client status
    console.log('\n🐦 Twitter Client Status:');
    console.log('- Runtime has clients:', !!runtime.clients);
    
    if (runtime.clients) {
      console.log('- Available clients:', Object.keys(runtime.clients));
      if (runtime.clients.twitter) {
        console.log('✅ Twitter client is ACTIVE!');
      } else {
        console.log('❌ Twitter client not found');
      }
    } else {
      console.log('❌ No clients found');
    }
    
    console.log('\n🎉 DRAGONTRADE AGENT LIVE!');
    console.log('═══════════════════════════════════════════');
    console.log('🤖 AI Model:', modelProvider.toUpperCase());
    console.log('📱 Twitter:', runtime.clients?.twitter ? 'ACTIVE ✅' : 'INACTIVE ❌');
    console.log('🏷️ Branding: aideazz.xyz and $AZ');
    console.log('⏰ Posting: Every 90-180 minutes');
    console.log('═══════════════════════════════════════════');
    
    // Monitoring
    let minutes = 0;
    setInterval(() => {
      minutes++;
      const timestamp = new Date().toISOString();
      
      if (minutes % 30 === 0) {
        console.log(`\n📊 [${timestamp}] DragonTrade Status:`);
        console.log(`   ⏱️  Running: ${minutes} minutes`);
        console.log(`   🐦 Twitter: ${runtime.clients?.twitter ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);
        console.log(`   💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        console.log(`   🗄️  DB entries: ${runtime.databaseAdapter?.storage?.size || 0}`);
        console.log(`   ⏰ Next post: ${90 - (minutes % 90)}-${180 - (minutes % 180)} min`);
      } else {
        console.log(`[${timestamp}] 🐉 DragonTrade: ${minutes}min | Twitter: ${runtime.clients?.twitter ? 'ACTIVE' : 'INACTIVE'}`);
      }
    }, 60000);
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down...');
      try {
        if (runtime?.stop) await runtime.stop();
      } catch (err) {
        console.error('Shutdown error:', err.message);
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

console.log('🌟 Starting DragonTrade Agent (Complete Database)...');
main().catch(err => {
  console.error('💥 Startup failed:', err);
  process.exit(1);
});