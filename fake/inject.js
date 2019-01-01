window.betch = fetch
window.fetch = async (...arg) => {
  if (arg[0] === 'build_9b9e4489cd499ded99cca19f4784fc929d21fc35.wasm.wasm')
    arg[0] = 'http://localhost:4585/app.wasm'
  let req = await betch(...arg)
  return req
}
