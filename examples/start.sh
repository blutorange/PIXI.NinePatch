echo "starting server...
: ${port:=8888}" > /dev/null
ruby -run -e httpd .. -p $port 2>&1 > /dev/null &
pid=$!
echo "started server with pid $pid... on port $port"
xdg-open "http://localhost:$port/examples/index.html" &
echo "Press any button to shutdown the server"
read -n 1
kill -SIGQUIT $pid
