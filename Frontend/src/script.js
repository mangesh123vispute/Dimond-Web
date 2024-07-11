import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import model from "./model8.glb";

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

// Scene
const scene = new THREE.Scene();

// Lights
const directionalLight = new THREE.DirectionalLight(0xffffff, 8);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;

// Adjusting the shadow frustum dimensions to increase width
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;

scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 3);
pointLight.position.set(0, 5, 0);
pointLight.castShadow = true;
scene.add(pointLight);

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  1000
);
camera.position.set(15, 5, -5);

scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// Renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Resize event listener
window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Fullscreen toggle on double-click
window.addEventListener("dblclick", () => {
  const fullscreenElement =
    document.fullscreenElement || document.webkitFullscreenElement;

  if (!fullscreenElement) {
    if (canvas.requestFullscreen) {
      canvas.requestFullscreen();
    } else if (canvas.webkitRequestFullscreen) {
      canvas.webkitRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
});

// GLTF Loader
const loader = new GLTFLoader();
loader.load(
  model,
  function (gltf) {
    let pendant = gltf.scene;

    // Compute the bounding box of the model
    const bbox = new THREE.Box3().setFromObject(pendant);
    const size = bbox.getSize(new THREE.Vector3());

    // Compute the max dimension to ensure consistent scaling
    const maxDim = Math.max(size.x, size.y, size.z);

    // Desired size
    const desiredSize = 10;
    const scale = desiredSize / maxDim;

    // Apply scale to model
    pendant.scale.set(scale, scale, scale);

    // Recompute bounding box after scaling
    const bboxScaled = new THREE.Box3().setFromObject(pendant);
    const centerScaled = bboxScaled.getCenter(new THREE.Vector3());

    // Adjust the model's position to center it
    pendant.position.sub(centerScaled);

    // Add model to the scene
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

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();
}
