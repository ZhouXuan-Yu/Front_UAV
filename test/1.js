// AdvancedDroneSimulation.vue
<template>
  <div class="relative w-full h-screen overflow-hidden">
    <div ref="container" class="absolute inset-0 bg-black"></div>
    
    <!-- 控制面板 -->
    <div class="absolute top-4 left-4 text-white bg-black bg-opacity-50 p-4 rounded-lg shadow-lg">
      <h2 class="text-xl font-bold mb-2">无人机高级巡视系统</h2>
      <p class="mb-1">已完成路径: {{ completedPercentage.toFixed(0) }}%</p>
      <p class="mb-1">当前速度: {{ currentSpeed.toFixed(1) }} m/s</p>
      <p class="mb-1">高度: {{ currentAltitude.toFixed(1) }} m</p>
      <p class="mb-1">时间: {{ timeOfDay }}</p>
      
      <div class="mt-3">
        <button 
          @click="toggleTimeControl" 
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded mr-2"
        >
          {{ isTimeRunning ? '暂停时间' : '恢复时间' }}
        </button>
        <button 
          @click="toggleDroneView" 
          class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded"
        >
          {{ isDroneView ? '自由视角' : '无人机视角' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';

export default {
  name: 'AdvancedDroneSimulation',
  setup() {
    // 响应式数据
    const container = ref(null);
    const completedPercentage = ref(0);
    const currentSpeed = ref(5);
    const currentAltitude = ref(0);
    const timeOfDay = ref('白天');
    const isTimeRunning = ref(true);
    const isDroneView = ref(false);
    
    // Three.js核心组件
    let scene, camera, renderer, controls, composer;
    let drone, droneCam, droneMixer;
    let pathCurve, pathPoints, pathLine, pathVisualizer;
    let clock, animating = true;
    
    // 地形和环境组件
    let terrain, buildings = [], trees = [], rocks = [];
    let clouds = [], fog;
    let waterSurface, waterShader;
    
    // 光照系统
    let sunLight, moonLight, ambientLight, hemisphereLightDay, hemisphereLightNight;
    let skyDome, stars;
    
    // 物理和动画参数
    let time = 0;
    let dayNightCycle = 0;
    let windDirection = new THREE.Vector3(1, 0, 0);
    let windStrength = 0.2;
    let gravitationalPull = new THREE.Vector3(0, -9.8, 0);
    
    // 初始化函数
    const initScene = () => {
      // 创建场景
      scene = new THREE.Scene();
      
      // 创建相机
      camera = new THREE.PerspectiveCamera(
        70,
        container.value.clientWidth / container.value.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 15, 30);
      
      // 创建渲染器
      renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: true
      });
      renderer.setSize(container.value.clientWidth, container.value.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;
      renderer.outputEncoding = THREE.sRGBEncoding;
      container.value.appendChild(renderer.domElement);
      
      // 添加后期处理
      setupPostProcessing();
      
      // 添加轨道控制
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI * 0.85;
      
      // 创建时钟
      clock = new THREE.Clock();
      
      // 构建环境
      setupSkyAndLighting();
      createTerrain();
      createWater();
      createVegetation();
      createBuildings();
      createRocks();
      createClouds();
      
      // 创建无人机路径和模型
      createPath();
      createDrone();
      
      // 开始动画循环
      animate();
      
      // 添加窗口大小调整事件
      window.addEventListener('resize', onWindowResize);
    };
    
    // 设置后期处理
    const setupPostProcessing = () => {
      composer = new EffectComposer(renderer);
      
      const renderPass = new RenderPass(scene, camera);
      composer.addPass(renderPass);
      
      // 添加泛光效果
      const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(container.value.clientWidth, container.value.clientHeight),
        0.3,    // 强度
        0.4,    // 半径
        0.9     // 阈值
      );
      composer.addPass(bloomPass);
      
      // 添加FXAA抗锯齿
      const fxaaPass = new ShaderPass(FXAAShader);
      fxaaPass.material.uniforms['resolution'].value.x = 1 / (container.value.clientWidth * renderer.getPixelRatio());
      fxaaPass.material.uniforms['resolution'].value.y = 1 / (container.value.clientHeight * renderer.getPixelRatio());
      composer.addPass(fxaaPass);
    };
    
    // 设置天空和光照
    const setupSkyAndLighting = () => {
      // 创建天空穹顶
      const skyGeometry = new THREE.SphereGeometry(500, 60, 40);
      skyGeometry.scale(-1, 1, 1); // 将几何体内表面朝外
      
      const skyUniforms = {
        turbidity: { value: 10 },
        rayleigh: { value: 2 },
        mieCoefficient: { value: 0.005 },
        mieDirectionalG: { value: 0.8 },
        sunPosition: { value: new THREE.Vector3(0, 1, 0) },
        moonPosition: { value: new THREE.Vector3(0, -1, 0) },
        dayNightMix: { value: 0 } // 0是白天，1是夜晚
      };
      
      const skyMaterial = new THREE.ShaderMaterial({
        uniforms: skyUniforms,
        vertexShader: `
          varying vec3 vWorldPosition;
          void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vWorldPosition = worldPosition.xyz;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 sunPosition;
          uniform vec3 moonPosition;
          uniform float turbidity;
          uniform float rayleigh;
          uniform float mieCoefficient;
          uniform float mieDirectionalG;
          uniform float dayNightMix;
          
          varying vec3 vWorldPosition;
          
          // 基于Three.js Sky着色器修改
          vec3 calculateDaySky(vec3 direction) {
            // 大气散射计算
            float sunfade = 1.0 - clamp(1.0 - exp((sunPosition.y / 450000.0)), 0.0, 1.0);
            float rayleighCoefficient = rayleigh - (1.0 * (1.0 - sunfade));
            vec3 sunDirection = normalize(sunPosition);
            
            // 散射常量
            const vec3 betaR = vec3(3.8e-6, 13.5e-6, 33.1e-6);
            const vec3 betaM = vec3(21e-6);
            
            // 计算光学深度
            float zenithAngle = acos(max(0.0, dot(vec3(0, 1, 0), direction)));
            float denom = cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / 3.14159265), -1.253);
            float sR = rayleighCoefficient * (1.0 / denom);
            float sM = mieCoefficient * (1.0 / denom);
            
            // 计算太阳和观察方向的夹角
            float cosTheta = dot(direction, sunDirection);
            float rPhase = 0.0596831 * (1.0 + cosTheta * cosTheta);
            vec3 betaRTheta = betaR * rPhase;
            float mPhase = 1.0 / (4.0 * 3.14159265) * ((1.0 - mieDirectionalG * mieDirectionalG) / pow(1.0 - 2.0 * mieDirectionalG * cosTheta + mieDirectionalG * mieDirectionalG, 1.5));
            vec3 betaMTheta = betaM * mPhase;
            
            // 计算散射颜色
            vec3 Lin = pow(vec3(1.0) - exp(-vec3(sR) * betaR - vec3(sM) * betaM), vec3(1.0));
            vec3 Fex = exp(-(betaRTheta + betaMTheta));
            vec3 sunE = 20000.0 * Fex;
            
            // 天空颜色
            vec3 sky = 1.0 - exp(-1.0 * Lin);
            vec3 sunColor = sun(cosTheta, turbidity) * sunE;
            
            // 最终天空颜色
            vec3 finalColor = mix(
              (sky * (1.0 - Fex) + sunColor) * 0.5 + 0.5 * mix(sky, vec3(0.1, 0.2, 0.4), direction.y * 0.5 + 0.5),
              vec3(0.0),
              sunfade
            );
            
            return finalColor;
          }
          
          // 太阳颜色计算
          vec3 sun(float cosTheta, float turbidity) {
            float A = -0.1 * turbidity - 0.2;
            float B = 0.09 * turbidity + 0.3;
            float C = -0.5;
            float D = 1.0;
            float E = -0.8;
            float F = 0.15;
            
            return max(vec3(0), 100.0 * (A + B * exp(C * cosTheta)) * exp(D * cosTheta) + E + F * turbidity);
          }
          
          // 夜空颜色计算
          vec3 calculateNightSky(vec3 direction) {
            // 基础夜空颜色 - 深蓝色
            vec3 nightColor = vec3(0.02, 0.03, 0.08);
            
            // 月亮方向和大小
            vec3 moonDir = normalize(moonPosition);
            float moonDot = dot(direction, moonDir);
            float moonSize = 0.997;
            float moonGlow = smoothstep(0.9, 0.98, moonDot);
            
            // 月亮颜色
            vec3 moonColor = vec3(0.8, 0.8, 0.7) * step(moonSize, moonDot);
            
            // 月亮光晕
            vec3 moonGlowColor = vec3(0.1, 0.1, 0.2) * moonGlow;
            
            // 添加简单的星星
            float stars = pow(max(0.0, dot(direction, vec3(sin(direction.z * 100.0), sin(direction.x * 100.0), sin(direction.y * 100.0)))), 20.0) * 0.5;
            
            // 最终夜空颜色
            return nightColor + moonColor + moonGlowColor + stars * vec3(1.0);
          }
          
          void main() {
            vec3 direction = normalize(vWorldPosition);
            
            // 计算白天和夜晚的天空颜色
            vec3 dayColor = calculateDaySky(direction);
            vec3 nightColor = calculateNightSky(direction);
            
            // 混合白天和夜晚
            vec3 color = mix(dayColor, nightColor, dayNightMix);
            
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        side: THREE.BackSide
      });
      
      skyDome = new THREE.Mesh(skyGeometry, skyMaterial);
      scene.add(skyDome);
      
      // 创建星星
      const starsGeometry = new THREE.BufferGeometry();
      const starsCount = 3000;
      const starsPositions = new Float32Array(starsCount * 3);
      const starsColors = new Float32Array(starsCount * 3);
      
      for (let i = 0; i < starsCount; i++) {
        const i3 = i * 3;
        // 随机位置，但确保在天空穹顶下方
        const radius = 450 + Math.random() * 50;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        starsPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        starsPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        starsPositions[i3 + 2] = radius * Math.cos(phi);
        
        // 星星颜色 - 白色到浅蓝色
        starsColors[i3] = 0.8 + Math.random() * 0.2;
        starsColors[i3 + 1] = 0.8 + Math.random() * 0.2;
        starsColors[i3 + 2] = 0.9 + Math.random() * 0.1;
      }
      
      starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
      starsGeometry.setAttribute('color', new THREE.BufferAttribute(starsColors, 3));
      
      const starsMaterial = new THREE.PointsMaterial({
        size: 1.5,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending
      });
      
      stars = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(stars);
      
      // 设置光照
      // 太阳光
      sunLight = new THREE.DirectionalLight(0xffffeb, 1.5);
      sunLight.position.set(50, 100, 50);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048;
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 500;
      sunLight.shadow.camera.left = -150;
      sunLight.shadow.camera.right = 150;
      sunLight.shadow.camera.top = 150;
      sunLight.shadow.camera.bottom = -150;
      sunLight.shadow.bias = -0.0005;
      scene.add(sunLight);
      
      // 月光
      moonLight = new THREE.DirectionalLight(0x8090b5, 0.15);
      moonLight.position.set(-50, -100, -50);
      moonLight.castShadow = true;
      moonLight.shadow.mapSize.width = 1024;
      moonLight.shadow.mapSize.height = 1024;
      moonLight.shadow.camera.near = 0.5;
      moonLight.shadow.camera.far = 500;
      moonLight.shadow.camera.left = -150;
      moonLight.shadow.camera.right = 150;
      moonLight.shadow.camera.top = 150;
      moonLight.shadow.camera.bottom = -150;
      moonLight.shadow.bias = -0.0005;
      scene.add(moonLight);
      
      // 环境光 - 白天
      hemisphereLightDay = new THREE.HemisphereLight(0x8dc1de, 0x3d5f42, 1);
      scene.add(hemisphereLightDay);
      
      // 环境光 - 夜晚
      hemisphereLightNight = new THREE.HemisphereLight(0x050d16, 0x050505, 0.3);
      hemisphereLightNight.intensity = 0;
      scene.add(hemisphereLightNight);
    };
    
    // 创建地形
    const createTerrain = () => {
      const size = 200;
      const resolution = 200;
      const geometry = new THREE.PlaneGeometry(size, size, resolution, resolution);
      geometry.rotateX(-Math.PI / 2);
      
      // 使用更复杂的Perlin噪声模拟地形
      const generateHeight = (x, y) => {
        // 简化的Perlin噪声实现
        const noise = (x, y) => {
          // 多层噪声混合创建复杂地形
          const scale1 = 0.01;
          const scale2 = 0.05;
          const scale3 = 0.002;
          
          const n1 = Math.sin(x * scale1) * Math.cos(y * scale1) * 10;
          const n2 = Math.sin(x * scale2 + 5) * Math.cos(y * scale2) * 2;
          const n3 = Math.cos(Math.sqrt(x*x + y*y) * scale3) * 15; // 环形山脉
          
          // 添加山谷和山峰
          let height = n1 + n2 + n3;
          
          // 添加平原区域
          const distFromCenter = Math.sqrt(x*x + y*y);
          if (distFromCenter > 70 && distFromCenter < 85) {
            height = height * 0.3; // 平坦区域
          }
          
          // 水域区域
          if (distFromCenter < 30) {
            height = Math.min(height, -2); // 确保是凹陷的
          }
          
          // 添加随机小变化
          height += Math.sin(x * 0.5) * Math.cos(y * 0.5) * 0.5;
          
          return height;
        };
        
        return noise(x, y);
      };
      
      // 应用高度变化
      const positions = geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const z = positions[i + 2];
        positions[i + 1] = generateHeight(x, z);
      }
      
      // 更新法线以便正确的光照
      geometry.computeVertexNormals();
      
      // 创建地形材质
      const terrainMaterial = new THREE.MeshStandardMaterial({
        // 使用顶点着色实现地形着色
        vertexColors: true,
        roughness: 0.8,
        metalness: 0.1,
        flatShading: false
      });
      
      // 添加顶点颜色
      const count = geometry.attributes.position.count;
      const colors = new Float32Array(count * 3);
      
      for (let i = 0; i < count; i++) {
        const x = geometry.attributes.position.array[i * 3];
        const y = geometry.attributes.position.array[i * 3 + 1];
        const z = geometry.attributes.position.array[i * 3 + 2];
        
        // 根据高度和位置设置颜色
        if (y < -1) {
          // 水下
          colors[i * 3] = 0.2;
          colors[i * 3 + 1] = 0.3;
          colors[i * 3 + 2] = 0.4;
        } else if (y < 0.5) {
          // 沙滩
          colors[i * 3] = 0.76;
          colors[i * 3 + 1] = 0.7;
          colors[i * 3 + 2] = 0.5;
        } else if (y < 5) {
          // 草地
          colors[i * 3] = 0.2;
          colors[i * 3 + 1] = 0.5;
          colors[i * 3 + 2] = 0.2;
        } else if (y < 12) {
          // 山坡
          colors[i * 3] = 0.4;
          colors[i * 3 + 1] = 0.4;
          colors[i * 3 + 2] = 0.3;
        } else {
          // 雪山
          colors[i * 3] = 0.9;
          colors[i * 3 + 1] = 0.9;
          colors[i * 3 + 2] = 0.95;
        }
        
        // 添加噪声
        const noise = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.05;
        colors[i * 3] += noise;
        colors[i * 3 + 1] += noise;
        colors[i * 3 + 2] += noise;
      }
      
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      // 创建地形网格
      terrain = new THREE.Mesh(geometry, terrainMaterial);
      terrain.receiveShadow = true;
      scene.add(terrain);
      
      // 保存地形数据以便其他函数使用
      terrain.userData.heightFunc = generateHeight;
    };
    
    // 创建水面
    const createWater = () => {
      const waterGeometry = new THREE.PlaneGeometry(200, 200, 10, 10);
      waterGeometry.rotateX(-Math.PI / 2);
      
      // 创建水面材质
      const waterMaterial = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new THREE.Color(0x0055aa) },
          sunDirection: { value: new THREE.Vector3(0, 1, 0) },
          cameraPosition: { value: new THREE.Vector3() },
          dayNightMix: { value: 0 }
        },
        vertexShader: `
          uniform float time;
          varying vec3 vPosition;
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            vPosition = position;
            
            // 添加波浪效果
            float wave1 = sin(position.x * 0.05 + time * 0.5) * sin(position.z * 0.05 + time * 0.5) * 0.5;
            float wave2 = sin(position.x * 0.1 + time * 0.7) * sin(position.z * 0.1 + time * 0.7) * 0.25;
            float height = wave1 + wave2;
            
            vec3 newPosition = position;
            newPosition.y = -2.0 + height;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color;
          uniform vec3 sunDirection;
          uniform vec3 cameraPosition;
          uniform float dayNightMix;
          
          varying vec3 vPosition;
          varying vec2 vUv;
          
          void main() {
            // 基础水颜色
            vec3 waterColor = color;
            
            // 日夜混合
            vec3 nightWaterColor = vec3(0.0, 0.05, 0.15);
            waterColor = mix(waterColor, nightWaterColor, dayNightMix);
            
            // 深度变化
            float depth = 1.0 - exp(-abs(vPosition.y + 2.0) * 0.3);
            waterColor = mix(waterColor, waterColor * 0.5, depth);
            
            // 水面反光
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float fresnel = pow(1.0 - max(0.0, dot(viewDirection, vec3(0.0, 1.0, 0.0))), 4.0);
            
            // 日夜反光颜色
            vec3 daySpecular = vec3(1.0, 1.0, 0.9);
            vec3 nightSpecular = vec3(0.6, 0.6, 0.8);
            vec3 specularColor = mix(daySpecular, nightSpecular, dayNightMix);
            
            // 最终颜色
            vec3 finalColor = mix(waterColor, specularColor, fresnel * 0.7);
            
            gl_FragColor = vec4(finalColor, 0.85);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      
      waterSurface = new THREE.Mesh(waterGeometry, waterMaterial);
      waterSurface.position.y = -2.0;
      waterShader = waterMaterial;
      scene.add(waterSurface);
    };
    
    // 创建植被
    const createVegetation = () => {
      // 创建树木
      const createTree = (x, y, z) => {
        const treeGroup = new THREE.Group();
        
        // 树干
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 2 + Math.random(), 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
          color: 0x8B4513,
          roughness: 0.9,
          metalness: 0.1,
          flatShading: true
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        trunk.position.y = 1;
        treeGroup.add(trunk);
        
        // 树枝 - 更复杂的形状
        const branchesGroup = new THREE.Group();
        trunk.add(branchesGroup);
        branchesGroup.position.y = 0.8;
        
        // 添加随机树枝
        const addBranch = (parent, direction, length, thickness) => {
          if (length < 0.3) return;
          
          const branchGeometry = new THREE.CylinderGeometry(
            thickness * 0.7, 
            thickness, 
            length, 
            5
          );
          branchGeometry.translate(0, length / 2, 0);
          
          const branchMaterial = new THREE.MeshStandardMaterial({
            color: 0x6e4530,
            roughness: 0.9,
            flatShading: true
          });
          
          const branch = new THREE.Mesh(branchGeometry, branchMaterial);
          branch.castShadow = true;
          
          // 设置分支方向
          branch.lookAt(direction);
          parent.add(branch);
          
          // 位置调整
          branch.position.y = parent === branchesGroup ? 0 : length * 0.8;
          
          // 生成子分支
          if (length > 0.6 && Math.random() > 0.3) {
            for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
              const newDirection = new THREE.Vector3(
                direction.x + (Math.random() - 0.5) * 2,
                direction.y + (Math.random() - 0.5) * 0.5 + 0.5,
                direction.z + (Math.random() - 0.5) * 2
              );
              
              addBranch(
                branch, 
                newDirection, 
                length * (0.5 + Math.random() * 0.3), 
                thickness * 0.7);
            }
          }
          
          // 添加树叶
          if (length < 0.8) {
            const leavesGeometry = new THREE.SphereGeometry(
              length * (1 + Math.random() * 0.5),
              8,
              8
            );
            
            const leavesColor = Math.random() > 0.2 
              ? new THREE.Color(0.2 + Math.random() * 0.1, 0.5 + Math.random() * 0.2, 0.1 + Math.random() * 0.1)
              : new THREE.Color(0.6 + Math.random() * 0.2, 0.3 + Math.random() * 0.2, 0.1);
            
            const leavesMaterial = new THREE.MeshStandardMaterial({
              color: leavesColor,
              roughness: 0.8,
              flatShading: true
            });
            
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.castShadow = true;
            leaves.position.y = length * 0.3;
            branch.add(leaves);
            
            // 添加树叶动画数据
            leaves.userData.windFactor = Math.random() * 0.2 + 0.05;
            leaves.userData.originalPosition = leaves.position.clone();
            leaves.userData.originalScale = leaves.scale.clone();
          }
        };
        
        // 添加主树枝
        const branchCount = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < branchCount; i++) {
          const direction = new THREE.Vector3(
            (Math.random() - 0.5) * 3,
            1 + Math.random() * 2,
            (Math.random() - 0.5) * 3
          );
          
          addBranch(
            branchesGroup,
            direction,
            1 + Math.random() * 0.5,
            0.15 + Math.random() * 0.1
          );
        }
        
        // 定位树
        treeGroup.position.set(x, y, z);
        
        // 添加一点随机旋转和缩放
        treeGroup.rotation.y = Math.random() * Math.PI * 2;
        const scale = 0.6 + Math.random() * 0.8;
        treeGroup.scale.set(scale, scale, scale);
        
        scene.add(treeGroup);
        return treeGroup;
      };
      
      // 创建草丛
      const createGrass = (x, y, z) => {
        const grassGroup = new THREE.Group();
        const grassCount = 5 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < grassCount; i++) {
          // 草叶几何体 - 使用平面
          const grassGeometry = new THREE.PlaneGeometry(
            0.1 + Math.random() * 0.2,
            0.3 + Math.random() * 0.5
          );
          
          // 底部顶点固定，顶部顶点分散
          const positions = grassGeometry.attributes.position.array;
          for (let j = 0; j < positions.length; j += 3) {
            // 仅修改顶部顶点
            if (positions[j + 1] > 0) {
              positions[j] += (Math.random() - 0.5) * 0.1;
              positions[j + 2] += (Math.random() - 0.5) * 0.1;
            }
          }
          
          grassGeometry.computeVertexNormals();
          
          // 草的材质
          const grassColor = Math.random() > 0.3 
            ? new THREE.Color(0.2 + Math.random() * 0.2, 0.5 + Math.random() * 0.3, 0.1 + Math.random() * 0.1)
            : new THREE.Color(0.6 + Math.random() * 0.2, 0.6 + Math.random() * 0.2, 0.1 + Math.random() * 0.1);
            
          const grassMaterial = new THREE.MeshStandardMaterial({
            color: grassColor,
            side: THREE.DoubleSide,
            roughness: 0.8
          });
          
          const blade = new THREE.Mesh(grassGeometry, grassMaterial);
          blade.castShadow = true;
          
          // 定位和旋转
          blade.position.set(
            (Math.random() - 0.5) * 0.5,
            0,
            (Math.random() - 0.5) * 0.5
          );
          
          blade.rotation.y = Math.random() * Math.PI;
          blade.rotation.x = Math.random() * 0.2;
          blade.rotation.z = Math.random() * 0.1;
          
          // 添加草动画数据
          blade.userData.windFactor = Math.random() * 0.2 + 0.1;
          blade.userData.originalRotation = blade.rotation.clone();
          
          grassGroup.add(blade);
        }
        
        grassGroup.position.set(x, y, z);
        scene.add(grassGroup);
        return grassGroup;
      };
      
      // 根据地形放置树木和草丛
      const placeVegetation = () => {
        // 清除之前的植被
        trees.forEach(tree => scene.remove(tree));
        trees = [];
        
        // 放置树木
        const treeCount = 80;
        for (let i = 0; i < treeCount; i++) {
          // 随机位置
          const x = (Math.random() - 0.5) * 180;
          const z = (Math.random() - 0.5) * 180;
          
          // 在水面以上的地方放置树木
          const y = terrain.userData.heightFunc(x, z);
          
          // 只在特定高度范围内放置树木
          if (y > 0 && y < 10) {
            // 避免水边和陡峭区域
            const heightDiff = Math.abs(
              terrain.userData.heightFunc(x + 1, z) - 
              terrain.userData.heightFunc(x - 1, z)
            ) + Math.abs(
              terrain.userData.heightFunc(x, z + 1) - 
              terrain.userData.heightFunc(x, z - 1)
            );
            
            if (heightDiff < 2) {
              const tree = createTree(x, y, z);
              trees.push(tree);
              
              // 在树周围放置一些草丛
              if (Math.random() > 0.5) {
                for (let j = 0; j < 2 + Math.floor(Math.random() * 3); j++) {
                  const grassX = x + (Math.random() - 0.5) * 3;
                  const grassZ = z + (Math.random() - 0.5) * 3;
                  const grassY = terrain.userData.heightFunc(grassX, grassZ);
                  createGrass(grassX, grassY, grassZ);
                }
              }
            }
          }
        }
        
        // 放置额外的草丛
        const grassCount = 150;
        for (let i = 0; i < grassCount; i++) {
          const x = (Math.random() - 0.5) * 180;
          const z = (Math.random() - 0.5) * 180;
          const y = terrain.userData.heightFunc(x, z);
          
          if (y > 0 && y < 8) {
            createGrass(x, y, z);
          }
        }
      };
      
      placeVegetation();
    };
    
    // 创建建筑物
    const createBuildings = () => {
      // 清除之前的建筑
      buildings.forEach(building => scene.remove(building));
      buildings = [];
      
      // 创建一个建筑
      const createBuilding = (x, y, z, size) => {
        const buildingGroup = new THREE.Group();
        
        // 随机决定建筑类型
        const type = Math.floor(Math.random() * 3);
        
        if (type === 0) {
          // 现代风格建筑
          const height = 2 + Math.random() * 5;
          
          // 主体
          const bodyGeometry = new THREE.BoxGeometry(
            size.x, 
            height, 
            size.z
          );
          
          const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            roughness: 0.7,
            metalness: 0.3
          });
          
          const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
          body.position.y = height / 2;
          body.castShadow = true;
          body.receiveShadow = true;
          buildingGroup.add(body);
          
          // 窗户
          const windowCount = {
            x: Math.floor(size.x * 1.5),
            z: Math.floor(size.z * 1.5)
          };
          
          const windowSize = {
            width: size.x / windowCount.x * 0.7,
            height: 0.5,
            depth: 0.05
          };
          
          const windowGeometry = new THREE.BoxGeometry(
            windowSize.width,
            windowSize.height,
            windowSize.depth
          );
          
          const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0x88ccff,
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0x114466,
            emissiveIntensity: 0.5
          });
          
          // 添加窗户到每一面
          const floorCount = Math.floor(height / 0.8);
          
          for (let floor = 0; floor < floorCount; floor++) {
            const floorY = floor * 0.8 + 0.8;
            
            // 前面窗户
            for (let wx = 0; wx < windowCount.x; wx++) {
              const window = new THREE.Mesh(windowGeometry, windowMaterial);
              window.position.set(
                (wx / windowCount.x - 0.5) * size.x + size.x / windowCount.x / 2,
                floorY,
                size.z / 2 + 0.03
              );
              body.add(window);
            }
            
            // 后面窗户
            for (let wx = 0; wx < windowCount.x; wx++) {
              const window = new THREE.Mesh(windowGeometry, windowMaterial);
              window.position.set(
                (wx / windowCount.x - 0.5) * size.x + size.x / windowCount.x / 2,
                floorY,
                -size.z / 2 - 0.03
              );
              body.add(window);
            }
            
            // 左侧窗户
            for (let wz = 0; wz < windowCount.z; wz++) {
              const window = new THREE.Mesh(windowGeometry, windowMaterial);
              window.position.set(
                -size.x / 2 - 0.03,
                floorY,
                (wz / windowCount.z - 0.5) * size.z + size.z / windowCount.z / 2
              );
              window.rotation.y = Math.PI / 2;
              body.add(window);
            }
            
            // 右侧窗户
            for (let wz = 0; wz < windowCount.z; wz++) {
              const window = new THREE.Mesh(windowGeometry, windowMaterial);
              window.position.set(
                size.x / 2 + 0.03,
                floorY,
                (wz / windowCount.z - 0.5) * size.z + size.z / windowCount.z / 2
              );
              window.rotation.y = Math.PI / 2;
              body.add(window);
            }
          }
          
          // 屋顶
          const roofGeometry = new THREE.BoxGeometry(
            size.x + 0.2, 
            0.2, 
            size.z + 0.2
          );
          
          const roofMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.9
          });
          
          const roof = new THREE.Mesh(roofGeometry, roofMaterial);
          roof.position.y = height + 0.1;
          roof.castShadow = true;
          buildingGroup.add(roof);
          
        } else if (type === 1) {
          // 传统建筑 - 尖顶
          const height = 1.5 + Math.random() * 3;
          
          // 主体
          const bodyGeometry = new THREE.BoxGeometry(
            size.x, 
            height, 
            size.z
          );
          
          const bodyMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0.7 + Math.random() * 0.3, 0.5 + Math.random() * 0.2, 0.3 + Math.random() * 0.2),
            roughness: 0.9,
            metalness: 0.1
          });
          
          const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
          body.position.y = height / 2;
          body.castShadow = true;
          body.receiveShadow = true;
          buildingGroup.add(body);
          
          // 尖顶
          const roofHeight = 1 + Math.random() * 2;
          const roofGeometry = new THREE.ConeGeometry(
            Math.sqrt(size.x * size.x + size.z * size.z) / 2 * 1.2,
            roofHeight,
            4
          );
          
          const roofMaterial = new THREE.MeshStandardMaterial({
            color: 0x993333,
            roughness: 0.8
          });
          
          const roof = new THREE.Mesh(roofGeometry, roofMaterial);
          roof.position.y = height + roofHeight / 2;
          roof.rotation.y = Math.PI / 4;
          roof.castShadow = true;
          buildingGroup.add(roof);
          
          // 门
          const doorGeometry = new THREE.PlaneGeometry(0.8, 1.2);
          const doorMaterial = new THREE.MeshStandardMaterial({
            color: 0x663300,
            side: THREE.DoubleSide,
            roughness: 0.9
          });
          
          const door = new THREE.Mesh(doorGeometry, doorMaterial);
          door.position.set(0, 0.6, size.z / 2 + 0.01);
          buildingGroup.add(door);
          
          // 窗户
          const windowGeometry = new THREE.PlaneGeometry(0.6, 0.6);
          const windowMaterial = new THREE.MeshStandardMaterial({
            color: 0xaaccee,
            side: THREE.DoubleSide,
            roughness: 0.3,
            metalness: 0.5
          });
          
          const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
          window1.position.set(-size.x / 4, height / 2, size.z / 2 + 0.01);
          buildingGroup.add(window1);
          
          const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
          window2.position.set(size.x / 4, height / 2, size.z / 2 + 0.01);
          buildingGroup.add(window2);
          
        } else {
          // 工业建筑
          const height = 3 + Math.random() * 4;
          
          // 主体
          const bodyGeometry = new THREE.BoxGeometry(
            size.x, 
            height, 
            size.z
          );
          
          const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x888888,
            roughness: 0.7,
            metalness: 0.4
          });
          
          const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
          body.position.y = height / 2;
          body.castShadow = true;
          body.receiveShadow = true;
          buildingGroup.add(body);
          
          // 烟囱
          if (Math.random() > 0.5) {
            const chimneyHeight = 2 + Math.random() * 3;
            const chimneyRadius = 0.3 + Math.random() * 0.3;
            const chimneyGeometry = new THREE.CylinderGeometry(
              chimneyRadius,
              chimneyRadius,
              chimneyHeight,
              8
            );
            
            const chimneyMaterial = new THREE.MeshStandardMaterial({
              color: 0x555555,
              roughness: 0.8
            });
            
            const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
            chimney.position.set(
              (Math.random() - 0.5) * size.x * 0.6,
              height + chimneyHeight / 2,
              (Math.random() - 0.5) * size.z * 0.6
            );
            chimney.castShadow = true;
            buildingGroup.add(chimney);
          }
          
          // 简单的窗户
          const windowRows = Math.floor(height * 0.6);
          for (let row = 0; row < windowRows; row++) {
            const y = height * (row + 1) / (windowRows + 1);
            
            for (let side = 0; side < 4; side++) {
              const windowCount = Math.floor((side % 2 === 0 ? size.x : size.z) / 0.8);
              
              for (let w = 0; w < windowCount; w++) {
                const windowGeometry = new THREE.PlaneGeometry(0.5, 0.5);
                const windowMaterial = new THREE.MeshStandardMaterial({
                  color: 0x555555,
                  side: THREE.DoubleSide,
                  roughness: 0.5,
                  metalness: 0.5
                });
                
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                
                if (side === 0) {
                  window.position.set(
                    (w / windowCount - 0.5) * size.x + size.x / windowCount / 2,
                    y,
                    size.z / 2 + 0.01
                  );
                } else if (side === 1) {
                  window.position.set(
                    size.x / 2 + 0.01,
                    y,
                    (w / windowCount - 0.5) * size.z + size.z / windowCount / 2
                  );
                  window.rotation.y = Math.PI / 2;
                } else if (side === 2) {
                  window.position.set(
                    (w / windowCount - 0.5) * size.x + size.x / windowCount / 2,
                    y,
                    -size.z / 2 - 0.01
                  );
                  window.rotation.y = Math.PI;
                } else {
                  window.position.set(
                    -size.x / 2 - 0.01,
                    y,
                    (w / windowCount - 0.5) * size.z + size.z / windowCount / 2
                  );
                  window.rotation.y = -Math.PI / 2;
                }
                
                buildingGroup.add(window);
              }
            }
          }
        }
        
        // 定位建筑
        buildingGroup.position.set(x, y, z);
        
        // 稍微随机旋转
        buildingGroup.rotation.y = Math.random() * Math.PI * 2;
        
        scene.add(buildingGroup);
        buildings.push(buildingGroup);
        return buildingGroup;
      };
      
      // 创建村庄/城镇
      const createSettlement = (centerX, centerZ, buildingCount) => {
        const centerY = terrain.userData.heightFunc(centerX, centerZ);
        
        // 确保中心在地面上方
        if (centerY < 0) return;
        
        // 创建多个建筑
        for (let i = 0; i < buildingCount; i++) {
          // 随机位置 - 聚集在中心周围
          const distance = Math.random() * 15;
          const angle = Math.random() * Math.PI * 2;
          const x = centerX + Math.cos(angle) * distance;
          const z = centerZ + Math.sin(angle) * distance;
          const y = terrain.userData.heightFunc(x, z);
          
          // 确保建筑在地面上
          if (y < 0) continue;
          
          // 建筑大小
          const size = {
            x: 2 + Math.random() * 2,
            z: 2 + Math.random() * 2
          };
          
          createBuilding(x, y, z, size);
        }
      };
      
      // 创建几个村庄
      createSettlement(-30, 40, 8);  // 左上村庄
      createSettlement(40, -20, 12); // 右下村庄
      createSettlement(-10, -40, 5); // 底部小村庄
      
      // 创建一个工业区
      createSettlement(50, 30, 6);
    };
    
    // 创建岩石
    const createRocks = () => {
      // 清除之前的岩石
      rocks.forEach(rock => scene.remove(rock));
      rocks = [];
      
      const createRock = (x, y, z, size) => {
        const rockGeometry = new THREE.DodecahedronGeometry(size, 1);
        
        // 变形顶点创建不规则形状
        const positions = rockGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += (Math.random() - 0.5) * size * 0.3;
          positions[i + 1] += (Math.random() - 0.5) * size * 0.3;
          positions[i + 2] += (Math.random() - 0.5) * size * 0.3;
        }
        
        rockGeometry.computeVertexNormals();
        
        const rockMaterial = new THREE.MeshStandardMaterial({
          color: new THREE.Color(
            0.4 + Math.random() * 0.2,
            0.4 + Math.random() * 0.2,
            0.4 + Math.random() * 0.2
          ),
          roughness: 0.9,
          metalness: 0.1,
          flatShading: true
        });
        
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.castShadow = true;
        rock.receiveShadow = true;
        
        rock.position.set(x, y, z);
        
        // 随机旋转
        rock.rotation.x = Math.random() * Math.PI;
        rock.rotation.y = Math.random() * Math.PI;
        rock.rotation.z = Math.random() * Math.PI;
        
        scene.add(rock);
        rocks.push(rock);
        return rock;
      };
      
      // 创建散落的岩石
      for (let i = 0; i < 100; i++) {
        const x = (Math.random() - 0.5) * 180;
        const z = (Math.random() - 0.5) * 180;
        const y = terrain.userData.heightFunc(x, z);
        
        // 在高处或水面以上放置岩石
        if (y > 0) {
          // 随机大小
          const size = 0.5 + Math.random() * 1.5;
          createRock(x, y, z, size);
        }
      }
      
      // 创建岩石堆
      for (let i = 0; i < 5; i++) {
        const clusterX = (Math.random() - 0.5) * 150;
        const clusterZ = (Math.random() - 0.5) * 150;
        const y = terrain.userData.heightFunc(clusterX, clusterZ);
        
        if (y > 5) { // 在山上创建岩石堆
          const rockCount = 5 + Math.floor(Math.random() * 8);
          
          for (let j = 0; j < rockCount; j++) {
            const offsetX = (Math.random() - 0.5) * 5;
            const offsetZ = (Math.random() - 0.5) * 5;
            const rockX = clusterX + offsetX;
            const rockZ = clusterZ + offsetZ;
            const rockY = terrain.userData.heightFunc(rockX, rockZ);
            
            const size = 1 + Math.random() * 2;
            createRock(rockX, rockY, rockZ, size);
          }
        }
      }
    };
    
    // 创建云层
    const createClouds = () => {
      // 创建单个云
      const createCloud = (x, y, z) => {
        const cloudGroup = new THREE.Group();
        
        // 创建多个重叠的云朵部分
        const partCount = 3 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < partCount; i++) {
          const geometry = new THREE.SphereGeometry(
            1 + Math.random() * 2, 
            8, 
            8
          );
          
          const material = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0x333333,
            transparent: true,
            opacity: 0.7 + Math.random() * 0.2,
            roughness: 1.0
          });
          
          const part = new THREE.Mesh(geometry, material);
          
          // 定位
          part.position.set(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 3
          );
          
          // 变形为更扁平的形状
          part.scale.y = 0.4 + Math.random() * 0.3;
          
          cloudGroup.add(part);
        }
        
        // 定位整个云
        cloudGroup.position.set(x, y, z);
        
        // 随机缩放
        const scale = 1 + Math.random() * 3;
        cloudGroup.scale.set(scale, scale * 0.7, scale);
        
        // 添加动画数据
        cloudGroup.userData.speed = 0.05 + Math.random() * 0.1;
        cloudGroup.userData.rotationSpeed = (Math.random() - 0.5) * 0.005;
        
        scene.add(cloudGroup);
        clouds.push(cloudGroup);
        return cloudGroup;
      };
      
      // 创建云层
      for (let i = 0; i < 20; i++) {
        const x = (Math.random() - 0.5) * 300;
        const z = (Math.random() - 0.5) * 300;
        const y = 40 + Math.random() * 30;
        
        createCloud(x, y, z);
      }
    };
    
    // 创建无人机路径
    const createPath = () => {
      // 定义路径点 - 更复杂的巡视路径
      pathPoints = [
        new THREE.Vector3(-50, 15, -50),    // 起点
        new THREE.Vector3(-40, 12, -30),    // 经过村庄1
        new THREE.Vector3(-30, 8, -10),
        new THREE.Vector3(-20, 17, 10),     // 爬升通过山脉
        new THREE.Vector3(-10, 22, 20),     // 山顶
        new THREE.Vector3(-5, 15, 30),      // 下降
        new THREE.Vector3(10, 10, 40),
        new THREE.Vector3(30, 8, 30),       // 接近村庄2
        new THREE.Vector3(40, 6, 20),
        new THREE.Vector3(45, 5, 0),        // 转向
        new THREE.Vector3(35, 4, -20),
        new THREE.Vector3(15, 3, -30),      // 低空飞行
        new THREE.Vector3(0, 12, -45),      // 快速上升
        new THREE.Vector3(-20, 15, -40),
        new THREE.Vector3(-30, 10, -30),
        new THREE.Vector3(-40, 12, -40),
        new THREE.Vector3(-50, 15, -50)     // 回到起点
      ];
      
      // 创建平滑曲线 - 紧张曲线可以创建更激烈的飞行轨迹
      pathCurve = new THREE.CatmullRomCurve3(pathPoints, true, 'catmullrom', 0.5);
      
      // 创建路径可视化器
      // 创建空的容器
      pathVisualizer = new THREE.Group();
      scene.add(pathVisualizer);
      
      // 创建管道几何体表示路径
      const tubeGeometry = new THREE.TubeGeometry(
        pathCurve,
        500,        // 细分段数
        0.2,        // 管道半径
        8,          // 管道截面细分数
        true        // 是否闭合
      );
      
      const tubeMaterial = new THREE.MeshStandardMaterial({
        color: 0x00ff88,
        transparent: true,