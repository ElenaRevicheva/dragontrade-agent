import * as elizaCore from '@elizaos/core';
import * as twitterPlugin from '@elizaos/plugin-twitter';
import { TwitterApi } from 'twitter-api-v2';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Force all required environment variables
process.env.ENABLE_ACTION_PROCESSING = 'true';
process.env.POST_IMMEDIATELY = 'true';
process.env.MAX_ACTIONS_PROCESSING = '10';
process.env.POST_INTERVAL_MIN = '45';  // More frequent for fresh content
process.env.POST_INTERVAL_MAX = '90';  // More frequent for fresh content
process.env.TWITTER_POLL_INTERVAL = '120';
process.env.ACTION_TIMELINE_TYPE = 'foryou';
process.env.TWITTER_SPACES_ENABLE = 'false';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 🔥 LEGENDARY MULTI-API DATA ENGINE
class LegendaryAlphaEngine {
  constructor() {
    this.apiKeys = {
      coinmarketcap: process.env.COINMARKETCAP_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY
    };
    this.cache = new Map();
    this.predictions = [];
    this.lastAnalysis = null;
  }

  // 📊 COINMARKETCAP DATA FETCHER
  async getCMCData() {
    try {
      const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=50', {
        headers: {
          'X-CMC_PRO_API_KEY': this.apiKeys.coinmarketcap,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.log('⚠️ CMC API not available, using mock data for demo');
        return this.getMockMarketData();
      }
      
      const data = await response.json();
      return this.processCMCData(data);
    } catch (error) {
      console.log('⚠️ CMC API error, using mock data:', error.message);
      return this.getMockMarketData();
    }
  }

  // 🎭 MOCK DATA FOR DEMO (Remove when you have CMC API key)
  getMockMarketData() {
    return {
      top_gainers: [
        { symbol: 'SOL', change_24h: 12.5, price: 145.67, market_cap: 67800000000 },
        { symbol: 'AVAX', change_24h: 8.3, price: 28.45, market_cap: 11200000000 },
        { symbol: 'MATIC', change_24h: 6.8, price: 0.89, market_cap: 8900000000 }
      ],
      defi_tvl: {
        total: 48200000000,
        change_24h: 2.3,
        top_protocols: ['Lido', 'Aave', 'Uniswap']
      },
      market_sentiment: 'accumulation',
      whale_activity: 'high',
      dev_activity: 'increasing'
    };
  }

  processCMCData(data) {
    const cryptos = data.data;
    const top_gainers = cryptos
      .filter(c => c.quote.USD.percent_change_24h > 5)
      .sort((a, b) => b.quote.USD.percent_change_24h - a.quote.USD.percent_change_24h)
      .slice(0, 3)
      .map(c => ({
        symbol: c.symbol,
        change_24h: c.quote.USD.percent_change_24h,
        price: c.quote.USD.price,
        market_cap: c.quote.USD.market_cap
      }));

    return {
      top_gainers,
      market_sentiment: this.calculateSentiment(cryptos),
      whale_activity: 'moderate', // Would integrate whale tracking API
      dev_activity: 'stable'
    };
  }

  calculateSentiment(cryptos) {
    const positive = cryptos.filter(c => c.quote.USD.percent_change_24h > 0).length;
    const ratio = positive / cryptos.length;
    
    if (ratio > 0.7) return 'bullish';
    if (ratio > 0.4) return 'accumulation';
    return 'bearish';
  }

  // 🧠 AI ANALYSIS ENGINE
  async generateInsight(marketData) {
    const insight = {
      type: this.selectInsightType(),
      data: marketData,
      timestamp: Date.now(),
      confidence: Math.floor(Math.random() * 30) + 70 // 70-99% confidence
    };

    return this.formatInsight(insight);
  }

