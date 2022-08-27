const response = await fetch('main.wasm');
const wasm_module = await WebAssembly.compile(await response.arrayBuffer())
const gol_wasm = (await WebAssembly.instantiate(wasm_module)).exports

console.log(gol_wasm.helloWorld())

var width = 50;
var height = 50;
var p = 15;

var canvas = document.getElementById("canvas");
canvas.width = width*p; 
canvas.height = height*p; 
var ctx = canvas.getContext("2d");

function drawRectangle(i,j,fill=0){
  ctx.fillStyle = fill==1 ? "green" : "white";
  ctx.fillRect(i*p, j*p, p, p)
  ctx.strokeRect(i*p, j*p, p, p);
}

function drawBoard(){
  for (var i = 0; i <= width - 1; i++) {
    for (var j = 0; j <= height - 1; j++) {
      drawRectangle(i, j, gol_wasm.getCell(i, j))
    }
  }
}
drawBoard();

function canvasClicked(e) {
  const [i, j] = [Math.floor(e.offsetX / 10), Math.floor(e.offsetY / 10)]
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
create_button("start", (e) => {myInterval = setInterval(()=>{console.log("hi")}, 500)})
create_button("pause", (e) => {clearInterval(myInterval)})
