// ==UserScript==
// @name         Diep Packet Logger
// @description  Tool for logging diep.io websocket packets and various other things.
// @version      0.1
// @author       CX
// @namespace    *://diep.io/
// @match        *://diep.io/
// @grant        none
// ==/UserScript==

const Injector = window.Injector = window.Injector || (() => {
  let exports = null
  let exportPromise = new Promise(resolve => {
    window.__injectCall = result => {
      exports = result
      resolve(result)
    }
  })

  let appender = `;__injectCall({${
    ['Module', 'cp5', 'Runtime', 'Browser', 'ASM_CONSTS']
      .map(r => 'r: typeof r !== "undefined" && r'.replace(/r/g, r))
      .join(',')
  }})`

  let replaced = []
  let replacedWith = []

  let replace = (object, to) => {
    let { name } = to
    replaced.push(object[name])
    replacedWith.push(to)
    object['_' + name] = object[name]
    object[name] = to
  }

  replace(Function.prototype, function toString() {
    let index = replacedWith.indexOf(this)
    return this._toString.call(index === -1 ? this : replaced[index])
  })

  replace(document, function getElementById(id) {
    if (id !== 'textInput')
      return this._getElementById(id)
    this.getElementById = this._getElementById

    fetch(document.querySelector('script[src*="build_"]').src)
      .then(r => r.text())
      .then(r => r.replace(/use asm/, 'not asm'))
      .then(r => r.replace(/}\)\)?\(window\);?\s*$/, to => appender + to))
      .then(eval)

    throw new Error('Disabling default source')
  })

  return {
    get exports() {
      if (!exports)
        throw new Error('Exports are not yet ready!')
      return exports
    },
    maybeExports() {
      return exports
    },
    getExports() {
      return exportPromise
    },
    replace,
  }
})()

