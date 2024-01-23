import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import SketchfabIntegration from "./SketchfabIntegration.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { text } from 'body-parser';

const urlParams = new URLSearchParams(window.location.search);

let imgBuffer = [];
const IMG_BUFFER_SIZE = urlParams.get('fps');
console.log(IMG_BUFFER_SIZE)
const scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true}); // antialias: true, 
// const controls = new OrbitControls( camera, renderer.domElement );

// Add keyboard controls
const keyboard = {};

const mouseState = {
	x: 0,
	y: 0,
	leftButtonPressed: false,
  };
  
let prevMouseX = 0
let prevMouseY = 0




document.addEventListener('keydown', (event) => {
  keyboard[event.code] = true;
});
document.addEventListener('keyup', (event) => {
  keyboard[event.code] = false;
});

document.addEventListener('mousemove', (event) => {
	mouseState.x = event.clientX;
	mouseState.y = event.clientY;
  });
  
document.addEventListener('mousedown', (event) => {
	if (event.button === 0) { // Left mouse button
		mouseState.leftButtonPressed = true;
	}
});

document.addEventListener('mouseup', (event) => {
	if (event.button === 0) { // Left mouse button
		mouseState.leftButtonPressed = false;
	}
});

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);

composer.addPass(renderPass);

// console.log("innerWidth: " + screen.width);
// console.log("innerHeight: " + screen.height);
const outline = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outline.visibleEdgeColor.set(0xff0000);
outline.edgeThickness = 1.0;
outline.edgeStrength = 3.0;

composer.addPass(outline);

// const textureLoader = new THREE.TextureLoader();
// textureLoader.load("./tri_pattern.jpg", function(texture){
// 	if (texture) {
// 		outline.patternTexture = texture;
// 		texture.wrapS = THREE.RepeatWrapping;
// 		texture.wrapT = THREE.RepeatWrapping;
// 	}
// }
// )

// const fxaaShader = new ShaderPass(FXAAShader);
// fxaaShader.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
// composer.addPass(fxaaShader);

function intersection(){
	raycaster.setFromCamera(mouse, camera);
	// console.log(scene.children);
	const intersects = raycaster.intersectObjects(scene.children, true);
	if (outline.selectedObjects.length > 0) {
		outline.selectedObjects.pop();
	}
	if (intersects.length > 0)
		outline.selectedObjects.push(intersects[0].object);
}

function mouseMove(event) {
	event.preventDefault();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	intersection();
}

window.addEventListener("resize", windowResize);
renderer.domElement.style.touchAction = "none";
renderer.setSize( window.innerWidth, window.innerHeight );
composer.setSize( window.innerWidth, window.innerHeight );
renderer.domElement.addEventListener("mousedown", mouseMove);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.shadowMap.type = THREE.VSMShadowMap;
// renderer.outputEncoding = THREE.sRGBEncoding;
renderer.useLegacyLights = true;
document.body.appendChild( renderer.domElement );
// Instantiate a loader
const loader = new GLTFLoader();

// Optional: Provide a DRACOLoader instance to decode compressed mesh data
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath( './draco/' );
loader.setDRACOLoader( dracoLoader );

//controls.update() must be called after any manual changes to the camera's transform
camera.position.set( 0, 6, 6 );
// controls.update();

const sec = 1000

// const api_token = localStorage.getItem('api_token') ?? null;
const server_uri = 'http://localhost:3000/';

// const download_uri = localStorage.getItem('download_uri');
const download_uri = urlParams.get('path');


console.log(download_uri);

async function getAPIToken() {
	const options = {
	  method: 'GET',
	  headers: {
		"Content-Type": "application/json",
	  },
	  mode: 'cors',
	};

	try {
		const response = await fetch(server_uri + 'get_token', options);
		const responseData = await response.json();
		return responseData;
	} catch (error) {
		console.error('Error:', error);
		throw error;
	}
  }

// async function getToken(){
// 	const modelDataUrl = 'https://sketchfab.com/oauth2/token/';


// 	var details = {
// 		'username': 'varlabunibo@gmail.com',
// 		'password': 'Varlab2022',
// 		'grant_type': 'password'
// 	};
	
// 	var formBody = [];
// 	for (var property in details) {
// 	  var encodedKey = encodeURIComponent(property);
// 	  var encodedValue = encodeURIComponent(details[property]);
// 	  formBody.push(encodedKey + "=" + encodedValue);
// 	}
// 	formBody = formBody.join("&");

// 	const data = {
// 	  "grant-type": "password",
// 	  "username": "varlabunibo@gmail.com",
// 	  "password": "Varlab2022"
// 	}

