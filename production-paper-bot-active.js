// 🚀 ACTIVE PAPER TRADING BOT - REAL TESTING, REAL RESULTS
// Modified strategy that ACTUALLY TRADES for real data collection
// Honesty-first approach: Track everything, report everything

import ccxt from 'ccxt';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURATION - ACTIVE TRADING MODE
const CONFIG = {
  exchange: process.env.EXCHANGE || 'bybit',
  symbol: 'BTC/USDT',
  timeframe: '5m',
  initialBalance: 10000,
  
  // MODIFIED STRATEGY - More Active
  strategy: {
    shortMA: 7,
    longMA: 25,
    rsiPeriod: 14,
    rsiOverbought: 70,
    rsiOversold: 30,
    stopLossPercent: 2,
    takeProfitPercent: 6,
    positionSizePercent: 30,
    
    // NEW: Allow entry without strict crossover
    allowTrendEntry: true,        // Trade in established trends
    minTrendStrength: 5,          // Candles in same direction
    maxPositionHoldTime: 4 * 60 * 60 * 1000, // 4 hours max hold
  },
  
  // RISK MANAGEMENT (PROFESSIONAL)
  riskManagement: {
    maxDailyLoss: 5,
    maxConsecutiveLosses: 3,
    minWinRate: 35, // More lenient for testing
    requireConfirmation: false // More active trading
  },
  
  // Exchange configs (same as before)
  bybit: {
    apiKey: process.env.BYBIT_API_KEY || '',
    secret: process.env.BYBIT_SECRET || '',
    options: { defaultType: 'spot' }
  },
  
  binance: {
    apiKey: process.env.BINANCE_API_KEY || '',
    secret: process.env.BINANCE_SECRET || '',
    options: { defaultType: 'spot' }
  }
};

class ActivePaperTradingBot {
  constructor(config) {
    this.config = config;
    this.exchange = null;
    
    // TRADING STATE
    this.balance = config.initialBalance;
    this.initialBalance = config.initialBalance;
    this.position = null;
    this.trades = [];
    
    // PERFORMANCE METRICS
    this.stats = {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalPnL: 0,
      totalPnLPercent: 0,
      bestTrade: 0,
      worstTrade: 0,
      profitFactor: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      currentStreak: 0,
      dailyPnL: 0,
      lastResetDate: new Date().toDateString()
    };
    
    // MARKET DATA
    this.candles = [];
    this.currentPrice = 0;
    this.indicators = {
      shortMA: null,
      longMA: null,
      rsi: null
    };
    
    // TREND TRACKING (NEW)
    this.trendStrength = 0;
    this.lastCrossoverCandle = 0;
    
    // RISK CONTROL
    this.riskControl = {
      tradingPaused: false,
      pauseReason: null,
      dailyLoss: 0
    };
    
    this.isRunning = false;
  }

  // INITIALIZE EXCHANGE CONNECTION
  async initialize() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🚀 ACTIVE PAPER TRADING BOT - TESTING MODE');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    try {
      const exchangeName = this.config.exchange;
      const exchangeConfig = this.config[exchangeName];
      
      if (!exchangeConfig) {
        throw new Error(`Exchange ${exchangeName} not configured`);
      }
      
      if (ccxt[exchangeName]) {
        this.exchange = new ccxt[exchangeName](exchangeConfig);
      } else {
        throw new Error(`Exchange ${exchangeName} not supported by ccxt`);
      }
      
      console.log(`🔗 Connecting to ${this.config.exchange.toUpperCase()}...`);
      await this.exchange.loadMarkets();
      const ticker = await this.exchange.fetchTicker(this.config.symbol);
      this.currentPrice = ticker.last;
      
