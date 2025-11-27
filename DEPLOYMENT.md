# Zero-Downtime Deployment Guide

This guide explains how to deploy updates without taking your application offline using PM2 cluster mode with **separate build and runtime directories**.

## Overview

**The Simple Strategy:**

PM2 runs from `production/` directory, Vinxi builds to `.output/` directory. Deploy = copy `.output/` to `production/`. That's it!

**Why This Works:**
- ✅ Build never touches production (PM2 keeps running)
- ✅ Copy is fast and atomic
- ✅ PM2 reload picks up new files
- ✅ Zero downtime guaranteed

**Directory Structure:**
```
.output/           ← Vinxi build output (can be overwritten safely)
production/        ← PM2 runs from here (never touched during build)
production-old/    ← Backup for rollback
```

**PM2 Configuration:**
- **File:** `ecosystem.config.cjs` (CommonJS with JSDoc type annotations)
- **Script:** `./production/server/index.mjs` (separate from build output)
- **Environment Loading:** Uses `require('dotenv')` to load `.env` file
- **Instances:** 2 processes in cluster mode for zero-downtime deployments
- **Type Safety:** JSDoc annotations provide TypeScript autocomplete without compilation

**Key Commands:**
- `npm run deploy` - Deploy new version (pull, install, build, activate, reload)
- `npm run deploy:rollback` - Rollback to previous version
- `npm run deploy:cleanup` - Remove old backups after verifying deployment
- `npm run pm2:status` - Check application status
- `npm run pm2:logs` - View application logs

## Quick Start

### First Time Setup

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Initial deployment (pulls code, installs deps, builds, and starts PM2):**
   ```bash
   npm run pm2:start
   ```

   This command will:
   - Pull latest code from git
   - Install dependencies
   - Build the application
   - Start PM2 with 2 instances in cluster mode

3. **Save PM2 process list (optional - for auto-restart on server reboot):**
   ```bash
   pm2 save
   pm2 startup
   # Follow the instructions shown by the command above
   ```

### Deploy Updates (Zero Downtime)

When you need to deploy new code:

```bash
npm run deploy
```

This single command will:
1. 🔄 Pull latest code from git
2. 📦 Install/update dependencies
3. 🔨 Build to `.output/` (production untouched!)
4. ✅ Validate new build (checks for `server/index.mjs`)
5. 📦 Backup current `production/` to `production-old/`
6. 🔄 Copy `.output/` to `production/`
7. 🔄 Gracefully reload PM2 instances (zero downtime)
8. ✅ Deployment complete

**How It Works:**
```
Before:
production/  ← PM2 running from here

Build Phase:
.output/     ← Fresh build created (PM2 unaffected!)

Activate Phase:
production-old/  ← Backup created
production/      ← New build copied here

PM2 Reload:
PM2 gracefully reloads from new production/
```

**Key Safety Feature:** Production directory is never touched during build phase, so PM2 keeps running even if build fails!

### Rollback to Previous Version

If something goes wrong after deployment:

```bash
npm run deploy:rollback
```

This will:
1. ⏪ Restore `production-old/` to `production/`
2. 🔄 Gracefully reload PM2
3. ✅ You're back to the previous working version

### Clean Up Old Builds

After verifying the deployment works:

```bash
npm run deploy:cleanup
```

**⚠️ Warning:** After cleanup, you cannot rollback!

## Deployment Workflow Example

```bash
# 1. Deploy new version
npm run deploy

# 2. Test the deployment
# ... visit your site, check functionality ...

# 3a. If everything works, clean up:
npm run deploy:cleanup

# 3b. If something is wrong, rollback:
npm run deploy:rollback
```

## Why This Design Is Better

### Separation of Concerns
```
.output/           ← Build artifact (temporary, can be deleted)
production/        ← Runtime directory (stable, PM2 always reads from here)
```

**Benefits:**
- ✅ Build phase never affects running application
- ✅ Vinxi can use its default `.output/` behavior
- ✅ No complex directory choreography
- ✅ Clearer mental model (build vs runtime)
- ✅ Safer deployments (production is sacred)

### What Happens During Build

**Old (Complex) Method:**
```
❌ Move .output → .output-current
❌ Build to .output
❌ Move .output → .output-new
❌ Move .output-current → .output
❌ Validate .output-new
❌ Move .output → .output-old
❌ Move .output-new → .output
```
7 directory operations, easy to break!

**New (Simple) Method:**
```
✅ Build to .output (PM2 unaffected - reads from production/)
✅ Copy .output to production
✅ PM2 reload
```
3 operations, simple and safe!

## PM2 Commands

### Basic Operations

