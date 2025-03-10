import * as THREE from 'three';





// const xmax = 100;
// const xmin = -100;
// const ymax = 100;
// const ymin = -100;
// const zmax = 100;
// const zmin = -100;

// function validCoords(coords) {
// 	return coords.x <= xmax && coords.x >= xmin && coords.y <= ymax && coords.y >= ymin && coords.z <= zmax && coords.z >= zmin
// }

const dirs = [
	{x: 1, y: 0, z: 0},
	{x: -1, y: 0, z: 0},
	{x: 0, y: 1, z: 0},
	{x: 0, y: -1, z: 0},
	{x: 0, y: 0, z: 1},
	{x: 0, y: 0, z: -1}
]

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomNonZeroInt(max) {
  return Math.floor(Math.random() * max) + 1;
}

class PipeRun {
	constructor() {
		// this.materialargs = materialargs;
		this.maxlength = 100;
		this.startpos = {x: 0, y: 0, z: 0};
		this.visited = new Set();
		this.path = [];
	}

	generatePath() {
		let cur = this.startpos;
		while (this.maxlength > 0) {
			this.visited.add(JSON.stringify(cur));
			this.path.push(cur);
			shuffleArray(dirs);
			let l = 3; // getRandomNonZeroInt(4); We can do this... but we need to ensure that a pipe cant go back on itself
			let i = 0;
			let nextdir = dirs[i];
			let nextpos = {x: cur.x + (nextdir.x * l), y: cur.y + (nextdir.y * l), z: cur.z + (nextdir.z * l)};
			// while ( !validCoords(nextpos) || this.visited.has(JSON.stringify(nextpos)) ) {
			while ( this.visited.has(JSON.stringify(nextpos)) ) {
				i += 1;
				nextdir = dirs[i];
				nextpos = {x: cur.x + (nextdir.x * l), y: cur.y + (nextdir.y * l), z: cur.z + (nextdir.z * l)}; // dont repeat this
			}
			cur = nextpos;
			this.maxlength -= 1;
		}
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

const testpipes = [
	new THREE.LineCurve3(
		new THREE.Vector3( 10, 7.5, 0 ),
		new THREE.Vector3( -7.5, 7.5, 0 )
	),
	new THREE.QuadraticBezierCurve3(
		new THREE.Vector3( -7.5, 7.5, 0 ),
		new THREE.Vector3( -10, 7.5, 0 ),
		new THREE.Vector3( -10, 5, 0 ),
	),
	new THREE.LineCurve3(
		new THREE.Vector3( -10, 5, 0 ),
		new THREE.Vector3( -10, -5, 0 )
	),
	new THREE.QuadraticBezierCurve3(
		new THREE.Vector3( -10, -5, 0 ),
		new THREE.Vector3( -10, -7.5, 0 ),
		new THREE.Vector3( -7.5, -7.5, 0 )
	),
	new THREE.LineCurve3(
		new THREE.Vector3( -7.5, -7.5, 0 ),
		new THREE.Vector3( 0, -7.5, 0 )
	),
	new THREE.QuadraticBezierCurve3(
		new THREE.Vector3( 0, -7.5, 0 ),
		new THREE.Vector3( 2.5, -7.5, 0 ),
		new THREE.Vector3( 2.5, -7.5, -2.5 )
	),
	new THREE.LineCurve3(
		new THREE.Vector3( 2.5, -7.5, -2.5 ),
		new THREE.Vector3( 2.5, -7.5, -12.5 )
	),
	new THREE.QuadraticBezierCurve3(
		new THREE.Vector3( 2.5, -7.5, -12.5 ),
		new THREE.Vector3( 2.5, -7.5, -15 ),
		new THREE.Vector3( 0, -7.5, -15 )
	),
	new THREE.LineCurve3(
		new THREE.Vector3( 0, -7.5, -15 ),
		new THREE.Vector3( -20, -7.5, -15 )
	),
];

function pointPathToStraightSegmentCurvePath(arr) {
	let curvePath = new THREE.CurvePath();
	for (let i = 0; i < (arr.length - 1); i++) {
		curvePath.curves.push(
			new THREE.LineCurve3(
				new THREE.Vector3(arr[i].x, arr[i].y, arr[i].z),
				new THREE.Vector3(arr[i + 1].x, arr[i + 1].y, arr[i + 1].z)
			)
		)
	}
	console.log(curvePath);
	return curvePath
}

const myPipeRun = new PipeRun()
myPipeRun.generatePath()
const mycurvepath = pointPathToStraightSegmentCurvePath(myPipeRun.path);

// const mycurvepath = new THREE.CurvePath();
// for (let i = 0; i < testpipes.length; i++) {
// 	mycurvepath.curves.push(testpipes[i])
// }

const materialargs = {
	color: 0xffffff,
	specular: 0x050505,
	shininess: 500,
	emissive: 0x000000
};

const material = new THREE.MeshPhongMaterial( materialargs );
const geometry = new THREE.TubeGeometry(mycurvepath, 512, 0.5, 8, false);
const mesh = new THREE.Mesh( geometry, material );
scene.add(mesh);

let renderedIndices = 0;
const totalIndices = geometry.index.count; // ~ tubeSegments * radial segments * 6
const speed = 48; // 48 is the number of indices that makes up a single tube segment with radialsegments = 8

function animate() {

	if (renderedIndices < totalIndices) {
		renderedIndices += speed;
	}

	geometry.setDrawRange(0, Math.floor(renderedIndices));

	renderer.render( scene, camera );
}

window.onload = function() {
  renderer.setAnimationLoop( animate );
};