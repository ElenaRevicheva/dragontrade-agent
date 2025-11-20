-- Migration: Enhanced post tracking with cycle position, thread metrics, and AIdeazz category
-- Created: 2025-11-20
-- Purpose: Track 20-post cycle position, Twitter threads, and properly categorize AIdeazz marketing posts

-- Add new columns to post_log table
ALTER TABLE post_log 
ADD COLUMN IF NOT EXISTS cycle_position INTEGER,  -- Position in 20-post cycle (1-20)
ADD COLUMN IF NOT EXISTS is_thread BOOLEAN DEFAULT FALSE,  -- Is this a threaded post?
ADD COLUMN IF NOT EXISTS thread_length INTEGER,  -- Number of tweets in thread
ADD COLUMN IF NOT EXISTS thread_tweet_ids TEXT[];  -- Array of all tweet IDs in thread

-- Add indexes for new columns
CREATE INDEX IF NOT EXISTS idx_post_log_cycle_position ON post_log(cycle_position);
CREATE INDEX IF NOT EXISTS idx_post_log_is_thread ON post_log(is_thread);

-- Update the daily_post_stats view to include AIdeazz marketing
DROP VIEW IF EXISTS daily_post_stats CASCADE;
CREATE OR REPLACE VIEW daily_post_stats AS
SELECT 
    DATE(posted_at) as post_date,
    COUNT(*) as total_posts,
    -- Paper Trading (should be 30% of cycle)
    COUNT(CASE WHEN post_type = 'paper_trading_report' THEN 1 END) as paper_trading_posts,
    COUNT(CASE WHEN post_type = 'paper_trading_report' AND exchange = 'bybit' THEN 1 END) as bybit_posts,
    COUNT(CASE WHEN post_type = 'paper_trading_report' AND exchange = 'binance' THEN 1 END) as binance_posts,
    COUNT(CASE WHEN post_type = 'paper_trading_report' AND exchange = 'both' THEN 1 END) as comparison_posts,
    -- AIdeazz Marketing (should be 30% of cycle) - NEW!
    COUNT(CASE WHEN post_type = 'aideazz_marketing' THEN 1 END) as aideazz_posts,
    -- Educational (should be 40% of cycle)
    COUNT(CASE WHEN post_type IN ('educational_content', 'risk_management_tip', 'market_psychology_insight', 'scam_awareness', 'personalized_lesson') THEN 1 END) as educational_posts,
    -- Thread metrics
    COUNT(CASE WHEN is_thread = TRUE THEN 1 END) as threaded_posts,
    AVG(CASE WHEN is_thread = TRUE THEN thread_length END) as avg_thread_length
FROM post_log
WHERE success = TRUE
GROUP BY DATE(posted_at)
ORDER BY post_date DESC;

-- Update post_type_distribution view to include AIdeazz
DROP VIEW IF EXISTS post_type_distribution CASCADE;
CREATE OR REPLACE VIEW post_type_distribution AS
SELECT 
    post_type,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM post_log WHERE success = TRUE), 2) as percentage,
    MAX(posted_at) as last_posted,
    COUNT(CASE WHEN is_thread = TRUE THEN 1 END) as thread_count
FROM post_log
WHERE success = TRUE
GROUP BY post_type
ORDER BY count DESC;

-- Create new view for 20-post cycle tracking
CREATE OR REPLACE VIEW cycle_progress AS
SELECT 
    cycle_position,
    post_type,
    COUNT(*) as times_posted,
    MAX(posted_at) as last_posted_at,
    -- Calculate what's expected vs actual
    CASE cycle_position
        WHEN 3 THEN 'paper_trading (bybit)'
        WHEN 7 THEN 'paper_trading (binance)'
        WHEN 11 THEN 'paper_trading (both)'
        WHEN 15 THEN 'paper_trading (bybit)'
        WHEN 18 THEN 'paper_trading (binance)'
        WHEN 20 THEN 'paper_trading (both)'
        WHEN 2 THEN 'aideazz_marketing'
        WHEN 5 THEN 'aideazz_marketing'
        WHEN 9 THEN 'aideazz_marketing'
        WHEN 13 THEN 'aideazz_marketing'
        WHEN 16 THEN 'aideazz_marketing'
        WHEN 19 THEN 'aideazz_marketing'
        ELSE 'educational_content'
    END as expected_type
FROM post_log
WHERE cycle_position IS NOT NULL AND success = TRUE
GROUP BY cycle_position, post_type
ORDER BY cycle_position, times_posted DESC;

-- Create view for content balance (target: 30% trading / 30% AIdeazz / 40% education)
CREATE OR REPLACE VIEW content_balance AS
SELECT 
    COUNT(*) as total_posts,
    COUNT(CASE WHEN post_type = 'paper_trading_report' THEN 1 END) as paper_trading_count,
    COUNT(CASE WHEN post_type = 'aideazz_marketing' THEN 1 END) as aideazz_count,
    COUNT(CASE WHEN post_type IN ('educational_content', 'risk_management_tip', 'market_psychology_insight', 'scam_awareness', 'personalized_lesson') THEN 1 END) as educational_count,
    ROUND(COUNT(CASE WHEN post_type = 'paper_trading_report' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1) as paper_trading_percent,
    ROUND(COUNT(CASE WHEN post_type = 'aideazz_marketing' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1) as aideazz_percent,
    ROUND(COUNT(CASE WHEN post_type IN ('educational_content', 'risk_management_tip', 'market_psychology_insight', 'scam_awareness', 'personalized_lesson') THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1) as educational_percent,
    -- Target percentages
    30.0 as target_paper_trading,
    30.0 as target_aideazz,
    40.0 as target_educational
FROM post_log
WHERE success = TRUE;

-- Create view for thread analytics
CREATE OR REPLACE VIEW thread_analytics AS
SELECT 
    COUNT(CASE WHEN is_thread = TRUE THEN 1 END) as total_threads,
    COUNT(CASE WHEN is_thread = FALSE THEN 1 END) as single_tweets,
    AVG(CASE WHEN is_thread = TRUE THEN thread_length END) as avg_thread_length,
    MAX(CASE WHEN is_thread = TRUE THEN thread_length END) as max_thread_length,
    MIN(CASE WHEN is_thread = TRUE THEN thread_length END) as min_thread_length,
    ROUND(COUNT(CASE WHEN is_thread = TRUE THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1) as thread_percentage
FROM post_log
WHERE success = TRUE;

-- Comments for new columns
COMMENT ON COLUMN post_log.cycle_position IS 'Position in 20-post content cycle (1-20)';
COMMENT ON COLUMN post_log.is_thread IS 'Whether this post was split into a Twitter thread';
COMMENT ON COLUMN post_log.thread_length IS 'Number of tweets in the thread (NULL if single tweet)';
COMMENT ON COLUMN post_log.thread_tweet_ids IS 'Array of all tweet IDs if this is a thread';

-- Comments for new views
COMMENT ON VIEW cycle_progress IS 'Tracks progress through the 20-post content cycle';
COMMENT ON VIEW content_balance IS 'Shows actual vs target content balance (30/30/40)';
COMMENT ON VIEW thread_analytics IS 'Analytics on Twitter thread usage';