;(() => {
  let output = (content, color) => setTimeout(color
    ? console.log.bind(null, '%c' + content, color)
    : console.log.bind(null, content))
  let outputWarn = (content, color) => setTimeout(color
    ? console.warn.bind(null, '%c' + content, color)
    : console.warn.bind(null, content))
  let fields = window.fields = new Proxy(localStorage, {
    get(storage, id) {
      if (id === 'clear') return () => storage.fields = '[]'
      if (!storage.fields) storage.fields = '[]'
      return JSON.parse(storage.fields)[id]
    },
    set(storage, id, to) {
      if (!storage.fields) storage.fields = '[]'
      let object = JSON.parse(storage.fields)
      object[id] = to
      storage.fields = JSON.stringify(object)
    },
  })
  const CHARACTER_MAP = `\x20\u263A\u263B\u2665\u2666\u2663\u2660\u2022\u25D8\u25CB\u25D9\u2642\u2640\u21B5\u266B\u263C\u25BA\u25C4\u2195\u203C\xB6\xA7\u25AC\u21A8\u2191\u2193\u2192\u2190\u221F\u2194\u25B2\u25BC\xA0\x21\x22\x23\x24\x25\x26\x27\x28\x29*+\x2C-./0123456789\x3A\x3B\x3C\x3D\x3E\x3F@ABCDEFGHIJKLMNOPQRSTUVWXYZ\x5B\x5C\x5D\x5E_\x60abcdefghijklmnopqrstuvwxyz\x7B\x7C\x7D\x7E\u2302\xC7\xFC\xE9\xE2\xE4\xE0\xE5\xE7\xEA\xEB\xE8\xEF\xEE\xEC\xC4\xC5\xC9\xE6\xC6\xF4\xF6\xF2\xFB\xF9\xFF\xD6\xDC\xA2\xA3\xA5\u20A7\u0192\xE1\xED\xF3\xFA\xF1\xD1\xAA\xBA\xBF\u2310\xAC\xBD\xBC\xA1\xAB\xBB\u2591\u2592\u2593\u2502\u2524\u2561\u2562\u2556\u2555\u2563\u2551\u2557\u255D\u255C\u255B\u2510\u2514\u2534\u252C\u251C\u2500\u253C\u255E\u255F\u255A\u2554\u2569\u2566\u2560\u2550\u256C\u2567\u2568\u2564\u2565\u2559\u2558\u2552\u2553\u256B\u256A\u2518\u250C\u2588\u2584\u258C\u2590\u2580\u03B1\xDF\u0393\u03C0\u03A3\u03C3\xB5\u03C4\u03A6\u0398\u03A9\u03B4\u221E\u03C6\u03B5\u2229\u2261\xB1\u2265\u2264\u2320\u2321\xF7\u2248\xB0\u2219\xB7\u221A\u207F\xB2\u25A0\x20`
  const Writer = class {
    constructor() {
      let convo = new ArrayBuffer(4)
      this.bU8 = new Uint8Array(convo)
      this.bU16 = new Uint16Array(convo)
      this.bU32 = new Uint32Array(convo)
      this.bFloat = new Float32Array(convo)
      this.length = 0
      this.buffer = new Uint8Array(4096)
      this.encoder = new TextEncoder()
    }
    write(bytes) {
      this.buffer.set(this.bU8, this.length)
      this.length += bytes.length
    }
    u8(num) {
      this.buffer[this.length++] = num
    }
    u16(num) {
      this.bU16[0] = num
      this.write(2)
    }
    u32(num) {
      this.bU32[0] = num
      this.write(4)
    }
    float(num) {
      this.bFloat[0] = num
      this.write(4)
    }
    leb(num) {
      do {
        let part = num
        num >>>= 7
        if (num) part |= 0x80
        this.buffer[this.length++] = part
      } while (num)
    }
    sleb(num) {
      let sign = (num & 0x80000000) >>> 31
      if (sign) num = ~num
      let part = (num << 1) | sign
      num >>>= 6
      if (num) part |= 0x80
      this.buffer[this.length++] = part
      while (num) {
        let part = num
        num >>>= 7
        if (num) part |= 0x80
        this.buffer[this.length++] = part
      }
    }
    fleb(num) {
      this.bFloat[0] = num
      let o = 0
      let i = 0
      while (i < 4) {
        o <<= 8
        o |= this.bU8[i++]
      }
      o <<= 1
      i = 0
      do {
        let out = o
        o >>>= 7
        if (o) out |= 0x80
        else out &= 0x7f
        this.buffer[this.length++] = out
      } while (o)
    }
    string(str) {
      let bytes = this.encoder.encode(str)
      this.buffer.set(bytes, this.length)
      this.length += bytes.length
      this.u8(0)
    }
    out() {
      return this.buffer.buffer.slice(0, this.length)
    }
    dump() {
      return Array.from(this.buffer.subarray(0, this.length)).map(r => r.toString(16).padStart(2, 0)).join(' ')
    }
    empty() {
      this.length = 0
    }
  }
  const Reader = class {
    constructor(content) {
      let convo = new ArrayBuffer(4)
      this.bU8 = new Uint8Array(convo)
      this.bU16 = new Uint16Array(convo)
      this.bU32 = new Uint32Array(convo)
      this.bFloat = new Float32Array(convo)
      this.at = 0
      if (content)
        this.buffer = new Uint8Array(content)
      this.decoder = new TextDecoder()
    }
    read(bytes) {
      this.bU8.set(this.buffer.subarray(this.at, this.at += bytes))
    }
    u8() {
      return this.buffer[this.at++]
    }
    u16() {
      this.read(2)
      return this.bU16[0]
    }
    u32() {
      this.read(4)
      return this.bU32[0]
    }
    float() {
      this.read(4)
      return this.bFloat[0]
    }
    leb() {
      let out = 0
      let at = 0
      while (this.buffer[this.at] & 0x80) {
        out |= (this.buffer[this.at++] & 0x7f) << at
        at += 7
      }
      out |= this.buffer[this.at++] << at
      return out
    }
    sleb() {
      let out = 0
      let at = 0
      while (this.buffer[this.at] & 0x80) {
        out |= (this.buffer[this.at++] & 0x7f) << at
        at += 7
      }
      out |= this.buffer[this.at++] << at
      let sign = out & 1
      out >>= 1
      if (sign) out = ~out
      return out
    }
    fleb() {
      let at = this.at, i = 0, o = 0
      while (this.buffer[this.at] & 0x80) {
        this.at++
        i++
      }
      this.at++
      i++
      this.bU32[0] = 0
      while (i) {
        o <<= 7
        i--
        o |= this.buffer[at + i] & 0x7f
      }
      o >>>= 1
      i = 3
      while (i) {
        this.bU8[i--] = o
        o >>>= 8
      }
      return this.bFloat[0]
    }
    string() {
      let at = this.at
      while (this.buffer[this.at]) this.at++
      return this.decoder.decode(this.buffer.subarray(at, this.at++))
    }
    set(content) {
      this.at = 0
      this.buffer = new Uint8Array(content)
    }
  }
  const Logger = class {
    static createHexdump({ date, type, data }) {
      date = new Date(date)
      let timestamp = `${ date.getSeconds().toString().padStart(2) }.${ date.getMilliseconds().toString().padStart(3, '0') }`
      if (type === 2)
        return `= ${ timestamp }  ${ data }`
      let chunks = []
      for (let i = 0; i < data.length; i += 16)
        chunks.push(data.slice(i, i + 16))
      return chunks.map((d, i) => `${
        i ? '        ' : (type ? '<' : '>') + ' ' + timestamp
      }  ${
        Array
          .from(d)
          .map(c => c
            .toString(16)
            .padStart(2, '0'))
          .join(' ')
          .padEnd(48, ' ')
      } |${
        (Array
          .from(d)
          .map(c => CHARACTER_MAP[c])
          .join('') + '|')
          .padEnd(17, ' ')
      }`).join('\n')
    }
    constructor() {
      let that = this
      this.connections = []
      this.now = Date.now()
      this.main = null
      this.stopLog = 0
      WebSocket = class extends WebSocket {
        constructor(ip, ...arg) {
          super(location.search.slice(1) || ip, ...arg)
          let tracker = {
            ip,
            packets: [],
            socket: this,
            read: -1,
            quene: [],
            paused: false,
            realOnmessage: () => {},
            codes: [],
            filters: {},
            context: {
              objects: {},
              time: 0,
              destroyed: 0,
              updated: 0,
            },
            mouseBinary: [],
          }
          that.connections.push(tracker)
          super.addEventListener('message', ({ data }) => {
            data = new Uint8Array(data)
            tracker.packets.push({ date: Date.now(), type: 1, data })
          })
          setTimeout(() => {
            let realOnmessage = this.onmessage
            this.onmessage = ({ data }) => {
              if (tracker.paused) {
                tracker.quene.push(data)
              } else {
                realOnmessage({ data })
              }
            }
            tracker.realOnmessage = realOnmessage
          })
          this.send = (...arg) => {
            let data = new Uint8Array(arg[0])
            tracker.codes[data[0]] = data
            let filter = tracker.filters[data[0]]
            if (filter)
              data = new Uint8Array(filter(data))
            else if (data[0] === 1)
              tracker.mouseBinary = data
            // data[2] |= window.x || 0
            super.send(data)
            tracker.packets.push({ date: Date.now(), type: 0, data })
            that.main = tracker
          }
        }
      }
      let realInput
      let fakeInput
      Object.defineProperty(window, 'input', {
        get: () => fakeInput,
        set: to => {
          realInput = to
          fakeInput = {}
          for (let i in realInput)
            fakeInput[i] = (...arg) => {
              if (that.main)
                that.main.packets.push({ date: Date.now(), type: 2, data: `input.${i}(${arg.join(', ')})` })
              return realInput[i](...arg)
            }
        }
      })
      let realAlert = alert
      alert = text => {
        if (that.main)
          that.main.packets.push({ date: Date.now(), type: 2, data: `alert(${ text })` })
        realAlert(text)
      }
    }
    swapValues(packet) { /*
      let pattern = [0x00, 0x00, 0x80, 0x3f, 0x00, 0x00, 0xc0, 0x07]
      out:
      for (let i = 0; i < packet.length - pattern.length - 1; i++) {
        for (let j = 0; j < pattern.length; j++)
          if (pattern[j] !== packet[i + j])
            continue out
        packet.set(new Uint8Array([0x82, 0x00, 0x01]), i + 6)
        i += 9
      }
      pattern = [0xc0, 0x07]
      out2:
      for (let i = 0; i < packet.length - pattern.length - 1; i++) {
        for (let j = 0; j < pattern.length; j++)
          if (pattern[j] !== packet[i + j])
            continue out2
        packet.set(new Uint8Array([0x82, 0x00]), i)
        i += 2
      } */
    }
    /*process(packet, context) {
      packet = new Uint8Array(packet)
      if (packet[0] !== 0 || packet.length === 1) return
      let getObject = (num, id) => {
        return context.objects[num + '|' + id] || (context.objects[num + '|' + id] = {})
      }
      let reader = context.reader || (context.reader = new Reader())
      reader.set(packet)
      if (reader.leb()) return
      context.time = reader.leb()
      context.destroyed = reader.leb()
      for (let i = 0; i < context.destroyed; i++) {
        getObject(reader.leb(), reader.leb()).destroyed = true
      }
      context.updated = reader.leb()
      let normal = true
      out:
      for (let i = 0; i < context.updated; i++) {
        let object = getObject(reader.leb(), reader.leb())
        object.destroyed = false
        let modea = reader.leb()
        let modeb = reader.leb()
        if (modea !== 0 || modeb !== 1) {
          if (this.stopLog >= 2) {
            outputWarn(`Unknown: Mode ${ modea }/${ modeb } unsupported`)
            output(Logger.createHexdump({ date: Date.now(), type: 1, data: packet }))
          }
          normal = false
          this.swapValues(packet)
          break out
        }
        let id = reader.leb() ^ 1, c = 5000
        while (id) {
          let type = fields[id - 1]
          let val = object[id] || 0
          if (!type) {
            if (this.stopLog >= 1) {
              outputWarn(`Unknown: 0x${ (id - 1).toString(16).padStart(2, 0) }`)
              output(Logger.createHexdump({ date: Date.now(), type: 1, data: packet.slice(reader.at, reader.at + 16) }))
            }
            normal = false
            break out
          }
          switch (type) {
            case 'S?': val = reader.sleb(); break
            case 'U?': val = reader.leb(); break
            case 'E?': val = [reader.leb(), reader.leb()]; break
            case 'F4': val = reader.float(); break
            case 'T0': val = reader.string(); break
            default:
              let parts = type.split('/')
              let stype = parts[1]
              val = val || Array(+parts[0]).fill(0)
              let sid = reader.leb() ^ 1
              while (sid) {
                let sval
                switch (stype) {
                  case 'S?': sval = reader.sleb(); break
                  case 'U?': sval = reader.leb(); break
                  case 'B?': sval = reader.leb(); break
                  case 'F4': sval = reader.float(); break
                  case 'T0': sval = reader.string(); break
                }
                val[sid - 1] = sval
                let add = reader.leb() ^ 1
                if (add === 0) break
                if (--c <= 0) {
                  if (this.stopLog >= 0) {
                    outputWarn(`! Internal Overflow !`)
                    output(Logger.createHexdump({ date: Date.now(), type: 1, data: packet }))
                  }
                  normal = false
                  break out
                }
                sid += add
              }

          }
          object[id - 1] = val
          let add = reader.leb() ^ 1
          if (add === 0) break
          if (--c <= 0) {
            if (this.stopLog >= 0) {
              outputWarn(`! Overflow !`)
              output(Logger.createHexdump({ date: Date.now(), type: 1, data: packet }))
            }
            normal = false
            break out
          }
          id += add
        }
      }
      if (reader.at !== reader.buffer.length && this.stopLog >= 0 && normal) {
        outputWarn(`! Underflow !`)
        output(Logger.createHexdump({ date: Date.now(), type: 1, data: packet }))
      }
    }*/
    pause() {
      let main = this.main
      if ((main.paused = !main.paused)) {
        output('Paused incoming packet stream!')
      } else {
        output('Unpaused incoming packet stream!')
        for (let data of main.quene)
          main.realOnmessage({ data })
         main.quene.length = 0
      }
    }
    set(entity, field, to, out) {
      let getObject = (num, id) => {
        return context.objects[num + '|' + id] || (context.objects[num + '|' + id] = {})
      }
      let writer = new Writer()
      writer.u8(0)
      writer.u8(32)
      writer.u8(0)
      writer.u8(1)
      writer.leb(entity[0])
      writer.leb(entity[1])
      writer.u8(0)
      writer.u8(1)
      writer.leb((1 + field) ^ 1)
      switch (fields[field]) {
        case 'S?': writer.sleb(to); break
        case 'U?': writer.leb(to); break
        case 'E?': writer.leb(to[0]); writer.leb(to[1]); break
        case 'B?': writer.leb(to); break
        case 'F4': writer.float(to); break
        case 'T0': writer.string(to); break
        default:
          outputWarn('Unsupported field!')
          return
      }
      writer.u8(1)
      if (out)
        return writer
      this.fake(writer.out())
    }
    step(silent) {
      let main = this.main
      if (main.paused) {
        while (true) {
          let data = main.quene.shift()
          if (!data) {
            outputWarn('No quened packets!')
            break
          }
          if (new Uint8Array(data)[0] === 5) {
            main.realOnmessage({ data })
          } else {
            if (!silent)
              output(Logger.createHexdump({ date: Date.now(), type: 1, data: new Uint8Array(data) }))
            main.realOnmessage({ data })
            break
          }
        }
      } else if (!silent) {
        outputWarn('Incoming packet stream not paused!')
      }
    }
    dump() {
      return `# Diep Packet Logger\n- Origin:    ${ location.href }\n- URL:       ${ this.main.ip }\n- Timestamp: ${ this.now }\n- Date:      ${ new Date(this.now).toGMTString() }\n\n` +
      this.main.packets.map(Logger.createHexdump).join('\n')
    }
    readLive() {
      let main = this.main
      if (main.read === -1) {
        main.read = 0
        return `# Diep Packet Logger\n- Origin:    ${ location.href }\n- URL:       ${ main.ip }\n- Timestamp: ${ this.now }\n- Date:      ${ new Date(this.now).toGMTString() }`
      }
      if (main.read < main.packets.length)
        return Logger.createHexdump(main.packets[main.read++])
      return null
    }
    fake(data) {
      if (this.main)
        this.main.realOnmessage({
          data: new Uint8Array(typeof data === 'string' ? data.split('').map(r => r.charCodeAt(0)) : data)
        })
      else
        outputWarn('Connection not yet established!')
    }
    do(data) {
      this.fake(data.toString().match(/[a-fA-F0-9]{2}/g).map(r => parseInt(r, 16)))
    }
  }
  let logger = new Logger()
  let isLive = false
  let debugMode = false
  let videoMode = false
  let perfectMode = false
  let videoRecorder = new MediaRecorder(document.getElementById('canvas').captureStream(60))
  videoRecorder.ondataavailable = e => videoChunks.push(e.data)
  videoRecorder.onstop = e => {
    let file = new Blob(videoChunks, { 'type' : 'video/webm' })
    videoChunks.length = 0
    let objectURL = URL.createObjectURL(file)
    let element = document.createElement('a')
    element.style.display = 'none'
    element.setAttribute('download', 'video.webm')
    element.setAttribute('href', objectURL)
    document.body.appendChild(element)
    setTimeout(() => {
      URL.revokeObjectURL(objectURL)
      document.body.removeChild(element)
    }, 100)
    element.click()
    output('Video downloaded!')
  }
  let videoChunks = []
  let createSide = () => {
    let size = 0
    let righter = document.createElement('canvas')
    righter.style.position = 'absolute'
    righter.style.top = '0'
    righter.style.bottom = '0'
    righter.style.height = '100%'
    let lefter = document.getElementById('canvas')
    lefter.style.right = 'auto'
    lefter.style.width = 'auto'
    let ctx = righter.getContext('2d')
    let resize = () => {
      if (perfectMode) return
      righter.width = Math.round(window.innerWidth * size)
      lefter.width = window.innerWidth - righter.width
      righter.height = window.innerHeight
      lefter.height = window.innerHeight
      righter.style.left = lefter.width + 'px'
    }
    resize()
    window.onresize = resize
    document.body.appendChild(righter)
    return {
      setSize(to) {
        size = to / innerWidth
        resize()
      },
      getSize() {
        return size * innerWidth
      },
      ctx,
    }
  }
  let side = createSide()
  let ctx = side.ctx
  let trackMouse = () => {
    let buffer = new ArrayBuffer(4)
    let float32 = new Float32Array(buffer)
    let int32 = new Int32Array(buffer)
    let int8 = new Int8Array(buffer)
    let decrypt = arr => {
      int32[0] = 0
      let o = 0, i = arr.length
      while (i) {
        o <<= 7
        i--
        o |= arr[i] & 0x7f
      }
      o >>>= 1
      i = 3
      while (i) {
        int8[i--] = o
        o >>>= 8
      }
      return float32[0]
    }
    let lastMouse = []
    return () => {
      if (!logger.main) return null
      let mouse = logger.main.mouseBinary
      if (!mouse || lastMouse === mouse) return null
      let noChange = lastMouse.length === mouse.length
      if (noChange) {
        for (let i = 1; i < lastMouse.length; i++)
          if (lastMouse[i] !== mouse[i]) {
            noChange = false
            break
          }
        if (noChange) return
      }
      lastMouse = mouse
      let o = 3, p = 3
      let at = window.mouse = []
      while (p < mouse.length) {
        while (mouse[p] & 0x80)
          p++
        p++
        at.push(decrypt(mouse.slice(o, p)))
        o = p
      }
      return `(${ at.join(', ') }) ${ mouse[1] & 1 ? mouse[2] & 1 ? '●' : '◐' : mouse[2] & 1 ? '◑' : '○' } ${ ` ↑←↖↓↕↙←→↗↔↑↘→↓⭘`.charAt((mouse[1] >>> 1) & 0xf) }`
    }
  }
  let getMouse = trackMouse()
  let text = '...'
  let render = () => {
    ctx.fillStyle = '#eee'
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.fillStyle = '#000'
    ctx.font = '11px Roboto'
    ctx.fillText(`Time: ${ logger.main ? logger.main.context.time : null }`, 30, 20)
    ctx.fillText(text, 30, 50)
    if (logger.main) {
      for (let i in logger.main.context.objects) {
        let object = logger.main.context.objects[i]
        if (!object || object[0] == null || object[1] == null) continue
        ctx.globalAlpha = object.destroyed ? 0.05 : 0.5
        ctx.beginPath()
        ctx.arc(object[0] / 11150 * 150 + 150, object[1] / 11150 * 150 + 300, 1.5, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }
  }
  let logic = () => {
    let mouse = getMouse()
    if (mouse) text = mouse
  }
  let loop = () => {
    logic()
    if (side.getSize())
      render()
    requestAnimationFrame(loop)
  }
  document.addEventListener('keydown', e => {
    if (e.altKey)
      switch (e.key) {
        case 'r':
          if (isLive)
            clearInterval(isLive)
          else
            isLive = setInterval(() => {
              let log
              while (log = logger.readLive())
                if (log[0] === '#') {
                  console.groupEnd()
                  console.groupCollapsed(log)
                } else {
                  output(log)
                }
            }, 100)
          break
        case 'g':
          let element = document.createElement('a')
          let dump = new TextEncoder('utf8').encode(logger.dump())
          let objectURL = URL.createObjectURL(new Blob([ dump ], { type: 'text/plain' }))
          element.style.display = 'none'
          element.setAttribute('download', `packets-dump-${ logger.now }.log`)
          element.setAttribute('href', objectURL)
          document.body.appendChild(element)
          setTimeout(() => {
            URL.revokeObjectURL(objectURL)
            document.body.removeChild(element)
          }, 100)
          element.click()
          break
        case 'z':
          output(logger.dump())
          break
        case 'x':
          logger.pause()
          break
        case 'q':
          logger.step()
          break
        case 'm':
          debugMode = !debugMode
          input.set_convar('ren_fps', debugMode)
          input.set_convar('ren_debug_info', debugMode)
          input.set_convar('ren_debug_collisions', debugMode)
          input.set_convar('ren_raw_health_values', debugMode)
          input.set_convar('ren_minimap_viewport', debugMode)

          if (debugMode) {
            input.keyDown(76)
            let exports = Injector.maybeExports()
            if (exports && exports.Module && exports.Module.HEAPU8) {
              let search = '\x00%.1f\x00'.split('').map(r => r.charCodeAt(0))
              let replace = '\x00%.6f\x00'.split('').map(r => r.charCodeAt(0))
              let { HEAPU8 } = exports.Module
              main: for (let i = 0; i < 0x40000; i++) {
                for (let j = 0; j < search.length; j++) {
                  if (HEAPU8[i + j] !== search[j]) continue main
                }
                for (let j = 0; j < replace.length; j++) {
                  HEAPU8[i + j] = replace[j]
                }
                break
              }
            }
          } else {
            input.keyUp(76)
          }
          break
        case 'b':
          side.setSize(side.getSize() ? 0 : Math.max(250, innerWidth - Math.round(innerHeight / 9 * 16)))
          break
        case 'v':
          videoMode = !videoMode
          if (videoMode)
            videoRecorder.start()
          else
            videoRecorder.stop()
          break
        case 'p':
          perfectMode = !perfectMode
          if (perfectMode) {
            let canvas = document.getElementById('canvas')
            canvas.style.position = 'relative'
            canvas.width = 1920
            canvas.height = 1080
          } else {
            window.onresize()
          }
      }
  })
  loop()
  console.log('Diep Packet Logger - Debugger Hook')
  setTimeout(() => {
    output([
      '# Diep Packet Logger',
      '(R) Record live packets in console',
      '(G) Download dump',
      '(Z) Dump log into console',
      '(X) Pause packet stream',
      '(Q) Quened packet inspection',
      '(M) Toggle debug mode',
      '(B) Toggle sidebar',
      '(V) Videotape for copying',
      'Note: Press Alt+Key to use the shortcuts.',
    ].join('\n'), 'font-weight:bold')
  }, 1e3)
  window._ = window.logger = logger
})()
