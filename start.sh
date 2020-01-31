#!/bin/bash

# Ensure all children are killed.
trap 'kill -SIGTERM $(jobs -p %1)' SIGINT

# Start all modules...
if [[ $1 ]]; then # in development mode.
	export NODE_ENV=development
	
	# Start api and web.
	cd api && yarn run develop & cd web && yarn start
else # in production mode.
	export NODE_ENV=production
	
	# Build client if needed.
	if [[ ! -e "web/build/" ]]; then
		cd web/
		yarn run build
		rm build/*-manifest.*
		rm build/service-worker.js
		find build/** -type f | xargs -I{} brotli -Z {}
		cd ..
	fi
	
	# Start api.
	cd api && yarn start && yarn start && yarn start
fi
