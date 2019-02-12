let getter = ({ ptr }, prop) => {
  let {
    Module: {
      HEAPU8,  HEAPU16,
      HEAPU32, HEAPU64,
      HEAPF32, HEAPF64,
    }
  } = Injector.exports

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
        vector.push($(i))
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
  let {
    Module: {
      HEAPU8,  HEAPU16,
      HEAPU32, HEAPU64,
      HEAPF32, HEAPF64,
    }
  } = Injector.exports

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

module.exports = $
