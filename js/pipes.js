//	TODOs:
//	1. Make the pipe runs animate in sequence, potentially, instead of all at the same time
//	2. Maybe keep rerendering the pipe end as it grows?
//	3. camera controls?
//	4. Number of tube segments needs to be a function of final length, not intial val - short tubes that deadend go very slow
// 	5. mess around with different material values
//	6. add more comments
//	7. the end conditions and end position are kinda jank and don't lie on the grid, and sometimes just skips the last segment
//	8. cleanup code: add all the scene setup stuff into its own function
//	9. add interface to control number of pipes? or other global params?
//	10. hex 3d dirs


import * as THREE from 'three';

const directions = [
	{x: 1, y: 0, z: 0},
	{x: -1, y: 0, z: 0},
	{x: 0, y: 1, z: 0},
	{x: 0, y: -1, z: 0},
	{x: 0, y: 0, z: 1},
	{x: 0, y: 0, z: -1}
]

// const moreDirections = [
// 	{x: 1, y: 0, z: 0},
// 	{x: 1, y: 0, z: 1},
// 	{x: 1, y: 0, z: -1},
// 	{x: -1, y: 0, z: 0},
// 	{x: -1, y: 0, z: 1},
// 	{x: -1, y: 0, z: -1},
// 	{x: 0, y: 0, z: 1},
// 	{x: 0, y: 0, z: -1},
// 	//
// 	{x: 1, y: 1, z: 0},
// 	{x: 1, y: 1, z: 1},
// 	{x: 1, y: 1, z: -1},
// 	{x: -1, y: 1, z: 0},
// 	{x: -1, y: 1, z: 1},
// 	{x: -1, y: 1, z: -1},
// 	{x: 0, y: 1, z: 1},
// 	{x: 0, y: 1, z: -1},
// 	//
// 	{x: 1, y: -1, z: 0},
// 	{x: 1, y: -1, z: 1},
// 	{x: 1, y: -1, z: -1},
// 	{x: -1, y: -1, z: 0},
// 	{x: -1, y: -1, z: 1},
// 	{x: -1, y: -1, z: -1},
// 	{x: 0, y: -1, z: 1},
// 	{x: 0, y: -1, z: -1},
// 	//
// 	{x: 0, y: 1, z: 0},
// 	{x: 0, y: -1, z: 0}
// ];

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRandomIntInclusive(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

function shuffleArray(array) {
	for (var i = array.length - 1; i >= 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
	}
}

class PipeRun {
	constructor(maxLength, startPos, visited, gridSize) {
		this.visited = visited
		this.maxLength = maxLength;
		this.startPos = startPos;
		this.gridSize = gridSize;
		this.totalIndices = 0;
		this.renderedIndices = 0;
		this.materialargs = {
			color: getRandomInt(256 ** 3),
			specular: 0x050505,
			shininess: 500,
			emissive: 0x000000
		};

		this.generatePath();
		this.generateCurve();
		this.generateMesh();
	}

	generatePath() {
		this.path = [];
		this.elbows = [];
		let curPos = this.startPos;
		let step = 0;
		let nextDir;
		let nextPos;
		let lastDir;
		let deadEnd = false;
		const l = this.gridSize;
		const straightness = 2;
		while (step <= this.maxLength) {
			let dirs = directions.slice();
			if (lastDir) {
				for (let i = 0; i < straightness; i++) {
					dirs.push(lastDir);
				}
			}
			shuffleArray(dirs)
			do {
				if (dirs.length) {
					nextDir = dirs.pop();
				}
				else {
					deadEnd = true;
					break;
				}
				nextPos = {
					x: curPos.x + (nextDir.x * l),
					y: curPos.y + (nextDir.y * l),
					z: curPos.z + (nextDir.z * l)
				};
			} while (this.visited.has(JSON.stringify(nextPos)));
			this.visited.add(JSON.stringify(curPos));
			this.path.push(curPos);
			if (deadEnd) {
				break;
			}
			if (!(lastDir === nextDir)) {
				this.elbows.push(step * l)
			}
			if (this.step != this.maxLength) {
				for (let j = 1; j < l; j++) {
					this.path.push({
						x: curPos.x + (nextDir.x * j),
						y: curPos.y + (nextDir.y * j),
						z: curPos.z + (nextDir.z * j)
					});
				}
			}
			lastDir = nextDir;
			curPos = nextPos;
			step += 1;
		}
	}

	generateCurve() {
		this.curvePath = new THREE.CurvePath();
		let j = 1
		let lineStart = this.path[0]
		for (let i = 0; i < this.path.length; i++) {
			if (i == this.elbows[j]) {
				this.curvePath.curves.push(
					new THREE.LineCurve3(
						new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z),
						new THREE.Vector3(this.path[i - 1].x, this.path[i - 1].y, this.path[i - 1].z)
					)
				);
				if (j < this.elbows.length - 1) {
					this.curvePath.curves.push(
						new THREE.QuadraticBezierCurve3(
							new THREE.Vector3(this.path[i - 1].x, this.path[i - 1].y, this.path[i - 1].z),
							new THREE.Vector3(this.path[i].x, this.path[i].y, this.path[i].z),
							new THREE.Vector3(this.path[i + 1].x, this.path[i + 1].y, this.path[i + 1].z)
						)
					);
				}
				lineStart = this.path[i + 1];
				j += 1;
			}
		}
	}

	generateMesh() {
		this.group = new THREE.Group();
		
		this.material = new THREE.MeshPhongMaterial(this.materialargs);
		
		this.startSphereGeometry = new THREE.SphereGeometry(0.75, 32, 16);
		this.startSphereMesh = new THREE.Mesh(this.startSphereGeometry, this.material);
		this.startSphereMesh.position.set(this.startPos.x, this.startPos.y, this.startPos.z);
		this.group.add(this.startSphereMesh);
		
		if (this.curvePath.curves.length > 1) {
			this.pipeGeometry = new THREE.TubeGeometry(this.curvePath, 16 * this.maxLength, 0.5, 8, false);
			this.pipeMesh = new THREE.Mesh(this.pipeGeometry, this.material);
			this.totalIndices = this.pipeGeometry.index.count;
			this.group.add(this.pipeMesh);

			let endPoint = this.curvePath.curves[this.curvePath.curves.length - 1].v2;
			this.endSphereGeometry = new THREE.SphereGeometry(0.75, 32, 16);
			this.endSphereMesh = new THREE.Mesh(this.endSphereGeometry, this.material);
			this.endSphereMesh.position.set(endPoint.x, endPoint.y, endPoint.z);
			this.endSphereMesh.visible = false;
			this.group.add(this.endSphereMesh);
		}
	}

	cleanup() {
		this.material.dispose();
		this.startSphereGeometry.dispose();
		if (this.pipeGeometry) {
			this.pipeGeometry.dispose();
			this.endSphereGeometry.dispose();
		}
	}
}

