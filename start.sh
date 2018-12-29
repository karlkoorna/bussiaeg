#!/bin/bash

export NODE_ENV=production

# Kill processes.
while read pid; do
	kill -9 $pid
done < 'pid'
> pid

# Start server.
ulimit -n 8192
caddy -conf $(pwd)/Caddypro & echo $! > pid
cd api && echo $(pgrep -f 'node app.js') > pid