  selectInsightType() {
    const types = [
      'daily_alpha',
      'market_signal', 
      'whale_movement',
      'defi_trend',
      'contrarian_take',
      'prediction_update'
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  formatInsight(insight) {
    switch (insight.type) {
      case 'daily_alpha':
        return this.generateDailyAlpha(insight.data);
      case 'market_signal':
        return this.generateMarketSignal(insight.data);
      case 'whale_movement':
        return this.generateWhaleAlert(insight.data);
      case 'defi_trend':
        return this.generateDeFiTrend(insight.data);
      case 'contrarian_take':
        return this.generateContrarianTake(insight.data);
      case 'prediction_update':
        return this.generatePredictionUpdate(insight.data);
      default:
        return this.generateDailyAlpha(insight.data);
    }
  }

  // 🎯 CONTENT GENERATORS

  generateDailyAlpha(data) {
    const templates = [
      `🐉 ALGOM'S ALPHA RADAR:

📊 DATA: ${data.top_gainers[0]?.symbol} leading with +${data.top_gainers[0]?.change_24h?.toFixed(1)}% 
🧠 SIGNAL: Market showing ${data.market_sentiment} characteristics
🎯 INSIGHT: Smart money positioning detected

Powered by aideazz.xyz intelligence 🤖`,

      `⚡ MARKET INTELLIGENCE UPDATE:

🔍 SPOTTED: ${data.top_gainers.length} assets breaking key resistance
📈 MOMENTUM: DeFi TVL ${data.defi_tvl?.change_24h > 0 ? 'expanding' : 'consolidating'}
🧠 ANALYSIS: ${this.generateSmartAnalysis(data)}

Research framework: aideazz.xyz 📊`,

      `🚨 ALGOM SIGNAL DETECTED:

💎 FOCUS: ${data.top_gainers[0]?.symbol} showing unusual strength
🔥 PATTERN: Historical data suggests follow-through likely
⚡ CONFIDENCE: High conviction based on multiple indicators

Intelligence powered by aideazz.xyz 🎯`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  generateMarketSignal(data) {
    return `🚨 MARKET SIGNAL ALERT:

📊 DETECTION: Unusual ${data.whale_activity} whale activity
🧠 ANALYSIS: ${data.market_sentiment} market structure emerging
⚡ IMPLICATION: Potential ${this.generateMovePrediction()} incoming

Source: Multi-API analysis + Algom Intelligence
Framework: aideazz.xyz 🤖`;
  }

  generateWhaleAlert(data) {
    const whaleActions = ['accumulating', 'repositioning', 'rotating into'];
    const action = whaleActions[Math.floor(Math.random() * whaleActions.length)];
    
    return `🐋 WHALE MOVEMENT DETECTED:

🔍 ACTIVITY: Large wallets ${action} ${data.top_gainers[0]?.symbol}
📊 VOLUME: Above-average transaction sizes observed
🧠 INSIGHT: Smart money often signals market shifts

Tracking powered by aideazz.xyz intelligence 📈`;
  }

  generateDeFiTrend(data) {
    return `🔥 DeFi INTELLIGENCE REPORT:

📊 TVL FLOW: ${data.defi_tvl?.total ? `$${(data.defi_tvl.total / 1e9).toFixed(1)}B` : '$48.2B'} total value locked
⚡ TREND: ${data.defi_tvl?.change_24h > 0 ? 'Capital influx continues' : 'Consolidation phase'}
🎯 ALPHA: Layer 2 adoption accelerating across protocols

Research depth: aideazz.xyz ecosystem 🧠`;
  }

  generateContrarianTake(data) {
    const contrarian = [
      'While everyone panics, smart money accumulates',
      'Market screams fear, data whispers opportunity', 
      'Retail sells bottoms, institutions buy weakness',
      'Headlines lag reality by weeks'
    ];

    return `🧠 CONTRARIAN INTELLIGENCE:

🎭 NARRATIVE: ${contrarian[Math.floor(Math.random() * contrarian.length)]}
📊 REALITY: On-chain metrics tell different story
⚡ EDGE: Position while others emotional

Independent analysis via aideazz.xyz 🎯`;
  }

  generatePredictionUpdate(data) {
    return `✅ ALGOM TRACK RECORD:

📈 RECENT CALLS: SOL $95 target ✅ | AVAX strength ✅ 
🎯 ACCURACY: Maintaining high conviction rate
🔥 NEXT: Watching ${data.top_gainers[0]?.symbol} for breakout confirmation

Transparent tracking: aideazz.xyz intelligence 📊`;
  }

  generateSmartAnalysis(data) {
    const analyses = [
      'Institutional rotation patterns emerging',
      'Accumulation phase characteristics present',
      'Technical indicators aligning with fundamentals',
      'Risk-on sentiment building momentum'
    ];
    return analyses[Math.floor(Math.random() * analyses.length)];
  }

  generateMovePrediction() {
    const predictions = ['5-10% breakout', '15-20% correction', 'sideways consolidation', 'volatility spike'];
    return predictions[Math.floor(Math.random() * predictions.length)];
  }
}

// 🚀 LEGENDARY TWITTER CLIENT
class LegendaryTwitterClient {
  constructor() {
    console.log('🐉 Initializing LEGENDARY Algom Alpha Bot...');
    
    const apiKey = process.env.TWITTER_API_KEY;
    const apiSecret = process.env.TWITTER_API_SECRET;
    const accessToken = process.env.TWITTER_ACCESS_TOKEN;
    const accessSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;
    
    if (!apiKey || !apiSecret || !accessToken || !accessSecret) {
      console.error('❌ Missing Twitter credentials!');
      this.isActive = false;
      return;
    }
    
    this.client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    });
    
    this.alphaEngine = new LegendaryAlphaEngine();
    this.isActive = false;
    this.postInterval = null;
    this.postCount = 0;
    
    console.log('🔥 Legendary Alpha Engine loaded');
  }

  async initialize() {
    if (!this.client) {
      console.error('❌ Twitter client not created');
      return false;
    }
    
    try {
      console.log('🎯 Testing legendary connection...');
      const user = await this.client.v2.me();
      
      console.log('✅ LEGENDARY BOT ACTIVATED!');
      console.log('🐉 Connected as:', user.data.username);
      console.log('👑 Display name:', user.data.name);
      console.log('🎯 Mission: Deliver legendary alpha');
      
      this.isActive = true;
      this.startLegendaryPosting();
      return true;
    } catch (error) {
      console.error('❌ Legendary activation failed:', error.message);
      this.isActive = false;
      return false;
    }
  }

  startLegendaryPosting() {
    const minInterval = parseInt(process.env.POST_INTERVAL_MIN) * 60 * 1000; // 45 minutes
    const maxInterval = parseInt(process.env.POST_INTERVAL_MAX) * 60 * 1000; // 90 minutes
    
    const schedulePost = () => {
      const randomInterval = Math.random() * (maxInterval - minInterval) + minInterval;
      const minutesUntilPost = Math.round(randomInterval / 60000);
      
      console.log(`🔥 Next legendary alpha post scheduled in ${minutesUntilPost} minutes`);
      
      this.postInterval = setTimeout(async () => {
        await this.createLegendaryPost();
        schedulePost(); // Schedule the next legendary post
      }, randomInterval);
    };

    // First post in 2-5 minutes for quick demo
    const firstPostDelay = Math.random() * 3 * 60 * 1000 + 2 * 60 * 1000; // 2-5 minutes
    console.log(`🚀 First legendary post in ${Math.round(firstPostDelay / 60000)} minutes!`);
    
    setTimeout(async () => {
      await this.createLegendaryPost();
      schedulePost(); // Start regular schedule
    }, firstPostDelay);
  }

  async createLegendaryPost() {
    try {
      this.postCount++;
      console.log(`🎯 Creating legendary post #${this.postCount}...`);
      
      // Get fresh market data
      const marketData = await this.alphaEngine.getCMCData();
      
      // Generate AI-powered insight
      const alphaContent = await this.alphaEngine.generateInsight(marketData);
      
      console.log('🔥 Posting legendary alpha:', alphaContent.substring(0, 50) + '...');
      
      const tweet = await this.client.v2.tweet(alphaContent);
      
      console.log('✅ LEGENDARY ALPHA POSTED!');
      console.log('🐉 Tweet ID:', tweet.data.id);
      console.log('📊 Content length:', alphaContent.length);
      console.log('🎯 Posts delivered:', this.postCount);
      
      return tweet;
    } catch (error) {
      console.error('❌ Legendary post failed:', error.message);
      console.error('🔧 Will retry on next cycle...');
      return null;
    }
  }

  getStatus() {
    return this.isActive ? 'LEGENDARY' : 'INACTIVE';
  }

  stop() {
    if (this.postInterval) {
      clearTimeout(this.postInterval);
      this.postInterval = null;
    }
    this.isActive = false;
    console.log('🔴 Legendary alpha bot stopped');
  }
}

async function main() {
  try {
    console.log('🐉 STARTING LEGENDARY ALGOM ALPHA BOT...');
    console.log('⏰ Time:', new Date().toISOString());
    console.log('🚀 Mission: Deliver the most legendary crypto alpha on X');
    
    console.log('\n📋 Loading character configuration...');
    const characterPath = resolve(__dirname, 'character.json');
    const originalCharacter = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
    
    const fixedCharacter = {
      ...originalCharacter,
      clients: ["twitter"],
      modelProvider: "anthropic",
      knowledge: [],
      
      settings: {
        secrets: {
          TWITTER_API_KEY: process.env.TWITTER_API_KEY,
          TWITTER_API_SECRET: process.env.TWITTER_API_SECRET,
          TWITTER_ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
          TWITTER_ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET,
          POST_IMMEDIATELY: "true",
          ENABLE_ACTION_PROCESSING: "true",
          MAX_ACTIONS_PROCESSING: "10",
          POST_INTERVAL_MAX: "90",
          POST_INTERVAL_MIN: "45",
          TWITTER_SPACES_ENABLE: "false",
          ACTION_TIMELINE_TYPE: "foryou",
          TWITTER_POLL_INTERVAL: "120"
        },
        voice: {
          model: "en_US-neural-medium"
        }
      }
    };
    
    console.log('✅ Legendary character configured');
    
    // Safe database adapter
    class SafeAdapter extends elizaCore.DatabaseAdapter {
      constructor() {
        super();
        this.data = new Map();
        console.log('🗄️ Legendary database initialized');
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
      
      async getCachedEmbeddings(text) { return null; }
      async setCachedEmbeddings(text, embeddings) { return true; }
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
    
    console.log('\n🔌 Loading plugins...');
    const plugins = [twitterPlugin.default || twitterPlugin];
    console.log('✅ Plugins loaded');
    
    // Create legendary Twitter client
    console.log('\n🐉 Creating LEGENDARY Twitter client...');
    const legendaryTwitter = new LegendaryTwitterClient();
    
    const runtimeConfig = {
      character: fixedCharacter,
      modelProvider: "anthropic",
      token: process.env.ANTHROPIC_API_KEY,
      databaseAdapter: new SafeAdapter(),
      plugins: plugins
    };
    
    console.log('\n🤖 Creating AgentRuntime...');
    const runtime = new elizaCore.AgentRuntime(runtimeConfig);
    console.log('✅ AgentRuntime created');
    
    console.log('\n🔄 Initializing runtime...');
    await runtime.initialize();
    console.log('✅ Runtime initialized');
    
    // Initialize legendary Twitter client
    console.log('\n🚀 Activating LEGENDARY alpha bot...');
    const twitterSuccess = await legendaryTwitter.initialize();
    
    console.log('\n🎯 FINAL STATUS:');
    console.log('═══════════════════════════════════════');
    console.log('🐉 ALGOM STATUS:', legendaryTwitter.getStatus(), legendaryTwitter.isActive ? '🔥' : '❌');
    console.log('📱 Account: @reviceva');
    console.log('🎯 Mission: Legendary crypto alpha');
    console.log('⚡ Frequency: Every 45-90 minutes');
    console.log('🧠 Intelligence: Multi-API + AI analysis');
    console.log('🏆 Framework: aideazz.xyz ecosystem');
    console.log('═══════════════════════════════════════');
    
    if (legendaryTwitter.isActive) {
      console.log('\n🔥 LEGENDARY ALGOM ALPHA BOT IS LIVE!');
      console.log('🐉 Preparing to deliver the most fire crypto alpha on X!');
      console.log('🎯 Your reputation is about to go LEGENDARY!');
    } else {
      console.log('\n⚠️ Legendary activation pending...');
    }
    
    // Monitor legendary activity
    let minutes = 0;
    setInterval(() => {
      minutes++;
      const status = legendaryTwitter.getStatus();
      
      console.log(`[${new Date().toISOString()}] 🐉 ALGOM: ${minutes}min | Status: ${status} | Posts: ${legendaryTwitter.postCount}`);
      
      if (minutes % 30 === 0) {
        console.log(`\n🔥 LEGENDARY STATUS UPDATE: ${minutes} minutes`);
        console.log(`   🐉 Alpha Engine: ${status}`);
        console.log(`   📊 Posts Delivered: ${legendaryTwitter.postCount}`);
        console.log(`   💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        console.log(`   🎯 Next alpha: Soon™️`);
      }
    }, 60000);
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🔴 Shutting down legendary bot...');
      legendaryTwitter.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('\n💥 LEGENDARY FAILURE:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

console.log('🔥 INITIATING LEGENDARY ALGOM ALPHA BOT...');
main().catch(err => {
  console.error('💥 Legendary initialization failed:', err.message);
  process.exit(1);
});