# Kill processes
killall node
killall caddy

# Pull updates
git reset --hard origin/master
git pull

# Reinstall modules
cd api && npm install && cd ..
cd web && npm install && cd ..
rm -rf {api,web}/package-lock.json
