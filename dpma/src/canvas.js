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
      scroll: 0,
      at: { x: 0, y: 0, dx: 0, dy: 0, left: false, right: false },
      registered: false,
      check(x, y, w, h) {
        if (this.registered) return
        if (x >= at.x && x < at.x + w && y >= at.y && y < at.y + h) {
          this.registered = true
          return this.at
        }
      },
      clear() {
        this.registered = true
      },
    }

    let getCoordinate = e => {
      let { left, top } = canvas.getBoundingClientRect()
      mouse.at.x = e.clientX - left
      mouse.at.y = e.clientY - top
      mouse.at.dx += e.movementX
      mouse.at.dy += e.movementY
    }

    canvas.addEventListener('mousedown', e => {
      getCoordinate(e)
      if (e.button === 0)
        mouse.at.left = true
      else if (e.button === 2)
        mouse.at.right = true
      mouse.registered = false
    }, false)
    window.addEventListener('mousemove', e => {
      getCoordinate(e)
    }, false)
    window.addEventListener('mouseup', e => {
      getCoordinate(e)
      if (e.button === 0)
        mouse.at.left = false
      else if (e.button === 2)
        mouse.at.right = false
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

module.exports = Canvas
