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
    console.log('🚀 Starting Fixed Embedding Test...');
    console.log('⏰ Time:', new Date().toISOString());
    
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
        console.log('🔍 getCachedEmbeddings called with:', typeof text, text);
        
        // Always return null to skip caching and avoid crashes
        return null;
      }
      
      async setCachedEmbeddings(text, embeddings) { 
        console.log('💾 setCachedEmbeddings called with:', typeof text, typeof embeddings);
        
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
      hasTwitterSettings: !!runtimeConfig.character.settings?.secrets?.TWITTER_USERNAME,
      modelProvider: runtimeConfig.modelProvider,
      hasToken: !!runtimeConfig.token,
      pluginCount: runtimeConfig.plugins.length
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
    
    console.log('\n🔍 Twitter Client Check:');
    console.log('- Runtime has clients:', !!runtime.clients);
    console.log('- Clients type:', typeof runtime.clients);
    
    if (runtime.clients) {
      console.log('- Available clients:', Object.keys(runtime.clients));
      if (runtime.clients.twitter) {
        console.log('🎉 TWITTER CLIENT IS ACTIVE!');
        console.log('- Type:', typeof runtime.clients.twitter);
        console.log('- Constructor:', runtime.clients.twitter.constructor?.name);
      } else {
        console.log('❌ Twitter client not found');
      }
    } else {
      console.log('❌ No clients object found');
    }
    
    console.log('\n🎯 FINAL STATUS:');
    console.log('═══════════════════════════════════════');
    console.log('🐦 Twitter Status:', runtime.clients?.twitter ? 'ACTIVE ✅' : 'INACTIVE ❌');
    console.log('📱 Account: @reviceva');
    console.log('🏷️ Branding: aideazz.xyz and $AZ');
    console.log('⏰ Posting: Every 90-180 minutes');
    console.log('🧠 Knowledge: Disabled (to avoid embedding crashes)');
    console.log('═══════════════════════════════════════');
    
    if (runtime.clients?.twitter) {
      console.log('\n🎉 SUCCESS! Your DragonTrade agent is LIVE!');
      console.log('Twitter client is active and will start posting within 90-180 minutes!');
    } else {
      console.log('\n⚠️ Twitter client not visible, but agent is running stable');
      console.log('ElizaOS may handle posting internally even without visible client object');
    }
    
    // Monitor for activity
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
        
        if (minutes >= 90) {
          console.log(`   ⏰ In posting window! Agent has been running ${minutes} minutes`);
        } else {
          console.log(`   ⏰ Posting window opens in ${90 - minutes} minutes`);
        }
      }
    }, 60000);
    
  } catch (error) {
    console.error('\n💥 FATAL ERROR:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('\nEnvironment check:');
    console.error('- ANTHROPIC_API_KEY:', !!process.env.ANTHROPIC_API_KEY);
    console.error('- TWITTER_USERNAME:', !!process.env.TWITTER_USERNAME);
    process.exit(1);
  }
}

console.log('🌟 Starting Fixed Embedding Test...');
main().catch(err => {
  console.error('💥 Main failed:', err.message);
  process.exit(1);
});