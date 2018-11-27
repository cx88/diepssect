// ==UserScript==
// @name         HexEdit
// @description  A simple hex editor.
// @version      0.1
// @author       CX
// @namespace    *://diep.io/
// @match        *://diep.io/
// @grant        none
// @run-at       document-start
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

    fetch(document.getElementsByTagName('script')[0].src)
      .then(r => r.text())
      .then(r => r.replace(/}\)\)\(window\)\s*$/, to => appender + to))
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

;(async main => {
  'use strict'
  console.log(`[HexEdit] Injecting to get a buffer...`)
  let { Module } = await Injector.getExports()
  main(Module.buffer)
  console.log(`[HexEdit] Initialized editor with buffer of ${ Module.buffer.byteLength } bytes!`)

  let canvas = window.canvas
  if (canvas) {
    canvas.style.width =
    canvas.style.right =
      'auto'
  }
})(buffer => {
  const FONT_SIZE = 14
  const FONT_WIDTH = 7
  const LINE_HEIGHT = 18

  let width = (8 + 16 * 3 + 2 + 16 + 1 + 5) * FONT_WIDTH
  let canvas = document.body.appendChild(document.createElement('canvas'))
  canvas.style.position = 'absolute'
  canvas.style.right =
  canvas.style.top =
  canvas.style.bottom =
    '0'
  canvas.style.height = '100%'
  canvas.style.width = width + 'px'

  let input = document.body.appendChild(document.createElement('input'))
  input.spellcheck = false
  input.maxLength = 32
  input.placeholder = 'Search:'
  input.style.position = 'absolute'
  input.style.top = LINE_HEIGHT / 2 - 1 + 'px'
  input.style.right = FONT_WIDTH * 2 + 'px'
  input.style.height = LINE_HEIGHT + 'px'
  input.style.width = FONT_WIDTH * 32 + 'px'
  input.style.font = FONT_SIZE + 'px Ubuntu Mono'
  input.style.lineHeight = LINE_HEIGHT + 'px'
  input.style.background = 'transparent'
  input.style.color = '#ffffff'
  input.style.border = 'none'
  input.style.outline = 'none'

  let realSetTyping = window.setTyping
  let typing = false
  window.setTyping = to => { typing = to }

  let {
    fill, alpha, rect, circle,
    triangle, quad,
    beginShape, vertex, closeShape,
    font, text,
  } = (() => {
    let ctx = canvas.getContext('2d')
    let oldFontName = 'sans-serif'
    let shapeIsNew = false
    return {
      fill(color) { ctx.fillStyle = color },
      alpha(amount) { ctx.globalAlpha = amount },
      rect(x, y, w, h) { ctx.fillRect(x, y, w, h) },
      circle(x, y, r) {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, 2 * Math.PI)
        ctx.fill()
      },
      triangle(x1, y1, x2, y2, x3, y3) {
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x3, y3)
        ctx.fill()
      },
      quad(x1, y1, x2, y2, x3, y3, x4, y4) {
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.lineTo(x3, y3)
        ctx.lineTo(x4, y4)
        ctx.fill()
      },
      beginShape() {
        ctx.beginPath()
        shapeIsNew = true
      },
      vertex(x, y) {
        if (shapeIsNew) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      },
      endShape() { ctx.fill() },
      font(size, name = oldFontName) { ctx.font = size + 'px ' + (oldFontName = name) },
      text(text, x, y) { ctx.fillText(text, x, y) },
    }
  })()

  let formatHex = (number, length) => {
    let string = number.toString(16).toUpperCase().padStart(length, '0')
    if (string.length > length) {
      return '!' + string.slice(-length + 1)
    }
    return string
  }

  let u8 = new Uint8Array(buffer)
  let u16 = new Uint16Array(buffer)
  let u32 = new Uint32Array(buffer)
  let f32 = new Float32Array(buffer)
  let f64 = new Float64Array(buffer)

  let realOffsetY = 0
  let offsetY = 0
  let hoverRow = null
  let hoverPointer = null
  let hoverPointerIsLeft = true
  let focusPointer = 0
  let focusPointerHalf = null
  let focusPointerIsLeft = true
  let focusPointerSelection = null
  let oldPageStart = 0
  let oldArray = Array.from(u8.subarray(0, 800)).map(r => [r, 0])
  let getChar = char => {
    let r = String.fromCharCode(char)
    if (r === '\x00') {
      return ' '
    } else if (r === '\n') {
      return '\u21b5'
    } else if (r === ' ') {
      return '\u2022'
    } else if (r === '\xff') {
      return '\u25aa'
    }
    return /[!-~\xa1-\xac\xae-\xfe]/.test(r) ? r : '\ufffd'
  }
  let message = ''
  let bookmarks = [
    [0x10a58, 0x10a64, 'vector'], // arenas
    [0x10a64, 0x10a70, 'vector'], // profiles/names
    [0x10a70, 0x10a7c, 'vector'], // interfaces
    [0x10a7c, 0x10a88, 'vector'], // entities a
    [0x10a88, 0x10a94, 'vector'], // entities b
    [0x1cec8, 0x1ced4, 'vector'], // messages
  ]
  let drawerHeight = 300
  let format = {
    unknown: (start, end) => (end - start) + ' bytes',
    vector: start => `${ u32[(start >> 2) + 1] / 4 - u32[start >> 2] / 4 }/${ u32[(start >> 2) + 2] / 4 - u32[start >> 2] / 4 }`,
    buffer: start => `${ u32[(start >> 2) + 1] / 1 - u32[start >> 2] / 1 }/${ u32[(start >> 2) + 2] / 1 - u32[start >> 2] / 1 } bytes`,
    float: start => f32[start >> 2].toString(),
    double: start => f64[start >> 3].toString(),
    int: start => (u32[start >> 2] | 0).toString(),
    string: (start, end) => {
      let str = ''
      while (u8[start] && start < end) {
        str += getChar(u8[start++])
      }
      return str
    },
  }
  let goto = {
    vector: start => focusOnto(u32[start >> 2], u32[(start >> 2) + 1] - u32[start >> 2]),
    buffer: start => focusOnto(u32[start >> 2], u32[(start >> 2) + 1] - u32[start >> 2]),
  }
  let draw = () => {
    offsetY = offsetY * 0.8 + realOffsetY * 0.2
    if (offsetY < realOffsetY - 2000) offsetY = realOffsetY - 2000
    if (offsetY > realOffsetY + 2000) offsetY = realOffsetY + 2000
    if (offsetY <= 0) {
      realOffsetY = offsetY = 0
    } else if (offsetY >= 0x400000 * LINE_HEIGHT - (height - drawerHeight) + LINE_HEIGHT * 2) {
      realOffsetY = offsetY = 0x400000 * LINE_HEIGHT - (height - drawerHeight) + LINE_HEIGHT * 2
    }
    let pageStart = Math.floor(offsetY / LINE_HEIGHT)
    let pageStartSubdelta = offsetY % LINE_HEIGHT
    if (pageStart !== oldPageStart) {
      if (Math.abs(pageStart - oldPageStart) >= 800 / 16) {
        oldArray.splice(0, 800)
        for (let i = 0; i < 800; i++) {
          oldArray.push([u8[pageStart * 16 + i], 0])
        }
      } else if (pageStart < oldPageStart) { // scroll up
        let elements = (oldPageStart - pageStart) * 16
        oldArray.splice(800 - elements, elements)
        for (let i = 0; i < elements; i++) {
          oldArray.unshift([u8[pageStart * 16 + elements - i - 1], 0])
        }
      } else if (pageStart > oldPageStart) { // scroll down
        let elements = (pageStart - oldPageStart) * 16
        oldArray.splice(0, elements)
        for (let i = 0; i < elements; i++) {
          oldArray.push([u8[pageStart * 16 + 800 - elements + i], 0])
        }
      }
      oldPageStart = pageStart
    }

    fill('#ffffff')
    rect(0, 0, width, height)
    fill('#f7f7f7')
    rect(0, 0, FONT_WIDTH * 9, height)
    rect((9 + 16 * 3 + 1) * 7, 0, FONT_WIDTH * 18, height)

    if (hoverPointer !== null) {
      let hoverRow = Math.floor(hoverPointer / 16)
      let hoverColumn = hoverPointer % 16
      fill('#dae4ea')
      rect(Math.floor((9 + 1 + hoverColumn * 3 - 0.5) * FONT_WIDTH), LINE_HEIGHT * 2 - offsetY + LINE_HEIGHT * hoverRow, Math.ceil(FONT_WIDTH * 3), LINE_HEIGHT)
      rect(Math.floor((9 + 1 + 16 * 3 + 1 + hoverColumn) * FONT_WIDTH), LINE_HEIGHT * 2 - offsetY + LINE_HEIGHT * hoverRow, Math.ceil(FONT_WIDTH), LINE_HEIGHT)
    }
    if (focusPointerSelection !== null) {
      let [start, end] = focusPointerSelection
      for (let at = start; at < end; at++) {
        let row = Math.floor(at / 16)
        let column = at % 16
        fill('#bfeeff')
        rect(Math.floor((9 + 1 + column * 3 - 0.5) * FONT_WIDTH), LINE_HEIGHT * 2 - offsetY + LINE_HEIGHT * row, Math.ceil(FONT_WIDTH * 3), LINE_HEIGHT)
        rect(Math.floor((9 + 1 + 16 * 3 + 1 + column) * FONT_WIDTH), LINE_HEIGHT * 2 - offsetY + LINE_HEIGHT * row, Math.ceil(FONT_WIDTH), LINE_HEIGHT)
      }
    }

    let y = LINE_HEIGHT * 2 - pageStartSubdelta
    let lineAt = pageStart
    let lineAtOld = 0

    font(FONT_SIZE, 'Ubuntu Mono')
    let filter = ([start, end]) => start < lineAt * 16 + 16 && lineAt * 16 < end
    while (y < height - drawerHeight) {
      if (bookmarks.some(filter)) {
        fill('#ffff88')
        alpha(0.4)
        rect(0, LINE_HEIGHT * 2 - offsetY + LINE_HEIGHT * lineAt, width, LINE_HEIGHT)
      }

      let line = u8.slice(lineAt * 16, lineAt * 16 + 16)

      let centeredY = y + LINE_HEIGHT / 2
      for (let i = 0; i < 16; i++) {
        if (line[i] !== oldArray[lineAtOld * 16 + i][0]) {
          oldArray[lineAtOld * 16 + i] = [line[i], 1]
        }
        if (oldArray[lineAtOld * 16 + i][1] > 0.01) {
          alpha(Math.min(0.75, oldArray[lineAtOld * 16 + i][1]))
          fill('#8322d8')
          rect(Math.floor((9 + 1 + i * 3 - 0.5) * FONT_WIDTH), LINE_HEIGHT * 2 - offsetY + LINE_HEIGHT * lineAt, Math.ceil(FONT_WIDTH * 3), LINE_HEIGHT)
          oldArray[lineAtOld * 16 + i][1] = oldArray[lineAtOld * 16 + i][1] * 0.9
        }
      }
      alpha(1)
      fill('#777777')
      text(formatHex(lineAt, 6) + '0', 1 * FONT_WIDTH, centeredY)
      fill('#666666')
      for (let i = 4; i < 8; i++) {
        text(formatHex(line[i], 2), (9 + 1 + i * 3) * FONT_WIDTH, centeredY)
      }
      for (let i = 12; i < 16; i++) {
        text(formatHex(line[i], 2), (9 + 1 + i * 3) * FONT_WIDTH, centeredY)
      }
      fill('#000000')
      for (let i = 0; i < 4; i++) {
        text(formatHex(line[i], 2), (9 + 1 + i * 3) * FONT_WIDTH, centeredY)
      }
      for (let i = 8; i < 12; i++) {
        text(formatHex(line[i], 2), (9 + 1 + i * 3) * FONT_WIDTH, centeredY)
      }
      text(Array.from(line).map(getChar).map((r, x) => {
        let leftX = (9 + 1 + 16 * 3 + 1 + x) * FONT_WIDTH
        let centeredX = leftX + Math.floor(FONT_WIDTH / 2)
        if (r === '\u21b5') {
          fill('#999999')
          text('\u21b5', leftX - 1.5, centeredY + 0.5)
        } else if (r === '\u2022') {
          fill('#aaaaaa')
          circle(centeredX + 0.5, centeredY + 0.5, 1.5, 1.5)
        } else if (r === '\u25aa') {
          fill('#bbbbbb')
          rect(centeredX - 2, centeredY - 2, 5, 5)
        } else {
          return r
        }
        fill('#000000')
        return ' '
      }).join(''), (9 + 1 + 16 * 3 + 1) * FONT_WIDTH, centeredY)
      y += LINE_HEIGHT
      lineAt++
      lineAtOld++
    }

    let focusRow = Math.floor(focusPointer / 16)
    let focusColumn = focusPointer % 16
    fill('#6b9aba')
    rect(Math.floor((9 + 1 + focusColumn * 3 - 0.5) * FONT_WIDTH), LINE_HEIGHT * 2 - offsetY + LINE_HEIGHT * focusRow, Math.ceil(FONT_WIDTH * 3), LINE_HEIGHT)
    rect(Math.floor((9 + 1 + 16 * 3 + 1 + focusColumn) * FONT_WIDTH), LINE_HEIGHT * 2 - offsetY + LINE_HEIGHT * focusRow, Math.ceil(FONT_WIDTH), LINE_HEIGHT)
    fill('#ffffff')
    text(focusPointerHalf === null ? formatHex(u8[focusPointer], 2) : formatHex(focusPointerHalf, 1), Math.floor((9 + 1 + focusColumn * 3) * FONT_WIDTH), LINE_HEIGHT * 2 - offsetY + LINE_HEIGHT * (focusRow + 0.5))
    ;(r => {
      let leftX = (9 + 1 + 16 * 3 + 1 + focusColumn) * FONT_WIDTH
      let centeredX = leftX + Math.floor(FONT_WIDTH / 2)
      let centeredY = LINE_HEIGHT * 2 - offsetY + LINE_HEIGHT * (focusRow + 0.5)
      if (r === '\u21b5') {
        text('\u21b5', leftX - 1.5, centeredY + 0.5)
      } else if (r === '\u2022') {
        circle(centeredX + 0.5, centeredY + 0.5, 1.5, 1.5)
      } else if (r === '\u25aa') {
        rect(centeredX - 2, centeredY - 2, 5, 5)
      } else {
        text(r, Math.floor((9 + 1 + 16 * 3 + 1 + focusColumn) * FONT_WIDTH), LINE_HEIGHT * 2 - offsetY + LINE_HEIGHT * (focusRow + 0.5))
      }
    })(getChar(u8[focusPointer]))

    let scrollerHeight = 34
    let scrollerWidth = 12
    let scrollerValue = pageStart / 0x400000
    fill('#f8f8f8')
    rect(width - scrollerWidth, 0, scrollerWidth, height)
    fill(isScrolling ? '#aaaaaa' : '#cccccc')
    rect(width - scrollerWidth, LINE_HEIGHT * 2 + scrollerValue * (height - drawerHeight - LINE_HEIGHT * 2 - scrollerHeight), scrollerWidth, scrollerHeight)

    fill('#36363e')
    rect(0, 0, width, LINE_HEIGHT * 2)
    fill('#ffffff')
    text('Memory Hex Editor', 2 * FONT_WIDTH, 1 * LINE_HEIGHT)
    fill('#ffff88')
    text(message, 22 * FONT_WIDTH, 1 * LINE_HEIGHT)

    fill('#f8f8f8')
    rect(0, height - drawerHeight, width, drawerHeight)
    fill('#36363e')
    rect(0, height - drawerHeight, width, LINE_HEIGHT * 2)
    fill('#ffffff')
    text('Bookmarked Addresses', FONT_WIDTH * 2, height - drawerHeight + LINE_HEIGHT)
    y = height - drawerHeight + LINE_HEIGHT * 2
    let other = false
    for (let i of bookmarks) {
      if (other) {
        fill('#eeeef2')
        rect(0, y, width, LINE_HEIGHT)
      }
      fill('#333333')
      text(`${ formatHex(i[0], 7) }  to  ${ formatHex(i[1], 7) }  (${ i[2] }) (${ format[i[2]](i[0], i[1]) })`, FONT_WIDTH * 2, y + LINE_HEIGHT * 0.5)
      fill('#666666')
      if (goto[i[2]]) {
        text(`[goto] [type] [delete]`, width - FONT_WIDTH * 26, y + LINE_HEIGHT * 0.5)
      } else {
        text(`[type] [delete]`, width - FONT_WIDTH * 19, y + LINE_HEIGHT * 0.5)
      }
      y += LINE_HEIGHT
      other = !other
    }
    if (other) {
      fill('#eeeef2')
      rect(0, y, width, LINE_HEIGHT)
    }
    if (isDraggingDrawer || Math.abs(height - drawerHeight - mouse.y) <= 4 && mouse.x > 0) {
      canvas.style.cursor = 'row-resize'
    } else {
      canvas.style.cursor = ''
    }

    realSetTyping(mouse.in || document.activeElement === input || typing)
  }

  let focusOnto = (at, length, multiple = 1) => {
    if (at === null) return
    if (Array.isArray(at)) {
      for (let i of at) {
        let start = i * multiple
        let end = (i + length) * multiple
        bookmarks.push([ start, end, 'unknown' ])
      }
      return
    }
    at *= multiple
    length *= multiple
    if (at >= 0x4000000) return
    realOffsetY = at / 16 * LINE_HEIGHT - (height - drawerHeight - LINE_HEIGHT * 2) / 2
    focusPointer = at
    if (length) {
      focusPointerSelection = [focusPointer, focusPointer + length, 0]
    }
  }

  let keydown = e => {
    let { ctrlKey, keyCode, key } = e
    switch (ctrlKey ? -keyCode : keyCode) {
      case -71: // ctrl+g
        input.value = 'g0x' + u32[focusPointer >> 2].toString(16)
        input._focus()
        e.preventDefault()
        focusPointerHalf = null
        break
      case -66: { // ctrl+b
        let [start, end] = focusPointerSelection
        let canBeVec = end - start === 12
        let canBeInt = end - start === 4
        let canBeLong = end - start === 8
        bookmarks.push([ start, end, canBeVec ? 'vector' : canBeInt ? 'float' : canBeLong ? 'double' : 'unknown' ])
        focusPointerHalf = null
        break
      }
      case -67: { // ctrl+c
        let [start, end] = focusPointerSelection
        let text = Array.from(u8.slice(start, end)).map(r => r.toString(16).padStart(2, '0')).join(' ')
        let input = document.createElement('input')
        input.setAttribute('value', text)
        document.body.appendChild(input)
        input.select()
        document.execCommand('copy')
        input.remove()
        break
      }
      case 33: // page up
        realOffsetY -= window.innerHeight * 0.8
        focusPointerHalf = null
        break
      case 34: // page up
        realOffsetY += window.innerHeight * 0.8
        focusPointerHalf = null
        break
      case 37: // left
        focusPointer--
        focusPointerHalf = null
        break
      case 38: // top
        focusPointer -= 16
        focusPointerHalf = null
        break
      case 39: // right
        focusPointer++
        focusPointerHalf = null
        break
      case 40: // bottom
        focusPointer += 16
        focusPointerHalf = null
        break
      case 8: // backspace
        if (focusPointerHalf !== null) {
          focusPointerHalf = null
        } else if (focusPointerSelection) {
          let [start, end] = focusPointerSelection
          for (let i = start; i < end; i++) {
            u8[i] = 0
          }
          focusPointerSelection = null
        } else {
          u8[focusPointer] = 0
          focusPointer--
        }
        break
      case 46: // delete
        focusPointerHalf = null
        if (focusPointerSelection) {
          let [start, end] = focusPointerSelection
          for (let i = start; i < end; i++) {
            u8[i] = 0
          }
          focusPointerSelection = null
        } else {
          u8[focusPointer] = 0
        }
        break
      default:
        if (focusPointerIsLeft) {
          if (/^[0-9a-f]$/.test(key)) {
            if (focusPointerHalf === null) {
              focusPointerHalf = parseInt(key, 16)
            } else {
              u8[focusPointer] = focusPointerHalf * 16 + parseInt(key, 16)
              focusPointerHalf = null
              focusPointer++
            }
          }
        } else {
          if (key.length === 1) {
            u8[focusPointer] = key.charCodeAt(0)
            focusPointerHalf = null
            focusPointer++
          }
        }
    }
    if (focusPointer < 0) focusPointer = 0
    if (focusPointer >= 0x4000000) focusPointer = 0x4000000 - 1
  }
  let searchString = (haystack, needle, current, mode) => {
    if (mode === 2) {
      let all = []
      loop: for (let i = 0; i < haystack.length; i++) {
        for (let j = 0; j < needle.length; j++) {
          if (haystack[i + j] !== needle[j]) {
            continue loop
          }
        }
        all.push(i)
      }
      return all
    } else if (mode === 1) {
      searchLoop: for (let i = current - 1; i >= 0; i--) {
        for (let j = 0; j < needle.length; j++) {
          if (haystack[i + j] !== needle[j]) {
            continue searchLoop
          }
        }
        return i
      }
      researchLoop: for (let i = haystack.length - 1; i >= current; i--) {
        for (let j = 0; j < needle.length; j++) {
          if (haystack[i + j] !== needle[j]) {
            continue researchLoop
          }
        }
        return i
      }
    } else {
      searchLoop: for (let i = current + 1; i < haystack.length; i++) {
        for (let j = 0; j < needle.length; j++) {
          if (haystack[i + j] !== needle[j]) {
            continue searchLoop
          }
        }
        return i
      }
      researchLoop: for (let i = 0; i <= current; i++) {
        for (let j = 0; j < needle.length; j++) {
          if (haystack[i + j] !== needle[j]) {
            continue researchLoop
          }
        }
        return i
      }
    }
    return null
  }
  let keytype = ({ shiftKey, keyCode, key }) => {
    if (keyCode !== 13) return
    let search = input.value.trim()
    let searchAll = false
    if (search.length > 1 && search.charAt(0) === 'a') {
      searchAll = true
      search = search.slice(1)
    }
    let type = ''
    if (search.length > 1) {
      type = search.charAt(0)
      search = search.slice(1)
    }
    let mode = searchAll ? 2 : shiftKey ? 1 : 0
    switch (type) {
      case 't': {
        let needle = new Uint8Array(search.split('').map(r => r.charCodeAt(0)))
        let result = searchString(u8, needle, focusPointer, mode)
        if (result !== null) {
          focusOnto(result, needle.length)
          message = ''
        } else {
          message = 'No matches found.'
        }
        break
      }
      case 'u': {
        let needle = new Uint32Array(search.split(',').map(r => +r.trim()))
        let result = searchString(u32, needle, focusPointer >> 2, mode)
        if (result !== null) {
          focusOnto(result, needle.length, 4)
          message = ''
        } else {
          message = 'No matches found.'
        }
        break
      }
      case 'f': {
        let needle = new Float32Array(search.split(',').map(r => +r.trim()))
        let result = searchString(f32, needle, focusPointer >> 2, mode)
        if (result !== null) {
          focusOnto(result, needle.length, 4)
          message = ''
        } else {
          message = 'No matches found.'
        }
        break
      }
      case 'g': {
        focusOnto(+search.trim())
        break
      }
      default: {
        message = 'Command not found!'
      }
    }
  }
  let keyup = ({ keyCode, key }) => {}
  let isScrolling = false
  let isDraggingDrawer = false
  let mousedown = () => {
    let scrollerHeight = 34
    let scrollerWidth = 12
    let scrollerValue = offsetY / LINE_HEIGHT / 0x400000
    let scrollerRange = height - drawerHeight - LINE_HEIGHT * 2 - scrollerHeight
    if (mouse.down && mouse.x > width - scrollerWidth &&
        mouse.y >= LINE_HEIGHT * 2 + scrollerValue * scrollerRange &&
        mouse.y <= scrollerHeight + LINE_HEIGHT * 2 + scrollerValue * scrollerRange) {
      isScrolling = true
    } else if (mouse.down && Math.abs(height - drawerHeight - mouse.y) <= 4 && mouse.x > 0) {
      isDraggingDrawer = true
    } else if (hoverPointer !== null) {
      focusPointer = hoverPointer
      focusPointerHalf = null
      focusPointerIsLeft = hoverPointerIsLeft
      focusPointerSelection = [focusPointer, focusPointer + 1, 1]
    } else if (hoverRow !== null && mouse.x <= FONT_WIDTH * 9) {
      bookmarks.push([ hoverRow * 16, hoverRow * 16 + 16, 'unknown' ])
    }
  }
  let mouseup = () => {
    isScrolling = false
    isDraggingDrawer = false
    if (focusPointerSelection) {
      focusPointerSelection[2] = 0
    }
  }
  let mousemove = () => {
    if (isDraggingDrawer && mouse.dy !== 0) {
      drawerHeight -= mouse.dy
      if (drawerHeight < LINE_HEIGHT * 2) {
        drawerHeight = LINE_HEIGHT * 2
      } else if (drawerHeight > height - LINE_HEIGHT * 2) {
        drawerHeight = height - LINE_HEIGHT * 2
      }
      return
    }
    if (mouse.y >= height - drawerHeight || mouse.y <= LINE_HEIGHT * 2) {
      hoverRow = null
      hoverPointer = null
      return
    }
    if (hoverPointer !== null && mouse.down) {
      focusPointer = hoverPointer
      focusPointerHalf = null
      focusPointerIsLeft = hoverPointerIsLeft
      if (focusPointerSelection && focusPointerSelection[2] !== 0) {
        if (focusPointerSelection[2] === 1) { // ltr selection
          focusPointerSelection[1] = focusPointer + 1
        } else { // rtl selection
          focusPointerSelection[0] = focusPointer
        }
        if (focusPointerSelection[1] <= focusPointerSelection[0]) {
          focusPointerSelection[2] *= -1
          let tmp = focusPointerSelection[1]
          focusPointerSelection[1] = focusPointerSelection[0] + 1
          focusPointerSelection[0] = tmp - 1
        }
      }
    }
    hoverRow = Math.floor((mouse.y + offsetY) / LINE_HEIGHT - 2)
    let hoverColumn = Math.floor((mouse.x / FONT_WIDTH - (9 + 1 - 0.5)) / 3)
    let hoverColumnText = Math.floor(mouse.x / FONT_WIDTH - (9 + 1 + 16 * 3 + 1))
    if (hoverRow < 0) {
      hoverPointer = null
    } else if (hoverColumn >= 0 && hoverColumn < 16) {
      hoverPointer = hoverRow * 16 + hoverColumn
      hoverPointerIsLeft = true
    } else if (hoverColumnText >= 0 && hoverColumnText < 16) {
      hoverPointer = hoverRow * 16 + hoverColumnText
      hoverPointerIsLeft = false
    } else {
      hoverPointer = null
    }
    let scrollerHeight = 34
    let scrollerWidth = 12
    let scrollerValue = offsetY / LINE_HEIGHT / 0x400000
    let scrollerRange = height - drawerHeight - LINE_HEIGHT * 2 - scrollerHeight
    if (isScrolling && mouse.dy !== 0) {
      scrollerValue += mouse.dy / scrollerRange
      realOffsetY = offsetY = scrollerValue * LINE_HEIGHT * 0x400000
    }
  }
  let click = () => {
    let hoverRow = Math.floor((mouse.y - height + drawerHeight) / LINE_HEIGHT - 2)
    if (hoverRow >= 0 && hoverRow < bookmarks.length) {
      // text(`[type] [delete]`, width - FONT_WIDTH * 19, y + LINE_HEIGHT * 0.5)
      // text(`[goto] [type] [delete]`, width - FONT_WIDTH * 26, y + LINE_HEIGHT * 0.5)
      if (mouse.x >= width - FONT_WIDTH * 12.5) {
        bookmarks.splice(hoverRow, 1)
      } else if (mouse.x >= width - FONT_WIDTH * 19.5) {
        let bookmark = bookmarks[hoverRow]
        let now = bookmark[2]
        let canBeVec = bookmark[1] - bookmark[0] === 12
        let canBeInt = bookmark[1] - bookmark[0] === 4
        let canBeLong = bookmark[1] - bookmark[0] === 8
        bookmark[2] =
          now === 'unknown' ? canBeVec ? 'vector' : canBeInt ? 'float' : canBeLong ? 'double' : 'string' :
          now === 'vector' ? 'buffer' : now === 'buffer' ? 'string' :
          now === 'float' ? 'int' : now === 'int' ? 'string' :
          now === 'double' ? 'string' :
          now === 'string' ? 'unknown' : 'unknown'
      } else if (mouse.x >= width - FONT_WIDTH * 26.5 && goto[bookmarks[hoverRow][2]]) {
        let [start, end, type] = bookmarks[hoverRow]
        goto[type](start, end)
      } else {
        let [start, end] = bookmarks[hoverRow]
        focusOnto(start, end - start)
      }
    }
  }
  let scroll = amount => {
    realOffsetY += amount
  }

  let loop = () => {
    mouse.dx = mouse.dy = 0
    mousemove()
    draw()
    requestAnimationFrame(loop)
  }

  HTMLElement.prototype._focus = HTMLElement.prototype.focus
  HTMLElement.prototype.focus = () => {}
  HTMLElement.prototype._blur = HTMLElement.prototype.blur
  HTMLElement.prototype.blur = () => {}

  let getInnerWidth = Object.getOwnPropertyDescriptor(window, 'innerWidth').get
  let onResize = window.onresize
  canvas.width = width
  let height
  let mouse = {
    x: 0,
    y: 0,
    dx: 0,
    dy: 0,
    down: false,
    inCanvas: false,
    inInput: false,
    get in() {
      return mouse.inCanvas || mouse.inInput
    },
  }
  window.onresize = () => {
    window.innerWidth = getInnerWidth() - width
    height = canvas.height = window.innerHeight
    canvas.getContext('2d').textBaseline = 'middle'
    onResize()
    mouse.dx = mouse.dy = 0
    mousemove()
    draw()
  }
  canvas.addEventListener('mouseover', e => {
    mouse.inCanvas = true
  }, false)
  canvas.addEventListener('mouseout', e => {
    mouse.inCanvas = false
  }, false)
  input.addEventListener('mouseover', e => {
    mouse.inInput = true
  }, false)
  input.addEventListener('mouseout', e => {
    mouse.inInput = false
  }, false)
  canvas.addEventListener('mousedown', e => {
    mouse.down = true
    mousedown()
  }, false)
  window.addEventListener('mouseup', e => {
    mouse.down = false
    mouseup()
  }, false)
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX - getInnerWidth() + width
    mouse.y = e.clientY
    mouse.dx = e.movementX
    mouse.dy = e.movementY
    mousemove()
  }, false)
  canvas.addEventListener('wheel', e => {
    scroll(e.deltaY)
  }, false)
  canvas.addEventListener('click', e => {
    mouse.x = e.clientX - getInnerWidth() + width
    mouse.y = e.clientY
    click()
  }, false)
  let oldKeydown = window.onkeydown
  window.onkeydown = e => {
    if (document.activeElement === input) {
      keytype(e)
    } else if (mouse.in) {
      keydown(e)
    } else if (oldKeydown) {
      oldKeydown(e)
    }
  }
  let oldKeyup = window.onkeyup
  window.onkeyup = e => {
    if (document.activeElement === input) {
    } else if (mouse.in) {
      keyup(e)
    } else if (oldKeyup) {
      oldKeyup(e)
    }
  }
  window.focusOnto = focusOnto
  onresize()
  loop()
})

