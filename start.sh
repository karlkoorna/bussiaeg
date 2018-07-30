export NODE_ENV=production

# Kill processes
killall node
killall caddy

# Start servers
cd web && npm run build && cd ..
cd api && npm start & cd .. && caddy -conf Caddypro
