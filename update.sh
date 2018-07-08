# Pull updates
git reset --hard origin/master
git pull

# Update modules
cd api && npm install && cd ..
cd web && npm install && cd ..
rm -rf {api,web}/package-lock.json
