const http = require('http')
const WebSocket = require('ws')
const Discord = require('discord.js')
const IpAlloc = require('./ip-alloc.js')
const EventEmitter = require('events')
const { Reader, Writer } = require('./coder')

const { PREFIX, TOKEN, IP_TEMPLATE } = require('../../config.json')
const BUILD = '9b9e4489cd499ded99cca19f4784fc929d21fc35'

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
    try {
      this.socket.close()
    } catch(e) {
      this.socket.terminate()
    }
  }
}

let ipAlloc = new IpAlloc(IP_TEMPLATE)

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
  let source = 'diep.io/#'
  let id = ''
  while (true) {
    let lower = data.shift()
    source += lower
    let upper = data.shift()
    source += upper
    let byte = parseInt(lower, 16) + parseInt(upper, 16) * 16
    if (!byte) break
    id += String.fromCharCode(byte)
  }
  return { id, party: data.join(''), source }
}

let commands = {
  async connect({ args: [link, amount], perm, msg }) {
    let { id, party } = linkParse(link)
    let { ipv6 } = await findServer(id)

    let count = +amount || 1

    let limit = [5, 20, 80][perm]
    if (count > limit) {
      msg.reply(`You cannot have more than ${ limit } bots!`)
      return
    }

    let reply = await msg.reply('Connecting...')
    let bots = []

    for (let i = 0; i < count; i++) {
      let alloc = ipAlloc.for(ipv6)
      if (!alloc) {
        msg.reply('Runned out of IPs!')
        break
      }

      let bot = { code: 0 }
      let ws = new IRWSocket(`ws://[${ ipv6 }]:443`, alloc)
      ws.on('open', () => {
        bot.code = 1
        ws.send().vu(5).done()
        ws.send().vu(0).string(BUILD).string('').string(party).string('').done()
      })
      ws.on('close', () => {
        bot.code = 2
      })
      ws.on('error', () => {
        bot.code = 3
      })
      bots.push(bot)
    }

    let i = 0, oldStatus = null, clear = setInterval(() => {
      if (++i >= 160) clearInterval(clear)
      let newStatus = `Status:  ${
        bots.filter(r => r.code === 0).length
      }T / ${
        bots.filter(r => r.code === 1).length
      }S / ${
        bots.filter(r => r.code === 2).length
      }C / ${
        bots.filter(r => r.code === 3).length
      }E  (${
        bots.length
      } total)`

      if (oldStatus !== newStatus)
        reply.edit(newStatus)
    }, 2000)
  },
  async pump({ args: [link, amount], perm, msg }) {
    let { id, party } = linkParse(link)
    let { ipv6 } = await findServer(id)

    let count = +amount || 1

    let limit = [5, 20, 80][perm]
    if (count > limit) {
      msg.reply(`You cannot use more than ${ limit } bots!`)
      return
    }

    let reply = await msg.reply('Pumping server...')
    let wss = []

    for (let i = 0; i < count; i++) {
      let alloc = ipAlloc.for(ipv6)
      if (!alloc) {
        msg.reply('Runned out of IPs!')
        break
      }

      let ws = new IRWSocket(`ws://[${ ipv6 }]:443`, alloc)
      ws.on('open', () => {
        ws.send().vu(5).done()
        ws.send().vu(0).string(BUILD).string('').string(party).string('').done()
      })
      wss.push(ws)
    }

    setTimeout(() => {
      for (let ws of bots)
        ws.close()
      reply.edit('Done!')
    }, 2000)
  },
  async party({ args: [link], perm, msg }) {
    let { id, party, source } = linkParse(link)
    let { ipv6 } = await findServer(id)

    let found = {}
    let sockets = []
    let amount = 12

    let exit = () => {
      clearInterval(int)
      for (let socket of sockets)
        socket.close()
      msg.reply('Found:\n' + Object.entries(found)
        .map(([link, amount]) => `- ${ source }${ link } (${ amount })`)
        .join('\n'))
    }
    let int = setInterval(() => {
      if (amount-- <= 0) {
        exit()
        return
      }
      let alloc = ipAlloc.for(ipv6)
      if (!alloc) {
        msg.reply('Runned out of IPs!')
        exit()
        return
      }
      let ws = new IRWSocket(`ws://[${ ipv6 }]:443`, alloc)
      ws.on('open', () => {
        ws.send().vu(5).done()
        ws.send().vu(0).string(BUILD).string('').string('').string('').done()
      })
      ws.on('message', r => {
        if (r.vu() !== 6) return
        let link = r.flush().map(r => r.toString(16).padStart(2, '0').toUpperCase().split('').reverse().join('')).join('')
        found[link] = (found[link] || 0) + 1
        if (Object.keys(found).length >= 4)
          exit()
      })
      sockets.push(ws)
    }, 100)
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
