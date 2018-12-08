const http = require('http')
const WebSocket = require('ws')
const Discord = require('discord.js')

const { PREFIX, TOKEN, IP_TEMPLATE } = require('./config.json')

const GetIp = {
  connected: {},
  random() {
    return IP_TEMPLATE.replace('?', Math.floor(Math.random() * 256).toString(16))
  },
  for(ip) {
    let connected = this.connected[ip]
    return this.random()
  },
}

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
      let int
      let success = false

      let ws = new WebSocket(`ws://[${ ipv6 }]:443`, {
        origin: 'http://diep.io',
        localAddress: GetIp.for(ipv6),
      })
      ws.on('open', () => {
        success = true
        if (amount <= 4)
          msg.reply('Connected to the server.')
        ws.send([5])
        ws.send(`\x009b9e4489cd499ded99cca19f4784fc929d21fc35\x00\x00${ party }\x00\x00`.split('').map(r => r.charCodeAt(0)))
        ws.send(`\x02\x00`.split('').map(r => r.charCodeAt(0)))
        int = setInterval(() => {
          ws.send([5])
          ws.send(movement)
        }, 30)
      })
      ws.on('close', () => {
        if (!success) return
        if (amount <= 4)
          msg.reply('Connection closed.')
        clearInterval(int)
      })
      ws.on('error', () => {
        if (amount <= 4)
          msg.reply('Unable to connect to the server!')
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

let server = new WebSocket.Server({ port: 1337 })
server.on('connection', ws => {
  ws.on('message', data => {
    movement = data
  })
})
