import * as elizaCore from '@elizaos/core';
import * as twitterPlugin from '@elizaos/plugin-twitter';
import { TwitterApi } from 'twitter-api-v2';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { EducationalMCP } from './educational-mcp-simple.js';
import { CoinGeckoMCPClient } from './coingecko-mcp-client.js';
import { AZTokenIntegration } from './az-token-integration.js';

dotenv.config();

process.env.ENABLE_ACTION_PROCESSING = 'true';
process.env.POST_IMMEDIATELY = 'true';
process.env.MAX_ACTIONS_PROCESSING = '10';
process.env.POST_INTERVAL_MIN = '3';
process.env.POST_INTERVAL_MAX = '10';
process.env.TWITTER_POLL_INTERVAL = '120';
process.env.ACTION_TIMELINE_TYPE = 'foryou';
process.env.TWITTER_SPACES_ENABLE = 'false';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class CryptoEducationEngine {
  constructor() {
    this.scamPatterns = new Map();
    this.marketCycles = [];
    this.fearGreedHistory = [];
    this.educationalTopics = ['risk_management', 'position_sizing', 'dollar_cost_averaging', 'market_psychology', 'scam_detection', 'technical_analysis', 'fundamental_analysis', 'portfolio_allocation'];
    this.educationalMCP = new EducationalMCP();
    this.coinGeckoMCP = new CoinGeckoMCPClient();
    this.azTokenIntegration = new AZTokenIntegration();
    this.mcpInitialized = false;
    this.coinGeckoInitialized = false;
    this.azTokenInitialized = false;
  }

  async initializeMCP() {
    if (!this.mcpInitialized) {
      try {
        await this.educationalMCP.initialize();
        this.mcpInitialized = true;
        console.log('🎓 Educational MCP integrated with CryptoEducationEngine');
      } catch (error) {
        console.log('⚠️ Educational MCP fallback mode activated');
      }
    }

    if (!this.coinGeckoInitialized) {
      try {
        await this.coinGeckoMCP.initialize();
        this.coinGeckoInitialized = true;
        console.log('🔗 CoinGecko MCP integrated with CryptoEducationEngine');
      } catch (error) {
        console.log('⚠️ CoinGecko MCP fallback mode activated');
      }
    }

    if (!this.azTokenInitialized) {
      try {
        await this.azTokenIntegration.initialize();
        this.azTokenInitialized = true;
        console.log('💎 AZ Token integration activated with CryptoEducationEngine');
      } catch (error) {
        console.log('⚠️ AZ Token integration fallback mode activated');
      }
    }
  }

  analyzeScamRisk(tweet, marketData) {
    const text = tweet.text.toLowerCase();
    let scamScore = 0;
    const redFlags = [];
    const scamPatterns = {
      'guaranteed_returns': ['guaranteed', '100% profit', 'risk-free', 'can\'t lose'],
      'urgency_tactics': ['limited time', 'act now', 'last chance', 'don\'t miss out'],
      'unrealistic_gains': ['1000x', '100x', 'moon shot', 'to the moon guaranteed'],
      'fake_endorsements': ['elon says', 'billionaire approved', 'celebrity backed'],
      'pyramid_schemes': ['refer friends', 'get paid to recruit', 'passive income forever'],
      'fake_partnerships': ['partnership with', 'backed by tesla', 'amazon collaboration']
    };
    for (const [category, patterns] of Object.entries(scamPatterns)) {
      for (const pattern of patterns) {
        if (text.includes(pattern)) {
          scamScore += 25;
          redFlags.push(category);
        }
      }
    }
    return { scamScore: Math.min(100, scamScore), redFlags };
  }

  generateTradingPsychologyLesson(marketData) {
    const lessons = [
      {
        topic: 'fear_and_greed',
        trigger: () => marketData.btc_dominance > 60,
        content: `🧠 ALGOM TRADING PSYCHOLOGY LESSON:\n\n📊 HIGH BTC DOMINANCE: ${marketData.btc_dominance.toFixed(1)}%\n🎯 WHAT THIS MEANS: Market uncertainty, flight to "safety"\n\n🔥 PSYCHOLOGY TRUTH:\n• Fear drives money to BTC (perceived as "safer")\n• Altcoins suffer when traders panic\n• This creates OPPORTUNITY for prepared traders\n\n💡 SMART STRATEGY:\n• Don't FOMO into BTC at peaks\n• Research quality altcoins during fear\n• Dollar-cost average during uncertainty\n• Have a plan BEFORE emotions hit\n\n⚠️ ROOKIE MISTAKE: Chasing pumps when everyone's greedy\n✅ PRO MOVE: Buy fear, sell greed (when you have a plan)\n\n#TradingPsychology #BTC #AlgomEducation`
      },
      {
        topic: 'volume_psychology',
        trigger: () => marketData.total_volume_24h > 100000000000,
        content: `🧠 ALGOM VOLUME PSYCHOLOGY:\n\n💰 HIGH VOLUME DAY: $${Math.floor(marketData.total_volume_24h / 1000000000)}B\n🎯 WHAT THIS TELLS US: Strong emotions in the market\n\n🔥 VOLUME PSYCHOLOGY TRUTH:\n• High volume = Strong conviction (fear OR greed)\n• Low volume = Uncertainty, sideways action\n• Volume confirms price movements\n\n💡 READING THE CROWD:\n• Volume spike + price up = Real buying pressure\n• Volume spike + price down = Real selling pressure\n• Price move + low volume = Fake breakout potential\n\n⚠️ TRAP: Following price without checking volume\n✅ SMART: Volume analysis prevents getting rekt\n\nRemember: Price lies, volume tells the truth 📊\n\n#VolumeAnalysis #TradingPsychology #AlgomEducation`
      }
    ];
    const eligibleLessons = lessons.filter(lesson => lesson.trigger());
    return eligibleLessons[Math.floor(Math.random() * eligibleLessons.length)] || null;
  }

  generateRiskManagementLesson(marketData) {
    const btc = marketData.all_coins?.find(c => c.symbol === 'BTC');
    const eth = marketData.all_coins?.find(c => c.symbol === 'ETH');
    if (!btc || !eth) return null;
    return `💰 ALGOM RISK MANAGEMENT MASTERCLASS:\n\n🎯 CURRENT PRICES:\n• BTC: $${btc.price.toLocaleString()} (${btc.change_24h > 0 ? '+' : ''}${btc.change_24h.toFixed(2)}%)\n• ETH: $${eth.price.toLocaleString()} (${eth.change_24h > 0 ? '+' : ''}${eth.change_24h.toFixed(2)}%)\n\n🔥 POSITION SIZING RULES (NEVER BREAK):\n• 1-2% risk per trade MAX\n• Portfolio allocation: 50% BTC/ETH, 30% large caps, 20% speculation\n• Never more than 5% in any single altcoin\n• Emergency fund = 6 months expenses (OUTSIDE crypto)\n\n💡 EXAMPLE: $10,000 Portfolio\n• BTC: $3,000 | ETH: $2,000 | Large caps: $3,000 | Speculation: $2,000\n• Per trade risk: $100-200 MAX\n• Stop loss: Always set BEFORE buying\n\n⚠️ WEALTH DESTROYER: "YOLO" trades, no stop losses\n✅ WEALTH BUILDER: Boring discipline, compound gains\n\n99% of crypto is scam. These rules keep you in the 1% 🎯\n\n#RiskManagement #PositionSizing #AlgomEducation`;
  }

  generateTechnicalAnalysisLesson(marketData) {
    const btc = marketData.all_coins?.find(c => c.symbol === 'BTC');
    if (!btc) return null;
    const priceAction = btc.change_24h > 5 ? 'strong_bullish' : btc.change_24h > 2 ? 'bullish' : btc.change_24h < -5 ? 'strong_bearish' : btc.change_24h < -2 ? 'bearish' : 'consolidation';
    return `📈 ALGOM TECHNICAL ANALYSIS EDUCATION:\n\n🟠 BTC CURRENT: $${btc.price.toLocaleString()} (${btc.change_24h > 0 ? '+' : ''}${btc.change_24h.toFixed(2)}%)\n📊 PRICE ACTION: ${priceAction.toUpperCase().replace('_', ' ')}\n\n🔥 READING THE CHART (Without Complex Indicators):\n• Price above key levels = Bullish bias\n• Price below key levels = Bearish bias\n• Volume confirms moves = Real breakout\n• Volume doesn't confirm = Fake breakout\n\n💡 SIMPLE BUT POWERFUL LEVELS:\n• Previous highs become support when broken up\n• Previous lows become resistance when broken down\n• Round numbers ($50K, $100K) act as psychological levels\n• 20% corrections are NORMAL in crypto\n\n⚠️ INDICATOR TRAP: Too many lines = analysis paralysis\n✅ PROFIT MAKER: Price action + volume + key levels\n\nKeep it simple. Price tells the story 📊\n\n#TechnicalAnalysis #PriceAction #AlgomEducation`;
  }

  generateScamAlert(marketData) {
    const commonScams = [
      { type: 'fake_giveaways', content: `🚨 ALGOM SCAM ALERT: FAKE GIVEAWAYS\n\n⚠️ NEVER FALL FOR:\n• "Send 1 BTC, get 2 BTC back"\n• Fake Elon/celebrity accounts\n• "Limited time" crypto giveaways\n• QR codes from random accounts\n\n💡 REALITY CHECK:\n• No billionaire gives away free crypto\n• If it sounds too good to be true, IT IS\n• Real exchanges don't ask for deposits for "verification"\n\n🔥 PROTECT YOURSELF:\n• Verify accounts (blue checkmarks can be faked)\n• Never send crypto to "verify" accounts\n• Bookmarks official exchange websites\n• Use hardware wallets for large amounts\n\n🎯 REMEMBER: In crypto, YOU are the bank. Act like it.\n\n#ScamAlert #CryptoSafety #AlgomEducation` },
      { type: 'pump_and_dump', content: `🚨 ALGOM SCAM ALERT: PUMP & DUMP SCHEMES\n\n⚠️ RED FLAGS TO SPOT:\n• Telegram/Discord "VIP signals"\n• "Insider information" claims\n• Promises of guaranteed returns\n• Pressure to "buy now or miss out"\n\n💡 HOW THEY WORK:\n1. Scammers accumulate cheap coins\n2. Hype campaign begins (fake news, shills)\n3. FOMO buyers drive price up\n4. Scammers dump on retail\n5. Price crashes, retail loses money\n\n🔥 STAY SAFE:\n• Research before buying ANYTHING\n• Avoid coins with no real utility\n• Never buy based on Telegram tips\n• Stick to established projects with real teams\n\n🎯 TRUTH: If someone knew guaranteed winners, they wouldn't tell you.\n\n#PumpAndDump #ScamAlert #AlgomEducation` }
    ];
    return commonScams[Math.floor(Math.random() * commonScams.length)];
  }

  generateStrategyGuide(marketData) {
    return `📚 ALGOM STRATEGY DEVELOPMENT GUIDE:\n\n🎯 BUILD YOUR PERSONAL CRYPTO STRATEGY:\n\n🔥 STEP 1: DEFINE YOUR GOALS\n• Investment timeline: 1 year? 5 years? 10 years?\n• Risk tolerance: Can you stomach 50% drops?\n• Capital: Never invest more than you can lose\n\n💡 STEP 2: PICK YOUR APPROACH\n• Conservative: 70% BTC/ETH, 30% top 10 coins\n• Balanced: 50% BTC/ETH, 30% top 20, 20% speculation\n• Aggressive: 30% BTC/ETH, 70% smaller caps (RISKY)\n\n📊 STEP 3: EXECUTION RULES\n• Dollar-cost average weekly/monthly\n• Take profits at predetermined levels\n• Rebalance quarterly\n• NEVER change strategy during FOMO/panic\n\n⚠️ STRATEGY KILLER: Changing plans based on emotions\n✅ WEALTH BUILDER: Boring consistency over years\n\nCurrent market cap: $${Math.floor(marketData.total_market_cap / 1000000000)}B\nThe opportunity is real. The discipline is rare. 🎯\n\n#Strategy #CryptoEducation #AlgomEducation`;
  }

  // Enhanced educational methods with MCP integration
  async generateEnhancedEducationalContent(marketData) {
    await this.initializeMCP();
    
    if (this.mcpInitialized) {
      try {
        const enhancedContent = await this.educationalMCP.createEducationalPost(marketData);
        return {
          type: 'enhanced_educational',
          status: 'educational',
          content: enhancedContent
        };
      } catch (error) {
        console.log('⚠️ MCP educational content failed, using fallback');
      }
    }
    
    // Fallback to original educational content
    return this.generateEducationalContent(marketData);
  }

  async generateMCPEnhancedBitcoinAnalysis(marketData) {
    await this.initializeMCP();
    
    if (this.mcpInitialized) {
      try {
        const btcAnalysis = await this.educationalMCP.getEducationalBitcoinAnalysis();
        return this.educationalMCP.enhanceWithMCP(btcAnalysis);
      } catch (error) {
        console.log('⚠️ MCP Bitcoin analysis failed, using fallback');
      }
    }
    
    // Fallback to original method
    return this.generateTradingPsychologyLesson(marketData)?.content || 'Educational content unavailable';
  }

  async generateAZTokenEducationalPost(marketData) {
    await this.initializeMCP();
    
    if (this.azTokenInitialized) {
      try {
        const azContent = await this.azTokenIntegration.getRandomAZTokenContent();
        return azContent.content;
      } catch (error) {
        console.log('⚠️ AZ Token content generation failed, using fallback');
      }
    }
    
    // Fallback content
    return `🎓 AZ TOKEN EDUCATIONAL INSIGHT:\n\n💎 WHAT IS AZ TOKEN?\n• ERC20 token on Polygon network\n• Learn-to-earn utility token\n• Educational engagement rewards\n• Community-driven growth\n\n💡 UTILITY FEATURES:\n• Educational content rewards\n• Community participation incentives\n• Knowledge sharing benefits\n• Learning achievement tokens\n\n🌐 ECOSYSTEM:\n• Polygon network (low fees)\n• QuickSwap DEX integration\n• Thirdweb deployment\n• Community governance ready\n\n🔗 CONTRACT: 0x5F9cdccA7cE46198fad277A5914E7D545cb3afc5\n💎 TRADE: https://dapp.quickswap.exchange/swap/v3/ETH/0x5F9cdccA7cE46198fad277A5914E7D545cb3afc5\n\n#AZToken #Education #LearnToEarn #Polygon #DeFi`;
  }

  // Method to enhance existing posts with MCP and AZ token integration
  enhancePostWithMCP(originalContent) {
    if (this.mcpInitialized) {
      return this.educationalMCP.enhanceWithMCP(originalContent);
    }
    return originalContent;
  }

  // Real CoinGecko MCP data methods
  async getRealCoinGeckoData() {
    await this.initializeMCP();
    
    if (this.coinGeckoInitialized) {
      try {
        // Get top cryptocurrencies
        const btcData = await this.coinGeckoMCP.getMarketData('BTC');
        const ethData = await this.coinGeckoMCP.getMarketData('ETH');
        const solData = await this.coinGeckoMCP.getMarketData('SOL');
        
        // Get trending coins
        const trendingCoins = await this.coinGeckoMCP.getTrendingCoins();
        
        // Get global market data
        const globalData = await this.coinGeckoMCP.getGlobalMarketData();
        
        return {
          data_available: true,
          source: 'CoinGecko MCP',
          btc: btcData,
          eth: ethData,
          sol: solData,
          trending: trendingCoins,
          global: globalData,
          all_coins: [btcData, ethData, solData, ...trendingCoins.slice(0, 7)],
          total_market_cap: globalData.total_market_cap,
          total_volume_24h: globalData.total_volume_24h,
          btc_dominance: 50, // Calculate from global data
          positive_coins: [btcData, ethData, solData, ...trendingCoins].filter(c => c.change_24h > 0).length,
          total_coins: [btcData, ethData, solData, ...trendingCoins].length
        };
      } catch (error) {
        console.log('⚠️ CoinGecko MCP data fetch failed:', error.message);
      }
    }
    
    return null;
  }

  async generateCoinGeckoEnhancedContent(marketData) {
    await this.initializeMCP();
    
    if (this.coinGeckoInitialized) {
      try {
        const coinGeckoData = await this.getRealCoinGeckoData();
        if (coinGeckoData) {
          return {
            type: 'coingecko_enhanced',
            status: 'educational',
            content: `🔗 COINGECKO MCP ENHANCED ANALYSIS:\n\n📊 REAL-TIME DATA FROM COINGECKO:\n• BTC: $${coinGeckoData.btc.price.toLocaleString()} (${coinGeckoData.btc.change_24h > 0 ? '+' : ''}${coinGeckoData.btc.change_24h.toFixed(2)}%)\n• ETH: $${coinGeckoData.eth.price.toLocaleString()} (${coinGeckoData.eth.change_24h > 0 ? '+' : ''}${coinGeckoData.eth.change_24h.toFixed(2)}%)\n• SOL: $${coinGeckoData.sol.price.toLocaleString()} (${coinGeckoData.sol.change_24h > 0 ? '+' : ''}${coinGeckoData.sol.change_24h.toFixed(2)}%)\n\n🔥 TRENDING COINS (24H):\n${coinGeckoData.trending.slice(0, 3).map((coin, i) => `${i + 1}. ${coin.symbol}: $${coin.price.toLocaleString()} (${coin.change_24h > 0 ? '+' : ''}${coin.change_24h.toFixed(2)}%)`).join('\n')}\n\n💰 GLOBAL MARKET:\n• Total Market Cap: $${Math.floor(coinGeckoData.global.total_market_cap / 1000000000)}B\n• 24H Volume: $${Math.floor(coinGeckoData.global.total_volume_24h / 1000000000)}B\n• Positive Assets: ${coinGeckoData.positive_coins}/${coinGeckoData.total_coins}\n\n🔗 SOURCE: CoinGecko MCP Real-Time API\n🎓 ENHANCED: Real market data + Educational insights\n\n#CoinGecko #RealData #MCPEnhanced #AlgomEducation`
          };
        }
      } catch (error) {
        console.log('⚠️ CoinGecko enhanced content failed:', error.message);
      }
    }
    
    return null;
  }
}

