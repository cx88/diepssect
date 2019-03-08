const http = require('http')
const util = require('util')
const WebSocket = require('ws')
const Discord = require('discord.js')
const EventEmitter = require('events')
const IpAlloc = require('./ip-alloc.js')
const { Reader, Writer } = require('./coder')

const { PREFIX, TOKEN, SET_PLAYING, IP_TEMPLATE, BUILD, WEBHOOK_PROCESSOR } = require('../config.json')

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
let parties = {}

const Commander = class {
  constructor(id) {
    this.id = id
    this.bots = []
    this.lastUse = [0, 0, 0]
  }
  get perm() {
    let perm = this.id === '239162248990294017' ? 5 : 0
    let server = bot.guilds.get('251478385350410241')
    if (server && server.members.has(this.id)) {
      for (let [level, id] of [
        [4, '283013720366383113'], // CX
        [3, '548967042896625754'], // Tier 3
        [2, '548960895066177577'], // Trusted
        [2, '553410347852365824'], // Researcher
        [1, '251478385350410241'], // @everyone
      ])
        if (server.members.get(this.id).roles.has(id) && level > perm)
          perm = level
    }
    return perm
  }
  get maximum() {
    return 4 + 2 * 2 ** 2 ** this.perm
  }
  checkRateLimit() {
    if (this.perm !== 0)
      return false
    let now = Date.now()
    let timeLimit = 60e3
    if (this.lastUse[0] + timeLimit > now)
      return this.lastUse[0] + timeLimit - now
    this.lastUse.shift()
    this.lastUse.push(now)
    return false
  }
  createBotUnchecked(party) {
    let id
    do {
      id = Math.floor(Math.random() * 36 ** 4).toString(36).toUpperCase().padStart(4, '0')
    } while (this.bots.some(r => r.id === id))
    let self = this
    let bot = {
      id,
      socket: null,
      group: null,
      expire: Date.now() + 60e3,
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
        if (i !== -1) {
          self.bots.splice(i, 1)
          parties[party]--
        }
      },
      renew(to) {
        if (to < 0) to = 0
        else if (to > 24 * 24 * 60 * 60e3) to = 24 * 24 * 60 * 60e3
        this.expire = Date.now() + to
        clearTimeout(timeout)
        timeout = setTimeout(() => {
          this.remove()
        }, to)
      }
    }
    let timeout = setTimeout(() => {
      bot.remove()
    }, 60e3)
    this.bots.push(bot)
    parties[party] = parties[party] ? parties[party] + 1 : 1
    return bot
  }
  createBot(amount = null, party) {
    let inParty = (party && parties[party]) || 0
    if (amount === null && this.bots.length + 1 <= this.maximum && inParty + 1 <= this.maximum * 2) {
      return createBotUnchecked(party)
    } else if (amount >= 0 && this.bots.length + amount <= this.maximum && inParty + amount <= this.maximum * 2) {
      let group = []
      for (let i = 0; i < amount; i++) {
        let bot = this.createBotUnchecked(party)
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
    ws.on('message', () => {
      ws.send().vu(1).vu(0b100000000000 | Math.round(Math.random())).vf(0).vf(0).done()
    })
    ws.on('close', () => {
      bot.status = 2
    })
    ws.on('error', () => {
      bot.status = 3
    })
  }) {
    let bots = this.createBot(amount || 1, party.length === 12 ? party.toUpperCase() : null)
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

let findAnyServer = mode => new Promise((resolve, reject) => {
  http.get(`http://api.n.m28.io/endpoint/diepio-${ mode }/findEach/`, res => {
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
  async create({ args: [region], commander, msg }) {
    let server = await region.regionServer()
    let bots = commander.connectServer(server, 1, bot => {
      let ws = bot.socket
      ws.on('open', () => {
        bot.status = 1
        ws.send().vu(5).done()
        ws.send().vu(0).string(BUILD).string('').string('').string('').done()
      })
      ws.on('message', r => {
        if (r.vu() !== 6) return
        let id = (server.id + '\x00').split('').map(r => r.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase().split('').reverse().join('')).join('')
        let link = Array.from(r.flush()).map(r => r.toString(16).padStart(2, '0').toUpperCase().split('').reverse().join('')).join('')
        msg.reply(`http://diep.io/#${ id }${ link }`)
      })
      ws.on('close', () => {
        bot.status = 2
      })
      ws.on('error', () => {
        bot.status = 3
      })
    })

    for (let bot of bots) {
      bot.renew(60e3)
    }

    if (!bots) {
      msg.reply(`You cannot have more than ${ commander.maximum } bots!`)
    } else if (bots.ipOutage) {
      msg.reply('Note: ran out of IPs!')
    }
  },
  async regions({ args: [mode], commander, msg }) {
    let modeString = mode.toString()
    let { servers } = await findAnyServer(modeString)
    msg.reply(`Regions for ${ modeString }:\n` + Object.keys(servers).map(r => `- ${ r }:${ modeString }:`).join('\n'))
  },
  async connect({ args: [link, amount], commander, msg }) {
    let rateLimit = commander.checkRateLimit()
    if (rateLimit) {
      msg.reply(`You are being rate limited, please wait for ${ Math.ceil(rateLimit / 1000) } seconds.`)
      return
    }

    let bots = commander.connectServer(await link.server(), amount.integer(1))
    if (!bots) {
      msg.reply(`You cannot have more than ${ commander.maximum } bots!`)
      return
    } else if (bots.ipOutage) {
      msg.reply('Note: ran out of IPs!')
    }

    for (let bot of bots) {
      bot.renew(4 * 60e3)
    }

    monitor(msg, bots)
  },
  async feed({ args: [link, amount], commander, msg }) {
    let rateLimit = commander.checkRateLimit()
    if (rateLimit) {
      msg.reply(`You are being rate limited, please wait for ${ Math.ceil(rateLimit / 1000) } seconds.`)
      return
    }

    let server = await link.server()
    let bots = commander.connectServer(server, amount.integer(1), bot => {
      bot.status = 0
      let ws = bot.socket
      let int
      ws.on('open', () => {
        bot.status = 1
        ws.send().vu(0).string(BUILD).string('').string(server.party).string('').done()
        int = setInterval(() => {
          ws.send().vu(2).string('Feed Bot').done()
          let flags = 0b100100000010
          ws.send().vu(1).vu(flags).vf(0).vf(0).done()
          ws.send().vu(3).vi(7).vi(7).done()
        }, 25)
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

    for (let bot of bots) {
      bot.renew(8 * 60e3)
    }

    monitor(msg, bots)
  },
  async stalive({ args: [link], commander, msg }) {
    let rateLimit = commander.checkRateLimit()
    if (rateLimit) {
      msg.reply(`You are being rate limited, please wait for ${ Math.ceil(rateLimit / 1000) } seconds.`)
      return
    }

    let server = await link.server()
    let bots = commander.connectServer(server, 1, bot => {
      bot.status = 0
      let ws = bot.socket
      let int
      ws.on('open', () => {
        bot.status = 1
        ws.send().vu(0).string(BUILD).string('').string(server.party).string('').done()
        let frameCount = 0
        int = setInterval(() => {
          if (frameCount % 4000 === 0) {
            ws.send().vu(2).string('Stay Alive Bot').done()
          }
          let flags = 0b100001000000
          ws.send().vu(1).vu(flags).vf(0).vf(0).done()
          frameCount++
        }, 25)
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

    for (let bot of bots) {
      bot.renew(8 * 60e3)
    }

    monitor(msg, bots)
  },
  async cancer({ args: [link, amount], commander, msg }) {
    let rateLimit = commander.checkRateLimit()
    if (rateLimit) {
      msg.reply(`You are being rate limited, please wait for ${ Math.ceil(rateLimit / 1000) } seconds.`)
      return
    }

    let server = await link.server()
    let bots = commander.connectServer(server, amount.integer(1), bot => {
      bot.status = 0
      let ws = bot.socket
      let int
      ws.on('open', () => {
        bot.status = 1
        ws.send().vu(0).string(BUILD).string('').string(server.party).string('').done()
        let frameCount = 0
        int = setInterval(() => {
          ws.send().vu(2).string('Cancer Bot').done()
          let flags = 0b100100000001
          let upgrade = null
          if (frameCount === 48) {
            upgrade = 18
          } else if (frameCount === 49) {
            upgrade = 32
          } else if (frameCount >= 50 && frameCount % 20 === 0) {
            upgrade = 94
            flags |= 0b010000000000
            ws.send().vu(3).vi(0).vi(5).done()
            ws.send().vu(3).vi(1).vi(7).done()
            ws.send().vu(3).vi(2).vi(7).done()
            ws.send().vu(3).vi(4).vi(7).done()
            ws.send().vu(3).vi(5).vi(7).done()
          } else {
            upgrade = 94
            flags |= 0b010000000000
          }
          if (upgrade !== null)
            ws.send().vu(4).i8(upgrade).done()
          let now = Date.now() / 1000
          ws.send().vu(1).vu(flags).vf(Math.cos(now) * 1000000).vf(Math.sin(now) * 1000000).done()
          frameCount++
        }, 25)
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

    for (let bot of bots) {
      bot.renew(8 * 60e3)
    }

    monitor(msg, bots)
  },
  async pump({ args: [link, amount], commander, msg }) {
    let rateLimit = commander.checkRateLimit()
    if (rateLimit) {
      msg.reply(`You are being rate limited, please wait for ${ Math.ceil(rateLimit / 1000) } seconds.`)
      return
    }

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
  async renew({ args: [id, time], commander, msg }) {
    id = id.id()
    let minutes = time.valueOf()
    let ms = minutes * 60e3
    let maximum = Math.min(commander.maximum, 24 * 24 * 60)
    if (minutes <= 0 || minutes > maximum) {
      msg.reply(`Bot renewal can only be between 0 to ${ maximum } minutes.`)
    } else if (id === 'ALL') {
      if (commander.bots.length) {
        for (let bot of commander.bots.slice())
          bot.renew(ms)
        msg.reply('Renewed all bots.')
      } else {
        msg.reply('No bots found!')
      }
    } else {
      let bot = commander.bots.find(r => r.id === id)
      if (bot) {
        bot.renew(ms)
        msg.reply('Renewed bot.')
      } else {
        msg.reply('Bot not found!')
      }
    }
  },
  async party({ args: [link], commander, msg }) {
    let rateLimit = commander.checkRateLimit()
    if (rateLimit) {
      msg.reply(`You are being rate limited, please wait for ${ Math.ceil(rateLimit / 1000) } seconds.`)
      return
    }

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
  async eval({ args: [script], commander, msg }) {
    if (commander.perm < 5) return
    let out = null
    try {
      out = eval(script.rest())
    } catch(e) {
      out = e
    }
    try {
      out = util.inspect(out, {
        depth: 2,
        maxArrayLength: 30,
        breakLength: 120,
      })
    } catch(e) {
      try {
        out = `[${ typeof out }] ${ out }`
      } catch(e) {
        out = `[${ typeof out }]`
      }
    }
    msg.channel.send('Output: ```js\n' + out + '```', { split: { prepend: '```js\n', append: '```' } })
  },
  async ping({ msg }) {
    let uptime = Math.round(process.uptime())
    let out = ''
    for (let [corner, split, pad] of [[60, '', 2], [60, ':', 2], [24, ':', 2], [7, ' days ', 0], [Infinity, ' weeks ', 0]]) {
      let unit = uptime % corner
      uptime = Math.floor(uptime / corner)
      out = unit.toString().padStart(uptime ? pad : 0, '0') + split.replace(/s/g, unit === 1 ? '' : 's') + out
      if (!uptime)
        break
    }
    msg.reply('Ping!').then(reply => {
      reply.edit([
        `${ msg.author }, Ping!`,
        `Uptime: ${ out }`,
        `Latency: ${ reply.createdTimestamp - msg.createdTimestamp }ms`,
      ].join('\n'))
    })
  },
  async help({ msg }) {
    msg.reply([
      'List of commands:',
      '- create <region-mode code>              Connect and get a party link if one exists given its region-mode code',
      '- regions <region>                                  Get a list of region-mode codes for a game mode (game mode can be ffa, survival, teams, 4teams, dom, tag, maze, or sandbox)',
      '- connect <party link> [amount]        Connect to a diep server, used to expand arena',
      '- stalive <party link>                              Connect to a diep server and stay alive, respawning if necessary, used to prevent sandbox servers from dying',
      '- pump <party link> [amount]            Connect to a diep server and immediately leave',
      '- list                                                           List your bots with their ID and status',
      '- renew <id> <minutes>                       Renew a bot given its ID to a time in minutes',
      '- renew all <minutes>                           Renew all of your bots to a time in minutes',
      '- remove <id>                                         Remove a bot given its ID',
      '- remove all                                             Remove all of your bots',
      '- party <party link>                               Find all party links given a single link of a team server',
      '- tos                                                          Display the bot\'s term of service.',
      '',
      'Note that you are only given a limited number of bots, so use the remove command when you don\'t need them.',
      'By default you have 8 bots, but you can get more by joining the Discord server.',
      '',
      'Invite to the Discord server: <https://discord.gg/8gvUd3v>',
      'Invite to the bot: <https://discordapp.com/oauth2/authorize?client_id=398241406910726144&scope=bot&permissions=8>',
    ].join('\n'))
  },
  async tos({ msg }) {
    msg.reply('**Terms of Service**\n\nBy adding or using this bot on your Discord Server, you agree to let the bot store End User Data of its members, including but not limited to user IDs, usernames, and messages, and use that data for any purpose.')
  },
}

let execWebhook = (msg, embed) => {

}
let execCommand = (msg, argsString) => {
  let args = {
    toString() {
      let i = argsString.search(/\s+/)
      if (i === -1) i = argsString.length
      let segment = argsString.slice(0, i)
      argsString = argsString.slice(i).trim()
      return segment
    },
    rest() {
      let rest = argsString
      argsString = ''
      return rest
    },
    id() { return this.toString().toUpperCase().replace(/[^0-9A-Z]/g, '') },
    valueOf() { return (+this.toString() || 0) },
    link() { return linkParse(this.toString()) },
    integer(minimum = -Infinity, maximum = Infinity) {
      return Math.min(maximum, Math.max(minimum, Math.floor(+this.toString()) || 0))
    },
    async server() {
      let { id, party, source } = linkParse(this.toString())
      if (!id)
        throw new Error('Missing server ID!')
      let server = await findServer(id)
      server.id = id
      server.party = party
      server.source = source
      return server
    },
    async regionServer() {
      let [region, mode] = this.toString().split(':')
      if (!region || !mode)
        throw new Error('Missing region or mode!')
      let { servers } = await findAnyServer(mode)
      if (!servers[region])
        throw new Error('Server not found!')
      return servers[region]
    },

    next() {
      return {
        done: false,
        value: this,
      }
    },
    [Symbol.iterator]: function() { return this },
  }

  let command = commands[args.toString()]
  if (typeof command !== 'function') {
    msg.reply('Command not found!')
  } else {
    let commander = commanders[msg.author.id]
    if (!commander)
      commander = commanders[msg.author.id] = new Commander(msg.author.id)

    command({ msg, args, commander }).catch(e => {
      msg.reply('Error while executing command!')
      console.error(e)
    })
  }
}

let commanders = {}

let bot = new Discord.Client()
bot.on('ready', () => {
  if (SET_PLAYING)
    bot.user.setPresence({
      game: { name: `diep.io | ${ PREFIX }help | ${ bot.guilds.size } servers` }
    })
})
bot.on('guildCreate', () => {
  if (SET_PLAYING)
    bot.user.setPresence({
      game: { name: `diep.io | ${ PREFIX }help | ${ bot.guilds.size } servers` }
    })
})
bot.on('guildDelete', () => {
  if (SET_PLAYING)
    bot.user.setPresence({
      game: { name: `diep.io | ${ PREFIX }help | ${ bot.guilds.size } servers` }
    })
})
bot.on('message', msg => {
  if (msg.channel.id === WEBHOOK_PROCESSOR && msg.embeds.length === 1)
    execWebhook(msg, msg.embeds[0])
  else if (msg.content.startsWith(PREFIX) && !msg.author.bot)
    execCommand(msg, msg.content.slice(PREFIX.length).trim())
})
bot.login(TOKEN)
