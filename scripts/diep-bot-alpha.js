const http = require('http')
const WebSocket = require('ws')
const Discord = require('discord.js')
const IpAlloc = require('./ip-alloc.js')
const EventEmitter = require('events')
const { Reader, Writer } = require('./coder')

const { PREFIX, TOKEN, IP_TEMPLATE } = require('../config.json')
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

/*const CommanderError = class extends Error {
  constructor(...args) {
    super(...args)
    Error.captureStackTrace(this, GoodError)
  }
}*/

const Commander = class {
  constructor(id) {
    this.id = id
    this.bots = []
  }
  get maximum() {
    let perm = this.id === '239162248990294017' ? 3 : 0
    return [10, 40, 200, 1000][perm]
  }
  createBotUnchecked() {
    let id
    do {
      id = Math.floor(Math.random() * 36 ** 3).toString(36).toUpperCase().padStart(3, '0')
    } while (this.bots.some(r => r.id === id))
    let bot = {
      id,
      socket: null,
      group: null,
      remove: () => {
        if (bot.group) {
          let i = bot.group.indexOf(bot)
          if (i !== -1)
            bot.group.splice(i, 1)
        }
        let i = this.bots.indexOf(bot)
        if (i !== -1)
          this.bots.splice(i, 1)
      },
    }
    this.bots.push(bot)
    return bot
  }
  createBot(amount = null) {
    if (amount === null && this.bots.length + 1 <= this.maximum) {
      return createBotUnchecked()
    } else if (amount >= 0 && this.bots.length + amount <= this.maximum) {
      let group = []
      for (let i = 0; i < amount; i++) {
        let bot = this.createBotUnchecked()
        bot.group = group
        group.push(bot)
      }
      return group
    } else {
      return null
    }
  }
  connectServer({ ipv6, party = '' }, amount, processBot = bot => {
    bot.status = 0
    let ws = bot.socket
    ws.on('open', () => {
      bot.status = 1
      ws.send().vu(5).done()
      ws.send().vu(0).string(BUILD).string('').string(party).string('').done()
    })
    ws.on('close', () => {
      bot.status = 2
    })
    ws.on('error', () => {
      bot.status = 3
    })
  }) {
    let bots = this.createBot(amount || 1)
    if (!bots)
      return null
    for (let bot of bots) {
      let alloc = ipAlloc.for(ipv6)
      if (!alloc) {
        bots.ipOutage = true
        break
      }
      bot.socket = new IRWSocket(`ws://[${ ipv6 }]:443`, alloc)
      processBot(bot)
    }
    if (bots.ipOutage)
      for (let bot of bots.slice())
        if (!bot.socket)
          bot.remove()
    return bots
  }
  getBot(id) {
    return this.bots.find(r => r.id === id)
  }
  removeBot(id) {
    let bot = this.getBot(id)
    if (bot)
      bot.remove()
    return bot
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

let monitor = async (msg, bots, time = 4 * 60e3) => {
  let reply = await msg.reply('Connecting...')

  let oldStatus = null
  let clear = setInterval(() => {
    let newStatus = `Status:  ${
      bots.filter(r => r.status === 0).length
    }T / ${
      bots.filter(r => r.status === 1).length
    }S / ${
      bots.filter(r => r.status === 2).length
    }C / ${
      bots.filter(r => r.status === 3).length
    }E  (${
      bots.length
    } total)`

    if (oldStatus !== newStatus)
      reply.edit(newStatus)
  }, 1000)

  setTimeout(() => {
    for (let bot of bots.slice()) {
      bot.socket.close()
      bot.remove()
    }
    setTimeout(() => {
      clearInterval(clear)
    }, 10e3)
  }, time)
}
let commands = {
  async connect({ args: [link, amount], commander, msg }) {
    let bots = commander.connectServer(await link.server(), amount.integer(1))
    if (!bots) {
      msg.reply(`You cannot have more than ${ commander.maximum } bots!`)
      return
    } else if (bots.ipOutage) {
      msg.reply('Note: runned out of IPs!')
    }

    monitor(msg, bots)
  },
  async cancer({ args: [link, amount], commander, msg }) {
    let server = await link.server()
    let bots = commander.connectServer(server, amount.integer(1), bot => {
      bot.status = 0
      let ws = bot.socket
      let int
      ws.on('open', () => {
        bot.status = 1
        ws.send().vu(0).string(BUILD).string('').string(server.party).string('').done()
        ws.send().vu(2).string('Cancer Bot').done()
        let frameCount = 0
        int = setInterval(() => {
          let flags = 0b100100000001
          let upgrade = null
          if (frameCount === 48) {
            upgrade = 18
          } else if (frameCount === 49) {
            upgrade = 32
          } else if (frameCount >= 50 && frameCount % 2 === 0) {
            upgrade = 94
          } else {
            flags |= 0b010000000000
          }
          if (upgrade !== null)
            ws.send().vu(4).i8(upgrade).done()
          ws.send().vu(1).vu(flags).vf(0).vf(0).done()
          frameCount++
        }, 30)
      })
      ws.on('close', () => {
        clearInterval(int)
        bot.status = 2
      })
      ws.on('error', () => {
        bot.status = 3
      })
    })
    if (!bots) {
      msg.reply(`You cannot have more than ${ commander.maximum } bots!`)
      return
    } else if (bots.ipOutage) {
      msg.reply('Note: runned out of IPs!')
    }

    monitor(msg, bots)
  },
  async pump({ args: [link, amount], commander, msg }) {
    let server = await link.server()
    let bots = commander.connectServer(server, amount.integer(1), bot => {
      let ws = bot.socket
      ws.on('open', () => {
        ws.send().vu(5).done()
        ws.send().vu(0).string(BUILD).string('').string(server.party).string('').done()
      })
    })
    if (!bots) {
      msg.reply(`You cannot have more than ${ commander.maximum } bots!`)
      return
    } else if (bots.ipOutage) {
      msg.reply('Note: runned out of IPs!')
    }

    let reply = await msg.reply('Pumping server...')
    setTimeout(() => {
      for (let bot of bots.slice()) {
        bot.socket.close()
        bot.remove()
      }
      reply.edit('Done!')
    }, 2000)
  },
  async list({ commander, msg }) {
    if (commander.bots.length > 0)
      msg.reply(`Your bots (${ commander.bots.length }/${ commander.maximum }):\n` + commander.bots.map(r => `-  \`${ r.id }\`  Status: ${ 'TSCE'.charAt(r.status) || 'U' }`).join('\n'))
    else
      msg.reply(`You have no bots. (0/${ commander.maximum })`)
  },
  async remove({ args: [id], commander, msg }) {
    let bot = commander.bots.find(r => r.id === id.id())
    if (bot) {
      if (bot.socket) {
        bot.socket.close()
      }
      bot.remove()
      msg.reply('Removed bot.')
    } else {
      msg.reply('Bot not found!')
    }
  },
  async party({ args: [link], commander, msg }) {
    let { ipv6, party, source } = await link.server()

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
        msg.reply('Note: runned out of IPs!')
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
let commanders = {}
bot.on('message', msg => {
  if (!msg.content.startsWith(PREFIX)) return
  let args = msg.content.slice(PREFIX.length).trim().split(/\s+/)
  let command = commands[args.shift()]

  if (typeof command !== 'function') {
    msg.reply('Command not found!')
  } else {
    args = args.map(string => ({
      toString() { return string },
      id() { return string.toUpperCase().replace(/[^0-9A-Z]/g, '') },
      valueOf() { return (+string || 0) },
      link() { return linkParse(string) },
      integer(minimum = 0) {
        return Math.max(minimum, Math.floor(+string) || 0)
      },
      async server() {
        let { id, party, source } = linkParse(string)
        let server = await findServer(id)
        server.id = id
        server.party = party
        server.source = source
        return server
      },
    }))

    let commander = commanders[msg.author.id]
    if (!commander)
      commander = commanders[msg.author.id] = new Commander(msg.author.id)

    try {
      command({ msg, args, commander })
    } catch(e) {
      msg.reply('Error while executing command!')
      console.error(e)
    }
  }
})
bot.login(TOKEN)
