// Post Logger - Track every post made by the Twitter bot
// Logs to PostgreSQL for reporting and analysis

import { createClient } from './db-config.js';

class PostLogger {
  /**
   * Log a successful post
   * @param {number} postNumber - Current post counter
   * @param {string} postType - Type of post (paper_trading_report, educational_content, etc.)
   * @param {string} content - Full post content
   * @param {string|null} exchange - For paper trading: 'bybit', 'binance', 'both', or null
   * @param {object} metadata - Additional data
   */
  async logPost(postNumber, postType, content, exchange = null, metadata = {}) {
    if (!process.env.DATABASE_URL) {
      console.log('⚠️ [POST LOG] DATABASE_URL not set, skipping post logging');
      return;
    }

    const client = createClient();
    
    try {
      await client.connect();
      
      const contentPreview = content.substring(0, 100);
      
      await client.query(`
        INSERT INTO post_log (
          post_number, 
          post_type, 
          exchange, 
          content_preview, 
          full_content, 
          posted_at, 
          success, 
          metadata
        ) VALUES ($1, $2, $3, $4, $5, NOW(), TRUE, $6)
      `, [
        postNumber,
        postType,
        exchange,
        contentPreview,
        content,
        JSON.stringify(metadata)
      ]);
      
      await client.end();
      
      console.log(`✅ [POST LOG] Logged post #${postNumber} (${postType}${exchange ? ` - ${exchange}` : ''})`);
    } catch (error) {
      console.error(`❌ [POST LOG] Failed to log post:`, error.message);
      try {
        await client.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Log a failed post attempt
   */
  async logFailedPost(postNumber, postType, errorMessage) {
    if (!process.env.DATABASE_URL) {
      return;
    }

    const client = createClient();
    
    try {
      await client.connect();
      
      await client.query(`
        INSERT INTO post_log (
          post_number, 
          post_type, 
          posted_at, 
          success, 
          error_message
        ) VALUES ($1, $2, NOW(), FALSE, $3)
      `, [postNumber, postType, errorMessage]);
      
      await client.end();
      
      console.log(`⚠️ [POST LOG] Logged failed post #${postNumber}`);
    } catch (error) {
      console.error(`❌ [POST LOG] Failed to log error:`, error.message);
      try {
        await client.end();
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Get daily statistics
   */
  async getDailyStats(days = 7) {
    if (!process.env.DATABASE_URL) {
      return null;
    }

    const client = createClient();
    
    try {
      await client.connect();
      
      const result = await client.query(`
        SELECT * FROM daily_post_stats
        ORDER BY post_date DESC
        LIMIT $1
      `, [days]);
      
      await client.end();
      
      return result.rows;
    } catch (error) {
      console.error(`❌ [POST LOG] Failed to get stats:`, error.message);
      try {
        await client.end();
      } catch (e) {
        // Ignore cleanup errors
      }
      return null;
    }
  }

  /**
   * Get post type distribution
   */
  async getPostTypeDistribution() {
    if (!process.env.DATABASE_URL) {
      return null;
    }

    const client = createClient();
    
    try {
      await client.connect();
      
      const result = await client.query(`
        SELECT * FROM post_type_distribution
      `);
      
      await client.end();
      
      return result.rows;
    } catch (error) {
      console.error(`❌ [POST LOG] Failed to get distribution:`, error.message);
      try {
        await client.end();
      } catch (e) {
        // Ignore cleanup errors
      }
      return null;
    }
  }

  /**
   * Get recent paper trading posts
   */
  async getRecentPaperTradingPosts(limit = 10) {
    if (!process.env.DATABASE_URL) {
      return null;
    }

    const client = createClient();
    
    try {
      await client.connect();
      
      const result = await client.query(`
        SELECT 
          post_number,
          exchange,
          content_preview,
          posted_at
        FROM post_log
        WHERE post_type = 'paper_trading_report' AND success = TRUE
        ORDER BY posted_at DESC
        LIMIT $1
      `, [limit]);
      
      await client.end();
      
      return result.rows;
    } catch (error) {
      console.error(`❌ [POST LOG] Failed to get paper trading posts:`, error.message);
      try {
        await client.end();
      } catch (e) {
        // Ignore cleanup errors
      }
      return null;
    }
  }
}

export default new PostLogger();
