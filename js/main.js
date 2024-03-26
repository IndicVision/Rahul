import * as THREE from 'three'
import {OrbitControls} from 'https://unpkg.com/three@0.119.1/examples/jsm/controls/OrbitControls.js';
import {TrackballControls} from 'https://unpkg.com/three@0.119.1/examples/jsm/controls/TrackballControls.js';
import {GLTFLoader} from "https://unpkg.com/three@0.119.1/examples/jsm/loaders/GLTFLoader.js"
import {View3D} from "./3DView/3DView.Measurements.js";
// import {MeasurementInfo} from "3DView/measurements/Measurement.Info.js";
import {MeasurementDistance} from "./3DView/measurements/Measurement.Distance.js";
import { apiURL, authToken } from './config.js';

let container, stats, camera, scene, renderer, controls;
container = document.createElement('div');
document.body.appendChild(container);

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 10000);
camera.position.set(5, 5, 5);

// renderer
renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

//you can use the type of controls you want TrackballControls,OrbitControls...
const control = new OrbitControls(camera, renderer.domElement);
control.enableDamping = true;
control.dampingFactor = 0.25;
control.enableZoom = true;
control.minPolarAngle = 0; // radians
control.maxPolarAngle = Math.PI; 
control.minAzimuthAngle = -Infinity; // radians
control.maxAzimuthAngle = Infinity;

var view = new View3D(document.getElementById( 'container' ), renderer, control,camera);


const loader = new GLTFLoader();

const loaderElement = document.getElementById('loader');
const loadingManager = new THREE.LoadingManager(
// onLoad callback
() => {
    loaderElement.style.display = 'none'; // Hide the loader
},
// onProgress callback
(url, itemsLoaded, itemsTotal) => {
    loaderElement.textContent = `Loading ${itemsLoaded} of ${itemsTotal} files...`;
}
);
const gltfLoader = new GLTFLoader(loadingManager);

loader.load(
// resource URL
'./models/mesh.gltf',
// called when the resource is loaded
function ( gltf ) {
    
    view.scene.add( gltf.scene );
    gltf.scene.rotation.z = Math.PI;
    gltf.scene.rotation.y = -10;
    gltf.scene.rotation.x = 2;
    gltf.scene.scale.set(.01*gltf.scene.scale.x, .01*gltf.scene.scale.y, .01 * gltf.scene.scale.z)
        // Calculate the bounding box of the model
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = box.getSize(new THREE.Vector3()).length();
    const center = box.getCenter(new THREE.Vector3());

    // Adjust camera
    camera.lookAt(center);
    camera.position.copy(center);
    camera.position.x += size / 2.0; // Adjust as needed
    camera.position.y += size / 2.0; // Adjust as needed
    camera.position.z += size / 2.0; // Adjust as needed
    camera.updateProjectionMatrix();

    // Ensure model faces front
    gltf.scene.rotation.y = Math.PI;
    gltf.scene.rotation.x = Math.PI;

    const boundingBox2 = new THREE.Box3().setFromObject(gltf.scene);
    const center2 = boundingBox2.getCenter(new THREE.Vector3());
    // Set the target of the OrbitControls to the center of the bounding box
    control.target.copy(center2);

    // Make sure to update the controls after changing the target
    control.update();
    // gltf.scene.rotation.z = Math.PI; // Rotate 180 degrees around Y-axis
    // gltf.scene.scale.set(.01*gltf.scene.scale.x, .01*gltf.scene.scale.y, .01 * gltf.scene.scale.z)
    // gltf.scene.rotation.x = Math.PI * 1.1;
    // gltf.scene.rotation.y = Math.PI * 0.6;
    // // gltf.scene.rotation.z = Math.PI * -0.2;
    // // gltf.scene.position.y = 1.2
    // // gltf.scene.position.z = 1

    // gltf.scene.traverse((node) => {
    //     if (node.isMesh) {
    //         node.geometry.computeVertexNormals();
    //         // node.material = new THREE.MeshPhongMaterial({ color: 0xffffff, map: node.material.map });
    //         if (node.material.map) {
    //             node.material.map.anisotropy = maxAnisotropy;
    //         }
    //     }
    // });
},
// called while loading is progressing
function ( xhr ) {

    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

},
// called when loading has errors
function ( error ) {

    console.log( error );

}
);

