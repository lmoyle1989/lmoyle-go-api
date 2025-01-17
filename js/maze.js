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
let vp = 1000;
let zmax = 0.9 * vp;
let cellSize = 5;
let mazeSize = 50;
let speedModifier = 1.5;
let cameraDir = [0,0,-1];

class Point {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

class Maze {
  constructor(size) {
    this.size = size;
    this.p = [
      new Point(-size, -size, 0),
      new Point(-size, size, 0),
      new Point(size, size, 0),
      new Point(size, -size, 0)
    ]
  }

  drawMaze(ctx, org) {
    ctx.beginPath();
    ctx.moveTo(this.p[0].x - org.x, this.p[0].y - org.y);
    for (i = 1; i < 4; i++) { 
      ctx.lineTo(this.p[i].x - org.x, this.p[i].y - org.y);
    }
    ctx.closePath();
    ctx.stroke()
  }
}

const maze = new Maze(mazeSize);
const org = new Point(0,0,0);

function drawFrame(timestamp) {
  let step = timestamp - prevTime;
  if (unPaused) { 
    unPaused = 0;
    step = 0;
  }

  ctx.clearRect(-(width / 2), -(height / 2), width, height);

  maze.drawMaze(ctx, org);

  prevTime = timestamp;
  if (!paused) {
    animId = window.requestAnimationFrame(drawFrame);
  }
}

function drawOriginDot() {
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, (2 * Math.PI));
  ctx.fill();
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

function mazeInit() {
  startButton.addEventListener("click", startAnimation);
  pauseButton.addEventListener("click", pauseAnimation);
  ctx.translate((width / 2), (height / 2));
  ctx.strokeStyle = "white";
  ctx.fillStyle = "white";
  ctx.save();
}

window.onload = function() {
  mazeInit();
};