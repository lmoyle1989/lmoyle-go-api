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
let vr = (Math.sqrt(((height ** 2) / 4) + ((width ** 2) / 4))) * 2;
let zmax = 0.8 * vp;
let minradius = 0.5;
let maxradius = 2;
let numberOfStars = 200;
let speedModifier = 0.25;
let stars = [];
let warpFactor = 4;
let startAreaModifier = 2;

class Star {
  constructor(px, py, pz) {
    this.px = px;
    this.py = py;
    this.pz = pz;
  }

  calculateProjection() {
    this.projx = this.px * proj(this.pz, warpFactor);
    this.projy = this.py * proj(this.pz, warpFactor);
    this.projrad = minradius + (maxradius * (1 - (this.pz / zmax)));
  }

  updatePosition(step) {
    let newz = this.pz - (step * speedModifier);
    if (newz < 0) { 
      newz = zmax; 
      coords = getRandomStartCoords();
      this.px = coords[0];
      this.py = coords[1];
    }
    this.pz = newz;
    this.calculateProjection();
  }
}

// in desmos visualize with -(x/(v/(r^n))^(1/n) + r which this is derived from
// simple proportional projection reduces to 1 - (x / v)
function proj(z, n) {
  return (1 - (Math.pow((z * (vr ** n)) / vp, (1 / n)) / vr));
}

function getRandomPosNegVal(max) {
  return (Math.random() - 0.5) * (max * 2);
}

function getRandomVal(min, max) {
  return (Math.random() * (max - min) + min);
}

function getRandomStartCoords() {
  let x = getRandomPosNegVal(width * startAreaModifier);
  let y = getRandomPosNegVal(height * startAreaModifier);
  let z = getRandomVal(1, zmax);

  while ((Math.abs(x) < width / 2) && (Math.abs(y) < height / 2)) {
    x = getRandomVal(width);
    y = getRandomVal(height);
  }

  return [x,y,z];
}

function generateRandomStar() {
  coords = getRandomStartCoords();

  return new Star(coords[0], coords[1], coords[2]);
}

function drawFrame(timestamp) {
  let step = timestamp - prevTime;
  if (unPaused) { 
    unPaused = 0;
    step = 0;
  }
  
  ctx.clearRect(-(width / 2), -(height / 2), width, height);

  for (i = 0; i < stars.length; i++) {
    stars[i].updatePosition(step);
  }
  
  for (i = 0; i < stars.length; i++) {
    ctx.beginPath();
    ctx.arc(stars[i].projx, stars[i].projy, stars[i].projrad, 0, (2 * Math.PI));
    ctx.fill();
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
  stars = [];
  for (i = 0; i < numberOfStars; i++) {
    stars.push(generateRandomStar());
  }
}

function starfieldInit() {
  startButton.addEventListener("click", startAnimation);
  pauseButton.addEventListener("click", pauseAnimation);
  resetButton.addEventListener("click", resetAnimation);
  resetAnimation()
  ctx.translate((width / 2), (height / 2));
  ctx.fillStyle = "white";
  ctx.save();
}

window.onload = function() {
  starfieldInit();
};