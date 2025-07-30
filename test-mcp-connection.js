// Test script for MCP connection issues
import { CoinGeckoMCPClient } from './coingecko-mcp-client.js';

async function testMCPConnection() {
  console.log('🔍 Testing MCP connection with enhanced timeout handling...');
  
  const client = new CoinGeckoMCPClient();
  
  try {
    console.log('📡 Attempting to initialize MCP client...');
    const success = await client.initialize();
    
    if (success) {
      console.log('✅ MCP client initialized successfully');
      
      // Test basic functionality
      console.log('🧪 Testing market data retrieval...');
      const btcData = await client.getMarketData('BTC');
      console.log('📊 BTC Data:', btcData);
      
      const ethData = await client.getMarketData('ETH');
      console.log('📊 ETH Data:', ethData);
      
      // Test trending coins
      console.log('🔥 Testing trending coins...');
      const trending = await client.getTrendingCoins();
      console.log('📈 Trending coins:', trending.slice(0, 3));
      
      // Test global data
      console.log('🌍 Testing global market data...');
      const global = await client.getGlobalMarketData();
      console.log('📊 Global data:', global);
      
      console.log('✅ All tests passed! MCP connection is working properly.');
    } else {
      console.log('❌ MCP client initialization failed');
    }
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Clean up
    await client.disconnect();
    console.log('🔌 Test completed, client disconnected');
  }
}

// Run the test
testMCPConnection().catch(console.error); 