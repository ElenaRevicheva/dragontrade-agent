# 🚀 Deployment Documentation

Complete guides for deploying DragonTrade Agent to production environments.

---

## 📚 Available Guides

### 1. [Railway Deployment](./RAILWAY_DEPLOYMENT.md)
**Complete end-to-end Railway deployment guide**
- Initial setup from scratch
- Environment variables configuration
- Process management (web + worker)
- Monitoring and logs
- Cost breakdown

**Use when**: First time deploying or need comprehensive reference

---

### 2. [Railway Quick Start](./RAILWAY_QUICK_START.md)
**Fast-track deployment for experienced users**
- Quick checklist
- Minimal steps
- Assumes Railway familiarity

**Use when**: You know Railway, just need the specifics

---

### 3. [Railway Worker Setup](./RAILWAY_WORKER_SETUP.md)
**Step-by-step guide to enable paper trading worker**
- Detailed UI walkthrough
- Multiple setup methods
- Troubleshooting common issues
- What to expect after enabling

**Use when**: Main bot works, but paper trading doesn't

---

### 4. [Railway Quick Commands](./RAILWAY_QUICK_COMMANDS.md)
**CLI shortcuts and alternative deployment methods**
- Railway CLI commands
- Docker deployment
- Alternative Procfile setups
- Emergency rollback procedures

**Use when**: Web UI isn't working or prefer command line

---

### 5. [Deployment Guide](./DEPLOYMENT_GUIDE.md)
**General deployment overview**
- Platform-agnostic guidance
- Environment setup
- Common deployment patterns

**Use when**: Need general deployment concepts

---

## 🎯 Recommended Reading Order

### For Complete Beginners:
1. Start with [Railway Quick Start](./RAILWAY_QUICK_START.md)
2. Follow [Railway Deployment](./RAILWAY_DEPLOYMENT.md) for details
3. Enable worker with [Railway Worker Setup](./RAILWAY_WORKER_SETUP.md)

### For Railway Experts:
1. Jump to [Railway Quick Commands](./RAILWAY_QUICK_COMMANDS.md)
2. Use CLI for fast deployment

### For Troubleshooting:
1. Check [Railway Worker Setup](./RAILWAY_WORKER_SETUP.md) troubleshooting section
2. Try [Railway Quick Commands](./RAILWAY_QUICK_COMMANDS.md) alternative methods

---

## ⚡ Quick Reference

### Essential Environment Variables

```bash
# Twitter (Required)
TWITTER_API_KEY=xxx
TWITTER_API_SECRET=xxx
TWITTER_ACCESS_TOKEN=xxx
TWITTER_ACCESS_TOKEN_SECRET=xxx

# APIs (Required)
ANTHROPIC_API_KEY=xxx
COINMARKETCAP_API_KEY=xxx

# Exchange (Optional - for paper trading)
EXCHANGE=bybit
BYBIT_API_KEY=xxx
BYBIT_SECRET=xxx
```

### Procfile Contents

```
web: node index.js
worker: node production-paper-bot.js
```

### Railway CLI Quick Deploy

```bash
railway login
railway link
railway up
railway logs --follow
```

---

## 🚨 Common Deployment Issues

| Issue | Solution |
|-------|----------|
| Worker not starting | See [Railway Worker Setup](./RAILWAY_WORKER_SETUP.md) |
| MCP timeouts | See [../troubleshooting/MCP_TIMEOUT_FIX.md](../troubleshooting/MCP_TIMEOUT_FIX.md) |
| No trades executing | See [../troubleshooting/PAPER_TRADING_DIAGNOSIS.md](../troubleshooting/PAPER_TRADING_DIAGNOSIS.md) |
| Build failures | Check dependencies in package.json |

---

## 💰 Cost Estimates

- **Free Tier**: Works with limitations
- **Hobby Plan**: ~$5/month (recommended)
- **Pro Plan**: ~$20/month (for high traffic)

See [Railway Deployment](./RAILWAY_DEPLOYMENT.md) for detailed cost breakdown.

---

**Last Updated**: October 26, 2025
