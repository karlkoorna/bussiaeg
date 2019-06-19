# SQIP (https://github.com/axe312ger/sqip)

IFS=$'\n'
for file in $(find ./**/*.jpg -printf "%p %k\n")
do
	path=$(echo "$file" | cut -f 1 -d " ")
	size=$(($(echo "$file" | cut -f 2 -d " ") / 4))
	sqip -i "$path" -n $size -b 8 -o "${path::-4}.svg" > /dev/null
	echo "Generated SQIP for \"$path\" ($size shapes) ($(($size * 4))KB -> $(find "${path::-4}.svg" -printf "%k")KB)."
done
