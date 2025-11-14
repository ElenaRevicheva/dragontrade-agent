// 🧪 Database Setup and Testing Script
// Run this to verify PostgreSQL integration

import { testConnection, runMigration } from './db-config.js';
import { writeStatsToDatabase, readStatsFromDatabase } from './db-stats-writer.js';

console.log('\n🧪 TESTING DATABASE SETUP\n');

async function runTests() {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable not set!');
    console.log('\n📋 Setup Instructions:');
    console.log('1. Railway Dashboard → Add PostgreSQL database');
    console.log('2. DATABASE_URL will be set automatically');
    console.log('3. Run this script again\n');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL is set\n');
  
  // Test 1: Connection
  console.log('1️⃣  Testing database connection...');
  const connected = await testConnection();
  
  if (!connected) {
    console.error('\n❌ Cannot connect to database. Check your DATABASE_URL.\n');
    process.exit(1);
  }
  
  console.log('');
  
  // Test 2: Migration
  console.log('2️⃣  Running database migration...');
  const migrated = await runMigration();
  
  if (!migrated) {
    console.error('\n❌ Migration failed. Check the error above.\n');
    process.exit(1);
  }
  
  console.log('');
  
  // Test 3: Write operation
  console.log('3️⃣  Testing write operation...');
  
  const testStats = {
    exchange: 'test-exchange',
    timestamp: new Date().toISOString(),
    balance: 10000,
    totalPnL: 250,
    totalPnLPercent: 2.5,
    totalTrades: 5,
    wins: 3,
    losses: 2,
    winRate: 60,
    profitFactor: 1.5,
    bestTrade: 150,
    worstTrade: -80,
    recentTrades: [],
    currentPosition: null,
    riskControl: {},
    strategyMode: 'PROFESSIONAL'
  };
  
  const writeSuccess = await writeStatsToDatabase('test-exchange', testStats);
  
  if (!writeSuccess) {
    console.error('❌ Failed to write to database\n');
    process.exit(1);
  }
  
  console.log('✅ Successfully wrote test stats to database\n');
  
  // Test 4: Read operation
  console.log('4️⃣  Testing read operation...');
  
  const readStats = await readStatsFromDatabase('test-exchange');
  
  if (!readStats) {
    console.error('❌ Failed to read from database\n');
    process.exit(1);
  }
  
  console.log('✅ Successfully read stats from database');
  console.log(`   Exchange: ${readStats.exchange}`);
  console.log(`   Total Trades: ${readStats.totalTrades}`);
  console.log(`   Win Rate: ${readStats.winRate}%\n`);
  
  // Test 5: Data integrity
  console.log('5️⃣  Verifying data integrity...');
  
  if (
    readStats.exchange === testStats.exchange &&
    readStats.totalTrades === testStats.totalTrades &&
    readStats.winRate === testStats.winRate
  ) {
    console.log('✅ Data integrity verified\n');
  } else {
    console.error('❌ Data mismatch detected\n');
    console.log('Written:', testStats);
    console.log('Read:', readStats);
    process.exit(1);
  }
  
  // Success!
  console.log('🎉 ALL TESTS PASSED!\n');
  console.log('📊 Your database is ready for multi-service stats sharing.\n');
  console.log('Next steps:');
  console.log('1. Deploy your code to Railway');
  console.log('2. Watch paper bot logs for: "✅ Stats exported (DB + JSON files)"');
  console.log('3. Watch Twitter bot logs for: "✅ [DB] Loaded stats from database"');
  console.log('4. Wait for automatic trading posts to appear!\n');
}

// Run tests
runTests().catch(error => {
  console.error('\n💥 Test failed with error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
