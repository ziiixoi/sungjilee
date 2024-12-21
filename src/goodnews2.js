// Import necessary modules
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';

// Renderer setup
const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});

// Scene setup
const scene = new THREE.Scene();

// Camera setup
const camera = new THREE.PerspectiveCamera(
  75, // Field of view
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near plane
  1000 // Far plane
);
camera.position.set(0, 1, 5);

// OrbitControls setup
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth control damping

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);

// Load GLTF model
const loader = new GLTFLoader();
loader.load(
  './models/goodnews.gltf', // Path to the GLTF file
  (gltf) => {
    const model = gltf.scene;
    scene.add(model);
    console.log('Model loaded successfully:', model);
  },
  (xhr) => {
    console.log(`Loading progress: ${(xhr.loaded / xhr.total) * 100}%`);
  },
  (error) => {
    console.error('An error occurred while loading the model:', error);
  }
);

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
const animate = () => {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

animate();
