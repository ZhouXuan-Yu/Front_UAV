/**
 * 文件名: ThreeDronePathComponent.vue
 * 描述: 使用Three.js实现的无人机飞行路径3D可视化组件
 * 在项目中的作用: 
 * - 提供无人机飞行路径的三维立体展示
 * - 支持模拟无人机在复杂地形中的飞行轨迹
 * - 实现无人机模型的动画效果和交互功能
 * - 增强系统的空间感知和数据可视化能力
 */

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';

// 组件属性定义
const props = defineProps({
  // 路径点，三维坐标数组 [经度, 纬度, 高度]
  pathPoints: {
    type: Array as import('vue').PropType<Array<[number, number, number]>>,
    default: () => [
      [116.400, 39.900, 100],
      [116.405, 39.905, 150],
      [116.410, 39.910, 200],
      [116.415, 39.915, 150],
      [116.420, 39.920, 100]
    ]
  },
  // 无人机当前位置
  currentPosition: {
    type: Array as import('vue').PropType<[number, number, number]>,
    default: () => [116.4, 39.9, 100]
  }
});

// 容器引用
const container = ref<HTMLElement | null>(null);

// 场景对象
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let renderer: THREE.WebGLRenderer | null = null;
let controls: OrbitControls | null = null;
let droneModel: THREE.Group | null = null;
let pathLine: THREE.Line | null = null;
let timeline: gsap.core.Timeline | null = null;
let animationMixer: THREE.AnimationMixer | null = null;
let animationFrame: number | null = null;

// 深色模式状态
const isDarkMode = ref(false);

// 初始化three.js场景
const initScene = () => {
  if (!container.value) return;
  
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(isDarkMode.value ? 0x0a1929 : 0xf0f8ff);
  
  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    10000
  );
  camera.position.set(0, 150, 400);
  
  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  container.value.appendChild(renderer.domElement);
  
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
  
  // 添加大气效果
  addAtmosphericGlow();
  
  // 开始动画循环
  animate();
};

// 创建地形
const createTerrain = () => {
  if (!scene) return;
  
  // 使用更复杂的山地地形几何体
  const geometry = new THREE.PlaneGeometry(1000, 1000, 100, 100);
  
  // 使用更复杂的Perlin噪声算法生成山地地形
  const mountainHeight = 80;  // 增加山峰高度
  const valleyDepth = 20;     // 山谷深度
  const ridgeFrequency = 0.01; // 山脊频率
  
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const x = geometry.attributes.position.getX(i);
    const y = geometry.attributes.position.getY(i);
    
    // 使用多层次的柏林噪声来创建真实的山地起伏
    // 第一层：大尺度山脉
    const elevation1 = mountainHeight * (0.5 + 0.5 * Math.sin(x * 0.005) * Math.cos(y * 0.005));
    
    // 第二层：中等尺度的山丘
    const elevation2 = 30 * Math.sin(x * 0.02 + 10) * Math.cos(y * 0.02);
    
    // 第三层：小尺度的细节纹理
    const elevation3 = 10 * Math.sin(x * 0.1) * Math.cos(y * 0.1);
    
    // 加入山脊/山谷系统
    const ridge = Math.sin(x * ridgeFrequency) * Math.sin(y * ridgeFrequency);
    const ridgeElevation = 40 * Math.pow(Math.abs(ridge), 2) * Math.sign(ridge);
    
    // 模拟河谷侵蚀
    const riverVal = Math.abs(Math.sin(x * 0.007 + y * 0.007) + Math.sin(y * 0.008));
    const riverDepth = riverVal < 0.2 ? -valleyDepth * (1 - riverVal * 5) : 0;
    
    // 将各层叠加，形成最终地形
    const finalElevation = elevation1 + elevation2 + elevation3 + ridgeElevation + riverDepth;
    
    // 设置高度
    geometry.attributes.position.setZ(i, finalElevation);
  }
  
  // 更新法线以确保正确的光照
  geometry.computeVertexNormals();
  
  // 创建更真实的地形材质
  const material = new THREE.MeshStandardMaterial({
    color: isDarkMode.value ? 0x114266 : 0x75cff0,
    wireframe: false,
    flatShading: true,
    roughness: 0.8,
    metalness: 0.2
  });
  
  // 创建网格
  const terrain = new THREE.Mesh(geometry, material);
  terrain.rotation.x = -Math.PI / 2; // 水平放置
  terrain.receiveShadow = true;
  
  scene.add(terrain);
  
  // 添加水面
  addWaterSurface(-10); // 在海拔-10处添加水面
  
  // 添加植被
  addVegetation(geometry);
};

