// 🔧 Run Post Tracking Migration
// Creates the post_log table and views for the dashboard

import { createClient } from './db-config.js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function runPostTrackingMigration() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set!');
    process.exit(1);
  }

  const client = createClient();
  
  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');
    
    console.log('🔄 Running post tracking migration...');
    const migrationSQL = fs.readFileSync('./migrations/002_create_post_tracking.sql', 'utf8');
    
    await client.query(migrationSQL);
    
    console.log('✅ Post tracking migration completed successfully!\n');
    console.log('📊 Created:');
    console.log('   - post_log table');
    console.log('   - daily_post_stats view');
    console.log('   - post_type_distribution view\n');
    console.log('🎉 Dashboard is now ready to use!');
    console.log('🌐 Visit: https://glistening-light-production-4885.up.railway.app\n');
    
    await client.end();
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n✅ Table already exists - migration was already run!');
      console.log('🌐 Dashboard should work now: https://glistening-light-production-4885.up.railway.app\n');
      await client.end();
      process.exit(0);
    }
    
    await client.end();
    process.exit(1);
  }
}

runPostTrackingMigration();
