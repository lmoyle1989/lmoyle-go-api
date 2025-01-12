const canvas = document.querySelector("#mainCanvas");
const ctx = canvas.getContext("2d");
const height = canvas.height;
const width = canvas.width;
const startTime = new Date();
let prevTime = 0;
let maxSpeed = 0.75;
let minSpeed = 0.25;
let speedModifier = 3;
let shapes = [];
let keptFrames = 22;
let frameSpacing = 3;

function Point(px, py, dx, dy) {
  this.px = [px];
  this.py = [py];
  this.dx = dx;
  this.dy = dy;
}

Point.prototype.updateDisplacement = function(step) {
  let newx = this.px[0] + ((this.dx * step * speedModifier) / 10);
  let newy = this.py[0] + ((this.dy * step * speedModifier) / 10);

  if (newx < 0 || newx > width) {
    this.dx *= -1;
    this.dx = getBounceVelocity(this.dx, minSpeed, maxSpeed)
    this.dy = getBounceVelocity(this.dy, minSpeed, maxSpeed)

    if (newx < 0) { newx = 0; }
    else { newx = width; }
  }

  if (newy < 0 || newy > height) {
    this.dy *= -1;
    this.dx = getBounceVelocity(this.dx, minSpeed, maxSpeed)
    this.dy = getBounceVelocity(this.dy, minSpeed, maxSpeed)
    
    if (newy < 0) { newy = 0; }
    else { newy = height; }
  }

  this.px.unshift(newx);
  if (this.px.length > keptFrames) {
    this.px.pop();
  }
  this.py.unshift(newy);
  if (this.py.length > keptFrames) {
    this.py.pop();
  }
};

function getRandomVal(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomVelocity(absmin, absmax) {
  negative = Math.floor(Math.random() * 2);
  val = getRandomVal(absmin, absmax);
  return negative ? val : (val * -1);
}

function getBounceVelocity(cur, min, max) {
  val = getRandomVal(min, max);
  return cur > 0 ? val : (val * -1);
}

function generateRandomShape(numVertices) {
  const shapePoints = [];
  
  for (let i = 0; i < numVertices; i++) {
    shapePoints.push(
      new Point(
        getRandomVal(1, width - 1),
        getRandomVal(1, height - 1),
        getRandomVelocity(minSpeed, maxSpeed),
        getRandomVelocity(minSpeed, maxSpeed),
      )
    )
  }

  return shapePoints;
}

function myDraw(timestamp) {
  const step = timestamp - prevTime;

  ctx.clearRect(0, 0, width, height);
  
  for (i = 0; i < shapes.length; i++) {
    for (j = 0; j < keptFrames; j += frameSpacing) {
      ctx.beginPath();
      ctx.moveTo(shapes[i][0].px[j], shapes[i][0].py[j]);
      for (k = 1; k < shapes[i].length; k++) {
        ctx.lineTo(shapes[i][k].px[j], shapes[i][k].py[j]);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  for (i = 0; i < shapes.length; i++) {
    for (j = 0; j < shapes[i].length; j++) {
      shapes[i][j].updateDisplacement(step);
    }
  }

  prevTime = timestamp;

  window.requestAnimationFrame(myDraw);
}

function mystifyInit() {
  shapes.push(generateRandomShape(4));
  shapes.push(generateRandomShape(3));
  window.requestAnimationFrame(myDraw);
}

window.onload = function() {
  mystifyInit();
};