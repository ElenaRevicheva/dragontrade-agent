# 🚂 Railway Quick Commands & Shortcuts

## Option 1: Railway CLI (Fastest Method)

If the Railway web UI is confusing, use the CLI:

### Install Railway CLI
```bash
npm install -g @railway/cli
```

### Setup and Deploy
```bash
# Login to Railway
railway login

# Link to your existing project
railway link

# Check current status
railway status

# Deploy both processes (Procfile will be detected automatically)
railway up

# View logs for web process
railway logs --service=web

# View logs for worker process
railway logs --service=worker
```

### Add Environment Variables via CLI
```bash
# Set exchange (choose one)
railway variables set EXCHANGE=bybit

# Add Bybit keys (if using Bybit)
railway variables set BYBIT_API_KEY=your_key_here
railway variables set BYBIT_SECRET=your_secret_here

# OR add Binance keys (if using Binance)
railway variables set BINANCE_API_KEY=your_key_here
railway variables set BINANCE_SECRET=your_secret_here
```

---

## Option 2: Alternative Procfile Setup

If Railway isn't detecting your Procfile, create this file:

### Create `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "startCommand": "node index.js & node production-paper-bot.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

This tells Railway to run both commands simultaneously in one container.

**Pros:**
- Simple, single service
- Both bots run in one process

**Cons:**
- If one crashes, both restart
- Harder to view separate logs

---

## Option 3: Docker Deployment (Advanced)

If Railway keeps giving you trouble, use Docker:

### Create `Dockerfile`
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy app files
COPY . .

# Start both processes using a process manager
RUN npm install -g pm2

# Start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
```

### Create `start.sh`
```bash
#!/bin/sh

# Start both processes with PM2
pm2 start index.js --name web
pm2 start production-paper-bot.js --name worker

# Keep container alive
pm2 logs
```

### Deploy
```bash
railway up
```

Railway will detect the Dockerfile and use it automatically.

---

## Option 4: Separate Services (Manual)

If automatic detection fails, create two separate Railway services:

### Service 1: Twitter Bot
1. Create new service from your repo
2. Name: `twitter-bot` or `web`
3. Start command: `node index.js`
4. Add all your existing environment variables

### Service 2: Paper Trading Bot
1. Create another service from the SAME repo
2. Name: `paper-trading-bot` or `worker`
3. Start command: `node production-paper-bot.js`
4. Copy ALL environment variables from Service 1
5. Add: `EXCHANGE=bybit` (or `binance`)
6. Add exchange API keys

**Important:** Both services need to share the same filesystem, which Railway provides for services in the same project.

---

## Verification Commands

After deployment, run these to verify:

```bash
# Check if both processes are running
railway status

# Real-time logs for web
railway logs --follow --service=web

# Real-time logs for worker
railway logs --follow --service=worker

# Check specific service
railway logs --service=worker --tail=100

# SSH into Railway container (if needed)
railway shell
```

Once in the shell:
```bash
# Check if stats file exists
ls -la *trading*.json

# Check processes
ps aux | grep node

# View stats file content
cat bybit_trading_stats.json
```

---

## Emergency Rollback

If something breaks:

```bash
# View deployment history
railway deployments

# Rollback to previous deployment
railway rollback [deployment-id]
```

---

## Common Railway Errors & Fixes

### Error: "Command not found"
**Fix:** Make sure `node` is in your PATH:
```json
// In railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "nixpacksPlan": {
      "providers": ["node"]
    }
  }
}
```

### Error: "Port already in use"
**Fix:** Railway expects web services to listen on `$PORT`. Your bots don't need ports, so add:
```javascript
// In production-paper-bot.js (top of file)
process.env.PORT = process.env.PORT || 3000;
```

### Error: "Module not found"
**Fix:** Ensure dependencies are installed:
```bash
railway run npm install
railway up
```

---

## Testing Before Railway

Test everything locally first:

```bash
# Terminal 1: Start web bot
node index.js

# Terminal 2: Start worker bot
node production-paper-bot.js

# Terminal 3: Monitor stats file
watch -n 5 'ls -la *trading*.json && cat *trading*.json 2>/dev/null'
```

If this works locally, Railway deployment should work too.

---

## Need More Help?

The Railway Discord is very responsive:
- https://discord.gg/railway

Or Railway Docs:
- https://docs.railway.app/

---

**Choose the method that works best for you!** 🚀
