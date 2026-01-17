// Test Twitter API directly
const { TwitterApi } = require('twitter-api-v2');

const client = new TwitterApi({
  appKey: 'i047JuaMxXdOFxW25yDCTEgNf',
  appSecret: 'Gqyi2vyNVphLrvT9Wwdykeg7N5dEQoFH7D3XAQXOpkbJgrUXLM',
  accessToken: '1563632998863577092-LUjrkMuwwmcelLDTxJJYPTH0KWy3OG',
  accessSecret: 'k3gFNPISmjF51Sbg8BASo6qc6kUOqbIlkCdwFlHVDSlam',
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
