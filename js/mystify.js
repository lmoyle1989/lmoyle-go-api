const canvas = document.querySelector("#mainCanvas");
const ctx = canvas.getContext("2d");
const height = canvas.height;
const width = canvas.width;
const startTime = new Date();
let prevTime = 0;

function Point(px, py, dx, dy) {
  this.px = px;
  this.py = py;
  this.dx = dx;
  this.dy = dy;
}

Point.prototype.updatePos = function(step) {
  let newx = this.px + ((step * this.dx) / 10);
  let newy = this.py + ((step * this.dy) / 10);

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
const my3Point = new Point(400, 320, -1, 1);
const my4Point = new Point(400, 320, -1, -1);

window.onload = function() {
  mystifyInit();
};

function mystifyInit() {
  window.requestAnimationFrame(myDraw);
}

function myDraw(timestamp) {
  const step = timestamp - prevTime;

  ctx.clearRect(0, 0, width, height);
  
  ctx.beginPath();
  ctx.arc(my1Point.px, my1Point.py, 15, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(my2Point.px, my2Point.py, 15, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(my3Point.px, my3Point.py, 15, 0, 2 * Math.PI);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(my4Point.px, my4Point.py, 15, 0, 2 * Math.PI);
  ctx.fill();

  my1Point.updatePos(step);
  my2Point.updatePos(step);
  my3Point.updatePos(step);
  my4Point.updatePos(step);

  prevTime = timestamp;

  window.requestAnimationFrame(myDraw);
}
