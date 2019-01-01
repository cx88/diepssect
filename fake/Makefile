all: compile serve

compile:
	wasm-as app.wat -o app.wasm

serve:
	while true; do cat header app.wasm | nc -w0 -l 4585; done
