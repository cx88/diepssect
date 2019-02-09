const Injector = require('./injector.js')
const Canvas = require('./canvas.js')

const Component = class {
  constructor(parent) {
    this.parent = [parent, ...parent.parent]
  }
  render(c, x, y, width, height) {
    console.warn('Component missing render function!', this)
  }
}

const ComponentTable = class extends Component {
  constructor(parent, horizontal = false) {
    super(parent)

    this.horizontal = horizontal
    this.children = []
    this.draggable = false
    this.size = 0
  }
  render(c, x, y, width, height) {
    let start = 0
    if (this.horizontal) {
      this.resize(width)
      for (let { size, child } of this.children) {
        child.render(c, x + start, y, size, height)
        start += size
      }
    } else {
      this.resize(height)
      for (let { size, child } of this.children) {
        child.render(c, x, y + start, width, size)
        start += size
      }
    }
  }
  createChild(Class, ...args) {
    let child = new Class(this, ...args)
    let size = this.children.length ? Math.floor(this.size / this.children.length) : 1024
    this.children.push({ child, size })
    this.size += size
    return child
  }
  resize(neededSize) {
    if (this.size === neededSize) return
    let positionOld = 0
    let positionNew = 0
    for (let element of this.children) {
      positionOld += element.size
      let position = Math.round(positionOld / this.size * neededSize)
      element.size = position - positionNew
      positionNew = position
    }
    this.size = neededSize
  }
}

const Scrollable = class extends Component {
  constructor(parent) {
    super(parent)
    this.position = 0
    this.height = 0
  }
  render(c, x, y, width, height) {
  }
  renderSection(c, x, y, width, height, delta) {
    console.warn('Scrollable missing renderSection function!', this)
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
  constructor() {
    super({ parent: [] })

    this.canvas = this.createCanvas()
    this.console = this.createChild(Console)
    this.loop()
  }
  createCanvas() {
    let leftCanvas = window.canvas
    leftCanvas.style.width = 'auto'
    leftCanvas.style.right = 'auto'

    let canvas = document.body.appendChild(document.createElement('canvas'))
    canvas.style.position = 'absolute'
    canvas.style.right = '0'
    canvas.style.top = '0'
    canvas.style.bottom = '0'
    canvas.style.height = '100%'
    canvas.style.width = 'auto'

    window.onresize = () => {
      window.canvas.height = window.innerHeight
      window.canvas.width = window.innerWidth - canvas.width
    }
    window.onresize()

    return new Canvas(canvas)
  }
  loop() {
    let width = 300
    this.canvas.size(width, window.innerHeight)
    this.render(this.canvas, 0, 0, width, window.innerHeight)
    this.mouse.clear()
    requestAnimationFrame(() => this.loop())
  }
}


console.log(`[DPMA] Starting!`)
Injector.getExports().then(() => {
  window.dpma = new Application()
})
