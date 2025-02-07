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
let sizeScale = 20;
let curRotation = 0;
let speedModifier = 1;
let maze;

class Maze {
  constructor(lines, soln, m, n) {
    this.m = m * 2;
    this.n = n * 2;
    this.hlines = lines[0];
    this.vlines = lines[1];
    this.soln = soln;
    this.idx = 0;
    this.dx = soln[this.idx+1][1] - soln[this.idx][1];
    this.dy = soln[this.idx+1][0] - soln[this.idx][0];
    this.x = soln[this.idx][1];
    this.y = soln[this.idx][0];
    this.lx = this.x;
    this.ly = this.y;
  }

  drawRow(ctx, row, y) {
    const offset = this.x;
    for (let i = 0; i < row.length; i++) {
      ctx.beginPath();
      ctx.moveTo((row[i][0] - offset) * sizeScale, y);
      ctx.lineTo((row[i][1] - offset) * sizeScale, y);
      ctx.stroke();
    }
  }

  drawCol(ctx, col, x) {
    const offset = this.y;
    for (let i = 0; i < col.length; i++) {
      ctx.beginPath();
      ctx.moveTo(x, (col[i][0] - offset) * sizeScale);
      ctx.lineTo(x, (col[i][1] - offset) * sizeScale);
      ctx.stroke();
    }
  }

  drawRows(ctx) {
    const offset = this.y;
    for (let i = 0; i < this.hlines.length; i++) {
      const y = ((i * 2) - offset) * sizeScale;
      this.drawRow(ctx, this.hlines[i], y);
    }
  }

  drawCols(ctx) {
    const offset = this.x;
    for (let i = 0; i < this.vlines.length; i++) {
      const x = ((i * 2) - offset) * sizeScale;
      this.drawCol(ctx, this.vlines[i], x);
    }
  }

  drawMaze(ctx) {
    this.drawRows(ctx);
    this.drawCols(ctx);
  }

  updatePos(step) {
    this.x += ((step * this.dx) / 100) * speedModifier;
    this.y += ((step * this.dy) / 100) * speedModifier;
    if ((Math.abs(this.x - this.lx) >= 1) || (Math.abs(this.y - this.ly) >= 1)) {
      this.lx = Math.round(this.x);
      this.ly = Math.round(this.y);
      let curdx = this.dx
      let curdy = this.dy
      this.idx += 1;
      this.dx = this.soln[this.idx+1][1] - this.soln[this.idx][1];
      this.dy = this.soln[this.idx+1][0] - this.soln[this.idx][0];
      if ((curdx != this.dx) || (curdy != this.dy)) { // correct our graphical location if we're off a bit
        this.x = this.lx
        this.y = this.ly
      }
    }
  }
}

function drawFrame(timestamp) {
  let step = timestamp - prevTime;
  if (unPaused) { 
    unPaused = 0;
    step = 0;
  }

  // ctx.rotate(((0.1 * step) * Math.PI) / 180);
  ctx.clearRect(-width, -height, 2 * width, 2 * height);
  maze.updatePos(step);
  maze.drawMaze(ctx);
  drawOriginDot(ctx);

  prevTime = timestamp;
  if (!paused) {
    animId = window.requestAnimationFrame(drawFrame);
  }
}

function drawOriginDot(ctx) {
  ctx.beginPath();
  ctx.arc(0, 0, sizeScale / 4, 0, (2 * Math.PI));
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

async function resetAnimation() {
  maze = await getMazeData();
}

function mazeInit() {
  startButton.addEventListener("click", startAnimation);
  pauseButton.addEventListener("click", pauseAnimation);
  resetButton.addEventListener("click", resetAnimation);
  ctx.translate((width / 2), (height / 2));
  ctx.strokeStyle = "white";
  ctx.fillStyle = "white";
  ctx.save();
}

async function getMazeData() {
  const url = "/mazedata";
  const response = await fetch(url);
  const json = await response.json();
  let newMaze = new Maze(json.lines, json.solution, json.m, json.n);
  return newMaze;
}

window.onload = async function() {
  maze = await getMazeData();
  mazeInit();
};