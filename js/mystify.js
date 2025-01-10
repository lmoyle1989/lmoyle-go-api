const startTime = new Date();
const ctx = document.querySelector("#mainCanvas").getContext("2d");
height = 640
width = 800

window.onload = function() {
  mystifyInit();
}

function mystifyInit() {
  window.requestAnimationFrame(mystifyDraw);
}

function mystifyDraw() {
  ctx.globalCompositeOperation = "destination-over";
  ctx.clearRect(0, 0, width, height);

  const currentTime = new Date();
  const timeDiff = currentTime - startTime;

  dotxpos = 800 * ((timeDiff % 10000) / 10000);
  const mydot = new Path2D();
  mydot.arc(dotxpos, 320, 15, 0, 2 * Math.PI);
  ctx.fill(mydot);

  window.requestAnimationFrame(mystifyDraw);
}

function timeSinceLoad() {
  return 
}