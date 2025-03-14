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
	constructor(materialargs, maxlength, startpos) {
		this.materialargs = materialargs;
		this.maxlength = maxlength;
		this.startpos = startpos;

		this.generatePath();
		this.generateCurve();
		this.generateMesh();
	}

	generatePath() {
		this.visited = new Set();
		this.path = [];
		this.elbows = [];
		this.curvePath = new THREE.CurvePath();
		let curpos = this.startpos;
		let step = 0;
		let nextdir;
		let nextpos;
		let lastdir;
		const l = 5;
		while (step <= this.maxlength) {
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
			if (this.maxlength != 0) {
				for (let j = 1; j < l; j++) {
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
		let j = 1
		let lineStart = this.path[0]
		for (let i = 0; i < this.path.length; i++) {
			if (i == this.elbows[j]) {
				this.curvePath.curves.push(
					new THREE.LineCurve3(
						new THREE.Vector3(lineStart.x, lineStart.y, lineStart.z),
						new THREE.Vector3(this.path[i - 1].x, this.path[i - 1].y, this.path[i - 1].z)
					)
				)
				if (j < this.elbows.length - 1) {
					this.curvePath.curves.push(
						new THREE.QuadraticBezierCurve3(
							new THREE.Vector3(this.path[i - 1].x, this.path[i - 1].y, this.path[i - 1].z),
							new THREE.Vector3(this.path[i].x, this.path[i].y, this.path[i].z),
							new THREE.Vector3(this.path[i + 1].x, this.path[i + 1].y, this.path[i + 1].z)
						)
					)
				}
				lineStart = this.path[i + 1];
				j += 1;
			}
		}
	}

	generateMesh() {
		this.material = new THREE.MeshPhongMaterial(this.materialargs);
		this.geometry = new THREE.TubeGeometry(this.curvePath, 16 * this.maxlength, 0.5, 8, false);
		this.mesh = new THREE.Mesh( this.geometry, this.material );
	}
}

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

const materialargs1 = {
	color: 0xff0000,
	specular: 0x050505,
	shininess: 500,
	emissive: 0x000000
};

const materialargs2 = {
	color: 0x0000ff,
	specular: 0x050505,
	shininess: 500,
	emissive: 0x000000
};

const materialargs3 = {
	color: 0x00ff00,
	specular: 0x050505,
	shininess: 500,
	emissive: 0x000000
};

const materialargs4 = {
	color: 0xffff00,
	specular: 0x050505,
	shininess: 500,
	emissive: 0x000000
};

const materialargs5 = {
	color: 0x00ffff,
	specular: 0x050505,
	shininess: 500,
	emissive: 0x000000
};

const materialargs6 = {
	color: 0xff00ff,
	specular: 0x050505,
	shininess: 500,
	emissive: 0x000000
};

const myPipeRun1 = new PipeRun(materialargs1, 100, {x: -5, y: -5, z: -5});
const myPipeRun2 = new PipeRun(materialargs2, 100, {x: 5, y: 5, z: 5});
const myPipeRun3 = new PipeRun(materialargs3, 100, {x: -5, y: 5, z: -5});
const myPipeRun4 = new PipeRun(materialargs4, 100, {x: 5, y: -5, z: 5});
const myPipeRun5 = new PipeRun(materialargs5, 100, {x: 5, y: 5, z: -5});
const myPipeRun6 = new PipeRun(materialargs6, 100, {x: -5, y: 5, z: 5});

scene.add(myPipeRun1.mesh);
scene.add(myPipeRun2.mesh);
scene.add(myPipeRun3.mesh);
scene.add(myPipeRun4.mesh);
scene.add(myPipeRun5.mesh);
scene.add(myPipeRun6.mesh);

let renderedIndices = 0;
const totalIndices = myPipeRun1.geometry.index.count; // ~ tubeSegments * radial segments * 6
const speed = 48; // 48 is the number of indices that makes up a single tube segment with radialsegments = 8

function animate() {

	if (renderedIndices < totalIndices) {
		renderedIndices += speed;
	}

	myPipeRun1.geometry.setDrawRange(0, Math.floor(renderedIndices));
	myPipeRun2.geometry.setDrawRange(0, Math.floor(renderedIndices));
	myPipeRun3.geometry.setDrawRange(0, Math.floor(renderedIndices));
	myPipeRun4.geometry.setDrawRange(0, Math.floor(renderedIndices));
	myPipeRun5.geometry.setDrawRange(0, Math.floor(renderedIndices));
	myPipeRun6.geometry.setDrawRange(0, Math.floor(renderedIndices));

	renderer.render( scene, camera );
}

window.onload = function() {
  renderer.setAnimationLoop( animate );
};