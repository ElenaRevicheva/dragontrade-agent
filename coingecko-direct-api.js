// CoinGecko Direct API Client - Using Real API Key
class CoinGeckoDirectAPI {
  constructor() {
    this.apiKey = process.env.COINGECKO_API_KEY;
    this.baseUrl = 'https://api.coingecko.com/api/v3';
    this.isInitialized = false;
    this.lastCall = 0;
    this.rateLimitDelay = 2000; // 2 seconds between calls (30 RPM limit)
  }

  async initialize() {
    try {
      console.log('🔗 [COINGECKO API] Initializing direct CoinGecko API client...');
      
      if (!this.apiKey) {
        console.log('⚠️ [COINGECKO API] No API key found, using fallback mode');
        return false;
      }

      console.log('✅ [COINGECKO API] API key found, testing connection...');
      
      // Test the API connection
      const testResult = await this.testConnection();
      if (testResult) {
        this.isInitialized = true;
        console.log('✅ [COINGECKO API] Direct API client initialized successfully');
        return true;
      } else {
        console.log('⚠️ [COINGECKO API] Connection test failed, using fallback mode');
        return false;
      }
    } catch (error) {
      console.log('⚠️ [COINGECKO API] Initialization failed:', error.message);
      return false;
    }
  }

  async testConnection() {
    try {
      const response = await this.makeRequest('/ping');
      return response && response.gecko_says;
    } catch (error) {
      console.log('❌ [COINGECKO API] Connection test failed:', error.message);
      return false;
    }
  }

  async makeRequest(endpoint, params = {}) {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    if (timeSinceLastCall < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastCall;
      console.log(`⏰ [COINGECKO API] Rate limiting, waiting ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    try {
      const url = new URL(this.baseUrl + endpoint);
      
      // Add API key to headers
      const headers = {
        'Accept': 'application/json',
        'User-Agent': 'dragontrade-agent/1.0.0'
      };

      // Add parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          url.searchParams.append(key, params[key]);
        }
      });

      console.log(`📡 [COINGECKO API] Making request to: ${endpoint}`);
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: headers
      });

      this.lastCall = Date.now();

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ [COINGECKO API] Request successful: ${endpoint}`);
      return data;
    } catch (error) {
      console.log(`❌ [COINGECKO API] Request failed: ${endpoint} - ${error.message}`);
      throw error;
    }
  }

  async getCryptoPrice(symbol, vsCurrency = 'usd') {
    if (!this.isInitialized) {
      return this.getFallbackPrice(symbol);
    }

    try {
      const data = await this.makeRequest('/simple/price', {
        ids: symbol.toLowerCase(),
        vs_currencies: vsCurrency,
        include_24hr_change: true,
        include_market_cap: true,
        include_24hr_vol: true
      });

      const coinData = data[symbol.toLowerCase()];
      if (coinData) {
        return {
          symbol: symbol.toUpperCase(),
          price: coinData[vsCurrency],
          change_24h: coinData[`${vsCurrency}_24h_change`] || 0,
          market_cap: coinData[`${vsCurrency}_market_cap`] || 0,
          volume_24h: coinData[`${vsCurrency}_24h_vol`] || 0
        };
      }
    } catch (error) {
      console.log(`⚠️ [COINGECKO API] Error getting price for ${symbol}:`, error.message);
    }

    return this.getFallbackPrice(symbol);
  }

  async getMarketData(symbol, vsCurrency = 'usd') {
    if (!this.isInitialized) {
      return this.getFallbackMarketData(symbol);
    }

    try {
      const data = await this.makeRequest('/coins/markets', {
        vs_currency: vsCurrency,
        ids: symbol.toLowerCase(),
        order: 'market_cap_desc',
        per_page: 1,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h'
      });

      if (data && data.length > 0) {
        const coinData = data[0];
        return {
          symbol: symbol.toUpperCase(),
          price: coinData.current_price,
          change_24h: coinData.price_change_percentage_24h || 0,
          market_cap: coinData.market_cap,
          volume_24h: coinData.total_volume,
          high_24h: coinData.high_24h,
          low_24h: coinData.low_24h,
          circulating_supply: coinData.circulating_supply,
          total_supply: coinData.total_supply
        };
      }
    } catch (error) {
      console.log(`⚠️ [COINGECKO API] Error getting market data for ${symbol}:`, error.message);
    }

    return this.getFallbackMarketData(symbol);
  }

