# HTTPS Setup Guide

This project is configured to run with HTTPS in development mode using `mkcert`.

## How It Works

The project uses `vite-plugin-mkcert` which automatically generates and manages trusted SSL certificates for local development. The certificates are trusted by your system, so you won't see any browser security warnings.

## Prerequisites

### macOS (one-time setup)

1. **Install mkcert** (if not already installed):
   ```bash
   brew install mkcert
   ```

2. **Install the root certificate authority**:
   ```bash
   mkcert -install
   ```
   This will ask for your system password. This is a one-time setup that makes all mkcert-generated certificates trusted by your system.

### Linux

```bash
# Install mkcert
sudo apt install mkcert  # Debian/Ubuntu
# or
sudo pacman -S mkcert    # Arch

# Install root CA
mkcert -install
```

### Windows

```bash
# Install using Chocolatey
choco install mkcert

# Install root CA
mkcert -install
```

## Configuration

The HTTPS configuration is in `app.config.ts`:

```typescript
import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  server: {
    https: true,
  },
  vite: {
    server: {
      https: true,
    },
    plugins: [
      mkcert(),
    ],
  },
})
```

## Running the Development Server

Start the development server as usual:

```bash
npm run dev
```

The server will now be accessible at:
- **HTTPS**: `https://localhost:3001`
- **With subdomains**: `https://ytorganizer.localhost.com:3001`
- **Any subdomain**: `https://[subdomain].localhost.com:3001`

## Features

- **No browser warnings**: Certificates are trusted by your system
- **Automatic certificate generation**: `vite-plugin-mkcert` handles everything
- **Wildcard support**: Works with any subdomain automatically
- **Hot Module Replacement (HMR)**: Works over secure WebSocket (wss)
- **One-time setup**: After installing mkcert, it works for all your projects

## Production Setup

For production deployment, you should use proper SSL certificates from a trusted Certificate Authority (CA) like Let's Encrypt. The commented section in `app.config.ts` shows an example configuration for production certificates:

```typescript
// Production HTTPS example (commented out in app.config.ts)
// server: {
//   https: {
//     cert: "/etc/letsencrypt/live/yourdomain.com/fullchain.pem",
//     key: "/etc/letsencrypt/live/yourdomain.com/privkey.pem",
//   },
// }
```

## Troubleshooting

### "Command failed: mkcert -CAROOT"
This error means `mkcert` is not installed on your system.

**Solution:**
```bash
# macOS
brew install mkcert
mkcert -install

# Linux
sudo apt install mkcert  # or your package manager
mkcert -install

# Windows
choco install mkcert
mkcert -install
```

### "failed to execute security add-trusted-cert"
This means `mkcert -install` needs your system password.

**Solution:** Run the command manually in your terminal (not through npm):
```bash
mkcert -install
```
Enter your system password when prompted.

### Browser Still Shows Security Warning
If you're seeing certificate warnings after installing mkcert:

1. **Verify mkcert is installed:**
   ```bash
   mkcert -CAROOT
   ```
   Should show a directory path (not an error)

2. **Reinstall the root CA:**
   ```bash
   mkcert -install
   ```

3. **Restart your browser completely** (close all windows)

4. **Clear browser SSL state:**
   - Chrome/Edge: `chrome://net-internals/#sockets` → "Flush socket pools"
   - Firefox: Close and restart
   - Safari: Clear cache from Develop menu

### Port Already in Use
If port 3001 is already in use, you can change it in `package.json`:
```json
"dev": "vinxi dev --host --port 3002"
```

### Certificate Not Working for New Team Members
Each developer needs to run the one-time setup:
```bash
brew install mkcert    # or their OS equivalent
mkcert -install
```
Then the dev server will work with HTTPS automatically.

## Notes

- **Development only**: mkcert certificates are for local development, not production
- **Automatic management**: Certificates are automatically generated and renewed by mkcert
- **System trust**: Certificates are trusted by your operating system and all browsers
- **Team setup**: Each developer needs to install mkcert once (one-time setup)
- **No git commits**: mkcert stores certificates in your home directory, not in the project
- **Works everywhere**: After setup, works for all local development projects using mkcert
