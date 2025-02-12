const canvas = document.querySelector("#mainCanvas");
const ctx = canvas.getContext("2d");
const height = canvas.height;
const width = canvas.width;
const pauseButton = document.querySelector("#pauseButton");
const startButton = document.querySelector("#startButton");
const resetButton = document.querySelector("#resetButton");
let animId;
let prevTime = 0;
let paused = 1;
let unPaused = 0;
let scale = 100;
const vr = Math.sqrt(((height / 2) ** 2) + ((width / 2) ** 2)) * 1.5;
const fov = 500;
const zmax = 800;
const dmax = Math.sqrt(((width / 2) ** 2) + ((height / 2) ** 2) + (zmax ** 2));
const maxcirclerad = 30

class Point {
  constructor(x,y,z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  project() {
    let viewrad = Math.sqrt((vr ** 2) + (fov ** 2));
    this.px = Math.sin(Math.atan(this.x / (this.z + fov))) * viewrad;
    this.py = Math.sin(Math.atan(this.y / (this.z + fov))) * viewrad;
    // this.d = Math.sqrt((this.x ** 2) + (this.y ** 2) + (this.z ** 2));
    this.prad = maxcirclerad * (1 - (this.z / zmax));
  }
}

class Pipe {
  constructor(a, b) {
    this.a = a;
    this.b = b;
    this.a.project();
    this.b.project();
    this.pslope = (b.py - a.py) /  (b.px - a.px);
    this.islope =  -(1 / this.pslope);

    this.axcs = calcx(a.px, this.islope, a.prad);
    this.aycs = calcy(a.py, this.islope, a.prad);

    this.bxcs = calcx(b.px, this.islope, b.prad);
    this.bycs = calcy(b.py, this.islope, b.prad);
  }
}

function drawPipe(pipe, ctx) {
  ctx.beginPath();
  ctx.arc(pipe.a.px, pipe.a.py, pipe.a.prad, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(pipe.b.px, pipe.b.py, pipe.b.prad, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(pipe.axcs[0], pipe.aycs[0]);
  ctx.lineTo(pipe.axcs[1], pipe.aycs[1]);
  ctx.lineTo(pipe.bxcs[1], pipe.bycs[1]);
  ctx.lineTo(pipe.bxcs[0], pipe.bycs[0]);
  ctx.closePath();
  ctx.fill();
}

// a = x val of the center of the arc
// m = inverse slop of the line connecting points
// r = projected radius of the end point arc
function calcx(a, m, r) {
  if (m == Infinity || m == -Infinity) {
    return [a, a];
  }
  let x1 = ((a * (m ** 2)) + a - Math.sqrt(((m ** 2) * (r ** 2)) + (r ** 2))) / ((m ** 2) + 1);
  let x2 = ((a * (m ** 2)) + a + Math.sqrt(((m ** 2) * (r ** 2)) + (r ** 2))) / ((m ** 2) + 1);
  return [x1, x2];
}

function calcy(b, m, r) {
  if (m == 0) {
    return [b, b];
  }
  else if (m == Infinity || m == -Infinity) {
    return [b + r, b - r];
  }
  let y1 = ((b / (m ** 2)) + b - (Math.sqrt(((m ** 2) * (r ** 2)) + (r ** 2)) / m)) / ((1 / (m ** 2)) + 1);
  let y2 = ((b / (m ** 2)) + b + (Math.sqrt(((m ** 2) * (r ** 2)) + (r ** 2)) / m)) / ((1 / (m ** 2)) + 1);
  return [y1, y2];
}

let pa = new Point(-100.1,100,100);
let pb = new Point(-100,-100,100);
let pc = new Point(-100,-100,500);
let pd = new Point(100,-100,500);
let pipe1 = new Pipe(pa, pb);
let pipe2 = new Pipe(pb, pc);
let pipe3 = new Pipe(pc, pd);

function drawFrame(timestamp) {
  let step = timestamp - prevTime;
  if (unPaused) { 
    unPaused = 0;
    step = 0;
  }

  drawPipe(pipe1, ctx);
  drawPipe(pipe2, ctx);
  drawPipe(pipe3, ctx);

  prevTime = timestamp;
  // if (!paused) {
  //   animId = window.requestAnimationFrame(drawFrame);
  // }
}

function pauseAnimation() {
  paused = 1;
}

function startAnimation() {
  if (!paused) { return; }
  paused = 0;
  unPaused = 1;
  animId = window.requestAnimationFrame(drawFrame);
}

function resetAnimation() {

}

function interfaceInit() {
  startButton.addEventListener("click", startAnimation);
  pauseButton.addEventListener("click", pauseAnimation);
  resetButton.addEventListener("click", resetAnimation);
}

function canvasInit() {
  ctx.translate((width / 2), (height / 2));
  ctx.strokeStyle = "white";
  ctx.fillStyle = "white";
  ctx.save();
}

window.onload = function() {
  canvasInit();
  interfaceInit();
};