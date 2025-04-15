<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { gsap } from 'gsap';

// 定义属性
const props = defineProps({
  // 无人机路径点数组（经度、纬度、高度）
  pathPoints: {
    type: Array as () => Array<[number, number, number]>,
    default: () => [
      [116.4, 39.9, 100],
      [116.42, 39.92, 150],
      [116.44, 39.94, 200],
      [116.46, 39.92, 150],
      [116.44, 39.9, 100],
      [116.4, 39.9, 100]
    ]
  },
  // 无人机当前位置
  currentPosition: {
    type: Array as () => [number, number, number],
    default: () => [116.4, 39.9, 100]
  }
});

// 创建容器引用
const container = ref<HTMLElement | null>(null);
const isDarkMode = ref(true);

// 场景相关变量
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let droneModel: THREE.Object3D;
let animationMixer: THREE.AnimationMixer;
let pathLine: THREE.Line;
let animationFrameId: number;

// 动画时间轴
let timeline: gsap.core.Timeline;

// 初始化Three.js场景
const initScene = () => {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(isDarkMode.value ? 0x0a1929 : 0xf0f8ff);
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    container.value!.clientWidth / container.value!.clientHeight,
    0.1,
    10000
  );
  camera.position.set(0, 150, 400);
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.value!.clientWidth, container.value!.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  container.value!.appendChild(renderer.domElement);
  
  // 添加相机控制
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  
  // 添加光源
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(200, 500, 300);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  
  // 添加辅助网格
  const gridHelper = new THREE.GridHelper(1000, 50, 0x555555, 0x333333);
  scene.add(gridHelper);
  
  // 添加坐标轴辅助
  const axesHelper = new THREE.AxesHelper(100);
  scene.add(axesHelper);
  
  // 创建地形
  createTerrain();
  
  // 创建飞行路径
  createFlightPath();
  
  // 加载无人机模型
  loadDroneModel();
  
  // 添加大气辉光效果
  addAtmosphericGlow();
  
  // 开始动画
  animate();
  
  // 窗口大小调整处理
  window.addEventListener('resize', handleResize);
};

// 创建地形
const createTerrain = () => {
  // 创建一个地形几何体
  const geometry = new THREE.PlaneGeometry(1000, 1000, 50, 50);
  
  // 用噪声函数来生成随机地形
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const x = geometry.attributes.position.getX(i);
    const y = geometry.attributes.position.getY(i);
    
    // 使用简单的噪声函数模拟地形高度
    const z = Math.sin(x * 0.01) * 10 + Math.cos(y * 0.01) * 10;
    
    geometry.attributes.position.setZ(i, z);
  }
  
  // 更新法线
  geometry.computeVertexNormals();
  
  // 创建材质
  const material = new THREE.MeshStandardMaterial({
    color: isDarkMode.value ? 0x114266 : 0x75cff0,
    wireframe: false,
    flatShading: true
  });
  
  // 创建网格
  const terrain = new THREE.Mesh(geometry, material);
  terrain.rotation.x = -Math.PI / 2; // 水平放置
  terrain.receiveShadow = true;
  
  scene.add(terrain);
};

// 创建飞行路径
const createFlightPath = () => {
  // 将经纬度转换为Three.js坐标
  const points = props.pathPoints.map(point => {
    // 简单的坐标转换（实际应用中需要使用更复杂的地理坐标转换）
    return new THREE.Vector3(
      (point[0] - 116.4) * 1000,
      point[2], // 高度
      (point[1] - 39.9) * 1000
    );
  });
  
  // 创建一条平滑的曲线
  const curve = new THREE.CatmullRomCurve3(points);
  const curvePoints = curve.getPoints(100);
  
  // 创建路径几何体
  const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
  
  // 创建路径材质
  const material = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    linewidth: 2
  });
  
  // 创建路径线
  pathLine = new THREE.Line(geometry, material);
  scene.add(pathLine);
  
  // 在路径上添加指示点
  points.forEach(point => {
    const sphereGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff9900 });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.copy(point);
    scene.add(sphere);
  });
};

