const http = require('http')
const WebSocket = require('ws')
const Discord = require('discord.js')
const IpAlloc = require('./ip-alloc.js')
const EventEmitter = require('events')
const { Reader, Writer } = require('./coder')

const { PREFIX, TOKEN, IP_TEMPLATE } = require('../../config.json')

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

const DiepScoket = class extends EventEmitter {
  constructor(address, { ip, release }) {
    super()
    let socket = new WebSocket(address, {
      origin: address.startsWith('wss') ? 'https://diep.io' : 'http://diep.io',
      localAddress: ip,
    })
    socket.on('open', () => {
      super.emit('open')
    })
    socket.on('message', data => {
      let u8 = new Uint8Array(data)
      super.emit('message', new Reader(u8))
    })
    socket.on('close', () => {
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
    this.socket.close()
  }
}

let ipAlloc = new IpAlloc(IP_TEMPLATE)

let movement = [0x01, 0x80, 0x10, 0x00, 0x00]

let findServer = id => new Promise((resolve, reject) => {
  http.get(`http://api.n.m28.io/server/${ id }`, res => {
    let data = ''
    res.on('data', chunk => data += chunk)
    res.on('end', () => {
      try {
        resolve(JSON.parse(data))
      } catch(e) {
        reject(e)
      }
    })
  }).on('error', reject)
})

let linkParse = link => {
  let match = link.match(/diep\.io\/#(([0-9A-F]{2})+)/)
  if (!match) return null
  let data = match[1].split('')
  let id = ''
  while (true) {
    let byte = parseInt(data.shift(), 16) + parseInt(data.shift(), 16) * 16
    if (!byte) break
    id += String.fromCharCode(byte)
  }
  return { id, party: data.join('') }
}

let commands = {
  async connect({ args: [link, amount], perm, msg }) {
    let { id, party } = linkParse(link)
    let { ipv6 } = await findServer(id)

    let count = +amount || 1

    if (count > 4 && perm < 2) {
      msg.reply('You cannot have more than 4 bots!')
    }

    for (let i = 0; i < amount; i++) {
      let success = false

      let alloc = ipAlloc.for(ipv6)
      if (!alloc.ip) {
        msg.reply('Runned out of IPs!')
        break
      }
      let ws = new DiepScoket(`ws://[${ ipv6 }]:443`, alloc)
      ws.on('open', () => {
        success = true
        if (amount <= 4)
          msg.reply('Connected to the server.')
        ws.send().vu(5).done()
        ws.send().vu(0).string('9b9e4489cd499ded99cca19f4784fc929d21fc35').string('').string(party).string('').done()
      })
      ws.on('close', () => {
        if (!success) return
        if (amount <= 4)
          msg.reply('Connection closed.')
      })
      ws.on('error', () => {
        if (amount <= 4)
          msg.reply('Unable to connect to the server!')
      })
    }
  },
  async party({ args: [link, amount], perm, msg }) {
    let { id, party } = linkParse(link)
    let { ipv6 } = await findServer(id)

    if (perm < 2) {
      msg.reply('You are not allowed to use this command!')
    }

    for (let i = 0; i < +amount; i++) {
      let alloc = ipAlloc.for(ipv6)
      if (!alloc.ip) {
        msg.reply('Runned out of IPs!')
        break
      }
      let ws = new DiepScoket(`ws://[${ ipv6 }]:443`, alloc)
      ws.on('open', () => {
        console.log('Connected to the server.')
        ws.send().vu(5).done()
        ws.send().vu(0).string('9b9e4489cd499ded99cca19f4784fc929d21fc35').string('').string(party).string('').done()
      })
      ws.on('message', r => {
        if (r.vu() === 6)
          console.log(r.i8(), r.i8(), r.i8(), r.i8(), r.i8(), r.i8())
      })
      ws.on('close', () => {
        console.log('Connection closed.')
      })
      ws.on('error', () => {
        console.log('Unable to connect to the server!')
      })
    }
  },
}

let bot = new Discord.Client()
bot.on('message', msg => {
  if (!msg.content.startsWith(PREFIX)) return
  let args = msg.content.slice(PREFIX.length).trim().split(/\s+/)

  let perm = msg.author.id === '239162248990294017' ? 2 : 0

  let command = commands[args.shift()]
  if (typeof command !== 'function')
    msg.reply('Command not found!')
  else
    command({ msg, args, perm })
})
bot.login(TOKEN)

/*let server = new WebSocket.Server({ port: 1337 })
server.on('connection', ws => {
  ws.on('message', data => {
    movement = data
  })
})*/
