// 📊 EDUCATIONAL BOT TRADING STATS INTEGRATION
// This module reads REAL paper trading stats and generates HONEST educational posts
// NO LIES, NO HYPE, JUST REAL RESULTS AND REAL LESSONS

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class TradingStatsReporter {
  constructor() {
    this.statsPath = path.join(__dirname, 'trading_stats.json');
    this.bybitStatsPath = path.join(__dirname, 'bybit_trading_stats.json');
    this.binanceStatsPath = path.join(__dirname, 'binance_trading_stats.json');
    this.lastReportedTrade = {
      bybit: 0,
      binance: 0,
      generic: 0
    };
    this.reportHistory = [];
  }

  // READ REAL TRADING STATS FROM SPECIFIC EXCHANGE
  async readTradingStats(exchange = null) {
    try {
      let statsPath;
      
      if (exchange === 'bybit') {
        statsPath = this.bybitStatsPath;
      } else if (exchange === 'binance') {
        statsPath = this.binanceStatsPath;
      } else {
        // Try generic first, then bybit, then binance
        statsPath = this.statsPath;
      }
      
      const data = await fs.readFile(statsPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.log(`⚠️ No trading stats available yet for ${exchange || 'generic'}`);
      return null;
    }
  }

  // READ STATS FROM ALL EXCHANGES
  async readAllTradingStats() {
    const stats = {};
    
    // Try Bybit
    try {
      const bybitData = await fs.readFile(this.bybitStatsPath, 'utf-8');
      stats.bybit = JSON.parse(bybitData);
    } catch (error) {
      stats.bybit = null;
    }
    
    // Try Binance
    try {
      const binanceData = await fs.readFile(this.binanceStatsPath, 'utf-8');
      stats.binance = JSON.parse(binanceData);
    } catch (error) {
      stats.binance = null;
    }
    
    return stats;
  }

  // GENERATE HONEST TRADE REPORT
  generateTradeReport(stats, exchange = 'paper') {
    if (!stats || !stats.recentTrades || stats.recentTrades.length === 0) {
      return null;
    }

    // Get the most recent trade
    const latestTrade = stats.recentTrades[stats.recentTrades.length - 1];
    
    // Don't report the same trade twice (per exchange)
    const lastReported = this.lastReportedTrade[exchange] || 0;
    if (latestTrade.id <= lastReported) {
      return null;
    }
    
    this.lastReportedTrade[exchange] = latestTrade.id;

    const isWin = latestTrade.pnl > 0;
    const emoji = isWin ? '🟢' : '🔴';
    const outcome = isWin ? 'WIN' : 'LOSS';
    const exchangeEmoji = exchange === 'bybit' ? '🟣' : exchange === 'binance' ? '🟡' : '🤖';
    const exchangeName = exchange.toUpperCase();
    
    // HONEST ANALYSIS - NO SUGAR COATING
    let analysis = '';
    
    if (isWin) {
      analysis = this.generateWinAnalysis(latestTrade, stats);
    } else {
      analysis = this.generateLossAnalysis(latestTrade, stats);
    }

    const post = `${emoji} ALGOM PAPER TRADING - ${outcome}\n${exchangeEmoji} Exchange: ${exchangeName}\n\n` +
                 `📊 REAL TRADE RESULTS:\n` +
                 `• Entry: $${latestTrade.entryPrice.toLocaleString()}\n` +
                 `• Exit: $${latestTrade.exitPrice.toLocaleString()}\n` +
                 `• P&L: $${latestTrade.pnl.toFixed(2)} (${latestTrade.pnlPercent.toFixed(2)}%)\n` +
                 `• Reason: ${latestTrade.reason}\n\n` +
                 `📈 CURRENT STATS:\n` +
                 `• Total Trades: ${stats.totalTrades}\n` +
                 `• Win Rate: ${stats.winRate.toFixed(1)}%\n` +
                 `• Total P&L: $${stats.totalPnL.toFixed(2)} (${stats.totalPnLPercent.toFixed(2)}%)\n` +
                 `• Profit Factor: ${stats.profitFactor.toFixed(2)}\n\n` +
                 `${analysis}\n\n` +
                 `#PaperTrading #RealResults #AlgomBot #NoLies`;

    return post;
  }

  // GENERATE WIN ANALYSIS (HONEST)
  generateWinAnalysis(trade, stats) {
    const analyses = [
      `🎓 LESSON: This ${trade.pnlPercent.toFixed(2)}% gain validates our MA crossover strategy. ` +
      `But remember: ${stats.winRate.toFixed(1)}% win rate means ${(100 - stats.winRate).toFixed(1)}% of trades lose. ` +
      `We aim for wins to be bigger than losses.`,
      
      `💡 REALITY CHECK: Won this trade, but paper trading removes FEAR and GREED. ` +
      `Real money will test your discipline. Can you take this same trade with real capital? ` +
      `That's the real question.`,
      
      `📊 ANALYSIS: ${trade.reason} exit was correct according to strategy. ` +
      `Consistency matters more than individual wins. ` +
      `We're building a system that works over 100+ trades, not hoping for lucky hits.`,
      
      `🎯 WIN ANALYSIS: ${trade.pnlPercent.toFixed(2)}% profit proves the strategy can work. ` +
      `But ${stats.losses} losses teach us more than ${stats.wins} wins. ` +
      `We learn from both. No strategy wins 100% of the time.`
    ];

    return analyses[Math.floor(Math.random() * analyses.length)];
  }

  // GENERATE LOSS ANALYSIS (BRUTALLY HONEST)
  generateLossAnalysis(trade, stats) {
    const analyses = [
      `⚠️ LOSS ANALYSIS: Lost ${Math.abs(trade.pnlPercent).toFixed(2)}% on this trade. ` +
      `This is normal and expected. Professional traders lose 40-50% of trades. ` +
      `What matters: our wins are bigger than our losses. Profit factor: ${stats.profitFactor.toFixed(2)}`,
      
      `🎓 LESSON FROM LOSS: ${trade.reason} triggered our exit. ` +
      `This is GOOD - we followed the rules and cut losses early. ` +
      `Amateur traders hold losers hoping for recovery. Professionals cut quickly.`,
      
      `📊 REALITY CHECK: ${Math.abs(trade.pnlPercent).toFixed(2)}% loss stings but it's controlled. ` +
      `Our stop loss worked. Without it, this could have been worse. ` +
      `Risk management > being right. We preserve capital to trade another day.`,
      
      `💡 HONEST TRUTH: We lost money. No excuses. The market doesn't care about our strategy. ` +
      `But over ${stats.totalTrades} trades, we're ${stats.totalPnL >= 0 ? 'profitable' : 'learning'}. ` +
      `That's what matters. One loss doesn't define the system.`,
      
      `🔴 LOSING TRADE: Exit at ${trade.reason} was disciplined. ` +
      `We could have held hoping for recovery, but hope isn't a strategy. ` +
      `Following rules during losses is harder than during wins. We're building that discipline.`
    ];

    return analyses[Math.floor(Math.random() * analyses.length)];
  }

  // GENERATE DAILY PERFORMANCE REPORT
  generateDailyReport(stats) {
    if (!stats) return null;

    const isPositive = stats.totalPnL >= 0;
    const emoji = isPositive ? '📈' : '📉';
    const sentiment = this.getDailySentiment(stats);

    const post = `${emoji} ALGOM PAPER TRADING BOT - DAILY REPORT\n\n` +
                 `📊 24-HOUR PERFORMANCE:\n` +
                 `• Balance: $${stats.balance.toLocaleString()}\n` +
                 `• Total P&L: ${isPositive ? '🟢' : '🔴'} $${stats.totalPnL.toFixed(2)} (${stats.totalPnLPercent.toFixed(2)}%)\n` +
                 `• Trades: ${stats.totalTrades} (${stats.wins}W/${stats.losses}L)\n` +
                 `• Win Rate: ${stats.winRate.toFixed(1)}%\n` +
                 `• Profit Factor: ${stats.profitFactor.toFixed(2)}\n` +
                 `• Best Trade: $${stats.bestTrade.toFixed(2)}\n` +
                 `• Worst Trade: $${stats.worstTrade.toFixed(2)}\n\n` +
                 `${sentiment}\n\n` +
                 `#PaperTrading #DailyReport #RealData #AlgomBot`;

    return post;
  }

  // GENERATE WEEKLY PERFORMANCE REPORT
  generateWeeklyReport(stats) {
    if (!stats || stats.totalTrades < 5) {
      return `📊 ALGOM PAPER TRADING BOT - WEEKLY UPDATE\n\n` +
             `⚠️ Not enough trades yet for meaningful analysis.\n` +
             `• Current Trades: ${stats?.totalTrades || 0}\n` +
             `• Need: 5+ trades for statistical significance\n\n` +
             `🎓 LESSON: Patience is key. We're building a track record, ` +
             `not chasing quick wins. Quality over quantity.\n\n` +
             `#PaperTrading #Patience #AlgomBot`;
    }

    const weeklyAnalysis = this.generateWeeklyAnalysis(stats);

    const post = `📊 ALGOM PAPER TRADING BOT - WEEKLY REPORT\n\n` +
                 `🎯 7-DAY PERFORMANCE:\n` +
                 `• Total Return: ${stats.totalPnLPercent >= 0 ? '🟢' : '🔴'} ${stats.totalPnLPercent.toFixed(2)}%\n` +
                 `• Total Trades: ${stats.totalTrades}\n` +
                 `• Win Rate: ${stats.winRate.toFixed(1)}%\n` +
                 `• Profit Factor: ${stats.profitFactor.toFixed(2)}\n` +
                 `• Current Streak: ${stats.currentStreak > 0 ? '🟢' : '🔴'} ${Math.abs(stats.currentStreak)}\n\n` +
                 `${weeklyAnalysis}\n\n` +
                 `🔍 SOURCE: Real Binance data, paper execution\n` +
                 `💯 TRANSPARENCY: Every trade tracked, every stat real\n\n` +
                 `#WeeklyReport #PaperTrading #AlgomBot #RealData`;

    return post;
  }

  // DAILY SENTIMENT ANALYSIS
  getDailySentiment(stats) {
    if (stats.totalPnLPercent >= 5) {
      return `🔥 STRONG DAY: ${stats.totalPnLPercent.toFixed(2)}% return shows the strategy working. ` +
             `But don't get overconfident. Tomorrow could be red. ` +
             `We focus on long-term consistency, not daily wins.`;
    } else if (stats.totalPnLPercent >= 2) {
      return `✅ SOLID DAY: ${stats.totalPnLPercent.toFixed(2)}% gain is sustainable growth. ` +
             `This is what professional trading looks like - boring but consistent. ` +
             `Small gains compound over time.`;
    } else if (stats.totalPnLPercent >= 0) {
      return `➡️ NEUTRAL DAY: ${stats.totalPnLPercent.toFixed(2)}% return. Not every day is exciting. ` +
             `Sideways markets test patience. ` +
             `We wait for clear signals, we don't force trades.`;
    } else if (stats.totalPnLPercent >= -2) {
      return `⚠️ SMALL LOSS: ${stats.totalPnLPercent.toFixed(2)}% down but within acceptable risk. ` +
             `Losses are part of trading. Our job is to keep them small. ` +
             `We're still in the game.`;
    } else {
      return `🔴 TOUGH DAY: ${stats.totalPnLPercent.toFixed(2)}% loss hurts. ` +
             `But we followed the rules, respected stop losses. ` +
             `This is why we paper trade first - to experience losses without real pain. ` +
             `Learning from red days is crucial.`;
    }
  }

  // WEEKLY ANALYSIS
  generateWeeklyAnalysis(stats) {
    const analyses = [];

    // Win rate analysis
    if (stats.winRate >= 60) {
      analyses.push(`🎯 ${stats.winRate.toFixed(1)}% win rate is excellent. Above 60% is professional level.`);
    } else if (stats.winRate >= 50) {
      analyses.push(`📊 ${stats.winRate.toFixed(1)}% win rate is good. We're profitable with wins bigger than losses.`);
    } else if (stats.winRate >= 40) {
      analyses.push(`⚠️ ${stats.winRate.toFixed(1)}% win rate is acceptable IF profit factor > 1.5. Need bigger wins.`);
    } else {
      analyses.push(`🔴 ${stats.winRate.toFixed(1)}% win rate is concerning. Strategy needs adjustment or market not suitable.`);
    }

    // Profit factor analysis
    if (stats.profitFactor >= 2) {
      analyses.push(`💰 Profit Factor ${stats.profitFactor.toFixed(2)} is strong. Our wins are 2x bigger than losses.`);
    } else if (stats.profitFactor >= 1.5) {
      analyses.push(`✅ Profit Factor ${stats.profitFactor.toFixed(2)} is solid. System is working.`);
    } else if (stats.profitFactor >= 1) {
      analyses.push(`⚠️ Profit Factor ${stats.profitFactor.toFixed(2)} is breakeven territory. Need bigger wins or smaller losses.`);
    } else {
      analyses.push(`🔴 Profit Factor ${stats.profitFactor.toFixed(2)} means we're losing more than winning. Strategy failing.`);
    }

    // Overall assessment
    if (stats.totalPnLPercent >= 10) {
      analyses.push(`🚀 +${stats.totalPnLPercent.toFixed(2)}% return is exceptional. But can we sustain this? Time will tell.`);
    } else if (stats.totalPnLPercent >= 5) {
      analyses.push(`📈 +${stats.totalPnLPercent.toFixed(2)}% return is sustainable growth. This compounds over time.`);
    } else if (stats.totalPnLPercent >= 0) {
      analyses.push(`➡️ +${stats.totalPnLPercent.toFixed(2)}% return is survival. Not exciting but we're learning.`);
    } else {
      analyses.push(`📉 ${stats.totalPnLPercent.toFixed(2)}% loss shows paper trading value. We're learning WITHOUT losing real money.`);
    }

    return analyses.join(' ');
  }

  // GENERATE STRATEGY INSIGHT POST
  generateStrategyInsight(stats) {
    if (!stats) return null;

    const insights = [
      // Moving Average Strategy
      `🎓 STRATEGY EDUCATION: MA Crossover Explained\n\n` +
      `Our bot uses 7/25 Moving Average crossover:\n` +
      `• Short MA (7) crosses above Long MA (25) = BUY\n` +
      `• Short MA crosses below Long MA = SELL\n\n` +
      `📊 Current Results: ${stats.winRate.toFixed(1)}% win rate\n\n` +
      `💡 TRUTH: This works in trending markets, fails in choppy markets. ` +
      `No strategy works 100% of the time. That's why we test with paper money first.\n\n` +
      `#TradingEducation #Strategy #AlgomBot`,

      // Risk Management
      `💰 RISK MANAGEMENT LESSON\n\n` +
      `Our bot's risk rules:\n` +
      `• Stop Loss: 2% per trade\n` +
      `• Take Profit: 6% per trade\n` +
      `• Position Size: 30% of capital\n` +
      `• Max Daily Loss: 5%\n\n` +
      `📊 Why this matters:\n` +
      `Even with ${stats.winRate.toFixed(1)}% win rate, we're ${stats.totalPnL >= 0 ? 'profitable' : 'learning'} ` +
      `because we cut losses fast and let winners run.\n\n` +
      `⚠️ MOST TRADERS FAIL because they don't respect risk management. ` +
      `They win 80% of trades but lose 100% of capital on one bad trade.\n\n` +
      `#RiskManagement #Trading #AlgomBot`,

      // Psychology
      `🧠 TRADING PSYCHOLOGY REALITY\n\n` +
      `After ${stats.totalTrades} trades, here's what we learned:\n\n` +
      `✅ DISCIPLINE: Following rules is harder than making rules\n` +
      `✅ PATIENCE: Not every moment is a trading opportunity\n` +
      `✅ ACCEPTANCE: Losses are normal, managing them is key\n\n` +
      `📊 Real Stats:\n` +
      `• Win Rate: ${stats.winRate.toFixed(1)}%\n` +
      `• Current Streak: ${stats.currentStreak > 0 ? 'WIN' : 'LOSS'} ${Math.abs(stats.currentStreak)}\n\n` +
      `💡 Paper trading teaches EMOTIONAL CONTROL without real money risk. ` +
      `This is the most valuable lesson.\n\n` +
      `#TradingPsychology #Discipline #AlgomBot`
    ];

    return insights[Math.floor(Math.random() * insights.length)];
  }

  // GENERATE COMPARISON TO HODL
  generateHODLComparison(stats) {
    if (!stats || stats.totalTrades < 10) return null;

    const post = `📊 ACTIVE TRADING vs HODL ANALYSIS\n\n` +
                 `🤖 Our Bot: ${stats.totalPnLPercent >= 0 ? '🟢' : '🔴'} ${stats.totalPnLPercent.toFixed(2)}%\n` +
                 `💎 HODL BTC: [Tracking starts from bot launch]\n\n` +
                 `🎓 LESSON: Active trading requires:\n` +
                 `• Time and attention\n` +
                 `• Emotional control\n` +
                 `• Risk management\n` +
                 `• Strategy discipline\n\n` +
                 `HODL requires:\n` +
                 `• Patience\n` +
                 `• Strong conviction\n` +
                 `• Ability to ignore volatility\n\n` +
                 `💡 TRUTH: Neither is "better". Different approaches for different people. ` +
                 `We're testing if active trading can beat buy-and-hold. ` +
                 `${stats.totalTrades} trades in, the data will tell us.\n\n` +
                 `#Trading #HODL #AlgomBot #RealData`;

    return post;
  }

  // GENERATE COMPARISON POST (BOTH EXCHANGES)
  async generateComparisonPost() {
    const allStats = await this.readAllTradingStats();
    
    if (!allStats.bybit && !allStats.binance) {
      return null;
    }
    
    const bybit = allStats.bybit;
    const binance = allStats.binance;
    
    let post = `📊 ALGOM DUAL EXCHANGE PAPER TRADING\n\n`;
    post += `🎯 REAL-TIME COMPARISON:\n\n`;
    
    if (bybit) {
      post += `🟣 BYBIT:\n`;
      post += `• Trades: ${bybit.totalTrades} (${bybit.wins}W/${bybit.losses}L)\n`;
      post += `• Win Rate: ${bybit.winRate.toFixed(1)}%\n`;
      post += `• P&L: ${bybit.totalPnL >= 0 ? '🟢' : '🔴'} $${bybit.totalPnL.toFixed(2)} (${bybit.totalPnLPercent.toFixed(2)}%)\n`;
      post += `• Profit Factor: ${bybit.profitFactor.toFixed(2)}\n\n`;
    }
    
    if (binance) {
      post += `🟡 BINANCE:\n`;
      post += `• Trades: ${binance.totalTrades} (${binance.wins}W/${binance.losses}L)\n`;
      post += `• Win Rate: ${binance.winRate.toFixed(1)}%\n`;
      post += `• P&L: ${binance.totalPnL >= 0 ? '🟢' : '🔴'} $${binance.totalPnL.toFixed(2)} (${binance.totalPnLPercent.toFixed(2)}%)\n`;
      post += `• Profit Factor: ${binance.profitFactor.toFixed(2)}\n\n`;
    }
    
    if (bybit && binance) {
      const better = bybit.totalPnLPercent > binance.totalPnLPercent ? 'Bybit' : 'Binance';
      post += `🏆 LEADER: ${better} is ${Math.abs(bybit.totalPnLPercent - binance.totalPnLPercent).toFixed(2)}% ahead\n\n`;
    }
    
    post += `💡 LESSON: Testing same strategy on multiple exchanges reveals which has better execution.\n\n`;
    post += `#PaperTrading #MultiExchange #AlgomBot #RealData`;
    
    return post;
  }

  // MAIN METHOD: Check stats and generate appropriate post
  async generatePost(postType = 'auto') {
    const allStats = await this.readAllTradingStats();
    
    // If we have both exchanges, sometimes post comparison
    if (allStats.bybit && allStats.binance && Math.random() < 0.3) {
      const comparisonPost = await this.generateComparisonPost();
      if (comparisonPost) return comparisonPost;
    }
    
    // Otherwise, pick one exchange to report on
    let stats = null;
    let exchange = null;
    
    if (allStats.bybit && allStats.binance) {
      // If both exist, alternate between them
      exchange = Math.random() < 0.5 ? 'bybit' : 'binance';
      stats = allStats[exchange];
    } else if (allStats.bybit) {
      exchange = 'bybit';
      stats = allStats.bybit;
    } else if (allStats.binance) {
      exchange = 'binance';
      stats = allStats.binance;
    }
    
    if (!stats) {
      return null;
    }

    switch (postType) {
      case 'trade':
        return this.generateTradeReport(stats, exchange);
      case 'daily':
        return this.generateDailyReport(stats, exchange);
      case 'weekly':
        return this.generateWeeklyReport(stats, exchange);
      case 'strategy':
        return this.generateStrategyInsight(stats);
      case 'hodl':
        return this.generateHODLComparison(stats);
      case 'comparison':
        return this.generateComparisonPost();
      case 'auto':
        // Check for new trades on either exchange
        const bybitTrade = allStats.bybit ? this.generateTradeReport(allStats.bybit, 'bybit') : null;
        const binanceTrade = allStats.binance ? this.generateTradeReport(allStats.binance, 'binance') : null;
        
        if (bybitTrade) return bybitTrade;
        if (binanceTrade) return binanceTrade;
        
        // Otherwise return a random educational post
        const random = Math.random();
        if (random < 0.3 && allStats.bybit && allStats.binance) {
          return this.generateComparisonPost();
        } else if (random < 0.6) {
          return this.generateStrategyInsight(stats);
        } else {
          return this.generateDailyReport(stats, exchange);
        }
      default:
        return this.generateDailyReport(stats, exchange);
    }
  }
}

// INTEGRATION WITH YOUR EXISTING EDUCATIONAL BOT
export class TradingBotIntegration {
  constructor(educationalBotEngine) {
    this.educationalBotEngine = educationalBotEngine;
    this.statsReporter = new TradingStatsReporter();
  }

  // ADD TO YOUR EXISTING POST SELECTION
  async enhancePostSelection(marketData) {
    // 30% chance to post about paper trading results
    if (Math.random() < 0.3) {
      const tradingPost = await this.statsReporter.generatePost('auto');
      if (tradingPost) {
        return {
          type: 'paper_trading_report',
          status: 'educational',
          content: tradingPost
        };
      }
    }

    // Otherwise use existing educational content
    return null;
  }

  // SCHEDULE SPECIFIC REPORTS
  async scheduleReports() {
    // Daily report every 24 hours
    setInterval(async () => {
      const dailyPost = await this.statsReporter.generatePost('daily');
      if (dailyPost) {
        console.log('📊 DAILY REPORT READY:\n', dailyPost);
        // Your existing tweet method here
      }
    }, 24 * 60 * 60 * 1000);

    // Weekly report every 7 days
    setInterval(async () => {
      const weeklyPost = await this.statsReporter.generatePost('weekly');
      if (weeklyPost) {
        console.log('📊 WEEKLY REPORT READY:\n', weeklyPost);
        // Your existing tweet method here
      }
    }, 7 * 24 * 60 * 60 * 1000);
  }
}

export default TradingStatsReporter;
