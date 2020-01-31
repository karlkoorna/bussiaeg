#!/bin/bash

# Install node modules if missing.
[[ ! -e "api/node_modules" ]] && mkdir api/node_modules/ && (cd api/node_modules/ && yarn install)
[[ ! -e "web/node_modules" ]] && mkdir web/node_modules/ && (cd web/node_modules/ && yarn install)

if [[ $1 ]]; then # Development mode
	
	# Create certificate authority if missing.
	if [[ ! -e "ca.crt" ]]; then
		openssl genrsa -out ca.key
		
		MSYS_NO_PATHCONV=1 openssl req -new -x509 -days 3650 -key ca.key -out ca.crt -subj "/CN=Bussiaeg.ee"
	fi
	
	# Create certificate if missing.
	if [[ ! -e "tls.crt" ]]; then
		openssl genrsa -out tls.key
		
		MSYS_NO_PATHCONV=1 openssl req -new -key tls.key -out tls.csr -subj "/CN=*.devaeg.ee"
		MSYS_NO_PATHCONV=1 openssl x509 -req -days 3650 -CA ca.crt -CAkey ca.key -CAcreateserial -in tls.csr -out tls.crt -extfile tls.cfg
		
		rm tls.csr
	fi
	
fi
