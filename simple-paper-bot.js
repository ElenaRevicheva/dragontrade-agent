// 🎯 STEP 1: YOUR FIRST PAPER TRADING BOT
// Learn how to connect to a real exchange and read live prices
// NO RISK - We're just watching the market, not trading yet!

import ccxt from 'ccxt';

console.log('\n🚀 WELCOME TO YOUR TRADING JOURNEY!\n');
console.log('📚 STEP 1: Connecting to Real Market Data\n');
console.log('═══════════════════════════════════════════════════════════\n');

class SimplePaperTradingBot {
  constructor() {
    // Create connection to Binance (no API keys needed for public data)
    this.exchange = new ccxt.binance({
      enableRateLimit: true, // Be nice to the exchange
    });
    
    this.symbol = 'BTC/USDT';
    this.priceHistory = [];
  }

  // Fetch current price from real exchange
  async getCurrentPrice() {
    try {
      const ticker = await this.exchange.fetchTicker(this.symbol);
      
      return {
        symbol: this.symbol,
        price: ticker.last,
        bid: ticker.bid,    // Highest price someone wants to buy
        ask: ticker.ask,    // Lowest price someone wants to sell
        volume24h: ticker.quoteVolume,
        change24h: ticker.percentage,
        timestamp: new Date(ticker.timestamp)
      };
      
    } catch (error) {
      console.error('❌ Error fetching price:', error.message);
      return null;
    }
  }

  // Display price in a nice format
  displayPrice(priceData) {
    if (!priceData) return;
    
    const changeEmoji = priceData.change24h >= 0 ? '🟢' : '🔴';
    const changeSign = priceData.change24h >= 0 ? '+' : '';
    
    console.log('\n📊 LIVE MARKET DATA:');
    console.log('───────────────────────────────────────────────────────────');
    console.log(`   ${priceData.symbol}`);
    console.log(`   Price: $${priceData.price.toLocaleString()}`);
    console.log(`   24h Change: ${changeEmoji} ${changeSign}${priceData.change24h.toFixed(2)}%`);
    console.log(`   Bid: $${priceData.bid.toLocaleString()}`);
    console.log(`   Ask: $${priceData.ask.toLocaleString()}`);
    console.log(`   Spread: $${(priceData.ask - priceData.bid).toFixed(2)}`);
    console.log(`   24h Volume: $${(priceData.volume24h / 1_000_000).toFixed(2)}M`);
    console.log(`   Time: ${priceData.timestamp.toLocaleTimeString()}`);
    console.log('───────────────────────────────────────────────────────────');
    
    // Store price for later analysis
    this.priceHistory.push({
      price: priceData.price,
      timestamp: priceData.timestamp
    });
    
    // Keep only last 20 prices
    if (this.priceHistory.length > 20) {
      this.priceHistory.shift();
    }
  }

  // Show what you're learning
  displayLearningInsight() {
    console.log('\n💡 WHAT YOU\'RE LEARNING:\n');
    
    if (this.priceHistory.length < 2) {
      console.log('   🎓 You just fetched REAL market data from Binance!');
      console.log('   🎓 This is the same data professional traders see.');
      console.log('   🎓 No API keys needed for public data - anyone can read it.');
      console.log('   🎓 Exchanges provide: price, volume, bid/ask spreads.');
      
    } else {
      // Calculate price movement
      const firstPrice = this.priceHistory[0].price;
      const lastPrice = this.priceHistory[this.priceHistory.length - 1].price;
      const priceChange = lastPrice - firstPrice;
      const priceChangePercent = (priceChange / firstPrice) * 100;
      
      console.log(`   📈 Since you started watching: ${priceChangePercent >= 0 ? '🟢' : '🔴'} ${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(3)}%`);
      console.log(`   📊 Price moved: $${Math.abs(priceChange).toFixed(2)}`);
      console.log(`   🎯 Data points collected: ${this.priceHistory.length}`);
      
      if (this.priceHistory.length >= 5) {
        // Calculate simple moving average
        const recentPrices = this.priceHistory.slice(-5).map(p => p.price);
        const sma5 = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
        const currentPrice = lastPrice;
        
        console.log(`   📐 5-Period Moving Average: $${sma5.toLocaleString()}`);
        
        if (currentPrice > sma5) {
          console.log(`   🎓 Price is ABOVE MA → Short-term uptrend`);
        } else {
          console.log(`   🎓 Price is BELOW MA → Short-term downtrend`);
        }
      }
    }
    
    console.log('\n');
  }

  // Start watching the market
  async start() {
    console.log('🔗 Connecting to Binance...\n');
    
    try {
      // Test connection
      await this.exchange.loadMarkets();
      console.log(`✅ Connected to Binance successfully!`);
      console.log(`📡 Watching ${this.symbol} live...\n`);
      console.log('Press Ctrl+C to stop\n');
      
      // Fetch price every 10 seconds (for learning)
      // In production, you'd use WebSocket for real-time data
      const fetchInterval = 10000; // 10 seconds
      
      // Fetch immediately
      await this.fetchAndDisplay();
      
      // Then fetch every 10 seconds
      setInterval(async () => {
        await this.fetchAndDisplay();
      }, fetchInterval);
      
    } catch (error) {
      console.error('\n❌ Failed to connect to Binance:', error.message);
      console.log('\n💡 TIP: Check your internet connection and try again.\n');
    }
  }

  async fetchAndDisplay() {
    const priceData = await this.getCurrentPrice();
    if (priceData) {
      this.displayPrice(priceData);
      this.displayLearningInsight();
    }
  }

  // Stop the bot
  stop() {
    console.log('\n🛑 Stopping bot...');
    console.log(`\n📊 You collected ${this.priceHistory.length} price data points!`);
    console.log('🎓 Next step: We\'ll add moving averages and start simulating trades.\n');
    process.exit(0);
  }
}

// ═══════════════════════════════════════════════════════════
// RUN THE BOT
// ═══════════════════════════════════════════════════════════

async function main() {
  const bot = new SimplePaperTradingBot();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    bot.stop();
  });
  
  await bot.start();
}

// Start!
main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  console.log('\n💡 TIP: Make sure you have internet connection.\n');
  process.exit(1);
});
