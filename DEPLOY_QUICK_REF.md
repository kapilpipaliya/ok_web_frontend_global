# Deployment Quick Reference

## 🚀 Deploy New Version

```bash
npm run deploy
```

**What happens:**
- Pulls latest code
- Installs dependencies
- Builds to `.output-new`
- Validates build
- Backs up current to `.output-old`
- Swaps new build to `.output`
- Reloads PM2 (zero downtime)

**Output:**
```
🚀 Starting deployment...
🔨 Starting temporary build...
✅ Temporary build created in .output-new
🔄 Swapping builds...
✅ Build swapped successfully
📦 Old build saved in .output-old for rollback
🔄 Reloading PM2...
✅ PM2 reload complete
✅ Deployment complete! Run "npm run cleanup:build" to remove old build.
```

---

## ⏪ Rollback to Previous Version

```bash
npm run deploy:rollback
```

**What happens:**
- Restores `.output-old` to `.output`
- Reloads PM2

**Output:**
```
⏪ Starting rollback...
⏪ Rolling back to previous build...
✅ Rolled back to previous build successfully
🔄 Reloading PM2...
✅ PM2 reload complete
✅ Rollback complete!
```

---

## 🧹 Clean Up After Successful Deployment

```bash
npm run cleanup:build
```

**⚠️ Warning:** You cannot rollback after cleanup!

**Output:**
```
🧹 Cleaning up old builds...
✅ Cleanup complete
```

---

## 📊 Check Status

```bash
npm run pm2:status
```

Shows running instances, memory usage, uptime, etc.

---

## 📝 View Logs

```bash
npm run pm2:logs
```

Real-time log streaming. Press Ctrl+C to exit.

---

## 🔧 Advanced Operations

### Test Build Before Deploying

```bash
# Build to temporary directory
npm run build:temp

# Inspect .output-new before swapping
ls -la .output-new/

# When satisfied, manually swap
npm run swap:build
npm run pm2:reload
```

### Hard Restart (Brief Downtime)

```bash
npm run pm2:restart
```

### Stop Application

```bash
npm run pm2:stop
```

### Monitor Resources

```bash
npm run pm2:monit
```

---

## 🆘 Emergency Procedures

### Application Crashed After Deploy

```bash
# Immediate rollback
npm run deploy:rollback

# Check what went wrong
npm run pm2:logs
```

### Build Failed During Deploy

- The current build stays active
- Fix the code
- Run `npm run deploy` again

### Cannot Start PM2

```bash
# Delete and restart
pm2 delete ok-web-frontend
npm run pm2:start
```

---

## 📂 Build Directory Structure

```
.output/          ← Current production build (PM2 runs this)
.output-new/      ← New build being prepared (temporary)
.output-old/      ← Previous build (backup for rollback)
```

**Safety:** Old build always exists until you run `cleanup:build`

---

## ✅ Safety Features

- Build validation before swap
- Automatic backup before deployment
- Zero-downtime PM2 reload
- One-command rollback
- Error handling stops on failure

---

## 📖 Full Documentation

See `DEPLOYMENT.md` for complete documentation.