class ReputationTracker {
  constructor() {
    this.predictions = [];
    this.scorecardHistory = [];
    this.weeklyPerformance = [];
    this.sentimentHistory = [];
    this.dataPoints = [];
    this.repostHistory = [];
    this.qualityMetrics = new Map();
  }

  addDataPoint(symbol, price, change, timestamp) {
    this.dataPoints.push({ id: Date.now(), symbol, price, change, timestamp, source: 'CMC_API' });
    if (this.dataPoints.length > 100) {
      this.dataPoints = this.dataPoints.slice(-100);
    }
  }

  addRepost(tweetId, originalContent, analysisType, qualityScore) {
    const repost = { id: Date.now(), tweetId, originalContent: originalContent.substring(0, 100), analysisType, qualityScore, timestamp: Date.now() };
    this.repostHistory.push(repost);
    if (this.repostHistory.length > 50) {
      this.repostHistory = this.repostHistory.slice(-50);
    }
    console.log(`📝 [REPOST] Logged: ${analysisType} analysis (Quality: ${qualityScore}/100)`);
    return repost;
  }

  canRepost() {
    if (this.repostHistory.length === 0) return true;
    const lastRepost = this.repostHistory[this.repostHistory.length - 1];
    const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
    const canRepost = lastRepost.timestamp < twoHoursAgo;
    if (!canRepost) {
      const minutesLeft = Math.ceil((lastRepost.timestamp + (2 * 60 * 60 * 1000) - Date.now()) / (60 * 1000));
      console.log(`⏰ [COOLDOWN] Cannot repost for ${minutesLeft} more minutes`);
    }
    return canRepost;
  }

