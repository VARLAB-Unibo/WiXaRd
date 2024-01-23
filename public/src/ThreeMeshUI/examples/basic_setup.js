import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';

import ThreeMeshUI from '../src/three-mesh-ui.js';

import FontJSON from './assets/Roboto-msdf.json';
import FontImage from './assets/Roboto-msdf.png';

import { Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';

const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

let scene, camera, renderer, controls;

window.addEventListener( 'load', init );
window.addEventListener( 'resize', onWindowResize );

//

function init() {

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x505050 );

	camera = new THREE.PerspectiveCamera( 60, WIDTH / HEIGHT, 0.1, 100 );

	renderer = new THREE.WebGLRenderer( {
		antialias: true
	} );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( WIDTH, HEIGHT );
	renderer.xr.enabled = true;
	document.body.appendChild( VRButton.createButton( renderer ) );
	document.body.appendChild( renderer.domElement );

	controls = new OrbitControls( camera, renderer.domElement );
	camera.position.set( 0, 1.6, 0 );
	controls.target = new THREE.Vector3( 0, 1, -1.8 );
	controls.update();

	// ROOM

	const room = new THREE.LineSegments(
		new BoxLineGeometry( 6, 6, 6, 10, 10, 10 ).translate( 0, 3, 0 ),
		new THREE.LineBasicMaterial( { color: 0x808080 } )
	);

	scene.add( room );

	// TEXT PANEL

	makeTextPanel();

	//

	renderer.setAnimationLoop( loop );

}

//

function makeTextPanel() {

	const container = new ThreeMeshUI.Block( {
		width: 1.3,
		height: 0.5,
		padding: 0.05,
		justifyContent: 'center',
		textAlign: 'left',
		fontFamily: FontJSON,
		fontTexture: FontImage,
		// interLine: 0,
	} );

	container.position.set( 0, 1, -1.8 );
	container.rotation.x = -0.55;
	scene.add( container );

	//

	container.add(
		new ThreeMeshUI.Text( {
			// content: 'This library supports line-break-friendly-characters,',
			content: 'This library supports line break friendly characters',
			fontSize: 0.055
		} ),

		new ThreeMeshUI.Text( {
			content: ' As well as multi font size lines with consistent vertical spacing',
			fontSize: 0.08
		} )
	);


	return
	container.onAfterUpdate = function (  ){


		console.log( container.lines );

		if( !container.lines ) return;


		console.log("lines", container.lines);

		var plane = new Mesh(
			new PlaneGeometry(container.lines.width, container.lines.height ),
			new MeshBasicMaterial({color:0xff9900})
		);

		// plane.position.x = container.lines.x;
		// plane.position.y = container.lines.height/2 - container.getInterLine()/2;

		const INNER_HEIGHT = container.getHeight() - ( container.padding * 2 || 0 );

		if( container.getJustifyContent() === 'start' ){
			plane.position.y = (INNER_HEIGHT/2) - container.lines.height/2;
		}else if( container.getJustifyContent() === 'center'){
			plane.position.y = 0;
		}else{
			plane.position.y = -(INNER_HEIGHT/2) + container.lines.height/2
		}

		container.add( plane );
	}
}

// handles resizing the renderer when the viewport is resized

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function loop() {

	// Don't forget, ThreeMeshUI must be updated manually.
	// This has been introduced in version 3.0.0 in order
	// to improve performance
	ThreeMeshUI.update();

	controls.update();
	renderer.render( scene, camera );

}
