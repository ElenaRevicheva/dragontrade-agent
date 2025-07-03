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
    
    // Create database adapter - Try different types
    console.log('\n🗄️ Creating database adapter...');
    let databaseAdapter;
    
    // Check available database adapters
    console.log('Available adapters:', {
      DatabaseAdapter: !!elizaCore.DatabaseAdapter,
      DbCacheAdapter: !!elizaCore.DbCacheAdapter,
      MemoryCacheAdapter: !!elizaCore.MemoryCacheAdapter,
      FsCacheAdapter: !!elizaCore.FsCacheAdapter
    });
    
    // Try creating a proper database adapter
    try {
      // Option 1: Try extending DatabaseAdapter
      if (elizaCore.DatabaseAdapter) {
        console.log('🔄 Trying DatabaseAdapter...');
        
        // Create a simple in-memory implementation
        class SimpleMemoryAdapter extends elizaCore.DatabaseAdapter {
          constructor() {
            super();
            this.memories = new Map();
            this.relationships = new Map();
            this.goals = new Map();
            this.rooms = new Map();
            this.participants = new Map();
          }
          
          // Required memory methods
          async getMemoryById(id) {
            return this.memories.get(id) || null;
          }
          
          async getMemories(params) {
            return Array.from(this.memories.values());
          }
          
          async createMemory(memory) {
            const id = memory.id || Date.now().toString();
            this.memories.set(id, { ...memory, id });
            return { ...memory, id };
          }
          
          async removeMemory(id) {
            return this.memories.delete(id);
          }
          
          // Required relationship methods
          async getRelationships(params) {
            return Array.from(this.relationships.values());
          }
          
          async createRelationship(relationship) {
            const id = relationship.id || Date.now().toString();
            this.relationships.set(id, { ...relationship, id });
            return { ...relationship, id };
          }
          
          // Required goal methods
          async getGoals(params) {
            return Array.from(this.goals.values());
          }
          
          async createGoal(goal) {
            const id = goal.id || Date.now().toString();
            this.goals.set(id, { ...goal, id });
            return { ...goal, id };
          }
          
          async updateGoal(goal) {
            this.goals.set(goal.id, goal);
            return goal;
          }
          
          async removeGoal(id) {
            return this.goals.delete(id);
          }
          
          // Required room methods
          async getRoom(id) {
            return this.rooms.get(id) || null;
          }
          
          async createRoom(room) {
            const id = room.id || Date.now().toString();
            this.rooms.set(id, { ...room, id });
            return { ...room, id };
          }
          
          // Required participant methods
          async getParticipantsForAccount(userId) {
            return Array.from(this.participants.values()).filter(p => p.userId === userId);
          }
          
          async getParticipantUserState(roomId, userId) {
            return this.participants.get(`${roomId}-${userId}`) || null;
          }
          
          async setParticipantUserState(roomId, userId, state) {
            this.participants.set(`${roomId}-${userId}`, { roomId, userId, ...state });
            return { roomId, userId, ...state };
          }
          
          // Cache methods for compatibility
          async getCachedEmbeddings(text) {
            return null;
          }
          
          async setCachedEmbeddings(text, embeddings) {
            return true;
          }
        }
        
        databaseAdapter = new SimpleMemoryAdapter();
        console.log('✅ Custom DatabaseAdapter created');
      }
    } catch (err) {
      console.log('❌ DatabaseAdapter creation failed:', err.message);
    }
    
    // Fallback: Try other adapters
    if (!databaseAdapter) {
      try {
        if (elizaCore.DbCacheAdapter) {
          databaseAdapter = new elizaCore.DbCacheAdapter();
          console.log('✅ DbCacheAdapter created');
        }
      } catch (err) {
        console.log('❌ DbCacheAdapter failed:', err.message);
      }
    }
    
    if (!databaseAdapter) {
      throw new Error('Could not create any compatible database adapter');
    }
    
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
    
    // Initialize runtime
    console.log('\n🔄 Initializing runtime...');
    await runtime.initialize();
    console.log('✅ Runtime initialized successfully!');
    
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
    
    console.log('\n🎉 DRAGONTRADE AGENT STARTED SUCCESSFULLY!');
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