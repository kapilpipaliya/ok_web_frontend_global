# Rocket.Chat Configuration Guide

## Current Setup

Your Rocket.Chat is configured to run on `https://rocket.decodeui.dev`

## Access Methods

1. **Primary (HTTPS)**: https://rocket.decodeui.dev
2. **Direct (HTTP)**: http://rocket.decodeui.dev:4000

## If Nginx is Not Redirecting Properly

Run the update script:
```bash
sudo bash /path/to/update-nginx-config.sh
```

## Manual Configuration Steps

If you need to manually configure or fix the setup:

### 1. Update Nginx Configuration

Edit `/etc/nginx/sites-available/rocketchat`:

```nginx
upstream rocketchat {
    server 127.0.0.1:4000;
}

server {
    listen 80;
    server_name rocket.decodeui.dev;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name rocket.decodeui.dev;
    
    # SSL certificates (managed by Certbot)
    ssl_certificate /etc/letsencrypt/live/rocket.decodeui.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/rocket.decodeui.dev/privkey.pem;
    
    location / {
        proxy_pass http://rocketchat;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Frame-Options SAMEORIGIN;
        proxy_read_timeout 86400;
    }
}
```

### 2. Ensure SSL Certificate

If SSL is not set up:
```bash
sudo certbot --nginx -d rocket.decodeui.dev
```

### 3. Update Rocket.Chat Service

Edit `/etc/systemd/system/rocketchat.service` and ensure:
```
Environment=ROOT_URL=https://rocket.decodeui.dev
Environment=PORT=4000
```

Then reload and restart:
```bash
sudo systemctl daemon-reload
sudo systemctl restart rocketchat
```

### 4. Firewall Rules

Ensure ports are open:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 4000/tcp
```

## Troubleshooting

### Check Service Status
```bash
sudo systemctl status rocketchat
sudo systemctl status nginx
```

### View Logs
```bash
sudo journalctl -u rocketchat -f
sudo tail -f /var/log/nginx/error.log
```

### Test Nginx Configuration
```bash
sudo nginx -t
```

### Restart Services
```bash
sudo systemctl restart rocketchat
sudo systemctl restart nginx
```

## Direct Access (Temporary)

If HTTPS is not working, you can temporarily access Rocket.Chat directly:
- http://YOUR_SERVER_IP:4000
- http://rocket.decodeui.dev:4000

Note: This bypasses Nginx and SSL, so it's not recommended for production use.