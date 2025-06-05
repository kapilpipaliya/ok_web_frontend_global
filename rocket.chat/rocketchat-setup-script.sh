#!/bin/bash

# Rocket.Chat Installation Script for Ubuntu
# Run with: sudo bash install-rocketchat.sh

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (use sudo)"
   exit 1
fi

# Variables
ROCKETCHAT_VERSION="latest"
INSTALL_DIR="/opt/Rocket.Chat"
SERVICE_USER="rocketchat"
MONGO_VERSION="8.0"
DOMAIN=""
EMAIL=""
NODE_PATH=""
NPM_PATH=""

# Check if running fix mode
if [[ "$1" == "--fix" ]] || [[ "$1" == "-f" ]]; then
    FIX_MODE=true
else
    FIX_MODE=false
fi

# Function to get user input
get_user_input() {
    read -p "Enter your domain name (e.g., chat.example.com) or press Enter to skip SSL setup: " DOMAIN
    if [[ ! -z "$DOMAIN" ]]; then
        read -p "Enter your email for SSL certificate: " EMAIL
    fi
}

# Check and install Node.js if needed
check_nodejs() {
    if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
        print_warning "Node.js or npm is not installed. Installing Node.js and npm..."
        install_nodejs
    else
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ $NODE_VERSION -lt 14 ]]; then
            print_warning "Node.js version is too old (v$NODE_VERSION). Installing newer version..."
            install_nodejs
        else
            print_status "Node.js is already installed (v$(node -v))"
            # Check if npm is available
            if ! command -v npm &> /dev/null; then
                print_warning "npm is not found. Installing npm..."
                apt-get install -y npm
            fi
        fi
    fi
    get_node_paths
}

# Install Node.js
install_nodejs() {
    print_status "Installing Node.js 20.x..."
    
    # Update package list first
    apt-get update
    
    # Install required packages for Node.js installation
    apt-get install -y ca-certificates curl gnupg
    
    # Create directory for apt keyrings
    mkdir -p /etc/apt/keyrings
    
    # Download and install NodeSource GPG key
    curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg
    
    # Add NodeSource repository
    NODE_MAJOR=20
    echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list
    
    # Update package list with new repository
    apt-get update
    
    # Install Node.js (includes npm)
    apt-get install -y nodejs
    
    # Verify installation
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        print_status "Node.js installed successfully (v$(node -v))"
        print_status "npm installed successfully (v$(npm -v))"
    else
        print_error "Failed to install Node.js or npm"
        exit 1
    fi
}

# Get Node.js and npm paths
get_node_paths() {
    if command -v node &> /dev/null; then
        NODE_PATH=$(which node)
        print_status "Using Node.js from: $NODE_PATH"
    else
        print_error "Node.js not found in PATH"
        exit 1
    fi
    
    if command -v npm &> /dev/null; then
        NPM_PATH=$(which npm)
        print_status "Using npm from: $NPM_PATH"
    else
        print_error "npm not found in PATH"
        exit 1
    fi
}

# Install MongoDB
install_mongodb() {
    print_status "Installing MongoDB ${MONGO_VERSION}..."
    
    # Import MongoDB public GPG key
    wget -qO - https://www.mongodb.org/static/pgp/server-${MONGO_VERSION}.asc | apt-key add -
    
    # Add MongoDB repository
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/${MONGO_VERSION} multiverse" | tee /etc/apt/sources.list.d/mongodb-org-${MONGO_VERSION}.list
    
    # Update package list
    apt-get update
    
    # Install MongoDB
    apt-get install -y mongodb-org
    
    # Start and enable MongoDB
    systemctl start mongod
    systemctl enable mongod
    
    print_status "MongoDB installed and started"
}

