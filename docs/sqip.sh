# SQIP (https://github.com/axe312ger/sqip)
# Primitive (https://github.com/fogleman/primitive)

# Fetch Node and Go dependencies on first run.
if [ "$(find _includes/sqip -iname *.sqip)" == "" ]; then
	npm install -g sqip@canary sqip-plugin-primitive@canary sqip-plugin-svgo@canary sqip-plugin-data-uri@canary
	go get -u github.com/fogleman/primitive
fi

# Copy directory structure to destination.
find img/ -type d | cut -c5- | xargs -I 0 mkdir -p _includes/sqip/0

# Generate base64 encoded SQIPs as data URLs in destination.
IFS=$'\n'
for file in $(find img/**/*.jpg -printf "%p %k\n"); do
	path=$(echo $file | cut -d . -f 1 | cut -c5-)
	shapes=$(($(echo $file | cut -d " " -f 2) / 5))
	
	sqip -i img/$path.jpg -n $shapes -b 8 -o img/$path.tmp > /dev/null
	echo -n "data:image/svg+xml;base64," > _includes/sqip/$path.sqip
	base64 -w 0 img/$path.tmp >> _includes/sqip/$path.sqip
	rm img/$path.tmp
	
	echo "Generated SQIP for \"img/$path.jpg\" ($shapes shapes) ($(($shapes * 5))KB -> $(find _includes/sqip/$path.sqip -printf %k)KB)."
done
