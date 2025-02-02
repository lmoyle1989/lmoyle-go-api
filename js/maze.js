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

class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

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
    this.x += ((step * this.dx) / 100);
    this.y += ((step * this.dy) / 100);
    if ((Math.abs(this.x - this.lx) >= 1) || (Math.abs(this.y - this.ly) >= 1)) {
      this.lx = Math.round(this.x);
      this.ly = Math.round(this.y);
      let curdx = this.dx
      let curdy = this.dy
      this.idx += 1;
      this.dx = soln[this.idx+1][1] - soln[this.idx][1];
      this.dy = soln[this.idx+1][0] - soln[this.idx][0];
      if ((curdx != this.dx) || (curdy != this.dy)) {
        this.x = this.lx
        this.y = this.ly
      }
    }
  }
}

let lines = [[[[0, 20]], [[8, 16]], [[6, 14]], [[4, 8], [18, 20]], [[0, 12], [16, 18]], [[2, 6], [8, 14], [16, 20]], [[2, 4], [6, 16]], [[0, 2], [6, 8], [16, 18]], [[12, 14]], [[2, 6], [8, 16], [18, 20]], [[0, 20]]], [[[0, 20]], [[0, 6], [10, 12], [14, 18]], [[0, 6], [12, 16]], [[2, 4], [10, 12], [14, 18]], [[0, 2], [16, 18]], [[4, 8], [12, 16]], [[6, 8], [14, 16]], [[4, 10], [12, 16]], [[2, 8], [10, 12], [14, 20]], [[2, 6], [12, 14], [16, 18]], [[0, 20]]]];

let soln = [[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [7, 2], [7, 3], [6, 3], [5, 3], [4, 3], [3, 3], [2, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [7, 8], [7, 9], [6, 9], [5, 9], [5, 8], [5, 7], [5, 6], [5, 5], [4, 5], [3, 5], [2, 5], [1, 5], [1, 6], [1, 7], [2, 7], [3, 7], [3, 8], [3, 9], [3, 10], [3, 11], [3, 12], [3, 13], [3, 14], [3, 15], [4, 15], [5, 15], [6, 15], [7, 15], [8, 15], [9, 15], [9, 16], [9, 17], [9, 18], [9, 19], [8, 19], [7, 19], [7, 18], [7, 17], [6, 17], [5, 17], [4, 17], [3, 17], [2, 17], [1, 17], [1, 18], [1, 19], [2, 19], [3, 19], [4, 19], [5, 19], [4, 19], [3, 19], [2, 19], [1, 19], [1, 18], [1, 17], [1, 16], [1, 15], [1, 14], [1, 13], [1, 12], [1, 11], [1, 10], [1, 9], [1, 10], [1, 11], [1, 12], [1, 13], [1, 14], [1, 15], [1, 16], [1, 17], [2, 17], [3, 17], [4, 17], [5, 17], [6, 17], [7, 17], [7, 18], [7, 19], [8, 19], [9, 19], [9, 18], [9, 17], [9, 16], [9, 15], [10, 15], [11, 15], [11, 14], [11, 13], [11, 12], [11, 11], [11, 10], [11, 9], [11, 8], [11, 7], [10, 7], [9, 7], [9, 6], [9, 5], [9, 4], [9, 3], [9, 2], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [13, 2], [13, 3], [14, 3], [15, 3], [16, 3], [17, 3], [17, 4], [17, 5], [16, 5], [15, 5], [14, 5], [13, 5], [12, 5], [11, 5], [11, 4], [11, 3], [11, 4], [11, 5], [12, 5], [13, 5], [13, 6], [13, 7], [13, 8], [13, 9], [14, 9], [15, 9], [16, 9], [17, 9], [17, 10], [17, 11], [16, 11], [15, 11], [14, 11], [13, 11], [13, 12], [13, 13], [14, 13], [15, 13], [14, 13], [13, 13], [13, 12], [13, 11], [14, 11], [15, 11], [16, 11], [17, 11], [17, 12], [17, 13], [17, 14], [17, 15], [16, 15], [15, 15], [14, 15], [13, 15], [13, 16], [13, 17], [12, 17], [11, 17], [11, 18], [11, 19], [12, 19], [13, 19], [14, 19], [15, 19], [16, 19], [17, 19], [16, 19], [15, 19], [15, 18], [15, 17], [16, 17], [17, 17], [18, 17], [19, 17], [19, 18], [19, 19], [19, 19]];

const maze = new Maze(lines, soln, 10, 10);

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