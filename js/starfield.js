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
let stars = [];
let zmax = 10000;
let vr = Math.sqrt(((height / 2) ** 2) + ((width / 2) ** 2)) * 1.5; // this is the radius of the circle that is centered on and surrounds the viewport
// TODO: make fov param an angle, and calculate the current number?
let fov = 500; // this controls the curvature of the view lense sphere, 0 would mean a full hemisphere (180), bigger is flatter/narrower
let minradius = 0.25;
let maxradius = 3;
let numberOfStars = 400;
let speedModifier = 2;
let spawnAreaModifier = 4;
let noSpawnAreaModifier = 4;

class Star {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  calculateProjection() {
    let rad = Math.sqrt((vr ** 2) + (fov ** 2)); // radius of the view sphere
    // add depth sorting and star color
    this.projx = Math.sin(Math.atan(this.x / (this.z + fov))) * rad;
    this.projy = Math.sin(Math.atan(this.y / (this.z + fov))) * rad;
    
    // this could be better i think if it was a function of 3d euclidean distance instead of just depth
    // twinkle
    this.projrad = minradius + (maxradius * (1 - (this.z / zmax)));
  }

  updatePosition(step) {
    // add depth sorting and star color
    let newz = this.z - (step * speedModifier);
    if (newz < 0) { 
      newz = zmax; 
      let coords = getRandomStartCoords();
      this.x = coords.x;
      this.y = coords.y;
    }
    this.z = newz;
    this.calculateProjection();
  }
}

function getRandomPosNegVal(max) {
  return (Math.random() - 0.5) * (max * 2);
}

function getRandomVal(min, max) {
  return (Math.random() * (max - min) + min);
}

function getRandomStartCoords() {
  // TODO: change this to randomly generate polar coord then covert to cartesian
  let x = getRandomPosNegVal(width * spawnAreaModifier);
  let y = getRandomPosNegVal(height * spawnAreaModifier);
  let z = getRandomVal(1, zmax);

  while ((Math.abs(x) < (width / noSpawnAreaModifier)) && (Math.abs(y) < (height / noSpawnAreaModifier))) {
    x = getRandomVal(width);
    y = getRandomVal(height);
  }

  return { x: x, y: y, z: z };
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
}

function starfieldInit() {
  startButton.addEventListener("click", startAnimation);
  pauseButton.addEventListener("click", pauseAnimation);
  resetButton.addEventListener("click", resetAnimation);
  resetAnimation();
  ctx.translate((width / 2), (height / 2));
  ctx.fillStyle = "white";
  ctx.save();
}

window.onload = function() {
  starfieldInit();
};