// 加载无人机模型
const loadDroneModel = () => {
  // 使用一个精细一些的无人机模型而不是简单的方块
  // 创建无人机主体
  const bodyGeometry = new THREE.CylinderGeometry(5, 8, 3, 8);
  const bodyMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x00a1ff,
    metalness: 0.7,
    roughness: 0.3
  });
  droneModel = new THREE.Group();
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.castShadow = true;
  droneModel.add(body);
  
  // 添加无人机顶部圆顶
  const domeGeometry = new THREE.SphereGeometry(5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
  const domeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x0077cc,
    metalness: 0.7,
    roughness: 0.3
  });
  const dome = new THREE.Mesh(domeGeometry, domeMaterial);
  dome.position.y = 1.5;
  dome.castShadow = true;
  droneModel.add(dome);
  
  // 添加四个机臂
  const armGeometry = new THREE.BoxGeometry(20, 1, 1);
  const armMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  
  // 创建机臂位置和角度
  const armPositions = [
    { x: 0, y: 0, z: 0, rotation: 0 },
    { x: 0, y: 0, z: 0, rotation: Math.PI / 2 },
    { x: 0, y: 0, z: 0, rotation: Math.PI },
    { x: 0, y: 0, z: 0, rotation: Math.PI * 1.5 }
  ];
  
  // 添加四个机臂
  armPositions.forEach(pos => {
    const arm = new THREE.Mesh(armGeometry, armMaterial);
    arm.rotation.y = pos.rotation;
    arm.castShadow = true;
    droneModel.add(arm);
  });
  
  // 添加旋翼
  const rotorGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 32);
  const rotorHubGeometry = new THREE.SphereGeometry(1.5, 16, 16);
  const motorGeometry = new THREE.CylinderGeometry(1.2, 1.2, 2, 16);
  const rotorMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const bladeGeometry = new THREE.BoxGeometry(12, 0.2, 1);
  const bladeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xcccccc,
    transparent: true,
    opacity: 0.8
  });
  
  // 四个旋翼的位置
  const rotorPositions = [
    { x: 10, y: 0, z: 0 },
    { x: 0, y: 0, z: 10 },
    { x: -10, y: 0, z: 0 },
    { x: 0, y: 0, z: -10 }
  ];
  
  // 创建旋翼组并添加至无人机
  rotorPositions.forEach((pos, index) => {
    const rotorGroup = new THREE.Group();
    rotorGroup.position.set(pos.x, pos.y, pos.z);
    
    // 电机
    const motor = new THREE.Mesh(motorGeometry, rotorMaterial);
    motor.position.y = 1;
    motor.castShadow = true;
    rotorGroup.add(motor);
    
    // 旋翼轮毂
    const rotorHub = new THREE.Mesh(rotorHubGeometry, rotorMaterial);
    rotorHub.position.y = 2.5;
    rotorHub.castShadow = true;
    rotorGroup.add(rotorHub);
    
    // 创建桨叶
    const blade1 = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade1.position.y = 2.5;
    blade1.castShadow = true;
    
    const blade2 = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade2.position.y = 2.5;
    blade2.rotation.y = Math.PI / 2;
    blade2.castShadow = true;
    
    rotorGroup.add(blade1);
    rotorGroup.add(blade2);
    
    // 存储旋翼引用以便动画
    rotorGroup.userData.blades = [blade1, blade2];
    rotorGroup.userData.speed = 0.1 + Math.random() * 0.1; // 不同旋翼速度略有差异
    
    droneModel.add(rotorGroup);
  });
  
  // 添加相机/传感器
  const cameraGeometry = new THREE.CylinderGeometry(1.5, 1.5, 2, 16);
  const cameraMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const cameraLensGeometry = new THREE.CylinderGeometry(1, 1, 1, 16);
  const cameraLensMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x5599ff,
    metalness: 0.9,
    roughness: 0.1
  });
  
  // 底部相机组
  const cameraGroup = new THREE.Group();
  cameraGroup.position.set(0, -2, 0);
  
  const cameraBody = new THREE.Mesh(cameraGeometry, cameraMaterial);
  cameraBody.castShadow = true;
  cameraGroup.add(cameraBody);
  
  const cameraLens = new THREE.Mesh(cameraLensGeometry, cameraLensMaterial);
  cameraLens.position.y = -1.5;
  cameraLens.castShadow = true;
  cameraGroup.add(cameraLens);
  
  droneModel.add(cameraGroup);
  
  // 添加灯光效果
  const statusLight = new THREE.PointLight(0x00ff00, 0.8, 5);
  statusLight.position.set(0, 0, 0);
  droneModel.add(statusLight);
  
  // 为无人机添加动画效果
  timeline = gsap.timeline({ repeat: -1 });
  timeline.to(droneModel.position, {
    y: '+=2',
    duration: 2,
    ease: "sine.inOut"
  });
  timeline.to(droneModel.position, {
    y: '-=2',
    duration: 2,
    ease: "sine.inOut"
  });
  
  // 设置初始位置
  const initialPos = props.pathPoints[0];
  droneModel.position.set(
    (initialPos[0] - 116.4) * 1000,
    initialPos[2], // 高度
    (initialPos[1] - 39.9) * 1000
  );
  
  // 缩放无人机模型以适应场景
  droneModel.scale.set(0.8, 0.8, 0.8);
  
  scene.add(droneModel);
  
  // 创建动画路径
  animateDroneAlongPath();
};

