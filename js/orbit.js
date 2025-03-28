const canvas = document.querySelector("#mainCanvas");
const ctx = canvas.getContext("2d");
const height = canvas.height;
const width = canvas.width;
let prevTime = 0;

class Orbit {
	constructor(e, h, mu, omega, children, parent, size) {
		this.speedFactor = 1000;
		this.e = e; // eccentricity
		this.h = h; // specific relative angular momentum
		this.mu = mu; // standard gravitational parameter
		this.omega = omega; // argument of periapsis
		this.children = children
		this.parent = parent
		this.size = size

		this.fixedPosX = 0;
		this.fixedPosY = 0;

		this.calculateOrbitalEllipse();
		this.keplersEquation(0); // true anomaly	
		this.updateOrbitRad();
		this.updateCartesianPos();
	}

	calculateOrbitalEllipse() {
		this.p = (this.h ** 2) / this.mu; // semi-latus rectum
		this.a = this.p / (1 - (this.e ** 2)); // major axis
		this.b = this.a * Math.sqrt((1 - (this.e ** 2))); // minor axis
		this.majorAngle = this.omega + (Math.PI / 2)
		this.fx = -(this.a * this.e * Math.cos(this.majorAngle)); // ellipse center position x
		this.fy = -(this.a * this.e * Math.sin(this.majorAngle)); // ellipse center position y
		if (this.parent != null) {
			this.fx += this.parent.px
			this.fy += this.parent.py
		}
		this.period = 2 * Math.PI * Math.sqrt((this.a ** 3) / this.mu); // Kepler's law
	}

	keplersEquation(timestamp) {
		const time = (timestamp / 1000) * this.speedFactor;
		const meanAnomaly = ((2 * Math.PI) / this.period) * time;
		const maxIterations = 10;
		const minError = 0.000001;
		let eccentricAnomaly = meanAnomaly
		for (let i = 0; i < maxIterations; i++) {
			const delta = (eccentricAnomaly - this.e * Math.sin(eccentricAnomaly) - meanAnomaly) / (1 - this.e * Math.cos(eccentricAnomaly));
			eccentricAnomaly -= delta;
			if (Math.abs(delta) < minError) {
				break;
			}
		}
		this.theta = 2 * Math.atan(Math.sqrt((1 + this.e) / (1 - this.e)) * Math.tan(eccentricAnomaly / 2))
	}

	updateOrbitRad() {
		this.r = this.p / (1 + this.e * Math.cos(this.theta)); // separation distance
	}

	updateCartesianPos() {
		if (this.parent != null) {
			this.px = (this.r * Math.sin(this.theta - this.omega)) + this.parent.px;
			this.py = (this.r * Math.cos(this.theta - this.omega)) + this.parent.py;
		}
		else {
			this.px = this.fixedPosX
			this.py = this.fixedPosY
		}
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

	updateFrame(ctx, timestamp) {
		if (this.parent != null) {
			this.calculateOrbitalEllipse()
			this.keplersEquation(timestamp);
			this.updateOrbitRad();
			this.drawOrbitalEllipse(ctx);
		}
		this.updateCartesianPos();
		this.drawBody(ctx);
	}
}

theSun = new Orbit(0, 24, 10, Math.PI, [], null, 20)
theEarth = new Orbit(0.8, 24, 10, Math.PI, [], theSun, 6)
theMoon = new Orbit(0.2, 12, 5, Math.PI, [], theEarth, 4)

testBodies = [
	// new Orbit(0.8, 24, 10, Math.PI, [], null, 5),
	// new Orbit(0.5, 12, 1, Math.PI / 2),
	// new Orbit(0.8, 10, 2, 3 * Math.PI / 2),
	// new Orbit(0.95, 10, 2, (2 * Math.PI) * 0.66)
	theSun,
	theEarth,
	theMoon
];

function drawFrame(timestamp) {
	// let step = timestamp - prevTime;

	ctx.clearRect(-width / 2, -height / 2, width, height);
	// drawDot(ctx, 0, 0, 20); center dot?

	for (let i = 0; i < testBodies.length; i++) {
		testBodies[i].updateFrame(ctx, timestamp);
	}

	// prevTime = timestamp;

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
