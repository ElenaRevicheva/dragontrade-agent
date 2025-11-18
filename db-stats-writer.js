// Database stats writer for paper trading bots
// Import this in production-paper-bot-professional.js

import { createClient } from './db-config.js';

/**
 * Write trading stats to PostgreSQL database
 * Used by paper trading bots (Bybit, Binance)
 * 
 * @param {string} exchange - Exchange name (bybit, binance)
 * @param {object} statsData - Complete stats object
 * @returns {Promise<boolean>}
 */
export async function writeStatsToDatabase(exchange, statsData) {
  // If DATABASE_URL not configured, skip database write
  if (!process.env.DATABASE_URL) {
    console.log('⚠️  DATABASE_URL not set, skipping database write');
    return false;
  }
  
  const client = createClient();
  
  try {
    await client.connect();
    
    // Upsert stats (insert or update if exists)
    await client.query(`
      INSERT INTO trading_stats (exchange, data, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      ON CONFLICT (exchange) 
      DO UPDATE SET 
        data = $2,
        updated_at = NOW()
    `, [exchange, JSON.stringify(statsData)]);
    
    await client.end();
    
    console.log(`✅ [DB] Stats exported to database (${exchange})`);
    return true;
    
  } catch (error) {
    console.error(`❌ [DB] Failed to write stats for ${exchange}:`, error.message);
    
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    
    return false;
  }
}

/**
 * Read trading stats from database (for testing)
 * @param {string} exchange - Exchange name
 * @returns {Promise<object|null>}
 */
export async function readStatsFromDatabase(exchange) {
  if (!process.env.DATABASE_URL) {
    return null;
  }
  
  const client = createClient();
  
  try {
    await client.connect();
    
    const result = await client.query(
      'SELECT data FROM trading_stats WHERE exchange = $1',
      [exchange]
    );
    
    await client.end();
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0].data;
    
  } catch (error) {
    console.error(`❌ [DB] Failed to read stats for ${exchange}:`, error.message);
    
    try {
      await client.end();
    } catch (e) {
      // Ignore cleanup errors
    }
    
    return null;
  }
}

export default {
  writeStatsToDatabase,
  readStatsFromDatabase
};
