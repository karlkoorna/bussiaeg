#!/bin/bash

# Install node modules if missing.
cd api/node_modules/ && npm install
cd web/node_modules/ && npm install

# Add NGINX server blocks.
[[ $1 ]] && ENV=dev || ENV=pro
cp -f nginx.$ENV.conf /etc/nginx/sites-enabled/bussiaeg.$ENV.conf
sed -i "s@tls.@$PWD/tls.@g" /etc/nginx/sites-enabled/bussiaeg.$ENV.conf
sed -i "s@web/build/@$PWD/web/build/@g" /etc/nginx/sites-enabled/bussiaeg.$ENV.conf
sed -i "s/API_PORT/$(cat api/.env | grep ^PORT | cut -d '=' -f2)/g" /etc/nginx/sites-enabled/bussiaeg.$ENV.conf
sed -i "s/WEB_PORT/$(cat web/.env | grep ^PORT | cut -d '=' -f2)/g" /etc/nginx/sites-enabled/bussiaeg.$ENV.conf

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

# Setup...
if [[ $1 ]]; then # in development mode.
	# Remove inactive NGINX server blocks.
	rm -f /etc/nginx/sites-enabled/bussiaeg.pro.conf
	nginx -s reload
else # in production mode.
	# Install SystemD service.
	cp -f systemd.service /etc/systemd/system/bussiaeg.service
	sed -i "s@start.sh@$PWD/start.sh@g" /etc/systemd/system/bussiaeg.service
	
	# Remove inactive NGINX server blocks.
	rm -f /etc/nginx/sites-enabled/bussiaeg.dev.conf
	nginx -s reload
fi
