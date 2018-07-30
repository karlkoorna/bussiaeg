export NODE_ENV=production

# Stop processes
pm2 stop "Bussiaeg.ee (Server)"
pm2 stop "Bussiaeg.ee (Clients)"

# Start servers
cd web && npm run build && cd ..
cd api && pm2 start app.js -n "Bussiaeg.ee (Server)" && cd ..
pm2 start caddy -n "Bussiaeg.ee (Clients)" -- -conf Caddypro
