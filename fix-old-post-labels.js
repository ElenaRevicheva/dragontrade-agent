#!/usr/bin/env node
// Fix old post labels to match new naming convention
// Runs SQL updates to correct historical data

import { createClient } from './db-config.js';

async function fixOldLabels() {
  const client = createClient();
  
  try {
    console.log('🔧 Starting post label cleanup...\n');
    
    await client.connect();
    console.log('✅ Connected to database');
    
    // Fix 1: Rename "paper_trading" to "paper_trading_report"
    console.log('\n📊 Fixing paper trading posts...');
    const pt = await client.query(`
      UPDATE post_log 
      SET post_type = 'paper_trading_report'
      WHERE post_type = 'paper_trading'
      RETURNING id, post_number
    `);
    console.log(`   ✅ Fixed ${pt.rowCount} paper trading posts`);
    
    // Fix 2: Rename "aideazz" to "aideazz_marketing"
    console.log('\n🚀 Fixing AIdeazz posts...');
    const az = await client.query(`
      UPDATE post_log 
      SET post_type = 'aideazz_marketing'
      WHERE post_type = 'aideazz'
      RETURNING id, post_number
    `);
    console.log(`   ✅ Fixed ${az.rowCount} AIdeazz posts`);
    
    // Fix 3: Rename "educational" to "educational_content"
    console.log('\n📚 Fixing educational posts...');
    const edu = await client.query(`
      UPDATE post_log 
      SET post_type = 'educational_content'
      WHERE post_type = 'educational'
      RETURNING id, post_number
    `);
    console.log(`   ✅ Fixed ${edu.rowCount} educational posts`);
    
    // Show new balance
    console.log('\n📊 NEW CONTENT BALANCE:');
    const balance = await client.query('SELECT * FROM content_balance');
    if (balance.rows.length > 0) {
      const b = balance.rows[0];
      console.log(`   Total posts: ${b.total_posts}`);
      console.log(`   📊 Paper Trading: ${b.paper_trading_count} (${b.paper_trading_percent}%) - Target: 30%`);
      console.log(`   🚀 AIdeazz: ${b.aideazz_count} (${b.aideazz_percent}%) - Target: 30%`);
      console.log(`   📚 Educational: ${b.educational_count} (${b.educational_percent}%) - Target: 40%`);
      
      // Check if balanced
      const isBalanced = 
        Math.abs(b.paper_trading_percent - 30) <= 3 &&
        Math.abs(b.aideazz_percent - 30) <= 3 &&
        Math.abs(b.educational_percent - 40) <= 3;
      
      if (isBalanced) {
        console.log('\n   ✅ Perfect balance achieved!');
      } else {
        console.log('\n   ⚠️ Still working toward 30/30/40 balance');
      }
    }
    
    await client.end();
    
    console.log('\n✨ All old post labels fixed!');
    console.log('🔄 Refresh your dashboard to see updated stats!\n');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    console.error('\nStack trace:', error.stack);
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    process.exit(1);
  }
}

fixOldLabels();