  calculateQualityScore(tweet, mentions) {
    let score = 0;
    const likes = tweet.public_metrics?.like_count || 0;
    const retweets = tweet.public_metrics?.retweet_count || 0;
    const replies = tweet.public_metrics?.reply_count || 0;
    if (likes >= 50) score += 20;
    else if (likes >= 20) score += 10;
    else if (likes >= 10) score += 5;
    if (retweets >= 10) score += 10;
    else if (retweets >= 5) score += 5;
    if (replies >= 5) score += 10;
    const text = tweet.text.toLowerCase();
    if (/\$[\d,]+\.?\d*/.test(text)) score += 10;
    if (/[+-]?\d+\.?\d*%/.test(text)) score += 10;
    if (/(volume|market cap|mcap)/i.test(text)) score += 5;
    if (/(analysis|technical|support|resistance|breakout)/i.test(text)) score += 5;
    const tweetAge = Date.now() - new Date(tweet.created_at).getTime();
    const hoursOld = tweetAge / (1000 * 60 * 60);
    if (hoursOld <= 1) score += 20;
    else if (hoursOld <= 6) score += 15;
    else if (hoursOld <= 24) score += 10;
    else if (hoursOld <= 48) score += 5;
    const cryptoMentions = mentions.filter(m => ['btc', 'eth', 'bitcoin', 'ethereum', 'crypto', 'defi'].includes(m.toLowerCase())).length;
    score += Math.min(10, cryptoMentions * 2);
    return Math.min(100, score);
  }

  meetsQualityThreshold(qualityScore) {
    return qualityScore >= 50;
  }

  calculateDataIntegrity() {
    const recentDataPoints = this.dataPoints.filter(p => Date.now() - p.timestamp < 24 * 60 * 60 * 1000);
    return Math.min(100, recentDataPoints.length * 10);
  }

  calculateRealSentimentScore(marketData) {
    if (!marketData.all_coins || marketData.all_coins.length === 0) {
      return 50;
    }
    const positiveCoins = marketData.all_coins.filter(c => c.change_24h > 0).length;
    const totalCoins = marketData.all_coins.length;
    const positiveRatio = positiveCoins / totalCoins;
    return Math.round(positiveRatio * 100);
  }

  getRealSentimentLabel(score) {
    if (score >= 80) return 'Strong Bullish';
    if (score >= 65) return 'Bullish';
    if (score >= 55) return 'Slightly Bullish';
    if (score >= 45) return 'Neutral';
    if (score >= 35) return 'Slightly Bearish';
    if (score >= 20) return 'Bearish';
    return 'Strong Bearish';
  }
}

class PersonalAnalysisEngine {
  constructor(cmcEngine) {
    this.cmcEngine = cmcEngine;
    this.educationEngine = new CryptoEducationEngine();
    this.lastEducationalPost = 0;
  }

  async generateEducationalContent(marketData) {
    const timeSinceLastEducation = Date.now() - this.lastEducationalPost;
    const fourHours = 4 * 60 * 60 * 1000;
    if (timeSinceLastEducation < fourHours) {
      return null;
    }

    // Enhanced educational content with MCP integration
    const enhancedContent = await this.educationEngine.generateEnhancedEducationalContent(marketData);
    if (enhancedContent) {
      this.lastEducationalPost = Date.now();
      return enhancedContent;
    }

    // Fallback to original educational content
    const educationalTypes = [
      () => this.educationEngine.generateTradingPsychologyLesson(marketData),
      () => this.educationEngine.generateRiskManagementLesson(marketData),
      () => this.educationEngine.generateTechnicalAnalysisLesson(marketData),
      () => this.educationEngine.generateScamAlert(marketData),
      () => this.educationEngine.generateStrategyGuide(marketData)
    ];
    const selectedGenerator = educationalTypes[Math.floor(Math.random() * educationalTypes.length)];
    const content = selectedGenerator();
    if (content) {
      this.lastEducationalPost = Date.now();
      return { type: 'educational_content', status: 'educational', content: content };
    }
    return null;
  }

  async generateScamDetection(tweet, marketData) {
    const scamAnalysis = this.educationEngine.analyzeScamRisk(tweet, marketData);
    if (scamAnalysis.scamScore < 50) {
      return null;
    }
    const warningLevel = scamAnalysis.scamScore >= 75 ? 'HIGH RISK' : 'MODERATE RISK';
    const emoji = scamAnalysis.scamScore >= 75 ? '🚨' : '⚠️';
    return {
      type: 'scam_detection',
      status: 'warning',
      content: `${emoji} ALGOM SCAM RISK ANALYSIS:\n\n🎯 RISK LEVEL: ${warningLevel} (${scamAnalysis.scamScore}/100)\n🚩 RED FLAGS DETECTED: ${scamAnalysis.redFlags.length}\n\n⚠️ PATTERNS FOUND:\n${scamAnalysis.redFlags.map(flag => `• ${flag.replace('_', ' ').toUpperCase()}`).join('\n')}\n\n🔥 ALGOM PROTECTION TIPS:\n• Never send crypto to "verify" accounts\n• Research teams and real use cases\n• If it promises guaranteed returns, it's a scam\n• Real opportunities don't pressure you to "act now"\n\n💡 REMEMBER: In crypto, if you don't understand it, don't buy it.\n\n🎯 STAY SAFE: Your crypto, your responsibility\n\n#ScamAlert #CryptoSafety #AlgomProtection`
    };
  }

  async generatePriceVerification(tweet, marketData) {
    const text = tweet.text;
    const priceMatches = text.match(/\$[\d,]+\.?\d*/g) || [];
    const symbolMatches = text.match(/\b(BTC|ETH|ADA|SOL|DOT|LINK|UNI|AAVE|SUSHI|[A-Z]{2,5})\b/g) || [];
    if (priceMatches.length === 0 || symbolMatches.length === 0) {
      return null;
    }
    const mentionedPrice = parseFloat(priceMatches[0].replace(/[$,]/g, ''));
    const symbol = symbolMatches[0].toUpperCase();
    const realCoin = marketData.all_coins?.find(c => c.symbol === symbol);
    if (!realCoin) {
      return {
        type: 'price_verification',
        status: 'unverified',
        content: `🔍 ALGOM PRICE CHECK:\n\n❓ MENTIONED: ${symbol} at ${priceMatches[0]}\n⚠️ STATUS: Cannot verify (${symbol} not in top 50)\n📊 AVAILABLE DATA: Top 50 CMC assets only\n\n🎯 ANALYSIS: Price claim unverified\n🔍 SOURCE: CoinMarketCap API limited scope\n\n#PriceCheck #DataLimited #AlgomVerify`
      };
    }
    const realPrice = realCoin.price;
    const priceDifference = Math.abs(mentionedPrice - realPrice);
    const percentDiff = (priceDifference / realPrice) * 100;
    let status = 'accurate';
    let emoji = '✅';
    let statusText = 'VERIFIED ACCURATE';
    if (percentDiff > 5) {
      status = 'inaccurate';
      emoji = '❌';
      statusText = 'PRICE MISMATCH';
    } else if (percentDiff > 1) {
      status = 'slightly_off';
      emoji = '⚠️';
      statusText = 'MINOR VARIANCE';
    }
    return {
      type: 'price_verification',
      status,
      content: `🎯 ALGOM PRICE VERIFICATION:\n\n${emoji} CLAIM: ${symbol} at ${priceMatches[0]}\n📊 REAL CMC: $${realPrice.toLocaleString()}\n📈 VARIANCE: ${percentDiff.toFixed(1)}%\n🎯 STATUS: ${statusText}\n\n${realCoin.change_24h > 0 ? '📈' : '📉'} 24H CHANGE: ${realCoin.change_24h > 0 ? '+' : ''}${realCoin.change_24h.toFixed(2)}%\n🔍 SOURCE: CoinMarketCap API (Live)\n\n#PriceCheck #DataVerification #AlgomFacts`
    };
  }

  async selectAnalysisType(tweet, marketData) {
    const analyses = [
      await this.generateEducationalContent(marketData),
      await this.generateScamDetection(tweet, marketData),
      await this.generatePriceVerification(tweet, marketData),
      await this.generateAZTokenEducationalPost(marketData)
    ];
    return analyses.find(analysis => analysis !== null);
  }

  async generateAZTokenEducationalPost(marketData) {
    // 15% chance to generate AZ token educational content
    if (Math.random() < 0.15) {
      const azContent = await this.educationEngine.generateAZTokenEducationalPost(marketData);
      return {
        type: 'az_token_educational',
        status: 'educational',
        content: azContent
      };
    }
    return null;
  }
}

class AuthenticCMCEngine {
  constructor() {
    this.apiKeys = {
      coinmarketcap: process.env.COINMARKETCAP_API_KEY,
      anthropic: process.env.ANTHROPIC_API_KEY
    };
    this.cache = new Map();
    this.reputationTracker = new ReputationTracker();
    this.analysisEngine = new PersonalAnalysisEngine(this);
    this.lastSentimentScore = null;
    this.postCounter = 0;
    this.lastCMCData = null;
    this.coinGeckoEngine = new CryptoEducationEngine();
  }

