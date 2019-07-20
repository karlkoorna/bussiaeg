#!/bin/bash

# Kill old processes.
killall caddy
killall node

# Discard local changes and pull latest release from GitHub.
git reset --hard origin/master
git pull
if [ ! $1 ]; then
git checkout tags/$(curl -s https://api.github.com/repos/karlkoorna/bussiaeg/releases/latest | grep -oP '(?<="tag_name": ")([0-9.]*)')
fi

# Make scripts executable.
chmod +x update.sh
chmod +x start.sh

# Resolve module packages.
cd api && npm install && cd ..
cd web && npm install && npm run build && cd ..
rm -rf {api,web}/package-lock.json
