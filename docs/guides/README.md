# 📖 Guides & Reference Documentation

Educational content and in-depth explanations for DragonTrade Agent.

---

## 📚 Available Guides

### 1. [Paper Bot Safety](./PAPER_BOT_SAFETY.md)
**Understanding paper trading and safety measures**

**Topics Covered:**
- What is paper trading?
- How is it different from real trading?
- Safety mechanisms in the bot
- Zero risk guarantee
- When to transition to real money

**Use when**: You want to understand the safety of paper trading

---

### 2. [Tech Portfolio](./TECH_PORTFOLIO.md)
**Complete technical architecture and skills showcase**

**Topics Covered:**
- Full technology stack
- System architecture
- AI/ML integration
- API integrations
- Code examples
- Performance metrics
- Skills demonstrated

**Use when**: You want to understand the technical implementation

---

## 🎯 Learning Paths

### For Non-Technical Users

**Start here:**
1. [Paper Bot Safety](./PAPER_BOT_SAFETY.md) - Understand what paper trading is
2. Then: [../deployment/RAILWAY_QUICK_START.md](../deployment/RAILWAY_QUICK_START.md) - Deploy the bot
3. Monitor: Check logs and wait for results

**Key Takeaway**: Paper trading is 100% safe - no real money at risk

---

### For Technical Users

**Start here:**
1. [Tech Portfolio](./TECH_PORTFOLIO.md) - Understand the architecture
2. Review: Source code in main branch
3. Explore: Individual modules and integrations

**Key Takeaway**: Modern AI agent architecture with real-time data

---

### For Developers

**Start here:**
1. [Tech Portfolio](./TECH_PORTFOLIO.md) - Full tech stack
2. Study: `index.js` - Main bot logic
3. Study: `production-paper-bot.js` - Trading logic
4. Study: `educational-bot-integration.js` - Stats reporting

**Key Takeaway**: Clean separation of concerns, extensible design

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DragonTrade Agent                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🤖 AI Layer (Eliza OS)                                    │
│  ├─ Character.json - Personality & behavior                │
│  ├─ Anthropic Claude - Language model                      │
│  └─ Twitter Plugin - Social media integration              │
│                                                             │
│  📊 Data Layer                                             │
│  ├─ CoinGecko API - Real-time crypto prices               │
│  ├─ CoinMarketCap - Market data                           │
│  ├─ MCP Protocol - Educational content                     │
│  └─ CCXT - Exchange integration                            │
│                                                             │
│  💹 Trading Layer                                          │
│  ├─ Technical Analysis (MA, RSI)                          │
│  ├─ Risk Management (SL, TP)                              │
│  ├─ Paper Trading Execution                                │
│  └─ Performance Tracking                                    │
│                                                             │
│  📱 Output Layer                                           │
│  ├─ Twitter Posts (Educational + Trading)                  │
│  ├─ Real-time Updates                                      │
│  └─ Performance Reports                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎓 Educational Content

### Trading Strategy Explained

**The bot uses:**
- **Moving Average Crossover** (7/25 periods)
- **RSI Confirmation** (14 periods)
- **Risk Management** (2% stop loss, 6% take profit)

**Why this strategy?**
- Simple and proven
- Works in trending markets
- Easy to understand and verify
- Strict risk controls

**Performance expectations:**
- 40-60% win rate is normal
- Profit factor > 1.5 is good
- 20%+ annual return is excellent (if sustained)

**Read more**: [Paper Bot Safety](./PAPER_BOT_SAFETY.md)

---

### Technology Choices Explained

**Why Eliza OS?**
- Built for AI agents
- Twitter integration included
- Active community
- Extensible architecture

**Why Railway?**
- Simple deployment
- Good free tier
- Reliable infrastructure
- Easy scaling

**Why CCXT?**
- Supports 100+ exchanges
- Unified API
- Well-maintained
- Paper trading support

**Read more**: [Tech Portfolio](./TECH_PORTFOLIO.md)

---

## 📊 Key Concepts

### Paper Trading
**Definition**: Simulated trading with fake money but real market data

**Benefits:**
- Zero financial risk
- Test strategies safely
- Learn emotional control
- Prove profitability before real money

**Limitations:**
- No real market impact
- No emotional pressure (can't replicate fear/greed)
- No slippage or liquidity issues

---

### Risk Management
**Definition**: Rules that prevent catastrophic losses

**The bot uses:**
- **Stop Loss**: Exit if price drops 2%
- **Take Profit**: Exit if price rises 6%
- **Position Sizing**: Only use 30% of capital per trade
- **Daily Loss Limit**: Stop trading if lose 5% in one day

**Why this matters:**
- One bad trade can't destroy the account
- Losses are controlled and predictable
- Profitable system needs proper risk management

---

### Technical Indicators

**Moving Average (MA)**
- Average price over N periods
- Smooths out noise
- Shows trend direction

**Relative Strength Index (RSI)**
- Momentum indicator (0-100)
- >70 = overbought
- <30 = oversold

**Crossover Strategy**
- Short MA crosses above long MA = Buy signal
- Short MA crosses below long MA = Sell signal
- RSI confirms the signal

---

## 🔬 Behind the Scenes

### How the Bot Makes Decisions

1. **Data Collection**: Fetch price data every 5 minutes
2. **Analysis**: Calculate MA and RSI indicators
3. **Signal Detection**: Check for crossover patterns
4. **Risk Check**: Verify risk management rules
5. **Execution**: Open/close position if signal valid
6. **Reporting**: Save stats and post to Twitter

### How the Bot Posts to Twitter

1. **Trigger**: Timer (every 3-10 minutes) or new trade
2. **Content Generation**: AI creates educational post
3. **Rate Limit Check**: Ensure not posting too fast
4. **Quality Check**: Verify content meets standards
5. **Post**: Send to Twitter API
6. **Logging**: Record success/failure

### How the Bot Stays Safe

1. **Read-Only API Keys**: Cannot withdraw or trade
2. **Paper Money**: All trades are simulated
3. **Risk Limits**: Hard-coded safety rules
4. **No Human Interaction**: Fully automated
5. **Transparent**: All trades logged and posted

---

## 💡 Best Practices

### For Users:
- Let the bot run for at least 1 month before judging
- Don't panic if it loses trades (normal!)
- Read the stats to understand performance
- Never give the bot real trading permissions

### For Developers:
- Always test locally before deploying
- Use environment variables for secrets
- Log everything for debugging
- Separate concerns (web vs worker processes)
- Handle errors gracefully

### For Deployment:
- Use Railway's free tier first
- Monitor logs daily (first week)
- Set up alerts for crashes
- Keep backups of stats files

---

## 📚 Additional Resources

### External Links:
- **Eliza OS**: https://github.com/elizaos/eliza
- **CCXT**: https://github.com/ccxt/ccxt
- **Railway**: https://railway.app/
- **Twitter API**: https://developer.twitter.com/

### Internal Links:
- **Deployment**: [../deployment/README.md](../deployment/README.md)
- **Troubleshooting**: [../troubleshooting/README.md](../troubleshooting/README.md)
- **Source Code**: (main branch)

---

## 🤝 Contributing to Guides

Want to improve documentation?

1. Fork the repository
2. Create a new guide in appropriate folder
3. Update this README
4. Submit pull request

**Guidelines:**
- Clear, concise writing
- Code examples when relevant
- Screenshots/diagrams if helpful
- Tested procedures only

---

**Last Updated**: October 26, 2025
