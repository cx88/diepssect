all: compile serve

compile:
	wasm-as app.wat -o app.wasm

serve:
	while true; do (cat header app.wasm; sleep 0.01) | nc -w0 -l 4585; done
#	while true; do echo -ne "HTTP/1.1 200 OK\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\nContent-Length: `wc -c < app.wasm`\r\n\r\n`tee < app.wasm`" | nc -w5 -l 4585; done


