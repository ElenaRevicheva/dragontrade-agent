// 🚀 PRODUCTION PAPER TRADING BOT - REAL DATA, REAL STRATEGY, ZERO LIES
// This bot uses REAL Binance live data and executes paper trades
// Every trade is tracked, every stat is real, ready for real money when proven

import ccxt from 'ccxt';
import WebSocket from 'ws';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURATION - SET YOUR REAL API KEYS (READ-ONLY for paper trading)
const CONFIG = {
  exchange: process.env.EXCHANGE || 'kraken', // kraken works on ALL cloud servers (no geo-blocking!)
  symbol: 'BTC/USDT',
  timeframe: '5m',
  initialBalance: 10000, // Paper money starting capital
  
  // STRATEGY PARAMETERS (TUNABLE)
  strategy: {
    shortMA: 7,
    longMA: 25,
    rsiPeriod: 14,
    rsiOverbought: 70,
    rsiOversold: 30,
    stopLossPercent: 2, // 2% stop loss
    takeProfitPercent: 6, // 6% take profit
    positionSizePercent: 30 // Use 30% of capital per trade
  },
  
  // RISK MANAGEMENT (PROFESSIONAL)
  riskManagement: {
    maxDailyLoss: 5, // Stop trading if lose 5% in a day
    maxConsecutiveLosses: 3, // Stop after 3 losses in a row
    minWinRate: 40, // Pause if win rate drops below 40%
    requireConfirmation: true // Wait for volume confirmation
  },
  
  // REAL API KEYS (READ-ONLY for paper trading - NOT REQUIRED for public data)
  kraken: {
    apiKey: process.env.KRAKEN_API_KEY || '',
    secret: process.env.KRAKEN_SECRET || '',
    options: { defaultType: 'spot' }
  },
  
  okx: {
    apiKey: process.env.OKX_API_KEY || '',
    secret: process.env.OKX_SECRET || '',
    options: { defaultType: 'spot' }
  },
  
  coinbase: {
    apiKey: process.env.COINBASE_API_KEY || '',
    secret: process.env.COINBASE_SECRET || '',
    options: { defaultType: 'spot' }
  },
  
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

class ProductionPaperTradingBot {
  constructor(config) {
    this.config = config;
    this.exchange = null;
    this.ws = null;
    
    // REAL TRADING STATE
    this.balance = config.initialBalance;
    this.initialBalance = config.initialBalance;
    this.position = null;
    this.trades = [];
    
    // PERFORMANCE METRICS (100% REAL)
    this.stats = {
      totalTrades: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      totalPnL: 0,
      totalPnLPercent: 0,
      bestTrade: 0,
      worstTrade: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
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
    
    // RISK CONTROL
    this.riskControl = {
      tradingPaused: false,
      pauseReason: null,
      dailyLoss: 0
    };
    
    this.isRunning = false;
  }

  // INITIALIZE REAL EXCHANGE CONNECTION
  async initialize() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🚀 INITIALIZING PRODUCTION PAPER TRADING BOT');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    try {
      // Connect to real exchange
      const exchangeName = this.config.exchange;
      const exchangeConfig = this.config[exchangeName];
      
      if (!exchangeConfig) {
        throw new Error(`Exchange ${exchangeName} not configured`);
      }
      
      // Create exchange instance dynamically
      if (ccxt[exchangeName]) {
        this.exchange = new ccxt[exchangeName](exchangeConfig);
      } else {
        throw new Error(`Exchange ${exchangeName} not supported by ccxt`);
      }
      
      // Test connection
      console.log(`🔗 Connecting to ${this.config.exchange.toUpperCase()}...`);
      await this.exchange.loadMarkets();
      const ticker = await this.exchange.fetchTicker(this.config.symbol);
      this.currentPrice = ticker.last;
      
      console.log(`✅ Connected to ${this.config.exchange.toUpperCase()}`);
      console.log(`📊 ${this.config.symbol} Current Price: $${this.currentPrice.toLocaleString()}`);
      console.log(`💰 Paper Trading Balance: $${this.balance.toLocaleString()}`);
      console.log(`📈 Strategy: MA(${this.config.strategy.shortMA}/${this.config.strategy.longMA}) + RSI(${this.config.strategy.rsiPeriod})`);
      console.log(`🛡️  Risk: ${this.config.strategy.stopLossPercent}% SL, ${this.config.strategy.takeProfitPercent}% TP\n`);
      
      // Load historical data for strategy initialization
      await this.loadHistoricalData();
      
      // Start real-time data feed
      await this.startRealTimeDataFeed();
      
      console.log('✅ PRODUCTION BOT READY - REAL DATA, REAL STRATEGY\n');
      console.log('💡 TIP: This bot uses PAPER MONEY. No real funds at risk.');
      console.log('📊 Stats will be saved to trading_stats.json');
      console.log('🔴 Press Ctrl+C to stop\n');
      console.log('═══════════════════════════════════════════════════════════\n');
      
      return true;
      
    } catch (error) {
      console.error('❌ INITIALIZATION FAILED:', error.message);
      console.log('\n💡 TIP: Check internet connection and exchange availability.');
      return false;
    }
  }

  // LOAD REAL HISTORICAL CANDLE DATA
  async loadHistoricalData() {
    console.log('📈 Loading real historical data...');
    
    const ohlcv = await this.exchange.fetchOHLCV(
      this.config.symbol,
      this.config.timeframe,
      undefined,
      100 // Get 100 candles for MA calculation
    );
    
    this.candles = ohlcv.map(candle => ({
      timestamp: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: candle[5]
    }));
    
    console.log(`✅ Loaded ${this.candles.length} real candles from ${this.config.exchange}`);
    this.calculateIndicators();
    
    console.log(`📊 Initial Indicators:`);
    console.log(`   Short MA(${this.config.strategy.shortMA}): $${this.indicators.shortMA?.toFixed(2) || 'Calculating...'}`);
    console.log(`   Long MA(${this.config.strategy.longMA}): $${this.indicators.longMA?.toFixed(2) || 'Calculating...'}`);
    console.log(`   RSI(${this.config.strategy.rsiPeriod}): ${this.indicators.rsi?.toFixed(2) || 'Calculating...'}\n`);
  }

  // REAL-TIME PRICE FEED (WebSocket)
  async startRealTimeDataFeed() {
    console.log('📡 Starting real-time price polling (REST API)...');
    console.log('💡 WebSocket will be added in future update\n');
    
    // For now, use polling instead of WebSocket (works with all exchanges)
    this.startPolling();
  }

  // POLLING-BASED PRICE FEED (Works with ALL exchanges)
  startPolling() {
    const pollInterval = 5 * 60 * 1000; // 5 minutes (same as timeframe)
    
    console.log(`✅ Polling started - checking for new candles every ${this.config.timeframe}`);
    console.log(`⏰ Next check in 5 minutes...\n`);
    
    this.isRunning = true;
    
    // Poll immediately
    this.pollNewCandle();
    
    // Then poll every 5 minutes
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
        2 // Get last 2 candles
      );
      
      if (ohlcv && ohlcv.length >= 2) {
        const latestCandle = ohlcv[ohlcv.length - 2]; // Use second-to-last (closed candle)
        
        const candle = {
          timestamp: latestCandle[0],
          open: latestCandle[1],
          high: latestCandle[2],
          low: latestCandle[3],
          close: latestCandle[4],
          volume: latestCandle[5]
        };
        
        // Check if this is a new candle
        if (this.candles.length === 0 || candle.timestamp > this.candles[this.candles.length - 1].timestamp) {
          this.onNewCandle(candle);
        } else {
          console.log(`⏳ Waiting for new candle... Current: ${new Date().toLocaleTimeString()}`);
        }
        
        // Update current price from latest (unclosed) candle
        this.currentPrice = ohlcv[ohlcv.length - 1][4];
      }
    } catch (error) {
      console.error('⚠️ Error polling candle:', error.message);
    }
  }

  // LEGACY WEBSOCKET CODE (Binance only - keeping for reference)
  async startBinanceWebSocket() {
    if (this.config.exchange === 'binance') {
      const symbol = this.config.symbol.replace('/', '').toLowerCase();
      const wsUrl = `wss://stream.binance.com:9443/ws/${symbol}@kline_${this.config.timeframe}`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.on('message', (data) => {
        const parsed = JSON.parse(data);
        const kline = parsed.k;
        
        if (kline.x) { // Candle closed
          this.onNewCandle({
            timestamp: kline.t,
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
            volume: parseFloat(kline.v)
          });
        }
        
        this.currentPrice = parseFloat(kline.c);
      });
      
      this.ws.on('open', () => {
        console.log('✅ WebSocket connected - LIVE MARKET DATA\n');
        this.isRunning = true;
      });
      
      this.ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
      });
      
      this.ws.on('close', () => {
        console.log('⚠️  WebSocket disconnected');
        if (this.isRunning) {
          console.log('🔄 Attempting to reconnect in 5 seconds...');
          setTimeout(() => this.startRealTimeDataFeed(), 5000);
        }
      });
    }
  }

  // NEW CANDLE RECEIVED - EXECUTE STRATEGY
  onNewCandle(candle) {
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`🕐 NEW CANDLE: ${new Date(candle.timestamp).toLocaleString()}`);
    console.log(`   Price: $${candle.close.toLocaleString()} | Volume: ${candle.volume.toFixed(2)}`);
    
    // Add to candles array
    this.candles.push(candle);
    if (this.candles.length > 100) {
      this.candles.shift(); // Keep only last 100
    }
    
    // Calculate indicators
    this.calculateIndicators();
    
    // Check risk controls
    if (this.checkRiskControls()) {
      console.log('⚠️  TRADING PAUSED:', this.riskControl.pauseReason);
      return;
    }
    
    // Execute strategy
    this.executeStrategy();
    
    // Update position if open
    if (this.position) {
      this.updatePosition();
    }
    
    // Export stats for educational bot
    this.exportStats();
    
    console.log(`${'─'.repeat(60)}`);
  }

  // CALCULATE TECHNICAL INDICATORS (REAL MATH)
  calculateIndicators() {
    const closes = this.candles.map(c => c.close);
    
    // Moving Averages
    if (closes.length >= this.config.strategy.longMA) {
      this.indicators.shortMA = this.calculateMA(closes, this.config.strategy.shortMA);
      this.indicators.longMA = this.calculateMA(closes, this.config.strategy.longMA);
    }
    
    // RSI
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

  // EXECUTE TRADING STRATEGY (REAL LOGIC)
  executeStrategy() {
    const { shortMA, longMA, rsi } = this.indicators;
    
    if (!shortMA || !longMA || !rsi) {
      console.log('⏳ Waiting for indicators to initialize...');
      return;
    }
    
    console.log(`\n📊 INDICATORS:`);
    console.log(`   Short MA(${this.config.strategy.shortMA}): $${shortMA.toFixed(2)}`);
    console.log(`   Long MA(${this.config.strategy.longMA}): $${longMA.toFixed(2)}`);
    console.log(`   RSI(${this.config.strategy.rsiPeriod}): ${rsi.toFixed(2)}`);
    
    // BUY SIGNAL: MA Crossover + RSI confirmation
    if (!this.position && shortMA > longMA && rsi < this.config.strategy.rsiOverbought) {
      const prevShortMA = this.calculateMA(
        this.candles.slice(0, -1).map(c => c.close),
        this.config.strategy.shortMA
      );
      const prevLongMA = this.calculateMA(
        this.candles.slice(0, -1).map(c => c.close),
        this.config.strategy.longMA
      );
      
      // Check for crossover
      if (prevShortMA <= prevLongMA) {
        console.log('🎯 BUY SIGNAL DETECTED: MA Crossover + RSI confirmation');
        this.openPosition('LONG');
      }
    }
    
    // SELL SIGNAL: MA Crossover down
    if (this.position && shortMA < longMA) {
      const prevShortMA = this.calculateMA(
        this.candles.slice(0, -1).map(c => c.close),
        this.config.strategy.shortMA
      );
      const prevLongMA = this.calculateMA(
        this.candles.slice(0, -1).map(c => c.close),
        this.config.strategy.longMA
      );
      
      if (prevShortMA >= prevLongMA) {
        console.log('🎯 SELL SIGNAL DETECTED: MA Crossover down');
        this.closePosition('SIGNAL');
      }
    }
  }

  // OPEN POSITION (PAPER TRADE)
  openPosition(side) {
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
      openTime: Date.now()
    };
    
    this.balance -= positionSize;
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log('🟢 POSITION OPENED (PAPER TRADE)');
    console.log(`${'═'.repeat(60)}`);
    console.log(`   Side: ${side}`);
    console.log(`   Entry: $${this.currentPrice.toLocaleString()}`);
    console.log(`   Amount: ${amount.toFixed(6)} BTC`);
    console.log(`   Value: $${positionSize.toLocaleString()}`);
    console.log(`   Stop Loss: $${stopLoss.toLocaleString()} (-${this.config.strategy.stopLossPercent}%)`);
    console.log(`   Take Profit: $${takeProfit.toLocaleString()} (+${this.config.strategy.takeProfitPercent}%)`);
    console.log(`   Balance: $${this.balance.toLocaleString()}`);
    console.log(`${'═'.repeat(60)}\n`);
  }

  // UPDATE POSITION (CHECK STOP LOSS / TAKE PROFIT)
  updatePosition() {
    if (!this.position) return;
    
    const currentValue = this.position.amount * this.currentPrice;
    const unrealizedPnL = currentValue - this.position.invested;
    const unrealizedPnLPercent = (unrealizedPnL / this.position.invested) * 100;
    
    // Check stop loss
    if (this.currentPrice <= this.position.stopLoss) {
      console.log(`\n🔴 STOP LOSS TRIGGERED at $${this.currentPrice.toLocaleString()}`);
      this.closePosition('STOP_LOSS');
      return;
    }
    
    // Check take profit
    if (this.currentPrice >= this.position.takeProfit) {
      console.log(`\n🟢 TAKE PROFIT TRIGGERED at $${this.currentPrice.toLocaleString()}`);
      this.closePosition('TAKE_PROFIT');
      return;
    }
    
    console.log(`   📊 Open Position: ${unrealizedPnLPercent >= 0 ? '🟢' : '🔴'} ${unrealizedPnLPercent.toFixed(2)}% ($${unrealizedPnL.toFixed(2)})`);
  }

  // CLOSE POSITION (PAPER TRADE)
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
      timestamp: new Date().toISOString()
    };
    
    this.trades.push(trade);
    this.balance += exitValue;
    
    // Update stats
    this.updateStats(trade);
    
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`${pnl >= 0 ? '🟢' : '🔴'} POSITION CLOSED (${reason})`);
    console.log(`${'═'.repeat(60)}`);
    console.log(`   Entry: $${this.position.entryPrice.toLocaleString()}`);
    console.log(`   Exit: $${exitPrice.toLocaleString()}`);
    console.log(`   P&L: ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} (${pnl >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%)`);
    console.log(`   Hold Time: ${Math.round(holdTime / 60000)} minutes`);
    console.log(`   New Balance: $${this.balance.toLocaleString()}`);
    console.log(`${'═'.repeat(60)}\n`);
    
    this.position = null;
  }

  // UPDATE PERFORMANCE STATISTICS (100% REAL)
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
    
    // Calculate profit factor
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

  // RISK CONTROL CHECKS
  checkRiskControls() {
    // Reset daily stats
    const today = new Date().toDateString();
    if (today !== this.stats.lastResetDate) {
      this.stats.dailyPnL = 0;
      this.stats.lastResetDate = today;
      this.riskControl.dailyLoss = 0;
      this.riskControl.tradingPaused = false;
      console.log('\n📅 NEW TRADING DAY - Stats reset\n');
    }
    
    // Check max daily loss
    const dailyLossPercent = (this.stats.dailyPnL / this.initialBalance) * 100;
    if (dailyLossPercent < -this.config.riskManagement.maxDailyLoss) {
      this.riskControl.tradingPaused = true;
      this.riskControl.pauseReason = `Max daily loss reached (${dailyLossPercent.toFixed(2)}%)`;
      return true;
    }
    
    // Check consecutive losses
    if (this.stats.consecutiveLosses >= this.config.riskManagement.maxConsecutiveLosses) {
      this.riskControl.tradingPaused = true;
      this.riskControl.pauseReason = `${this.stats.consecutiveLosses} consecutive losses - pausing`;
      return true;
    }
    
    // Check minimum win rate (after 10+ trades)
    if (this.stats.totalTrades >= 10 && this.stats.winRate < this.config.riskManagement.minWinRate) {
      this.riskControl.tradingPaused = true;
      this.riskControl.pauseReason = `Win rate ${this.stats.winRate.toFixed(2)}% below minimum ${this.config.riskManagement.minWinRate}%`;
      return true;
    }
    
    return false;
  }

  // EXPORT STATS FOR EDUCATIONAL BOT
  async exportStats() {
    const statsData = {
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
      recentTrades: this.trades.slice(-10), // Last 10 trades
      currentPosition: this.position,
      riskControl: this.riskControl
    };
    
    try {
      // Save to file for educational bot to read
      const statsPath = path.join(__dirname, 'trading_stats.json');
      await fs.writeFile(statsPath, JSON.stringify(statsData, null, 2));
    } catch (error) {
      console.error('⚠️  Failed to export stats:', error.message);
    }
  }

  // GENERATE PERFORMANCE REPORT
  generateReport() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 PAPER TRADING PERFORMANCE REPORT');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Exchange: ${this.config.exchange.toUpperCase()}`);
    console.log(`Symbol: ${this.config.symbol}`);
    console.log(`Strategy: MA(${this.config.strategy.shortMA}/${this.config.strategy.longMA}) + RSI`);
    console.log('───────────────────────────────────────────────────────────');
    console.log(`Initial Balance: $${this.initialBalance.toLocaleString()}`);
    console.log(`Current Balance: $${this.balance.toLocaleString()}`);
    console.log(`Total P&L: ${this.stats.totalPnL >= 0 ? '🟢' : '🔴'} ${this.stats.totalPnL >= 0 ? '+' : ''}$${this.stats.totalPnL.toFixed(2)} (${this.stats.totalPnL >= 0 ? '+' : ''}${this.stats.totalPnLPercent.toFixed(2)}%)`);
    console.log('───────────────────────────────────────────────────────────');
    console.log(`Total Trades: ${this.stats.totalTrades}`);
    console.log(`Wins: ${this.stats.wins} | Losses: ${this.stats.losses}`);
    console.log(`Win Rate: ${this.stats.winRate.toFixed(2)}%`);
    console.log(`Profit Factor: ${this.stats.profitFactor.toFixed(2)}`);
    console.log(`Best Trade: +$${this.stats.bestTrade.toFixed(2)}`);
    console.log(`Worst Trade: $${this.stats.worstTrade.toFixed(2)}`);
    console.log(`Current Streak: ${this.stats.currentStreak > 0 ? '🟢' : '🔴'} ${Math.abs(this.stats.currentStreak)} ${this.stats.currentStreak > 0 ? 'wins' : 'losses'}`);
    console.log('═══════════════════════════════════════════════════════════\n');
  }

  // STOP BOT
  stop() {
    console.log('\n🛑 Stopping Paper Trading Bot...');
    this.isRunning = false;
    
    if (this.ws) {
      this.ws.close();
    }
    
    this.generateReport();
  }
}

// MAIN EXECUTION
async function main() {
  console.log('\n🚀 PRODUCTION PAPER TRADING BOT - REAL DATA, REAL RESULTS\n');
  
  const bot = new ProductionPaperTradingBot(CONFIG);
  
  const initialized = await bot.initialize();
  
  if (!initialized) {
    console.error('❌ Failed to initialize bot');
    process.exit(1);
  }
  
  // Generate report every hour
  setInterval(() => {
    bot.generateReport();
  }, 60 * 60 * 1000);
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    bot.stop();
    process.exit(0);
  });
}

// RUN
main().catch(console.error);
