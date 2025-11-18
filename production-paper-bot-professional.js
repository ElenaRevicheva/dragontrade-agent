// 🎯 PROFESSIONAL PAPER TRADING BOT - ANTI-SCAM, TRANSPARENT, DISCIPLINED
// Sound trading principles: Risk management first, profits second
// Every decision explained, every trade tracked, complete transparency

import ccxt from 'ccxt';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { writeStatsToDatabase } from './db-stats-writer.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PROFESSIONAL CONFIGURATION
const CONFIG = {
  exchange: process.env.EXCHANGE || 'bybit',
  symbol: 'BTC/USDT',
  timeframe: '15m', // 15-minute candles for daily activity
  initialBalance: 10000,
  
  // PAPER TRADING COSTS (make it realistic!)
  paperTradingCosts: {
    fee: 0.001,          // 0.1% exchange fee per trade
    slippage: 0.0003,    // 0.03% average slippage
    stopLossSlippage: 0.002  // 0.2% stop loss slippage
  },
  
  // PROFESSIONAL STRATEGY PARAMETERS
  strategy: {
    // Moving Averages for trend
    fastMA: 9,         // Fast MA (short-term)
    slowMA: 21,        // Slow MA (medium-term)
    trendMA: 50,       // Trend filter (long-term)
    
    // RSI for momentum
    rsiPeriod: 14,
    rsiOverbought: 70,
    rsiOversold: 30,
    rsiNeutralHigh: 55,
    rsiNeutralLow: 45,
    
    // Volume confirmation (relaxed from 1.5 to 1.2 for more opportunities)
    volumeMultiplier: 1.2, // Must be 1.2x average volume
    
    // Position sizing (CONSERVATIVE)
    positionSizePercent: 20, // Only 20% per trade
    maxOpenPositions: 1,     // One position at a time
    
    // Risk management (STRICT)
    stopLossPercent: 1.5,    // Tight 1.5% stop loss
    takeProfitPercent: 3,    // Conservative 3% take profit (2:1 R:R)
    trailingStopPercent: 1.2, // Lock in profits
    
    // Time management
    maxHoldTime: 6 * 60 * 60 * 1000, // 6 hours maximum
    minTimeBetweenTrades: 30 * 60 * 1000, // 30 min cooldown
  },
  
  // RISK MANAGEMENT (PROFESSIONAL)
  riskManagement: {
    maxDailyLoss: 3,           // Stop if lose 3% in a day
    maxDailyTrades: 4,         // Max 4 trades per day
    maxConsecutiveLosses: 2,   // Stop after 2 losses
    minWinRate: 40,            // Pause if below 40%
    maxDrawdown: 10,           // Stop if 10% drawdown
    requireMultipleConfirmations: true
  },
  
  // Exchange configurations
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

class ProfessionalPaperTradingBot {
  constructor(config) {
    this.config = config;
    this.exchange = null;
    
    // TRADING STATE
    this.balance = config.initialBalance;
    this.initialBalance = config.initialBalance;
    this.position = null;
    this.trades = [];
    this.lastTradeTime = 0;
    
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
      sharpeRatio: 0,
      maxDrawdown: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      currentStreak: 0,
      dailyPnL: 0,
      dailyTrades: 0,
      lastResetDate: new Date().toDateString(),
      avgWinPercent: 0,
      avgLossPercent: 0,
      expectancy: 0
    };
    
    // MARKET DATA
    this.candles = [];
    this.currentPrice = 0;
    this.indicators = {
      fastMA: null,
      slowMA: null,
      trendMA: null,
      rsi: null,
      avgVolume: null
    };
    
    // RISK CONTROL
    this.riskControl = {
      tradingPaused: false,
      pauseReason: null,
      dailyLoss: 0,
      peakBalance: config.initialBalance,
      currentDrawdown: 0
    };
    
    this.isRunning = false;
  }

  async initialize() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('🎯 PROFESSIONAL PAPER TRADING BOT');
    console.log('   Anti-Scam | Transparent | Disciplined');
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
        throw new Error(`Exchange ${exchangeName} not supported`);
      }
      
      console.log(`🔗 Connecting to ${this.config.exchange.toUpperCase()}...`);
      await this.exchange.loadMarkets();
      const ticker = await this.exchange.fetchTicker(this.config.symbol);
      this.currentPrice = ticker.last;
      
      console.log(`✅ Connected to ${this.config.exchange.toUpperCase()}`);
      console.log(`📊 ${this.config.symbol} Price: $${this.currentPrice.toLocaleString()}`);
      console.log(`💰 Capital: $${this.balance.toLocaleString()}`);
      console.log(`\n📈 STRATEGY PRINCIPLES:`);
      console.log(`   ✓ Multiple confirmations required`);
      console.log(`   ✓ Strict risk management (1.5% SL, 3% TP)`);
      console.log(`   ✓ Volume confirmation (no pump chasing)`);
      console.log(`   ✓ Trend alignment (trade with trend)`);
      console.log(`   ✓ Position sizing: 20% max per trade`);
      console.log(`   ✓ Daily limits: Max 4 trades, 3% loss limit`);
      console.log(`\n🛡️  RISK CONTROLS:`);
      console.log(`   ✓ Stop loss: ${this.config.strategy.stopLossPercent}%`);
      console.log(`   ✓ Take profit: ${this.config.strategy.takeProfitPercent}%`);
      console.log(`   ✓ Max daily loss: ${this.config.riskManagement.maxDailyLoss}%`);
      console.log(`   ✓ Max consecutive losses: ${this.config.riskManagement.maxConsecutiveLosses}`);
      console.log(`   ✓ Max drawdown: ${this.config.riskManagement.maxDrawdown}%\n`);
      
      await this.loadHistoricalData();
      await this.startRealTimeDataFeed();
      
      console.log('✅ PROFESSIONAL BOT READY\n');
      console.log('💡 ANTI-SCAM PROMISE:');
      console.log('   • Every trade explained with logic');
      console.log('   • All losses reported honestly');
      console.log('   • No gambling, no FOMO, no hype');
      console.log('   • Risk management first, profits second\n');
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
    
    console.log(`📊 Initial Analysis:`);
    console.log(`   Fast MA(${this.config.strategy.fastMA}): $${this.indicators.fastMA?.toFixed(2)}`);
    console.log(`   Slow MA(${this.config.strategy.slowMA}): $${this.indicators.slowMA?.toFixed(2)}`);
    console.log(`   Trend MA(${this.config.strategy.trendMA}): $${this.indicators.trendMA?.toFixed(2)}`);
    console.log(`   RSI(${this.config.strategy.rsiPeriod}): ${this.indicators.rsi?.toFixed(2)}`);
    console.log(`   Market Trend: ${this.determineTrend()}\n`);
  }

  startRealTimeDataFeed() {
    console.log('📡 Starting real-time monitoring...');
    
    // Check every 15 minutes (candle close)
    const pollInterval = 15 * 60 * 1000;
    
    console.log(`✅ Monitoring ${this.config.timeframe} candles\n`);
    
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
          console.log(`⏳ Monitoring... ${new Date().toLocaleTimeString()}`);
        }
        
        this.currentPrice = ohlcv[ohlcv.length - 1][4];
      }
    } catch (error) {
      console.error('⚠️ Error polling:', error.message);
    }
  }

  onNewCandle(candle) {
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`🕐 CANDLE CLOSED: ${new Date(candle.timestamp).toLocaleString()}`);
    console.log(`   Price: $${candle.close.toLocaleString()} | Volume: ${this.formatVolume(candle.volume)}`);
    
    this.candles.push(candle);
    if (this.candles.length > 100) {
      this.candles.shift();
    }
    
    this.calculateIndicators();
    
    // Check risk controls
    if (this.checkRiskControls()) {
      console.log(`⚠️  TRADING PAUSED: ${this.riskControl.pauseReason}`);
      console.log(`${'═'.repeat(70)}\n`);
      return;
    }
    
    // Execute strategy
    this.executeProfessionalStrategy();
    
    // Update position if open
    if (this.position) {
      this.updatePosition();
    }
    
    // Export stats
    this.exportStats();
    
    console.log(`${'═'.repeat(70)}\n`);
  }

  calculateIndicators() {
    const closes = this.candles.map(c => c.close);
    const volumes = this.candles.map(c => c.volume);
    
    // Moving Averages
    if (closes.length >= this.config.strategy.trendMA) {
      this.indicators.fastMA = this.calculateMA(closes, this.config.strategy.fastMA);
      this.indicators.slowMA = this.calculateMA(closes, this.config.strategy.slowMA);
      this.indicators.trendMA = this.calculateMA(closes, this.config.strategy.trendMA);
    }
    
    // RSI
    if (closes.length >= this.config.strategy.rsiPeriod + 1) {
      this.indicators.rsi = this.calculateRSI(closes, this.config.strategy.rsiPeriod);
    }
    
    // Average Volume
    if (volumes.length >= 20) {
      this.indicators.avgVolume = this.calculateMA(volumes, 20);
    }
    
    // Volatility (ATR - Average True Range)
    if (this.candles.length >= 14) {
      this.indicators.volatility = this.calculateVolatility(14);
    }
  }
  
  calculateVolatility(period = 14) {
    const recentCandles = this.candles.slice(-period);
    const trueRanges = recentCandles.map(candle => {
      return candle.high - candle.low;
    });
    
    const atr = trueRanges.reduce((a, b) => a + b, 0) / period;
    const avgPrice = recentCandles.reduce((a, c) => a + c.close, 0) / period;
    
    // Return volatility as percentage
    return (atr / avgPrice) * 100;
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

  determineTrend() {
    const { fastMA, slowMA, trendMA } = this.indicators;
    
    if (!fastMA || !slowMA || !trendMA) return 'UNKNOWN';
    
    if (fastMA > slowMA && slowMA > trendMA) return 'STRONG UPTREND';
    if (fastMA > slowMA && this.currentPrice > trendMA) return 'UPTREND';
    if (fastMA < slowMA && slowMA < trendMA) return 'STRONG DOWNTREND';
    if (fastMA < slowMA && this.currentPrice < trendMA) return 'DOWNTREND';
    
    return 'SIDEWAYS';
  }

  // PROFESSIONAL STRATEGY EXECUTION
  executeProfessionalStrategy() {
    const { fastMA, slowMA, trendMA, rsi, avgVolume } = this.indicators;
    
    if (!fastMA || !slowMA || !trendMA || !rsi || !avgVolume) {
      console.log('⏳ Indicators initializing...');
      return;
    }
    
    const currentVolume = this.candles[this.candles.length - 1].volume;
    const trend = this.determineTrend();
    
    console.log(`\n📊 MARKET ANALYSIS:`);
    console.log(`   Fast MA(${this.config.strategy.fastMA}): $${fastMA.toFixed(2)}`);
    console.log(`   Slow MA(${this.config.strategy.slowMA}): $${slowMA.toFixed(2)}`);
    console.log(`   Trend MA(${this.config.strategy.trendMA}): $${trendMA.toFixed(2)}`);
    console.log(`   RSI: ${rsi.toFixed(2)}`);
    console.log(`   Volume: ${this.formatVolume(currentVolume)} (Avg: ${this.formatVolume(avgVolume)})`);
    console.log(`   Market Trend: ${trend}`);
    
    // ENTRY LOGIC - Multiple confirmations required
    if (!this.position) {
      // Check cooldown
      const timeSinceLastTrade = Date.now() - this.lastTradeTime;
      if (timeSinceLastTrade < this.config.strategy.minTimeBetweenTrades) {
        console.log(`\n⏰ Cooldown active (${Math.round((this.config.strategy.minTimeBetweenTrades - timeSinceLastTrade) / 60000)} min remaining)`);
        return;
      }
      
      // Check daily trade limit
      if (this.stats.dailyTrades >= this.config.riskManagement.maxDailyTrades) {
        console.log(`\n⚠️  Daily trade limit reached (${this.stats.dailyTrades}/${this.config.riskManagement.maxDailyTrades})`);
        return;
      }
      
      let entrySignal = null;
      let side = null;
      let confirmations = [];
      
      const hasVolumeConfirmation = currentVolume > avgVolume * this.config.strategy.volumeMultiplier;
      
      // Previous candles for crossover detection
      const prevFastMA = this.calculateMA(
        this.candles.slice(0, -1).map(c => c.close),
        this.config.strategy.fastMA
      );
      const prevSlowMA = this.calculateMA(
        this.candles.slice(0, -1).map(c => c.close),
        this.config.strategy.slowMA
      );
      
      // ═══════════════════════════════════════════════════════════
      // BULLISH ENTRY CONDITIONS (LONG)
      // ═══════════════════════════════════════════════════════════
      let bullishScore = 0;
      const bullishConfirmations = [];
      
      if (fastMA > slowMA && this.currentPrice > trendMA) {
        bullishConfirmations.push('✓ Price above trend MA (bullish structure)');
        bullishScore++;
        
        if (rsi > this.config.strategy.rsiNeutralLow && rsi < this.config.strategy.rsiOverbought) {
          bullishConfirmations.push('✓ RSI in healthy range (not overbought)');
          bullishScore++;
        }
        
        if (hasVolumeConfirmation) {
          bullishConfirmations.push('✓ Volume confirmation (strong interest)');
          bullishScore++;
        }
        
        // Check for crossover or strong trend
        if (prevFastMA <= prevSlowMA) {
          bullishConfirmations.push('✓ Fresh MA crossover (new momentum)');
          entrySignal = 'GOLDEN_CROSS';
          side = 'LONG';
          confirmations = [...bullishConfirmations];
        } else if (trend === 'STRONG UPTREND') {
          bullishConfirmations.push('✓ Strong uptrend continuation');
          if (hasVolumeConfirmation || bullishScore >= 2) {
            entrySignal = hasVolumeConfirmation ? 'TREND_CONTINUATION' : 'TREND_CONTINUATION_STRONG';
            side = 'LONG';
            confirmations = [...bullishConfirmations];
            if (!hasVolumeConfirmation) {
              confirmations.push('⚡ Volume not required (strong signals)');
            }
          }
        }
      }
      
      // ═══════════════════════════════════════════════════════════
      // BEARISH ENTRY CONDITIONS (SHORT)
      // ═══════════════════════════════════════════════════════════
      if (!entrySignal) {
        let bearishScore = 0;
        const bearishConfirmations = [];
        
        if (fastMA < slowMA && this.currentPrice < trendMA) {
          bearishConfirmations.push('✓ Price below trend MA (bearish structure)');
          bearishScore++;
          
          if (rsi < this.config.strategy.rsiNeutralHigh && rsi > this.config.strategy.rsiOversold) {
            bearishConfirmations.push('✓ RSI in healthy range (not oversold)');
            bearishScore++;
          }
          
          if (hasVolumeConfirmation) {
            bearishConfirmations.push('✓ Volume confirmation (strong interest)');
            bearishScore++;
          }
          
          // Check for crossover or strong downtrend
          if (prevFastMA >= prevSlowMA) {
            bearishConfirmations.push('✓ Fresh MA crossover (new momentum)');
            entrySignal = 'DEATH_CROSS';
            side = 'SHORT';
            confirmations = [...bearishConfirmations];
          } else if (trend === 'STRONG DOWNTREND') {
            bearishConfirmations.push('✓ Strong downtrend continuation');
            if (hasVolumeConfirmation || bearishScore >= 2) {
              entrySignal = hasVolumeConfirmation ? 'DOWNTREND_CONTINUATION' : 'DOWNTREND_CONTINUATION_STRONG';
              side = 'SHORT';
              confirmations = [...bearishConfirmations];
              if (!hasVolumeConfirmation) {
                confirmations.push('⚡ Volume not required (strong signals)');
              }
            }
          }
        }
      }
      
      // EXECUTE ENTRY if signal found and minimum confirmations met
      if (entrySignal && side && confirmations.length >= 3) {
        console.log(`\n🎯 ${side} ENTRY SIGNAL: ${entrySignal}`);
        console.log(`\n📋 CONFIRMATIONS:`);
        confirmations.forEach(c => console.log(`   ${c}`));
        
        this.openPosition(side, entrySignal, confirmations);
      } else {
        console.log(`\n⏳ No entry signal`);
        if (confirmations.length > 0 || bullishScore > 0) {
          const allPartials = [...(bullishScore > 0 ? bullishConfirmations : [])];
          if (allPartials.length > 0) {
            console.log(`   Partial confirmations (${allPartials.length}/3+):`);
            allPartials.forEach(c => console.log(`   ${c}`));
          }
        }
      }
    }
  }

  openPosition(side, signal, confirmations) {
    // Calculate position size with volatility adjustment
    let positionSizePercent = this.config.strategy.positionSizePercent;
    
    // Adjust position size based on volatility
    if (this.indicators.volatility) {
      if (this.indicators.volatility > 3) {
        // High volatility (>3%) - reduce position size by 25%
        positionSizePercent *= 0.75;
        console.log(`   ⚠️  High volatility (${this.indicators.volatility.toFixed(2)}%) - Position reduced to ${positionSizePercent}%`);
      } else if (this.indicators.volatility < 1.5) {
        // Low volatility (<1.5%) - can increase position size by 10%
        positionSizePercent *= 1.1;
        positionSizePercent = Math.min(positionSizePercent, 25); // Cap at 25%
        console.log(`   ✅ Low volatility (${this.indicators.volatility.toFixed(2)}%) - Position increased to ${positionSizePercent.toFixed(1)}%`);
      }
    }
    
    const positionSize = this.balance * (positionSizePercent / 100);
    const amount = positionSize / this.currentPrice;
    
    // Apply realistic slippage (price worse than expected)
    const slippagePercent = this.config.paperTradingCosts.slippage;
    let actualEntryPrice, stopLoss, takeProfit;
    
    if (side === 'LONG') {
      // LONG: Buy higher (slippage against us)
      actualEntryPrice = this.currentPrice * (1 + slippagePercent);
      stopLoss = actualEntryPrice * (1 - this.config.strategy.stopLossPercent / 100);
      takeProfit = actualEntryPrice * (1 + this.config.strategy.takeProfitPercent / 100);
    } else {
      // SHORT: Sell lower (slippage against us)
      actualEntryPrice = this.currentPrice * (1 - slippagePercent);
      stopLoss = actualEntryPrice * (1 + this.config.strategy.stopLossPercent / 100);  // Stop higher for SHORT
      takeProfit = actualEntryPrice * (1 - this.config.strategy.takeProfitPercent / 100);  // TP lower for SHORT
    }
    
    // Calculate fees
    const entryFee = positionSize * this.config.paperTradingCosts.fee;
    
    this.position = {
      side,
      entryPrice: actualEntryPrice,  // Use slipped price
      amount,
      invested: positionSize,
      entryFee: entryFee,  // Track fees
      stopLoss,
      takeProfit,
      trailingStop: null,
      openTime: Date.now(),
      entrySignal: signal,
      confirmations: confirmations,
      highestPrice: side === 'LONG' ? actualEntryPrice : null,
      lowestPrice: side === 'SHORT' ? actualEntryPrice : null
    };
    
    this.balance -= (positionSize + entryFee);  // Deduct fees
    this.lastTradeTime = Date.now();
    this.stats.dailyTrades++;
    
    console.log(`\n${'═'.repeat(70)}`);
    console.log('🟢 POSITION OPENED');
    console.log(`${'═'.repeat(70)}`);
    console.log(`   Signal: ${signal}`);
    console.log(`   Entry: $${this.currentPrice.toLocaleString()}`);
    console.log(`   Size: ${amount.toFixed(6)} BTC ($${positionSize.toLocaleString()})`);
    console.log(`   Stop Loss: $${stopLoss.toLocaleString()} (-${this.config.strategy.stopLossPercent}%)`);
    console.log(`   Take Profit: $${takeProfit.toLocaleString()} (+${this.config.strategy.takeProfitPercent}%)`);
    console.log(`   Risk/Reward: 1:${(this.config.strategy.takeProfitPercent / this.config.strategy.stopLossPercent).toFixed(1)}`);
    console.log(`   Remaining Balance: $${this.balance.toLocaleString()}`);
    console.log(`${'═'.repeat(70)}`);
  }

  updatePosition() {
    if (!this.position) return;
    
    let currentValue, unrealizedPnL, unrealizedPnLPercent;
    
    if (this.position.side === 'LONG') {
      // LONG: Profit when price goes up
      currentValue = this.position.amount * this.currentPrice;
      unrealizedPnL = currentValue - this.position.invested;
      unrealizedPnLPercent = (unrealizedPnL / this.position.invested) * 100;
      
      // Update highest price for trailing stop
      if (this.currentPrice > this.position.highestPrice) {
        this.position.highestPrice = this.currentPrice;
        
        // Activate trailing stop if in profit
        if (unrealizedPnLPercent > this.config.strategy.trailingStopPercent) {
          this.position.trailingStop = this.position.highestPrice * (1 - this.config.strategy.trailingStopPercent / 100);
        }
      }
      
      // Check stop loss (price drops below SL)
      if (this.currentPrice <= this.position.stopLoss) {
        console.log(`\n🔴 STOP LOSS HIT at $${this.currentPrice.toLocaleString()}`);
        this.closePosition('STOP_LOSS');
        return;
      }
      
      // Check trailing stop
      if (this.position.trailingStop && this.currentPrice <= this.position.trailingStop) {
        console.log(`\n🟡 TRAILING STOP HIT at $${this.currentPrice.toLocaleString()}`);
        this.closePosition('TRAILING_STOP');
        return;
      }
      
      // Check take profit (price rises above TP)
      if (this.currentPrice >= this.position.takeProfit) {
        console.log(`\n🟢 TAKE PROFIT HIT at $${this.currentPrice.toLocaleString()}`);
        this.closePosition('TAKE_PROFIT');
        return;
      }
      
    } else {
      // SHORT: Profit when price goes down
      currentValue = this.position.invested - (this.position.amount * (this.currentPrice - this.position.entryPrice));
      unrealizedPnL = currentValue - this.position.invested;
      unrealizedPnLPercent = (unrealizedPnL / this.position.invested) * 100;
      
      // Update lowest price for trailing stop
      if (this.currentPrice < this.position.lowestPrice) {
        this.position.lowestPrice = this.currentPrice;
        
        // Activate trailing stop if in profit
        if (unrealizedPnLPercent > this.config.strategy.trailingStopPercent) {
          this.position.trailingStop = this.position.lowestPrice * (1 + this.config.strategy.trailingStopPercent / 100);
        }
      }
      
      // Check stop loss (price rises above SL)
      if (this.currentPrice >= this.position.stopLoss) {
        console.log(`\n🔴 STOP LOSS HIT at $${this.currentPrice.toLocaleString()}`);
        this.closePosition('STOP_LOSS');
        return;
      }
      
      // Check trailing stop
      if (this.position.trailingStop && this.currentPrice >= this.position.trailingStop) {
        console.log(`\n🟡 TRAILING STOP HIT at $${this.currentPrice.toLocaleString()}`);
        this.closePosition('TRAILING_STOP');
        return;
      }
      
      // Check take profit (price drops below TP)
      if (this.currentPrice <= this.position.takeProfit) {
        console.log(`\n🟢 TAKE PROFIT HIT at $${this.currentPrice.toLocaleString()}`);
        this.closePosition('TAKE_PROFIT');
        return;
      }
    }
    
    // Check max hold time
    const holdTime = Date.now() - this.position.openTime;
    if (holdTime > this.config.strategy.maxHoldTime) {
      console.log(`\n⏰ MAX HOLD TIME REACHED`);
      this.closePosition('TIME_EXIT');
      return;
    }
    
    console.log(`   📊 ${this.position.side} Position: ${unrealizedPnLPercent >= 0 ? '🟢' : '🔴'} ${unrealizedPnLPercent.toFixed(2)}% ($${unrealizedPnL.toFixed(2)})`);
    if (this.position.trailingStop) {
      console.log(`   🔒 Trailing Stop: $${this.position.trailingStop.toLocaleString()}`);
    }
  }

  closePosition(reason) {
    if (!this.position) return;
    
    // Apply realistic slippage and fees
    let exitPrice = this.currentPrice;
    let exitValue, pnl;
    
    if (this.position.side === 'LONG') {
      // LONG exit: Sell (slippage makes price worse)
      if (reason === 'STOP_LOSS') {
        exitPrice = exitPrice * (1 - this.config.paperTradingCosts.stopLossSlippage);
      } else {
        exitPrice = exitPrice * (1 - this.config.paperTradingCosts.slippage);
      }
      
      exitValue = this.position.amount * exitPrice;
      const exitFee = exitValue * this.config.paperTradingCosts.fee;
      const netExitValue = exitValue - exitFee;
      
      // Calculate P&L including all costs
      const totalFees = this.position.entryFee + exitFee;
      pnl = netExitValue - this.position.invested;
      
    } else {
      // SHORT exit: Buy back (slippage makes price worse)
      if (reason === 'STOP_LOSS') {
        exitPrice = exitPrice * (1 + this.config.paperTradingCosts.stopLossSlippage);
      } else {
        exitPrice = exitPrice * (1 + this.config.paperTradingCosts.slippage);
      }
      
      // For SHORT: profit when exit price < entry price
      const exitCost = this.position.amount * exitPrice;
      const entryCost = this.position.amount * this.position.entryPrice;
      exitValue = entryCost - (exitCost - entryCost);  // Sold high, buy back low = profit
      
      const exitFee = exitCost * this.config.paperTradingCosts.fee;
      const totalFees = this.position.entryFee + exitFee;
      
      // SHORT P&L: Entry value - Exit cost - Fees
      pnl = (entryCost - exitCost) - totalFees;
    }
    
    const pnlPercent = (pnl / this.position.invested) * 100;
    const holdTime = Date.now() - this.position.openTime;
    const totalFees = this.position.entryFee + (exitValue * this.config.paperTradingCosts.fee);
    
    const trade = {
      id: Date.now(),
      symbol: this.config.symbol,
      side: this.position.side,
      entryPrice: this.position.entryPrice,
      exitPrice,
      amount: this.position.amount,
      pnl,
      pnlPercent,
      fees: totalFees,
      holdTime,
      reason,
      entrySignal: this.position.entrySignal,
      confirmations: this.position.confirmations,
      timestamp: new Date().toISOString()
    };
    
    this.trades.push(trade);
    this.balance += exitValue;
    
    this.updateStats(trade);
    
    console.log(`\n${'═'.repeat(70)}`);
    console.log(`${pnl >= 0 ? '🟢 PROFIT' : '🔴 LOSS'} - ${this.position.side} POSITION CLOSED (${reason})`);
    console.log(`${'═'.repeat(70)}`);
    console.log(`   Entry Signal: ${this.position.entrySignal}`);
    console.log(`   Entry: $${this.position.entryPrice.toLocaleString()} (with slippage)`);
    console.log(`   Exit: $${exitPrice.toLocaleString()} (with slippage)`);
    console.log(`   Fees: $${totalFees.toFixed(2)} (${(totalFees/this.position.invested*100).toFixed(2)}%)`);
    console.log(`   Net P&L: ${pnl >= 0 ? '🟢 +' : '🔴 '}$${pnl.toFixed(2)} (${pnl >= 0 ? '+' : ''}${pnlPercent.toFixed(2)}%)`);
    console.log(`   Hold Time: ${this.formatTime(holdTime)}`);
    console.log(`   Balance: $${this.balance.toLocaleString()}`);
    console.log(`${'═'.repeat(70)}`);
    
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
    
    // Calculate profit factor
    const totalWins = this.trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
    const totalLosses = Math.abs(this.trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
    this.stats.profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins;
    
    // Calculate average win/loss
    const wins = this.trades.filter(t => t.pnl > 0);
    const losses = this.trades.filter(t => t.pnl < 0);
    this.stats.avgWinPercent = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnlPercent, 0) / wins.length : 0;
    this.stats.avgLossPercent = losses.length > 0 ? losses.reduce((sum, t) => sum + t.pnlPercent, 0) / losses.length : 0;
    
    // Calculate expectancy
    this.stats.expectancy = (this.stats.winRate / 100) * this.stats.avgWinPercent + ((100 - this.stats.winRate) / 100) * this.stats.avgLossPercent;
    
    // Update drawdown
    if (this.balance > this.riskControl.peakBalance) {
      this.riskControl.peakBalance = this.balance;
    }
    this.riskControl.currentDrawdown = ((this.riskControl.peakBalance - this.balance) / this.riskControl.peakBalance) * 100;
    this.stats.maxDrawdown = Math.max(this.stats.maxDrawdown, this.riskControl.currentDrawdown);
    
    console.log(`\n📊 PERFORMANCE STATS:`);
    console.log(`   Total Trades: ${this.stats.totalTrades} (${this.stats.wins}W/${this.stats.losses}L)`);
    if (this.stats.longTrades || this.stats.shortTrades) {
      console.log(`     LONG: ${this.stats.longTrades || 0} (${this.stats.longWins || 0}W) | SHORT: ${this.stats.shortTrades || 0} (${this.stats.shortWins || 0}W)`);
    }
    console.log(`   Win Rate: ${this.stats.winRate.toFixed(1)}%`);
    if (this.stats.avgWinPercent && this.stats.avgLossPercent) {
      console.log(`     Avg Win: +${this.stats.avgWinPercent.toFixed(2)}% | Avg Loss: ${this.stats.avgLossPercent.toFixed(2)}%`);
    }
    console.log(`   Profit Factor: ${this.stats.profitFactor.toFixed(2)}`);
    console.log(`   Total P&L: ${this.stats.totalPnL >= 0 ? '+' : ''}$${this.stats.totalPnL.toFixed(2)} (${this.stats.totalPnL >= 0 ? '+' : ''}${this.stats.totalPnLPercent.toFixed(2)}%)`);
    if (this.stats.totalFees) {
      console.log(`   Total Fees: $${this.stats.totalFees.toFixed(2)}`);
    }
    console.log(`   Expectancy: ${this.stats.expectancy.toFixed(2)}% per trade`);
    console.log(`   Max Drawdown: ${this.stats.maxDrawdown.toFixed(2)}%`);
  }

  checkRiskControls() {
    const today = new Date().toDateString();
    if (today !== this.stats.lastResetDate) {
      this.stats.dailyPnL = 0;
      this.stats.dailyTrades = 0;
      this.stats.lastResetDate = today;
      this.riskControl.tradingPaused = false;
      console.log('\n📅 NEW DAY - Stats reset');
    }
    
    // Daily loss limit
    const dailyLossPercent = (this.stats.dailyPnL / this.initialBalance) * 100;
    if (dailyLossPercent < -this.config.riskManagement.maxDailyLoss) {
      this.riskControl.tradingPaused = true;
      this.riskControl.pauseReason = `Daily loss limit (${dailyLossPercent.toFixed(2)}%)`;
      return true;
    }
    
    // Consecutive losses
    if (this.stats.consecutiveLosses >= this.config.riskManagement.maxConsecutiveLosses) {
      this.riskControl.tradingPaused = true;
      this.riskControl.pauseReason = `${this.stats.consecutiveLosses} consecutive losses`;
      return true;
    }
    
    // Win rate check (after 10 trades)
    if (this.stats.totalTrades >= 10 && this.stats.winRate < this.config.riskManagement.minWinRate) {
      this.riskControl.tradingPaused = true;
      this.riskControl.pauseReason = `Win rate ${this.stats.winRate.toFixed(1)}% below ${this.config.riskManagement.minWinRate}%`;
      return true;
    }
    
    // Max drawdown
    if (this.riskControl.currentDrawdown >= this.config.riskManagement.maxDrawdown) {
      this.riskControl.tradingPaused = true;
      this.riskControl.pauseReason = `Max drawdown ${this.riskControl.currentDrawdown.toFixed(2)}%`;
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
      avgWinPercent: this.stats.avgWinPercent,
      avgLossPercent: this.stats.avgLossPercent,
      expectancy: this.stats.expectancy,
      maxDrawdown: this.stats.maxDrawdown,
      currentStreak: this.stats.currentStreak,
      
      // Enhanced stats
      longTrades: this.stats.longTrades || 0,
      shortTrades: this.stats.shortTrades || 0,
      longWins: this.stats.longWins || 0,
      shortWins: this.stats.shortWins || 0,
      totalFees: this.stats.totalFees || 0,
      avgHoldTime: this.stats.avgHoldTime || 0,
      largestWin: this.stats.largestWin || 0,
      largestLoss: this.stats.largestLoss || 0,
      signalPerformance: this.stats.signalPerformance || {},
      
      recentTrades: this.trades.slice(-10),
      currentPosition: this.position,
      riskControl: this.riskControl,
      strategyMode: 'PROFESSIONAL'
    };
    
    try {
      // Write to database (primary method for multi-service access)
      const dbSuccess = await writeStatsToDatabase(this.config.exchange.toLowerCase(), statsData);
      
      // Also write to JSON files (backup/local access)
      const exchangeName = this.config.exchange.toLowerCase();
      const statsPath = path.join(__dirname, `${exchangeName}_trading_stats.json`);
      await fs.writeFile(statsPath, JSON.stringify(statsData, null, 2));
      
      const genericStatsPath = path.join(__dirname, 'trading_stats.json');
      await fs.writeFile(genericStatsPath, JSON.stringify(statsData, null, 2));
      
      if (dbSuccess) {
        console.log(`✅ Stats exported (DB + JSON files)`);
      } else {
        console.log(`✅ Stats exported (JSON files only - DB not configured)`);
      }
    } catch (error) {
      console.error('⚠️  Failed to export stats:', error.message);
    }
  }

  formatVolume(volume) {
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toFixed(0);
  }

  formatTime(ms) {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }

  stop() {
    console.log('\n🛑 Stopping Professional Bot...');
    this.isRunning = false;
    this.generateReport();
  }

  generateReport() {
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 PROFESSIONAL TRADING REPORT');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Exchange: ${this.config.exchange.toUpperCase()}`);
    console.log(`Strategy: Multi-Confirmation Trend Following`);
    console.log('───────────────────────────────────────────────────────────');
    console.log(`Balance: $${this.balance.toLocaleString()} (${this.stats.totalPnLPercent >= 0 ? '+' : ''}${this.stats.totalPnLPercent.toFixed(2)}%)`);
    console.log(`Trades: ${this.stats.totalTrades} (${this.stats.wins}W/${this.stats.losses}L)`);
    console.log(`Win Rate: ${this.stats.winRate.toFixed(1)}%`);
    console.log(`Profit Factor: ${this.stats.profitFactor.toFixed(2)}`);
    console.log(`Expectancy: ${this.stats.expectancy.toFixed(2)}% per trade`);
    console.log(`Max Drawdown: ${this.stats.maxDrawdown.toFixed(2)}%`);
    console.log('═══════════════════════════════════════════════════════════\n');
  }
}

// MAIN EXECUTION
async function main() {
  console.log('\n🎯 PROFESSIONAL PAPER TRADING BOT');
  console.log('   Anti-Scam | Evidence-Based | Transparent\n');
  
  const bot = new ProfessionalPaperTradingBot(CONFIG);
  
  const initialized = await bot.initialize();
  
  if (!initialized) {
    console.error('❌ Failed to initialize');
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
