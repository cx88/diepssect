define NODE_SERVE
fs.writeFileSync('./bundle.json', JSON.stringify({
	timestamp: Date.now(),
	code: fs.readFileSync('/tmp/dpma-bundle.js').toString()
}))
fs.unlinkSync('/tmp/dpma-bundle.js')
http.createServer((req, res) => {
	res.writeHead(200, {
		'Access-Control-Allow-Origin': '*'
	})
	res.end(fs.readFileSync('./bundle.json'))
}).listen(6222)
endef
export NODE_SERVE

dev:
	webpack src/app.js -o /tmp/dpma-bundle.js --mode development
	@node -e "$$NODE_SERVE"

prod:
	webpack src/app.js -o /tmp/dpma-bundle.js --mode production
	@node -e "$$NODE_SERVE"
