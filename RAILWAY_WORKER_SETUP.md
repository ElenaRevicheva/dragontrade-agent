# 🚂 Railway Worker Setup - Step-by-Step Guide

## 🎯 Goal: Enable Paper Trading Bot on Railway

This guide will help you enable the `worker` process so your paper trading bot runs alongside your Twitter bot.

---

## 📋 Pre-Flight Checklist

Before we start, verify these files exist in your repository:

- [x] `Procfile` - Defines both web and worker processes
- [x] `production-paper-bot.js` - The paper trading bot code
- [x] `educational-bot-integration.js` - Stats reporter
- [x] `package.json` - Has `ccxt` and `ws` dependencies

**All files are present!** ✅ You're ready to proceed.

---

## 🚀 Step-by-Step: Enable Worker Process

### **Step 1: Go to Railway Dashboard**

1. Open your browser
2. Go to: https://railway.app/
3. Log in to your account
4. Click on your project (the one with your Twitter bot)

---

### **Step 2: Check Current Deployment**

You should see your project dashboard. Look for:

**Current Status (What You Have Now):**
```
┌─────────────────────────────────┐
│  Service: your-project-name     │
│                                 │
│  Process: web                   │
│  Status: 🟢 Running             │
│  Command: node index.js         │
└─────────────────────────────────┘
```

**Goal (What We Want):**
```
┌─────────────────────────────────┐
│  Service: your-project-name     │
│                                 │
│  Process: web                   │
│  Status: 🟢 Running             │
│  Command: node index.js         │
│                                 │
│  Process: worker                │
│  Status: 🟢 Running             │
│  Command: node production-paper-bot.js
└─────────────────────────────────┘
```

---

### **Step 3: Navigate to Settings**

On your Railway project page:

1. Click on your service/deployment
2. Look for tabs at the top: **"Deployments"**, **"Variables"**, **"Settings"**, etc.
3. Click on **"Settings"** tab

---

### **Step 4: Find the Deploy Section**

In Settings, scroll down until you find one of these sections:

- **"Deploy"** section
- **"Build & Deploy"** section
- **"Start Command"** or **"Custom Start Command"**

You might see:
```
Start Command: node index.js
```

---

### **Step 5: Enable Procfile Support**

Railway should automatically detect your `Procfile`. To verify:

**Option A: Procfile Auto-Detected** ✅
Look for text like:
```
✓ Detected Procfile
  - web: node index.js
  - worker: node production-paper-bot.js
```

If you see this, **great!** Procfile is detected. Skip to Step 6.

**Option B: Procfile Not Detected** ❌
If you see a single "Start Command" field instead:

1. Look for a checkbox or option: **"Use Procfile"** or **"Procfile-based deployment"**
2. Toggle it **ON**
3. Save settings

If you can't find this option, go to **Step 6B** for manual setup.

---

### **Step 6A: Enable Worker (Automatic Method)**

If Railway detected your Procfile:

1. Look for **"Processes"** or **"Services"** section
2. You should see a list:
   ```
   [✓] web       node index.js          [Running]
   [ ] worker    node production-paper-bot.js    [Not Running]
   ```

3. **Click the checkbox next to "worker"** to enable it
4. Click **"Save"** or **"Apply"**

That's it! Railway will now run both processes. Skip to Step 7.

---

### **Step 6B: Enable Worker (Manual Method)**

If Railway doesn't show a Processes list, you'll need to add the worker manually.

**Method 1: Add as a New Service**

1. Go back to your Railway project dashboard
2. Look for a button: **"+ New"** or **"Add Service"**
3. Select **"Empty Service"** or **"From existing repo"**
4. Choose your same GitHub repository
5. Configure the new service:
   - **Name:** `worker` or `paper-trading-bot`
   - **Start Command:** `node production-paper-bot.js`
   - **Environment:** Copy all variables from your web service
6. Click **"Deploy"**

**Method 2: Use Railway CLI (Advanced)**

