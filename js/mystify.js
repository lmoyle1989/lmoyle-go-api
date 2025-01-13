const canvas = document.querySelector("#mainCanvas");
const ctx = canvas.getContext("2d");
const height = canvas.height;
const width = canvas.width;
const startTime = new Date();
const pauseButton = document.querySelector("#pauseButton");
const startButton = document.querySelector("#startButton");
const resetButton = document.querySelector("#resetButton");
let animId;
let paused = 1;
let unPaused = 0;
let prevTime = 0;
let maxSpeed = 0.9;
let minSpeed = 0.1;
let speedModifier = 0.25;
let shapes = [];
let keptFrames = 40;
let frameSpacing = 4;

function Shape(points, color) {
  this.points = points;
  this.color = color;
}

function Point(px, py, dx, dy) {
  this.px = [px];
  this.py = [py];
  this.dx = dx;
  this.dy = dy;
}

Point.prototype.updateDisplacement = function(step) {
  let newx = this.px[0] + ((this.dx * step * speedModifier));
  let newy = this.py[0] + ((this.dy * step * speedModifier));

  if (newx < 0 || newx > width) {
    this.dx *= -1;
    this.dx = getBounceVelocity(this.dx, minSpeed, maxSpeed);
    this.dy = getBounceVelocity(this.dy, minSpeed, maxSpeed);

    newx = newx < 0 ? 0 : width;
  }

  if (newy < 0 || newy > height) {
    this.dy *= -1;
    this.dx = getBounceVelocity(this.dx, minSpeed, maxSpeed);
    this.dy = getBounceVelocity(this.dy, minSpeed, maxSpeed);
    
    newy = newy < 0 ? 0 : height;
  }

  this.px.unshift(newx);
  while (this.px.length > keptFrames) { this.px.pop(); }

  this.py.unshift(newy);
  while (this.py.length > keptFrames) { this.py.pop(); }
};

function getRandomVal(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
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
  const color = `rgb(${getRandomInt(256)} ${getRandomInt(256)} ${getRandomInt(256)})`;
  const points = [];
  
  for (let i = 0; i < numVertices; i++) {
    points.push(
      new Point(
        getRandomVal(1, width - 1),
        getRandomVal(1, height - 1),
        getRandomVelocity(minSpeed, maxSpeed),
        getRandomVelocity(minSpeed, maxSpeed),
      )
    );
  }
  
  return new Shape(points, color);
}

function drawFrame(timestamp) {
  let step = timestamp - prevTime;
  if (unPaused) { 
    unPaused = 0;
    step = 0;
  }

  ctx.clearRect(0, 0, width, height);
  
  for (i = 0; i < shapes.length; i++) {
    ctx.strokeStyle = shapes[i].color;
    for (j = 0; j < keptFrames; j += frameSpacing) {
      ctx.beginPath();
      ctx.moveTo(shapes[i].points[0].px[j], shapes[i].points[0].py[j]);
      for (k = 1; k < shapes[i].points.length; k++) {
        ctx.lineTo(shapes[i].points[k].px[j], shapes[i].points[k].py[j]);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  for (i = 0; i < shapes.length; i++) {
    for (j = 0; j < shapes[i].points.length; j++) {
      shapes[i].points[j].updateDisplacement(step);
    }
  }

  prevTime = timestamp;
  if (!paused) {
    animId = window.requestAnimationFrame(drawFrame);
  }
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
  shapes = [];
  shapes.push(generateRandomShape(4));
  shapes.push(generateRandomShape(3));
}

function mystifyInit() {
  startButton.addEventListener("click", startAnimation);
  pauseButton.addEventListener("click", pauseAnimation);
  resetButton.addEventListener("click", resetAnimation);
  resetAnimation();
}

window.onload = function() {
  mystifyInit();
};