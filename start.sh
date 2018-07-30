#!/bin/bash

export NODE_ENV=production

# Kill processes.
killall node
killall caddy

# Acquire new geo ip database from MaxMind.
curl -o ipfilter.tar.gz http://geolite.maxmind.com/download/geoip/database/GeoLite2-Country.tar.gz
tar -xzf ipfilter.tar.gz --no-anchored GeoLite2-Country.mmdb --strip=1
mv GeoLite2-Country.mmdb ipfilter.mmdb
rm ipfilter.tar.gz

# Start servers.
cd web && npm run build && cd ..
cd api && npm start & cd .. && caddy -conf Caddypro
