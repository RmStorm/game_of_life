import { readFileSync } from "fs";
import compile from "../compile.mjs"

const instantiate = async () => {
  const buffer = readFileSync("./public/main.wasm");
  const module = await WebAssembly.compile(buffer);
  const instance = await WebAssembly.instantiate(module);
  return instance.exports;
};

var wasm;

beforeAll(() => {
  compile();
});

beforeEach(async () => {
  wasm = await instantiate();
});

test("Wasm hello world returns 42", () => {
  expect(wasm.helloWorld()).toBe(42);
});

test("offsetFromCoordinate", () => {
  // expect(wasm.offsetFromCoordinate(42, 0)).toBe(42);
  expect(wasm.offsetFromCoordinate(0, 0)).toBe(0);
  expect(wasm.offsetFromCoordinate(49, 0)).toBe(49 * 4);
  expect(wasm.offsetFromCoordinate(10, 2)).toBe((10 + 2 * 50) * 4);
});

test("get / set cell", () => {
  // check that linear memory initialises to zero
  expect(wasm.getCell(2, 2)).toBe(0);
  // setCell returns 1 when set is succesfull
  expect(wasm.setCell(2, 2, 5)).toBe(1);
  expect(wasm.getCell(2, 2)).toBe(5);
});

test("read memory directly", () => {
  const memory = new Uint32Array(wasm.memory.buffer, 0, 50 * 50);
  wasm.setCell(2, 2, 11);
  expect(memory[2 + 2 * 50]).toBe(11);
  expect(memory[3 + 2 * 50]).toBe(0);
});

test("test boundaries", () => {
  const memory = new Uint32Array(wasm.memory.buffer, 0, 50 * 50);
  expect(wasm.setCell(0, 0, 1)).toBe(1);
  // setCell returns 0 when set failed
  expect(wasm.setCell(-1,-1, 1)).toBe(0);
  expect(wasm.setCell(50, 0, 1)).toBe(0);
  expect(wasm.setCell(0, 50, 1)).toBe(0);
  expect(wasm.setCell(50,50, 1)).toBe(0);
});
