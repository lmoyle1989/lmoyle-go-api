import * as THREE from 'three';

const viewport = document.querySelector("#mainCanvas");

const renderer = new THREE.WebGLRenderer();
renderer.setSize( viewport.clientWidth, viewport.clientHeight );
viewport.appendChild( renderer.domElement );
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 45, viewport.clientWidth / viewport.clientHeight, 1, 500 );
camera.lookAt(0,0,0);
camera.position.set(0,0,50);

scene.add( new THREE.AmbientLight( 0x777777 ) );
const light = new THREE.DirectionalLight( 0xffffff, 3 );
light.position.set( 100, 100, 100 );
scene.add( light );

const curve = new THREE.CatmullRomCurve3( [
	new THREE.Vector3( -10, 0, 0 ),
	new THREE.Vector3( -5, 5, 0 ),
	new THREE.Vector3( 0, 0, 0 ),
	new THREE.Vector3( 5, -5, 0 ),
	new THREE.Vector3( 10, 0, 0 )
] );

const materialargs = {
	color: 0xffffff,
	specular: 0x050505,
	shininess: 500,
	emissive: 0x000000
};
const material = new THREE.MeshPhongMaterial( materialargs );
const geometry = new THREE.TubeGeometry(curve);
const mesh = new THREE.Mesh( geometry, material );
scene.add(mesh);


function animate() {

	renderer.render( scene, camera );

}

renderer.setAnimationLoop( animate );