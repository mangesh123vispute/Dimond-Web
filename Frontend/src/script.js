import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import pendant3 from "./pendant3.glb";
import { RGBELoader } from "three/examples/jsm/Addons.js";
import scene10 from "./scene10.glb";

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
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(2, 2, 2); // from above
scene.add(directionalLight);

const pointlight = new THREE.PointLight(0xffffff, 1);
pointlight.position.set(2, 2, 2); // from above
scene.add(pointlight);

const rgbeloader = new RGBELoader();
rgbeloader.load(
  "./hdr/2k.hdr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = texture;
    scene.environment = texture;
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.error("An error happened", error);
  }
);

// Object
let mesh;

// Loader
const loader = new GLTFLoader();
loader.load(
  scene10,
  function (gltf) {
    let pendant = gltf.scene;
    pendant.position.set(1, 1, 1);
    pendant.scale.set(5, 5, 5);

    // Center the model
    const box = new THREE.Box3().setFromObject(pendant);
    const center = box.getCenter(new THREE.Vector3());
    pendant.position.sub(center); // Center the model at the origin

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
  camera.position.z = 25;
  camera.position.x = 10;
  camera.position.y = 10;

  scene.add(camera);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  const axisHelper = new THREE.AxesHelper(5);
  scene.add(axisHelper);

  // Renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
  });
  renderer.setSize(sizes.width, sizes.height);

  // Animate
  const clock = new THREE.Clock();

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update objects
    // mesh.rotation.y = elapsedTime;

    // Update camera position based on cursor
    // camera.position.z = Math.cos(cursor.x * Math.PI * 2) * 2;
    // camera.position.x = Math.sin(cursor.x * Math.PI * 2) * 2;
    // camera.position.y = cursor.y * 3;
    // camera.lookAt(mesh.position);

    // Render
    controls.update();
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();
}
