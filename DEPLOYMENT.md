# Zero-Downtime Deployment Guide

This guide explains how to deploy updates without taking your application offline using a **build-swap strategy** with PM2 cluster mode.

## Overview

**Deployment Strategy:**
- Zero-downtime deployment with automatic rollback support
- Three-directory build system (current, new, old)
- Build validation before swapping
- One-command rollback to previous version

**PM2 Configuration:**
- **File:** `ecosystem.config.cjs` (CommonJS with JSDoc type annotations)
- **Environment Loading:** Uses `require('dotenv')` to load `.env` file
- **Instances:** 2 processes in cluster mode for zero-downtime deployments
- **Type Safety:** JSDoc annotations provide TypeScript autocomplete without compilation

**Key Commands:**
- `npm run deploy` - Deploy new version (pull, install, build, swap, reload)
- `npm run deploy:rollback` - Rollback to previous version
- `npm run cleanup:build` - Remove old builds after verifying deployment
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
3. 🔨 Build new version to `.output-new`
4. ✅ Validate new build (checks for `server/index.mjs`)
5. 📦 Backup current `.output` to `.output-old`
6. 🔄 Swap `.output-new` to `.output`
7. 🔄 Gracefully reload PM2 instances (zero downtime)
8. ✅ Deployment complete

**The Build Swap System:**
- `.output` - Current production build (active)
- `.output-new` - New build being prepared (temporary)
- `.output-old` - Previous build (backup for rollback)

If any step fails, deployment stops and the current build stays active.

### Rollback to Previous Version

If something goes wrong after deployment:

```bash
npm run deploy:rollback
```

This will:
1. ⏪ Restore `.output-old` to `.output`
2. 🔄 Gracefully reload PM2
3. ✅ You're back to the previous working version

### Clean Up Old Builds

After verifying the deployment works:

```bash
npm run cleanup:build
```

**⚠️ Warning:** After cleanup, you cannot rollback!

## Deployment Workflow Example

```bash
# 1. Deploy new version
npm run deploy

# 2. Test the deployment
# ... visit your site, check functionality ...

# 3a. If everything works, clean up:
npm run cleanup:build

# 3b. If something is wrong, rollback:
npm run deploy:rollback
```

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

### Build Scripts

- **Normal build:** `npm run build` (replaces `.output`)
- **Temporary build:** `npm run build:temp` (creates `.output-new`)
- **Swap builds:** `npm run swap:build` (swap `.output-new` to `.output`)
- **Rollback:** `npm run rollback:build` (restore `.output-old`)
- **Cleanup:** `npm run cleanup:build` (remove old builds)

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

**Problem:** `❌ No old build found for rollback`

**Solution:**
- This happens if you ran `cleanup:build` or this is first deployment
- Deploy a working version:
  ```bash
  npm run deploy
  ```

### Swap Failed (Invalid New Build)

**Problem:** `❌ No valid new build found`

**Solution:**
```bash
# Check if build completed successfully
ls -la .output-new/server/index.mjs

# If missing, rebuild:
npm run build:temp

# Then try swapping:
npm run swap:build
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
# Build to temporary directory
npm run build:temp

# Manually inspect .output-new
# When satisfied, swap:
npm run swap:build
npm run pm2:reload
```

## Safety Features

✅ **Build Validation** - Swap only happens if `.output-new/server/index.mjs` exists
✅ **Automatic Backup** - Current build always backed up before swap
✅ **Graceful Reload** - PM2 reloads instances one at a time (zero downtime)
✅ **Quick Rollback** - One command to restore previous version
✅ **Error Handling** - Scripts stop on first error (using `&&` chaining)
✅ **Visual Feedback** - Emoji indicators show progress
✅ **Manual Cleanup** - Old builds kept until you explicitly remove them

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
3. **Test builds locally** before deploying to production
4. **Monitor logs** during and after deployment (`npm run pm2:logs`)
5. **Keep PM2 updated:** `npm update -g pm2`
6. **Use PM2 ecosystem file** for consistent configuration
7. **Set up health checks** if using load balancer
8. **Use JSDoc type annotations** for type safety without TypeScript compilation
9. **Always ensure `.env` file exists** before starting PM2

## References

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2 Cluster Mode](https://pm2.keymetrics.io/docs/usage/cluster-mode/)
- [PM2 Deployment](https://pm2.keymetrics.io/docs/usage/deployment/)