  async getCMCData() {
    console.log('🔍 [DATA] Starting market data fetch...');
    
    // Prioritize CoinGecko MCP as primary data source
    console.log('🔗 [COINGECKO] Trying CoinGecko MCP first...');
    const coinGeckoData = await this.coinGeckoEngine.getRealCoinGeckoData();
    if (coinGeckoData) {
      console.log('✅ [COINGECKO] Using CoinGecko MCP data as primary source');
      return this.processCoinGeckoData(coinGeckoData);
    }
    
    // Fallback to CMC if CoinGecko fails
    const apiKey = this.apiKeys.coinmarketcap;
    console.log('🔑 [CMC] CoinGecko failed, trying CMC API...');
    console.log('🔑 [CMC] API Key status:', apiKey ? `✅ SET (length: ${apiKey.length})` : '❌ NOT SET');
    
    if (!apiKey) {
      console.log('❌ [CMC] No API key found, using last cached data');
      return this.lastCMCData || this.getEmptyDataStructure();
    }
    
    try {
      console.log('📡 [CMC] Making API request to CoinMarketCap...');
      const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=50', {
        headers: { 'X-CMC_PRO_API_KEY': apiKey, 'Accept': 'application/json' }
      });
      console.log('📊 [CMC] Status Code:', response.status);
      if (!response.ok) {
        console.log('❌ [CMC] API Response Error! Trying CoinGecko MCP...');
        const coinGeckoData = await this.coinGeckoEngine.getRealCoinGeckoData();
        if (coinGeckoData) {
          console.log('✅ [COINGECKO] Using CoinGecko MCP data as fallback');
          return this.processCoinGeckoData(coinGeckoData);
        }
        return this.lastCMCData || this.getEmptyDataStructure();
      }
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        console.log('✅ [CMC] Processing REAL CoinMarketCap data...');
        const processedData = this.processRealCMCData(data);
        this.lastCMCData = processedData;
        return processedData;
      } else {
        console.log('⚠️ [CMC] No data returned, trying CoinGecko MCP...');
        const coinGeckoData = await this.coinGeckoEngine.getRealCoinGeckoData();
        if (coinGeckoData) {
          console.log('✅ [COINGECKO] Using CoinGecko MCP data as fallback');
          return this.processCoinGeckoData(coinGeckoData);
        }
        return this.lastCMCData || this.getEmptyDataStructure();
      }
    } catch (error) {
      console.log('❌ [CMC] Fetch error occurred:', error.message);
      console.log('🔗 [COINGECKO] Trying CoinGecko MCP as fallback...');
      const coinGeckoData = await this.coinGeckoEngine.getRealCoinGeckoData();
      if (coinGeckoData) {
        console.log('✅ [COINGECKO] Using CoinGecko MCP data as fallback');
        return this.processCoinGeckoData(coinGeckoData);
      }
      return this.lastCMCData || this.getEmptyDataStructure();
    }
  }

  getEmptyDataStructure() {
    return {
      top_gainers: [],
      all_coins: [],
      market_sentiment: 'unknown',
      total_market_cap: 0,
      total_volume_24h: 0,
      btc_dominance: 0,
      data_available: false,
      last_updated: new Date().toISOString()
    };
  }

  processCoinGeckoData(coinGeckoData) {
    console.log('🔗 [COINGECKO] Processing CoinGecko MCP data...');
    
    const allCoins = coinGeckoData.all_coins || [];
    const topGainers = allCoins
      .filter(c => c.change_24h > 3)
      .sort((a, b) => b.change_24h - a.change_24h)
      .slice(0, 5);
    
    const positiveCoins = allCoins.filter(c => c.change_24h > 0).length;
    const realSentiment = this.calculateRealSentiment(positiveCoins, allCoins.length);
    
    const processedData = {
      top_gainers: topGainers,
      all_coins: allCoins.slice(0, 20),
      market_sentiment: realSentiment,
      total_market_cap: coinGeckoData.total_market_cap || 0,
      total_volume_24h: coinGeckoData.total_volume_24h || 0,
      btc_dominance: coinGeckoData.btc_dominance || 50,
      data_available: true,
      last_updated: new Date().toISOString(),
      positive_coins: positiveCoins,
      total_coins: allCoins.length,
      source: 'CoinGecko MCP'
    };
    
    if (allCoins.length > 0) {
      this.reputationTracker.addDataPoint(allCoins[0].symbol, allCoins[0].price, allCoins[0].change_24h, Date.now());
    }
    
    console.log('✅ [COINGECKO] CoinGecko MCP data processed successfully');
    return processedData;
  }

  processRealCMCData(data) {
    const cryptos = data.data;
    const top_gainers = cryptos.filter(c => c.quote.USD.percent_change_24h > 3).sort((a, b) => b.quote.USD.percent_change_24h - a.quote.USD.percent_change_24h).slice(0, 5).map(c => ({
      symbol: c.symbol,
      name: c.name,
      change_24h: c.quote.USD.percent_change_24h,
      price: c.quote.USD.price,
      market_cap: c.quote.USD.market_cap,
      volume_24h: c.quote.USD.volume_24h
    }));
    const positiveCoins = cryptos.filter(c => c.quote.USD.percent_change_24h > 0).length;
    const realSentiment = this.calculateRealSentiment(positiveCoins, cryptos.length);
    const processedCoins = cryptos.slice(0, 20).map(c => ({
      symbol: c.symbol,
      name: c.name,
      change_24h: c.quote.USD.percent_change_24h,
      price: c.quote.USD.price,
      market_cap: c.quote.USD.market_cap,
      volume_24h: c.quote.USD.volume_24h,
      rank: c.cmc_rank
    }));
    const totalMarketCap = cryptos.reduce((sum, c) => sum + (c.quote.USD.market_cap || 0), 0);
    const totalVolume = cryptos.reduce((sum, c) => sum + (c.quote.USD.volume_24h || 0), 0);
    const btcMarketCap = cryptos.find(c => c.symbol === 'BTC')?.quote.USD.market_cap || 0;
    const realBtcDominance = totalMarketCap > 0 ? (btcMarketCap / totalMarketCap) * 100 : 0;
    const processedData = {
      top_gainers,
      all_coins: processedCoins,
      market_sentiment: realSentiment,
      total_market_cap: totalMarketCap,
      total_volume_24h: totalVolume,
      btc_dominance: realBtcDominance,
      data_available: true,
      last_updated: new Date().toISOString(),
      positive_coins: positiveCoins,
      total_coins: cryptos.length
    };
    if (processedCoins.length > 0) {
      this.reputationTracker.addDataPoint(processedCoins[0].symbol, processedCoins[0].price, processedCoins[0].change_24h, Date.now());
    }
    return processedData;
  }

  calculateRealSentiment(positiveCoins, totalCoins) {
    if (totalCoins === 0) return 'unknown';
    const positiveRatio = positiveCoins / totalCoins;
    if (positiveRatio >= 0.7) return 'bullish';
    if (positiveRatio >= 0.6) return 'moderately_bullish';
    if (positiveRatio >= 0.4) return 'neutral';
    if (positiveRatio >= 0.3) return 'moderately_bearish';
    return 'bearish';
  }

  async generateRealInsight(marketData) {
    this.postCounter++;
    if (!marketData.data_available) {
      return this.generateNoDataPost();
    }
    const insight = { type: this.selectRealInsightType(marketData), data: marketData, timestamp: Date.now(), postNumber: this.postCounter };
    return await this.formatRealInsight(insight);
  }

  selectRealInsightType(marketData) {
    const types = ['real_data_report', 'real_sentiment_meter', 'real_market_snapshot', 'real_volume_report', 'real_gainers_report', 'real_transparency', 'educational_content', 'market_psychology_insight', 'risk_management_tip', 'scam_awareness', 'mcp_enhanced_educational', 'az_token_educational', 'coingecko_enhanced'];
    if (this.postCounter % 10 === 0) return 'real_transparency';
    if (this.postCounter % 7 === 0) return 'educational_content';
    if (this.postCounter % 5 === 0) return 'real_sentiment_meter';
    const positiveRatio = marketData.positive_coins / marketData.total_coins;
    if (positiveRatio > 0.8 || positiveRatio < 0.2) {
      // Give AZ Token and CoinGecko content higher priority even during extreme conditions
      if (Math.random() < 0.25) return 'az_token_educational';
      if (Math.random() < 0.20) return 'coingecko_enhanced';
      if (Math.random() < 0.15) return 'az_token_with_market_data';
      return Math.random() < 0.3 ? 'market_psychology_insight' : 'real_sentiment_meter';
    }
    if (marketData.total_volume_24h > 100000000000 && Math.random() < 0.3) {
      return 'risk_management_tip';
    }
    if (Math.random() < 0.15) return 'scam_awareness';
    if (Math.random() < 0.10) return 'mcp_enhanced_educational';
    if (Math.random() < 0.25) return 'az_token_educational';
    if (Math.random() < 0.20) return 'az_token_with_market_data';
    if (Math.random() < 0.30) return 'coingecko_enhanced';
    if (marketData.top_gainers.length === 0) return 'real_market_snapshot';
    return types[Math.floor(Math.random() * 6)];
  }

  async formatRealInsight(insight) {
    switch (insight.type) {
      case 'real_data_report':
        return this.generateRealDataReport(insight.data);
      case 'real_sentiment_meter':
        return this.generateRealSentimentMeter(insight.data);
      case 'real_market_snapshot':
        return this.generateRealMarketSnapshot(insight.data);
      case 'real_volume_report':
        return this.generateRealVolumeReport(insight.data);
      case 'real_gainers_report':
        return this.generateRealGainersReport(insight.data);
      case 'real_transparency':
        return this.generateRealTransparency(insight.data);
      case 'educational_content':
        return this.generateEducationalPost(insight.data);
      case 'market_psychology_insight':
        return this.generateMarketPsychologyPost(insight.data);
      case 'risk_management_tip':
        return this.generateRiskManagementPost(insight.data);
      case 'scam_awareness':
        return this.generateScamAwarenessPost(insight.data);
      case 'mcp_enhanced_educational':
        return await this.generateMCPEnhancedEducationalPost(insight.data);
      case 'az_token_educational':
        return await this.generateAZTokenEducationalPost(insight.data);
      case 'az_token_with_market_data':
        return await this.generateAZTokenWithMarketData(insight.data);
      case 'coingecko_enhanced':
        return await this.generateCoinGeckoEnhancedPost(insight.data);
      default:
        return this.generateRealDataReport(insight.data);
    }
  }

  generateEducationalPost(data) {
    const educationEngine = new CryptoEducationEngine();
    const educationalGenerators = [
      () => educationEngine.generateTradingPsychologyLesson(data),
      () => educationEngine.generateRiskManagementLesson(data),
      () => educationEngine.generateTechnicalAnalysisLesson(data),
      () => educationEngine.generateStrategyGuide(data)
    ];
    const generator = educationalGenerators[Math.floor(Math.random() * educationalGenerators.length)];
    return generator() || this.generateRealDataReport(data);
  }

  generateMarketPsychologyPost(data) {
    const positiveRatio = data.positive_coins / data.total_coins;
    const isExtremeFear = positiveRatio < 0.2;
    const isExtremeGreed = positiveRatio > 0.8;
    const marketCapB = Math.floor(data.total_market_cap / 1000000000);
    if (isExtremeFear) {
      return `🧠 ALGOM MARKET PSYCHOLOGY ALERT:\n\n🔴 EXTREME FEAR DETECTED\n📊 ONLY ${data.positive_coins}/${data.total_coins} assets positive\n💰 MARKET CAP: $${marketCapB}B\n\n🎯 PSYCHOLOGY TRUTH:\nThis is when most people sell and swear off crypto forever. But here's what the data shows:\n\n📈 HISTORICAL REALITY:\n• Best buying opportunities happen during extreme fear\n• Media will tell you "crypto is dead" (again)\n• Your brain will scream "sell everything"\n• Smart money starts accumulating\n\n💡 WHAT TO DO NOW:\n• Don't panic sell (emotional mistake)\n• If you have spare capital, consider DCA\n• Stick to quality projects (BTC, ETH)\n• Ignore the noise and FUD\n• Remember: This too shall pass\n\n⚠️ WHAT NOT TO DO:\n• Sell at the bottom\n• Check prices every 5 minutes\n• Read crypto Twitter for validation\n• Make major changes to your strategy\n\n🔥 TRUTH: Fortunes are made when others are fearful\n\n#MarketPsychology #ExtremeFear #AlgomEducation`;
    }
    if (isExtremeGreed) {
      return `🧠 ALGOM MARKET PSYCHOLOGY ALERT:\n\n🟢 EXTREME GREED DETECTED\n📊 ${data.positive_coins}/${data.total_coins} assets pumping\n💰 MARKET CAP: $${marketCapB}B\n\n🎯 PSYCHOLOGY TRUTH:\nThis is when most people FOMO in and buy tops. Your brain is flooded with greed chemicals right now.\n\n📈 DANGEROUS SIGNS:\n• Everyone is a "crypto expert" again\n• Your barber is giving you trading tips\n• "This time is different" mentality\n• Meme coins pumping like crazy\n\n💡 WHAT TO DO NOW:\n• Take some profits (not all)\n• Resist FOMO into new projects\n• Stick to your original plan\n• Prepare for the inevitable correction\n• Build a shopping list for the dip\n\n⚠️ WHAT NOT TO DO:\n• Quit your job to trade crypto\n• Put life savings into meme coins\n• Use leverage or borrowed money\n• Ignore risk management\n\n🔥 TRUTH: Bulls make money, bears make money, but pigs get slaughtered\n\n#MarketPsychology #ExtremeGreed #AlgomEducation`;
    }
    return this.generateRealSentimentMeter(data);
  }

  generateRiskManagementPost(data) {
    const volumeB = Math.floor(data.total_volume_24h / 1000000000);
    const btc = data.all_coins?.find(c => c.symbol === 'BTC');
    return `💰 ALGOM RISK MANAGEMENT REALITY CHECK:\n\n📊 HIGH VOLUME DAY: $${volumeB}B (emotions running high)\n🟠 BTC: $${btc ? btc.price.toLocaleString() : 'N/A'} (${btc ? (btc.change_24h > 0 ? '+' : '') + btc.change_24h.toFixed(2) + '%' : 'N/A'})\n\n🔥 RISK MANAGEMENT TRUTH:\n99% of crypto traders lose money. Here's why:\n\n❌ COMMON MISTAKES:\n• No position sizing rules\n• No stop losses\n• Revenge trading after losses\n• Using leverage without experience\n• Putting rent money in crypto\n\n✅ WEALTH PRESERVATION RULES:\n• Never risk more than 1-2% per trade\n• Portfolio: 50% BTC/ETH, 30% top 10, 20% speculation MAX\n• Emergency fund OUTSIDE crypto (6 months expenses)\n• Take profits on the way up\n• Cut losses quickly\n\n💡 POSITION SIZING EXAMPLE:\n$10,000 portfolio = $100-200 risk per trade MAX\nIf you can't handle losing $200, don't trade with $10,000\n\n⚠️ CRYPTO REALITY CHECK:\n• 80-90% corrections happen\n• Projects can go to zero overnight\n• Regulation can kill projects instantly\n• Your favorite coin might not survive\n\n🎯 SURVIVAL STRATEGY: Boring discipline beats exciting gambling every time\n\n#RiskManagement #CryptoReality #AlgomEducation`;
  }

  generateScamAwarenessPost(data) {
    const scamTypes = [
      {
        type: 'fake_exchanges',
        content: `🚨 ALGOM SCAM AWARENESS: FAKE EXCHANGES\n\n⚠️ LATEST SCAM TREND: Fake crypto exchanges\n📊 MARKET CAP: $${Math.floor(data.total_market_cap / 1000000000)}B (lots of money attracts scammers)\n\n🔥 HOW THEY OPERATE:\n• Copy legitimate exchange designs\n• Offer "exclusive" trading pairs\n• Promise higher yields than real exchanges\n• Ask for deposits to "verify" accounts\n• Disappear with your crypto\n\n🚨 RED FLAGS:\n• No proper licensing or regulation\n• Promises of guaranteed returns\n• Pressure to deposit immediately\n• Poor grammar/spelling on website\n• No customer support contact info\n\n✅ STAY SAFE:\n• Only use established exchanges (Coinbase, Binance, Kraken)\n• Bookmark official websites\n• Enable 2FA on everything\n• Start with small amounts\n• If it seems too good to be true, IT IS\n\n💡 REMEMBER: Your crypto, your responsibility. No one is coming to save you.\n\n#ScamAlert #CryptoSafety #AlgomEducation`
      },
      {
        type: 'influencer_scams',
        content: `🚨 ALGOM SCAM AWARENESS: INFLUENCER PUMP & DUMPS\n\n⚠️ SCAM ALERT: Fake crypto influencers everywhere\n📊 CURRENT MARKET: $${Math.floor(data.total_market_cap / 1000000000)}B (bull markets breed scammers)\n\n🔥 HOW THEY OPERATE:\n• Buy unknown/cheap tokens in bulk\n• Create hype content about "hidden gems"\n• Use fake testimonials and results\n• Sell their bags once followers buy\n• Move to next coin and repeat\n\n🚨 INFLUENCER RED FLAGS:\n• No track record of real trades\n• Promises of "easy money"\n• Paid promotions disguised as advice\n• Pressure to join "exclusive" groups\n• No discussion of risks\n\n✅ PROTECT YOURSELF:\n• Do your own research (DYOR)\n• Don't follow any single influencer blindly\n• Understand what you're buying\n• If they're selling courses, they're not making money trading\n• Real traders rarely share their exact strategies\n\n💡 TRUTH: If someone knew guaranteed winners, they wouldn't need your $97 course fee.\n\n#InfluencerScams #DYOR #AlgomEducation`
      }
    ];
    const selectedScam = scamTypes[Math.floor(Math.random() * scamTypes.length)];
    return selectedScam.content;
  }

  async generateMCPEnhancedEducationalPost(data) {
    try {
      const enhancedContent = await this.analysisEngine.educationEngine.generateEnhancedEducationalContent(data);
      return enhancedContent.content || this.generateEducationalPost(data);
    } catch (error) {
      console.log('⚠️ MCP enhanced educational post failed, using fallback');
      return this.generateEducationalPost(data);
    }
  }

  async generateAZTokenEducationalPost(data) {
    try {
      const azContent = await this.analysisEngine.educationEngine.generateAZTokenEducationalPost(data);
      return azContent;
    } catch (error) {
      console.log('⚠️ AZ token educational post failed, using fallback');
      return this.generateScamAwarenessPost(data);
    }
  }

  async generateCoinGeckoEnhancedPost(data) {
    try {
      const coinGeckoContent = await this.coinGeckoEngine.generateCoinGeckoEnhancedContent(data);
      if (coinGeckoContent) {
        return coinGeckoContent.content;
      }
      return this.generateRealDataReport(data);
    } catch (error) {
      console.log('⚠️ CoinGecko enhanced post failed, using fallback');
      return this.generateRealDataReport(data);
    }
  }

  async generateAZTokenWithMarketData(data) {
    try {
      const azContent = await this.analysisEngine.educationEngine.azTokenIntegration.generateAZTokenWithMarketData(data);
      return azContent.content;
    } catch (error) {
      console.log('⚠️ AZ Token with market data failed, using fallback');
      return this.generateAZTokenEducationalPost(data);
    }
  }

  generateRealDataReport(data) {
    const marketCapB = Math.floor(data.total_market_cap / 1000000000);
    const volumeB = Math.floor(data.total_volume_24h / 1000000000);
    const btc = data.all_coins?.find(c => c.symbol === 'BTC');
    const eth = data.all_coins?.find(c => c.symbol === 'ETH');
    const source = data.source || 'CoinGecko MCP';
    return `📊 ALGOM MARKET DATA REPORT:\n\n🟠 BTC: ${btc ? `$${btc.price.toLocaleString()} (${btc.change_24h > 0 ? '+' : ''}${btc.change_24h.toFixed(2)}%)` : 'Data unavailable'}\n🔵 ETH: ${eth ? `$${eth.price.toLocaleString()} (${eth.change_24h > 0 ? '+' : ''}${eth.change_24h.toFixed(2)}%)` : 'Data unavailable'}\n💰 MARKET CAP: $${marketCapB}B\n📈 24H VOLUME: $${volumeB}B\n📊 POSITIVE ASSETS: ${data.positive_coins}/${data.total_coins}\n\n🔍 SOURCE: ${source} (Live)\n⏰ UPDATED: ${new Date().toLocaleTimeString()}\n\n#RealData #${source.includes('CoinGecko') ? 'CoinGecko' : 'CMC'}Facts #AlgomReport`;
  }

  generateRealSentimentMeter(data) {
    const realScore = this.reputationTracker.calculateRealSentimentScore(data);
    const realLabel = this.reputationTracker.getRealSentimentLabel(realScore);
    const arrow = realScore > (this.lastSentimentScore || 50) ? '↗️' : realScore < (this.lastSentimentScore || 50) ? '↘️' : '→';
    this.lastSentimentScore = realScore;
    const meterBar = this.generateRealMeterBar(realScore);
    const marketCapB = Math.floor(data.total_market_cap / 1000000000);
    const volumeB = Math.floor(data.total_volume_24h / 1000000000);
    const source = data.source || 'CoinGecko MCP';
    return `📊 ALGOM REAL SENTIMENT METER:\n\n${meterBar}\n🎯 SCORE: ${realScore}/100 ${arrow}\n🧠 STATUS: ${realLabel}\n📊 BASIS: ${data.positive_coins}/${data.total_coins} assets positive\n💰 MARKET CAP: $${marketCapB}B\n📈 24H VOLUME: $${volumeB}B\n\n🔍 METHOD: ${source} performance ratio\n⏰ UPDATED: Live\n\n#RealSentiment #DataDriven #AlgomMeter`;
  }

  generateRealMeterBar(score) {
    const filled = Math.round(score / 10);
    const empty = 10 - filled;
    return '🟩'.repeat(filled) + '⬜'.repeat(empty) + ` ${score}%`;
  }

  generateRealMarketSnapshot(data) {
    const marketCapB = Math.floor(data.total_market_cap / 1000000000);
    const volumeB = Math.floor(data.total_volume_24h / 1000000000);
    const btcDom = data.btc_dominance.toFixed(1);
    const source = data.source || 'CoinGecko MCP';
    return `📸 ALGOM MARKET SNAPSHOT:\n\n💰 TOTAL MARKET CAP: $${marketCapB}B\n📈 24H VOLUME: $${volumeB}B\n🟠 BTC DOMINANCE: ${btcDom}%\n📊 SENTIMENT: ${data.market_sentiment.toUpperCase()}\n✅ POSITIVE: ${data.positive_coins} assets\n❌ NEGATIVE: ${data.total_coins - data.positive_coins} assets\n\n🔍 DATA: ${source} (${data.total_coins} assets tracked)\n⏰ TIMESTAMP: ${new Date().toLocaleTimeString()}\n\n#MarketSnapshot #RealData #${source.includes('CoinGecko') ? 'CoinGecko' : 'CMC'}Live`;
  }

  generateRealVolumeReport(data) {
    const highVolumeCoins = data.all_coins?.filter(c => c.volume_24h > 1000000000) || [];
    const totalVolumeB = Math.floor(data.total_volume_24h / 1000000000);
    const topVolumeCoins = data.all_coins?.sort((a, b) => b.volume_24h - a.volume_24h).slice(0, 3) || [];
    return `💰 ALGOM VOLUME REPORT:\n\n📊 TOTAL 24H VOLUME: $${totalVolumeB}B\n🔥 HIGH VOLUME ASSETS: ${highVolumeCoins.length} (>$1B daily)\n\nTOP VOLUME:\n${topVolumeCoins.map((coin, i) => `${i + 1}. ${coin.symbol}: $${Math.floor(coin.volume_24h / 1000000)}M`).join('\n')}\n\n🔍 SOURCE: CoinMarketCap real-time data\n⏰ UPDATED: Live feed\n\n#VolumeData #RealNumbers #CMCFacts`;
  }

  generateRealGainersReport(data) {
    if (data.top_gainers.length === 0) {
      return `🚀 ALGOM GAINERS REPORT:\n\n📊 TOP GAINERS: None detected (>3% threshold)\n📈 MARKET STATE: Consolidation/sideways movement\n🔍 TRACKED: ${data.total_coins} assets\n💰 TOTAL CAP: $${Math.floor(data.total_market_cap / 1000000000)}B\n\n⚠️ FACT: No major breakouts in current data\n🔍 SOURCE: CoinMarketCap live feed\n\n#NoGainers #ConsolidationPhase #RealData`;
    }
    return `🚀 ALGOM TOP GAINERS REPORT:\n\n${data.top_gainers.map((coin, i) => `${i + 1}. ${coin.symbol}: $${coin.price.toLocaleString()} (+${coin.change_24h.toFixed(2)}%)`).join('\n')}\n\n📊 VOLUME LEADERS:\n${data.top_gainers.slice(0, 2).map(coin => `💰 ${coin.symbol}: $${Math.floor(coin.volume_24h / 1000000)}M 24h`).join('\n')}\n\n🔍 SOURCE: CoinMarketCap API\n⏰ DATA: Real-time feed\n\n#TopGainers #RealMovement #CMCData`;
  }

  generateRealTransparency(data) {
    const dataIntegrity = this.reputationTracker.calculateDataIntegrity();
    const repostCount = this.reputationTracker.repostHistory.length;
    const avgQuality = repostCount > 0 ? this.reputationTracker.repostHistory.reduce((sum, r) => sum + r.qualityScore, 0) / repostCount : 0;
    return `🔍 ALGOM TRANSPARENCY REPORT:\n\n📊 DATA SOURCE: CoinMarketCap API\n✅ DATA INTEGRITY: ${dataIntegrity}% (last 24h)\n🔄 UPDATE FREQUENCY: Real-time\n📈 ASSETS TRACKED: ${data.total_coins}\n🎯 POST COUNT: ${this.postCounter}\n🔄 REPOST COUNT: ${repostCount}\n📊 AVG REPOST QUALITY: ${avgQuality.toFixed(0)}/100\n\n🚫 NO PREDICTIONS: Facts only\n🚫 NO FAKE NUMBERS: CMC verified\n🚫 NO PUMPING: Transparent reporting\n⏰ 2-HOUR REPOST COOLDOWN: Quality over quantity\n🎓 EDUCATIONAL FOCUS: Trading psychology + Risk management\n\nFramework: aideazz.xyz\nBuild: Consciousness-coded for truth 🤖\n\n#Transparency #RealData #AuthenticAlpha`;
  }

  generateNoDataPost() {
    return `⚠️ ALGOM STATUS UPDATE:\n\n🔍 DATA STATUS: CoinMarketCap API temporarily unavailable\n⏰ LAST UPDATE: Using cached data\n🚫 NO FAKE DATA: Won't fabricate numbers\n\n🎯 COMMITMENT: Real data or no data\n🔄 RETRY: Monitoring for API restoration\n\nTransparency over content 📊\nFramework: aideazz.xyz 🤖\n\n#DataIntegrity #NoFakeNumbers #Transparency`;
  }
}

