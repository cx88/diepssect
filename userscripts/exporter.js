// ==UserScript==
// @name         Exporter
// @namespace    *://diep.io/
// @version      0.1
// @description  A simple hex editor.
// @author       CX
// @match        *://diep.io/
// @grant        none
// ==/UserScript==

document.directGetElementById = document.getElementById
document.getElementById = id => {
  if (id !== 'textInput')
    return document.directGetElementById(id)
  document.getElementById = document.directGetElementById

  let appender = ';'
  let exports = ['Module', 'cp5', 'Runtime', 'Browser', 'ASM_CONSTS']
  for (let e of exports) appender += `window.${ e }=typeof ${ e }!=='undefined'?${ e }:void(0);`
  fetch(document.getElementsByTagName('script')[0].src)
    .then(r => r.text())
    .then(r => r.replace(/}\)\)\(window\)\s*$/, to => appender + to))
    .then(eval)
  throw new Error('Disabling default source')
}
