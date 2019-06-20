# SQIP (https://github.com/axe312ger/sqip)
# Primitive (https://github.com/fogleman/primitive)

# Prevent execution from wrong directory.
if [ $(dirname $(readlink -f "$0")) != $PWD ]; then
	>&2 echo "Must be ran from the same directory."
	exit 1
fi

# Fetch Node and Go dependencies on first use.
if [ "$(find .. -iname *.b64)" == "" ]; then
	npm install -g sqip@canary sqip-plugin-primitive@canary sqip-plugin-svgo@canary sqip-plugin-data-uri@canary
	go get -u github.com/fogleman/primitive
fi

# Copy directory structure to destination.
find . -type d | xargs -I 0 mkdir -p ../_includes/img/0

# Generate base64 encoded SQIPs as data URLs in destination.
IFS=$'\n'
for file in $(find **/*.jpg -printf "%p %k\n"); do
	path=$(echo $file | cut -d . -f 1)
	shapes=$(($(echo $file | cut -d " " -f 2) / 5))
	
	sqip -i $path.jpg -n $shapes -b 8 -o $path.tmp > /dev/null
	echo -n "data:image/svg+xml;base64," > ../_includes/img/$path.svg.b64
	base64 -w 0 $path.tmp >> ../_includes/img/$path.svg.b64
	rm $path.tmp
	
	echo "Generated SQIP for \"$path.jpg\" ($shapes shapes) ($(($shapes * 5))KB -> $(find ../_includes/img/$path.svg.b64 -printf %k)KB)."
done