If the above doesn't work, you can use Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Deploy with Procfile
railway up
```

Railway CLI will automatically detect and deploy both processes from your Procfile.

---

### **Step 7: Add Environment Variables (Optional but Recommended)**

The paper trading bot can work with public data, but API keys improve reliability.

1. Go to **"Variables"** tab
2. **KEEP all existing variables** (don't delete anything!)
3. Add these **NEW** variables:

**Choose ONE exchange:**

**Option A: Use Bybit** (Recommended - simpler API)
```bash
EXCHANGE=bybit
BYBIT_API_KEY=your_bybit_api_key_here
BYBIT_SECRET=your_bybit_secret_here
```

**Option B: Use Binance**
```bash
EXCHANGE=binance
BINANCE_API_KEY=your_binance_api_key_here
BINANCE_SECRET=your_binance_secret_here
```

**How to get API keys:**

**Bybit:**
1. Go to https://www.bybit.com/
2. Login → Profile → API Management
3. Create API Key → Select **"Read-Only"** permissions
4. Copy API Key and Secret
5. Paste into Railway variables

**Binance:**
1. Go to https://www.binance.com/
2. Login → Profile → API Management
3. Create API Key → Select **"Enable Reading"** only
4. Copy API Key and Secret
5. Paste into Railway variables

**⚠️ IMPORTANT:** 
- Use **READ-ONLY** permissions
- **NEVER** enable trading or withdrawal permissions
- The bot only needs to read market data

**Can I skip API keys?**
Yes! The bot will work with public data, but authenticated access is more reliable.

---

### **Step 8: Deploy/Redeploy**

After enabling the worker and adding variables:

1. Look for a **"Deploy"** button (usually top-right)
2. Click it, or go to **"Deployments"** tab
3. Click **"Redeploy"** or **"New Deployment"**
4. Wait 2-3 minutes for deployment to complete

You'll see build logs like:
```
Installing dependencies...
✓ npm install completed
✓ Starting web process...
✓ Starting worker process...
Deployment successful!
```

---

### **Step 9: Verify Both Processes Running**

After deployment completes:

**Check Process Status:**
1. Go to your Railway project dashboard
2. You should see **TWO** services/processes running
3. Both should have green status indicators

**View Web Process Logs:**
1. Click on the **"web"** process or service
2. Go to **"Logs"** tab or **"View Logs"**
3. You should see your Twitter bot running normally:
   ```
   [timestamp] 🐉 AUTHENTIC ALGOM: 5min | Status: 100% AUTHENTIC
   [timestamp] 🔥 Next AUTHENTIC post scheduled in 7 minutes
   ```

**View Worker Process Logs:**
1. Click on the **"worker"** process or service
2. Go to **"Logs"** tab
3. You should see the paper trading bot starting:
   ```
   🚀 INITIALIZING PRODUCTION PAPER TRADING BOT
   ═══════════════════════════════════════════
   🔗 Connecting to BYBIT...
   ✅ Connected to BYBIT
   📊 BTC/USDT Current Price: $95,234.56
   💰 Paper Trading Balance: $10,000
   📈 Strategy: MA(7/25) + RSI(14)
   🛡️  Risk: 2% SL, 6% TP
   ✅ PRODUCTION BOT READY - REAL DATA, REAL STRATEGY
   📡 Starting real-time price polling (REST API)...
   ✅ Polling started - checking for new candles every 5m
   ⏰ Next check in 5 minutes...
   ```

**If you see both of these, SUCCESS!** 🎉 Both bots are running.

---

## 🔍 Troubleshooting

### ❌ Problem: Can't Find "Processes" or "Procfile" Options

**Solution:**
Railway may have updated their UI. Try:
1. Click around in **Settings** → **Deploy** section
2. Look for **"Service Settings"** or **"Configuration"**
3. Check if there's a **"Root Directory"** or **"Dockerfile"** section
4. Make sure "Start Command" is **empty** or says `Use Procfile`

If you still can't find it, use **Method 2 (Add as New Service)** from Step 6B.

---

### ❌ Problem: Worker Process Starts But Immediately Crashes

**Check the logs for errors:**

**Error: "Cannot find module 'ccxt'"**
- **Solution:** Make sure `package.json` includes `ccxt`
- Redeploy to trigger `npm install`

**Error: "BINANCE_API_KEY is not defined"**
- **Solution:** Either add API keys OR change line 19 in `production-paper-bot.js`:
  ```javascript
  exchange: process.env.EXCHANGE || 'bybit',
  ```
- The bot will use public data if no keys are provided

**Error: "Rate limit exceeded"**
- **Solution:** Add API keys for higher rate limits

---

### ❌ Problem: "Cannot read property 'totalTrades' of null"

**This is normal!** It means:
- Worker bot is running
- But hasn't created stats files yet (takes 5+ minutes)
- Web bot tries to read stats but they don't exist yet

**Solution:** Wait 5-10 minutes. After first candle, stats file will be created.

---

### ❌ Problem: Worker Shows "Connection Failed" or "WebSocket Error"

**Possible causes:**
1. Temporary network issue - bot will auto-retry
2. Exchange API keys are invalid - check and re-enter
3. Exchange is down - check status pages

**Solution:** Wait 5-10 minutes. Bot retries automatically.

---

### ❌ Problem: Worker Running But No Trades After 24 Hours

**This is NORMAL!** The paper bot:
- Waits for MA indicators to initialize (2+ hours)
- Only trades on MA crossover signals
- Might not see a crossover for days in sideways markets

**How to verify it's working:**
Check worker logs for:
```
🕐 NEW CANDLE: [timestamp]
   Price: $95,456.78 | Volume: 123.45