class PipeGroup {
	constructor(pipeCount) {
		this.group = new THREE.Group();
		this.visited = new Set();
		this.gridSize = 5;
		this.startPositions = [];
		this.pipes = [];
		for (let i = 0; i < pipeCount; i++) {
			this.startPositions.push(this.generateRandomStartPos());
		}
		for (let i = 0; i < pipeCount; i++) {
			this.pipes.push(new PipeRun(this.generateRandomLength(), this.startPositions[i], this.visited, this.gridSize));
			this.group.add(this.pipes[i].group);
		}
	}

	generateRandomStartPos() {
		let startPos;
		do {
			startPos = {
				x: getRandomIntInclusive(-10, 10) * this.gridSize,
				y: getRandomIntInclusive(-10, 10) * this.gridSize,
				z: getRandomIntInclusive(-10, 10) * this.gridSize
			};
		} while (this.visited.has(JSON.stringify(startPos)))
		this.visited.add(JSON.stringify(startPos));
		
		return startPos
	}

	generateRandomLength() {
		return getRandomIntInclusive(100, 200);
	}

	cleanup() {
		for ( let i = 0; i < this.pipes.length; i++ ) {
			this.pipes[i].cleanup()
		}
	}
}

const renderer = new THREE.WebGLRenderer();
const viewport = document.querySelector("#mainCanvas");
renderer.setSize(viewport.clientWidth, viewport.clientHeight);
viewport.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(45, viewport.clientWidth / viewport.clientHeight, 1, 1000);
camera.position.set(10,5,100);
camera.lookAt(0,0,0);

const scene = new THREE.Scene();

const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(100, 100, 100);
scene.add(light);
scene.add(new THREE.AmbientLight(0x777777));

let renderedPipeGroup;
const speed = 96; // 48 is the number of indices that makes up a single tube segment with radialsegments = 8
									// total = tubeSegments * radial segments * 6

function animate() {
	for ( let i = 0; i < renderedPipeGroup.pipes.length; i++) {
		let pipe = renderedPipeGroup.pipes[i];
		if (pipe.renderedIndices < pipe.totalIndices) {
			pipe.renderedIndices += speed;
			pipe.pipeGeometry.setDrawRange(0, Math.floor(pipe.renderedIndices));
			if (pipe.renderedIndices >= pipe.totalIndices) {
				pipe.endSphereMesh.visible = true;
			}
		}
	}

	renderedPipeGroup.group.rotation.y += 0.005;
	renderedPipeGroup.group.rotation.x += 0.0025;
	renderedPipeGroup.group.rotation.z += 0.001;

	renderer.render(scene, camera);
}

window.onload = function() {
	pipesInit();
};

function pauseAnimation() {
	renderer.setAnimationLoop(null);
}

function startAnimation() {
	renderer.setAnimationLoop(animate);
}

function resetAnimation() {
	if (renderedPipeGroup) {
		scene.remove(renderedPipeGroup.group);
		renderedPipeGroup.cleanup();
	}
	renderedPipeGroup = new PipeGroup(10);
	scene.add(renderedPipeGroup.group);
}

function pipesInit() {
	startButton.addEventListener("click", startAnimation);
	pauseButton.addEventListener("click", pauseAnimation);
	resetButton.addEventListener("click", resetAnimation);
	resetAnimation();
}
