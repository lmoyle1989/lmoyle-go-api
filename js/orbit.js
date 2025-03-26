const canvas = document.querySelector("#mainCanvas");
const ctx = canvas.getContext("2d");
const height = canvas.height;
const width = canvas.width;
let prevTime = 0;

class OrbitalSystem {
	constructor(satellites) {
		this.satelliets = satellites
	}
}

class GeometricOrbitalBody {
	constructor(size, initialTheta, e, h, mu, omega) {
		this.size = size // visual radius of the circle
		this.theta = initialTheta - omega; // true anomaly; if initialTheta is 0, this will start at periapsis
		this.e = e; // eccentricity
		this.h = h; // specific relative angular momentum
		this.mu = mu; // standard gravitational parameter
		this.omega = omega; // argument of periapsis
		this.timer;
		
		this.updateOrbitRad();
		this.updateCartesianPos();
		this.calculateOrbitalEllipse();
		this.calculateOrbitalPeriod();	
	}
	
	updateOrbitRad() {
		this.p = (this.h ** 2) / this.mu; // semi-latus rectum
		this.r = this.p / (1 + this.e * Math.cos(this.theta)); // separation distance
	}

	updateCartesianPos() {
		this.px = this.r * Math.sin(this.theta + this.omega);
		this.py = this.r * Math.cos(this.theta + this.omega);
	}

	calculateOrbitalEllipse() {
		this.a = this.p / (1 - (this.e ** 2)); // major axis
		this.b = this.a * Math.sqrt((1 - (this.e ** 2))); // minor axis
		this.majorAngle = this.omega + (Math.PI / 2)
		this.fx = -(this.a * this.e * Math.cos(this.majorAngle)); // focus position x
		this.fy = -(this.a * this.e * Math.sin(this.majorAngle)); // focus position y
	}

	calculateOrbitalPeriod() {
		this.period = 2 * Math.PI * Math.sqrt((this.a ** 3) / this.mu); // Kepler's law
		// This factor, K, ensures that our orbit, after the dtheta step is modified by (1 / r^2(theta)), will take exactly the period to complete
		// with help from chatgpt we're solving for K in this integral: ∫0->T ​(2π/T * (1 / (r^2(θ(t)))) ​* K) dt = 2π which turns into 2π/T * K * ∫0->T ​(1 / (r^2(θ(t))) = 2π
		// then bc of specific angular momentum, dt = (r^2(θ) / h)dθ so ∫0->T 1 / r2(θ(t)) dt = ∫0->2π (1 / r^2(θ)) * (r^2(θ) / h) ​dθ = ∫0->2π ​1/h ​dθ = 2π / h​
		this.k = (this.period * this.h) / (2 * Math.PI)
	}

	keplersEquation(timestamp) {
		const speedFactor = 1000;
		const time = (timestamp / 1000) * speedFactor;
		const meanAnomaly = ((2 * Math.PI) / this.period) * time;
		const maxIterations = 10;
		const minError = 0.000001;

		let eccentricAnomaly = meanAnomaly
		for (let i = 0; i < maxIterations; i++) {
			const delta = (eccentricAnomaly - this.e * Math.sin(eccentricAnomaly) - meanAnomaly) / (1 - this.e * Math.cos(eccentricAnomaly));
			eccentricAnomaly = eccentricAnomaly - delta;
			if (Math.abs(delta) < minError) {
				break;
			}
		}

		const theta = 2 * Math.atan(Math.sqrt((1 + this.e) / (1 - this.e)) * Math.tan(eccentricAnomaly / 2))

		return theta;
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

	updateApproxFrame(ctx, step) {
		// APROXIMATE:
		// dtheta = 
		// (adjustment for simulation) *
		// (deltaT in s) *
		// (time normalization to ensure 2pi radians in a single period in seconds) *
		// (rough approximation to make object slower at apoapsis and faster at periapsis) *
		// (approximation adjustment to ensure period stays correct) 

		const speedFactor = 1000;
		const dtheta = speedFactor * (step / 1000) * (2 * Math.PI / this.period) * (1 / (this.r ** 2)) * this.k;
		this.theta += dtheta;

		// for debugging to period
		// if (last_theta % (Math.PI * 2) > this.theta % (Math.PI * 2)) {
		// 	console.log(this.theta % (Math.PI * 2));
		// 	console.log(performance.now() - this.timer);
		// 	this.timer = performance.now()
		// }
		
		this.updateOrbitRad();
		this.updateCartesianPos();
		this.drawOrbitalEllipse(ctx);
		this.drawBody(ctx);
	}

	updateExactFrame(ctx, timestamp) {
		this.theta = this.keplersEquation(timestamp);

		this.updateOrbitRad();
		this.updateCartesianPos();
		this.drawOrbitalEllipse(ctx);
		this.drawBody(ctx);
	}
}

testBodies = [
	// new GeometricOrbitalBody(5, 0, 0.8, 24, 10, Math.PI),
	// new GeometricOrbitalBody(5, 0, 0.5, 12, 1, Math.PI),
	new GeometricOrbitalBody(5, 0, 0.8, 10, 2, 3 * Math.PI / 2)
];

function drawFrame(timestamp) {
	let step = timestamp - prevTime;

	ctx.clearRect(-width / 2, -height / 2, width, height);
	drawDot(ctx, 0, 0, 20);

	// for (let i = 0; i < testBodies.length; i++) {
	// 	testBodies[i].updateApproxFrame(ctx, step);
	// }
	for (let i = 0; i < testBodies.length; i++) {
		testBodies[i].updateExactFrame(ctx, timestamp);
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
