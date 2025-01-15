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
let spacexmax = width * 1.5;
let spaceymax = height * 1.5;
let numberOfStars = 100;

class Star {
  constructor(px, py, pz) {
    this.px = px
    this.py = py
    this.pz = pz

    this.projx = 0
    this.projy = 0
  }

  calculate_projection() {
    this.projx = this.px * (-(this.pz / vp) + 1);
    this.projy = this.py * (-(this.pz / vp) + 1);
  }
}

function drawFrame(timestamp) {
  let step = timestamp - prevTime;
  if (unPaused) { 
    unPaused = 0;
    step = 0;
  }

  ctx.clearRect(0, 0, width, height);

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