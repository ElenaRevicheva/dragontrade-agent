-- Migration: Create trading_stats table for multi-service communication
-- Created: 2025-11-14
-- Purpose: Enable Bybit/Binance paper trading bots to share stats with Twitter bot

-- Create trading_stats table
CREATE TABLE IF NOT EXISTS trading_stats (
    exchange VARCHAR(50) PRIMARY KEY,
    data JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_trading_stats_updated_at ON trading_stats(updated_at DESC);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_trading_stats_updated_at ON trading_stats;
CREATE TRIGGER update_trading_stats_updated_at
    BEFORE UPDATE ON trading_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE trading_stats IS 'Stores paper trading statistics for cross-service access';
COMMENT ON COLUMN trading_stats.exchange IS 'Exchange name (bybit, binance, etc.)';
COMMENT ON COLUMN trading_stats.data IS 'Complete stats JSON including trades, performance, risk control';
COMMENT ON COLUMN trading_stats.created_at IS 'When this exchange stats were first created';
COMMENT ON COLUMN trading_stats.updated_at IS 'Last time stats were updated (auto-updated by trigger)';
