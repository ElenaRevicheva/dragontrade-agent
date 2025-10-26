# 🔧 Troubleshooting Documentation

Solutions for common issues with DragonTrade Agent.

---

## 📚 Available Guides

### 1. [Paper Trading Diagnosis](./PAPER_TRADING_DIAGNOSIS.md)
**Complete diagnostic guide for paper trading issues**

**Symptoms:**
- Paper trading bot not posting results
- No trading_stats.json files
- Bot posts "COMING SOON" messages
- Worker process not running

**Solutions:**
- Enable worker process on Railway
- Run both processes simultaneously
- Combine into single process
- Local testing procedures

**Use when**: Your paper trading system isn't working

---

### 2. [MCP Timeout Fix](./MCP_TIMEOUT_FIX.md)
**Resolve Model Context Protocol connection timeouts**

**Symptoms:**
- MCP initialization failures
- Connection timeouts
- CoinGecko API not responding
- Educational content not generating

**Solutions:**
- Increase timeout values
- Implement retry logic
- Add health monitoring
- Fallback mechanisms

**Use when**: MCP connections are failing

---

## 🎯 Quick Diagnostic

### Problem: Bot isn't posting to Twitter
**Check:**
1. Twitter API credentials in environment variables
2. Rate limiting status in logs
3. Internet connectivity

**See**: Deployment guides for Twitter setup

---

### Problem: No paper trading results
**Check:**
1. Worker process running?
2. Exchange API keys configured?
3. Stats files being created?

**See**: [Paper Trading Diagnosis](./PAPER_TRADING_DIAGNOSIS.md)

---

### Problem: MCP errors in logs
**Check:**
1. Timeout values in environment
2. CoinGecko API status
3. Network connectivity

**See**: [MCP Timeout Fix](./MCP_TIMEOUT_FIX.md)

---

### Problem: Rate limit errors
**Symptoms:**
```
🚫 [RATE LIMIT] Bot is paused due to rate limits
⏰ [RATE LIMIT] Too soon to post
```

**Solutions:**
- Wait for cooldown period
- Check POST_INTERVAL_MIN/MAX values
- Verify you're not hitting Twitter API limits

**Environment Variables:**
```bash
POST_INTERVAL_MIN=3    # Minimum minutes between posts
POST_INTERVAL_MAX=10   # Maximum minutes between posts
```

---

### Problem: Exchange connection failures
**Symptoms:**
```
❌ INITIALIZATION FAILED: Cannot connect to exchange
⚠️ [COINGECKO API] Connection unhealthy
```

**Solutions:**
1. **Check API keys** - Make sure they're valid
2. **Check permissions** - Must be READ-ONLY
3. **Check exchange status** - May be under maintenance
4. **Check region** - Some regions are blocked

**Try different exchanges:**
- Bybit (Recommended)
- Binance (Some regions blocked)
- Kraken (More restrictive)

---

## 🔍 Log Analysis

### Normal Logs (Everything Working)

**Web Process:**
```
[timestamp] 🐉 AUTHENTIC ALGOM: 15min | Status: 100% AUTHENTIC
[timestamp] ✅ [POST] Success on attempt 1
[timestamp] 📊 [RATE LIMIT] Posts today: 5/500
```

**Worker Process:**
```
✅ Connected to BYBIT
🕐 NEW CANDLE: [timestamp]
📊 INDICATORS: Short MA(7): $95,234.12
✅ Stats exported to bybit_trading_stats.json
```

---

### Error Logs (Something Wrong)

**Web Process:**
```
❌ [POST] Attempt 3 failed
🚫 [RATE LIMIT] Max retries reached
⚠️ [COINGECKO] Connection unhealthy
```

**Worker Process:**
```
❌ INITIALIZATION FAILED
⚠️ [COINGECKO API] BTC data fetch failed
🔄 [COINGECKO] Falling back to MCP client
```

---

## 🚨 Emergency Procedures

### Bot Completely Stuck

1. **Check Railway status** - Is service running?
2. **Restart service** - Click "Restart" in Railway
3. **Check logs** - Look for crash errors
4. **Rollback** - Use previous deployment if needed

```bash
railway deployments
railway rollback <deployment-id>
```

---

### Data Corruption

If stats files are corrupted:

```bash
# SSH into Railway
railway shell

# Backup current stats
cp trading_stats.json trading_stats.backup.json

# Delete corrupted file
rm trading_stats.json

# Worker will create fresh file on next candle
```

---

### Rate Limit Hell

If bot is stuck in rate limit loop:

1. **Increase intervals**:
```bash
railway variables set POST_INTERVAL_MIN=10
railway variables set POST_INTERVAL_MAX=20
```

2. **Force resume** (emergency):
```bash
railway variables set FORCE_RESUME_RATE_LIMITS=true
railway restart
```

3. **Wait 24 hours** for Twitter rate limits to reset

---

## 📊 Health Check Commands

### Check if both processes running
```bash
railway status
```

### View real-time logs
```bash
railway logs --follow --service=web
railway logs --follow --service=worker
```

### Check stats files
```bash
railway shell
ls -la *trading*.json
cat bybit_trading_stats.json
```

### Check environment variables
```bash
railway variables
```

---

## 🆘 When All Else Fails

1. **Check Railway Status**: https://status.railway.app/
2. **Check Exchange Status**: 
   - Bybit: https://bybit-exchange.statuspage.io/
   - Binance: https://www.binancestatus.com/
3. **Check Twitter API Status**: https://api.twitterstat.us/
4. **Railway Discord**: https://discord.gg/railway
5. **Create GitHub Issue**: Include logs and error messages

---

## 📝 Reporting Issues

When reporting issues, include:

1. **Environment**: Railway/Local
2. **Process**: Web/Worker/Both
3. **Error Messages**: Copy exact error text
4. **Recent Changes**: What did you change before it broke?
5. **Logs**: Last 50 lines of relevant logs

**Example:**
```
Environment: Railway
Process: Worker
Error: "Cannot connect to BYBIT"
Changed: Added new API keys 1 hour ago
Logs: [paste logs]
```

---

**Last Updated**: October 26, 2025
