const canvas = document.querySelector("#mainCanvas");
const ctx = canvas.getContext("2d");
const height = canvas.height;
const width = canvas.width;
const startTime = new Date();
const pauseButton = document.querySelector("#pauseButton");
const startButton = document.querySelector("#startButton");
let animId;
let prevTime = 0;
let paused = 1;
let unPaused = 0;
let vp = 1000;
let maxradius = 10;
let zmax = 0.8 * vp;
let xmax = width;
let ymax = height;
let numberOfStars = 100;
let speedModifier = 1;
let stars = [];

class Star {
  constructor(px, py, pz) {
    this.px = px;
    this.py = py;
    this.pz = pz;

    this.projx = 0;
    this.projy = 0;
    this.projrad = 0;
    // this.projtrans = 0;
  }

  calculate_projection() {
    this.projx = this.px * (1 - (this.pz / vp));
    this.projy = this.py * (1 - (this.pz / vp));
    this.projrad = maxradius * (1 - (this.pz / (zmax + 1)));
  }

  update_pos(step) {
    let newz = this.pz - (step * speedModifier);
    if (newz < 0) { newz = zmax; }
    this.pz = newz;
    this.calculate_projection();
  }
}

stars.push(new Star(400, 0, 800));

function drawFrame(timestamp) {
  let step = timestamp - prevTime;
  if (unPaused) { 
    unPaused = 0;
    step = 0;
  }
  
  ctx.clearRect(-(width / 2), -(height / 2), width, height);

  for (i = 0; i < stars.length; i++) {
    stars[i].update_pos(step);
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

function starfieldInit() {
  startButton.addEventListener("click", startAnimation);
  pauseButton.addEventListener("click", pauseAnimation);
  ctx.translate((width / 2), (height / 2));
  ctx.save();
}

window.onload = function() {
  starfieldInit();
};