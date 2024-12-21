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
renderer.setClearColor(0xffffff, 0); // Transparent background
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2 : 1);

// Scene and camera setup
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// HDRI 배경 설정
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

const exrLoader = new EXRLoader();
exrLoader.load('./textures/qwantani_dusk_2_4k.exr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping; // HDRI 매핑 방식 설정
    scene.background = texture; // HDRI를 배경으로 설정
    scene.environment = texture; // 환경 맵 설정 (반사 등에 사용)
});

// 조명 추가
/*
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
*/

// 카메라 위치 설정
camera.position.set(0, 10, -35);
const controls = new OrbitControls(camera, renderer.domElement);
// OrbitControls 타겟 설정 (카메라가 바라볼 위치)
controls.target.set(0, 10, 0);
controls.update(); // OrbitControls 업데이트

// 로딩 상태 관리
let loadedModels = 0; // 로드된 모델 수
const totalModels = 4; // 로드할 총 모델 수
let isLoaded = false; // 로딩 완료 여부

// 로딩 바 DOM 추가
const loadingBarContainer = document.createElement('div');
loadingBarContainer.style.position = 'fixed';
loadingBarContainer.style.top = '50%';
loadingBarContainer.style.left = '50%';
loadingBarContainer.style.transform = 'translate(-50%, -50%)';
loadingBarContainer.style.width = '300px';
loadingBarContainer.style.height = '30px';
loadingBarContainer.style.backgroundColor = '#D9D9D9';
loadingBarContainer.style.borderRadius = '15px';
loadingBarContainer.style.overflow = 'hidden';

const loadingBar = document.createElement('div');
loadingBar.style.height = '100%';
loadingBar.style.width = '0%';
loadingBar.style.backgroundColor = '#A7F6C2';
loadingBarContainer.appendChild(loadingBar);

document.body.appendChild(loadingBarContainer);

// 로딩 완료 전 배경 설정
document.body.style.backgroundColor = '#ffffff';

// GLTF model loader function
function loadGLTFModel(loader, path, position, scale, callback) {
  return new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(...position); // Set model position
        model.scale.set(...scale); // Set model scale

        // 로드 완료 카운트 증가 및 프로그레스 업데이트
        loadedModels++;
        const progress = (loadedModels / totalModels) * 100;
        loadingBar.style.width = `${progress}%`;

        // 모든 모델 로드 완료 시 처리
        if (loadedModels === totalModels) {
          isLoaded = true; // 로딩 완료 플래그 설정
          setTimeout(() => {
            loadingBarContainer.style.display = 'none'; // 로딩 바 숨김
            document.body.style.backgroundColor = 'transparent'; // 배경 투명 설정
            animate(); // 애니메이션 시작
          }, 500); // 약간의 딜레이 후 처리
        }

        resolve(model);
        if (callback) callback(model);
        console.log(`Model loaded from ${path}`);
      },
      undefined,
      (error) => {
        console.error(`Error loading GLTF model from ${path}:`, error);
        reject(error);
      }
    );
  });
}

// GLTFLoader instance
const loader = new GLTFLoader();

// Load models
let canonModel = null;
let bibleModel = null;
let desktopModel = null;

Promise.all([
  loadGLTFModel(loader, './models/room.gltf', [0, 0, 0], [1, 1, 1]),
  loadGLTFModel(loader, './models/canon.gltf', [0, 0, 0], [1, 1, 1], (model) => {
    canonModel = model; // 모델 저장
  }),
  loadGLTFModel(loader, './models/bible.gltf', [0, 0, 0], [1, 1, 1], (model) => {
    bibleModel = model;
  }),
  loadGLTFModel(loader, './models/desktop.gltf', [0, 0, 0], [1, 1, 1], (model) => {
    desktopModel = model;
  }),
]).then((models) => {
  models.forEach((model) => scene.add(model)); // 로드된 모든 모델을 씬에 추가
  console.log('All models loaded successfully');
}).catch((error) => {
  console.error('Error loading models:', error);
});

// Raycaster and mouse setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Mouse move event listener
window.addEventListener('mousemove', (event) => {
  // Convert mouse position to normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections
  let intersected = false;
  [canonModel, bibleModel, desktopModel].forEach((model) => {
    if (model) {
      const intersects = raycaster.intersectObject(model, true);
      if (intersects.length > 0) {
        document.body.style.cursor = 'pointer'; // Change cursor to pointer
        intersected = true;
      }
    }
  });

  if (!intersected) {
    document.body.style.cursor = 'default'; // Reset cursor
  }
});

// Mouse click event listener for page redirection
window.addEventListener('click', () => {
  if (canonModel || bibleModel || desktopModel) {
    const intersectsCanon = raycaster.intersectObject(canonModel, true);
    const intersectsBible = raycaster.intersectObject(bibleModel, true);
    const intersectsDesktop = raycaster.intersectObject(desktopModel, true);

    if (intersectsCanon.length > 0) {
      window.location.href = 'page2.html'; // Redirect for canon
    } else if (intersectsBible.length > 0) {
      window.location.href = 'page1.html'; // Redirect for bible
    } else if (intersectsDesktop.length > 0) {
      window.location.href = 'page4.html'; // Redirect for desktop
    }
  }
});

// Movement variables
const movement = {
  forward: false,
  backward: false,
  left: false,
  right: false
};
const speed = 0.1;

// Keyboard event listeners
window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'w':
      movement.forward = true;
      break;
    case 's':
      movement.backward = true;
      break;
    case 'a':
      movement.left = true;
      break;
    case 'd':
      movement.right = true;
      break;
  }
});

window.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'w':
      movement.forward = false;
      break;
    case 's':
      movement.backward = false;
      break;
    case 'a':
      movement.left = false;
      break;
    case 'd':
      movement.right = false;
      break;
  }
});

// Animation loop
function animate() {
  if (!isLoaded) return; // 로딩 완료 전에는 실행하지 않음
  requestAnimationFrame(animate);

  // Camera movement
  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  if (movement.forward) {
    camera.position.addScaledVector(direction, speed);
  }
  if (movement.backward) {
    camera.position.addScaledVector(direction, -speed);
  }
  if (movement.left) {
    const left = new THREE.Vector3().crossVectors(camera.up, direction).normalize();
    camera.position.addScaledVector(left, speed);
  }
  if (movement.right) {
    const right = new THREE.Vector3().crossVectors(direction, camera.up).normalize();
    camera.position.addScaledVector(right, speed);
  }

  // Render the scene
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
