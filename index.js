import * as elizaCore from '@elizaos/core';
import * as twitterPlugin from '@elizaos/plugin-twitter';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

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

async function main() {
  try {
    console.log('🚀 Starting Client Creation Trigger Test...');
    console.log('⏰ Time:', new Date().toISOString());
    
    // Load the original character structure from your file
    console.log('\n📋 Loading original character from file...');
    const characterPath = resolve(__dirname, 'character.json');
    const originalCharacter = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
    
    // Create character that exactly matches what worked on Fleek
    const fleekyCharacter = {
      ...originalCharacter,
      clients: ["twitter"], // Ensure Twitter is specified
      modelProvider: "anthropic",
      
      // Add the settings structure that was in your original config
      settings: {
        secrets: {
          TWITTER_USERNAME: process.env.TWITTER_USERNAME,
          TWITTER_PASSWORD: process.env.TWITTER_PASSWORD,
          TWITTER_EMAIL: process.env.TWITTER_EMAIL,
          TWITTER_2FA_SECRET: process.env.TWITTER_2FA_SECRET,
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
    
    console.log('✅ Fleek-style character configured');
    console.log('- Character name:', fleekyCharacter.name);
    console.log('- Clients:', fleekyCharacter.clients);
    console.log('- Has settings.secrets:', !!fleekyCharacter.settings?.secrets);
    console.log('- Twitter credentials in settings:', !!fleekyCharacter.settings?.secrets?.TWITTER_USERNAME);
    
    // Complete database adapter
    class CompleteAdapter extends elizaCore.DatabaseAdapter {
      constructor() {
        super();
        this.data = new Map();
        console.log('🗄️ Complete database adapter initialized');
      }
      
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
      
      async getRelationships(params = {}) { return Array.from(this.data.values()).filter(item => item.type === 'relationship'); }
      async createRelationship(rel) { 
        const id = rel.id || Date.now().toString();
        const relationship = { ...rel, id, type: 'relationship' };
        this.data.set(`rel_${id}`, relationship);
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
        const goals = Array.from(this.data.values()).filter(item => item.type === 'goal');
        if (params.userId) return goals.filter(g => g.userId === params.userId);
        if (params.roomId) return goals.filter(g => g.roomId === params.roomId);
        if (params.onlyInProgress) return goals.filter(g => g.status === 'IN_PROGRESS');
        if (params.count) return goals.slice(0, params.count);
        return goals;
      }
      async createGoal(goal) { 
        const id = goal.id || Date.now().toString();
        const g = { ...goal, id, type: 'goal', status: goal.status || 'IN_PROGRESS' };
        this.data.set(`goal_${id}`, g);
        return g;
      }
      async updateGoal(goal) { 
        this.data.set(`goal_${goal.id}`, { ...goal, type: 'goal' });
        return goal;
      }
      async removeGoal(id) { return this.data.delete(`goal_${id}`); }
      
      async getRoom(id) { return this.data.get(`room_${id}`) || null; }
      async createRoom(room) { 
        const id = room.id || Date.now().toString();
        const r = { ...room, id, type: 'room' };
        this.data.set(`room_${id}`, r);
        return r;
      }
      async removeRoom(id) { return this.data.delete(`room_${id}`); }
      
      async getParticipantsForAccount(userId) { 
        return Array.from(this.data.values()).filter(item => 
          item.type === 'participant' && item.userId === userId
        );
      }
      async getParticipantsForRoom(roomId) {
        return Array.from(this.data.values()).filter(item => 
          item.type === 'participant' && item.roomId === roomId
        );
      }
      async getParticipantUserState(roomId, userId) { 
        return this.data.get(`participant_${roomId}_${userId}`) || null; 
      }
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
      async removeParticipant(userId, roomId) {
        const removed = this.data.delete(`participant_${roomId}_${userId}`);
        console.log('🗑️ Removed participant:', userId, 'from room:', roomId);
        return removed;
      }
      
      async getAccountById(userId) { return this.data.get(`account_${userId}`) || null; }
      async createAccount(account) { 
        const id = account.id || account.userId || Date.now().toString();
        const acc = { ...account, id, type: 'account' };
        this.data.set(`account_${id}`, acc);
        return acc; 
      }
      async updateAccount(account) {
        if (account.id) {
          this.data.set(`account_${account.id}`, { ...account, type: 'account' });
          return account;
        }
        return null;
      }
      
      async getCachedEmbeddings(text) { 
        if (!text) return null;
        const cached = this.data.get(`embedding_${text.slice(0, 50)}`);
        return cached ? cached.embeddings : null;
      }
      async setCachedEmbeddings(text, embeddings) { 
        if (!text || !embeddings) return false;
        const key = `embedding_${text.slice(0, 50)}`;
        this.data.set(key, { 
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
    
    console.log('\n🔌 Loading plugins exactly like Fleek...');
    const plugins = [
      twitterPlugin.default || twitterPlugin,
      // Note: Only Twitter plugin for now to isolate the issue
    ];
    
    console.log('✅ Plugins loaded:', plugins.length);
    
    // Create runtime config that matches Fleek setup
    const runtimeConfig = {
      character: fleekyCharacter,
      modelProvider: "anthropic",
      token: process.env.ANTHROPIC_API_KEY,
      databaseAdapter: new CompleteAdapter(),
      plugins: plugins
    };
    
    console.log('\n🤖 Creating AgentRuntime (Fleek-style)...');
    console.log('Config verification:', {
      hasCharacter: !!runtimeConfig.character,
      characterName: runtimeConfig.character.name,
      characterClients: runtimeConfig.character.clients,
      hasSettings: !!runtimeConfig.character.settings,
      hasSecrets: !!runtimeConfig.character.settings?.secrets,
      hasTwitterCreds: !!runtimeConfig.character.settings?.secrets?.TWITTER_USERNAME,
      modelProvider: runtimeConfig.modelProvider,
      hasToken: !!runtimeConfig.token,
      hasDatabase: !!runtimeConfig.databaseAdapter,
      pluginCount: runtimeConfig.plugins.length
    });
    
    const runtime = new elizaCore.AgentRuntime(runtimeConfig);
    console.log('✅ AgentRuntime created');
    
    console.log('\n🔄 Initializing runtime (with client creation trigger)...');
    await runtime.initialize();
    console.log('✅ Runtime initialization completed');
    
    // Enhanced client detection
    console.log('\n🔍 Post-Initialization Analysis:');
    console.log('- Runtime has clients property:', !!runtime.clients);
    console.log('- Runtime clients type:', typeof runtime.clients);
    console.log('- Runtime clients is array:', Array.isArray(runtime.clients));
    
    if (runtime.clients) {
      if (typeof runtime.clients === 'object' && !Array.isArray(runtime.clients)) {
        console.log('- Available client keys:', Object.keys(runtime.clients));
        console.log('- Twitter client exists:', !!runtime.clients.twitter);
        
        if (runtime.clients.twitter) {
          console.log('🎉 TWITTER CLIENT FOUND!');
          console.log('- Type:', typeof runtime.clients.twitter);
          console.log('- Constructor:', runtime.clients.twitter.constructor?.name);
          console.log('- Has start method:', typeof runtime.clients.twitter.start);
          console.log('- Has stop method:', typeof runtime.clients.twitter.stop);
        }
      } else {
        console.log('- Clients structure:', runtime.clients);
      }
    } else {
      console.log('❌ Still no clients object');
    }
    
    // Try to trigger client creation manually if still missing
    if (!runtime.clients?.twitter) {
      console.log('\n🔧 Attempting to trigger client creation...');
      
      try {
        // Try to call a method that might trigger client creation
        if (runtime.registerClient) {
          console.log('🔄 Trying runtime.registerClient...');
          await runtime.registerClient('twitter');
        }
        
        if (runtime.startClients) {
          console.log('🔄 Trying runtime.startClients...');
          await runtime.startClients();
        }
        
        if (runtime.initializeClients) {
          console.log('🔄 Trying runtime.initializeClients...');
          await runtime.initializeClients();
        }
        
        // Check again after manual triggers
        if (runtime.clients?.twitter) {
          console.log('✅ Manual trigger successful!');
        }
        
      } catch (triggerError) {
        console.log('⚠️ Manual trigger failed:', triggerError.message);
      }
    }
    
    console.log('\n🎯 FINAL STATUS:');
    console.log('═══════════════════════════════════════');
    console.log('🐦 Twitter Status:', runtime.clients?.twitter ? 'ACTIVE ✅' : 'INACTIVE ❌');
    console.log('📱 Account: @reviceva');
    console.log('🏷️ Branding: aideazz.xyz and $AZ');
    console.log('⏰ Posting: Every 90-180 minutes');
    console.log('═══════════════════════════════════════');
    
    if (runtime.clients?.twitter) {
      console.log('\n🎉 SUCCESS! Twitter client is ACTIVE!');
      console.log('Your DragonTrade agent will start posting within 90-180 minutes!');
    } else {
      console.log('\n❌ Twitter client still inactive');
      console.log('This may be a version compatibility issue with ElizaOS');
      console.log('But your agent is running and will attempt to post if the framework allows it');
    }
    
    // Monitor for posting activity
    let minutes = 0;
    setInterval(() => {
      minutes++;
      const twitterStatus = runtime.clients?.twitter ? 'ACTIVE' : 'INACTIVE';
      console.log(`[${new Date().toISOString()}] 🐉 DragonTrade: ${minutes}min | Twitter: ${twitterStatus}`);
      
      if (minutes % 30 === 0) {
        console.log(`\n📊 Status Update: ${minutes} minutes running`);
        console.log(`   🐦 Twitter: ${twitterStatus}`);
        console.log(`   💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        console.log(`   🗄️  DB entries: ${runtime.databaseAdapter?.data?.size || 0}`);
        
        if (runtime.clients?.twitter) {
          console.log(`   🔥 Twitter client active - posting window: ${90 - (minutes % 90)}-${180 - (minutes % 180)} min`);
        } else {
          console.log(`   ⚠️  Client inactive but runtime stable for ${minutes} minutes`);
        }
      }
    }, 60000);
    
  } catch (error) {
    console.error('\n💥 FATAL ERROR:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

console.log('🌟 Starting Client Creation Trigger Test...');
main().catch(err => {
  console.error('💥 Main failed:', err.message);
  process.exit(1);
});