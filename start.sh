#!/bin/bash

export NODE_ENV=production

# Kill processes.
killall node
killall caddy

# Start servers.
cd web && npm run build && cd ..
cd api && npx forever start app.js & cd ..
caddy -conf Caddypro
