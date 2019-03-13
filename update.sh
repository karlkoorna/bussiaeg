#!/bin/bash

# Kill old processes.
killall caddy
killall node

# Discard local changes and pull updates from Git.
git reset --hard origin/master
git pull

# Make scripts executable.
chmod +x update.sh
chmod +x start.sh

# Resolve module packages.
cd api && npm install && cd ..
cd web && npm install && npm run build && cd ..
rm -rf {api,web}/package-lock.json
