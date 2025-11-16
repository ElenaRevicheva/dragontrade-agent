// Helper methods for post tracking
// Determines post type and exchange from cycle position

export function getPostTypeFromCyclePosition(cyclePosition) {
  const typeMap = {
    1: 'educational_content',
    2: 'real_data_report',
    3: 'paper_trading_report',
    4: 'risk_management_tip',
    5: 'market_psychology_insight',
    6: 'paper_trading_report',
    7: 'scam_awareness',
    8: 'real_sentiment_meter',
    9: 'paper_trading_report',
    0: 'personalized_lesson'
  };
  
  return typeMap[cyclePosition] || 'unknown';
}

export function getExchangeFromContent(content, cyclePosition) {
  // Only for paper trading posts (3, 6, 9)
  if (![3, 6, 9].includes(cyclePosition % 10)) {
    return null;
  }
  
  // Check content for exchange mentions
  const contentLower = content.toLowerCase();
  
  // Post 3 = Bybit
  if (cyclePosition % 10 === 3) {
    return 'bybit';
  }
  
  // Post 6 = Binance  
  if (cyclePosition % 10 === 6) {
    return 'binance';
  }
  
  // Post 9 = Comparison (both)
  if (cyclePosition % 10 === 9) {
    return 'both';
  }
  
  // Fallback: detect from content
  const hasBybit = contentLower.includes('bybit');
  const hasBinance = contentLower.includes('binance');
  
  if (hasBybit && hasBinance) return 'both';
  if (hasBybit) return 'bybit';
  if (hasBinance) return 'binance';
  
  return null;
}
