import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { GUI } from "lil-gui";
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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

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
const gltfLoader = new GLTFLoader();
let modelObject;

gltfLoader.load(
  model,
  function (gltf) {
    modelObject = gltf.scene;
    modelObject.traverse(function (node) {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;

        // Enhance material properties for realism and shininess
        node.material = new THREE.MeshStandardMaterial({
          color: node.material.color,
          metalness: 1, // Fully metal
          roughness: 0.2, // Slightly rough surface
          clearcoat: 1, // Clearcoat for shiny appearance
          clearcoatRoughness: 0.1, // Roughness of the clearcoat
          envMapIntensity: 2, // Intensity of environment map reflections
        });
      }
    });

    // Compute the bounding box of the model
    const bbox = new THREE.Box3().setFromObject(modelObject);
    const size = bbox.getSize(new THREE.Vector3());

    // Compute the max dimension to ensure consistent scaling
    const maxDim = Math.max(size.x, size.y, size.z);

    // Desired size
    const desiredSize = 10;
    const scale = desiredSize / maxDim;

    // Apply scale to model
    modelObject.scale.set(scale, scale, scale);

    // Recompute bounding box after scaling
    const bboxScaled = new THREE.Box3().setFromObject(modelObject);
    const centerScaled = bboxScaled.getCenter(new THREE.Vector3());

    // Adjust the model's position to center it
    modelObject.position.sub(centerScaled);

    // Add model to the scene
    scene.add(modelObject);

    // Adjust lights based on the model's bounding box
    adjustLights(bboxScaled);

    // Setup GUI
    setupGUI(camera);

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

function adjustLights(bbox) {
  // Remove existing lights
  scene.children = scene.children.filter(
    (child) => !(child instanceof THREE.Light)
  );

  // Get the size of the bounding box
  const size = bbox.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  // Add directional lights from all 8 directions
  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 5);
  directionalLight1.position.set(maxDim, maxDim, maxDim);
  directionalLight1.target = modelObject;
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 5);
  directionalLight2.position.set(-maxDim, -maxDim, -maxDim);
  directionalLight2.target = modelObject;
  scene.add(directionalLight2);

  const directionalLight3 = new THREE.DirectionalLight(0xffffff, 5);
  directionalLight3.position.set(-maxDim, maxDim, maxDim);
  directionalLight3.target = modelObject;
  scene.add(directionalLight3);

  const directionalLight4 = new THREE.DirectionalLight(0xffffff, 5);
  directionalLight4.position.set(maxDim, -maxDim, -maxDim);
  directionalLight4.target = modelObject;
  scene.add(directionalLight4);

  const directionalLight5 = new THREE.DirectionalLight(0xffffff, 5);
  directionalLight5.position.set(maxDim, -maxDim, maxDim);
  directionalLight5.target = modelObject;
  scene.add(directionalLight5);

  const directionalLight6 = new THREE.DirectionalLight(0xffffff, 5);
  directionalLight6.position.set(-maxDim, maxDim, -maxDim);
  directionalLight6.target = modelObject;
  scene.add(directionalLight6);

  const directionalLight7 = new THREE.DirectionalLight(0xffffff, 5);
  directionalLight7.position.set(-maxDim, -maxDim, maxDim);
  directionalLight7.target = modelObject;
  scene.add(directionalLight7);

  const directionalLight8 = new THREE.DirectionalLight(0xffffff, 5);
  directionalLight8.position.set(maxDim, maxDim, -maxDim);
  directionalLight8.target = modelObject;
  scene.add(directionalLight8);

  // Add point lights around the model
  const pointLight1 = new THREE.PointLight(0xffffff, 7, 100);
  pointLight1.position.set(-maxDim, maxDim, maxDim);
  pointLight1.castShadow = true;
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xffffff, 7, 100);
  pointLight2.position.set(maxDim, -maxDim, maxDim);
  pointLight2.castShadow = true;
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0xffffff, 7, 100);
  pointLight3.position.set(maxDim, maxDim, -maxDim);
  pointLight3.castShadow = true;
  scene.add(pointLight3);

  const pointLight4 = new THREE.PointLight(0xffffff, 7, 100);
  pointLight4.position.set(-maxDim, -maxDim, -maxDim);
  pointLight4.castShadow = true;
  scene.add(pointLight4);

  const ambientLight2 = new THREE.AmbientLight(0xffffff, 20);
  scene.add(ambientLight2);

  // Add an additional spotlight for accent lighting
  const spotLight = new THREE.SpotLight(0xffffff, 10);
  spotLight.position.set(maxDim * 1.5, maxDim * 1.5, maxDim * 1.5);
  spotLight.castShadow = true;
  spotLight.angle = Math.PI / 4;
  spotLight.penumbra = 0.1;
  spotLight.decay = 2;
  spotLight.distance = 200;
  scene.add(spotLight);
}

function setupGUI(camera) {
  const gui = new GUI();

  const axesHelper = new THREE.AxesHelper(5);
  axesHelper.visible = false;
  scene.add(axesHelper);

  const infoFolder = gui.addFolder("Interaction Info");
  infoFolder
    .add({ Instructions: "LeftClick+Hold+Rotate" }, "Instructions")
    .name("Rotate");
  infoFolder
    .add({ Instructions: "RightClick+Hold+Move" }, "Instructions")
    .name("Move");
  infoFolder.add({ Instructions: "MouseScroll" }, "Instructions").name("Zoom");
  infoFolder.open();
}

function modelLoadedCallback() {
  // Animate
  const clock = new THREE.Clock();

  const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  };

  tick();
}
