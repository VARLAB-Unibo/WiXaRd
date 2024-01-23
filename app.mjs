import express from 'express';
const app = express();
import sessions from 'express-session';
import bodyParser from 'body-parser';
import { JSDOM } from 'jsdom';
import * as THREE from 'three';
import createGL from 'gl';
import { createCanvas } from 'canvas';
// const { createGL } = require('headless-gl');
import JSZip from 'jszip';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import path from 'path';

const __dirname = path.resolve();

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

let renderer;
let controls;

//session middleware
app.use(sessions({
    secret: generateUUID(),
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

app.use(express.static("dist"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = (c === 'x') ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  

// Home page route.
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.get("/sk", function (req, res) {
    // console.log(req.session)
    res.sendFile(__dirname + "/index_sketchfab.html");
});

// Remote rendering route
app.post("/3d_viewer", function (req, res) {
	console.log(req.body.model_path)
	console.log(req.body.context)
	//Defining dom object and three js render utils
	// const dom = new JSDOM('<!DOCTYPE html><html><body><canvas></canvas></body></html>');
	// global.document = dom.window.document;
	// global.window = dom.window;

	// const canvas = global.document.querySelector('canvas');
	// canvas.width = 800;
	// canvas.height = 600;
	// const scene = new THREE.Scene();
	// const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
	
    // renderer = new THREE.WebGLRenderer({ context: req.body.context, antialias: true });
	// renderer.setSize( window.innerWidth, window.innerHeight );
	// renderer.shadowMap.enabled = true;
	// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	// // renderer.shadowMap.type = THREE.VSMShadowMap;
	// // renderer.outputEncoding = THREE.sRGBEncoding;
	// renderer.useLegacyLights = true;
	// global.document.body.appendChild( renderer.domElement );
	// // Optional: Provide a DRACOLoader instance to decode compressed mesh data
	// const dracoLoader = new DRACOLoader();
	// dracoLoader.setDecoderPath( './draco/' );
	// loader.setDRACOLoader( dracoLoader );

	// controls = new OrbitControls( camera, renderer.domElement );

	// //controls.update() must be called after any manual changes to the camera's transform
	// camera.position.set( 0, 6, 6 );
	// controls.update();
	// const sketchfabIntegration = new SketchfabIntegration();
	// sketchfabIntegration.checkToken();
	// // const canvas = document.querySelector('canvas');
	// // canvas.style.display = 'none';

	// // TODO - retrieve download_uri from index_sketchfab.html 

	// getAPIToken().then(resAPI => {
	// 	if (resAPI.token != null) sketchfabIntegration.fetchAndDisplayModel(req.body.path, scene, resAPI.token);
	// })
	// animate();
});

// Send token route
app.get('/get_token', (req,res) => {
    // console.log(req.session.token)
    res.json(({token:req.session.token}))
})

// Receive and save token route
app.post('/save_token', (req,res) => {
    req.session.token = req.body.token
    res.send(JSON.stringify({"success_message":"Token saved successfully"}))
})

const port = 3000;
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});

const CLIENT_ID = '3e81d3c0d218df0c23d75a7edbb688d2';
const AUTHENTICATION_URL = `https://sketchfab.com/oauth2/authorize/?state=123456789&response_type=token&client_id=${CLIENT_ID}`;

// Animate function
function animate() {
	requestAnimationFrame( animate );
    controls.update();
	renderer.render( scene, camera );
}

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

function checkStatus(response) {
	// From: https://gist.github.com/irbull/42f3bd7a9db767ce72a770ded9a5bdd1
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

function getExtension(filename) {
  return filename.toLowerCase().split('.').pop();
}

async function getFileUrl(file) {
	const blob = await file.async('blob');
	const url = URL.createObjectURL(blob);
	return url;
}

class SketchfabIntegration {
	constructor() {
		this.token = null;
	}

	async readZip(zipUrl, scene) {
		const response = await fetch(zipUrl);
		checkStatus(response);
		const arrayBuffer = await response.arrayBuffer();

		const result = await JSZip.loadAsync(arrayBuffer);

		const files = Object.values(result.files).filter(item => !item.dir);
		const entryFile = files.find(f => getExtension(f.name) === 'gltf');
		console.log(entryFile);
		// Create blobs for every file resource
		const blobUrls = {};
		for (const file of files) {
			// console.log(`Loading ${file.name}...`);
			blobUrls[file.name] = await getFileUrl(file);
		}
		const fileUrl = blobUrls[entryFile.name];

	    scene.clear();
	    // Re-add the light
	    const light = new THREE.DirectionalLight(0xffffff, 5);
	    scene.add(light);
	    light.position.set(15, 15, 5);
		light.castShadow = true;
		light.isLight = true;
		// const light2 = new THREE.DirectionalLight(0xffffff, 5);
		// scene.add(light2);
		// light2.position.set(5, 5, -5);
		// const light3 = new THREE.DirectionalLight(0xffffff, 5);
		// scene.add(light3);
		// light3.position.set(-5, 5, -5);

	    const loadingManager = new THREE.LoadingManager();
	    loadingManager.setURLModifier((url) => {
			const parsedUrl = new URL(url);
			const origin = parsedUrl.origin;
			const path = parsedUrl.pathname;
			const relativeUrl = path.replace(origin + '/', "");

			if (blobUrls[relativeUrl] != undefined) {
				return blobUrls[relativeUrl];
			}

			return url
		});
		// Get the loading progress element
		const loadingProgress = document.getElementById('loading-progress');
		const canvas = document.querySelector('canvas');
		// console.log(canvas);

	    const gltfLoader = new GLTFLoader(loadingManager);
	    gltfLoader.load(fileUrl, (gltf) => {
			// console.log(gltf);
			
			canvas.style.display = 'block';
			loadingProgress.style.display = 'none';

			gltf.scene.traverse(function(node) {
				node.castShadow = true;
				node.receiveShadow = true;
				console.log("is light: " + node.isLight);
				console.log("is camera: " + node.isCamera);
				if (node.isLight){
					console.log("tenimm'a luce!!!");
				}
				if (node.isCamera){
					console.log("tenimm'a camera!!!");
				}
			});

			// // Print the result to the console
			// console.log('Shadows enabled:', shadowsEnabled);

			scene.background = new THREE.Color( 0xe3e1e1 );
	      	scene.add(gltf.scene);

			//Create a plane that receives shadows (but does not cast them)
			const planeGeometry = new THREE.PlaneGeometry( 20, 20);
			const planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } )
			const plane = new THREE.Mesh( planeGeometry, planeMaterial );
			plane.receiveShadow = true;
			scene.add( plane );
			
			// Translate the mesh
			plane.position.set(0, -3, 0); // Translate along the z-axis by -10 units

			// Rotate the mesh
			plane.rotation.set(-Math.PI / 2, 0, 0); // Rotate 90 degrees around the x-axis

			//Create a helper for the shadow camera (optional)
			const helper = new THREE.CameraHelper( light.shadow.camera );
			scene.add( helper );
			
	    },
		(xhr) => {
			// Called while loading is in progress
			const progress = (xhr.loaded / xhr.total) * 100;
    		loadingProgress.textContent = 'Loading: ' + Math.round(progress) + '%';
			// canvas.style.display = 'none';
		},
		(error) => {
			// Called if an error occurred while loading
			console.error('An error happened:', error);
			loadingProgress.textContent = 'Error loading the model.';
		});
	}


	authenticate() {
		window.open(AUTHENTICATION_URL, '_blank');
	}

	checkToken() {
		// Check if there's a new token from the URL
		const url = new URL(window.location)
		// Extract the token and save it
		const hashParams = url.hash.split('&');
		for (let param of hashParams) {
			if (param.indexOf("access_token") !== -1) {
				const token = param.replace('#access_token=', '');
				// console.log("Detected Sketchfab token: ", token);
				localStorage.setItem("sb_token", token);
			}
		}

		// Load token from local storage
		this.token = localStorage.getItem("sb_token");
	}


	async getModelDownloadUrl(inputUrl, authString) {
		// Extract the model ID from the URL
		const input = new URL(inputUrl);

		// console.log(inputUrl)
		

		// The ID is always the last string when seperating by '-'
		const pieces = input.pathname.split('-');
		const piecesNoName = pieces[pieces.length - 1].split('/');

		const modelID = piecesNoName[piecesNoName.length - 1]
		// console.log('modelID: ' + modelID)
		
		const metadataUrl = `https://api.sketchfab.com/v3/models/${modelID}/download`;
	
		const options = {
		    method: 'GET',
		    headers: {
		        Authorization: authString,
		        // Authorization: `Token 3e81d3c0d218df0c23d75a7edbb688d2`,
		    },
		    mode: 'cors'
		};

		// This call will fail if model can't be downloaded
		const response = await fetch(metadataUrl, options);
		const metadata = await response.json();


		// Get license information to display attribution 
		const attribution = await this.getAttributionText(modelID, authString);

		return { url: metadata.gltf.url, attribution: attribution };
	}

	async getAttributionText(modelID, authString) {
		const modelDataUrl = `https://api.sketchfab.com/v3/models/${modelID}`;
		const options = {
		    method: 'GET',
		    headers: {
				Authorization: authString,
		        // Authorization: `Token 3e81d3c0d218df0c23d75a7edbb688d2`,
		    },
		    mode: 'cors'
		};
		const response = await fetch(modelDataUrl, options);
		const metadata = await response.json();

		const license = { name: metadata.license.label, url: metadata.license.url };
		const user = { name: metadata.user.displayName , url: metadata.user.profileUrl };
		const model = { name: metadata.name, url: metadata.viewerUrl };
		const attributionText = 
		`This work is based on <a href="${model.url}" target=_blank>${model.name}</a>
		by <a href="${user.url}" target=_blank>${user.name}</a> 
		licensed under <a href="${license.url}" target=_blank>${license.name}</a>.`;

		return attributionText;
	}

	// This assumes there is an HTML element with the id "overlay"
	// containing a few elements/error messages
	async fetchAndDisplayModel(url, scene, token) {
		// Bring up modal with "Loading" text
		// document.querySelector('#overlay').style.display = 'block';
		// document.querySelector('#dimiss-btn').onclick = () => {
		// 	this._resetSketchfabUI();
		// }

		let modelZipUrl;
		let attributionText;
		const authString = 'Token ' + token

		// console.log(token)
		
		try {
			const result = await this.getModelDownloadUrl(url, authString);
			modelZipUrl = result.url;
			attributionText = result.attribution;
		} catch (e) {
			// Update modal with error
			console.log("Failed to download model from Sketchfab", e);
			// document.querySelector('#download-error').style.display = 'block';
			// document.querySelector('#dimiss-btn').style.display = 'block';
		}

		if (modelZipUrl == undefined) return; 

		// Update modal with "Loading model"
		// document.querySelector('#fetch-success').style.display = 'block';

		try {
			await this.readZip(modelZipUrl, scene);
		} catch (e) {
			// Update modal with error 
			console.error("Failed to read model from Sketchfab", e);
			// document.querySelector('#unknown-error').style.display = 'block';
			// document.querySelector('#dimiss-btn').style.display = 'block';
		}

		// Dismiss modal 
		// this._resetSketchfabUI();
		// Display attribution
		// console.log(attributionText);
		// console.log(document.querySelector("#attribution-container"));
		// document.querySelector("#attribution-container").innerHTML = attributionText;
	}

	_resetSketchfabUI() {
		// Hide the overlay and any error messages
		document.querySelector('#overlay').style.display = 'none';
		document.querySelector('#download-error').style.display = 'none';
		document.querySelector('#dimiss-btn').style.display = 'none';
		document.querySelector('#unknown-error').style.display = 'none';
		document.querySelector('#fetch-success').style.display = 'none';
		document.querySelector("#attribution-container").innerHTML = "";
	}
}