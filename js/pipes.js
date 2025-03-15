//	TODOs:
//	1. Make the animation less janky insofar as getting the renderedVertices inside the PipeGroup class
//	2. Make the pipe runs animate in sequence, potentially, instead of all at the same time
//	3. Variable pipe run length
//	4. Hide the unrendered pipe ends somehow
//	5. Make the animation start and pause buttons work
//	6. Number of pipes in pipegroup should be dynamic and randomize start positions
//	7. straightness controls
//	8. Fix bug when a pipe run gets stuck in a infinite loop

import * as THREE from 'three';

const dirs = [
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

class PipeRun {
	constructor(maxLength, startPos, parentPipeGroup) {
		this.visited = parentPipeGroup.visited
		this.maxLength = maxLength;
		this.startPos = startPos; // there is an edge case where a pipe can go though another's startPos because its hardcoded rn and not checked in the visted mapx
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
		const l = 5;
		while ( step <= this.maxLength ) {
			lastdir = nextdir;
			do {
				nextdir = dirs[getRandomInt(dirs.length)];
				nextpos = {
					x: curpos.x + (nextdir.x * l),
					y: curpos.y + (nextdir.y * l),
					z: curpos.z + (nextdir.z * l)
				};
			} while ( this.visited.has(JSON.stringify(nextpos)) );
			if (!(lastdir === nextdir)) {
				this.elbows.push(step * l)
			}
			this.visited.add(JSON.stringify(curpos));
			this.path.push(curpos);
			if ( this.maxLength != 0 ) {
				for ( let j = 1; j < l; j++ ) {
					this.path.push({
						x: curpos.x + (nextdir.x * j),
						y: curpos.y + (nextdir.y * j),
						z: curpos.z + (nextdir.z * j)
					});
				}
			}
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
		this.material = new THREE.MeshPhongMaterial(this.materialargs);
		
		this.startSphereGeometry = new THREE.SphereGeometry(0.75, 32, 16);
		this.startSphereMesh = new THREE.Mesh(this.startSphereGeometry, this.material);
		this.startSphereMesh.position.set(this.startPos.x, this.startPos.y, this.startPos.z);
		
		this.pipeGeometry = new THREE.TubeGeometry(this.curvePath, 16 * this.maxLength, 0.5, 8, false);
		this.pipeMesh = new THREE.Mesh(this.pipeGeometry, this.material);

		this.group = new THREE.Group();
		this.group.add(this.pipeMesh);
		this.group.add(this.startSphereMesh);
	}
}

class PipeGroup {
	constructor() {
		this.visited = new Set();
		this.pipes = [
			new PipeRun(100, {x: -5, y: -5, z: -5}, this),
			new PipeRun(100, {x: 5, y: 5, z: 5}, this),
			new PipeRun(100, {x: -5, y: 5, z: -5}, this),
			new PipeRun(100, {x: 5, y: -5, z: 5}, this)
		];
		this.group = new THREE.Group();
		for ( let i = 0; i < this.pipes.length; i++ ) {
			this.group.add(this.pipes[i].group);
		}
	}
}

const myPipeGroup = new PipeGroup();

const renderer = new THREE.WebGLRenderer();
const viewport = document.querySelector("#mainCanvas");
renderer.setSize( viewport.clientWidth, viewport.clientHeight );
viewport.appendChild( renderer.domElement );

const camera = new THREE.PerspectiveCamera( 45, viewport.clientWidth / viewport.clientHeight, 1, 500 );
camera.position.set(10,5,50);
camera.lookAt(0,0,0);

const scene = new THREE.Scene();

const light = new THREE.DirectionalLight( 0xffffff, 3 );
light.position.set( 100, 100, 100 );
scene.add( light );
scene.add( new THREE.AmbientLight( 0x777777 ) );

scene.add(myPipeGroup.group);

// This should be moved inside the PipeRun class
let renderedIndices = 0;
const totalIndices = myPipeGroup.pipes[0].pipeGeometry.index.count; // ~ tubeSegments * radial segments * 6
const speed = 48; // 48 is the number of indices that makes up a single tube segment with radialsegments = 8

function animate() {
	if (renderedIndices < totalIndices) {
		renderedIndices += speed;
	}

	for ( let i = 0; i < myPipeGroup.pipes.length; i++) {
		myPipeGroup.pipes[i].pipeGeometry.setDrawRange(0, Math.floor(renderedIndices));
	}

	myPipeGroup.group.rotation.y += 0.005;

	renderer.render( scene, camera );
}

window.onload = function() {
  renderer.setAnimationLoop( animate );
};