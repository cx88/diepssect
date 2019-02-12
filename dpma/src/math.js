let Math = Object.create(window.Math)

Math.constrain = (min, max, value) => min >= max ? (min + max) / 2 : value >= max ? max : value <= min ? min : value

module.exports = Math
