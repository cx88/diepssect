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

/*const CopyImageSource = class extends Component {
  constructor(parent, source) {
    super(parent)
    this.source = source
  }
  render(c, x, y, width, height) {
    if (this.source.width !== width || this.source.height !== height) {
      c.image(this.source, x, y, this.source.width, this.source.height)
      this.source.width = width
      this.source.height = height
    } else {
      c.image(this.source, x, y, width, height)
    }
  }
}*/

const DiepCanvas = class extends Component {
  constructor(parent, mode = 0) {
    // 0 = CSS, 1 = Copy, 2 = Loop Hijack
    super(parent)
    window.onresize = () => {}
    if (mode === 0) {
      /*top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;*/
      window.canvas.style.top = '0'
      window.canvas.style.left = '0'
      window.canvas.style.right = 'auto'
      window.canvas.style.bottom = 'auto'
      window.canvas.style.width = 'auto'
      window.canvas.style.height = 'auto'
    } else {
      window.canvas.style.display = 'none'
    }

    this.mode = mode
    this.disabled = false
    this.mc = {}
  }
  render(c, x, y, width, height) {
    c.mouse(this.mc, x, y, width, height)
    if (window.input)
      if (this.mc.owned) {
        input.mouse(this.mc.x - x, this.mc.y - y)
        if (this.mc.left) {
          input.keyDown(1)
        } else {
          input.keyUp(1)
        }
        if (this.mc.right) {
          input.keyDown(3)
        } else {
          input.keyUp(3)
        }
      } else {
        input.keyUp(1)
        input.keyUp(3)
      }
    let source = window.canvas
    if (this.mode === 1) {
      c.image(source, x, y, width, height)
    }
    if (source.width !== width || source.height !== height) {
      source.width = width
      source.height = height
    }
    if (this.mode === 0) {
      window.canvas.style.top = y + 'px'
      window.canvas.style.left = x + 'px'
    } else if (this.mode === 2) {
      if (source.width !== width || source.height !== height) {
        source.width = width
        source.height = height
      }
      const { Browser } = Injector.exports
      if (this.disabled) {
        Browser.mainLoop.runner()
      } else if (Browser.mainLoop.runner) {
        Browser.mainLoop.pause()
        Browser.mainLoop.currentlyRunningMainloop--
        Browser.mainLoop.scheduler = () => {}
        Browser.mainLoop.runner()
        this.disabled = true
      }
      c.image(source, x, y, width, height)
    }
  }
}

/*$(0x10a7c).$vector.map(r => {
  if (r[0x48].f32 && r[0x28].f32)
    r[0x48].f32 = r[0x28].f32
})*/

const Application = class extends ComponentTable {
  constructor() {
    super({ parent: [] }, true)

    this.canvas = this.createCanvas()
    this.diepCanvas = this.createChild(DiepCanvas)
    this.console = this.createChild(Console)
    this.loop()
  }
  createCanvas() {
    let canvas = document.body.appendChild(document.createElement('canvas'))
    canvas.style.position = 'absolute'
    canvas.style.left = '0'
    canvas.style.right = '0'
    canvas.style.top = '0'
    canvas.style.bottom = '0'
    canvas.style.height = '100%'
    canvas.style.width = '100%'
    return new Canvas(canvas)
  }
  loop() {
    this.canvas.size(window.innerWidth, window.innerHeight)
    this.canvas.resetMouse()
    this.render(this.canvas, 0, 0, window.innerWidth, window.innerHeight)
    //this.mouse.clear()
    requestAnimationFrame(() => this.loop())
  }
}


console.log(`[DPMA] Starting!`)
Injector.getExports().then(() => {
  window.dpma = new Application()
})
