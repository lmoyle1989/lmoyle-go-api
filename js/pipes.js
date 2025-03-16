//	TODOs:
//	1. Make the pipe runs animate in sequence, potentially, instead of all at the same time
//	2. Hide the unrendered pipe ends with another sphere
//	3. camera controls?

import * as THREE from 'three';

const directions = [
	{x: 1, y: 0, z: 0},
	{x: -1, y: 0, z: 0},
	{x: 0, y: 1, z: 0},
	{x: 0, y: -1, z: 0},
	{x: 0, y: 0, z: 1},
	{x: 0, y: 0, z: -1}
]

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
		let curpos = this.startPos;
		let step = 0;
		let nextdir;
		let nextpos;
		let lastdir;
		let finished = false;
		const l = this.gridSize;
		const straightness = 2;
		while ( step <= this.maxLength ) {
			let dirs = directions.slice();
			if (lastdir) {
				for ( let i = 0; i < straightness; i++ ) {
					dirs.push(lastdir);
				}
			}
			shuffleArray(dirs)
			do {
				if (dirs.length) {
					nextdir = dirs.pop();
				}
				else {
					finished = true;
					break;
				}
				nextpos = {
					x: curpos.x + (nextdir.x * l),
					y: curpos.y + (nextdir.y * l),
					z: curpos.z + (nextdir.z * l)
				};
			} while (this.visited.has(JSON.stringify(nextpos)));
			this.visited.add(JSON.stringify(curpos));
			this.path.push(curpos);
			if (finished) {
				break;
			}
			if (!(lastdir === nextdir)) {
				this.elbows.push(step * l)
			}
			if ( this.step != this.maxLength ) {
				for ( let j = 1; j < l; j++ ) {
					this.path.push({
						x: curpos.x + (nextdir.x * j),
						y: curpos.y + (nextdir.y * j),
						z: curpos.z + (nextdir.z * j)
					});
				}
			}
			lastdir = nextdir;
			curpos = nextpos;
			step += 1;
		}
	}

	generateCurve() {
		this.curvePath = new THREE.CurvePath();
		let j = 1
		let lineStart = this.path[0]
		for ( let i = 0; i < this.path.length; i++ ) {
			if ( i == this.elbows[j] ) {
				this.curvePath.curves.push(
					new THREE.LineCurve3(
						new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z),
						new THREE.Vector3(this.path[i - 1].x, this.path[i - 1].y, this.path[i - 1].z)
					)
				);
				if ( j < this.elbows.length - 1 ) {
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
			this.totalIndices = this.pipeGeometry.index.count; // = tubeSegments * radial segments * 6
			this.group.add(this.pipeMesh);
		}
	}

	cleanup() {
		this.material.dispose();
		this.startSphereGeometry.dispose();
		if (this.pipeGeometry) {
			this.pipeGeometry.dispose();
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
				x: getRandomIntInclusive(-5, 5) * this.gridSize,
				y: getRandomIntInclusive(-5, 5) * this.gridSize,
				z: getRandomIntInclusive(-5, 5) * this.gridSize
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

const camera = new THREE.PerspectiveCamera(45, viewport.clientWidth / viewport.clientHeight, 1, 500);
camera.position.set(10,5,100);
camera.lookAt(0,0,0);

const scene = new THREE.Scene();

const light = new THREE.DirectionalLight(0xffffff, 3);
light.position.set(100, 100, 100);
scene.add(light);
scene.add(new THREE.AmbientLight(0x777777));

let renderedPipeGroup;
const speed = 48; // 48 is the number of indices that makes up a single tube segment with radialsegments = 8

function animate() {
	for ( let i = 0; i < renderedPipeGroup.pipes.length; i++) {
		if (renderedPipeGroup.pipes[i].renderedIndices < renderedPipeGroup.pipes[i].totalIndices) {
			renderedPipeGroup.pipes[i].renderedIndices += speed;
			renderedPipeGroup.pipes[i].pipeGeometry.setDrawRange(0, Math.floor(renderedPipeGroup.pipes[i].renderedIndices));
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
	renderedPipeGroup = new PipeGroup(6);
	scene.add(renderedPipeGroup.group);
}

function pipesInit() {
  startButton.addEventListener("click", startAnimation);
  pauseButton.addEventListener("click", pauseAnimation);
  resetButton.addEventListener("click", resetAnimation);
	resetAnimation();
}