📊 INDICATORS:
   Short MA(7): $95,234.12
   Long MA(25): $94,987.65
   RSI(14): 62.15

⏳ Waiting for new candle... Current: [time]
```

If you see new candles every 5 minutes, **it's working!** Just waiting for trade signals.

---

## 📊 What to Expect Next

### Timeline:

**Immediate (0-5 minutes):**
- ✅ Both processes start
- ✅ Worker connects to exchange
- ✅ First candle data fetched

**5-10 minutes:**
- ✅ First candle closes
- ✅ Stats file created: `bybit_trading_stats.json` or `binance_trading_stats.json`
- ✅ Indicators start calculating

**2-3 hours:**
- ✅ Moving averages fully initialized (needs 25 candles)
- ✅ Bot can now detect crossover signals

**1-7 days:**
- ✅ First trade executed (if market trends)
- ✅ Web bot posts about the trade results
- ✅ Honest P&L reporting begins

**1 month:**
- ✅ Meaningful statistics (10+ trades)
- ✅ Real performance metrics
- ✅ Win rate, profit factor, drawdown data

---

## ✅ Success Checklist

After completing this guide, verify:

- [ ] Worker process shows as "Running" in Railway
- [ ] Worker logs show successful connection to exchange
- [ ] Worker logs show "NEW CANDLE" messages every 5 minutes
- [ ] Web process still running normally
- [ ] Web process logs show both bots are active
- [ ] No crash errors in either process

---

## 💡 Pro Tips

### Tip 1: Monitor Daily (First Week)
Check Railway logs daily to ensure:
- No crashes
- Candles processing correctly
- No unusual errors

### Tip 2: Don't Panic If No Trades
Paper trading is realistic. In sideways markets, you might not see trades for a week. This is NORMAL and actually demonstrates proper discipline (not forcing bad trades).

### Tip 3: API Keys Are Optional
If you're on Railway's free tier and want to minimize costs, you can skip API keys. The bot works with public data, just with lower rate limits.

### Tip 4: Test Locally First
If Railway is confusing, test locally:
```bash
# Terminal 1
node index.js

# Terminal 2
node production-paper-bot.js
```

Once you verify it works locally, Railway deployment will be easier.

---

## 🆘 Still Stuck?

If you can't get it working after following this guide:

1. **Take screenshots** of:
   - Your Railway project dashboard (show services/processes)
   - Settings → Deploy section
   - Any error messages in logs

2. **Share this info:**
   - Railway plan (Free/Hobby/Pro)
   - Which step you're stuck on
   - Exact error messages

3. **Quick Diagnostic:**
   Run this in your local terminal:
   ```bash
   # Check if files exist
   ls -la Procfile production-paper-bot.js

   # Test bot locally
   node production-paper-bot.js
   ```
   
   Share the output.

---

## 🎉 Once It's Working

You'll see posts like this on your Twitter:

```
🟢 ALGOM PAPER TRADING - WIN
🟣 Exchange: BYBIT

📊 REAL TRADE RESULTS:
• Entry: $95,456.78
• Exit: $101,234.56
• P&L: $173.33 (5.78%)
• Reason: TAKE_PROFIT

📈 CURRENT STATS:
• Total Trades: 1
• Win Rate: 100.0%
• Total P&L: $173.33 (1.73%)
• Profit Factor: ∞

🎓 LESSON: This 5.78% gain validates our MA crossover strategy...

#PaperTrading #RealResults #AlgomBot
```

**100% real, 0% lies.** 🎯

---

**Ready to proceed? Start at Step 1!** 🚀