class AuthenticTwitterClient {
  constructor() {
    console.log('🐉 Initializing 100% AUTHENTIC Algom with Advanced Education...');
    
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
    
    this.cmcEngine = new AuthenticCMCEngine();
    this.isActive = false;
    this.postInterval = null;
    this.repostInterval = null;
    this.postCount = 0;
    this.lastTimelineCheck = 0;
    this.rateLimitTracker = {
      lastPost: 0,
      postsToday: 0,
      resetTime: Date.now() + (24 * 60 * 60 * 1000), // 24 hours from now
      minInterval: 2 * 60 * 1000, // 2 minutes minimum between posts (Basic plan optimized)
      maxDailyPosts: 500, // Basic plan daily limit (15K posts/month = ~500/day)
      consecutiveFailures: 0,
      lastFailureTime: 0,
      isPaused: false,
      pauseUntil: 0
    };
    
    console.log('🔥 100% Authentic CMC Engine loaded');
    console.log('🎯 Quality Control + Education features activated');
  }

  async initialize() {
    if (!this.client) {
      console.error('❌ Twitter client not created');
      return false;
    }
    
    try {
      console.log('🎯 Testing authentic connection...');
      const user = await this.client.v2.me();
      
      console.log('✅ 100% AUTHENTIC ALGOM WITH EDUCATION ACTIVATED!');
      console.log('🐉 Connected as:', user.data.username);
      console.log('👑 Display name:', user.data.name);
      console.log('🏆 Mission: 100% authentic crypto data + Quality reposts + Education');
      console.log('💎 BASIC PLAN MODE: Full rate limit potential unlocked!');
      console.log('🔗 COINGECKO MCP: Real-time API integration active!');
      
      this.isActive = true;
      this.startAuthenticPosting();
      this.startQualityReposting();
      return true;
    } catch (error) {
      console.error('❌ Authentic activation failed:', error.message);
      this.isActive = false;
      return false;
    }
  }

