const BUILD = '9b9e4489cd499ded99cca19f4784fc929d21fc35'

const WebSocket = require('ws')
const EventEmitter = require('events')
const readline = require('readline')

const Bot = class extends EventEmitter {
  constructor(address) {
    super()

    let ws = new WebSocket(address, null, {
      origin: address.startsWith('wss') ? 'https://diep.io' : 'http://diep.io'
    })
    ws.on('open', () => {
      super.emit('open')
      this.send(5)
      this.send(0, BUILD, 0, 0, 0, 0)

      this.lastPing = Date.now()
    })
    ws.on('message', data => {
      let u8 = new Uint8Array(data)
      super.emit('message', u8)

      switch (u8[0]) {
        case 0:
          super.emit('update', u8)
          break
        case 1:
          super.emit('outdate', u8)
          break
        case 2:
          super.emit('compressedUpdate', u8)
          break
        case 3:
          super.emit('broadcast', u8)
          break
        case 4:
          super.emit('status', u8)
          break
        case 5:
          let now = Date.now()
          super.emit('echo', now - this.lastPing)
          this.send(5)
          this.lastPing = now
          break
        case 6:
          super.emit('party', u8)
          break
        case 7:
          super.emit('accept')
          break
      }
    })
    ws.on('close', () => {
      super.emit('close')
    })
    this.ws = ws
  }
  send(...args) {
    let data = args.map(r =>
      typeof r === 'number' ? [r] :
      typeof r === 'string' ? r.split('').map(r => r.charCodeAt(0)) :
    r)
    let u8 = new Uint8Array([].concat(...data))
    super.emit('send', u8)
    if (this.ws.readyState === 1)
      this.ws.send(u8)
  }
  close() {
    this.ws.close()
  }
}

// https://api.n.m28.io/endpoint/latency/findEach/

let ws = null

let rl = readline.createInterface(process.stdin, process.stdout)
rl.setPrompt('> ')
rl.prompt()
rl.on('line', line => {
  let args = line.trim().split(' ')
  let command = args.shift() || ''
  let options = {}
  while (args.length && args[0].startsWith('-')) {
    options[args.shift()] = true
  }
  let data = args.join(' ')

  switch (command) {
    case 'help':
      console.log('help                display this message')
      console.log('connect <ip>        connect to a server')
      console.log('connect -v <ip>     connect to a server and log all packets')
      console.log('close               close the current connection')
      break
    case 'connect':
      let verbose = options['-v']
      if (ws) {
        console.log('There is already an active connection')
      } else {
        console.log('Connecting...')
        ws = new Bot(`ws://${ data }:443/`)
        ws.on('open', () => log('Socket opened!'))
        ws.on('close', () => log('Socket closed!'))
        ws.on('outdate', () => log('Client outdated!'))
        ws.on('status', data => log('Server status:', Array.from(data).slice(1).map(r => r ? String.fromCharCode(r) : '; ').join('')))
        ws.on('party', data => log('Party link:', data))
        ws.on('accept', () => log('Client accepted!'))
        if (verbose) {
          ws.on('send', dataUnknown => {
            let data = Array.from(dataUnknown)
            log(`[WS] > ${ data.map(r => r.toString(16).padStart(2, '0')).join(' ') }`)
          })
          ws.on('message', dataUnknown => {
            let data = Array.from(dataUnknown)
            log(`[WS] < ${ data.map(r => r.toString(16).padStart(2, '0')).join(' ') }`)
          })
        }
      }
      break
    case 'close':
      if (ws) {
        ws.close()
        ws = null
        console.log('Closing...')
      } else {
        console.log('No active connection found')
      }
      break
    case 'exit':
      process.exit(0)
      break
    default:
      console.log('`%s` is not a valid command', command)
      break
  }

  rl.prompt()
}).on('close', function() {
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0, null)
  console.log('> exit')
  process.exit(0)
})

let log = (...args) => {
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0, null)
  console.log(...args)
  rl.prompt(true)
}

