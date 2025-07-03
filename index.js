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
    console.log('🚀 Starting DragonTrade Agent (Claude-Powered)...');
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
      if (!value && key === 'ANTHROPIC_API_KEY') {
        console.log('⚠️ ANTHROPIC_API_KEY missing - will try OPENAI_API_KEY as fallback');
      } else if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }
    
    // Determine which API to use
    const useOpenAI = !process.env.ANTHROPIC_API_KEY && process.env.OPENAI_API_KEY;
    const modelProvider = useOpenAI ? 'openai' : 'anthropic';
    const apiKey = useOpenAI ? process.env.OPENAI_API_KEY : process.env.ANTHROPIC_API_KEY;
    
    console.log(`🤖 Model Provider: ${modelProvider.toUpperCase()}`);
    console.log(`🔑 API Key: ${apiKey ? 'SET' : 'MISSING'}`);
    
    if (!apiKey) {
      throw new Error('No valid API key found (need ANTHROPIC_API_KEY or OPENAI_API_KEY)');
    }
    
    // Load character
    console.log('\n📋 Loading character...');
    const character = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
    
    // Update character to reflect Claude usage
    const enhancedCharacter = {
      ...character,
      modelProvider: modelProvider,
      bio: [
        ...character.bio,
        `Powered by ${modelProvider === 'anthropic' ? 'Claude (Anthropic)' : 'OpenAI'} for superior market analysis`
      ]
    };
    
    console.log(`Character loaded: ${enhancedCharacter.name}`);
    console.log(`Model Provider: ${enhancedCharacter.modelProvider}`);
    console.log(`Knowledge items: ${enhancedCharacter.knowledge?.length || 0}`);
    
    // Enhanced database adapter
    class ClaudeCompatibleAdapter extends elizaCore.DatabaseAdapter {
      constructor() {
        super();
        this.data = new Map();
        console.log('🗄️ Initializing Claude-compatible database adapter');
      }
      
      // Essential memory methods
      async getMemoryById(id) { 
        return this.data.get(`memory_${id}`) || null; 
      }
      
      async getMemories(params = {}) { 
        const memories = Array.from(this.data.values()).filter(item => 
          item.type === 'memory'
        );
        return params.count ? memories.slice(0, params.count) : memories;
      }
      
      async createMemory(memory) { 
        const id = memory.id || Date.now().toString();
        const mem = { ...memory, id, type: 'memory', createdAt: Date.now() };
        this.data.set(`memory_${id}`, mem);
        console.log('💾 Created memory:', id);
        return mem;
      }
      
      async removeMemory(id) { 
        return this.data.delete(`memory_${id}`); 
      }
      
      // Relationship methods
      async getRelationships(params = {}) { 
        return Array.from(this.data.values()).filter(item => item.type === 'relationship');
      }
      
      async createRelationship(rel) { 
        const id = rel.id || Date.now().toString();
        const relationship = { ...rel, id, type: 'relationship' };
        this.data.set(`rel_${id}`, relationship);
        return relationship;
      }
      
      // Goal methods
      async getGoals(params = {}) { 
        return Array.from(this.data.values()).filter(item => item.type === 'goal');
      }
      
      async createGoal(goal) { 
        const id = goal.id || Date.now().toString();
        const g = { ...goal, id, type: 'goal', status: 'IN_PROGRESS' };
        this.data.set(`goal_${id}`, g);
        return g;
      }
      
      async updateGoal(goal) { 
        this.data.set(`goal_${goal.id}`, { ...goal, type: 'goal' });
        return goal;
      }
      
      async removeGoal(id) { 
        return this.data.delete(`goal_${id}`); 
      }
      
      // Room methods
      async getRoom(id) { 
        return this.data.get(`room_${id}`) || null; 
      }
      
      async createRoom(room) { 
        const id = room.id || Date.now().toString();
        const r = { ...room, id, type: 'room' };
        this.data.set(`room_${id}`, r);
        return r;
      }
      
      // Participant methods
      async getParticipantsForAccount(userId) { 
        return Array.from(this.data.values()).filter(item => 
          item.type === 'participant' && item.userId === userId
        );
      }
      
      async getParticipantUserState(roomId, userId) { 
        return this.data.get(`participant_${roomId}_${userId}`) || null; 
      }
      
      async setParticipantUserState(roomId, userId, state) { 
        const participantState = { 
          roomId, 
          userId, 
          ...state, 
          type: 'participant',
          updatedAt: Date.now()
        };
        this.data.set(`participant_${roomId}_${userId}`, participantState);
        return participantState;
      }
      
      // Embedding methods - Claude-friendly
      async getCachedEmbeddings(text) { 
        if (!text || typeof text !== 'string') return null;
        
        const cached = this.data.get(`embedding_${text.slice(0, 50)}`);
        if (cached) {
          console.log('✅ Found cached embedding');
          return cached.embeddings;
        }
        console.log('📝 No cached embedding found');
        return null; 
      }
      
      async setCachedEmbeddings(text, embeddings) { 
        if (!text || !embeddings) return false;
        
        const key = `embedding_${text.slice(0, 50)}`;
        this.data.set(key, { 
          text: text.slice(0, 100), 
          embeddings, 
          type: 'embedding',
          createdAt: Date.now() 
        });
        console.log('💾 Cached embeddings for text');
        return true; 
      }
      
      // Additional required methods
      async getAccountById(userId) { 
        return this.data.get(`account_${userId}`) || null; 
      }
      
      async createAccount(account) { 
        const id = account.id || account.userId || Date.now().toString();
        const acc = { ...account, id, type: 'account' };
        this.data.set(`account_${id}`, acc);
        return acc; 
      }
      
      async searchMemoriesByEmbedding(embedding, params = {}) { 
        // Simple implementation - return recent memories
        const memories = await this.getMemories(params);
        return memories.slice(0, params.count || 5);
      }
      
      async log(params) { 
        console.log('📝 Database log:', params.message || params);
        return true; 
      }
    }
    
    const databaseAdapter = new ClaudeCompatibleAdapter();
    console.log('✅ Claude-compatible DatabaseAdapter created');
    
    // Prepare plugins
    console.log('\n🔌 Preparing plugins...');
    const plugins = [];
    
    // Prioritize Twitter for posting
    try {
      const twitter = twitterPlugin.default || twitterPlugin;
      if (twitter) {
        plugins.push(twitter);
        console.log('✅ Twitter plugin added (primary)');
      }
    } catch (err) {
      console.log('⚠️ Twitter plugin failed:', err.message);
    }
    
    // Add market data plugins
    try {
      const coinmarket = coinmarketcapPlugin.default || coinmarketcapPlugin;
      if (coinmarket) {
        plugins.push(coinmarket);
        console.log('✅ CoinMarketCap plugin added');
      }
    } catch (err) {
      console.log('⚠️ CoinMarketCap plugin failed:', err.message);
    }
    
    try {
      const webSearch = webSearchPlugin.default || webSearchPlugin;
      if (webSearch) {
        plugins.push(webSearch);
        console.log('✅ Web search plugin added');
      }
    } catch (err) {
      console.log('⚠️ Web search plugin failed:', err.message);
    }
    
    console.log(`Total plugins loaded: ${plugins.length}`);
    
    // Create runtime config for Claude/Anthropic
    const runtimeConfig = {
      character: enhancedCharacter,
      modelProvider: modelProvider,
      token: apiKey,
      databaseAdapter: databaseAdapter,
      plugins: plugins
    };
    
    console.log('\n🤖 Creating AgentRuntime...');
    console.log('Config:', {
      hasCharacter: !!runtimeConfig.character,
      modelProvider: runtimeConfig.modelProvider,
      hasDatabase: !!runtimeConfig.databaseAdapter,
      hasToken: !!runtimeConfig.token,
      pluginCount: runtimeConfig.plugins.length
    });
    
    // Create runtime
    const runtime = new elizaCore.AgentRuntime(runtimeConfig);
    console.log('✅ AgentRuntime created with', modelProvider.toUpperCase());
    
    // Initialize runtime
    console.log('\n🔄 Initializing runtime...');
    console.log('🧠 Processing character knowledge with', modelProvider.toUpperCase(), '...');
    
    await runtime.initialize();
    console.log('✅ Runtime initialized successfully!');
    
    // Check what's available
    console.log('\n📊 Runtime Status:');
    console.log('- Character name:', runtime.character?.name);
    console.log('- Model provider:', runtime.modelProvider);
    console.log('- AI Model:', modelProvider === 'anthropic' ? 'Claude (Anthropic)' : 'GPT (OpenAI)');
    console.log('- Database adapter:', runtime.databaseAdapter?.constructor?.name);
    console.log('- Has clients:', !!runtime.clients);
    console.log('- Available clients:', runtime.clients ? Object.keys(runtime.clients) : 'none');
    
    if (runtime.clients?.twitter) {
      console.log('✅ Twitter client is available!');
    } else {
      console.log('⚠️ Twitter client not found');
    }
    
    console.log('\n🎉 DRAGONTRADE AGENT STARTED SUCCESSFULLY! 🐉🚀');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║          🐉 DRAGONTRADE IS LIVE! 🐉             ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║ 🤖 AI Model: ${modelProvider === 'anthropic' ? 'Claude (Anthropic)' : 'GPT (OpenAI)'}${''.padEnd(20 - (modelProvider === 'anthropic' ? 'Claude (Anthropic)' : 'GPT (OpenAI)').length)} ║`);
    console.log('║ 📱 Twitter: @reviceva                           ║');
    console.log('║ 🏷️  Branding: aideazz.xyz and $AZ               ║');
    console.log('║ ⏰ Posting: Every 90-180 minutes                ║');
    console.log('║ 💰 Cost: ~$5-15/month (vs Fleek $50+)          ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('⏰ Started at:', new Date().toISOString());
    
    // Enhanced monitoring
    let minutes = 0;
    setInterval(() => {
      minutes++;
      const timestamp = new Date().toISOString();
      
      if (minutes % 30 === 0) {
        console.log(`\n🎯 [${timestamp}] === DRAGONTRADE STATUS ===`);
        console.log(`🔄 Runtime: ${minutes} minutes ACTIVE`);
        console.log(`🤖 AI Model: ${modelProvider.toUpperCase()}`);
        console.log(`🐦 Twitter: ${runtime.clients?.twitter ? 'CONNECTED' : 'DISCONNECTED'}`);
        console.log(`💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        console.log(`🗄️  Database entries: ${runtime.databaseAdapter?.data?.size || 0}`);
        console.log(`⏰ Next post window: ${90 - (minutes % 90)}-${180 - (minutes % 180)} min`);
        console.log(`═══════════════════════════════════════════════`);
      } else {
        console.log(`[${timestamp}] 🐉 DragonTrade (${modelProvider.toUpperCase()}): ${minutes}min | Status: ACTIVE`);
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
    
    console.error('\n🔍 Debug Info:');
    console.error('- ANTHROPIC_API_KEY:', !!process.env.ANTHROPIC_API_KEY);
    console.error('- OPENAI_API_KEY fallback:', !!process.env.OPENAI_API_KEY);
    console.error('- TWITTER credentials:', !!process.env.TWITTER_USERNAME);
    console.error('- Character file:', fs.existsSync(characterPath));
    
    process.exit(1);
  }
}

console.log('🌟 Initializing DragonTrade Agent (Claude-Powered)...');
main().catch(err => {
  console.error('💥 Startup failed:', err);
  process.exit(1);
});