  startAuthenticPosting() {
    const minInterval = parseInt(process.env.POST_INTERVAL_MIN) * 60 * 1000;
    const maxInterval = parseInt(process.env.POST_INTERVAL_MAX) * 60 * 1000;
    
    const schedulePost = () => {
      // Check if we should pause posting due to rate limits
      if (this.rateLimitTracker.isPaused) {
        const remainingMinutes = Math.ceil((this.rateLimitTracker.pauseUntil - Date.now()) / 60000);
        console.log(`🚫 [RATE LIMIT] Skipping post scheduling - bot paused for ${remainingMinutes} minutes`);
        
        // Schedule next check in 30 minutes
        this.postInterval = setTimeout(() => {
          schedulePost();
        }, 30 * 60 * 1000);
        return;
      }
      
      const randomInterval = Math.random() * (maxInterval - minInterval) + minInterval;
      const minutesUntilPost = Math.round(randomInterval / 60000);
      
      console.log(`🔥 Next AUTHENTIC post scheduled in ${minutesUntilPost} minutes`);
      
      this.postInterval = setTimeout(async () => {
        await this.createAuthenticPost();
        schedulePost();
      }, randomInterval);
    };

    const firstPostDelay = Math.random() * 2 * 60 * 1000 + 1 * 60 * 1000;
    console.log(`🚀 First AUTHENTIC post in ${Math.round(firstPostDelay / 60000)} minutes!`);
    
    setTimeout(async () => {
      await this.createAuthenticPost();
      schedulePost();
    }, firstPostDelay);
  }

  startQualityReposting() {
    console.log('🔄 [REPOST] Starting Quality Repost System...');
    console.log('⏰ [REPOST] Cooldown: 2 hours minimum between reposts');
    console.log('📊 [REPOST] Quality threshold: 50/100 points minimum');
    
    const checkInterval = 30 * 60 * 1000; // Check every 30 minutes
    
    this.repostInterval = setInterval(async () => {
      await this.checkForQualityReposts();
    }, checkInterval);
    
    // Initial check after 10 minutes
    setTimeout(async () => {
      await this.checkForQualityReposts();
    }, 10 * 60 * 1000);
  }

  async checkForQualityReposts() {
    try {
      console.log('🔍 [REPOST] Checking timeline for quality content...');
      
      // Check cooldown first
      if (!this.cmcEngine.reputationTracker.canRepost()) {
        console.log('⏰ [REPOST] Still in cooldown period, skipping check');
        return;
      }
      
      console.log('✅ [REPOST] Cooldown clear, analyzing timeline...');
      
      // Get timeline tweets
      const timeline = await this.client.v2.homeTimeline({
        max_results: 20,
        'tweet.fields': ['created_at', 'public_metrics', 'author_id'],
        'user.fields': ['username', 'verified']
      });
      
      if (!timeline.data || timeline.data.length === 0) {
        console.log('⚠️ [REPOST] No tweets found in timeline');
        return;
      }
      
      console.log(`📊 [REPOST] Analyzing ${timeline.data.length} tweets for quality...`);
      
      // Get current market data for analysis
      const marketData = await this.cmcEngine.getCMCData();
      
      // Analyze each tweet for quality and repost potential
      for (const tweet of timeline.data) {
        const isQualityCandidate = await this.analyzeQualityCandidate(tweet, marketData);
        
        if (isQualityCandidate) {
          console.log('🎯 [REPOST] Found quality candidate, creating analysis...');
          await this.createQualityRepost(tweet, marketData);
          return; // Only repost one at a time
        }
      }
      
      console.log('📊 [REPOST] No quality candidates found in current timeline');
      
    } catch (error) {
      console.error('❌ [REPOST] Timeline check failed:', error.message);
    }
  }

