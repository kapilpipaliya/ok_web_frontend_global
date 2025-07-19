#!/bin/bash

# Server restart script for ok_web_frontend_global
# This script stops the running app, pulls latest code, rebuilds, and restarts

# Configuration
APP_DIR="$HOME/ok_web_frontend_global"
LOG_DIR="$APP_DIR/logs"
LOG_FILE="$LOG_DIR/restart-$(date +%Y%m%d-%H%M%S).log"
PID_FILE="$APP_DIR/.app.pid"
NEO4J_DIR="$HOME/dozerdb-5.26.3.0"

# Create logs directory if it doesn't exist
mkdir -p "$LOG_DIR"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to kill process by port
kill_process_on_port() {
    local port=$1
    local pid=$(lsof -ti:$port)
    if [ ! -z "$pid" ]; then
        log "Killing process $pid on port $port"
        kill -9 $pid
        sleep 2
    fi
}

log "========== Starting server restart =========="

# Step 1: Stop the running application
log "Stopping application..."

# Kill process on port 3001 (the app port)
kill_process_on_port 3001

# Also try to kill by process name
pkill -f "vinxi start" || true
pkill -f "node.*vinxi" || true

# If PID file exists, try to kill that process
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        log "Killing process from PID file: $OLD_PID"
        kill -9 $OLD_PID || true
    fi
    rm -f "$PID_FILE"
fi

log "Application stopped"

# Step 2: Change to app directory
cd "$APP_DIR" || {
    log "ERROR: Cannot change to app directory: $APP_DIR"
    exit 1
}

# Step 3: Pull latest code
log "Pulling latest code from git..."
git pull origin master >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
    log "WARNING: Git pull failed, continuing anyway..."
fi

# Step 4: Install dependencies
log "Installing dependencies..."
npm install --force >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
    log "ERROR: npm install failed"
    exit 1
fi

# Step 5: Build the application
log "Building application..."
npm run build >> "$LOG_FILE" 2>&1
if [ $? -ne 0 ]; then
    log "ERROR: Build failed"
    exit 1
fi

# Step 6: Ensure Neo4j is running
log "Checking Neo4j status..."
if ! pgrep -f "neo4j" > /dev/null; then
    log "Starting Neo4j..."
    cd "$NEO4J_DIR"
    ./bin/neo4j start >> "$LOG_FILE" 2>&1
    sleep 5
fi

# Step 7: Start the application
log "Starting application..."
cd "$APP_DIR"

# Start the app in background and save PID
nohup npm run start >> "$LOG_FILE" 2>&1 &
APP_PID=$!
echo $APP_PID > "$PID_FILE"

log "Application started with PID: $APP_PID"

# Wait a bit and check if the process is still running
sleep 5
if ps -p $APP_PID > /dev/null; then
    log "Application successfully started and running"
    
    # Check if port 3001 is listening
    if lsof -i:3001 > /dev/null 2>&1; then
        log "Application is listening on port 3001"
    else
        log "WARNING: Application started but not listening on port 3001 yet"
    fi
else
    log "ERROR: Application failed to start"
    exit 1
fi

log "========== Server restart completed =========="
log "Log file: $LOG_FILE"