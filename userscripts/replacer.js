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
window.replace = replace
