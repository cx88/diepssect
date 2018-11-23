// ==UserScript==
// @name         Injector
// @namespace    *://diep.io/
// @version      0.2
// @description  A simple script that exports important variables in wasm.js and allows replacing any values such as CanvasRenderingContext2D.prototype.fillText without trigger the extension detector.
// @author       CX
// @run-at      document-start
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
