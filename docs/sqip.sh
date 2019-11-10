#!/bin/bash

# Fetch Node and Go dependencies when needed.
if [[ $1 ]]; then
	npm install -g sqip@canary sqip-cli@canary sqip-plugin-primitive@canary sqip-plugin-blur@canary
	go get -u github.com/fogleman/primitive
fi

# Copy directory structure to destination.
find img/ -type d | cut -c5- | xargs -I 0 mkdir -p _includes/sqip/0

# Generate base64 encoded SQIPs as data URLs in destination.
IFS=$'\n'
for file in $(find img/**/*.jpg -printf "%p %k\n"); do
	path=$(echo $file | cut -d . -f 1 | cut -c5-)
	shapes=$(($(echo $file | cut -d " " -f 2) / 5))
	
	sqip -i img/$path.jpg -o img/$path.tmp -p primitive -n $shapes -p blur -b 64 > /dev/null
	echo -n "data:image/svg+xml;base64," > _includes/sqip/$path.sqip
	base64 -w 0 img/$path.tmp >> _includes/sqip/$path.sqip
	rm img/$path.tmp
	
	echo "Generated SQIP for \"img/$path.jpg\" ($shapes shapes) ($(($shapes * 5))KB -> $(find _includes/sqip/$path.sqip -printf %k)KB)."
done
