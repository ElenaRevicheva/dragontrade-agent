# 🐉 DragonTrade Agent

AI-powered crypto trading education and paper trading bot for Twitter.

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd dragontrade-agent

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run locally
node index.js
```

---

## 📚 Documentation

**All documentation has been moved to the [`docs/`](./docs/) branch for better organization.**

### Quick Links:

- 🚀 **[Deployment Guides](https://github.com/your-repo/tree/docs/docs/deployment)** - Railway setup, worker configuration
- 🔧 **[Troubleshooting](https://github.com/your-repo/tree/docs/docs/troubleshooting)** - Common issues and fixes
- 📖 **[Guides & Reference](https://github.com/your-repo/tree/docs/docs/guides)** - Technical deep dives

### To access documentation:

```bash
git checkout docs
cd docs/
```

Or view online: [docs branch](../../tree/docs/docs)

---

## 🎯 What This Bot Does

### Educational Twitter Bot
- Posts real-time crypto market analysis
- Shares trading psychology insights
- Teaches risk management
- Warns about scams and rug pulls

### Paper Trading System
- Executes trades with fake money
- Uses real market data (Bybit/Binance)
- Posts honest results (wins AND losses)
- Proves strategy before using real capital

### Technology
- **AI**: Anthropic Claude via Eliza OS
- **Data**: CoinGecko, CoinMarketCap, CCXT
- **Deployment**: Railway (web + worker processes)
- **Social**: Twitter API v2

---

## 📂 Project Structure

```
dragontrade-agent/
├── index.js                          # Main Twitter bot
├── production-paper-bot.js           # Paper trading worker
├── educational-bot-integration.js    # Stats reporter
├── character.json                    # AI personality config
├── package.json                      # Dependencies
├── Procfile                          # Railway deployment config
├── .env.example                      # Environment variables template
│
└── Supporting modules:
    ├── coingecko-*.js               # CoinGecko integrations
    ├── mcp-*.js                     # MCP protocol handlers
    ├── az-token-integration.js      # Token utility features
    └── test-*.js                    # Test scripts
```

**Note**: All `.md` documentation files have been moved to the `docs` branch.

---

## 🔧 Development

### Prerequisites
- Node.js 18+
- Twitter API credentials
- Anthropic API key
- CoinMarketCap API key (optional)
- Exchange API keys (optional, for paper trading)

### Environment Variables

See `.env.example` for the complete list. Key variables:

```bash
# Twitter (Required)
TWITTER_API_KEY=xxx
TWITTER_API_SECRET=xxx
TWITTER_ACCESS_TOKEN=xxx
TWITTER_ACCESS_TOKEN_SECRET=xxx

# AI (Required)
ANTHROPIC_API_KEY=xxx

# Market Data (Optional)
COINMARKETCAP_API_KEY=xxx

# Paper Trading (Optional)
EXCHANGE=bybit
BYBIT_API_KEY=xxx
BYBIT_SECRET=xxx
```

### Running Locally

**Twitter Bot Only:**
```bash
node index.js
```

**Paper Trading Bot Only:**
```bash
node production-paper-bot.js
```

**Both (in separate terminals):**
```bash
# Terminal 1
node index.js

# Terminal 2
node production-paper-bot.js
```

---

## 🚂 Deployment

Deploy to Railway in 3 steps:

1. **Connect repository** to Railway
2. **Add environment variables** (see docs)
3. **Enable worker process** for paper trading

**Detailed guide**: See [docs/deployment](../../tree/docs/docs/deployment)

---

## 📊 Features

### ✅ Educational Content
- Trading psychology lessons
- Risk management tips
- Market analysis
- Scam detection and warnings

### ✅ Paper Trading
- MA(7/25) + RSI(14) strategy
- 2% stop loss, 6% take profit
- Real Bybit/Binance data
- Honest performance reporting

### ✅ Real-Time Data
- CoinGecko API integration
- CoinMarketCap API integration
- Live price feeds
- Market sentiment analysis

### ✅ Safety First
- Read-only API keys
- Paper money only (zero risk)
- Transparent reporting
- No misleading promises

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

**For documentation contributions**: Work in the `docs` branch.

---

## 📄 License

[Your License Here]

---

## 🆘 Support

- **Issues**: Create a GitHub issue
- **Documentation**: Check the [docs branch](../../tree/docs/docs)
- **Troubleshooting**: See [troubleshooting guides](../../tree/docs/docs/troubleshooting)

---

## ⚠️ Disclaimer

This bot is for **educational purposes only**. Paper trading uses fake money. When transitioning to real money:

- Start with small amounts
- Understand the risks
- Never invest more than you can afford to lose
- Past performance does not guarantee future results

**The bot creator is not responsible for any financial losses.**

---

**Built with**: Eliza OS, CCXT, Twitter API v2, Anthropic Claude

**Status**: Active Development

**Last Updated**: October 26, 2025