      console.log(`✅ Connected to ${this.config.exchange.toUpperCase()}`);
      console.log(`📊 ${this.config.symbol} Current Price: $${this.currentPrice.toLocaleString()}`);
      console.log(`💰 Paper Trading Balance: $${this.balance.toLocaleString()}`);
      console.log(`📈 Strategy: ACTIVE TESTING MODE`);
      console.log(`   - MA(${this.config.strategy.shortMA}/${this.config.strategy.longMA}) + RSI(${this.config.strategy.rsiPeriod})`);
      console.log(`   - Trend Entry: ${this.config.strategy.allowTrendEntry ? 'ENABLED' : 'DISABLED'}`);
      console.log(`🛡️  Risk: ${this.config.strategy.stopLossPercent}% SL, ${this.config.strategy.takeProfitPercent}% TP\n`);
      
      await this.loadHistoricalData();
      await this.startRealTimeDataFeed();
      
      console.log('✅ ACTIVE BOT READY - WILL TRADE SOON!\n');
      console.log('💡 HONEST REPORTING: Every trade tracked, wins AND losses posted');
      console.log('📊 Goal: Test strategy, refine based on real results\n');
      console.log('═══════════════════════════════════════════════════════════\n');
      
      return true;
      
    } catch (error) {
      console.error('❌ INITIALIZATION FAILED:', error.message);
      return false;
    }
  }

  async loadHistoricalData() {
    console.log('📈 Loading historical data...');
    
    const ohlcv = await this.exchange.fetchOHLCV(
      this.config.symbol,
      this.config.timeframe,
      undefined,
      100
    );
    
    this.candles = ohlcv.map(candle => ({
      timestamp: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5]
    }));
    
    console.log(`✅ Loaded ${this.candles.length} candles`);
    this.calculateIndicators();
    this.calculateTrendStrength();
    
    console.log(`📊 Initial Indicators:`);
    console.log(`   Short MA(${this.config.strategy.shortMA}): $${this.indicators.shortMA?.toFixed(2)}`);
    console.log(`   Long MA(${this.config.strategy.longMA}): $${this.indicators.longMA?.toFixed(2)}`);
    console.log(`   RSI(${this.config.strategy.rsiPeriod}): ${this.indicators.rsi?.toFixed(2)}`);
    console.log(`   Trend Strength: ${this.trendStrength} candles\n`);
  }

  startRealTimeDataFeed() {
    console.log('📡 Starting real-time price polling...');
    
    const pollInterval = 5 * 60 * 1000; // 5 minutes
    
    console.log(`✅ Polling started - checking every 5 minutes\n`);
    
    this.isRunning = true;
    this.pollNewCandle();
    
    setInterval(() => {
      if (this.isRunning) {
        this.pollNewCandle();
      }
    }, pollInterval);
  }

  async pollNewCandle() {
    try {
      const ohlcv = await this.exchange.fetchOHLCV(
        this.config.symbol,
        this.config.timeframe,
        undefined,
        2
      );
      
      if (ohlcv && ohlcv.length >= 2) {
        const latestCandle = ohlcv[ohlcv.length - 2];
        
        const candle = {
          timestamp: latestCandle[0],
          open: latestCandle[1],
          high: latestCandle[2],
          low: latestCandle[3],
          close: latestCandle[4],
          volume: latestCandle[5]
        };
        
        if (this.candles.length === 0 || candle.timestamp > this.candles[this.candles.length - 1].timestamp) {
          this.onNewCandle(candle);
        } else {
          console.log(`⏳ Waiting for new candle... Current: ${new Date().toLocaleTimeString()}`);
        }
        
        this.currentPrice = ohlcv[ohlcv.length - 1][4];
      }
    } catch (error) {
      console.error('⚠️ Error polling candle:', error.message);
    }
  }

  onNewCandle(candle) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🕐 NEW CANDLE: ${new Date(candle.timestamp).toLocaleString()}`);
    console.log(`   Price: $${candle.close.toLocaleString()} | Volume: ${candle.volume.toFixed(2)}`);
    
    this.candles.push(candle);
    if (this.candles.length > 100) {
      this.candles.shift();
    }
    
    this.calculateIndicators();
    this.calculateTrendStrength();
    
    if (this.checkRiskControls()) {
      console.log('⚠️  TRADING PAUSED:', this.riskControl.pauseReason);
      return;
    }
    
    this.executeActiveStrategy();
    
    if (this.position) {
      this.updatePosition();
    }
    
    this.exportStats();
    
    console.log(`${'─'.repeat(60)}`);
  }

  calculateIndicators() {
    const closes = this.candles.map(c => c.close);
    
    if (closes.length >= this.config.strategy.longMA) {
      this.indicators.shortMA = this.calculateMA(closes, this.config.strategy.shortMA);
      this.indicators.longMA = this.calculateMA(closes, this.config.strategy.longMA);
    }
    
    if (closes.length >= this.config.strategy.rsiPeriod + 1) {
      this.indicators.rsi = this.calculateRSI(closes, this.config.strategy.rsiPeriod);
    }
  }

  calculateMA(data, period) {
    const slice = data.slice(-period);
    return slice.reduce((sum, val) => sum + val, 0) / period;
  }

  calculateRSI(data, period) {
    const changes = [];
    for (let i = 1; i < data.length; i++) {
      changes.push(data[i] - data[i - 1]);
    }
    
    const recentChanges = changes.slice(-period);
    const gains = recentChanges.filter(c => c > 0);
    const losses = recentChanges.filter(c => c < 0).map(c => Math.abs(c));
    
    const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  // NEW: Calculate trend strength
  calculateTrendStrength() {
    if (this.candles.length < 10) {
      this.trendStrength = 0;
      return;
    }
    
    const recentCandles = this.candles.slice(-10);
    let upCandles = 0;
    
    for (let i = 1; i < recentCandles.length; i++) {
      if (recentCandles[i].close > recentCandles[i-1].close) {
        upCandles++;
      }
    }
    
    // Trend strength = consecutive candles in same direction
    this.trendStrength = upCandles >= 6 ? upCandles : -(9 - upCandles);
  }

  // MODIFIED STRATEGY - ACTIVE TRADING MODE
  executeActiveStrategy() {
    const { shortMA, longMA, rsi } = this.indicators;
    
    if (!shortMA || !longMA || !rsi) {
      console.log('⏳ Waiting for indicators to initialize...');
      return;
    }
    
    console.log(`\n📊 INDICATORS:`);
    console.log(`   Short MA(${this.config.strategy.shortMA}): $${shortMA.toFixed(2)}`);
    console.log(`   Long MA(${this.config.strategy.longMA}): $${longMA.toFixed(2)}`);
    console.log(`   RSI(${this.config.strategy.rsiPeriod}): ${rsi.toFixed(2)}`);
    console.log(`   Trend Strength: ${this.trendStrength > 0 ? '+' : ''}${this.trendStrength}`);
    
    // ENTRY LOGIC: Multiple conditions for realistic trading
    if (!this.position) {
      let entryReason = null;
      
      // 1. CLASSIC CROSSOVER (Best signal)
      const prevShortMA = this.calculateMA(
        this.candles.slice(0, -1).map(c => c.close),
        this.config.strategy.shortMA
      );
      const prevLongMA = this.calculateMA(
        this.candles.slice(0, -1).map(c => c.close),
        this.config.strategy.longMA
      );
      
      if (shortMA > longMA && prevShortMA <= prevLongMA && rsi < this.config.strategy.rsiOverbought) {
        entryReason = 'CROSSOVER (Classic signal)';
      }
      
      // 2. STRONG TREND ENTRY (NEW - Makes bot more active)
      else if (this.config.strategy.allowTrendEntry &&
               shortMA > longMA && 
               this.trendStrength >= this.config.strategy.minTrendStrength &&
               rsi > 40 && rsi < 65) {
        entryReason = 'TREND_CONTINUATION (Strong uptrend)';
      }
      
      // 3. OVERSOLD BOUNCE (Additional opportunity)
      else if (shortMA > longMA && 
               rsi < this.config.strategy.rsiOversold + 5 && 
               this.currentPrice > shortMA) {
        entryReason = 'OVERSOLD_BOUNCE (RSI recovery)';
      }
      
      if (entryReason) {
        console.log(`🎯 BUY SIGNAL: ${entryReason}`);
        this.openPosition('LONG', entryReason);
      } else {
        console.log(`⏳ No entry signal (waiting for opportunity)`);
      }
    }
    
    // EXIT LOGIC
    if (this.position) {
      // 1. Sell signal (MA crossover down)
      if (shortMA < longMA) {
        const prevShortMA = this.calculateMA(
          this.candles.slice(0, -1).map(c => c.close),
          this.config.strategy.shortMA
        );
        const prevLongMA = this.calculateMA(
          this.candles.slice(0, -1).map(c => c.close),
          this.config.strategy.longMA
        );
        
        if (prevShortMA >= prevLongMA) {
          console.log('🎯 SELL SIGNAL: MA Crossover down');
          this.closePosition('SIGNAL');
          return;
        }
      }
      
      // 2. Time-based exit (prevent stuck positions)
      const holdTime = Date.now() - this.position.openTime;
      if (holdTime > this.config.strategy.maxPositionHoldTime) {
        console.log('⏰ TIME EXIT: Max hold time reached');
        this.closePosition('TIME_LIMIT');
      }
    }
  }

  openPosition(side, reason = 'SIGNAL') {
    const positionSize = this.balance * (this.config.strategy.positionSizePercent / 100);
    const amount = positionSize / this.currentPrice;
    
    const stopLoss = this.currentPrice * (1 - this.config.strategy.stopLossPercent / 100);
    const takeProfit = this.currentPrice * (1 + this.config.strategy.takeProfitPercent / 100);
    
    this.position = {
      side,
      entryPrice: this.currentPrice,
      amount,
      invested: positionSize,
      stopLoss,
      takeProfit,
      openTime: Date.now(),
      entryReason: reason
    };
    
    this.balance -= positionSize;
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log('🟢 POSITION OPENED (PAPER TRADE)');
    console.log(`${'═'.repeat(60)}`);
    console.log(`   Reason: ${reason}`);
    console.log(`   Entry: $${this.currentPrice.toLocaleString()}`);
    console.log(`   Amount: ${amount.toFixed(6)} BTC`);
    console.log(`   Value: $${positionSize.toLocaleString()}`);
    console.log(`   Stop Loss: $${stopLoss.toLocaleString()} (-${this.config.strategy.stopLossPercent}%)`);
    console.log(`   Take Profit: $${takeProfit.toLocaleString()} (+${this.config.strategy.takeProfitPercent}%)`);
    console.log(`   Balance: $${this.balance.toLocaleString()}`);
    console.log(`${'═'.repeat(60)}\n`);
  }

  updatePosition() {
    if (!this.position) return;
    
    const currentValue = this.position.amount * this.currentPrice;
    const unrealizedPnL = currentValue - this.position.invested;
    const unrealizedPnLPercent = (unrealizedPnL / this.position.invested) * 100;
    
    if (this.currentPrice <= this.position.stopLoss) {
      console.log(`\n🔴 STOP LOSS TRIGGERED at $${this.currentPrice.toLocaleString()}`);
      this.closePosition('STOP_LOSS');
      return;
    }
    
    if (this.currentPrice >= this.position.takeProfit) {
      console.log(`\n🟢 TAKE PROFIT TRIGGERED at $${this.currentPrice.toLocaleString()}`);
      this.closePosition('TAKE_PROFIT');
      return;
    }
    
    console.log(`   📊 Open Position: ${unrealizedPnLPercent >= 0 ? '🟢' : '🔴'} ${unrealizedPnLPercent.toFixed(2)}% ($${unrealizedPnL.toFixed(2)})`);
  }

  closePosition(reason) {
    if (!this.position) return;
    
    const exitPrice = this.currentPrice;
    const exitValue = this.position.amount * exitPrice;
    const pnl = exitValue - this.position.invested;
    const pnlPercent = (pnl / this.position.invested) * 100;
    const holdTime = Date.now() - this.position.openTime;
    
    const trade = {
      id: Date.now(),
      symbol: this.config.symbol,
      side: this.position.side,
      entryPrice: this.position.entryPrice,
      exitPrice,
      amount: this.position.amount,
      pnl,
      pnlPercent,
      holdTime,
      reason,
      entryReason: this.position.entryReason,
      timestamp: new Date().toISOString()
    };
    
    this.trades.push(trade);
    this.balance += exitValue;
    
    this.updateStats(trade);
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`${pnl >= 0 ? '🟢' : '🔴'} POSITION CLOSED (${reason})`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`   Entry Reason: ${this.position.entryReason}`);
    console.log(`   Entry: $${this.position.entryPrice.toLocaleString()}`);
    console.log(`   Exit: $${exitPrice.toLocaleString()}`);
    console.log(`   P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnl >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%)`);
    console.log(`   Hold Time: ${Math.round(holdTime / 60000)} minutes`);
    console.log(`   New Balance: $${this.balance.toLocaleString()}`);
    console.log(`${'═'.repeat(60)}\n`);
    
    this.position = null;
  }

  updateStats(trade) {
    this.stats.totalTrades++;
    
    if (trade.pnl > 0) {
      this.stats.wins++;
      this.stats.consecutiveWins++;
      this.stats.consecutiveLosses = 0;
      this.stats.currentStreak = this.stats.consecutiveWins;
    } else {
      this.stats.losses++;
      this.stats.consecutiveLosses++;
      this.stats.consecutiveWins = 0;
      this.stats.currentStreak = -this.stats.consecutiveLosses;
    }
    
    this.stats.winRate = (this.stats.wins / this.stats.totalTrades) * 100;
    this.stats.totalPnL += trade.pnl;
    this.stats.totalPnLPercent = ((this.balance - this.initialBalance) / this.initialBalance) * 100;
    this.stats.dailyPnL += trade.pnl;
    
    this.stats.bestTrade = Math.max(this.stats.bestTrade, trade.pnl);
    this.stats.worstTrade = Math.min(this.stats.worstTrade, trade.pnl);
    
    const totalWins = this.trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
    const totalLosses = Math.abs(this.trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
    this.stats.profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins;
    
    console.log(`\n📊 UPDATED STATS:`);
    console.log(`   Total Trades: ${this.stats.totalTrades}`);
    console.log(`   Win Rate: ${this.stats.winRate.toFixed(2)}% (${this.stats.wins}W/${this.stats.losses}L)`);
    console.log(`   Total P&L: ${this.stats.totalPnL >= 0 ? '+' : ''}$${this.stats.totalPnL.toFixed(2)} (${this.stats.totalPnL >= 0 ? '+' : ''}${this.stats.totalPnLPercent.toFixed(2)}%)`);
    console.log(`   Profit Factor: ${this.stats.profitFactor.toFixed(2)}`);
    console.log(`   Current Streak: ${this.stats.currentStreak > 0 ? 'WIN' : 'LOSS'} ${Math.abs(this.stats.currentStreak)}`);
  }

  checkRiskControls() {
    const today = new Date().toDateString();
    if (today !== this.stats.lastResetDate) {
      this.stats.dailyPnL = 0;
      this.stats.lastResetDate = today;
      this.riskControl.dailyLoss = 0;
      this.riskControl.tradingPaused = false;
      console.log('\n📅 NEW TRADING DAY - Stats reset\n');
    }
    
    const dailyLossPercent = (this.stats.dailyPnL / this.initialBalance) * 100;
    if (dailyLossPercent < -this.config.riskManagement.maxDailyLoss) {
      this.riskControl.tradingPaused = true;
      this.riskControl.pauseReason = `Max daily loss reached (${dailyLossPercent.toFixed(2)}%)`;
      return true;
    }
    
    if (this.stats.consecutiveLosses >= this.config.riskManagement.maxConsecutiveLosses) {
      this.riskControl.tradingPaused = true;
      this.riskControl.pauseReason = `${this.stats.consecutiveLosses} consecutive losses - pausing`;
      return true;
    }
    
    if (this.stats.totalTrades >= 10 && this.stats.winRate < this.config.riskManagement.minWinRate) {
      this.riskControl.tradingPaused = true;
      this.riskControl.pauseReason = `Win rate ${this.stats.winRate.toFixed(2)}% below minimum ${this.config.riskManagement.minWinRate}%`;
      return true;
    }
    
    return false;
  }

  async exportStats() {
    const statsData = {
      exchange: this.config.exchange,
      timestamp: new Date().toISOString(),
      balance: this.balance,
      totalPnL: this.stats.totalPnL,
      totalPnLPercent: this.stats.totalPnLPercent,
      totalTrades: this.stats.totalTrades,
      wins: this.stats.wins,
      losses: this.stats.losses,
      winRate: this.stats.winRate,
      profitFactor: this.stats.profitFactor,
      bestTrade: this.stats.bestTrade,
      worstTrade: this.stats.worstTrade,
      currentStreak: this.stats.currentStreak,
      recentTrades: this.trades.slice(-10),
      currentPosition: this.position,
      riskControl: this.riskControl,
      strategyMode: 'ACTIVE_TESTING'
    };
    
    try {
      const exchangeName = this.config.exchange.toLowerCase();
      const statsPath = path.join(__dirname, `${exchangeName}_trading_stats.json`);
      await fs.writeFile(statsPath, JSON.stringify(statsData, null, 2));
      
      const genericStatsPath = path.join(__dirname, 'trading_stats.json');
      await fs.writeFile(genericStatsPath, JSON.stringify(statsData, null, 2));
    } catch (error) {
      console.error('⚠️  Failed to export stats:', error.message);
    }
  }

  stop() {
    console.log('\n🛑 Stopping Active Paper Trading Bot...');
    this.isRunning = false;
    this.generateReport();
  }

  generateReport() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 ACTIVE PAPER TRADING REPORT');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Exchange: ${this.config.exchange.toUpperCase()}`);
    console.log(`Mode: ACTIVE TESTING`);
    console.log('───────────────────────────────────────────────────────────');
    console.log(`Initial Balance: $${this.initialBalance.toLocaleString()}`);
    console.log(`Current Balance: $${this.balance.toLocaleString()}`);
    console.log(`Total P&L: ${this.stats.totalPnL >= 0 ? '🟢' : '🔴'} ${this.stats.totalPnL >= 0 ? '+' : ''}$${this.stats.totalPnL.toFixed(2)} (${this.stats.totalPnL >= 0 ? '+' : ''}${this.stats.totalPnLPercent.toFixed(2)}%)`);
    console.log('───────────────────────────────────────────────────────────');
    console.log(`Total Trades: ${this.stats.totalTrades}`);
    console.log(`Wins: ${this.stats.wins} | Losses: ${this.stats.losses}`);
    console.log(`Win Rate: ${this.stats.winRate.toFixed(2)}%`);
    console.log(`Profit Factor: ${this.stats.profitFactor.toFixed(2)}`);
    console.log('═══════════════════════════════════════════════════════════\n');
  }
}

// MAIN EXECUTION
async function main() {
  console.log('\n🚀 ACTIVE PAPER TRADING BOT - HONEST TESTING MODE\n');
  
  const bot = new ActivePaperTradingBot(CONFIG);
  
  const initialized = await bot.initialize();
  
  if (!initialized) {
    console.error('❌ Failed to initialize bot');
    process.exit(1);
  }
  
  setInterval(() => {
    bot.generateReport();
  }, 60 * 60 * 1000);
  
  process.on('SIGINT', () => {
    bot.stop();
    process.exit(0);
  });
}

main().catch(console.error);