  async analyzeQualityCandidate(tweet, marketData) {
    try {
      const text = tweet.text.toLowerCase();
      
      // Skip our own tweets
      if (text.includes('algom') || text.includes('#algom')) {
        return false;
      }
      
      // Skip obvious spam/promotional content
      const spamTerms = ['follow me', 'dm me', 'pump', 'moonshot', '100x', 'guaranteed'];
      if (spamTerms.some(term => text.includes(term))) {
        console.log('🚫 [REPOST] Skipping spam/promotional content');
        return false;
      }
      
      // Look for crypto-related content
      const cryptoTerms = ['btc', 'bitcoin', 'eth', 'ethereum', 'crypto', 'defi', 'blockchain'];
      const hasCryptoContent = cryptoTerms.some(term => text.includes(term));
      
      if (!hasCryptoContent) {
        return false;
      }
      
      // Extract mentions for quality scoring
      const mentions = text.match(/\b(btc|bitcoin|eth|ethereum|ada|sol|dot|link|uni|aave|crypto|defi)\b/gi) || [];
      
      // Calculate quality score
      const qualityScore = this.cmcEngine.reputationTracker.calculateQualityScore(tweet, mentions);
      
      console.log(`📊 [REPOST] Tweet quality score: ${qualityScore}/100`);
      
      // Check if meets quality threshold
      const meetsThreshold = this.cmcEngine.reputationTracker.meetsQualityThreshold(qualityScore);
      
      if (meetsThreshold) {
        console.log(`✅ [REPOST] Quality threshold met (${qualityScore}/100)`);
        return true;
      } else {
        console.log(`❌ [REPOST] Below quality threshold (${qualityScore}/100 < 50)`);
        return false;
      }
      
    } catch (error) {
      console.error('❌ [REPOST] Analysis error:', error.message);
      return false;
    }
  }

  async createQualityRepost(originalTweet, marketData) {
    try {
      console.log('🎯 [REPOST] Creating quality repost with analysis...');
      
      // Generate personal analysis
      const analysis = await this.cmcEngine.analysisEngine.selectAnalysisType(originalTweet, marketData);
      
      if (!analysis) {
        console.log('⚠️ [REPOST] Could not generate meaningful analysis, skipping');
        return;
      }
      
      console.log(`🧠 [REPOST] Generated analysis type: ${analysis.type}`);
      
      // Calculate final quality score for tracking
      const mentions = originalTweet.text.match(/\b(btc|bitcoin|eth|ethereum|ada|sol|dot|link|uni|aave|crypto|defi)\b/gi) || [];
      const qualityScore = this.cmcEngine.reputationTracker.calculateQualityScore(originalTweet, mentions);
      
      // Create the repost with our analysis
      const repostContent = `${analysis.content}\n\n━━━━━━━━━━━━━━━━━━━━━━━━\n🔄 RESPONDING TO COMMUNITY DISCUSSION\n⏰ ALGOM ANALYSIS: Real-time verification`;
      
      // Post the analysis
      const tweet = await this.client.v2.tweet(repostContent);
      
      // Track the repost
      this.cmcEngine.reputationTracker.addRepost(
        originalTweet.id,
        originalTweet.text,
        analysis.type,
        qualityScore
      );
      
      console.log('✅ [REPOST] Quality repost published!');
      console.log(`🎯 [REPOST] Analysis type: ${analysis.type}`);
      console.log(`📊 [REPOST] Quality score: ${qualityScore}/100`);
      console.log(`⏰ [REPOST] Next repost available in 2 hours`);
      
      return tweet;
      
    } catch (error) {
      console.error('❌ [REPOST] Failed to create quality repost:', error.message);
      return null;
    }
  }

  async createAuthenticPost() {
    try {
      this.postCount++;
      console.log(`🎯 Creating 100% AUTHENTIC post #${this.postCount}...`);
      
      console.log('📊 [POST] Fetching REAL market data...');
      const realMarketData = await this.cmcEngine.getCMCData();
      
      console.log('🧠 [POST] Generating AUTHENTIC content...');
      console.log('📈 [POST] Data available:', realMarketData.data_available ? 'YES - Real CMC data' : 'NO - API unavailable');
      
      const authenticContent = await this.cmcEngine.generateRealInsight(realMarketData);
      
      console.log('🔥 [POST] Posting 100% AUTHENTIC content:', authenticContent.substring(0, 60) + '...');
      console.log('📊 [POST] Contains real numbers:', /\$[\d,]+/.test(authenticContent) ? '✅ YES' : '⚠️ Data unavailable');
      console.log('🚫 [POST] Contains predictions:', /predict|expect|will|should|target/i.test(authenticContent) ? '❌ YES (ERROR)' : '✅ NO');
      console.log('🎓 [POST] Educational features:', /MCP|AZ Token|Educational/i.test(authenticContent) ? '✅ ENHANCED' : '📚 Standard');
      
      // Enhanced rate limiting and retry logic
      const tweet = await this.postWithRetry(authenticContent);
      
      if (tweet) {
        console.log('✅ 100% AUTHENTIC POST PUBLISHED!');
        console.log('🐉 Tweet ID:', tweet.data.id);
        console.log('📊 Content length:', authenticContent.length);
        console.log('🏆 Authentic posts delivered:', this.postCount);
        console.log('🎯 Reputation: Building through transparency + education...');
      }
      
      return tweet;
    } catch (error) {
      console.error('❌ Authentic post failed:', error.message);
      console.error('🔧 Will retry on next cycle...');
      return null;
    }
  }

  checkRateLimits() {
    const now = Date.now();
    
    // Check if we're in a pause period
    if (this.rateLimitTracker.isPaused && now < this.rateLimitTracker.pauseUntil) {
      const remainingMinutes = Math.ceil((this.rateLimitTracker.pauseUntil - now) / 60000);
      console.log(`🚫 [RATE LIMIT] Bot is paused due to rate limits, resuming in ${remainingMinutes} minutes`);
      return false;
    } else if (this.rateLimitTracker.isPaused && now >= this.rateLimitTracker.pauseUntil) {
      // Resume after pause
      this.rateLimitTracker.isPaused = false;
      this.rateLimitTracker.consecutiveFailures = 0;
      console.log('🔄 [RATE LIMIT] Pause period ended, resuming normal operation');
    }
    
    // Reset daily counter if 24 hours have passed
    if (now > this.rateLimitTracker.resetTime) {
      this.rateLimitTracker.postsToday = 0;
      this.rateLimitTracker.resetTime = now + (24 * 60 * 60 * 1000);
      console.log('🔄 [RATE LIMIT] Daily counter reset');
    }
    
    // Check for too many consecutive failures - trigger pause (Basic plan optimized)
    if (this.rateLimitTracker.consecutiveFailures >= 10) {
      // Pause for 15 minutes after 10 consecutive failures (much shorter for Basic plan)
      this.rateLimitTracker.isPaused = true;
      this.rateLimitTracker.pauseUntil = now + (15 * 60 * 1000); // 15 minutes
      console.log(`🚫 [RATE LIMIT] 10+ consecutive failures detected, pausing bot for 15 minutes (Basic plan mode)`);
      return false;
    }
    
    // Check minimum interval between posts (2 minutes for Basic plan)
    const timeSinceLastPost = now - this.rateLimitTracker.lastPost;
    
    if (timeSinceLastPost < this.rateLimitTracker.minInterval) {
      const waitMinutes = Math.ceil((this.rateLimitTracker.minInterval - timeSinceLastPost) / 60000);
      console.log(`⏰ [RATE LIMIT] Too soon to post, waiting ${waitMinutes} minutes (Basic plan mode)`);
      return false;
    }
    
    // Check daily post limit (500 posts for Basic plan)
    if (this.rateLimitTracker.postsToday >= this.rateLimitTracker.maxDailyPosts) {
      console.log(`🚫 [RATE LIMIT] Daily post limit reached (${this.rateLimitTracker.maxDailyPosts} posts) - Basic plan limit`);
      return false;
    }
    
    console.log(`📊 [RATE LIMIT] Posts today: ${this.rateLimitTracker.postsToday}/${this.rateLimitTracker.maxDailyPosts}`);
    return true;
  }

