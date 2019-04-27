#!/bin/bash

# Kill old processes.
killall caddy
killall node

# Start server.
ulimit -n 8192
if [ $1 ]; then
	export NODE_ENV=development
	caddy -conf Caddydev &
	cd api && nodemon app.js --ext js,sql --color &
	cd web && npm start
else
	export NODE_ENV=production
	caddy -conf Caddypro &
	cd api && npm start --color
fi
