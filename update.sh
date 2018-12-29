#!/bin/bash

# Kill processes.
killall caddy
killall node

# Pull updates.
git reset --hard origin/master
git pull

# Fix permissions
chmod +x update.sh
chmod +x start.sh

# Resolve packages.
cd api && npm install && cd ..
cd web && npm install && npm run build && cd ..
rm -rf {api,web}/package-lock.json
