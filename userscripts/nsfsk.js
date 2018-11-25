// ==UserScript==
// @name         NSFSK - Not safe for script kiddies.
// @description  Does magic.
// @version      0.1
// @author       CX
// @namespace    *://diep.io/
// @match        *://diep.io/
// @grant        none
// ==/UserScript==

;(async () => {
  if (localStorage['actually know javascript'] !== 'yes') return
  let { Module } = await Injector.getExports()

  canvas.addEventListener('mousewheel', ({ deltaY }) => {
    let diff = Math.pow(0.9, deltaY / 40)
    Module.HEAPF32[Module.HEAPU32[Module.HEAPU32[0x10a70 / 4] / 4] / 4 + 11] *= diff
  })

  // Module.HEAPU32[Module.HEAPU32[Module.HEAPU32[0x10a70 / 4] / 4] / 4 + 19] = level
})()
