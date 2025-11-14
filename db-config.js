// Database configuration for PostgreSQL
// Used by both paper trading bots and Twitter bot

import pg from 'pg';
const { Client, Pool } = pg;

/**
 * Create a database client connection
 * @returns {Client} PostgreSQL client
 */
export function createClient() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false
  });
  
  return client;
}

/**
 * Create a database connection pool (better for multiple queries)
 * @returns {Pool} PostgreSQL connection pool
 */
export function createPool() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' 
      ? { rejectUnauthorized: false } 
      : false,
    max: 10, // Maximum connections in pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
  
  return pool;
}

/**
 * Test database connection
 * @returns {Promise<boolean>}
 */
export async function testConnection() {
  const client = createClient();
  
  try {
    await client.connect();
    const result = await client.query('SELECT NOW()');
    await client.end();
    
    console.log('✅ Database connection successful');
    console.log('   Server time:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Execute the migration SQL
 * Run this once to set up the database
 * @returns {Promise<boolean>}
 */
export async function runMigration() {
  const client = createClient();
  
  try {
    await client.connect();
    
    console.log('🔄 Running database migration...');
    
    // Create table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trading_stats (
        exchange VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Create index
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_trading_stats_updated_at 
      ON trading_stats(updated_at DESC)
    `);
    
    // Create function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);
    
    // Drop and recreate trigger
    await client.query(`
      DROP TRIGGER IF EXISTS update_trading_stats_updated_at ON trading_stats
    `);
    
    await client.query(`
      CREATE TRIGGER update_trading_stats_updated_at
        BEFORE UPDATE ON trading_stats
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()
    `);
    
    console.log('✅ Database migration completed successfully');
    
    await client.end();
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await client.end();
    return false;
  }
}

export default {
  createClient,
  createPool,
  testConnection,
  runMigration
};