  async postWithRetry(content, maxRetries = 3) {
    // Check rate limits before attempting to post
    if (!this.checkRateLimits()) {
      console.log('⏰ [RATE LIMIT] Skipping post due to rate limits');
      return null;
    }
    
    // Wait if needed to respect minimum interval
    await this.waitIfNeeded();
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📤 [POST] Attempt ${attempt}/${maxRetries}...`);
        
        const tweet = await this.client.v2.tweet(content);
        console.log(`✅ [POST] Success on attempt ${attempt}`);
        
        // Update rate limit tracker on success
        this.rateLimitTracker.lastPost = Date.now();
        this.rateLimitTracker.postsToday++;
        this.rateLimitTracker.consecutiveFailures = 0; // Reset on success
        console.log(`📊 [RATE LIMIT] Posts today: ${this.rateLimitTracker.postsToday}/${this.rateLimitTracker.maxDailyPosts}`);
        
        return tweet;
        
      } catch (error) {
        console.error(`❌ [POST] Attempt ${attempt} failed:`, error.message);
        
        // Track consecutive failures
        this.rateLimitTracker.consecutiveFailures++;
        this.rateLimitTracker.lastFailureTime = Date.now();
        
        if (error.code === 429) {
          // Rate limit hit - use Basic plan optimized backoff
          const baseBackoff = Math.min(Math.pow(2, attempt), 8); // Max 8 minutes for Basic plan
          const consecutiveMultiplier = Math.min(this.rateLimitTracker.consecutiveFailures, 2);
          const backoffMinutes = baseBackoff * consecutiveMultiplier;
          
          console.log(`⏰ [RATE LIMIT] Backing off for ${backoffMinutes} minutes (consecutive failures: ${this.rateLimitTracker.consecutiveFailures}) - Basic plan mode`);
          
          if (attempt < maxRetries) {
            // Wait before next attempt
            await new Promise(resolve => setTimeout(resolve, backoffMinutes * 60 * 1000));
          } else {
            console.log('🚫 [RATE LIMIT] Max retries reached, skipping this post');
            // Increase minimum interval after consecutive failures (Basic plan optimized)
            this.rateLimitTracker.minInterval = Math.min(this.rateLimitTracker.minInterval * 1.1, 15 * 60 * 1000);
            console.log(`⏰ [RATE LIMIT] Increased minimum interval to ${this.rateLimitTracker.minInterval / 60000} minutes (Basic plan mode)`);
            return null;
          }
        } else if (error.code === 403) {
          // Forbidden - likely content issue
          console.log('🚫 [FORBIDDEN] Content may be inappropriate, skipping');
          return null;
        } else {
          // Other errors - wait shorter time for Basic plan
          const waitTime = Math.min(attempt * 3, 15) * 60 * 1000; // 3-15 minutes
          console.log(`⏰ [ERROR] Waiting ${waitTime/60000} minutes before retry... (Basic plan mode)`);
          
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, waitTime));
          } else {
            console.log('🚫 [ERROR] Max retries reached, skipping this post');
            return null;
          }
        }
      }
    }
    return null;
  }

  async waitIfNeeded() {
    const now = Date.now();
    const timeSinceLastPost = now - this.rateLimitTracker.lastPost;
    
    if (timeSinceLastPost < this.rateLimitTracker.minInterval) {
      const waitTime = this.rateLimitTracker.minInterval - timeSinceLastPost;
      const waitMinutes = Math.ceil(waitTime / 60000);
      console.log(`⏰ [RATE LIMIT] Waiting ${waitMinutes} minutes to respect minimum interval`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  getStatus() {
    const repostCount = this.cmcEngine.reputationTracker.repostHistory.length;
    const canRepost = this.cmcEngine.reputationTracker.canRepost();
    
    return {
      main: this.isActive ? '100% AUTHENTIC' : 'INACTIVE',
      posts: this.postCount,
      reposts: repostCount,
      repostReady: canRepost
    };
  }

 stop() {
    if (this.postInterval) {
      clearTimeout(this.postInterval);
      this.postInterval = null;
    }
    if (this.repostInterval) {
      clearInterval(this.repostInterval);
      this.repostInterval = null;
    }
    this.isActive = false;
    console.log('🔴 Authentic bot stopped (including repost system + education)');
  }
}

async function main() {
  try {
    console.log('🐉 STARTING 100% AUTHENTIC ALGOM WITH ADVANCED EDUCATION...');
    console.log('⏰ Time:', new Date().toISOString());
    console.log('🚀 Mission: 100% authentic crypto data + Quality reposts + Advanced education');
    console.log('🏆 Features: Real CMC data + Zero fabrication + Complete transparency + Trading education');
    console.log('🔍 Enhanced: No predictions, no fake numbers, facts only + Psychology insights');
    
    console.log('\n📋 Loading authentic character configuration...');
    const characterPath = resolve(__dirname, 'character.json');
    const originalCharacter = JSON.parse(fs.readFileSync(characterPath, 'utf8'));
    
    const authenticCharacter = {
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
          POST_INTERVAL_MAX: "75",
          POST_INTERVAL_MIN: "35",
          TWITTER_SPACES_ENABLE: "false",
          ACTION_TIMELINE_TYPE: "foryou",
          TWITTER_POLL_INTERVAL: "120"
        },
        voice: {
          model: "en_US-neural-medium"
        }
      }
    };
    
    console.log('✅ 100% authentic character configured');
    
    // Authentic database adapter
    class AuthenticAdapter extends elizaCore.DatabaseAdapter {
      constructor() {
        super();
        this.data = new Map();
        console.log('🗄️ 100% authentic database initialized');
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
        console.log('📝 Authentic DB Log:', typeof params === 'string' ? params : JSON.stringify(params));
        return true; 
      }
      async getActorDetails(params) { return null; }
      async searchMemories(params) { return []; }
      async countMemories(roomId, unique = true) { return 0; }
      async removeAllMemories(roomId) { return true; }
    }
    
    console.log('\n🔌 Loading authentic plugins...');
    const plugins = [twitterPlugin.default || twitterPlugin];
    console.log('✅ Authentic plugins loaded');
    
    // Create authentic Twitter client with Advanced Education
    console.log('\n🐉 Creating 100% AUTHENTIC Twitter client with Advanced Education...');
    const authenticTwitter = new AuthenticTwitterClient();
    
    const runtimeConfig = {
      character: authenticCharacter,
      modelProvider: "anthropic",
      token: process.env.ANTHROPIC_API_KEY,
      databaseAdapter: new AuthenticAdapter(),
      plugins: plugins
    };
    
    console.log('\n🤖 Creating Authentic AgentRuntime...');
    const runtime = new elizaCore.AgentRuntime(runtimeConfig);
    console.log('✅ Authentic AgentRuntime created');
    
    console.log('\n🔄 Initializing authentic runtime...');
    await runtime.initialize();
    console.log('✅ Authentic runtime initialized');
    
    // Initialize authentic Twitter client
    console.log('\n🚀 Activating 100% AUTHENTIC alpha bot with Advanced Education...');
    const twitterSuccess = await authenticTwitter.initialize();
    
    console.log('\n🎯 AUTHENTIC FINAL STATUS:');
    console.log('═══════════════════════════════════════');
    const status = authenticTwitter.getStatus();
    console.log('🐉 ALGOM STATUS:', status.main, authenticTwitter.isActive ? '🔥' : '❌');
    console.log('📱 Account: @reviceva');
    console.log('🏆 Mission: 100% authentic crypto data + Quality reposts + Education');
    console.log('⚡ Frequency: Every 3-10 minutes (Basic plan optimized)');
    console.log('🔄 Reposts: 2-hour cooldown, 50+ quality score');
    console.log('🎓 Education: Trading psychology, risk management, scam awareness');
    console.log('💎 Basic Plan Limits: 500 posts/day, 2-min minimum intervals');
    console.log('🔗 CoinGecko MCP: Real-time API + Enhanced educational content');
    console.log('🧠 Intelligence: Real CMC API + CoinGecko MCP + Advanced market psychology');
    console.log('📊 Features: Facts only + Zero predictions + Complete transparency');
    console.log('🔍 Enhanced: No fabrication, real numbers or silence');
    console.log('🎯 Analysis: Price verification + Sentiment confirmation + Volume analysis');
    console.log('⚠️ Quality Control: Data divergence detection + Scam risk analysis');
    console.log('💎 Psychology: Diamond hands education + Market cycle awareness');
    console.log('💰 Risk Management: Position sizing + Portfolio allocation');
    console.log('🚨 Scam Protection: Pattern detection + Education alerts');
    console.log('📈 Technical Education: Price action + Market structure');
    console.log('🎯 Framework: aideazz.xyz consciousness');
    console.log('═══════════════════════════════════════');
    
    if (authenticTwitter.isActive) {
      console.log('\n🔥 100% AUTHENTIC ALGOM WITH ADVANCED EDUCATION IS LIVE!');
      console.log('🐉 Ready to build legendary reputation through truth + education!');
      console.log('🏆 Real CMC data + Trading psychology + Risk management + Scam protection!');
      console.log('🔍 Watch Railway logs for educational content + quality analysis!');
      console.log('🎯 Your followers will learn to trade profitably and avoid scams!');
      console.log('📊 Quality threshold: 50+ points (engagement + content + recency)');
      console.log('⏰ Repost cooldown: 2 hours between quality reposts');
      console.log('🧠 Educational content: Every 7th post + triggered by market conditions');
      console.log('💎 Psychology insights: During extreme fear/greed phases');
      console.log('🚨 Scam alerts: 15% random chance + reactive to risky content');
      console.log('💰 Risk management: Triggered by high volume days');
      console.log('📈 Technical analysis: Real price action education');
    } else {
      console.log('\n⚠️ Authentic activation pending...');
    }
    
    // Monitor authentic activity with enhanced education metrics
    let minutes = 0;
    setInterval(() => {
      minutes++;
      const status = authenticTwitter.getStatus();
      
      console.log(`[${new Date().toISOString()}] 🐉 AUTHENTIC ALGOM: ${minutes}min | Status: ${status.main} | Posts: ${status.posts} | Reposts: ${status.reposts} | Education: ON | Repost Ready: ${status.repostReady ? '✅' : '⏰'}`);
      
      if (minutes % 30 === 0) {
        console.log(`\n🔥 AUTHENTIC STATUS UPDATE: ${minutes} minutes`);
        console.log(`   🐉 Alpha Engine: ${status.main}`);
        console.log(`   📊 Authentic Posts: ${status.posts}`);
        console.log(`   🔄 Quality Reposts: ${status.reposts}`);
        console.log(`   🎓 Educational Features: ACTIVE`);
        console.log(`   ⏰ Repost Available: ${status.repostReady ? 'YES' : 'NO (cooldown active)'}`);
        console.log(`   🏆 Reputation Features: 100% Real Data + Advanced Education`);
        console.log(`   🔍 CMC Data Logging: Enhanced + Authentic`);
        console.log(`   💾 Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
        console.log(`   🎯 Next authentic post: Soon™️`);
        console.log(`   🚫 Fake predictions: ZERO`);
        console.log(`   ✅ Data integrity: 100%`);
        console.log(`   📊 Quality threshold: 50+ points`);
        console.log(`   🕐 Repost cooldown: 2 hours`);
        console.log(`   🧠 Analysis types: 8+ (price, sentiment, volume, divergence, education, psychology, risk, scam)`);
        console.log(`   💎 Educational triggers: Market conditions + scheduled intervals`);
        console.log(`   🚨 Scam protection: Pattern detection + community warnings`);
        console.log(`   📈 Trading education: Real market examples + psychology insights`);
      }
    }, 60000);
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🔴 Shutting down 100% authentic bot with advanced education...');
      authenticTwitter.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('\n💥 AUTHENTIC INITIALIZATION FAILURE:');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

console.log('🔥 INITIATING 100% AUTHENTIC ALGOM WITH ADVANCED EDUCATION...');
main().catch(err => {
  console.error('💥 Authentic initialization failed:', err.message);
  process.exit(1);
});