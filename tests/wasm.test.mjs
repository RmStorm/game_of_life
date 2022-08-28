import { readFileSync } from "fs";
import compile from "../compile.mjs"

const instantiate = async () => {
  const buffer = readFileSync("./public/main.wasm");
  const compiled_buffer = await WebAssembly.compile(buffer);
  const instance = await WebAssembly.instantiate(compiled_buffer, {
    coolio: {
      log2: (x, y) => console.log(x, y),
    },
  });
  return instance.exports;
};

const setAllCells = (value) => {
  for (let x = 0; x < 50; x++) {
    for (let y = 0; y < 50; y++) {
      wasm.setCell(x, y, value);
    }
  }
};

var wasm;

beforeAll(() => {
  compile();
});

beforeEach(async () => {
  wasm = await instantiate();
});

test("offsetFromCoordinate", () => {
  // expect(wasm.offsetFromCoordinate(42, 0)).toBe(42);
  expect(wasm.offsetFromCoordinate(0, 0)).toBe(8 + 0);
  expect(wasm.offsetFromCoordinate(49, 0)).toBe(8 + 49 * 4);
  expect(wasm.offsetFromCoordinate(10, 2)).toBe(8 + (10 + 2 * wasm.getX()) * 4);
});

test("get / set cell", () => {
  // check that linear memory initialises to zero
  expect(wasm.getCell(2, 2)).toBe(0);
  // setCell returns 1 when set is succesfull
  expect(wasm.setCell(2, 2, 5)).toBe(1);
  expect(wasm.getCell(2, 2)).toBe(5);
});

test("read memory directly", () => {
  const memory = new Uint32Array(wasm.memory.buffer, 0, 1 + wasm.getX() * wasm.getY());
  wasm.setCell(7, 5, 11);
  // Add 2 because the first 2 numbers are reserved for gridsize
  expect(memory[2 + 7 + 5 * wasm.getX()]).toBe(11);
});

test("test boundaries", () => {
  expect(wasm.setCell(0, 0, 1)).toBe(1);
  // setCell returns 0 when set failed
  expect(wasm.setCell(-1,-1, 1)).toBe(0);
  expect(wasm.setCell(wasm.getX(), 0, 1)).toBe(0);
  expect(wasm.setCell(0, wasm.getY(), 1)).toBe(0);
  expect(wasm.setCell(wasm.getX(), wasm.getY, 1)).toBe(0);
});

test("Check liveNeighbourCount", () => {
  // liveNeighbourCount uses bitwise and on 1 to check liveness
  expect(wasm.setCell(1, 2, 11)).toBe(1);
  expect(wasm.setCell(2, 2, 5)).toBe(1);
  expect(wasm.setCell(3, 2, 7)).toBe(1);
  expect(wasm.setCell(3, 1, 9)).toBe(1);
  expect(wasm.setCell(3, 3, 4)).toBe(1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(3);
});

test("without boundary values", () => {
  // starts at zero
  expect(wasm.liveNeighbourCount(2, 2)).toBe(0);

  // add each neighbour in turn
  wasm.setCell(1, 1, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(1);
  wasm.setCell(2, 1, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(2);
  wasm.setCell(3, 1, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(3);
  wasm.setCell(3, 2, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(4);
  wasm.setCell(1, 2, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(5);
  wasm.setCell(1, 3, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(6);
  wasm.setCell(2, 3, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(7);
  wasm.setCell(3, 3, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(8);
});

test("setCellStateForNextGeneration", () => {
  // live cell
  wasm.setCell(2, 2, 1);

  // alive in next generation
  wasm.setCellStateForNextGeneration(2, 2, 1);
  expect(wasm.getCell(2, 2)).toBe(0b11);

  // dead in next generation
  wasm.setCellStateForNextGeneration(2, 2, 0);
  expect(wasm.getCell(2, 2)).toBe(0b01);

  // dead cell
  wasm.setCell(2, 2, 0);

  // alive in next generation
  wasm.setCellStateForNextGeneration(2, 2, 1);
  expect(wasm.getCell(2, 2)).toBe(0b10);

  // dead in next generation
  wasm.setCellStateForNextGeneration(2, 2, 0);
  expect(wasm.getCell(2, 2)).toBe(0b00);
});

test("evolveCellToNextGeneration", () => {
  // a live cell with no live neighbours dies
  setAllCells(0);
  wasm.setCell(2, 2, 1);
  wasm.evolveCellToNextGeneration(2, 2);
  expect(wasm.getCell(2, 2)).toBe(0b01);

  // a live cell with two live neighbours lives
  setAllCells(0);
  wasm.setCell(2, 2, 1);
  wasm.setCell(2, 3, 1);
  wasm.setCell(2, 1, 1);
  wasm.evolveCellToNextGeneration(2, 2);
  expect(wasm.getCell(2, 2)).toBe(0b11);

  // a dead cell with all dead neighbours stays dead
  setAllCells(0);
  wasm.evolveCellToNextGeneration(2, 2);
  expect(wasm.getCell(2, 2)).toBe(0b00);

  // a dead cell with three live neighbours comes to life
  setAllCells(0);
  wasm.setCell(2, 2, 0);
  wasm.setCell(2, 3, 1);
  wasm.setCell(2, 1, 1);
  wasm.setCell(1, 1, 1);
  expect(wasm.liveNeighbourCount(2, 2)).toBe(3);
  expect(wasm.getCell(2, 2)).toBe(0b00);
  wasm.evolveCellToNextGeneration(2, 2);
  expect(wasm.getCell(2, 2)).toBe(0b10);
});


test("gunProblem", () => {
  wasm.setCell(5, 5, 1)
  wasm.setCell(5, 6, 1)
  wasm.setCell(5, 7, 1)

  wasm.setCell(6, 4, 1)
  wasm.setCell(6, 8, 1)

  wasm.setCell(7, 3, 1)
  wasm.setCell(8, 3, 1)
  wasm.setCell(7, 9, 1)
  wasm.setCell(8, 9, 1)

  wasm.tick()
  expect(wasm.liveNeighbourCount(5, 6)).toBe(6);
  expect(wasm.getCell(5, 6)).toBe(0b01);
  wasm.tick()
  expect(wasm.getCell(5, 6)).toBe(0b00);
});