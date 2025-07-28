// Rate Limit Monitor for X API
import { TwitterApi } from 'twitter-api-v2';

class RateLimitMonitor {
  constructor() {
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      accessToken: process.env.TWITTER_ACCESS_TOKEN,
      accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    });
  }

  async checkRateLimits() {
    try {
      console.log('🔍 [RATE LIMIT MONITOR] Checking current rate limits...');
      
      // Get rate limit status for different endpoints
      const endpoints = [
        '/2/tweets',
        '/2/users/me',
        '/2/tweets/search/recent'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await this.client.v2.get(endpoint, { 
            max_results: 1 
          });
          
          const headers = response._headers;
          console.log(`\n📊 [RATE LIMIT] Endpoint: ${endpoint}`);
          console.log(`   Remaining: ${headers.get('x-rate-limit-remaining') || 'Unknown'}`);
          console.log(`   Limit: ${headers.get('x-rate-limit-limit') || 'Unknown'}`);
          console.log(`   Reset: ${headers.get('x-rate-limit-reset') || 'Unknown'}`);
          console.log(`   Reset Time: ${new Date((headers.get('x-rate-limit-reset') || 0) * 1000).toISOString()}`);
          
        } catch (error) {
          console.log(`❌ [RATE LIMIT] Error checking ${endpoint}:`, error.message);
          if (error.code === 429) {
            console.log(`   🚫 Rate limited on ${endpoint}`);
            console.log(`   Headers:`, error._headers);
          }
        }
      }

      // Test a simple tweet to see actual limits
      console.log('\n🧪 [RATE LIMIT] Testing actual tweet posting...');
      try {
        const testTweet = await this.client.v2.tweet('🧪 Rate limit test - ' + new Date().toISOString());
        console.log('✅ [RATE LIMIT] Test tweet successful:', testTweet.data.id);
        
        // Get headers from the response
        const headers = testTweet._headers;
        console.log(`   Remaining tweets: ${headers.get('x-rate-limit-remaining') || 'Unknown'}`);
        console.log(`   Tweet limit: ${headers.get('x-rate-limit-limit') || 'Unknown'}`);
        console.log(`   Reset time: ${headers.get('x-rate-limit-reset') || 'Unknown'}`);
        
      } catch (error) {
        console.log('❌ [RATE LIMIT] Test tweet failed:', error.message);
        if (error.code === 429) {
          console.log('🚫 Rate limited on tweet posting');
          console.log('Headers:', error._headers);
        }
      }

    } catch (error) {
      console.error('❌ [RATE LIMIT MONITOR] Error:', error.message);
    }
  }

  async generateSupportReport() {
    console.log('\n📋 [SUPPORT REPORT] Generating detailed report for X support...');
    
    const report = {
      timestamp: new Date().toISOString(),
      account: '@reviceva',
      accountType: 'Premium+',
      issues: [
        'Getting 429 errors after 1-2 posts despite Premium+ status',
        'Rate limits appear to be same as free accounts',
        'Conservative posting intervals (10-30 minutes) still trigger limits'
      ],
      technicalDetails: {
        apiVersion: 'v2',
        endpoints: ['POST /2/tweets'],
        postingInterval: '10-30 minutes',
        contentType: 'Educational crypto analysis',
        noSpam: true,
        noDuplicates: true
      },
      expectedBehavior: [
        'Premium+ should have higher rate limits than free accounts',
        'Should be able to post more frequently than current limits',
        'Rate limits should be clearly documented for Premium+'
      ],
      request: [
        'Verify Premium+ API rate limits',
        'Check account restrictions',
        'Provide correct rate limit documentation',
        'Resolve persistent 429 errors'
      ]
    };

    console.log('📄 [SUPPORT REPORT] Copy this to X support:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(report, null, 2));
    console.log('='.repeat(60));
    
    return report;
  }
}

// Run the monitor
async function main() {
  const monitor = new RateLimitMonitor();
  await monitor.checkRateLimits();
  await monitor.generateSupportReport();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { RateLimitMonitor }; 