// Create an ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0);
view.scene.add(ambientLight);

// Create a directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight.position.set(0, 1, 0);
// view.scene.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.6);
// view.scene.add(hemisphereLight);

var element=document.getElementById("clearbutton");
var listener=element.addEventListener('click',function(event){
    view.clearMeasurements();
});

var element=document.getElementById("distancebutton");
var listener=element.addEventListener('click',function(event){
    view.addMeasurement(new MeasurementDistance());
});

//on measurement added
view.addEventListener( 'measurementAdded', function (event) {
    var measurement = event.object;
    if (measurement) {
        // var infoDiv = document.getElementById( 'info' );
        // var measurementDiv = document.createElement('div');
        // measurementDiv.id = 'measurement_' + measurement.id;
        // measurementDiv.className = 'measurement_info';
        // infoDiv.appendChild(measurementDiv);

        // var descriptionDiv = document.createElement('div');
        // descriptionDiv.id = 'description_' + measurement.id;
        // descriptionDiv.className = 'measurement_description';
        // descriptionDiv.innerHTML = measurement.getType() + " = " + (measurement.getValue() * 100).toFixed(1) + " " + JSON.stringify(measurement.getInfo());
        // measurementDiv.appendChild(descriptionDiv);

        // var removeButton = document.createElement('button');
        // removeButton.className = 'measurement_remove';
        // removeButton.innerHTML = 'Remove';
        // removeButton.onclick = function() {
        //     view.removeMeasurement(measurement);
        // }
        // measurementDiv.appendChild(removeButton);
    }
} );

//on measurement changed
view.addEventListener( 'measurementChanged', function (event) {
    var measurement = event.object;
    if (measurement) {
        var descriptionDiv = document.getElementById('description_' + measurement.id);
        if (descriptionDiv)
            descriptionDiv.innerHTML = measurement.getType() + " = " + (measurement.getValue() * 100).toFixed(1);
    }

} );

//on measurement removed
view.addEventListener( 'measurementRemoved', function (event) {
    var measurement = event.object;
    if (measurement) {
        var measurementDiv = document.getElementById('measurement_' + measurement.id);
        measurementDiv.parentNode.removeChild(measurementDiv);
    }

} );

function addShadowedLight(x, y, z, color, intensity) {
    const directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    view.scene.add(directionalLight);
    directionalLight.castShadow = true;
    const d = 1;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;
    directionalLight.shadow.bias = -0.002;
}

function showVideoPopup() {
    document.getElementById('videoPopup').style.display = 'block';
    }

function closeVideoPopup() {
    document.getElementById('videoPopup').style.display = 'none';
    }

document.addEventListener('DOMContentLoaded', function() {
    var videoPreviewMenuItem = document.getElementById("VideoPreview");
    videoPreviewMenuItem.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default behavior of the link
        showVideoPopup(); // Call the function to show the video popup
    });
    var closeVideoButton = document.querySelector('#videoPopup .close');
    closeVideoButton.addEventListener('click', function() {
        closeVideoPopup(); // Call the function to close the video popup
    });
    });

document.addEventListener('DOMContentLoaded', function() {
    var doctorInputMenuItem = document.getElementById("DoctorInput");
    doctorInputMenuItem.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent the default behavior of the link
        showDoctorInputPopup(); // Call the function to show the doctor input popup
    });

    var closeDoctorInputButton = document.querySelector('.close-button');
    closeDoctorInputButton.addEventListener('click', function() {
        closeDoctorInputPopup(); // Call the function to close the doctor input popup
    });
    });
    document.getElementById('doctorInputPopup').style.display = 'none';

function showDoctorInputPopup() {
document.getElementById('doctorInputPopup').style.display = 'block';
}

function closeDoctorInputPopup() {
document.getElementById('doctorInputPopup').style.display = 'none';
}

// // Get the popup element
// var popup = document.getElementById('doctorInputPopup');

// // Get the popup's title bar (you can replace 'popupTitle' with the actual ID or class of the title bar)
// var popupTitle = document.getElementById('doctorInputPopup');

