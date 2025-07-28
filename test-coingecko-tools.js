import { CoinGeckoMCPClient } from './coingecko-mcp-client.js';

async function testCoinGeckoTools() {
  console.log('🔍 Testing CoinGecko MCP tools...');
  
  const client = new CoinGeckoMCPClient();
  await client.initialize();
  
  if (client.isConnected) {
    console.log('\n📊 Testing getCryptoPrice for BTC:');
    const btcPrice = await client.getCryptoPrice('bitcoin');
    console.log('BTC Price:', btcPrice);
    
    console.log('\n📊 Testing getMarketData for ETH:');
    const ethData = await client.getMarketData('ethereum');
    console.log('ETH Market Data:', ethData);
    
    console.log('\n📊 Testing getTrendingCoins:');
    const trending = await client.getTrendingCoins();
    console.log('Trending Coins:', trending.slice(0, 3));
    
    console.log('\n📊 Testing getGlobalMarketData:');
    const global = await client.getGlobalMarketData();
    console.log('Global Market Data:', global);
  }
  
  console.log('\n✅ Test complete');
  process.exit(0);
}

testCoinGeckoTools().catch(console.error); 