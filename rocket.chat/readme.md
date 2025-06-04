Key Features:

Pre-flight Checks

Verifies Node.js is installed and version 14+
Ensures script is run with sudo privileges

MongoDB Installation

Installs MongoDB 5.0 (required for Rocket.Chat)
Configures replica set for oplog tailing
Starts and enables MongoDB service

Rocket.Chat Installation

Downloads latest Rocket.Chat release
Creates dedicated system user
Installs all dependencies
Sets up proper file permissions

Web Server Setup

Installs and configures Nginx as reverse proxy
Optional SSL setup with Let's Encrypt
Configures WebSocket support

System Configuration

Creates systemd service for auto-start
Configures firewall rules (if UFW is installed)
Sets up proper environment variables

chmod +x install-rocketchat.sh
sudo ./install-rocketchat.sh

Post-Installation:
After installation completes:

Access Rocket.Chat at http://your-server-ip:3000 (or your domain)
Complete the setup wizard
Create your admin account
Enable Omnichannel for live chat features

Customization Options:
You can modify these variables in the script:

ROCKETCHAT_VERSION: Specific version instead of "latest"
INSTALL_DIR: Change installation directory
MONGO_VERSION: Different MongoDB version
PORT: Change default port (3000)

The script includes error handling, colored output for better readability, and comprehensive logging. It will also provide useful commands for managing your Rocket.Chat installation after setup is complete.
Would you like me to add any additional features to the script, such as backup configuration or automatic updates?
