const WebSocket = require('ws')
const EventEmitter = require('events')

const { Reader, Writer } = require('./coder')

const WriterSending = class extends Writer {
  constructor(socket) {
    super()
    this.socket = socket
  }
  done() {
    if (this.socket.readyState === 1)
      this.socket.send(this.out())
  }
}

const IRWSocket = class extends EventEmitter {
  constructor(address, { ip, release }) {
    super()
    let socket = new WebSocket(address, {
      origin: address.startsWith('wss') ? 'https://diep.io' : 'http://diep.io',
      localAddress: ip,
      rejectUnauthorized: false,
    })
    socket.on('open', () => {
      super.emit('open')
    })
    socket.on('message', data => {
      let u8 = new Uint8Array(data)
      super.emit('message', new Reader(u8))
    })
    socket.on('close', e => {
      release()
      super.emit('close')
    })
    socket.on('error', err => {
      release()
      super.emit('error', err)
    })
    this.socket = socket
  }
  send() {
    return new WriterSending(this.socket)
  }
  close() {
    try {
      this.socket.close()
    } catch(e) {
      this.socket.terminate()
    }
  }
}

module.exports = IRWSocket
