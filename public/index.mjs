// import { performance } from 'perf_hooks';

const response = await fetch('main.wasm');
const wasm_module = await WebAssembly.compile(await response.arrayBuffer())
const gol_wasm = (await WebAssembly.instantiate(wasm_module, {
    coolio: {
      log2: (x, y) => console.log(x, y),
    },
  })).exports

var width = 50;
var height = 50;
var p = 15;
var hasEdge = true;

function drawRectangle(i,j,fill=0){
  ctx.fillStyle = fill==1 ? "green" : "white";
  ctx.fillRect(i*p, j*p, p, p)
  if (p > 4 && hasEdge) {
    ctx.strokeRect(i*p, j*p, p, p);    
  }
}

function drawBoard(){
  for (var i = 0; i <= width - 1; i++) {
    for (var j = 0; j <= height - 1; j++) {
      drawRectangle(i, j, gol_wasm.getCell(i, j))
    }
  }
}

function resizePixel(){
  const {w, h} = getViewportSize()
  const rect = canvas.getBoundingClientRect();
  p=15
  if (rect.top + height*p > h) {
    p = Math.floor((h-rect.top)/height)
    console.log("too high")
  }
  if (rect.left + width*p > w) {
    p = Math.floor((w-rect.left)/width)
  }
}

var canvas = document.getElementById("canvas");
function resizeCanvas(){
  width=xSlider.value
  height=ySlider.value
  gol_wasm.setSize(width, height)
  resizePixel()
  canvas.width = width*p
  canvas.height = height*p
  drawBoard();
}
var ctx = canvas.getContext("2d");

var xSlider = document.getElementById("xSize");
xSlider.oninput = (e) => {resizeCanvas()}
var ySlider = document.getElementById("ySize");
ySlider.oninput = (e) => {resizeCanvas()}


resizeCanvas();

function canvasClicked(e) {
  const [i, j] = [Math.floor(e.offsetX / p), Math.floor(e.offsetY / p)]
  if (e.buttons == 1) {
    drawRectangle(i, j, 1)
    gol_wasm.setCell(i, j, 1);
  }
  if (e.buttons == 2) {
    drawRectangle(i, j)
    gol_wasm.setCell(i, j, 0);
  }
}
canvas.addEventListener("mousemove", canvasClicked);
canvas.addEventListener("mousedown", canvasClicked);

document.body.addEventListener("contextmenu", (e) => {
  if (e.target.id === canvas.id) {e.preventDefault(); return}
});

function fill_board(fill=0) {
  for (var i = 0; i <= width - 1; i++) {
    for (var j = 0; j <= height - 1; j++) {
      gol_wasm.setCell(i, j, fill);
    }
  }
}

function create_button(text, callback) {
  const btn = document.createElement("button");
  btn.innerHTML = text;
  btn.onclick = callback
  document.getElementById("buttons").appendChild(btn)
}

create_button("clear_board", (e) => {fill_board();drawBoard()})
create_button("fill_board", (e) => {fill_board(1);drawBoard()})

var myInterval
var duration = 100

const start = () => {
  clearInterval(myInterval)
  gol_wasm.tick();
  drawBoard()
  myInterval = setInterval(()=>{gol_wasm.tick();drawBoard()}, duration)
}
create_button("start", (e) => {start()})
create_button("pause", (e) => {clearInterval(myInterval)})
create_button("tick", (e) => {gol_wasm.tick();drawBoard()})
create_button("toggle edge", (e) => {hasEdge = !hasEdge;drawBoard()})

var slider = document.getElementById("intervalSlider");
var sliderLabel = document.getElementById("intervalSliderLabel");
slider.oninput = (e) => {
  duration=slider.value
  start()
  sliderLabel.innerHTML = `interval: ${duration}`;
}

function getViewportSize(w) {

    // Use the specified window or the current window if no argument
    w = w || window;

    // This works for all browsers except IE8 and before
    if (w.innerWidth != null) return { w: w.innerWidth, h: w.innerHeight };

    // For IE (or any browser) in Standards mode
    var d = w.document;
    if (document.compatMode == "CSS1Compat")
        return { w: d.documentElement.clientWidth,
           h: d.documentElement.clientHeight };

    // For browsers in Quirks mode
    return { w: d.body.clientWidth, h: d.body.clientHeight };

}