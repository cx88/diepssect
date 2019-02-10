// ==UserScript==
// @name         Diep Packet & Memory Analyzer
// @description  A combination of WireShark and Cheat Engine but for WebSockets and WebAssembly memory segments
// @version      0.3
// @author       CX
// @namespace    *://diep.io/
// @match        *://diep.io/
// @grant        none
// @run-at       document-start
// ==/UserScript==

let bundle = { timestamp: 0, code: '' }
if (window.localStorage.dpmaBundle)
  try {
    bundle = JSON.parse(window.localStorage.dpmaBundle) || bundle
    console.log('[DPMA LOADER] Successfully loaded cached bundle')
    try {
      new Function(bundle.code)()
    } catch(e) {
      console.log('[DPMA LOADER]', e)
    }
  } catch(e) {
    window.localStorage.dpmaBundle = ''
    console.log('[DPMA LOADER] Removed corrupted cached bundle!')
  }

let loadBundle = src => fetch(src).then(res => res.json()).then(newBundle => {
  if (bundle.timestamp < newBundle.timestamp) { // Update
    if (bundle.code !== newBundle.code) {
      setTimeout(() => window.location.reload(), 100)
      console.log('[DPMA LOADER] Updated cached bundle, reloading...')
    } else {
      console.log('[DPMA LOADER] Timestamp updated but no actual update available')
    }
    bundle = newBundle
    window.localStorage.dpmaBundle = JSON.stringify(bundle)
  } else {
    console.log('[DPMA LOADER] No update available')
  }
})
loadBundle('http://localhost:6222/dpma/bundle.json')
  .catch(e => loadBundle('https://cx88.github.io/diepssect/dpma/bundle.json'))
  .catch(e => console.log('[DPMA LOADER] Unable to check for update'))
