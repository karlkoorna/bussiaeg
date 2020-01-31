#!/bin/bash

# Ensure all children are killed.
trap 'kill -SIGTERM $(jobs -p %1)' SIGINT

# Start all modules...
if [[ $1 ]]; then # in development mode.
	export NODE_ENV=development
	
	# Start API and Web.
	cd api && npm run develop & cd web && npm start
else # in production mode.
	export NODE_ENV=production
	
	# Build client if needed.
	if [[ ! -e "web/build/" ]]; then
		cd web/
		npm run build
		rm build/*-manifest.*
		rm build/service-worker.js
		find build/** -type f | xargs -I{} brotli -Z {}
		cd ..
	fi
	
	# Start API.
	cd api && npm start && npm start && npm start
fi
