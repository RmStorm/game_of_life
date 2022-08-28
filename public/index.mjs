const response = await fetch('main.wasm');
const wasm_module = await WebAssembly.compile(await response.arrayBuffer())
const gol_wasm = (await WebAssembly.instantiate(wasm_module, {
    coolio: {
      log2: (x, y) => console.log(x, y),
    },
  })).exports

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var width = 50;
var height = 50;
var p = 15;
var hasEdge = true;

var fps = document.getElementById("fps");
var intervalSlider = document.getElementById("intervalSlider");
var intervalSliderLabel = document.getElementById("intervalSliderLabel");
var xSlider = document.getElementById("xSize");
var ySlider = document.getElementById("ySize");

var myInterval
var duration=intervalSlider.value
intervalSliderLabel.innerHTML = `delay: ${duration}`;

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

function resizeCanvas(){
  width=xSlider.value
  height=ySlider.value
  gol_wasm.setSize(width, height)
  resizePixel()
  canvas.width = width*p
  canvas.height = height*p
  drawBoard();
}

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
  if (e.target.id === canvas.id) {e.preventDefault()}
});

function fill_board(fill=0) {
  for (var i = 0; i <= width - 1; i++) {
    for (var j = 0; j <= height - 1; j++) {
      gol_wasm.setCell(i, j, fill);
    }
  }
  drawBoard()
}

function create_button(text, callback) {
  const btn = document.createElement("button");
  btn.innerHTML = text;
  btn.onclick = callback
  document.getElementById("buttons").appendChild(btn)
}

create_button("clear_board", (e) => {fill_board()})
create_button("fill_board", (e) => {fill_board(1)})

const tick = () => {
  gol_wasm.tick()
  window.requestAnimationFrame(playAnimation)
}

const loop = () => {
   setTimeout(() => {
      tick()
      if (duration < 1500){
        loop();
      }
      console.log("pause", duration)
  }, duration);
};

var lastTime = 0
function playAnimation(time) {
  const delay = time - lastTime
  if (delay != 0){
    drawBoard()
    fps.innerHTML = `fps: ${Math.floor(10000/(delay))/10}`;
  }
  lastTime = time
}

create_button("start", (e) => {duration=intervalSlider.value;loop()})
create_button("pause", (e) => {duration = 1500})
create_button("tick", (e) => {tick()})
create_button("toggle grid edges", (e) => {hasEdge = !hasEdge;drawBoard()})

intervalSlider.oninput = (e) => {
  duration=intervalSlider.value
  tick()
  intervalSliderLabel.innerHTML = `delay: ${duration}`;
}
xSlider.oninput = (e) => {resizeCanvas()}
ySlider.oninput = (e) => {resizeCanvas()}

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

function createGliderGun(){
  fill_board()
  gol_wasm.setCell(10, 15, 1)
  gol_wasm.setCell(10, 16, 1)
  gol_wasm.setCell(11, 15, 1)
  gol_wasm.setCell(11, 16, 1)

  gol_wasm.setCell(20, 15, 1)
  gol_wasm.setCell(20, 16, 1)
  gol_wasm.setCell(20, 17, 1)

  gol_wasm.setCell(21, 14, 1)
  gol_wasm.setCell(21, 18, 1)

  gol_wasm.setCell(22, 13, 1)
  gol_wasm.setCell(23, 13, 1)
  gol_wasm.setCell(22, 19, 1)
  gol_wasm.setCell(23, 19, 1)

  gol_wasm.setCell(24, 16, 1)

  gol_wasm.setCell(25, 14, 1)
  gol_wasm.setCell(25, 18, 1)

  gol_wasm.setCell(26, 15, 1)
  gol_wasm.setCell(26, 16, 1)
  gol_wasm.setCell(26, 17, 1)
  gol_wasm.setCell(27, 16, 1)

  gol_wasm.setCell(30, 13, 1)
  gol_wasm.setCell(30, 14, 1)
  gol_wasm.setCell(30, 15, 1)
  gol_wasm.setCell(31, 13, 1)
  gol_wasm.setCell(31, 14, 1)
  gol_wasm.setCell(31, 15, 1)

  gol_wasm.setCell(32, 12, 1)
  gol_wasm.setCell(32, 16, 1)

  gol_wasm.setCell(34, 11, 1)
  gol_wasm.setCell(34, 12, 1)
  gol_wasm.setCell(34, 16, 1)
  gol_wasm.setCell(34, 17, 1)

  gol_wasm.setCell(44, 13, 1)
  gol_wasm.setCell(44, 14, 1)
  gol_wasm.setCell(45, 13, 1)
  gol_wasm.setCell(45, 14, 1)

  drawBoard()
}
create_button("make gun", (e) => {createGliderGun()})
createGliderGun()