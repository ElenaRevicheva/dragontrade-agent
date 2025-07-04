import dotenv from 'dotenv';
dotenv.config();

// Test Twitter API credentials
async function testTwitterCredentials() {
  console.log('🔑 Testing Twitter API Credentials...\n');
  
  // Check if all credentials are loaded
  const credentials = {
    API_KEY: process.env.TWITTER_API_KEY,
    API_SECRET: process.env.TWITTER_API_SECRET,
    ACCESS_TOKEN: process.env.TWITTER_ACCESS_TOKEN,
    ACCESS_TOKEN_SECRET: process.env.TWITTER_ACCESS_TOKEN_SECRET
  };
  
  console.log('📋 Credential Check:');
  for (const [key, value] of Object.entries(credentials)) {
    console.log(`   ${key}: ${value ? '✅ SET' : '❌ MISSING'}`);
  }
  
  // Check if any are missing
  const missing = Object.entries(credentials).filter(([key, value]) => !value);
  if (missing.length > 0) {
    console.log('\n❌ Missing credentials:', missing.map(([key]) => key).join(', '));
    return false;
  }
  
  console.log('\n🔗 Testing Twitter API connection...');
  
  try {
    // Try to import twitter-api-v2
    const { TwitterApi } = await import('twitter-api-v2');
    
    const client = new TwitterApi({
      appKey: credentials.API_KEY,
      appSecret: credentials.API_SECRET,
      accessToken: credentials.ACCESS_TOKEN,
      accessSecret: credentials.ACCESS_TOKEN_SECRET,
    });
    
    // Test the connection by getting user info
    console.log('🔍 Attempting to verify credentials...');
    const user = await client.v2.me();
    
    console.log('✅ SUCCESS! Twitter API connection works!');
    console.log('📱 Connected as:', user.data.username);
    console.log('👤 Display name:', user.data.name);
    console.log('🆔 User ID:', user.data.id);
    
    return true;
    
  } catch (error) {
    console.log('❌ Twitter API connection failed:');
    console.log('Error:', error.message);
    
    if (error.code === 401) {
      console.log('\n🔧 SOLUTION: This is likely an authentication error.');
      console.log('   - Check if your API keys are correct');
      console.log('   - Make sure your app has "Read and Write" permissions');
      console.log('   - Try regenerating your Access Token and Secret');
    } else if (error.code === 403) {
      console.log('\n🔧 SOLUTION: This is likely a permissions error.');
      console.log('   - Your app may not have posting permissions');
      console.log('   - Check app permissions in Twitter Developer Portal');
    } else {
      console.log('\n🔧 SOLUTION: Check the error message above for details.');
    }
    
    return false;
  }
}

testTwitterCredentials().then(success => {
  if (success) {
    console.log('\n🎉 Your Twitter credentials are working!');
    console.log('💡 The issue might be with ElizaOS Twitter plugin configuration.');
  } else {
    console.log('\n🚨 Fix your Twitter credentials first, then try again.');
  }
}).catch(err => {
  console.error('💥 Test failed:', err.message);
});