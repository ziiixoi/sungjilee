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
exrLoader.load('./textures/christmas_photo_studio_07_2k.exr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping; // HDRI 매핑 방식 설정
    scene.background = texture; // HDRI를 배경으로 설정
    scene.environment = texture; // 환경 맵 설정 (반사 등에 사용)
});

// 카메라 위치 설정
camera.position.set(0, 23, 23);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 10, 0);
controls.update();

// 로딩 상태 관리
let loadedModels = 0; // 로드된 모델 수
const totalModels = 2; // 로드할 총 모델 수
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

// 텍스트 컨테이너 DOM 가져오기
const textContainer = document.querySelector('.text-container');

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
            textContainer.classList.remove('hidden');
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
let letterModel = null;

// Load Goodnews and Letter models
Promise.all([
  loadGLTFModel(loader, './models/Goodnews.gltf', [0, 0, 0], [1, 1, 1]),
  loadGLTFModel(loader, './models/letter.gltf', [0, 0, 0], [1, 1, 1], (model) => {
    letterModel = model; // 모델 저장
  }),
]).then((models) => {
  models.forEach((model) => scene.add(model)); // 로드된 모든 모델을 씬에 추가
  console.log('All models loaded successfully');
}).catch((error) => {
  console.error('Error loading models:', error);
});

const mouse = new THREE.Vector2(); // 마우스 좌표 초기화
const raycaster = new THREE.Raycaster(); // Raycaster 초기화

// Popup DOM 생성
const popupContainer = document.createElement('div');
popupContainer.style.position = 'fixed';
popupContainer.style.top = '50%';
popupContainer.style.left = '50%';
popupContainer.style.transform = 'translate(-50%, -50%)';
popupContainer.style.width = '26%';
popupContainer.style.padding = '30px';
popupContainer.style.backgroundColor = '#ffffff';
popupContainer.style.border = 'solid 2px black';
popupContainer.style.display = 'none'; // 기본적으로 숨김
popupContainer.style.zIndex = '1000';
popupContainer.innerHTML = `

    <h2 style="font-size: 1.5em; margin-bottom: 10px; text-align: center;">John 3:16-17</h2>
    <blockquote style="line-height: 1.6; font-style: italic; color: #555; text-align: justify;">
      "For God so loved the world that He gave His one and only Son,
      that whoever believes in Him shall not perish but have eternal life.
      For God did not send His Son into the world to condemn the world,
      but to save the world through Him."
      <br>
      <br>
    </blockquote>
   <button id="close-popup">Close</button>
`;
document.body.appendChild(popupContainer);

// Close button 이벤트 추가
document.getElementById('close-popup').addEventListener('click', () => {
  popupContainer.style.display = 'none';
});

// Raycaster 클릭 이벤트 추가
window.addEventListener('click', (event) => {
  // Raycaster 업데이트
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(mouse, camera);

  // letter 모델에 대한 교차 검사
  if (letterModel) {
    const intersects = raycaster.intersectObject(letterModel, true);
    if (intersects.length > 0) {
      // 팝업 표시
      popupContainer.style.display = 'block';
    }
  }
});

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
