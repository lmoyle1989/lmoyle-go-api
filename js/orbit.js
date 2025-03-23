const canvas = document.querySelector("#mainCanvas");
const ctx = canvas.getContext("2d");
const height = canvas.height;
const width = canvas.width;
let prevTime = 0;

class GeometricOrbitalBody {
	constructor(size, initialTheta, e, h, mu, omega) {
		this.size = size // visual radius of the circle
		this.theta = initialTheta; // true anomaly
		this.e = e; // eccentricity
		this.h = h; // specific relative angular momentum
		this.mu = mu; // standard gravitational parameter
		this.omega = omega; // argument of periapsis
		this.p = (this.h ** 2) / this.mu; // semi-latus rectum

		this.updateOrbitRad();
		this.updateCartesianPos();
		this.calculateOrbitalEllipse();
	}
	
	updateOrbitRad() {
		this.r = this.p / (1 + this.e * Math.cos(this.theta + this.omega));
	}

	updateCartesianPos() {
		this.px = this.r * Math.sin(this.theta);
		this.py = this.r * Math.cos(this.theta);
	}

	calculateOrbitalEllipse() {
		this.a = this.p / (1 - (this.e ** 2)); // major axis
		this.b = this.a * Math.sqrt((1 - (this.e ** 2))); // minor axis
		this.majorAngle = this.omega + (Math.PI / 2)
		this.fx = -(this.a * this.e * Math.cos(this.majorAngle)); // focus position x
		this.fy = -(this.a * this.e * Math.sin(this.majorAngle)); // focus position y
	}

	drawOrbitalEllipse(ctx) {
		ctx.beginPath();
		ctx.ellipse(this.fx, this.fy, this.a, this.b, this.majorAngle, 0, 2 * Math.PI);
		ctx.stroke();
	}

	drawBody(ctx) {
		ctx.beginPath();
		ctx.arc(this.px, this.py, this.size, 0, (2 * Math.PI));
		ctx.fill();	
	}

	updateFrame(ctx, step) {
		this.theta += step * (10 / (this.r ** 2));
		this.updateOrbitRad();
		this.updateCartesianPos();
		this.drawOrbitalEllipse(ctx);
		this.drawBody(ctx);
	}
}

testBodies = [
	new GeometricOrbitalBody(5, 0, 0.75, 8, 1, Math.PI / 4),
	new GeometricOrbitalBody(5, 0, 0.5, 12, 1, Math.PI),
	new GeometricOrbitalBody(5, 0, 0.9, 10, 1, (3/2) * Math.PI)
];

function drawFrame(timestamp) {
	let step = timestamp - prevTime;

	ctx.clearRect(-width / 2, -height / 2, width, height);
	drawDot(ctx, 0, 0, 20);

	for (let i = 0; i < testBodies.length; i++) {
		testBodies[i].updateFrame(ctx, step);
	}
	
	prevTime = timestamp;
	
	window.requestAnimationFrame(drawFrame);
}

function drawDot(ctx, x, y, rad) {
	ctx.beginPath();
	ctx.arc(x, y, rad, 0, (2 * Math.PI));
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