// 添加水面
const addWaterSurface = (height: number) => {
  if (!scene) return;
  
  const waterGeometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: 0x0077be,
    transparent: true,
    opacity: 0.7,
    roughness: 0.1,
    metalness: 0.8
  });
  
  const water = new THREE.Mesh(waterGeometry, waterMaterial);
  water.rotation.x = -Math.PI / 2;
  water.position.y = height;
  
  scene.add(water);
  
  // 水面动画
  gsap.to(waterMaterial, {
    opacity: 0.5,
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
  });
};

// 添加植被
const addVegetation = (terrainGeometry: THREE.PlaneGeometry) => {
  if (!scene) return;
  
  // 创建简化的树木几何体
  const treeGeometry = new THREE.ConeGeometry(5, 20, 8);
  const treeMaterial = new THREE.MeshStandardMaterial({
    color: 0x2e7d32,
    roughness: 0.8
  });
  
  const treeTrunkGeometry = new THREE.CylinderGeometry(1, 1, 10, 8);
  const treeTrunkMaterial = new THREE.MeshStandardMaterial({
    color: 0x5d4037,
    roughness: 0.9
  });
  
  // 在地形上随机放置树木
  const treeCount = 100;
  const treePositions = [];
  
  for (let i = 0; i < treeCount; i++) {
    // 随机位置
    const x = (Math.random() - 0.5) * 900;
    const z = (Math.random() - 0.5) * 900;
    
    // 获取该位置的地形高度
    // 简化：使用简单的噪声函数重新计算高度而不是从几何体采样
    const elevation = calculateElevationAt(x, z);
    
    // 如果高度合适（不是在水下或太高的山峰上），添加树木
    if (elevation > 0 && elevation < 60) {
      const treeGroup = new THREE.Group();
      
      // 树干
      const trunk = new THREE.Mesh(treeTrunkGeometry, treeTrunkMaterial);
      trunk.position.set(0, 5, 0);
      trunk.castShadow = true;
      treeGroup.add(trunk);
      
      // 树冠
      const crown = new THREE.Mesh(treeGeometry, treeMaterial);
      crown.position.set(0, 15, 0);
      crown.castShadow = true;
      treeGroup.add(crown);
      
      // 设置位置
      treeGroup.position.set(x, elevation, z);
      
      // 添加到场景
      scene.add(treeGroup);
      treePositions.push(treeGroup.position);
    }
  }
};

// 辅助函数：计算特定位置的地形高度
const calculateElevationAt = (x: number, z: number): number => {
  const mountainHeight = 80;
  const valleyDepth = 20;
  const ridgeFrequency = 0.01;
  
  // 使用与创建地形相同的噪声函数
  const elevation1 = mountainHeight * (0.5 + 0.5 * Math.sin(x * 0.005) * Math.cos(z * 0.005));
  const elevation2 = 30 * Math.sin(x * 0.02 + 10) * Math.cos(z * 0.02);
  const elevation3 = 10 * Math.sin(x * 0.1) * Math.cos(z * 0.1);
  
  const ridge = Math.sin(x * ridgeFrequency) * Math.sin(z * ridgeFrequency);
  const ridgeElevation = 40 * Math.pow(Math.abs(ridge), 2) * Math.sign(ridge);
  
  const riverVal = Math.abs(Math.sin(x * 0.007 + z * 0.007) + Math.sin(z * 0.008));
  const riverDepth = riverVal < 0.2 ? -valleyDepth * (1 - riverVal * 5) : 0;
  
  return elevation1 + elevation2 + elevation3 + ridgeElevation + riverDepth;
};

