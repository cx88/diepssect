// ==UserScript==
// @name         Diep Packet & Memory Analyzer
// @namespace    *://diep.io/
// @version      0.1
// @description  Like a combination of WireShark and Cheat Engine but for WebSockets and WebAssembly memory segments
// @author       CX
// @match        *://diep.io/
// @grant        none
// ==/UserScript==

const Injector = window.Injector = window.Injector || {
  replaced: [],
  replacedWith: [],
  firstReplacement: true,
  replace(object, to) {
    if (this.firstReplacement) {
      this.firstReplacement = false
      this.replace(Function.prototype, function toString() {
        let index = Injector.replacedWith.indexOf(this)
        return this._toString.call(index === -1 ? this : Injector.replaced[index])
      })
    }

    let { name } = to
    this.replaced.push(object[name])
    this.replacedWith.push(to)
    object['_' + name] = object[name]
    object[name] = to
  },
  exports: ['Module', 'cp5', 'Runtime', 'Browser', 'ASM_CONSTS'],
  exportPromise: null,
  export() {
    let appender = `;window.injectCall({${
      this.exports.map(r => 'r: typeof r !== "undefined" && r'.replace(/r/g, r)).join(',')
    }})`

    if (!this.exportPromise) {
      this.exportPromise = new Promise(resolve => window.injectCall = resolve)
      this.replace(document, function getElementById(id) {
        if (id !== 'textInput')
          return this._getElementById(id)
        this.getElementById = this._getElementById

        fetch(document.getElementsByTagName('script')[0].src)
          .then(r => r.text())
          .then(r => r.replace(/}\)\)\(window\)\s*$/, to => appender + to))
          .then(eval)

        throw new Error('Disabling default source')
      })
    }

    return this.exportPromise
  },
}

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

    let getCoordinate = e => {
      let { left, top } = e.target.getBoundingClientRect();
      to.x = e.clientX - rect.left
      to.y = e.clientY - rect.top
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
    this.parent = parent || null
  }
  render(c, x, y, width, height) {}
}

const ComponentTable = class extends Component {
  constructor(parent) {
    super(parent)

    this.children = []
    this.draggable = false
  }
  render(c, x, y, width, height) {

  }
  createChild(child) {
    this.children.push(createChild)
  }
}

const Application = class extends ComponentTable {
  constructor() {
    super()

  }
  async init() {
    this.specials = await Injector.export()

    let loop = () => {
      this.render()
      requestAnimationFrame(loop)
    }
    loop()
  }
}

new Application().init()