- **Start app:** `npm run pm2:start`
- **Stop app:** `npm run pm2:stop`
- **Restart app (brief downtime):** `npm run pm2:restart`
- **Reload app (zero downtime):** `npm run pm2:reload`
- **Delete from PM2:** `npm run pm2:delete`
- **Check status:** `npm run pm2:status`

### Monitoring

- **View logs:** `npm run pm2:logs`
- **Monitor resources:** `npm run pm2:monit`
- **View detailed info:** `pm2 show ok-web-frontend`

### Deployment Scripts

- **Build:** `npm run deploy:build` (builds to `.output/`)
- **Activate:** `npm run deploy:activate` (copy `.output/` to `production/`)
- **Rollback:** `npm run rollback` (restore `production-old/` to `production/`)
- **Cleanup:** `npm run deploy:cleanup` (remove `production-old/`)

### Advanced

```bash
# View logs for specific instance
pm2 logs ok-web-frontend --lines 100

# Clear logs
pm2 flush

# Stop and restart with new config
pm2 delete ecosystem.config.cjs
pm2 start ecosystem.config.cjs

# Scale to more instances
pm2 scale ok-web-frontend 4
```

## How Zero-Downtime Works

PM2's `reload` command:
1. Starts a new instance with the updated code
2. Waits for it to be ready
3. Gracefully shuts down one old instance
4. Repeats until all instances are updated
5. Your app stays online throughout the process

## How Cluster Mode Works (Multiple Instances on Same Port)

**Important:** In cluster mode, multiple instances CAN share the same port. Here's how:

### The Technical Explanation

PM2 uses Node.js's **cluster module**, which works differently from running multiple standalone processes:

```
Client Request → Port 3001 (PM2 Master Process)
                      ↓
                Load Balancer (Round-Robin)
                      ↓
         ┌────────────┴────────────┐
         ↓                         ↓
    Instance 1                 Instance 2
    (Worker)                   (Worker)
```

1. **PM2 Master Process** binds to port 3001
2. **Worker instances** (your app) receive connections via IPC from the master
3. **Load balancing** happens automatically (round-robin by default)
4. Each worker handles requests independently

### Why This Works

- Workers don't bind directly to the port - they receive connections from the master
- The OS kernel allows this because it uses `SO_REUSEPORT` internally
- PM2 coordinates the workers using inter-process communication (IPC)

### Verify It's Working

You can test the cluster mode behavior:

```bash
# Run the demo script
node scripts/checkClusterMode.js

# In another terminal, make requests
curl http://localhost:3002
curl http://localhost:3002
curl http://localhost:3002
```

