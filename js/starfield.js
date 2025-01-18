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
let spawnAreaModifier = 2;

class Star {
  constructor(px, py, pz) {
    this.px = px;
    this.py = py;
    this.pz = pz;
  }

  calculateProjection() {
    this.projx = this.px * proj(this.pz, warpFactor);
    this.projy = this.py * proj(this.pz, warpFactor);
    
    // so i think this actually needs to be a function of the euclidean distance to the origin
    this.projrad = minradius + (maxradius * (1 - (this.pz / zmax)));
  }

  updatePosition(step) {
    let newz = this.pz - (step * speedModifier);
    if (newz < 0) { 
      newz = zmax; 
      let coords = getRandomStartCoords();
      this.px = coords.x;
      this.py = coords.y;
    }
    this.pz = newz;
    this.calculateProjection();
  }
}

// in desmos visualize with -(z/(v/(r^n))^(1/n) + r which this is derived from.
// a simple proportional projection reduces to 1 - (z / v)
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
  let x = getRandomPosNegVal(width * spawnAreaModifier);
  let y = getRandomPosNegVal(height * spawnAreaModifier);
  let z = getRandomVal(1, zmax);

  while ((Math.abs(x) < width / 2) && (Math.abs(y) < height / 2)) {
    x = getRandomVal(width);
    y = getRandomVal(height);
  }

  return {
    x: x,
    y: y,
    z: z,
  };
}

function generateRandomStar() {
  coords = getRandomStartCoords();

  return new Star(coords.x, coords.y, coords.z);
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
  // test cases
  // for (i = 0; i < 10; i++) {
  //   stars.push(new Star(
  //     (((i*2) / 10) * width) + (width / 2),
  //     (((i*2) / 10) * height) + (height / 2) / 2,
  //     zmax
  //   ))
  // }
  // for (i = 0; i < 10; i++) {
  //   stars.push(new Star(
  //     (width / 2),
  //     (height / 2),
  //     (zmax - ((i / 10) * (zmax / 2)) )
  //   ))
  // }
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