// // Initialize the position variables
// var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

// // Function to handle mouse drag events
// popupTitle.onmousedown = dragMouseDown;

// // Function to handle mouse drag events
// function dragMouseDown(e) {
// e = e || window.event;
// e.preventDefault();
// // Get the mouse cursor position at startup
// pos3 = e.clientX;
// pos4 = e.clientY;
// document.onmouseup = closeDragElement;
// // Call a function whenever the cursor moves
// document.onmousemove = elementDrag;
// }

// // Function to handle the dragging of the popup
// function elementDrag(e) {
// e = e || window.event;
// e.preventDefault();
// // Calculate the new cursor position
// pos1 = pos3 - e.clientX;
// pos2 = pos4 - e.clientY;
// pos3 = e.clientX;
// pos4 = e.clientY;
// // Set the popup's new position
// popup.style.top = (popup.offsetTop - pos2) + "px";
// popup.style.left = (popup.offsetLeft - pos1) + "px";
// }

// // Function to stop the dragging when the mouse button is released
// function closeDragElement() {
// // Stop moving when mouse button is released
// document.onmouseup = null;
// document.onmousemove = null;
// }

// Function to save user input as a text file
// Function to save user input to GitHub repository
async function saveToGitHub(name_p, name_s, tip, typ, ssu, sf, sdm, sos, plan, comments)  {
    const fileName = `user_input_${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}.txt`;
    const filePath = `comments/${fileName}`; // Specify the path in your repository

    const apiUrl_in = apiURL + filePath;

    const content = btoa(`Patient's Name: ${name_p}\nSurgeon's Name: ${name_s}\nTime at Presentation (TIP): ${tip}\nType at Presentation (TYP): ${typ}\nStatus of the Skin/Ulcer (SSU): ${ssu}\nStatus of the Foot (SF): ${sf}\nStatus of Diabetes Mellitus (SDM): ${sdm}\nStatus of the Organ System (SOS): ${sos}\nPlan: ${plan}\nComments: ${comments}`);

    const requestBody = {
        message: `Add ${fileName}`,
        content: content,
    };

    try {
        const response = await fetch(apiUrl_in, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            console.log(`File ${fileName} saved to GitHub repository.`);
        } else {
            console.error('Error saving file to GitHub repository:', response.status, response.statusText);
        }
    } catch (error) {
        console.error('Error saving file:', error.message);
    }
}

// Event listener for the Save button
document.getElementById('saveButton').addEventListener('click', function () {
    // Get user input
    const nameInput_p = document.getElementById('Patient\'s Name');
    const nameInput_s = document.getElementById('Surgeon\'s Name');
    const tipInput = document.getElementById('Time at Presentation (TIP)');
    const typInput = document.getElementById('Type at Presentation (TYP)');
    const ssuInput = document.getElementById('Status of the Skin/Ulcer (SSU)');
    const sfInput = document.getElementById('Status of the Foot (SF)');
    const sdmInput = document.getElementById('Status of Diabetes Mellitus (SDM)');
    const sosInput = document.getElementById('Status of the Organ System (SOS)');
    const planInput = document.getElementById('plan');
    const commentsInput = document.getElementById('comments');

    const name_p = nameInput_p.value;
    const name_s = nameInput_s.value;
    const tip = tipInput.value;
    const typ = typInput.value;
    const ssu = ssuInput.value;
    const sf = sfInput.value;
    const sdm = sdmInput.value;
    const sos = sosInput.value;
    const plan = planInput.value;
    const comments = commentsInput.value;

    // Check if both plan and comments are provided
    if (plan && comments) {
        // Save user input to GitHub repository
        saveToGitHub(name_p, name_s, tip, typ, ssu, sf, sdm, sos, plan, comments);
        // Optionally, clear the input fields after saving
        nameInput_p.value = '';
        nameInput_s.value = '';
        tipInput.value = '';
        typInput.value = '';
        ssuInput.value = '';
        sfInput.value = '';
        sdmInput.value = '';
        sosInput.value = '';
        planInput.value = '';
        commentsInput.value = '';
        // Close the popup
        closeDoctorInputPopup();
    } else {
        alert('Please enter details for all the fields before saving.');
    }
});