// 添加大气辉光效果
const addAtmosphericGlow = () => {
  // 创建辉光球体
  const sphereGeometry = new THREE.SphereGeometry(500, 32, 32);
  const sphereMaterial = new THREE.MeshBasicMaterial({
    color: 0x0066cc,
    transparent: true,
    opacity: 0.05,
    side: THREE.BackSide
  });
  
  const glow = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(glow);
  
  // 创建动画效果
  timeline = gsap.timeline({ repeat: -1 });
  timeline.to(glow.scale, {
    x: 1.1,
    y: 1.1,
    z: 1.1,
    duration: 2,
    ease: "power1.inOut"
  });
  timeline.to(glow.scale, {
    x: 1,
    y: 1,
    z: 1,
    duration: 2,
    ease: "power1.inOut"
  });
};

// 沿路径创建无人机动画
const animateDroneAlongPath = () => {
  // 将经纬度转换为Three.js坐标
  const points = props.pathPoints.map(point => {
    return new THREE.Vector3(
      (point[0] - 116.4) * 1000,
      point[2], // 高度
      (point[1] - 39.9) * 1000
    );
  });
  
  // 创建一条平滑的曲线
  const curve = new THREE.CatmullRomCurve3(points);
  
  // 创建动画
  const duration = 20; // 动画持续时间（秒）
  let progress = 0;
  
  // 使用GSAP创建动画
  gsap.to({}, {
    duration: duration,
    repeat: -1,
    onUpdate: function() {
      progress = this.progress();
      
      // 获取路径上的当前位置
      const position = curve.getPointAt(progress);
      droneModel.position.copy(position);
      
      // 计算下一点以确定朝向
      const lookAtPosition = curve.getPointAt((progress + 0.01) % 1);
      droneModel.lookAt(lookAtPosition);
      
      // 添加一些旋转以模拟飞行动态
      droneModel.rotation.z = Math.sin(progress * Math.PI * 2) * 0.1;
    }
  });
};

// 动画循环
const animate = () => {
  animationFrameId = requestAnimationFrame(animate);
  
  // 如果无人机模型已加载，旋转旋翼
  if (droneModel) {
    droneModel.children.forEach(child => {
      if (child.userData && child.userData.blades) {
        child.userData.blades.forEach(blade => {
          blade.rotation.y += child.userData.speed;
        });
      }
    });
  }
  
  controls.update();
  
  // 渲染场景
  renderer.render(scene, camera);
};

// 窗口大小调整处理
const handleResize = () => {
  if (!container.value) return;
  
  // 更新相机宽高比
  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  
  // 更新渲染器大小
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
};

// 组件挂载时初始化场景
onMounted(() => {
  // 延迟初始化以确保容器已加载
  setTimeout(initScene, 100);
});

// 组件卸载前清理资源
onBeforeUnmount(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  if (timeline) {
    timeline.kill();
  }
  
  if (renderer) {
    renderer.dispose();
  }
  
  if (container.value && renderer) {
    container.value.removeChild(renderer.domElement);
  }
  
  window.removeEventListener('resize', handleResize);
});
</script>

<template>
  <div class="drone-path-container">
    <div 
      ref="container" 
      class="three-container"
      :class="{ 'dark-mode': isDarkMode }"
    ></div>
    
    <div class="controls">
      <button @click="isDarkMode = !isDarkMode" class="mode-toggle">
        {{ isDarkMode ? '切换浅色模式' : '切换深色模式' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.drone-path-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.three-container {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f0f8ff;
}

.three-container.dark-mode {
  background-color: #0a1929;
}

.controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 10;
}

.mode-toggle {
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.mode-toggle:hover {
  background-color: rgba(0, 0, 0, 0.9);
}
</style> 