const BUILD = '9b9e4489cd499ded99cca19f4784fc929d21fc35'
const SHOW_PACKETS = process.argv.includes('--show-packets')

const WebSocket = this.WebSocket || require('ws')

// https://api.n.m28.io/endpoint/latency/findEach/

let ws = new WebSocket('ws://140.82.25.222:443/', null, {
  origin: 'http://diep.io'
})

let logPacket = (dataUnknown, from) => {
  let data = Array.from(dataUnknown)
  if (SHOW_PACKETS)
    console.log(`[WS] ${ from } ${ data.map(r => r.toString(16).padStart(2, '0')).join(' ') }`)
}
let send = data => {
  logPacket(data, '>')
  ws.send(new Uint8Array(data))
}

ws.on('open', () => {
  console.log('[WS] Opened')

  send([5])
  send([0, ...BUILD.split('').map(r => r.charCodeAt(0)), 0, 0, 0, 0])
})
ws.on('message', data => {
  let u8 = new Uint8Array(data)
  logPacket(u8, '<')

  switch (u8[0]) {
    case 1:
      console.log('Client outdated!')
      break
    case 4:
      console.log('Server status:', Array.from(data).slice(1).map(r => r ? String.fromCharCode(r) : '; ').join(''))
      break
    case 6:
      console.log('Party link:', data)
      break
    case 7:
      console.log('Client accepted!')
      break
  }
})
