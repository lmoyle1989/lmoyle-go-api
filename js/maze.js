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
let speedModifier = 1.5;
let sizeScale = 10;

class Maze {
  constructor(lines, m, n) {
    this.m = m * 2;
    this.n = n * 2;
    this.hlines = lines[0];
    this.vlines = lines[1];
  }

  drawRow(ctx, row, y) {
    for (let i = 0; i < row.length; i++) {
      ctx.beginPath();
      ctx.moveTo((row[i][0] - (this.n / 2)) * sizeScale, y);
      ctx.lineTo((row[i][1] - (this.n / 2)) * sizeScale, y);
      ctx.stroke();
    }
  }

  drawCol(ctx, col, x) {
    for (let i = 0; i < col.length; i++) {
      ctx.beginPath();
      ctx.moveTo(x, (col[i][0] - (this.m / 2)) * sizeScale);
      ctx.lineTo(x, (col[i][1] - (this.m / 2)) * sizeScale);
      ctx.stroke();
    }
  }

  drawRows(ctx) {
    for (let i = 0; i < this.hlines.length; i++) {
      const y = ((i * 2) - (this.m / 2)) * sizeScale;
      this.drawRow(ctx, this.hlines[i], y);
    }
  }

  drawCols(ctx) {
    for (let i = 0; i < this.vlines.length; i++) {
      const x = ((i * 2) - (this.n / 2)) * sizeScale;
      this.drawCol(ctx, this.vlines[i], x);
    }
  }

  drawMaze(ctx) {
    this.drawRows(ctx);
    this.drawCols(ctx);
  }
}

let lines = [[[[0, 50]], [[0, 6], [10, 12], [14, 18], [22, 24], [26, 28], [38, 46]], [[2, 4], [10, 16], [20, 26], [30, 32], [36, 38], [42, 46]], [[0, 2], [8, 16], [18, 20], [26, 34], [38, 40], [46, 48]], [[6, 12], [16, 18], [20, 36], [40, 42], [44, 48]], [[0, 6], [18, 26], [28, 34], [38, 40], [46, 50]], [[2, 6], [14, 34], [36, 42], [44, 48]], [[2, 4], [12, 14], [18, 30], [32, 40], [42, 44], [46, 50]], [[0, 2], [6, 8], [12, 14], [18, 22], [24, 28], [36, 42], [44, 48]], [[8, 20], [22, 24], [30, 40], [44, 48]], [[6, 10], [12, 14], [16, 24], [26, 28], [32, 34], [38, 42], [46, 50]], [[2, 8], [14, 16], [18, 26], [28, 30], [32, 36], [38, 40], [44, 48]], [[0, 2], [4, 8], [16, 20], [26, 28], [30, 32], [34, 38], [40, 46]], [[2, 4], [6, 10], [14, 20], [22, 30], [32, 34], [40, 48]], [[12, 18], [22, 28], [40, 42], [46, 50]], [[0, 2], [12, 16], [20, 26], [32, 42], [44, 48]], [[2, 14], [16, 18], [26, 28], [30, 34], [38, 40], [42, 44], [48, 50]], [[0, 12], [14, 16], [18, 22], [36, 38], [42, 44], [46, 48]], [[2, 24], [26, 28], [34, 36], [40, 42], [44, 48]], [[2, 20], [24, 26], [28, 30], [32, 38], [42, 44], [46, 48]], [[0, 50]]], [[[0, 40]], [[6, 8], [16, 20], [22, 24], [28, 30]], [[4, 10], [14, 22], [24, 32]], [[2, 8], [12, 20], [26, 30]], [[0, 6], [8, 16], [28, 32]], [[10, 18], [20, 32]], [[0, 2], [8, 16], [18, 30]], [[2, 4], [6, 12], [22, 26], [32, 34]], [[8, 10], [12, 18], [20, 22], [34, 36]], [[2, 8], [10, 12], [28, 34]], [[2, 4], [6, 8], [16, 18], [24, 32], [38, 40]], [[0, 2], [4, 6], [18, 20], [22, 26], [32, 34], [36, 38]], [[6, 8], [14, 18], [24, 26], [30, 36]], [[2, 6], [18, 24], [28, 30], [32, 36], [38, 40]], [[2, 4], [8, 10], [16, 18], [30, 34], [36, 38]], [[0, 4], [14, 22], [24, 38]], [[2, 4], [12, 16], [20, 24], [26, 30], [34, 38]], [[0, 6], [16, 18], [24, 28], [32, 36]], [[2, 12], [14, 16], [18, 22], [26, 34]], [[6, 10], [20, 28], [34, 38]], [[2, 6], [26, 28], [32, 40]], [[4, 14], [16, 24], [30, 34], [36, 38]], [[6, 12], [14, 16], [18, 22], [26, 30], [34, 36]], [[0, 2], [4, 6], [12, 14], [30, 34]], [[2, 6], [16, 18], [22, 26], [34, 36], [38, 40]], [[0, 40]]]]

const maze = new Maze(lines, 20, 25);

function drawFrame(timestamp) {
  let step = timestamp - prevTime;
  if (unPaused) { 
    unPaused = 0;
    step = 0;
  }

  ctx.clearRect(-(width / 2), -(height / 2), width, height);

  maze.drawMaze(ctx);

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