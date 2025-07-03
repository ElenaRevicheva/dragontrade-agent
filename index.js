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
    console.log('🚀 Starting DragonTrade Agent...');
    console.log('⏰ Time:', new Date().toISOString());
    
    // Check essential environment variables
    const requiredEnvVars = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      TWITTER_USERNAME: process.env.TWITTER_USERNAME,
      TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
      TWITTER_EMAIL: process.env.TWITTER_EMAIL
    };
    
    console.log('\n🔐 Environment Check:');
    for (const [key, value] of Object.entries(requiredEnvVars)) {
      console.log(`${key}: ${value ? '✅ SET' : '❌ MISSING'}`);
      if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
    
    // Load character
    console.log('\n📋 Loading character...');
    const character = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
    console.log(`Character loaded: ${character.name}`);
    console.log(`Clients: ${character.clients?.join(', ')}`);
    
    // Create enhanced database adapter with proper embedding support
    console.log('\n🗄️ Creating database adapter...');
    
    class EnhancedMemoryAdapter extends elizaCore.DatabaseAdapter {
      constructor() {
        super();
        this.memories = new Map();
        this.relationships = new Map();
        this.goals = new Map();
        this.rooms = new Map();
        this.participants = new Map();
        this.embeddings = new Map(); // For caching embeddings
        this.accounts = new Map();
      }
      
      // Account methods
      async getAccountById(userId) {
        return this.accounts.get(userId) || null;
      }
      
      async createAccount(account) {
        const id = account.id || account.userId || Date.now().toString();
        const fullAccount = { ...account, id };
        this.accounts.set(id, fullAccount);
        return fullAccount;
      }
      
      // Memory methods
      async getMemoryById(id) {
        return this.memories.get(id) || null;
      }
      
      async getMemories(params = {}) {
        let memories = Array.from(this.memories.values());
        
        if (params.roomId) {
          memories = memories.filter(m => m.roomId === params.roomId);
        }
        if (params.userId) {
          memories = memories.filter(m => m.userId === params.userId);
        }
        if (params.agentId) {
          memories = memories.filter(m => m.agentId === params.agentId);
        }
        if (params.count) {
          memories = memories.slice(0, params.count);
        }
        
        return memories;
      }
      
      async createMemory(memory) {
        const id = memory.id || Date.now().toString();
        const fullMemory = { 
          ...memory, 
          id,
          createdAt: memory.createdAt || Date.now()
        };
        this.memories.set(id, fullMemory);
        return fullMemory;
      }
      
      async removeMemory(id) {
        return this.memories.delete(id);
      }
      
      async updateMemory(memory) {
        if (this.memories.has(memory.id)) {
          this.memories.set(memory.id, memory);
          return memory;
        }
        return null;
      }
      
      // Relationship methods
      async getRelationships(params = {}) {
        let relationships = Array.from(this.relationships.values());
        
        if (params.userId1) {
          relationships = relationships.filter(r => r.userId1 === params.userId1 || r.userId2 === params.userId1);
        }
        
        return relationships;
      }
      
      async createRelationship(relationship) {
        const id = relationship.id || Date.now().toString();
        const fullRelationship = { ...relationship, id };
        this.relationships.set(id, fullRelationship);
        return fullRelationship;
      }
      
      async getRelationship(params) {
        return Array.from(this.relationships.values()).find(r => 
          (r.userId1 === params.userId1 && r.userId2 === params.userId2) ||
          (r.userId1 === params.userId2 && r.userId2 === params.userId1)
        ) || null;
      }
      
      // Goal methods
      async getGoals(params = {}) {
        let goals = Array.from(this.goals.values());
        
        if (params.userId) {
          goals = goals.filter(g => g.userId === params.userId);
        }
        if (params.roomId) {
          goals = goals.filter(g => g.roomId === params.roomId);
        }
        if (params.onlyInProgress) {
          goals = goals.filter(g => g.status === 'IN_PROGRESS');
        }
        if (params.count) {
          goals = goals.slice(0, params.count);
        }
        
        return goals;
      }
      
      async createGoal(goal) {
        const id = goal.id || Date.now().toString();
        const fullGoal = { 
          ...goal, 
          id,
          createdAt: goal.createdAt || Date.now(),
          status: goal.status || 'IN_PROGRESS'
        };
        this.goals.set(id, fullGoal);
        return fullGoal;
      }
      
      async updateGoal(goal) {
        this.goals.set(goal.id, goal);
        return goal;
      }
      
      async removeGoal(id) {
        return this.goals.delete(id);
      }
      
      // Room methods
      async getRoom(id) {
        return this.rooms.get(id) || null;
      }
      
      async createRoom(room) {
        const id = room.id || Date.now().toString();
        const fullRoom = { ...room, id };
        this.rooms.set(id, fullRoom);
        return fullRoom;
      }
      
      async removeRoom(id) {
        return this.rooms.delete(id);
      }
      
      // Participant methods
      async getParticipantsForAccount(userId) {
        return Array.from(this.participants.values()).filter(p => p.userId === userId);
      }
      
      async getParticipantUserState(roomId, userId) {
        return this.participants.get(`${roomId}-${userId}`) || null;
      }
      
      async setParticipantUserState(roomId, userId, state) {
        const participantState = { roomId, userId, ...state };
        this.participants.set(`${roomId}-${userId}`, participantState);
        return participantState;
      }
      
      async getParticipantsForRoom(roomId) {
        return Array.from(this.participants.values()).filter(p => p.roomId === roomId);
      }
      
      // Enhanced embedding cache methods
      async getCachedEmbeddings(text) {
        if (!text || typeof text !== 'string') {
          console.log('⚠️ Invalid text for embeddings:', typeof text);
          return null;
        }
        
        const cached = this.embeddings.get(text);
        if (cached) {
          console.log('✅ Found cached embedding for text:', text.substring(0, 50) + '...');
          return cached;
        }
        
        console.log('📝 No cached embedding for text:', text.substring(0, 50) + '...');
        return null;
      }
      
      async setCachedEmbeddings(text, embeddings) {
        if (!text || typeof text !== 'string') {
          console.log('⚠️ Invalid text for caching embeddings:', typeof text);
          return false;
        }
        
        if (!embeddings) {
          console.log('⚠️ No embeddings provided for caching');
          return false;
        }
        
        this.embeddings.set(text, embeddings);
        console.log('✅ Cached embeddings for text:', text.substring(0, 50) + '...');
        return true;
      }
      
      // Knowledge methods
      async searchMemoriesByEmbedding(embedding, params = {}) {
        // Simple implementation - just return recent memories
        const memories = await this.getMemories(params);
        return memories.slice(0, params.count || 10);
      }
      
      // Additional utility methods
      async log(params) {
        console.log('📝 Database log:', params);
        return true;
      }
    }
    
    const databaseAdapter = new EnhancedMemoryAdapter();
    console.log('✅ Enhanced DatabaseAdapter created with embedding support');
    
    // Prepare plugins
    console.log('\n🔌 Preparing plugins...');
    const plugins = [];
    
    // Add each plugin safely
    try {
      const webSearch = webSearchPlugin.default || webSearchPlugin;
      if (webSearch) plugins.push(webSearch);
      console.log('✅ Web search plugin added');
    } catch (err) {
      console.log('⚠️ Web search plugin failed:', err.message);
    }
    
    try {
      const coinmarket = coinmarketcapPlugin.default || coinmarketcapPlugin;
      if (coinmarket) plugins.push(coinmarket);
      console.log('✅ CoinMarketCap plugin added');
    } catch (err) {
      console.log('⚠️ CoinMarketCap plugin failed:', err.message);
    }
    
    try {
      const twitter = twitterPlugin.default || twitterPlugin;
      if (twitter) plugins.push(twitter);
      console.log('✅ Twitter plugin added');
    } catch (err) {
      console.log('⚠️ Twitter plugin failed:', err.message);
    }
    
    console.log(`Total plugins loaded: ${plugins.length}`);
    
    // Create runtime config
    const runtimeConfig = {
      character: character,
      modelProvider: 'openai',
      token: process.env.OPENAI_API_KEY,
      databaseAdapter: databaseAdapter,
      plugins: plugins
    };
    
    console.log('\n🤖 Creating AgentRuntime...');
    console.log('Config:', {
      hasCharacter: !!runtimeConfig.character,
      hasDatabase: !!runtimeConfig.databaseAdapter,
      databaseType: runtimeConfig.databaseAdapter.constructor.name,
      hasToken: !!runtimeConfig.token,
      pluginCount: runtimeConfig.plugins.length
    });
    
    // Create runtime
    const runtime = new elizaCore.AgentRuntime(runtimeConfig);
    console.log('✅ AgentRuntime created');
    
    // Initialize runtime with detailed logging
    console.log('\n🔄 Initializing runtime...');
    console.log('🧠 Processing character knowledge...');
    
    try {
      await runtime.initialize();
      console.log('✅ Runtime initialized successfully!');
    } catch (initError) {
      console.error('❌ Runtime initialization failed:', initError.message);
      console.error('Stack:', initError.stack);
      throw initError;
    }
    
    // Check what's available
    console.log('\n📊 Runtime Status:');
    console.log('- Character name:', runtime.character?.name);
    console.log('- Model provider:', runtime.modelProvider);
    console.log('- Database adapter:', runtime.databaseAdapter?.constructor?.name);
    console.log('- Has clients:', !!runtime.clients);
    console.log('- Available clients:', runtime.clients ? Object.keys(runtime.clients) : 'none');
    
    if (runtime.clients?.twitter) {
      console.log('- Twitter client type:', typeof runtime.clients.twitter);
      console.log('✅ Twitter client is available!');
    } else {
      console.log('⚠️ Twitter client not found');
    }
    
    console.log('\n🎉 DRAGONTRADE AGENT STARTED SUCCESSFULLY! 🐉');
    console.log('🚀 Agent is now running and monitoring for Twitter activity...');
    console.log('📱 Expected posting: Every 90-180 minutes');
    console.log('🏷️ Branding: aideazz.xyz and $AZ');
    console.log('⏰ Started at:', new Date().toISOString());
    
    // Enhanced monitoring
    let minutes = 0;
    setInterval(() => {
      minutes++;
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🐉 DragonTrade Agent: ${minutes} minutes running`);
      
      // Show detailed status every 15 minutes
      if (minutes % 15 === 0) {
        console.log(`📊 Status Check:`);
        console.log(`   - Runtime active: ${!!runtime}`);
        console.log(`   - Twitter client: ${runtime.clients?.twitter ? 'CONNECTED' : 'NOT FOUND'}`);
        console.log(`   - Next post window: ${90 - (minutes % 90)}-${180 - (minutes % 180)} minutes`);
        console.log(`   - Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        console.log(`   - Cached embeddings: ${runtime.databaseAdapter?.embeddings?.size || 0}`);
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
    
    // Show debug info
    console.error('\n🔍 Debug Info:');
    console.error('- ElizaCore available:', !!elizaCore);
    console.error('- AgentRuntime available:', !!elizaCore.AgentRuntime);
    console.error('- DatabaseAdapter available:', !!elizaCore.DatabaseAdapter);
    console.error('- Character file exists:', fs.existsSync(characterPath));
    
    process.exit(1);
  }
}

console.log('🌟 Initializing DragonTrade Agent...');
main().catch(err => {
  console.error('💥 Startup failed:', err);
  process.exit(1);
});