import * as THREE from 'three'
import {MeasurementControls} from './measurements/MeasurementControls.js';
import {Measurement} from './measurements/Measurement.js';

class View3D extends THREE.EventDispatcher {
	constructor(dom, renderer, control, camera) {
		super();
		var scene = new THREE.Scene();
		scene.background = new THREE.Color('#ffffff');
		scene.fog = new THREE.Fog(0x72645b, 2, 15);
		this.scene = scene;
		const scope = this;
		const container = new UI.Panel().setPosition('absolute');
		var measurementControls, light;

		this.addMeasurement = function (measurement) {
			measurementControls.add(measurement);
			measurementControls.enabled = true;
		}

		this.removeMeasurement = function (measurement) {
			measurementControls.remove(measurement);
			if (measurement.parent)
				measurement.parent.remove(measurement);
		}

		this.addObject = function (mesh) {
			if (!(mesh instanceof THREE.Mesh))
				return null;
			var geometry = mesh.geometry;
			var boundingSphere = geometry.boundingSphere.clone();
			mesh.rotateX(-Math.PI / 2);
			mesh.updateMatrixWorld();
			scene.add(mesh);
			var center = mesh.localToWorld(boundingSphere.center);
			scope.controls.target.copy(center);
			scope.controls.minDistance = boundingSphere.radius * 0.5;
			scope.controls.maxDistance = boundingSphere.radius * 3;
			camera.position.set(0, 0, boundingSphere.radius * 0.5).add(center);
			camera.lookAt(center);
		}

		this.addGeometry = function (geometry) {
			var material = (geometry.hasColors)
				?
				new THREE.MeshPhongMaterial({
					specular: 0x111111,
					emissive: 0X151515,
					color: 0xff5533,
					shininess: 20,
					side: THREE.DoubleSide,
					opacity: geometry.alpha,
					vertexColors: true,
					FlatShading: THREE.FlatShading
				})
				:
				new THREE.MeshPhongMaterial({
					specular: 0x111111,
					emissive: 0X050505,
					color: 0xff5533,
					shininess: 20,
					side: THREE.DoubleSide,
					FlatShading: THREE.FlatShading
				});

			const mesh = new THREE.Mesh(geometry, material);
			mesh.position.set(-0.7, -0.7, -0.7);
			mesh.scale.set(0.15, 0.15, 0.15);
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			mesh.normalsNeedUpdate = true;
			mesh.center = true;
			geometry.computeBoundingSphere();
			return this.addObject(mesh);
		}


		this.clear = function () {
			while (scene.children.length)
				scene.remove(scene.children[0]);
		}

		this.clearMeasurements = function () {
			for (var key in scene.children) {
				var measurements = [];
				scene.children[key].traverse(function (child) {
					if (child instanceof Measurement)
						measurements.push(child);
				});
			}

			for (var key in measurements) {
				this.removeMeasurement(measurements[key]);
			}

		}


		function init() {
			dom = dom ? dom : window;
			dom.appendChild(container.dom);
			container.dom.appendChild(renderer.domElement);
			//controls
			scope.controls = control
			scope.controls.enableDamping = true;
			scope.controls.dampingFactor = 0.25;
			scope.controls.enableZoom = true;
			// lights
			light = new THREE.PointLight(0xFFFFFF, 1, 0);
			scene.add(light);
			// measurement controls
			measurementControls = new MeasurementControls({objects: scene.children}, camera, container, control);
			measurementControls.enabled = true;
			measurementControls.snap = true;

			scope.controls.addEventListener('change', function () {
				measurementControls.update();
				render();
			});

			measurementControls.addEventListener('change', function (event) {
				scope.dispatchEvent({type: "measurementChanged", object: event.object});
				render();
			});

			measurementControls.addEventListener('objectAdded', function (event) {
				scope.dispatchEvent({type: "measurementAdded", object: event.object});
				render();
			});
			measurementControls.addEventListener('objectRemoved', function (event) {
				scope.dispatchEvent({type: "measurementRemoved", object: event.object});
			});

			scene.add(measurementControls);
			//window
			window.addEventListener('resize', onWindowResize, false);
			onWindowResize();
		}


		function onWindowResize() {
			camera.aspect = dom.offsetWidth / dom.offsetHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(dom.offsetWidth, dom.offsetHeight);
			measurementControls.update();
		}

		function animate() {
			requestAnimationFrame(animate);
			scope.controls.update();
			light.position.copy(camera.position);
			render();
		}

		function render() {
			renderer.render(scene, camera);
		}

		init();
		animate();
	}

}

export {View3D};


class computeFaceNormal {
	constructor(geometry, face) {
		var cb = new THREE.Vector3(), ab = new THREE.Vector3();
		if (!face)
			return cb;
		//new method
		const positionAttribute = geometry.attributes.position;
		const vertex = new THREE.Vector3();
		var vA = vertex.fromBufferAttribute(positionAttribute, face.a);
		var vB = vertex.fromBufferAttribute(positionAttribute, face.b);
		var vC = vertex.fromBufferAttribute(positionAttribute, face.c);
		cb.subVectors(vC, vB);
		ab.subVectors(vA, vB);
		cb.cross(ab);
		cb.normalize();
		face.normal.copy(cb);
		return face.normal;
	}
}

export {computeFaceNormal};


