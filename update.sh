#!/bin/bash

# Kill processes.
killall node
killall caddy

# Pull updates.
git reset --hard origin/master
git pull

# Resolve packages.
cd api && npm install && cd ..
cd web && npm install && npm run build && cd ..
rm -rf {api,web}/package-lock.json
