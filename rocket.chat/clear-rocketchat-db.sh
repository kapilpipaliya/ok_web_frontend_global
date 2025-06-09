#!/bin/bash

# Rocket.Chat Database Clear Script
# This script thoroughly clears all Rocket.Chat data from MongoDB

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}WARNING: This will DELETE ALL ROCKET.CHAT DATA!${NC}"
echo ""
read -p "Type 'yes' to confirm: " -r
echo ""

if [[ "$REPLY" != "yes" ]]; then
    echo "Cancelled."
    exit 0
fi

# Stop Rocket.Chat
echo -e "${YELLOW}Stopping Rocket.Chat...${NC}"
sudo systemctl stop rocketchat 2>/dev/null || true

# Ensure MongoDB is running
echo -e "${YELLOW}Ensuring MongoDB is running...${NC}"
sudo systemctl start mongod
sleep 3

# Get MongoDB shell command
if command -v mongosh &> /dev/null; then
    MONGO_CMD="mongosh"
else
    MONGO_CMD="mongo"
fi

echo -e "${YELLOW}Using MongoDB command: $MONGO_CMD${NC}"

# List databases before
echo -e "${YELLOW}Databases before clearing:${NC}"
$MONGO_CMD --quiet --eval "db.adminCommand('listDatabases').databases.forEach(function(db){print(db.name)})" | grep -i rocket || echo "No Rocket.Chat databases found"

# Drop rocketchat database
echo -e "${YELLOW}Dropping rocketchat database...${NC}"
$MONGO_CMD rocketchat --quiet --eval "db.dropDatabase()" || true

# Drop all collections individually if database drop failed
echo -e "${YELLOW}Force dropping all collections...${NC}"
$MONGO_CMD rocketchat --quiet --eval "
db.getCollectionNames().forEach(function(c) {
    if (c.indexOf('system.') !== 0) {
        db[c].drop();
        print('Dropped: ' + c);
    }
});
" || true

# Drop other possible Rocket.Chat databases
for db in rocketchat_cache rocketchat_files rocketchat_avatars; do
    echo -e "${YELLOW}Dropping $db database...${NC}"
    $MONGO_CMD $db --quiet --eval "db.dropDatabase()" 2>/dev/null || true
done

# Clear GridFS
echo -e "${YELLOW}Clearing GridFS collections...${NC}"
$MONGO_CMD rocketchat --quiet --eval "
try { db.getCollection('rocketchat_uploads.files').drop(); } catch(e) {}
try { db.getCollection('rocketchat_uploads.chunks').drop(); } catch(e) {}
try { db.getCollection('fs.files').drop(); } catch(e) {}
try { db.getCollection('fs.chunks').drop(); } catch(e) {}
" || true

# Clear file uploads directory
if [[ -d "/opt/Rocket.Chat/uploads" ]]; then
    echo -e "${YELLOW}Clearing upload directory...${NC}"
    sudo rm -rf /opt/Rocket.Chat/uploads/*
fi

# List databases after
echo -e "${YELLOW}Databases after clearing:${NC}"
$MONGO_CMD --quiet --eval "db.adminCommand('listDatabases').databases.forEach(function(db){print(db.name)})" | grep -i rocket || echo -e "${GREEN}All Rocket.Chat databases cleared!${NC}"

echo ""
echo -e "${GREEN}Database clearing complete!${NC}"
echo ""
echo "You can now:"
echo "1. Start Rocket.Chat: sudo systemctl start rocketchat"
echo "2. Or run a fresh install: sudo bash rocketchat-setup-script.sh --fresh"