#!/bin/bash

# Disable shell path expansion.
export MSYS_NO_PATHCONV=1

# Kill old processes.
killall caddy
killall node

# Start all modules...
ulimit -n 8192
if [ $1 ]; then # in development mode.
	export NODE_ENV=development
	
	if [ ! -f "tls.crt" ]; then
		openssl genrsa -out ca.key
		openssl genrsa -out tls.key
		
		openssl req -new -x509 -days 3650 -key ca.key -out ca.crt -subj "/CN=Bussiaeg.ee"
		openssl req -new -key tls.key -out tls.csr -subj "/CN=*.devaeg.ee"
		openssl x509 -req -days 3650 -CA ca.crt -CAkey ca.key -CAcreateserial -in tls.csr -out tls.crt -extfile tls.cfg
		
		rm ca.key
		rm ca.srl
		rm tls.srl
		rm tls.csr
	fi
	
	caddy -conf Caddydev &
	cd api && npm run develop &
	cd web && npm start
else # in production mode.
	export NODE_ENV=production
	
	caddy -conf Caddypro &
	cd api && npm start && npm start && npm start
fi
