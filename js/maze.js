// TODOs:
//  reset button doesn't work properly mid-rotation
//  maybe get some background or something?
//  would be cool if the "player" moved along a curve instead of stopping to turn
//  add ability to toggle rotation
//  rewrite the maze generator in JS or make getting the mazedata less hacky    

const canvas = document.querySelector("#mainCanvas");
const ctx = canvas.getContext("2d");
const height = canvas.height;
const width = canvas.width;
const pauseButton = document.querySelector("#pauseButton");
const startButton = document.querySelector("#startButton");
const resetButton = document.querySelector("#resetButton");
const dirMap = {
  "1,0": 270,
  "0,1": 180,
  "-1,0": 90,
  "0,-1": 0,
};
let animId;
let prevTime = 0;
let paused = 1;
let unPaused = 0;
let sizeScale = 10;
let curRotation = 0;
let speedModifier = 1;
let enableRotation = true;
let maze;


// The key here is that the "player" does not move, nor really exist; the map is just rotating and be rerendered around the midpoint
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
    this.ldx = this.dx;
    this.ldy = this.dy;
    this.x = soln[this.idx][1];
    this.y = soln[this.idx][0];
    this.lx = this.x;
    this.ly = this.y;
    
    this.rotationAmount = 0;
    this.rotationDirection = 1;
    this.rotating = false;
    this.angle = dirMap[[this.dx, this.dy].toString()];
    this.lastangle = this.angle;
  }

  setInitialRotation(ctx) {
    ctx.save();
    ctx.rotate((Math.PI / 180) * this.angle);
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

  updatePos(step, ctx) {
    if (this.rotating) {
      let dtheta = (step / 5) * speedModifier;
      this.rotationAmount -= dtheta;
      if (this.rotationAmount <= 0) {
        dtheta -= (this.rotationAmount * -1);
        this.rotating = false;
      }
      ctx.rotate((Math.PI / 180) * dtheta * this.rotationDirection);
    }
    else {
      this.x += ((step * this.dx) / 100) * speedModifier;
      this.y += ((step * this.dy) / 100) * speedModifier;
      if ((Math.abs(this.x - this.lx) >= 1) || (Math.abs(this.y - this.ly) >= 1)) { // detect if weve made it to a new grid point
        this.lx = this.soln[this.idx+1][1]; // update last position to current position because we just got here
        this.ly = this.soln[this.idx+1][0];
        this.ldx = this.dx; // save last direction to compare to next step
        this.ldy = this.dy;
        this.idx += 1; // move pointer to target the next step of the solution path
        this.dx = this.soln[this.idx+1][1] - this.soln[this.idx][1]; // update movement direction to towards the next step in the path
        this.dy = this.soln[this.idx+1][0] - this.soln[this.idx][0];
        if ((this.ldx != this.dx) || (this.ldy != this.dy)) { // detect if we changed movement direction
          this.lastangle = this.angle;
          this.angle = dirMap[[this.dx, this.dy].toString()];
          this.x = this.lx; // snap our graphical position to the grid when we change direction to keep us in the maze lanes, instead of stacking up float error
          this.y = this.ly;
          if (enableRotation) {
            this.rotationAmount = getRotationAmount(this.lastangle, this.angle);
            this.rotationDirection = Math.sign(this.rotationAmount);
            this.rotationAmount = Math.abs(this.rotationAmount);
            this.rotating = true;
          }
        }
      }
    }
  }
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function getRotationAmount(cur, tar) {
  const diff = tar - cur;
  const val = mod(diff, 360);
  if (val == 270) { return -90; }
  else if (val == 90) { return 90; }
  else { return 180; }
}

function drawFrame(timestamp) {
  let step = timestamp - prevTime;
  if (unPaused) { 
    unPaused = 0;
    step = 0;
  }

  ctx.clearRect(-width, -height, 2 * width, 2 * height);
  maze.updatePos(step, ctx);
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
  ctx.restore();
  maze = await getMazeData();
  maze.setInitialRotation(ctx)
}

function mazeInterfaceInit() {
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

async function getMazeData() {
  const url = "/mazedata";
  const response = await fetch(url);
  const json = await response.json();
  let newMaze = new Maze(json.lines, json.solution, json.m, json.n);
  return newMaze;
}

window.onload = async function() {
  canvasInit();
  maze = await getMazeData();
  maze.setInitialRotation(ctx)
  mazeInterfaceInit();
};