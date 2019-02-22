const http = require('http')
const WebSocket = require('ws')
const Discord = require('discord.js')
const IpAlloc = require('./ip-alloc.js')
const EventEmitter = require('events')
const { Reader, Writer } = require('./coder')

const { PREFIX, TOKEN, IP_TEMPLATE, BUILD } = require('../config.json')

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
    return [8, 64, 256, 1024][perm]
  }
  createBotUnchecked() {
    let id
    do {
      id = Math.floor(Math.random() * 36 ** 4).toString(36).toUpperCase().padStart(4, '0')
    } while (this.bots.some(r => r.id === id))
    let self = this
    let bot = {
      id,
      socket: null,
      group: null,
      expire: Date.now() + 8 * 60e3,
      remove() {
        this.expire = Date.now()
        clearTimeout(timeout)
        if (this.socket) {
          this.socket.close()
        }
        if (this.group) {
          let i = this.group.indexOf(this)
          if (i !== -1)
            this.group.splice(i, 1)
        }
        let i = self.bots.indexOf(this)
        if (i !== -1)
          self.bots.splice(i, 1)
      },
      renew(to) {
        this.expire = Date.now() + to
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          this.remove()
        }, to)
      }
    }
    let timeout = setTimeout(() => {
      bot.remove()
    }, 8 * 60e3)
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
      ws.send().vu(1).vu(0b100000000000 | Math.round(Math.random())).vf(0).vf(0).done()
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

let monitor = async (msg, bots) => {
  let reply = await msg.reply('Connecting...')

  let status = null
  let clear = setInterval(() => {
    let statusTo = `Status:  ${
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

    if (status !== statusTo) {
      status = statusTo
      reply.edit(status)
    }
    if (bots.length === 0)
      clearInterval(clear)
  }, 2000)
}
let commands = {
  async connect({ args: [link, amount], commander, msg }) {
    let bots = commander.connectServer(await link.server(), amount.integer(1))
    if (!bots) {
      msg.reply(`You cannot have more than ${ commander.maximum } bots!`)
      return
    } else if (bots.ipOutage) {
      msg.reply('Note: ran out of IPs!')
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
      msg.reply('Note: ran out of IPs!')
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
      msg.reply('Note: ran out of IPs!')
    }

    for (let bot of bots) {
      bot.renew(2000)
    }

    let reply = await msg.reply('Pumped server.')
  },
  async list({ commander, msg }) {
    if (commander.bots.length > 0)
      msg.reply(`Your bots (${ commander.bots.length }/${ commander.maximum }):\n` +
        commander.bots.map(bot => {
          let status = 'TSCE'.charAt(bot.status) || 'U'
          let seconds = Math.max(0, Math.ceil((bot.expire - Date.now()) / 1000))
          let minutes = Math.floor(seconds / 60)
          seconds %= 60
          let hours = Math.floor(minutes / 60)
          minutes %= 60
          let expire =
            (hours ? hours + 'h ' : '') +
            (minutes ? minutes + 'm ' : '') +
            (seconds ? seconds + 's ' : '')
          return `-   \`${ bot.id }\`    Status:  ${ status }    Expiring In:  ${ expire }`
        }).join('\n'))
    else
      msg.reply(`You have no bots. (0/${ commander.maximum })`)
  },
  async remove({ args: [id], commander, msg }) {
    id = id.id()
    if (id === 'ALL') {
      if (commander.bots.length) {
        for (let bot of commander.bots.slice())
          bot.remove()
        msg.reply('Removed all bots.')
      } else {
        msg.reply('No bots found!')
      }
    } else {
      let bot = commander.bots.find(r => r.id === id)
      if (bot) {
        bot.remove()
        msg.reply('Removed bot.')
      } else {
        msg.reply('Bot not found!')
      }
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
        msg.reply('Note: ran out of IPs!')
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
        let link = Array.from(r.flush()).map(r => r.toString(16).padStart(2, '0').toUpperCase().split('').reverse().join('')).join('')
        found[link] = (found[link] || 0) + 1
        if (Object.keys(found).length >= 4)
          exit()
      })
      sockets.push(ws)
    }, 100)
  },
  async help({ msg }) {
    msg.reply([
      'List of commands:',
      '- connect <party link> [amount]        Connect to a diep server, used to expand arena',
      '- pump <party link> [amount]            Connect to a diep server and immediately leave',
      '- list                                                           List your bots with their ID and status',
      '- remove [id]                                           Remove a bot given its ID',
      '- remove all                                              Remove all of your bots',
      '- party <party link>                                Find all party links given a single link of a team server',
      '',
      'Note that you are only given 10 bots, so use the remove command when you don\'t need them.',
      '',
      'Invite to the Discord server: <https://discord.gg/8gvUd3v>',
      'Invite to the bot: <https://discordapp.com/oauth2/authorize?client_id=398241406910726144&scope=bot&permissions=8>',
    ].join('\n'))
  }
}

let bot = new Discord.Client()
let commanders = {}
bot.on('message', msg => {
  if (!msg.content.startsWith(PREFIX) || msg.author.bot) return
  let argsArray = msg.content.slice(PREFIX.length).trim().split(/\s+/)
  let command = commands[argsArray.shift()]

  if (typeof command !== 'function') {
    msg.reply('Command not found!')
  } else {
    let args = {
      next() {
        let string = argsArray.shift() || ''
        return {
          done: false,
          value: {
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
          },
        }
      },
      [Symbol.iterator]: function() { return this },
    }

    let commander = commanders[msg.author.id]
    if (!commander)
      commander = commanders[msg.author.id] = new Commander(msg.author.id)

    command({ msg, args, commander }).catch(e => {
      msg.reply('Error while executing command!')
      console.error(e)
    })
  }
})
bot.login(TOKEN)
