#!/bin/bash

export NODE_ENV=production

# Kill processes.
killall caddy
killall node

# Start server.
ulimit -n 8192
caddy -conf $(pwd)/Caddypro &
cd api && npm start
