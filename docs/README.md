# 📚 DragonTrade Agent Documentation

Comprehensive documentation for the DragonTrade AI trading agent system.

---

## 📂 Documentation Structure

### 🚀 [Deployment](./deployment/)
Step-by-step guides for deploying the bot to production:
- **[Railway Deployment](./deployment/RAILWAY_DEPLOYMENT.md)** - Complete Railway setup guide
- **[Railway Quick Start](./deployment/RAILWAY_QUICK_START.md)** - Fast-track deployment
- **[Railway Worker Setup](./deployment/RAILWAY_WORKER_SETUP.md)** - Enable paper trading worker
- **[Railway Quick Commands](./deployment/RAILWAY_QUICK_COMMANDS.md)** - CLI shortcuts and alternatives
- **[Deployment Guide](./deployment/DEPLOYMENT_GUIDE.md)** - General deployment overview

### 🔧 [Troubleshooting](./troubleshooting/)
Common issues and their solutions:
- **[Paper Trading Diagnosis](./troubleshooting/PAPER_TRADING_DIAGNOSIS.md)** - Fix paper trading issues
- **[MCP Timeout Fix](./troubleshooting/MCP_TIMEOUT_FIX.md)** - Resolve MCP connection timeouts

### 📖 [Guides](./guides/)
In-depth explanations and educational content:
- **[Paper Bot Safety](./guides/PAPER_BOT_SAFETY.md)** - Understanding paper trading safety
- **[Tech Portfolio](./guides/TECH_PORTFOLIO.md)** - Technical architecture and skills showcase

---

## 🎯 Quick Navigation

### For First-Time Setup:
1. Read: [Railway Quick Start](./deployment/RAILWAY_QUICK_START.md)
2. Follow: [Railway Deployment](./deployment/RAILWAY_DEPLOYMENT.md)
3. Enable: [Railway Worker Setup](./deployment/RAILWAY_WORKER_SETUP.md)

### For Troubleshooting:
1. **Bot not trading?** → [Paper Trading Diagnosis](./troubleshooting/PAPER_TRADING_DIAGNOSIS.md)
2. **MCP issues?** → [MCP Timeout Fix](./troubleshooting/MCP_TIMEOUT_FIX.md)
3. **Need Railway CLI?** → [Railway Quick Commands](./deployment/RAILWAY_QUICK_COMMANDS.md)

### For Understanding:
1. **How safe is paper trading?** → [Paper Bot Safety](./guides/PAPER_BOT_SAFETY.md)
2. **What tech is used?** → [Tech Portfolio](./guides/TECH_PORTFOLIO.md)
3. **How does deployment work?** → [Deployment Guide](./deployment/DEPLOYMENT_GUIDE.md)

---

## 📊 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DragonTrade Agent                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Web Process (index.js)     Worker Process (paper-bot.js)  │
│  ├─ Twitter Bot             ├─ Connects to Exchange        │
│  ├─ Educational Posts       ├─ Executes Paper Trades       │
│  ├─ Market Analysis         ├─ Writes Stats Files          │
│  └─ Stats Reporter          └─ Real-time Price Monitoring  │
│         │                            │                      │
│         └────────────────────────────┘                      │
│              trading_stats.json                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Eliza OS
- **APIs**: 
  - Twitter API v2
  - CoinGecko API
  - CoinMarketCap API
  - Binance/Bybit (ccxt)
- **Deployment**: Railway
- **Database**: In-memory adapter

---

## 📝 Documentation Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| Railway Deployment | ✅ Complete | 3 weeks ago |
| Paper Trading Diagnosis | ✅ Complete | Today |
| Railway Worker Setup | ✅ Complete | Today |
| MCP Timeout Fix | ✅ Complete | 3 months ago |
| Tech Portfolio | ✅ Complete | 2 weeks ago |

---

## 🤝 Contributing

Documentation improvements are welcome! When adding new docs:

1. **Deployment docs** → `docs/deployment/`
2. **Troubleshooting guides** → `docs/troubleshooting/`
3. **Educational guides** → `docs/guides/`
4. Update this README with links
5. Keep main branch clean (code only)

---

## 📞 Support

- **Issues**: Create an issue in the repository
- **Questions**: Check troubleshooting guides first
- **Railway Support**: https://discord.gg/railway

---

**Last Updated**: October 26, 2025
**Branch**: `docs`
**Purpose**: Comprehensive documentation separate from operational code