Each request will be handled by a different worker (you'll see different process IDs).

### Benefits of Cluster Mode

1. **Better CPU utilization** - Uses multiple cores
2. **Higher throughput** - More requests handled simultaneously
3. **Fault tolerance** - If one worker crashes, others continue
4. **Zero-downtime deploys** - Reload workers one by one
5. **Automatic load balancing** - Built-in round-robin distribution

## Configuration

Edit `ecosystem.config.cjs` to customize:

- **instances:** Number of processes (2 recommended, or "max" for all CPU cores)
- **max_memory_restart:** Auto-restart if memory exceeds limit
- **kill_timeout:** How long to wait for graceful shutdown
- **env:** Environment variables

### Environment Variables

The ecosystem config automatically loads environment variables from `.env` file using `require('dotenv')`:

```javascript
// ecosystem.config.cjs
// @ts-check

// Load environment variables from .env file
require('dotenv').config({ path: '.env' });

/**
 * PM2 Ecosystem Configuration
 * @type {import('pm2').StartOptions}
 */
module.exports = {
  apps: [{
    env: {
      ...process.env,  // All .env variables loaded here
      NODE_ENV: process.env.NODE_ENV || "production",
      PORT: process.env.DOMAIN_PORT || 3001,
    },
    // ... other config
  }]
};
```

All environment variables from `.env` are automatically passed to PM2 processes, including:
- `NODE_ENV`
- `DOMAIN_PORT`
- `NEO4J_USERNAME`, `NEO4J_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`
- `OPENROUTER_API_KEY`
- `SMTP_*` variables
- `RAZORPAY_*` variables
- All other variables defined in `.env`

**Note:** The config file uses JSDoc type annotations (`@type {import('pm2').StartOptions}`) to provide TypeScript autocomplete and type checking in VS Code without requiring TypeScript compilation.

Make sure `.env` file exists before starting PM2.

## Alternative Approaches

### Option 2: Docker with Rolling Updates

If you're using Docker:

```yaml
# docker-compose.yml
services:
  app:
    image: your-app:latest
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
        order: start-first
```

Deploy with:
```bash
docker-compose up -d --no-deps --build app
```

### Option 3: Nginx + Multiple Instances

Run multiple instances on different ports with Nginx load balancing:

```nginx
upstream app {
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 80;
    location / {
        proxy_pass http://app;
    }
}
```

Update process:
1. Update instance on port 3002
2. Test it works
3. Update instance on port 3001
4. Nginx handles traffic during updates

### Option 4: Blue-Green Deployment

Use a reverse proxy to switch between two complete environments:
1. Deploy to "green" environment
2. Test thoroughly
3. Switch proxy to point to "green"
4. Keep "blue" as rollback option

## Troubleshooting

### Build Fails During Deployment

**Problem:** Build fails during `npm run deploy`

**Solution:**
```bash
# The old version stays active - no downtime
# Fix the code issue, then try again
npm run deploy
```

### App Crashes After Deployment

**Problem:** New version has bugs or crashes

**Solution:**
```bash
# Quick rollback to previous version
npm run deploy:rollback

# Check logs to see what went wrong
npm run pm2:logs

# Fix the issue and deploy again
npm run deploy
```

### Cannot Rollback (No Old Build)

**Problem:** `❌ No backup found for rollback`

**Solution:**
- This happens if you ran `deploy:cleanup` or this is first deployment
- Deploy a working version:
  ```bash
  npm run deploy
  ```

### Activate Failed (Invalid Build)

**Problem:** `❌ Build invalid (.output/server/index.mjs missing)`

**Solution:**
```bash
# Check if build completed successfully
ls -la .output/server/index.mjs

# If missing, rebuild:
npm run deploy:build

# Then try activating:
npm run deploy:activate
npm run pm2:reload
```

### App Won't Start
```bash
# Check logs
npm run pm2:logs

# Check if port is in use
lsof -i :3001

# Check PM2 status
npm run pm2:status

# Try deleting and restarting
pm2 delete ok-web-frontend
npm run pm2:start
```

### Memory Issues
```bash
# Monitor memory usage
npm run pm2:monit

# Lower max_memory_restart in ecosystem.config.cjs
# Or increase instances to distribute load
```

### Reload Not Working
```bash
# Use restart instead (brief downtime)
npm run pm2:restart

# Or fully restart PM2
pm2 kill
pm2 start ecosystem.config.cjs
```

### Need to Test Build Before Deploying
```bash
# Build first
npm run deploy:build

# Manually inspect .output/
ls -la .output/

# When satisfied, activate:
npm run deploy:activate
npm run pm2:reload
```

## Safety Features

✅ **Build Validation** - Activate only happens if `.output/server/index.mjs` exists
✅ **Automatic Backup** - Current production always backed up before activating new build
✅ **Separate Directories** - Build (.output/) never affects running app (production/)
✅ **Graceful Reload** - PM2 reloads instances one at a time (zero downtime)
✅ **Quick Rollback** - One command to restore previous version
✅ **Error Handling** - Scripts stop on first error (using `&&` chaining)
✅ **Visual Feedback** - Emoji indicators show progress
✅ **Manual Cleanup** - Old builds kept until you explicitly remove them
✅ **Simple & Clear** - Only 3 operations instead of 7

## Production Checklist

- [ ] PM2 installed globally (`npm install -g pm2`)
- [ ] `.env` file exists with all required environment variables
- [ ] Ecosystem config set to 2+ instances
- [ ] PM2 startup script configured for auto-restart (`pm2 startup`)
- [ ] Logs directory exists: `mkdir -p logs`
- [ ] Environment variables loaded correctly (verify with `pm2 env 0`)
- [ ] Test deployment process before production use
- [ ] Test rollback process to ensure it works
- [ ] Monitor memory usage after deployment (`pm2 monit`)
- [ ] Save PM2 process list (`pm2 save`)
- [ ] Set up PM2 keymetrics for monitoring (optional)

## Best Practices

1. **Always use `pm2 reload` for zero downtime** (not `restart`)
2. **Run at least 2 instances** to enable graceful reload
3. **Separate build and runtime directories** - Never let PM2 run from `.output/`
4. **Test builds locally** before deploying to production
5. **Monitor logs** during and after deployment (`npm run pm2:logs`)
6. **Keep PM2 updated:** `npm update -g pm2`
7. **Use PM2 ecosystem file** for consistent configuration
8. **Set up health checks** if using load balancer
9. **Use JSDoc type annotations** for type safety without TypeScript compilation
10. **Always ensure `.env` file exists** before starting PM2
11. **Keep it simple** - Avoid complex directory juggling

## References

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2 Cluster Mode](https://pm2.keymetrics.io/docs/usage/cluster-mode/)
- [PM2 Deployment](https://pm2.keymetrics.io/docs/usage/deployment/)