# Configure MongoDB Replica Set
configure_mongodb() {
    print_status "Configuring MongoDB replica set..."
    
    # Add replica set configuration to mongod.conf
    if ! grep -q "replSetName" /etc/mongod.conf; then
        echo -e "\nreplication:\n  replSetName: rs01" >> /etc/mongod.conf
    fi
    
    # Restart MongoDB
    systemctl restart mongod
    sleep 10
    
    # Check if replica set is already initialized
    if mongosh --eval "rs.status().ok" 2>/dev/null | grep -q "1"; then
        print_status "MongoDB replica set already initialized"
    else
        # Initialize replica set using mongosh (mongo is deprecated)
        print_status "Initializing MongoDB replica set..."
        mongosh --eval "rs.initiate()" || mongo --eval "rs.initiate()" || true
        sleep 5
        
        # Verify replica set initialization
        if mongosh --eval "rs.status().ok" 2>/dev/null | grep -q "1"; then
            print_status "MongoDB replica set initialized successfully"
        else
            print_warning "MongoDB replica set initialization may have failed. Check manually with: mongosh --eval 'rs.status()'"
        fi
    fi
    
    print_status "MongoDB replica set configured"
}

# Install dependencies
install_dependencies() {
    print_status "Installing system dependencies..."
    apt-get install -y \
        curl \
        graphicsmagick \
        build-essential \
        git \
        python3 \
        gcc \
        g++ \
        make
    
    print_status "Dependencies installed"
}

# Create Rocket.Chat user
create_user() {
    print_status "Creating Rocket.Chat user..."
    if ! id -u $SERVICE_USER > /dev/null 2>&1; then
        useradd -m -U -r -s /bin/bash $SERVICE_USER
    fi
    print_status "User created/verified"
}

