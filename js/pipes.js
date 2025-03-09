import * as THREE from 'three';

const renderer = new THREE.WebGLRenderer();
const viewport = document.querySelector("#mainCanvas");
renderer.setSize( viewport.clientWidth, viewport.clientHeight );
viewport.appendChild( renderer.domElement );

const camera = new THREE.PerspectiveCamera( 45, viewport.clientWidth / viewport.clientHeight, 1, 500 );
camera.lookAt(0,0,0);
camera.position.set(0,0,50);

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

const mycurvepath = new THREE.CurvePath();
for (let i = 0; i < testpipes.length; i++) {
	mycurvepath.curves.push(testpipes[i])
}

const materialargs = {
	color: 0xffffff,
	specular: 0x050505,
	shininess: 500,
	emissive: 0x000000
};

const material = new THREE.MeshPhongMaterial( materialargs );
const geometry = new THREE.TubeGeometry(mycurvepath, 256, 1, 8, false);
const mesh = new THREE.Mesh( geometry, material );
scene.add(mesh);

let renderedIndices = 0;
const totalIndices = geometry.index.count; // ~ tubeSegments * radial segments * 6
const speed = 48; // 48 is the number of indices that makes up a single tube segment with radialsegments = 8

function animate() {
	
	renderedIndices += speed;

	if (renderedIndices > totalIndices) {
		renderedIndices = totalIndices;
	}

	geometry.setDrawRange(0, Math.floor(renderedIndices));

	renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate );