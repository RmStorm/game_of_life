import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import wabt_loader from "wabt";

const wabt = await wabt_loader()

const inputWat = "main.wat";
const outputWasm = "./public/main.wasm";

function recompileWasm () {
  const wasmModule = wabt.parseWat(inputWat, readFileSync(inputWat, "utf8"));
  const { buffer } = wasmModule.toBinary({});
  writeFileSync(outputWasm, buffer);
  console.log("wasm recompiled and saved!");
}

if (fileURLToPath(import.meta.url) === process.argv[1]) {
  recompileWasm()
}

export default recompileWasm