// 创建飞行路径
const createFlightPath = () => {
  if (!scene) return;
  
  // 创建更复杂的飞行路径
  const points = [
    // 起点
    new THREE.Vector3(-400, 100, -400),
    // 穿过山谷
    new THREE.Vector3(-300, 60, -300),
    new THREE.Vector3(-200, 40, -200),
    // 上升通过山脊
    new THREE.Vector3(-100, 120, -100),
    // 盘旋动作
    new THREE.Vector3(0, 140, 0),
    new THREE.Vector3(100, 130, -50),
    new THREE.Vector3(50, 120, -100),
    new THREE.Vector3(0, 110, -50),
    new THREE.Vector3(-50, 100, 0),
    // 下降到河谷
    new THREE.Vector3(0, 50, 100),
    new THREE.Vector3(100, 30, 200),
    // 沿河谷飞行
    new THREE.Vector3(200, 40, 200),
    new THREE.Vector3(300, 50, 150),
    // 最终上升
    new THREE.Vector3(350, 130, 100),
    // 终点
    new THREE.Vector3(400, 150, 0)
  ];
  
  // 创建一条平滑的曲线
  const curve = new THREE.CatmullRomCurve3(points);
  // 增加更多的点以使曲线更平滑
  const curvePoints = curve.getPoints(200);
  
  // 创建路径几何体
  const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
  
  // 创建更好看的路径材质
  const pathMaterial = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    linewidth: 3
  });
  
  // 创建路径线
  pathLine = new THREE.Line(geometry, pathMaterial);
  scene.add(pathLine);
  
  // 在路径上添加指示点
  const waypoints = [0, 0.25, 0.5, 0.75, 1]; // 在曲线上均匀分布的点
  
  waypoints.forEach(t => {
    const point = curve.getPoint(t);
    const sphereGeometry = new THREE.SphereGeometry(4, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xff9900,
      transparent: true,
      opacity: 0.8
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.copy(point);
    scene.add(sphere);
    
    // 添加发光效果
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff9900,
      transparent: true,
      opacity: 0.3
    });
    const glowSphere = new THREE.Mesh(
      new THREE.SphereGeometry(8, 32, 32),
      glowMaterial
    );
    glowSphere.position.copy(point);
    scene.add(glowSphere);
    
    // 为航点添加脉冲动画
    gsap.to(glowSphere.scale, {
      x: 1.5,
      y: 1.5,
      z: 1.5,
      duration: 1 + Math.random(),
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  });
  
  // 保存曲线以供动画使用
  flightCurve = curve;
};

// 飞行曲线引用
let flightCurve: THREE.CatmullRomCurve3 | null = null;

// 无人机动画
const animateDroneAlongPath = () => {
  if (!droneModel || !flightCurve) return;
  
  // 设置初始位置
  droneModel.position.copy(flightCurve.getPoint(0));
  
  // 创建更平滑的动画
  const duration = 40; // 动画持续时间（秒）
  
  const tl = gsap.timeline({
    repeat: -1,
    onUpdate: () => {
      if (!droneModel || !flightCurve) return;
      
      // 获取当前进度
      const progress = tl.progress();
      
      // 获取当前位置和前方位置以计算朝向
      const currentPoint = flightCurve.getPoint(progress);
      const lookAtPoint = flightCurve.getPoint(Math.min(progress + 0.01, 1));
      
      // 更新无人机位置
      droneModel.position.copy(currentPoint);
      
      // 让无人机朝向路径方向
      droneModel.lookAt(lookAtPoint);
      
      // 添加一些自然的摇晃/倾斜效果
      const wobble = Math.sin(progress * Math.PI * 20) * 0.05;
      droneModel.rotation.z = wobble;
      
      // 在转弯处倾斜
      const tangent = flightCurve.getTangent(progress);
      const angle = Math.atan2(tangent.x, tangent.z);
      droneModel.rotation.y = angle;
      
      // 转弯时倾斜
      const nextTangent = flightCurve.getTangent(Math.min(progress + 0.01, 1));
      const turnRate = 1 - nextTangent.dot(tangent); // 计算方向变化率
      droneModel.rotation.z += turnRate * 0.5; // 根据转弯率增加倾斜
    }
  });
  
  // 添加动画
  tl.to({}, { duration });
};

