const canvas = document.querySelector("#mainCanvas");
const ctx = canvas.getContext("2d");
const height = canvas.height;
const width = canvas.width;

function drawFrame() {
	ctx.clearRect(-width / 2, -height / 2, width, height);
	drawDot(ctx);
	window.requestAnimationFrame(drawFrame);
}

function drawDot(ctx) {
	ctx.beginPath();
	ctx.arc(0, 0, 10, 0, (2 * Math.PI));
	ctx.fill();
}

function startAnimation() {
	window.requestAnimationFrame(drawFrame);
}

function pauseAnimation() {}

function resetAnimation() {}

function canvasInit() {
	ctx.translate((width / 2), (height / 2));
	ctx.strokeStyle = "white";
	ctx.fillStyle = "white";
	ctx.save();
}

function interfaceInit() {
  startButton.addEventListener("click", startAnimation);
  pauseButton.addEventListener("click", pauseAnimation);
  resetButton.addEventListener("click", resetAnimation);
}

window.onload = async function() {
	interfaceInit();
	canvasInit();
};