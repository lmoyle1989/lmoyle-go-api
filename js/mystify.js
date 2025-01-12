const canvas = document.querySelector("#mainCanvas");
const ctx = canvas.getContext("2d");
const height = canvas.height;
const width = canvas.width;
const startTime = new Date();
let prevTime = 0;
let baseSpeed = 1;

function Point(px, py, dx, dy) {
  this.px = px;
  this.py = py;
  this.dx = dx;
  this.dy = dy;
}

Point.prototype.updatePos = function(step) {
  let newx = this.px + ((this.dx * step * baseSpeed) / 10);
  let newy = this.py + ((this.dy * step * baseSpeed) / 10);

  if (newx < 0 || newx > width) {
    this.dx *= -1;
    if (newx < 0) { newx = 0; }
    else { newx = width; }
  }

  if (newy < 0 || newy > height) {
    this.dy *= -1;
    if (newy < 0) { newy = 0; }
    else { newy = height; }
  }
  
  this.px = newx;
  this.py = newy;
};

const my1Point = new Point(400, 320, 1, 1);
const my2Point = new Point(400, 320, 1, -1);
const my3Point = new Point(400, 320, -1, -1);
const my4Point = new Point(400, 320, -1, 1);

window.onload = function() {
  mystifyInit();
};

function mystifyInit() {
  window.requestAnimationFrame(myDraw);
}

function myDraw(timestamp) {
  // what if i just keep a deque of previous point locations...?
  const step = timestamp - prevTime;

  ctx.clearRect(0, 0, width, height);
  
  // ctx.beginPath();
  // ctx.arc(my1Point.px, my1Point.py, 15, 0, 2 * Math.PI);
  // ctx.fill();

  // ctx.beginPath();
  // ctx.arc(my2Point.px, my2Point.py, 15, 0, 2 * Math.PI);
  // ctx.fill();

  // ctx.beginPath();
  // ctx.arc(my3Point.px, my3Point.py, 15, 0, 2 * Math.PI);
  // ctx.fill();

  // ctx.beginPath();
  // ctx.arc(my4Point.px, my4Point.py, 15, 0, 2 * Math.PI);
  // ctx.fill();

  ctx.beginPath();
  ctx.moveTo(my1Point.px, my1Point.py);
  ctx.lineTo(my2Point.px, my2Point.py);
  ctx.lineTo(my3Point.px, my3Point.py);
  ctx.lineTo(my4Point.px, my4Point.py);
  ctx.closePath();
  ctx.stroke();

  my1Point.updatePos(step);
  my2Point.updatePos(step);
  my3Point.updatePos(step);
  my4Point.updatePos(step);

  prevTime = timestamp;

  window.requestAnimationFrame(myDraw);
}
