# Zero-Downtime Deployment Guide

This guide explains how to deploy updates without taking your application offline.

## Quick Start

### First Time Setup

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Build and start the application:**
   ```bash
   npm run build
   npm run pm2:start
   ```

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
1. Pull latest code from git
2. Install dependencies
3. Build the application
4. Gracefully reload PM2 instances (zero downtime)

**OR** manually step-by-step:

```bash
git pull
npm install --force
npm run build
npm run pm2:reload
```

## PM2 Commands

### Basic Operations

- **Start app:** `npm run pm2:start`
- **Stop app:** `npm run pm2:stop`
- **Restart app (brief downtime):** `npm run pm2:restart`
- **Reload app (zero downtime):** `npm run pm2:reload`
- **Delete from PM2:** `npm run pm2:delete`

### Monitoring

- **View logs:** `npm run pm2:logs`
- **Monitor resources:** `npm run pm2:monit`
- **View status:** `pm2 status`
- **View detailed info:** `pm2 show ok-web-frontend`

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

### App Won't Start
```bash
# Check logs
pm2 logs ok-web-frontend

# Check if port is in use
lsof -i :3001

# Try deleting and restarting
pm2 delete ok-web-frontend
npm run pm2:start
```

### Memory Issues
```bash
# Monitor memory usage
pm2 monit

# Lower max_memory_restart in ecosystem.config.cjs
# Or increase instances to distribute load
```

### Reload Not Working
```bash
# Use restart instead (brief downtime)
pm2 restart ok-web-frontend

# Or fully restart PM2
pm2 kill
pm2 start ecosystem.config.cjs
```

## Production Checklist

- [ ] PM2 installed globally
- [ ] Ecosystem config set to 2+ instances
- [ ] PM2 startup script configured for auto-restart
- [ ] Logs directory exists: `mkdir -p logs`
- [ ] Environment variables loaded correctly
- [ ] Test reload command before production use
- [ ] Monitor memory usage after deployment
- [ ] Set up PM2 keymetrics for monitoring (optional)

## Best Practices

1. **Always use `pm2 reload` for zero downtime** (not `restart`)
2. **Run at least 2 instances** to enable graceful reload
3. **Test builds locally** before deploying to production
4. **Monitor logs** during and after deployment
5. **Keep PM2 updated:** `npm update -g pm2`
6. **Use PM2 ecosystem file** for consistent configuration
7. **Set up health checks** if using load balancer

## References

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [PM2 Cluster Mode](https://pm2.keymetrics.io/docs/usage/cluster-mode/)
- [PM2 Deployment](https://pm2.keymetrics.io/docs/usage/deployment/)
