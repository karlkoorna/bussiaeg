#!/bin/bash

# Ensure all children are killed.
trap 'kill -SIGTERM $(jobs -p %1)' SIGINT

# Start all modules...
if [[ $1 ]]; then # in development mode.
	export NODE_ENV=development
	
	cd api && npm run develop &
	cd web && npm start
else # in production mode.
	export NODE_ENV=production
	
	# Build client if needed.
	if [[ ! -e "web/build/" ]]; then
		npm run build
		rm web/build/*-manifest.*
		rm web/build/service-worker.js
		find build/** -type f | xargs -I{} brotli -Z {}
	fi
	
	# Start server.
	cd api && npm start && npm start && npm start
fi