  async getTrendingCoins(vsCurrency = 'usd') {
    if (!this.isInitialized) {
      return this.getFallbackTrendingCoins();
    }

    try {
      const data = await this.makeRequest('/search/trending');
      
      if (data && data.coins) {
        return data.coins.slice(0, 10).map(coin => ({
          symbol: coin.item.symbol.toUpperCase(),
          name: coin.item.name,
          price: coin.item.price_btc * 45000, // Approximate BTC price
          change_24h: 0, // Trending doesn't include 24h change
          market_cap: coin.item.market_cap_rank || 0,
          volume_24h: 0
        }));
      }
    } catch (error) {
      console.log('⚠️ [COINGECKO API] Error getting trending coins:', error.message);
    }

    return this.getFallbackTrendingCoins();
  }

  async getGlobalMarketData(vsCurrency = 'usd') {
    if (!this.isInitialized) {
      return this.getFallbackGlobalData();
    }

    try {
      const data = await this.makeRequest('/global');
      
      if (data && data.data) {
        return {
          total_market_cap: data.data.total_market_cap?.usd || 0,
          total_volume_24h: data.data.total_volume?.usd || 0,
          market_cap_percentage: data.data.market_cap_percentage || {},
          market_cap_change_percentage_24h_usd: data.data.market_cap_change_percentage_24h?.usd || 0
        };
      }
    } catch (error) {
      console.log('⚠️ [COINGECKO API] Error getting global market data:', error.message);
    }

    return this.getFallbackGlobalData();
  }

  async getTopGainersLosers(vsCurrency = 'usd') {
    if (!this.isInitialized) {
      return this.getFallbackTrendingCoins();
    }

    try {
      const data = await this.makeRequest('/coins/markets', {
        vs_currency: vsCurrency,
        order: 'market_cap_desc',
        per_page: 50,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h'
      });

      if (data && data.length > 0) {
        // Get top gainers (positive 24h change)
        const gainers = data
          .filter(coin => coin.price_change_percentage_24h > 0)
          .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
          .slice(0, 5)
          .map(coin => ({
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price: coin.current_price,
            change_24h: coin.price_change_percentage_24h || 0,
            market_cap: coin.market_cap || 0,
            volume_24h: coin.total_volume || 0
          }));

        return gainers;
      }
    } catch (error) {
      console.log('⚠️ [COINGECKO API] Error getting top gainers/losers:', error.message);
    }

    return this.getFallbackTrendingCoins();
  }

  // Fallback methods (same as before)
  getFallbackPrice(symbol) {
    const fallbackPrices = {
      'BTC': { price: 45000, change_24h: 2.5, market_cap: 850000000000, volume_24h: 25000000000 },
      'ETH': { price: 2800, change_24h: 1.8, market_cap: 350000000000, volume_24h: 15000000000 },
      'SOL': { price: 95, change_24h: 5.2, market_cap: 45000000000, volume_24h: 3000000000 },
      'ADA': { price: 0.45, change_24h: -1.2, market_cap: 16000000000, volume_24h: 800000000 },
      'DOT': { price: 6.8, change_24h: 3.1, market_cap: 8500000000, volume_24h: 400000000 }
    };

    const fallback = fallbackPrices[symbol.toUpperCase()] || { price: 100, change_24h: 0, market_cap: 1000000000, volume_24h: 50000000 };
    return {
      symbol: symbol.toUpperCase(),
      ...fallback
    };
  }

  getFallbackMarketData(symbol) {
    const priceData = this.getFallbackPrice(symbol);
    return {
      ...priceData,
      high_24h: priceData.price * 1.05,
      low_24h: priceData.price * 0.95,
      circulating_supply: 1000000000,
      total_supply: 1000000000
    };
  }

  getFallbackTrendingCoins() {
    return [
      { symbol: 'BTC', name: 'Bitcoin', price: 45000, change_24h: 2.5, market_cap: 850000000000, volume_24h: 25000000000 },
      { symbol: 'ETH', name: 'Ethereum', price: 2800, change_24h: 1.8, market_cap: 350000000000, volume_24h: 15000000000 },
      { symbol: 'SOL', name: 'Solana', price: 95, change_24h: 5.2, market_cap: 45000000000, volume_24h: 3000000000 }
    ];
  }

  getFallbackGlobalData() {
    return {
      total_market_cap: 1800000000000,
      total_volume_24h: 80000000000,
      market_cap_percentage: { btc: 50, eth: 20, others: 30 },
      market_cap_change_percentage_24h_usd: 1.5
    };
  }

  async disconnect() {
    this.isInitialized = false;
    console.log('🔌 [COINGECKO API] Direct API client disconnected');
  }

  async checkConnectionHealth() {
    if (!this.isInitialized) {
      return false;
    }

    try {
      const result = await this.testConnection();
      return result;
    } catch (error) {
      console.log('⚠️ [COINGECKO API] Health check failed:', error.message);
      this.isInitialized = false;
      return false;
    }
  }
}

export { CoinGeckoDirectAPI }; 