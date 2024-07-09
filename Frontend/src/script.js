import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import model7 from "./model7.glb";
import model1 from "./model1.glb";
import model2 from "./model2.glb";
import model6 from "./model6.glb";

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = -1 * (event.clientY / sizes.height - 0.5);
});

// Scene
const scene = new THREE.Scene();

// Lights

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight
);
scene.add(directionalLightHelper);

const pointLight = new THREE.PointLight(0xffffff, 2.5);
pointLight.position.set(2, 2, 2);
pointLight.castShadow = true;
scene.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 2.5);
pointLight2.position.set(-2, -2, -2);
pointLight2.castShadow = true;
scene.add(pointLight2);

// Object
let mesh;

// GLTF Loader
const loader = new GLTFLoader();
loader.load(
  model7,
  function (gltf) {
    let pendant = gltf.scene;
    pendant.position.set(0, 0, 0);
    pendant.scale.set(0.3, 0.3, 0.3);

    mesh = pendant;
    scene.add(pendant);
    modelLoadedCallback();
  },
  function (xhr) {
    // Called while loading is in progress
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    // Called if there’s an error loading the model
    console.error("An error happened", error);
  }
);

function modelLoadedCallback() {
  console.log("Model loaded", mesh.position);

  // Calculate distance from origin
  const origin = new THREE.Vector3(0, 0, 0);
  const distance = mesh.position.distanceTo(origin);
  console.log("Distance from origin:", distance);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    45,
    sizes.width / sizes.height,
    0.1,
    1000
  );
  camera.position.set(0, 0, 15);

  scene.add(camera);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  const axisHelper = new THREE.AxesHelper(5);
  scene.add(axisHelper);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    alpha: true,
  });
  renderer.setSize(sizes.width, sizes.height);

  // Animate
  const clock = new THREE.Clock();

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update directional light direction to match camera direction
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection);
    directionalLight.position.copy(camera.position);
    directionalLight.target.position.copy(camera.position).add(cameraDirection);
    directionalLight.target.updateMatrixWorld();

    // Render
    controls.update();
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();
}
