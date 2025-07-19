# Automatic Server Restart Setup

This document explains how to set up automatic server restart on your remote server.

## Prerequisites

1. The `restart-server.sh` script must be copied to your server
2. Update the script with correct paths for your server environment
3. Set proper permissions: `chmod +x restart-server.sh`

## Method 1: Webhook Trigger (Recommended)

### Setup

1. Set the `RESTART_TOKEN` environment variable on your server:
   ```bash
   export RESTART_TOKEN="your-very-secure-token-here"
   ```

2. Add it to your `.env` file:
   ```
   RESTART_TOKEN=your-very-secure-token-here
   ```

### Usage

Trigger a restart from anywhere using curl:

```bash
curl -X POST https://your-domain.com/api/restart-server \
  -H "Authorization: Bearer your-very-secure-token-here"
```

### GitHub Actions Integration

Add this to your `.github/workflows/deploy.yml`:

```yaml
name: Deploy and Restart

on:
  push:
    branches: [ master ]

jobs:
  restart-server:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger server restart
        run: |
          curl -X POST ${{ secrets.SERVER_URL }}/api/restart-server \
            -H "Authorization: Bearer ${{ secrets.RESTART_TOKEN }}"
```

## Method 2: Cron Job

For scheduled restarts, add to crontab:

```bash
# Edit crontab
crontab -e

# Restart every day at 3 AM
0 3 * * * /home/ubuntu/ok_web_frontend_global/restart-server.sh >> /home/ubuntu/ok_web_frontend_global/logs/cron-restart.log 2>&1

# Restart every 6 hours
0 */6 * * * /home/ubuntu/ok_web_frontend_global/restart-server.sh >> /home/ubuntu/ok_web_frontend_global/logs/cron-restart.log 2>&1
```

## Method 3: Git Hook

Create a post-receive hook in your git repository:

```bash
#!/bin/bash
# File: /path/to/repo.git/hooks/post-receive

echo "Received push, restarting server..."
/home/ubuntu/ok_web_frontend_global/restart-server.sh
```

## Method 4: File Watcher

Use `inotifywait` to watch for changes:

```bash
#!/bin/bash
# watch-and-restart.sh

while true; do
  inotifywait -e modify,create,delete -r /home/ubuntu/ok_web_frontend_global/src
  echo "Changes detected, restarting server..."
  /home/ubuntu/ok_web_frontend_global/restart-server.sh
  sleep 10  # Prevent rapid restarts
done
```

## Method 5: Systemd Service

Create a systemd service with automatic restart:

```ini
# /etc/systemd/system/ok-web-frontend.service

[Unit]
Description=OK Web Frontend
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/ok_web_frontend_global
ExecStart=/usr/bin/npm run start
Restart=always
RestartSec=10
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

Enable and manage:
```bash
sudo systemctl enable ok-web-frontend
sudo systemctl start ok-web-frontend
sudo systemctl restart ok-web-frontend
```

## Security Considerations

1. **Always use strong tokens** for webhook authentication
2. **Restrict access** to the restart endpoint by IP if possible
3. **Monitor logs** for unauthorized restart attempts
4. **Use HTTPS** for webhook endpoints
5. **Rotate tokens** regularly

## Monitoring

Check restart logs:
```bash
# View latest restart log
ls -la ~/ok_web_frontend_global/logs/restart-*.log | tail -1 | xargs cat

# Monitor in real-time
tail -f ~/ok_web_frontend_global/logs/restart-*.log
```

## Troubleshooting

1. **Script not found**: Check paths in the script
2. **Permission denied**: Ensure script is executable
3. **Port already in use**: The script handles this, but check `lsof -i:3001`
4. **Build fails**: Check npm and node versions
5. **Neo4j not starting**: Check Neo4j logs separately