// 加载无人机模型
const loadDroneModel = () => {
  if (!scene) return;
  
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
    { x: 10, y: 0, z: 0, rotation: 0 },
    { x: 0, y: 0, z: 10, rotation: Math.PI / 2 },
    { x: -10, y: 0, z: 0, rotation: 0 },
    { x: 0, y: 0, z: -10, rotation: Math.PI / 2 }
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
  
  // 旋翼位置
  const rotorPositions = [
    { x: 20, y: 0, z: 0 },
    { x: 0, y: 0, z: 20 },
    { x: -20, y: 0, z: 0 },
    { x: 0, y: 0, z: -20 }
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
    
    // 将桨叶添加到旋翼组
    rotorGroup.add(blade1);
    rotorGroup.add(blade2);
    
    // 存储桨叶引用以便动画
    rotorGroup.userData = {
      blades: [blade1, blade2],
      speed: 0.1 + Math.random() * 0.1 // 不同旋翼速度略有差异
    };
    
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

// 添加大气效果
const addAtmosphericGlow = () => {
  if (!scene) return;
  
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
    duration: 4,
    ease: "power1.inOut"
  });
  timeline.to(glow.scale, {
    x: 1,
    y: 1,
    z: 1,
    duration: 4,
    ease: "power1.inOut"
  });
};

// 动画循环
const animate = () => {
  animationFrame = requestAnimationFrame(animate);
  
  // 如果无人机模型已加载，旋转旋翼
  if (droneModel) {
    droneModel.children.forEach((child: THREE.Object3D) => {
      if (child.userData && child.userData.blades) {
        child.userData.blades.forEach((blade: THREE.Object3D) => {
          blade.rotation.y += child.userData.speed;
        });
      }
    });
  }
  
  if (controls) {
    controls.update();
  }
  
  // 渲染场景
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
};

// 窗口大小调整处理
const handleResize = () => {
  if (!container.value || !camera || !renderer) return;
  
  // 更新相机宽高比
  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  
  // 更新渲染器大小
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
};

// 组件挂载时初始化场景
onMounted(() => {
  // 初始化3D场景
  initScene();
  
  // 添加窗口大小调整监听
  window.addEventListener('resize', handleResize);
});

// 组件卸载前清理资源
onBeforeUnmount(() => {
  // 停止动画循环
  if (animationFrame !== null) {
    cancelAnimationFrame(animationFrame);
  }
  
  // 清理时间线动画
  if (timeline) {
    timeline.kill();
  }
  
  // 释放渲染器资源
  if (renderer) {
    renderer.dispose();
  }
  
  // 从DOM中移除canvas
  if (container.value && renderer) {
    container.value.removeChild(renderer.domElement);
  }
  
  // 移除事件监听器
  window.removeEventListener('resize', handleResize);
});

// 监视深色模式变化
watch(isDarkMode, (newValue) => {
  if (scene) {
    scene.background = new THREE.Color(newValue ? 0x0a1929 : 0xf0f8ff);
  }
});
</script>

<template>
  <div class="three-drone-path-container">
    <div ref="container" class="three-container"></div>
  </div>
</template>

<style scoped>
.three-drone-path-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.three-container {
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, #87ceeb, #e0f7fa);
}
</style> 