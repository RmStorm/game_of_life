const response = await fetch('main.wasm');
const wasm_module = await WebAssembly.compile(await response.arrayBuffer())
const instance = await WebAssembly.instantiate(wasm_module)

console.log(instance.exports.helloWorld())