# Download and install Rocket.Chat
install_rocketchat() {
    print_status "Downloading Rocket.Chat..."
    
    # Stop Rocket.Chat service if running
    systemctl stop rocketchat 2>/dev/null || true
    
    # Clean installation directory
    print_status "Cleaning installation directory..."
    rm -rf $INSTALL_DIR/*
    mkdir -p $INSTALL_DIR
    chown $SERVICE_USER:$SERVICE_USER $INSTALL_DIR
    
    # Download latest release
    su - $SERVICE_USER -c "curl -L https://releases.rocket.chat/latest/download -o /tmp/rocket.chat.tgz"
    
    print_status "Extracting Rocket.Chat..."
    su - $SERVICE_USER -c "tar -xzf /tmp/rocket.chat.tgz -C /tmp"
    
    # Copy to installation directory (using cp instead of mv to avoid conflicts)
    print_status "Installing Rocket.Chat files..."
    cp -rf /tmp/bundle/* $INSTALL_DIR/
    chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR
    
    # Clean up temporary files
    rm -rf /tmp/bundle /tmp/rocket.chat.tgz
    
    print_status "Installing Rocket.Chat dependencies..."
    cd $INSTALL_DIR/programs/server
    
    # Ensure npm is available before using it
    if ! command -v npm &> /dev/null; then
        print_error "npm is not available. Please run the script again to install Node.js and npm first."
        exit 1
    fi
    
    # Install dependencies
    su - $SERVICE_USER -c "cd $INSTALL_DIR/programs/server && $NPM_PATH install"
    
    # Fix Sharp module for ARM64 architecture if needed
    ARCH=$(uname -m)
    if [[ "$ARCH" == "aarch64" ]] || [[ "$ARCH" == "arm64" ]]; then
        print_status "Detected ARM64 architecture. Installing sharp module with platform-specific build..."
        # Ensure correct permissions before installing
        chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR
        # Install sharp module with proper permissions
        su - $SERVICE_USER -c "cd $INSTALL_DIR/programs/server && $NPM_PATH install --os=linux --cpu=arm64 sharp" || {
            print_warning "Failed to install sharp as $SERVICE_USER. Attempting with elevated permissions..."
            cd $INSTALL_DIR/programs/server
            npm install --os=linux --cpu=arm64 sharp
            chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR
        }
    fi
    
    print_status "Rocket.Chat installed"
}

# Create systemd service
create_service() {
    print_status "Creating systemd service..."
    
    cat > /etc/systemd/system/rocketchat.service << EOF
[Unit]
Description=Rocket.Chat server
After=network.target remote-fs.target nss-lookup.target mongod.service

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
StandardOutput=journal
StandardError=journal
SyslogIdentifier=rocketchat
WorkingDirectory=$INSTALL_DIR
ExecStart=$NODE_PATH $INSTALL_DIR/main.js
Restart=always
RestartSec=10
Environment=MONGO_URL=mongodb://localhost:27017/rocketchat?replicaSet=rs01
Environment=MONGO_OPLOG_URL=mongodb://localhost:27017/local?replicaSet=rs01
Environment=ROOT_URL=http://localhost:4000
Environment=PORT=4000

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    print_status "Service file created"
}

# Install and configure Nginx
install_nginx() {
    print_status "Installing Nginx..."
    apt-get install -y nginx
    
    if [[ ! -z "$DOMAIN" ]]; then
        print_status "Configuring Nginx for domain: $DOMAIN"
        
        cat > /etc/nginx/sites-available/rocketchat << EOF
upstream rocketchat {
    server 127.0.0.1:4000;
}

server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://rocketchat;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$http_host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Frame-Options SAMEORIGIN;
        proxy_read_timeout 86400;
    }
}
EOF

        ln -sf /etc/nginx/sites-available/rocketchat /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        
        nginx -t
        systemctl restart nginx
        systemctl enable nginx
        
        print_status "Nginx configured"
    fi
}

# Setup SSL with Let's Encrypt
setup_ssl() {
    if [[ ! -z "$DOMAIN" ]] && [[ ! -z "$EMAIL" ]]; then
        print_status "Setting up SSL certificate..."
        
        # Install Certbot
        apt-get install -y certbot python3-certbot-nginx
        
        # Obtain certificate
        certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect
        
        # Update ROOT_URL in systemd service
        sed -i "s|Environment=ROOT_URL=.*|Environment=ROOT_URL=https://$DOMAIN|g" /etc/systemd/system/rocketchat.service
        systemctl daemon-reload
        
        print_status "SSL certificate installed"
    fi
}

# Configure firewall
configure_firewall() {
    print_status "Configuring firewall..."
    
    if command -v ufw &> /dev/null; then
        ufw allow 22/tcp
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 4000/tcp
        print_status "Firewall rules added"
    else
        print_warning "UFW not installed, skipping firewall configuration"
    fi
}

# Start Rocket.Chat
start_rocketchat() {
    print_status "Starting Rocket.Chat service..."
    systemctl start rocketchat
    systemctl enable rocketchat
    
    print_status "Waiting for Rocket.Chat to start (this may take a minute)..."
    sleep 30
    
    if systemctl is-active --quiet rocketchat; then
        print_status "Rocket.Chat is running!"
    else
        print_error "Rocket.Chat failed to start. Check logs with: journalctl -u rocketchat -f"
    fi
}

# Fix existing installation issues
fix_existing_installation() {
    print_status "Checking for common installation issues..."
    
    # Fix MongoDB replica set if needed
    if systemctl is-active --quiet mongod; then
        if ! mongosh --eval "rs.status().ok" 2>/dev/null | grep -q "1"; then
            print_warning "MongoDB replica set not initialized. Fixing..."
            mongosh --eval "rs.initiate()" || mongo --eval "rs.initiate()" || true
            sleep 5
        fi
    fi
    
    # Fix Sharp module for ARM64 if needed
    if [[ -d "$INSTALL_DIR/programs/server" ]]; then
        ARCH=$(uname -m)
        if [[ "$ARCH" == "aarch64" ]] || [[ "$ARCH" == "arm64" ]]; then
            if systemctl is-active --quiet rocketchat && journalctl -u rocketchat -n 50 | grep -q "Could not load the \"sharp\" module"; then
                print_warning "Sharp module issue detected on ARM64. Attempting to fix..."
                systemctl stop rocketchat
                
                # Fix permissions first
                print_status "Fixing file permissions..."
                chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR
                
                # Try to install sharp module
                su - $SERVICE_USER -c "cd $INSTALL_DIR/programs/server && npm install --os=linux --cpu=arm64 sharp" || {
                    print_warning "Failed to install as $SERVICE_USER. Trying with elevated permissions..."
                    cd $INSTALL_DIR/programs/server
                    npm install --os=linux --cpu=arm64 sharp
                    chown -R $SERVICE_USER:$SERVICE_USER $INSTALL_DIR
                }
                
                systemctl start rocketchat
                sleep 10
                if systemctl is-active --quiet rocketchat; then
                    print_status "Sharp module fixed successfully!"
                    return 0
                else
                    print_error "Rocket.Chat still failing. Check logs with: journalctl -u rocketchat -f"
                fi
            fi
        fi
    fi
}

# Check for existing installation
check_existing_installation() {
    if systemctl is-active --quiet rocketchat 2>/dev/null; then
        print_warning "Rocket.Chat service is currently running!"
        echo ""
        echo "Choose an option:"
        echo "1) Fix existing installation issues"
        echo "2) Reinstall Rocket.Chat (preserves database)"
        echo "3) Cancel"
        echo ""
        read -p "Enter your choice (1-3): " -r
        echo ""
        case $REPLY in
            1)
                fix_existing_installation
                print_status "Fix attempt completed. Check service status with: systemctl status rocketchat"
                exit 0
                ;;
            2)
                echo "This will:"
                echo "  - Stop the current Rocket.Chat service"
                echo "  - Remove all application files in $INSTALL_DIR"
                echo "  - Reinstall Rocket.Chat with latest version"
                echo "  - Preserve your database data and messages"
                echo ""
                read -p "Continue with reinstallation? (y/N): " -n 1 -r
                echo ""
                if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                    print_status "Installation cancelled by user"
                    exit 0
                fi
                ;;
            *)
                print_status "Installation cancelled by user"
                exit 0
                ;;
        esac
    elif [[ -d "$INSTALL_DIR" && "$(ls -A $INSTALL_DIR 2>/dev/null)" ]]; then
        print_warning "Existing Rocket.Chat installation found in $INSTALL_DIR"
        echo "This script will remove all files and reinstall Rocket.Chat."
        echo ""
        read -p "Do you want to continue? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Installation cancelled by user"
            exit 0
        fi
    fi
}

# Main installation function
main() {
    clear
    echo "======================================"
    echo "   Rocket.Chat Installation Script    "
    echo "======================================"
    echo ""
    
    # If running in fix mode, just run the fix function
    if [[ "$FIX_MODE" == true ]]; then
        print_status "Running in fix mode..."
        get_node_paths
        fix_existing_installation
        print_status "Fix completed. Check service status with: systemctl status rocketchat"
        exit 0
    fi
    
    get_user_input
    
    # Check for existing installation and warn user
    check_existing_installation
    
    print_status "Starting installation..."
    
    # Update system
    print_status "Updating system packages..."
    apt-get update
    apt-get upgrade -y
    
    # Installation steps
    check_nodejs
    install_dependencies
    install_mongodb
    configure_mongodb
    create_user
    install_rocketchat
    create_service
    # install_nginx
    configure_firewall
    start_rocketchat
    # setup_ssl
    
    echo ""
    echo "======================================"
    echo "   Installation Complete!             "
    echo "======================================"
    echo ""
    
    if [[ ! -z "$DOMAIN" ]]; then
        print_status "Rocket.Chat is accessible at: https://$DOMAIN"
    else
        print_status "Rocket.Chat is accessible at: http://$(hostname -I | awk '{print $1}'):4000"
    fi
    
    echo ""
    print_status "Default admin setup:"
    echo "  1. Navigate to your Rocket.Chat URL"
    echo "  2. Complete the setup wizard"
    echo "  3. Create your admin account"
    echo ""
    print_status "Useful commands:"
    echo "  - Check status: systemctl status rocketchat"
    echo "  - View logs: journalctl -u rocketchat -f"
    echo "  - Restart: systemctl restart rocketchat"
    echo "  - Stop: systemctl stop rocketchat"
    echo ""
    
    if [[ -z "$DOMAIN" ]]; then
        print_warning "No domain configured. To add SSL later:"
        echo "  1. Point your domain to this server"
        echo "  2. Run: certbot --nginx -d yourdomain.com"
        echo "  3. Update ROOT_URL in /etc/systemd/system/rocketchat.service"
        echo "  4. Restart Rocket.Chat: systemctl restart rocketchat"
    fi
}

# Run main function
main

# Trap errors
trap 'print_error "An error occurred during installation. Check the logs for details."' ERR