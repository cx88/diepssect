// ==UserScript==
// @name         Diep Packet & Memory Analyzer
// @description  Like a combination of WireShark and Cheat Engine but for WebSockets and WebAssembly memory segments
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
    getExports() {
      return exportPromise
    },
    replace,
  }
})()

const Shape = class {
  constructor(ctx) {
    this.ctx = ctx
    this.points = []
  }
  vertex(x, y) {
    this.points.push([x, y])
  }
  render() {
    this.ctx.beginPath()
    for (let [x, y] of this.points)
      this.ctx.vertex(x, y)
  }
  close() {
    this.render()
    this.ctx.closePath()
    this.ctx.fill()
  }
  done() {
    this.render()
    this.ctx.fill()
  }
}

const Canvas = class {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.oldFontName = 'sans-serif'

    let mouse = {
      x: 0, y: 0,
      dx: 0, dy: 0,
      scroll: 0,
      click: null,
      left: false,
      right: false,
    }

    let getCoordinate = (e, to) => {
      let { left, top } = e.target.getBoundingClientRect();
      to.x = e.clientX - left
      to.y = e.clientY - top
      to.dx = e.movementX
      to.dy = e.movementY
    }

    canvas.addEventListener('click', e => {
      getCoordinate(e, mouse.click = {})
    }, false)
    canvas.addEventListener('mousedown', e => {
      getCoordinate(e, mouse)
      if (e.button === 0)
        mouse.left = true
      else if (e.button === 2)
        mouse.right = true
    }, false)
    canvas.addEventListener('mouseup', e => {
      getCoordinate(e, mouse)
      if (e.button === 0)
        mouse.left = false
      else if (e.button === 2)
        mouse.right = false
    }, false)
    canvas.addEventListener('mousemove', e => {
      getCoordinate(e, mouse)
    }, false)
    canvas.addEventListener('wheel', e => {
      mouse.scroll += e.deltaY
    }, false)

    this.mouse = mouse
  }
  size(width, height) {
    let needsUpdate =
      width !== this.canvas.width ||
      height !== this.canvas.height
    if (needsUpdate) {
      this.canvas.width = width
      this.canvas.height = height
      this.ctx.textBaseline = 'middle'
    }
    return [width, height, needsUpdate]
  }
  fill(color) {
    this.ctx.fillStyle = color
  }
  alpha(amount) {
    this.ctx.globalAlpha = amount
  }
  rect(x, y, w, h) {
    this.ctx.fillRect(x, y, w, h)
  }
  circle(x, y, r) {
    this.ctx.beginPath()
    this.ctx.arc(x, y, r, 0, 2 * Math.PI)
    this.ctx.fill()
  }
  triangle(x1, y1, x2, y2, x3, y3) {
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.lineTo(x3, y3)
    this.ctx.fill()
  }
  quad(x1, y1, x2, y2, x3, y3, x4, y4) {
    this.ctx.beginPath()
    this.ctx.moveTo(x1, y1)
    this.ctx.lineTo(x2, y2)
    this.ctx.lineTo(x3, y3)
    this.ctx.lineTo(x4, y4)
    this.ctx.fill()
  }
  createShape() {
    return new Shape(this.ctx)
  }
  font(size, name = this.oldFontName) {
    this.ctx.font = size + 'px ' + (this.oldFontName = name)
  }
  text(text, x, y) {
    this.ctx.fillText(text, x, y)
  }
}

const Component = class {
  constructor(parent) {
    this.parent = [parent, ...parent.parent]
    // this.minWidth = null
    // this.minHeight = null
  }
  render(c, x, y, width, height) {}
}

const ComponentTable = class extends Component {
  constructor(parent, horizontal = false) {
    super(parent)

    this.horizontal = horizontal
    this.children = []
    this.draggable = false
  }
  render(c, x, y, width, height) {
    this.normalizeChildrenSizes()
    let start = 0
    for (let { size, child } of this.children) {
      if (this.horizontal)
        child.render(c, y + start * width, y, size * width, height)
      else
        child.render(c, x, y + start * height, width, size * height)
      start += size
    }
  }
  createChild(Class, ...args) {
    let child = new Class(this, ...args)
    this.children.push({ child, size: this.children.length ? 1 / this.children.length : 1 })
    return child
  }
  normalizeChildrenSizes() {
    let totalSize = 0
    for (let { size } of this.children) {
      totalSize += size
    }
    if (totalSize !== 1)
      for (let element of this.children) {
        element.size = element.size / totalSize
      }
  }
}

const Console = class extends Component {
  constructor(parent) {
    super(parent)
  }
  render(c, x, y, width, height) {
    c.fill('#000000')
    c.rect(x, y, width, height)
    c.fill('#ffffff')
    c.rect(x + 2, y + 2, width - 4, height - 4)
  }
}

const Application = class extends ComponentTable {
  constructor(exports) {
    super({ parent: [] })

    this.width = 200
    window.canvas.style.width = window.canvas.style.right = 'auto'
    window.onresize = () => {
      window.canvas.height = window.innerHeight
      window.canvas.width = window.innerWidth - this.width
    }
    window.onresize()

    let canvas = document.body.appendChild(document.createElement('canvas'))
    canvas.style.position = 'absolute'
    canvas.style.right =
    canvas.style.top =
    canvas.style.bottom =
      '0'
    canvas.style.height = '100%'
    canvas.style.width = 'auto'
    this.canvas = new Canvas(canvas)

    this.console = this.createChild(Console)

    this.loop()
  }
  loop() {
    this.canvas.size(this.width, window.innerHeight)
    this.render(this.canvas, 0, 0, this.width, window.innerHeight)
    requestAnimationFrame(() => this.loop())
  }
}


console.log(`[DPMA] Starting!`)
Injector.getExports().then(() => new Application().loop())
