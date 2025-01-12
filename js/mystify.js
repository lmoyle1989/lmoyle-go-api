const canvas = document.querySelector("#mainCanvas");
const ctx = canvas.getContext("2d");
const height = canvas.height;
const width = canvas.width;
const startTime = new Date();
let prevTime = 0;
let baseSpeed = 2;
let shapes = [];

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

function getRandomVal(min, max) {
  return Math.random() * (max - min) + min;
}

function getNonZeroRandomDir(min, max) {
  negative = Math.floor(Math.random() * 2);
  val = getRandomVal(min, max);
  return negative ? val : (val * -1);
}

function initRandomShape(vertices) {
  const shapePoints = [];
  
  for (let i = 0; i < vertices; i++) {
    shapePoints.push(
      new Point(
        getRandomVal(1, width - 1),
        getRandomVal(1, height - 1),
        getNonZeroRandomDir(0.25, 0.75),
        getNonZeroRandomDir(0.25, 0.75),
      )
    )
  }

  return shapePoints;
}

function myDraw(timestamp) {
  const step = timestamp - prevTime;

  ctx.clearRect(0, 0, width, height);
  
  for (i = 0; i < shapes.length; i++) {
    ctx.beginPath();
    ctx.moveTo(shapes[i][0].px, shapes[i][0].py);
    for (j = 1; j < shapes[i].length; j++) {
      ctx.lineTo(shapes[i][j].px, shapes[i][j].py);
    }
    ctx.closePath();
    ctx.stroke();
  }

  for (i = 0; i < shapes.length; i++) {
    for (j = 0; j < shapes[i].length; j++) {
      shapes[i][j].updatePos(step);
    }
  }

  prevTime = timestamp;

  window.requestAnimationFrame(myDraw);
}

function mystifyInit() {
  shapes.push(
    initRandomShape(4)
  );
  window.requestAnimationFrame(myDraw);
}

window.onload = function() {
  mystifyInit();
};