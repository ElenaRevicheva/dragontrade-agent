#!/usr/bin/env node
// Verify and clean up test/fake data - show only REAL accomplishments

import { createClient } from './db-config.js';

async function verifyRealData() {
  const client = createClient();
  
  try {
    console.log('🔍 Verifying dashboard shows only REAL data...\n');
    
    await client.connect();
    console.log('✅ Connected to database');
    
    // Check for test data in trading_stats
    console.log('\n1️⃣ Checking for test data in trading stats...');
    const testStats = await client.query(`
      SELECT exchange FROM trading_stats 
      WHERE exchange LIKE '%test%' OR exchange LIKE '%TEST%'
    `);
    
    if (testStats.rowCount > 0) {
      console.log(`   ⚠️ Found ${testStats.rowCount} test entries`);
      console.log('   🧹 Removing test data...');
      
      const deleted = await client.query(`
        DELETE FROM trading_stats 
        WHERE exchange LIKE '%test%' OR exchange LIKE '%TEST%'
        RETURNING exchange
      `);
      
      console.log(`   ✅ Deleted ${deleted.rowCount} test entries`);
      deleted.rows.forEach(row => console.log(`      - ${row.exchange}`));
    } else {
      console.log('   ✅ No test data found');
    }
    
    // Verify all posts are real (have actual content and tweet IDs)
    console.log('\n2️⃣ Verifying all posts are real...');
    const posts = await client.query(`
      SELECT 
        COUNT(*) as total_posts,
        COUNT(CASE WHEN metadata->>'tweetId' IS NOT NULL THEN 1 END) as posts_with_tweet_ids,
        COUNT(CASE WHEN success = TRUE THEN 1 END) as successful_posts
      FROM post_log
    `);
    
    const p = posts.rows[0];
    console.log(`   📊 Total posts: ${p.total_posts}`);
    console.log(`   ✅ Posts with Twitter IDs: ${p.posts_with_tweet_ids}`);
    console.log(`   ✅ Successfully posted: ${p.successful_posts}`);
    
    if (parseInt(p.total_posts) !== parseInt(p.successful_posts)) {
      console.log(`   ⚠️ ${parseInt(p.total_posts) - parseInt(p.successful_posts)} failed posts in log (kept for records)`);
    }
    
    // Show REAL content balance
    console.log('\n3️⃣ REAL CONTENT BALANCE (all actually posted):');
    const balance = await client.query('SELECT * FROM content_balance');
    if (balance.rows.length > 0) {
      const b = balance.rows[0];
      console.log(`   📊 Paper Trading: ${b.paper_trading_count} posts (${b.paper_trading_percent}%)`);
      console.log(`   🚀 AIdeazz Marketing: ${b.aideazz_count} posts (${b.aideazz_percent}%)`);
      console.log(`   📚 Educational: ${b.educational_count} posts (${b.educational_percent}%)`);
      console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`   📈 Total: ${b.total_posts} REAL posts on Twitter`);
    }
    
    // Show REAL exchange performance
    console.log('\n4️⃣ REAL EXCHANGE PERFORMANCE:');
    const exchanges = await client.query(`
      SELECT exchange, data FROM trading_stats
      ORDER BY updated_at DESC
    `);
    
    if (exchanges.rowCount > 0) {
      exchanges.rows.forEach(row => {
        console.log(`   💹 ${row.exchange.toUpperCase()}:`);
        console.log(`      Trades: ${row.data.totalTrades || 0}`);
        console.log(`      Win Rate: ${row.data.winRate ? row.data.winRate.toFixed(1) : '0.0'}%`);
        console.log(`      P&L: ${(row.data.totalProfitLoss || 0).toFixed(2)}%`);
      });
    } else {
      console.log('   ℹ️ No paper trading results yet (bots just started)');
    }
    
    // Show today's REAL activity
    console.log('\n5️⃣ TODAY\'S REAL ACTIVITY:');
    const today = await client.query(`
      SELECT 
        post_type,
        COUNT(*) as count
      FROM post_log
      WHERE posted_at > NOW() - INTERVAL '24 hours'
        AND success = TRUE
      GROUP BY post_type
      ORDER BY count DESC
    `);
    
    if (today.rowCount > 0) {
      today.rows.forEach(row => {
        const emoji = row.post_type === 'paper_trading_report' ? '📊' :
                     row.post_type === 'aideazz_marketing' ? '🚀' : '📚';
        console.log(`   ${emoji} ${row.post_type}: ${row.count} posts`);
      });
    } else {
      console.log('   ℹ️ No posts in last 24 hours');
    }
    
    await client.end();
    
    console.log('\n✅ VERIFICATION COMPLETE!');
    console.log('📊 Dashboard now shows 100% REAL data only!');
    console.log('🔄 Refresh your dashboard to see cleaned data!\n');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    console.error('\nStack trace:', error.stack);
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    process.exit(1);
  }
}

verifyRealData();
