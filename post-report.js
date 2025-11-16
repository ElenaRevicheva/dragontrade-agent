// Post Report Generator - Generate beautiful reports of posting activity
// Run this script to see what's been posted

import postLogger from './post-logger.js';

async function generateReport() {
  console.log('\n╔════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                        ║');
  console.log('║                    📊 ALGOM POST ACTIVITY REPORT                       ║');
  console.log('║                                                                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════╝\n');

  // Get daily stats
  console.log('📅 DAILY POSTING STATISTICS (Last 7 Days):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const dailyStats = await postLogger.getDailyStats(7);
  
  if (dailyStats && dailyStats.length > 0) {
    dailyStats.forEach(day => {
      console.log(`📆 ${day.post_date.toISOString().split('T')[0]}`);
      console.log(`   Total Posts: ${day.total_posts}`);
      console.log(`   📊 Paper Trading: ${day.paper_trading_posts} (🟣 Bybit: ${day.bybit_posts} | 🟡 Binance: ${day.binance_posts} | ⚖️  Both: ${day.comparison_posts})`);
      console.log(`   📚 Educational: ${day.educational_posts}`);
      console.log(`   💡 Risk Management: ${day.risk_management_posts}`);
      console.log(`   🧠 Psychology: ${day.psychology_posts}`);
      console.log(`   🚫 Scam Awareness: ${day.scam_awareness_posts}`);
      console.log('');
    });
  } else {
    console.log('   No posts logged yet. Start tracking after next post!\n');
  }

  // Get post type distribution
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📈 POST TYPE DISTRIBUTION (All Time):');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const distribution = await postLogger.getPostTypeDistribution();
  
  if (distribution && distribution.length > 0) {
    distribution.forEach(type => {
      const emoji = getEmojiForType(type.post_type);
      console.log(`${emoji} ${formatTypeName(type.post_type)}`);
      console.log(`   Count: ${type.count} (${type.percentage}%)`);
      console.log(`   Last Posted: ${new Date(type.last_posted).toLocaleString()}`);
      console.log('');
    });
  } else {
    console.log('   No distribution data yet.\n');
  }

  // Get recent paper trading posts
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 RECENT PAPER TRADING POSTS:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const recentPosts = await postLogger.getRecentPaperTradingPosts(10);
  
  if (recentPosts && recentPosts.length > 0) {
    recentPosts.forEach(post => {
      const exchangeEmoji = post.exchange === 'bybit' ? '🟣' : post.exchange === 'binance' ? '🟡' : '⚖️';
      const exchangeName = post.exchange ? post.exchange.toUpperCase() : 'UNKNOWN';
      console.log(`${exchangeEmoji} Post #${post.post_number} - ${exchangeName}`);
      console.log(`   Posted: ${new Date(post.posted_at).toLocaleString()}`);
      console.log(`   Preview: ${post.content_preview}...`);
      console.log('');
    });
  } else {
    console.log('   No paper trading posts found yet.\n');
    console.log('   💡 This might mean:');
    console.log('   1. Post logging just started (posts made before tracking won\'t show)');
    console.log('   2. No paper trading posts made yet since tracking started');
    console.log('   3. Check if DATABASE_URL is set on Twitter bot service\n');
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n✅ Report Complete!\n');
}

function getEmojiForType(type) {
  const emojiMap = {
    'paper_trading_report': '📊',
    'educational_content': '📚',
    'risk_management_tip': '💡',
    'market_psychology_insight': '🧠',
    'scam_awareness': '🚫',
    'real_data_report': '📈',
    'real_sentiment_meter': '😊',
    'market_psychology_insight': '🧠',
    'personalized_lesson': '🎓'
  };
  return emojiMap[type] || '📝';
}

function formatTypeName(type) {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// Run report
generateReport().catch(error => {
  console.error('\n❌ Error generating report:', error.message);
  process.exit(1);
});
