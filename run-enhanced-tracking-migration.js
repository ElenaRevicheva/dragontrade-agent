#!/usr/bin/env node
// Run the enhanced post tracking migration
// Usage: node run-enhanced-tracking-migration.js

import { createClient } from './db-config.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const client = createClient();
  
  try {
    console.log('🚀 Starting enhanced post tracking migration...\n');
    
    await client.connect();
    console.log('✅ Connected to database');
    
    // Read the migration SQL
    const migrationPath = join(__dirname, 'migrations', '003_enhance_post_tracking.sql');
    const sql = readFileSync(migrationPath, 'utf8');
    
    console.log('📝 Executing migration SQL...');
    
    // Execute the migration
    await client.query(sql);
    
    console.log('✅ Migration executed successfully!\n');
    
    // Verify new columns
    console.log('🔍 Verifying new columns...');
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'post_log' 
      AND column_name IN ('cycle_position', 'is_thread', 'thread_length', 'thread_tweet_ids')
      ORDER BY column_name
    `);
    
    console.log('✅ New columns added:');
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
    
    // Verify new views
    console.log('\n🔍 Verifying new views...');
    const views = await client.query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public'
      AND table_name IN ('cycle_progress', 'content_balance', 'thread_analytics')
      ORDER BY table_name
    `);
    
    console.log('✅ New views created:');
    views.rows.forEach(view => {
      console.log(`   - ${view.table_name}`);
    });
    
    // Show current content balance
    console.log('\n📊 Current content balance:');
    const balance = await client.query('SELECT * FROM content_balance');
    if (balance.rows.length > 0) {
      const b = balance.rows[0];
      console.log(`   Total posts: ${b.total_posts}`);
      console.log(`   Paper Trading: ${b.paper_trading_count} (${b.paper_trading_percent}%) - Target: ${b.target_paper_trading}%`);
      console.log(`   AIdeazz: ${b.aideazz_count} (${b.aideazz_percent}%) - Target: ${b.target_aideazz}%`);
      console.log(`   Educational: ${b.educational_count} (${b.educational_percent}%) - Target: ${b.target_educational}%`);
    }
    
    // Show thread analytics
    console.log('\n🧵 Thread analytics:');
    const threads = await client.query('SELECT * FROM thread_analytics');
    if (threads.rows.length > 0) {
      const t = threads.rows[0];
      console.log(`   Total threads: ${t.total_threads || 0}`);
      console.log(`   Single tweets: ${t.single_tweets || 0}`);
      console.log(`   Avg thread length: ${t.avg_thread_length ? t.avg_thread_length.toFixed(1) : 'N/A'} tweets`);
      console.log(`   Thread percentage: ${t.thread_percentage || 0}%`);
    }
    
    console.log('\n✨ Migration complete! Dashboard can now track:');
    console.log('   ✅ 20-post cycle position');
    console.log('   ✅ AIdeazz marketing posts (30% target)');
    console.log('   ✅ Correct 30/30/40 balance');
    console.log('   ✅ Twitter threads metrics');
    console.log('   ✅ Enhanced analytics\n');
    
    await client.end();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\nStack trace:', error.stack);
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    process.exit(1);
  }
}

runMigration();
