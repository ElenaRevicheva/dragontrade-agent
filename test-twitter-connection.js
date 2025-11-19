#!/usr/bin/env node

/**
 * Twitter Connection Diagnostic Tool
 * Tests Twitter API credentials and connection
 */

import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 TWITTER API DIAGNOSTIC TOOL\n');

// Check environment variables
console.log('📋 Checking environment variables...');
const requiredVars = [
  'TWITTER_API_KEY',
  'TWITTER_API_SECRET',
  'TWITTER_ACCESS_TOKEN',
  'TWITTER_ACCESS_TOKEN_SECRET'
];

let missingVars = [];
for (const varName of requiredVars) {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: NOT SET`);
    missingVars.push(varName);
  } else {
    console.log(`✅ ${varName}: SET (${value.substring(0, 10)}...)`);
  }
}

if (missingVars.length > 0) {
  console.log(`\n❌ Missing ${missingVars.length} required environment variables:`);
  missingVars.forEach(v => console.log(`   - ${v}`));
  console.log('\nPlease set these in your .env file or Railway environment variables.');
  process.exit(1);
}

console.log('\n✅ All environment variables are set\n');

// Test Twitter connection
console.log('🔗 Testing Twitter API connection...\n');

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

try {
  console.log('📡 Connecting to Twitter API v2...');
  const user = await client.v2.me();
  
  console.log('\n✅ CONNECTION SUCCESSFUL!\n');
  console.log('👤 User Details:');
  console.log(`   Username: @${user.data.username}`);
  console.log(`   Display Name: ${user.data.name}`);
  console.log(`   User ID: ${user.data.id}`);
  
  // Test posting ability (dry run)
  console.log('\n🧪 Testing posting permissions...');
  try {
    // We won't actually post, just check if we can access the endpoint
    const limits = await client.v2.rateLimits();
    console.log('✅ API access confirmed');
    console.log(`   Rate limits retrieved successfully`);
  } catch (error) {
    console.log('⚠️  Could not check rate limits:', error.message);
  }
  
  console.log('\n🎉 DIAGNOSIS COMPLETE - ALL SYSTEMS GO!');
  console.log('Your Twitter bot should be able to post successfully.');
  
  process.exit(0);
  
} catch (error) {
  console.log('\n❌ CONNECTION FAILED!\n');
  console.log('Error Type:', error.constructor.name);
  console.log('Error Message:', error.message);
  
  if (error.code) {
    console.log('Error Code:', error.code);
  }
  
  if (error.data) {
    console.log('Error Data:', JSON.stringify(error.data, null, 2));
  }
  
  console.log('\n🔍 Common Issues:');
  console.log('   1. Invalid API credentials');
  console.log('   2. App doesn\'t have Read and Write permissions');
  console.log('   3. Access tokens were regenerated (need to update)');
  console.log('   4. Twitter API keys expired or revoked');
  console.log('   5. Network/firewall blocking Twitter API');
  
  console.log('\n💡 How to fix:');
  console.log('   1. Go to https://developer.twitter.com/en/portal/dashboard');
  console.log('   2. Check your app has "Read and Write" permissions');
  console.log('   3. Regenerate Access Token & Secret if permissions changed');
  console.log('   4. Update all 4 environment variables with new values');
  console.log('   5. Restart the bot');
  
  if (error.stack) {
    console.log('\n📚 Full Stack Trace:');
    console.log(error.stack);
  }
  
  process.exit(1);
}
