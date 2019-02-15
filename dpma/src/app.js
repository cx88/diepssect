const Injector = require('./injector.js')
const Canvas = require('./canvas.js')
const Math = require('./math.js')
const $ = require('./pointer.js')

const CHEAT_MODE = localStorage['actually know javascript'] === 'yes'

const Component = class {
  constructor(parent) {
    this.parent = [parent, ...parent.parent]
  }
  render(c, width, height) {
    console.warn('Component missing render function!', this)
  }
  renderAbsolute(c, x, y, width, height) {
    c.clip(x, y, width, height)
    this.render(c, width, height)
    c.pop()
  }
}

const ComponentTable = class extends Component {
  constructor(parent, horizontal = false, resizable = false) {
    super(parent)

    this.horizontal = horizontal
    this.resizable = resizable
    this.children = []
    this.size = 0
  }
  render(c, width, height) {
    let dividerSize = 5
    if (this.horizontal) {
      this.resize(width)

      if (this.resizable) {
        let start = this.children[0].size
        for (let i = 1; i < this.children.length; i++) {
          let before = this.children[i - 1]
          let after = this.children[i]
          let nextSize = i === this.children.length - 1
            ? dividerSize
            : Math.min(after.size / 2, dividerSize)
          c.mouse(after.mc, start - dividerSize, 0, dividerSize + nextSize, height)
          start += after.size
          if (after.mc.owned) {
            c.cursor('col-resize')
            if (after.mc.left) {
              let dxBy = Math.constrain(
                i === 1 ? 10 - before.size : -before.size,
                i === this.children.length - 1 ? after.size - 10 : after.size,
                after.mc.dx)
              before.size += dxBy
              after.size -= dxBy
              after.mc.dx -= dxBy
            }
          } else {
            after.mc.dx = 0
          }
        }
      }

      let start = 0
      for (let { size, child } of this.children) {
        child.renderAbsolute(c, start, 0, size, height)
        start += size
      }
    } else {
      this.resize(height)

      if (this.resizable) {
        let start = this.children[0].size
        for (let i = 1; i < this.children.length; i++) {
          let before = this.children[i - 1]
          let after = this.children[i]
          let nextSize = i === this.children.length - 1
            ? dividerSize
            : Math.min(after.size / 2, dividerSize)
          c.mouse(after.mc, 0, start - dividerSize, width, dividerSize + nextSize)
          start += after.size
          if (after.mc.owned) {
            c.cursor('row-resize')
            if (after.mc.left) {
              let dyBy = Math.constrain(
                i === 1 ? 10 - before.size : -before.size,
                i === this.children.length - 1 ? after.size - 10 : after.size,
                after.mc.dy)
              before.size += dyBy
              after.size -= dyBy
              after.mc.dy -= dyBy
            }
          } else {
            after.mc.dy = 0
          }
        }
      }

      let start = 0
      for (let { size, child } of this.children) {
        child.renderAbsolute(c, 0, 0 + start, width, size)
        start += size
      }
    }
  }
  createChild(Class, ...args) {
    let child = new Class(this, ...args)
    let size = this.children.length ? Math.floor(this.size / this.children.length) : 1024
    this.children.push({ child, size, mc: {} })
    this.size += size
    return child
  }
  resizeChildren(sizes) {
    let totalSize = 0
    for (let element of this.children) {
      element.size = sizes.shift() || element.size
      totalSize += element.size
    }
    this.size = totalSize
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
  render(c, width, height) {
    this.resize(height)
  }
  renderSection(c, from, width, height) {
    console.warn('Scrollable missing renderSection function!', this)
  }
  resize(height) {
    if (this.height === height) return
    let positionOld = 0
    let positionNew = 0
    for (let element of this.children) {
      positionOld += element.size
      let position = Math.round(positionOld / this.size * neededSize)
      element.size = position - positionNew
      positionNew = position
    }
    this.height = height
  }
}

const Console = class extends Component {
  constructor(parent) {
    super(parent)
  }
  render(c, width, height) {
    c.fill('#000000')
    c.rect(0, 0, width, height)
    c.fill('#ffffff')
    c.rect(2, 2, width - 4, height - 4)
  }
}

const EntityBox = class extends Component {
  constructor(parent) {
    super(parent)
    this.camera = { x: 0, y: 0, zoom: 0.2 }
    this.mc = {}
  }
  render(c, width, height) {
    c.mouse(this.mc, 0, 0, width, height)
    if (this.mc.owned) {
      if (this.mc.left)
        c.cursor('move')
      else
        c.cursor('default')

      if (this.mc.left || this.mc.scroll !== 0) {
        let zoom = Math.pow(0.85, this.mc.scroll)
        let mx = this.mc.x - width / 2
        let my = this.mc.y - height / 2

        let ax = (this.mc.left ? this.mc.dx / this.camera.zoom : 0) - mx / this.camera.zoom
        let ay = (this.mc.left ? this.mc.dy / this.camera.zoom : 0) - my / this.camera.zoom
        this.camera.zoom = Math.constrain(0.01, 2, this.camera.zoom * zoom)
        this.camera.x += ax + mx / this.camera.zoom
        this.camera.y += ay + my / this.camera.zoom
      }

      this.mc.dx = 0
      this.mc.dy = 0
      this.mc.scroll = 0
    }

    c.fill('#f7f7f7')
    c.rect(0, 0, width, height)

    c.fill('#c4c4c4')

    c.rectLineHorizontal(0, width, this.camera.y * this.camera.zoom + Math.floor(height / 2), 2)
    c.rectLineVertical(this.camera.x * this.camera.zoom + Math.floor(width / 2), 0, height, 2)
    c.translate(Math.floor(width / 2) + this.camera.x * this.camera.zoom, Math.floor(height / 2) + this.camera.y * this.camera.zoom)


    let $arena = $(0x10a58).$vector[0]
    let arena = $arena ? {
      arenaRight: $arena[0xd8].f32,
      leaderScore: $arena[0x180].f32,
      leaderX: $arena[0x228].f32,
      arenaTop: $arena[0x230].f32,
      arenaBottom: $arena[0x290].f32,
      leaderY: $arena[0x298].f32,
      arenaLeft: $arena[0x2a0].f32,
    } : {
      arenaRight: 0,
      leaderScore: 0,
      leaderX: 0,
      arenaTop: 0,
      arenaBottom: 0,
      leaderY: 0,
      arenaLeft: 0,
    }

    let left = arena.arenaLeft * this.camera.zoom
    let right = arena.arenaRight * this.camera.zoom
    let top = arena.arenaTop * this.camera.zoom
    let bottom = arena.arenaBottom * this.camera.zoom

    c.rectLineHorizontal(left, right, top, 2)
    c.rectLineHorizontal(left, right, bottom, 2)
    c.rectLineVertical(left, top, bottom, 2)
    c.rectLineVertical(right, top, bottom, 2)

    c.font(10)
    c.fill('#36363e')
    let entities = $(0x10a7c).$vector.map($entity => {
      let x = $entity[0x28].f32
      let y = $entity[0x48].f32
      let id = $entity.$[0x38].u32 * 0x10000 + $entity.$[0x36].u16
      return { x, y, id }
    })
    let newestId = entities.map(r => r.id).reduce((a, b) => a > b ? a : b, -1)
    for (let { x, y, id } of entities) {
      if (newestId === id)
        c.fill('#3636cf')
      c.circle(x * this.camera.zoom, y * this.camera.zoom, 3)
      c.text(`(${ Math.round(x) }, ${ Math.round(y) })`, x * this.camera.zoom + 5, y * this.camera.zoom + 4, 5)
      if (newestId === id)
        c.fill('#36363e')
    }
    if (arena.leaderX !== 0 || arena.leaderY !== 0) {
      c.fill('#ff3202')
      c.circle(arena.leaderX * this.camera.zoom, arena.leaderY * this.camera.zoom, 3)
      c.text(`(${ arena.leaderX.toFixed(4) }, ${ arena.leaderY.toFixed(4) })`, arena.leaderX * this.camera.zoom + 5, arena.leaderY * this.camera.zoom - 8, 5)
    }
    c.pop()
/*$(0x10a7c).$vector.map(r => {
  if (r[0x48].f32 && r[0x28].f32)
    r[0x48].f32 = r[0x28].f32
})
$(0x10a7c).$vector[0].$[0x38].u32 + $(0x10a7c).$vector[0].$[0x36].u16 * 0x100000000
$(0x10a7c).$vector.map(r => {
  let x = r[0x28].f32
  let y = r[0x48].f32
  let id = r.$[0x38].u32 * 0x10000 + r[0].$[0x36].u16
  return { x, y, id }
}).reduce((a, b) => a.id > b.id ? a : b)
*/
  }
}

/*const CopyImageSource = class extends Component {
  constructor(parent, source) {
    super(parent)
    this.source = source
  }
  renderAbsolute(c, x, y, width, height) {
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
  renderAbsolute(c, x, y, width, height) {
    c.mouse(this.mc, x, y, width, height)
    if (window.input)
      if (this.mc.owned) {
        c.cursor(window.canvas.style.cursor)
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

        if (CHEAT_MODE && this.mc.scroll !== 0) {
          let zoom = Math.pow(0.85, this.mc.scroll)
          $(0x10a70).$vector[0][11 * 4].f32 *= zoom
        }
        this.mc.scroll = 0
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

const Application = class extends ComponentTable {
  constructor() {
    super({ parent: [] }, true, true)

    this.mc = {}
    this.canvas = this.createCanvas()
    this.diepCanvas = this.createChild(DiepCanvas)
    this.controller = this.createChild(ComponentTable, false, true)
    this.controller.createChild(EntityBox)
    this.controller.createChild(Console)
    this.resizeChildren([3, 1])
    this.loop()
    this.canvas.canvas.addEventListener('mousemove', e => {
      this.loop(true)
    }, false)
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
  loop(skip = false) {
    this.canvas.reset(window.innerWidth, window.innerHeight)
    this.render(this.canvas, window.innerWidth, window.innerHeight)
    this.canvas.mouse(this.mc, 0, 0, window.innerWidth, window.innerHeight)
    if (this.mc.owned) {
      this.canvas.cursor('default')
    }
    if (!skip)
      requestAnimationFrame(() => this.loop())
  }
}


console.log(`[DPMA] Starting!`)
Injector.getExports().then(() => {
  window.dpma = new Application()
})
