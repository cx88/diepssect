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

    this.mc = null
    this.mouseAt = { x: 0, y: 0, left: false, right: false }

    let mouseAt = this.mouseAt
    let getCoordinate = e => {
      let { left, top } = canvas.getBoundingClientRect()
      mouseAt.x = e.clientX - left
      mouseAt.y = e.clientY - top
      if (this.mc) {
        this.mc.dx += e.movementX
        this.mc.dy += e.movementY
      }
    }

    canvas.addEventListener('mousedown', e => {
      getCoordinate(e)
      if (e.button === 0)
        mouseAt.left = true
      else if (e.button === 2)
        mouseAt.right = true
    }, false)
    canvas.addEventListener('mousemove', e => {
      getCoordinate(e)
    }, false)
    canvas.addEventListener('mouseup', e => {
      getCoordinate(e)
      if (e.button === 0)
        mouseAt.left = false
      else if (e.button === 2)
        mouseAt.right = false
    }, false)
    canvas.addEventListener('wheel', e => {
      if (this.mc) {
        this.mc.scroll += e.deltaY
      }
    }, false)
  }
  mouse(mc, x, y, w, h, check = null) {
    if (this.mc && this.mc !== mc) return null
    let mi = this.mouseAt.x >= x && this.mouseAt.x < x + w
          && this.mouseAt.y >= y && this.mouseAt.y < y + h
    mc.hover = mi && (!check || check(this.mouseAt))
    let isOwned = mc.hover || this.mc
    if (!isOwned) return null
    if (isOwned && !mc.owned) {
      mc.dx = 0
      mc.dy = 0
      mc.scroll = 0
      mc.owned = true
    }

    mc.x = this.mouseAt.x
    mc.y = this.mouseAt.y
    mc.left = this.mouseAt.left
    mc.right = this.mouseAt.right
    this.mc = mc
  }
  reset(width, height) {
    if (this.mc && !this.mc.left && !this.mc.right) {
      this.mc.owned = null
      this.mc.hover = null
      this.mc = null
    }

    let needsUpdate =
      width !== this.canvas.width ||
      height !== this.canvas.height
    if (needsUpdate) {
      this.canvas.width = width
      this.canvas.height = height
      this.ctx.textBaseline = 'middle'
    } else {
      this.ctx.clearRect(0, 0, width, height)
    }
    return [width, height, needsUpdate]
  }
  cursor(cursor) {
    this.canvas.style.cursor = cursor
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
  image(source, x, y, w, h) {
    this.ctx.drawImage(source, x, y, w, h)
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
