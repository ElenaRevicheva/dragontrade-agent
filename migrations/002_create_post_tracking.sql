-- Migration: Create post_log table for tracking all posted content
-- Created: 2025-11-16
-- Purpose: Track every post made, categorize them, enable reporting

-- Create post_log table
CREATE TABLE IF NOT EXISTS post_log (
    id SERIAL PRIMARY KEY,
    post_number INTEGER NOT NULL,
    post_type VARCHAR(100) NOT NULL,
    exchange VARCHAR(50),  -- 'bybit', 'binance', 'both', or NULL for non-trading posts
    content_preview TEXT,  -- First 100 chars of post
    full_content TEXT,     -- Complete post text
    posted_at TIMESTAMP DEFAULT NOW(),
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    metadata JSONB  -- Additional data (sentiment, tags, etc.)
);

-- Create indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_post_log_posted_at ON post_log(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_log_post_type ON post_log(post_type);
CREATE INDEX IF NOT EXISTS idx_post_log_exchange ON post_log(exchange);
CREATE INDEX IF NOT EXISTS idx_post_log_post_number ON post_log(post_number);

-- Create view for daily statistics
CREATE OR REPLACE VIEW daily_post_stats AS
SELECT 
    DATE(posted_at) as post_date,
    COUNT(*) as total_posts,
    COUNT(CASE WHEN post_type = 'paper_trading_report' THEN 1 END) as paper_trading_posts,
    COUNT(CASE WHEN post_type = 'educational_content' THEN 1 END) as educational_posts,
    COUNT(CASE WHEN post_type = 'risk_management_tip' THEN 1 END) as risk_management_posts,
    COUNT(CASE WHEN post_type = 'market_psychology_insight' THEN 1 END) as psychology_posts,
    COUNT(CASE WHEN post_type = 'scam_awareness' THEN 1 END) as scam_awareness_posts,
    COUNT(CASE WHEN exchange = 'bybit' THEN 1 END) as bybit_posts,
    COUNT(CASE WHEN exchange = 'binance' THEN 1 END) as binance_posts,
    COUNT(CASE WHEN exchange = 'both' THEN 1 END) as comparison_posts
FROM post_log
WHERE success = TRUE
GROUP BY DATE(posted_at)
ORDER BY post_date DESC;

-- Create view for post type distribution
CREATE OR REPLACE VIEW post_type_distribution AS
SELECT 
    post_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM post_log WHERE success = TRUE), 2) as percentage,
    MAX(posted_at) as last_posted
FROM post_log
WHERE success = TRUE
GROUP BY post_type
ORDER BY count DESC;

-- Comments
COMMENT ON TABLE post_log IS 'Tracks every post made by the Twitter bot';
COMMENT ON COLUMN post_log.post_type IS 'Type of post (paper_trading_report, educational_content, etc.)';
COMMENT ON COLUMN post_log.exchange IS 'For paper trading posts: bybit, binance, both, or NULL';
COMMENT ON COLUMN post_log.content_preview IS 'First 100 characters for quick reference';
COMMENT ON COLUMN post_log.posted_at IS 'When the post was made';
