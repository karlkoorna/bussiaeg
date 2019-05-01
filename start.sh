#!/bin/bash

# Kill old processes.
killall caddy
killall node

# Start server.
ulimit -n 8192
if [ $1 ]; then
	export NODE_ENV=development
	caddy -conf Caddydev &
	cd api && npm start:dev &
	cd web && npm start
else
	export NODE_ENV=production
	caddy -conf Caddypro &
	cd api && npm start
fi
