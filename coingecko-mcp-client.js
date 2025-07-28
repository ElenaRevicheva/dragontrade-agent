// CoinGecko MCP Client - Real API Integration
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

class CoinGeckoMCPClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.tools = null;
  }

  async initialize() {
    try {
      console.log('🔗 [COINGECKO MCP] Initializing CoinGecko MCP client...');
      
      // Create MCP client
      this.client = new Client(
        {
          name: 'dragontrade-agent',
          version: '1.0.0',
        },
        {
          capabilities: {
            tools: {},
          },
        }
      );

      // Connect to CoinGecko MCP server
      const transport = new StdioClientTransport({
        command: 'npx',
        args: ['mcp-remote', 'https://mcp.api.coingecko.com/sse'],
      });

      await this.client.connect(transport);
      console.log('✅ [COINGECKO MCP] Connected to CoinGecko MCP server');

      // List available tools
      const toolsResponse = await this.client.listTools();
      this.tools = toolsResponse.tools;
      console.log(`📊 [COINGECKO MCP] Available tools: ${this.tools.length}`);
      
      // Log available tool names for debugging
      console.log('🔧 [COINGECKO MCP] Available tool names:');
      this.tools.forEach((tool, index) => {
        console.log(`  ${index + 1}. ${tool.name}`);
      });

      this.isConnected = true;
      return true;
    } catch (error) {
      console.log('⚠️ [COINGECKO MCP] Connection failed, using fallback:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  async getCryptoPrice(symbol, vsCurrency = 'usd') {
    if (!this.isConnected) {
      console.log('⚠️ [COINGECKO MCP] Not connected, using fallback data');
      return this.getFallbackPrice(symbol);
    }

    try {
      const result = await this.client.callTool({
        name: 'get_simple_price',
        arguments: {
          ids: symbol.toLowerCase(),
          vs_currencies: vsCurrency,
          include_24hr_change: true,
          include_market_cap: true,
          include_24hr_vol: true
        }
      });

      if (result.content && result.content.length > 0) {
        const data = JSON.parse(result.content[0].text);
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
      }
    } catch (error) {
      console.log(`⚠️ [COINGECKO MCP] Error getting price for ${symbol}:`, error.message);
    }

    return this.getFallbackPrice(symbol);
  }

  async getMarketData(symbol, vsCurrency = 'usd') {
    if (!this.isConnected) {
      return this.getFallbackMarketData(symbol);
    }

    try {
      const result = await this.client.callTool({
        name: 'get_coins_markets',
        arguments: {
          vs_currency: vsCurrency,
          ids: symbol.toLowerCase(),
          order: 'market_cap_desc',
          per_page: 1,
          page: 1,
          sparkline: false,
          price_change_percentage: '24h'
        }
      });

      if (result.content && result.content.length > 0) {
        const data = JSON.parse(result.content[0].text);
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
      }
    } catch (error) {
      console.log(`⚠️ [COINGECKO MCP] Error getting market data for ${symbol}:`, error.message);
    }

    return this.getFallbackMarketData(symbol);
  }

  async getTrendingCoins(vsCurrency = 'usd') {
    if (!this.isConnected) {
      return this.getFallbackTrendingCoins();
    }

    try {
      const result = await this.client.callTool({
        name: 'get_coins_top_gainers_losers',
        arguments: {
          vs_currency: vsCurrency
        }
      });

      if (result.content && result.content.length > 0) {
        const data = JSON.parse(result.content[0].text);
        if (Array.isArray(data)) {
          return data.map(coin => ({
            symbol: coin.symbol.toUpperCase(),
            name: coin.name,
            price: coin.current_price,
            change_24h: coin.price_change_percentage_24h || 0,
            market_cap: coin.market_cap || 0,
            volume_24h: coin.total_volume || 0
          }));
        } else {
          console.log('⚠️ [COINGECKO MCP] Unexpected data format for trending coins:', typeof data);
          return this.getFallbackTrendingCoins();
        }
      }
    } catch (error) {
      console.log('⚠️ [COINGECKO MCP] Error getting trending coins:', error.message);
    }

    return this.getFallbackTrendingCoins();
  }

  async getGlobalMarketData(vsCurrency = 'usd') {
    if (!this.isConnected) {
      return this.getFallbackGlobalData();
    }

    try {
      const result = await this.client.callTool({
        name: 'get_global',
        arguments: {}
      });

      if (result.content && result.content.length > 0) {
        const data = JSON.parse(result.content[0].text);
        if (data && data.data) {
          return {
            total_market_cap: data.data.total_market_cap?.usd || 0,
            total_volume_24h: data.data.total_volume?.usd || 0,
            market_cap_percentage: data.data.market_cap_percentage || {},
            market_cap_change_percentage_24h_usd: data.data.market_cap_change_percentage_24h?.usd || 0
          };
        } else {
          console.log('⚠️ [COINGECKO MCP] Unexpected global data format:', typeof data);
          return this.getFallbackGlobalData();
        }
      }
    } catch (error) {
      console.log('⚠️ [COINGECKO MCP] Error getting global market data:', error.message);
    }

    return this.getFallbackGlobalData();
  }

  // Fallback methods for when MCP is not available
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
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('🔌 [COINGECKO MCP] Disconnected from CoinGecko MCP server');
    }
  }
}

export { CoinGeckoMCPClient }; 