// 	const options = {
// 		method: 'POST',
// 		headers: {
// 			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
// 			"Authorization": "Basic dmFybGFidW5pYm86VmFybGFiMjAyMg==",
// 			"Accept": 'application/json'
// 		},
// 		mode: 'no-cors',
// 		body: formBody

// 	};
// 	const response = await fetch(modelDataUrl, options);
// 	const metadata = JSON.parse(response)

// 	console.log(response)
// 	console.log(metadata)
// }

// sketchInt.readZip(download_uri);
// SketchfabIntegration.readZip(download_uri, scene);
const sketchfabIntegration = new SketchfabIntegration();
sketchfabIntegration.checkToken();
const canvas = document.querySelector('canvas');
canvas.style.display = 'none';

let uuid ;

getAPIToken().then(res => {
	if(urlParams.get('token') != null) sketchfabIntegration.fetchAndDisplayModel(download_uri.replaceAll('"',''), scene, urlParams.get('token').replaceAll('"',''));
})

// if (getAPIToken() != null) sketchfabIntegration.fetchAndDisplayModel(download_uri, scene, getAPIToken());
// sketchfabIntegration.fetchAndDisplayModel(download_uri, scene, token);

// let flag = true;
// setInterval(() => {flag = false},5000)

function animate() {
	requestAnimationFrame( animate );
	if (canvas.style.display != 'none') {
		// console.log("funziona tutto");
		enqueueFrames()
		// controls.update();

		var cameraDirection = new THREE.Vector3();
		camera.getWorldDirection(cameraDirection);
		cameraDirection.normalize();

		const movementSpeed = 0.1;
		const rotationSpeed = 0.0005; // Adjust this value to control the rotation speed

		if (keyboard['KeyW']) camera.translateZ(-movementSpeed);
		if (keyboard['KeyS']) camera.translateZ(movementSpeed);

		if (keyboard['KeyA']) camera.translateX(-movementSpeed);
		if (keyboard['KeyD']) camera.translateX(movementSpeed);

		if (keyboard['KeyE']){
			const deltaX = mouseState.x - prevMouseX 
			camera.rotation.y -= deltaX * rotationSpeed;
		}
		if (keyboard['KeyQ']){
			const deltaX = mouseState.x - prevMouseX 
			camera.rotation.y += deltaX * rotationSpeed;
		}
		if (keyboard['KeyF']){
			const deltaY = mouseState.y - prevMouseY
			camera.rotation.x -= deltaY * rotationSpeed;
		}
		if (keyboard['KeyR']){
			const deltaY = mouseState.y - prevMouseY
			camera.rotation.x += deltaY * rotationSpeed;
		}
		
		camera.updateMatrixWorld(); // Update camera's world matrix
		// renderer.autoClear = false;
		// renderer.clear();
		// renderer.setPixelRatio(window.devicePixelRatio);
		// renderer.render( scene, camera );
		// composer.setSize( window.offsetWidth, window.offsetHeight );
		composer.render();	
	}
}

// Update camera settings and renderer on screen resize
function windowResize(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);

	// fxaaShader.uniforms["resolution"].value.set(1 / window.innerWidth, 1 / window.innerHeight);

	
}

function generateUUID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		const r = Math.random() * 16 | 0;
		const v = (c === 'x') ? r : (r & 0x3 | 0x8);
		return v.toString(16);
	});
}

function enqueueFrames() {
    var imgData;

    try {
        var strMime = "image/jpeg";

        imgData = canvas.toDataURL(strMime);
		var img_compressed = LZUTF8.compress(imgData, {inputEncoding: "Base64", outputEncoding: "Base64"});
        imgBuffer.push(img_compressed);
		
        if (imgBuffer.length >= IMG_BUFFER_SIZE) {
            // console.log('before send: ' + uuid + ' +++ ' + Date.now()); // Moved before sendBufferToServer()
            sendBufferToServer(imgBuffer, uuid); // Pass uuid as a parameter
            uuid = generateUUID();

            // console.log("send to server called");
            imgBuffer = [];
        }
    } catch (e) {
        console.log(e);
    }
}

async function sendBufferToServer(buffer, uuid) { // Added uuid as a parameter
    const data = {
        'buffer': buffer,
        'uuid': uuid
    };
    const options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        mode: 'cors',
        body: JSON.stringify(data)
    };

    try {
        const response = await fetch(server_uri + 'imgs_manager', options);
        // console.log('after send: ' + uuid + ' +++ ' + Date.now()); // Moved after receiving response

        const responseData = await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

animate() 