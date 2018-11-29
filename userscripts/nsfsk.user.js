// ==UserScript==
// @name         NSFSK - Not safe for script kiddies. CX's toolkit.
// @description  Does magic.
// @version      0.1
// @author       CX
// @namespace    *://diep.io/
// @match        *://diep.io/
// @grant        none
// ==/UserScript==

;(async () => {
  let {
    Module: {
      HEAPU8,  HEAPU16,
      HEAPU32, HEAPU64,
      HEAPF32, HEAPF64,
    }
  } = await Injector.getExports()

  let getter = ({ ptr }, prop) => {
    switch (prop) {
      case 'u8':  return HEAPU8[ptr]
      case 'u16': return HEAPU16[ptr >> 1]
      case 'u32': return HEAPU32[ptr >> 2]
      case 'u64': return HEAPU64[ptr >> 3]
      case 'f32': return HEAPF32[ptr >> 2]
      case 'f64': return HEAPF64[ptr >> 3]
      case 'vector':
        let vector = []
        for (let i = HEAPU32[ptr >> 2]; i < HEAPU32[(ptr >> 2) + 1]; i += 4)
          vector.push($(i >> 2))
        return vector
      case '$vector':
        let $vector = []
        for (let i = HEAPU32[ptr >> 2]; i < HEAPU32[(ptr >> 2) + 1]; i += 4)
          $vector.push($(HEAPU32[i >> 2]))
        return $vector
      case '$': return $(HEAPU32[ptr >> 2])
    }
    let id = parseInt(prop, 10)
    if (!Number.isNaN(id))
      return $(ptr + id)
  }

  let setter = ({ ptr }, prop, to) => {
    switch (prop) {
      case 'u8':  return HEAPU8[ptr] = to
      case 'u16': return HEAPU16[ptr >> 1] = to
      case 'u32': return HEAPU32[ptr >> 2] = to
      case 'u64': return HEAPU64[ptr >> 3] = to
      case 'f32': return HEAPF32[ptr >> 2] = to
      case 'f64': return HEAPF64[ptr >> 3] = to
    }
  }

  let $ = ptr => new Proxy({ ptr }, { get: getter, set: setter })

  if (localStorage['actually know javascript'] !== 'yes') return

  setInterval(() => {
    for (let entity of $(0x10a34).vector) {
      entity[4].$[18 * 4].u32 = 0
    }
  }, 40)

  canvas.addEventListener('mousewheel', ({ deltaY }) => {
    let diff = Math.pow(0.9, deltaY / 40)
    $(0x10a70).$vector[0][11 * 4].f32 *= diff
    //$(0x10a70).$vector[0][19 * 4].u32 = level
  })

  window.$ = $
})()
