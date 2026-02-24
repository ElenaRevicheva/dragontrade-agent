// Test Twitter API directly (uses .env - do not commit real keys)
require('dotenv').config();
const { TwitterApi } = require('twitter-api-v2');

if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_ACCESS_TOKEN) {
  console.log('Set TWITTER_API_KEY, TWITTER_API_SECRET, TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_TOKEN_SECRET in .env');
  process.exit(1);
}

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

async function testTwitter() {
  try {
    console.log('Testing Twitter API...');
    
    // Try to get rate limit status
    const me = await client.v2.me();
    console.log('✅ Authentication successful!');
    console.log('Account:', me.data.username);
    
    // Try a simple post
    console.log('Attempting to post test tweet...');
    const tweet = await client.v2.tweet('Test from Oracle Cloud ☁️ ' + Date.now());
    console.log('✅ Tweet posted successfully!');
    console.log('Tweet ID:', tweet.data.id);
    
  } catch (error) {
    console.log('❌ Error:', error.message);
    if (error.code) console.log('Error code:', error.code);
    if (error.data) console.log('Error data:', JSON.stringify(error.data, null, 2));
    if (error.rateLimit) console.log('Rate limit info:', error.rateLimit);
  }
}

testTwitter();
