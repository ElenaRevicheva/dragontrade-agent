import dotenv from 'dotenv';
dotenv.config();

async function testCoinMarketCapAPI() {
  console.log('🔍 Testing CoinMarketCap API Connection...\n');
  
  // Check if API key is set
  const apiKey = process.env.COINMARKETCAP_API_KEY;
  
  console.log('📋 API Key Check:');
  console.log('COINMARKETCAP_API_KEY:', apiKey ? `✅ SET (length: ${apiKey.length})` : '❌ NOT SET');
  
  if (!apiKey) {
    console.log('\n❌ No CoinMarketCap API key found!');
    console.log('💡 Add COINMARKETCAP_API_KEY to your .env file');
    return false;
  }
  
  // Show API key preview (safe for logs)
  if (apiKey.length > 8) {
    console.log('API Key Preview:', `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);
  }
  
  console.log('\n🔗 Testing CoinMarketCap API connection...');
  
  try {
    // Test API call
    const response = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=10', {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json'
      }
    });
    
    console.log('📡 Response Status:', response.status);
    console.log('📡 Response OK:', response.ok);
    
    if (!response.ok) {
      console.log('❌ API Response Error:');
      const errorText = await response.text();
      console.log('Error Details:', errorText.substring(0, 200));
      
      if (response.status === 401) {
        console.log('\n🔧 401 Error Solutions:');
        console.log('1. Check if your API key is correct');
        console.log('2. Make sure you copied the entire key');
        console.log('3. Verify your CMC account is active');
        console.log('4. Check if you have API credits remaining');
      } else if (response.status === 429) {
        console.log('\n🔧 429 Error (Rate Limited):');
        console.log('1. You\'ve exceeded your API call limit');
        console.log('2. Wait before trying again');
        console.log('3. Consider upgrading your CMC plan');
      }
      
      return false;
    }
    
    const data = await response.json();
    
    console.log('✅ SUCCESS! CoinMarketCap API connection works!');
    console.log('\n📊 Sample Data Retrieved:');
    
    if (data.data && data.data.length > 0) {
      console.log('📈 Top 3 Cryptocurrencies:');
      data.data.slice(0, 3).forEach((crypto, index) => {
        const price = crypto.quote?.USD?.price?.toFixed(2) || 'N/A';
        const change = crypto.quote?.USD?.percent_change_24h?.toFixed(2) || 'N/A';
        console.log(`${index + 1}. ${crypto.symbol}: $${price} (${change}%)`);
      });
    }
    
    if (data.status) {
      console.log('\n📋 API Status Info:');
      console.log('Credits Used:', data.status.credit_count);
      console.log('Total Credits:', data.status.total_count || 'N/A');
    }
    
    console.log('\n🎉 Your CoinMarketCap API is ready for legendary alpha generation!');
    return true;
    
  } catch (error) {
    console.log('❌ Connection Error:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n🔧 Network Error Solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Verify firewall/proxy settings');
      console.log('3. Try again in a few minutes');
    }
    
    return false;
  }
}

// Run the test
testCoinMarketCapAPI().then(success => {
  if (success) {
    console.log('\n✅ Your bot will use REAL market data for legendary posts!');
  } else {
    console.log('\n⚠️ Bot will use demo data (still works great!)');
    console.log('💡 Add real CMC API key later for live market data');
  }
}).catch(err => {
  console.error('💥 Test failed:', err.message);
});