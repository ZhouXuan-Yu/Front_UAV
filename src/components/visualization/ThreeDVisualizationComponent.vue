/**
 * 文件名: ThreeDVisualizationComponent.vue
 * 描述: 3D数据可视化组件
 * 在项目中的作用:
 * - 提供交互式3D数据可视化
 * - 支持地理空间数据和时间序列
 * - 支持热力图、表面图和时间轴动画
 */

<template>
  <div class="three-d-visualization-container">
    <div v-if="loading" class="visualization-loading">
      <div class="loading-spinner"></div>
      <span>加载可视化...</span>
    </div>
    
    <div v-else-if="error" class="visualization-error">
      <span>{{ error }}</span>
    </div>
    
    <div v-else ref="container" class="visualization-container"></div>
    
    <div class="visualization-controls">
      <div class="control-label">{{ visualizationType === 'heatmap' ? '热力图' : visualizationType === 'surface' ? '表面图' : '时间动画' }}</div>
      
      <div v-if="visualizationType === 'timeAnimation'" class="time-controls">
        <button 
          @click="isAnimating = !isAnimating" 
          class="control-button"
        >
          {{ isAnimating ? '暂停' : '播放' }}
        </button>
        <div class="time-indicator">
          帧: {{ timeIndex + 1 }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { useVisualizationStore } from '@/store/visualization';

// 定义组件属性
const props = defineProps({
  // 可视化类型: 'heatmap', 'surface', 'timeAnimation'
  visualizationType: {
    type: String,
    default: 'heatmap'
  },
  // 数据源
  dataSource: {
    type: Array,
    default: () => []
  },
  // 配色方案
  colorScheme: {
    type: String,
    default: 'blue'
  },
  // 时间轴动画步长（毫秒）
  timeStep: {
    type: Number,
    default: 500
  }
});

// 初始化状态
const container = ref<HTMLElement | null>(null);
const loading = ref(true);
const error = ref('');
const isAnimating = ref(false);
const timeIndex = ref(0);

// 使用Pinia存储
const visualizationStore = useVisualizationStore();

// Three.js变量
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;
let visualizationObject: THREE.Object3D | null = null;
let animationId: number | null = null;

// 初始化3D场景
const initScene = () => {
  if (!container.value) return;

  try {
    // 创建场景
    scene = new THREE.Scene();
    // @ts-ignore
    scene.background = new THREE.Color(0x0a1929);

    // 创建相机
    const width = container.value.clientWidth;
    const height = container.value.clientHeight;
    // @ts-ignore
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    // @ts-ignore
    camera.position.z = 5;

    // 创建渲染器
    // @ts-ignore
    renderer = new THREE.WebGLRenderer({ antialias: true });
    // @ts-ignore
    renderer.setSize(width, height);
    // @ts-ignore
    container.value.appendChild(renderer.domElement);

    // 添加轨道控制
    // @ts-ignore
    controls = new OrbitControls(camera, renderer.domElement);
    // @ts-ignore
    controls.enableDamping = true;
    // @ts-ignore
    controls.dampingFactor = 0.05;

    // 添加环境光和定向光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    // @ts-ignore
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    // @ts-ignore
    directionalLight.position.set(5, 5, 5);
    // @ts-ignore
    scene.add(directionalLight);

    // 窗口大小变化时调整
    window.addEventListener('resize', onWindowResize);

    // 根据类型创建可视化
    createVisualization();

    // 开始渲染循环
    animate();
    loading.value = false;
  } catch (e) {
    console.error('初始化3D场景失败:', e);
    error.value = '初始化3D场景失败';
    loading.value = false;
  }
};

// 创建可视化
const createVisualization = () => {
  // 清除现有可视化
  if (visualizationObject) {
    // @ts-ignore
    scene.remove(visualizationObject);
    visualizationObject = null;
  }

  // 获取颜色方案
  const colors = visualizationStore.getColorScheme(props.colorScheme);

  // 根据类型生成不同的可视化
  switch (props.visualizationType) {
    case 'heatmap':
      visualizationObject = createHeatmap(colors);
      break;
    case 'surface':
      visualizationObject = createSurface(colors);
      break;
    case 'timeAnimation':
      visualizationObject = createTimeAnimation(colors);
      break;
    default:
      visualizationObject = createHeatmap(colors);
  }

  if (visualizationObject) {
    // @ts-ignore
    scene.add(visualizationObject);
  }
};

// 创建热力图
const createHeatmap = (colors: string[]) => {
  const group = new THREE.Group();
  const size = 10;
  const segments = 20;
  
  // 创建底板
  const planeGeometry = new THREE.PlaneGeometry(size, size, segments, segments);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0x132f4c,
    side: THREE.DoubleSide,
    wireframe: false,
    transparent: true,
    opacity: 0.5
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -Math.PI / 2;
  group.add(plane);
  
  // 生成随机热力点
  const pointCount = 100;
  for (let i = 0; i < pointCount; i++) {
    const x = (Math.random() - 0.5) * size;
    const z = (Math.random() - 0.5) * size;
    const value = Math.random();
    
    // 根据值选择颜色
    const colorIndex = Math.floor(value * (colors.length - 1));
    const color = new THREE.Color(colors[colorIndex]);
    
    // 创建热力点
    const pointGeometry = new THREE.SphereGeometry(0.1 + value * 0.2, 16, 16);
    const pointMaterial = new THREE.MeshBasicMaterial({ color });
    const point = new THREE.Mesh(pointGeometry, pointMaterial);
    point.position.set(x, value * 0.5, z);
    group.add(point);
  }
  
  return group;
};

// 创建表面图
const createSurface = (colors: string[]) => {
  const group = new THREE.Group();
  const size = 10;
  const segments = 50;
  
  // 创建表面几何体
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  const positions = geometry.attributes.position.array;
  
  // 生成随机表面高度
  for (let i = 0; i < positions.length; i += 3) {
    // 获取网格位置
    const x = positions[i];
    const z = positions[i + 2];
    
    // 根据距离中心的距离生成高度
    const distance = Math.sqrt(x * x + z * z);
    const height = Math.cos(distance * 0.8) * Math.sin(x * 0.5) * Math.cos(z * 0.5) * 2;
    
    // 设置高度
    positions[i + 1] = height;
  }
  
  // 更新几何体
  geometry.computeVertexNormals();
  
  // 创建颜色贴图
  const dataSize = segments + 1;
  const data = new Uint8Array(dataSize * dataSize * 3);
  
  for (let i = 0; i < dataSize; i++) {
    for (let j = 0; j < dataSize; j++) {
      const index = (i * dataSize + j) * 3;
      
      // 获取高度并映射到颜色
      const h = (positions[(i * dataSize + j) * 3 + 1] + 2) / 4; // 归一化高度
      const colorIndex = Math.min(Math.floor(h * colors.length), colors.length - 1);
      
      // 解析RGB颜色
      const color = new THREE.Color(colors[colorIndex]);
      data[index] = Math.floor(color.r * 255);
      data[index + 1] = Math.floor(color.g * 255);
      data[index + 2] = Math.floor(color.b * 255);
    }
  }
  
  // 创建纹理
  // @ts-ignore
  const texture = new THREE.DataTexture(data, dataSize, dataSize, THREE.RGBFormat);
  texture.needsUpdate = true;
  
  // 创建材质和网格
  const material = new THREE.MeshPhongMaterial({
    map: texture,
    side: THREE.DoubleSide,
    shininess: 50
  });
  
  const surface = new THREE.Mesh(geometry, material);
  surface.rotation.x = -Math.PI / 2;
  group.add(surface);
  
  return group;
};

// 创建时间轴动画
const createTimeAnimation = (colors: string[]) => {
  const group = new THREE.Group();
  const frames = 20;
  
  // 生成多个时间帧的数据
  const timeFrames = [];
  
  for (let frame = 0; frame < frames; frame++) {
    const points = [];
    const pointCount = 50;
    
    // 生成随机点
    for (let i = 0; i < pointCount; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 5;
      const z = (Math.random() - 0.5) * 10;
      const value = Math.random();
      
      points.push({ x, y, z, value });
    }
    
    timeFrames.push(points);
  }
  
  // 绘制第一帧
  drawTimeFrame(group, timeFrames[0], colors);
  
  // 设置动画回调
  const animate = () => {
    timeIndex.value = (timeIndex.value + 1) % frames;
    
    // 清除之前的帧
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    
    // 绘制当前帧
    drawTimeFrame(group, timeFrames[timeIndex.value], colors);
  };
  
  // 开始时间动画
  isAnimating.value = true;
  const startAnimation = () => {
    const animationLoop = () => {
      if (isAnimating.value) {
        setTimeout(() => {
          animate();
          requestAnimationFrame(animationLoop);
        }, props.timeStep);
      }
    };
    animationLoop();
  };
  
  startAnimation();
  
  return group;
};

// 绘制时间帧
const drawTimeFrame = (group: THREE.Group, points: any[], colors: string[]) => {
  points.forEach(point => {
    // 根据值选择颜色
    const colorIndex = Math.floor(point.value * (colors.length - 1));
    const color = new THREE.Color(colors[colorIndex]);
    
    // 创建点
    const geometry = new THREE.SphereGeometry(0.1 + point.value * 0.3, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(point.x, point.y, point.z);
    group.add(sphere);
  });
};

// 窗口大小调整处理
const onWindowResize = () => {
  if (!container.value) return;
  
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;
  
  // @ts-ignore
  camera.aspect = width / height;
  // @ts-ignore
  camera.updateProjectionMatrix();
  // @ts-ignore
  renderer.setSize(width, height);
};

// 动画循环
const animate = () => {
  animationId = requestAnimationFrame(animate);
  
  if (controls) {
    controls.update();
  }
  
  // @ts-ignore
  renderer.render(scene, camera);
};

// 组件挂载时初始化
onMounted(() => {
  // 向Pinia注册此可视化组件
  const id = `3d-viz-${Date.now()}`;
  visualizationStore.registerVisualization(id);
  
  // 初始化3D场景
  setTimeout(initScene, 100);
});

// 监听属性变化
watch(() => [props.visualizationType, props.colorScheme], () => {
  if (scene) {
    createVisualization();
  }
});

// 组件卸载时清理
onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
  
  isAnimating.value = false;
  
  if (renderer && container.value) {
    // @ts-ignore
    container.value.removeChild(renderer.domElement);
  }
  
  window.removeEventListener('resize', onWindowResize);
  
  // 从Pinia注销此可视化组件
  visualizationStore.unregisterVisualization(`3d-viz-${Date.now()}`);
});
</script>

<style scoped>
.three-d-visualization-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  background-color: #0a1929;
  border-radius: 8px;
  overflow: hidden;
}

.visualization-container {
  width: 100%;
  height: 100%;
}

.visualization-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(10, 25, 41, 0.8);
  color: #90caf9;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(59, 130, 246, 0.3);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.visualization-error {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(10, 25, 41, 0.8);
  color: #ef4444;
}

.visualization-controls {
  position: absolute;
  bottom: 15px;
  left: 15px;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(19, 47, 76, 0.8);
  border-radius: 6px;
  color: white;
  font-size: 14px;
}

.control-label {
  font-weight: 500;
  margin-right: 10px;
}

.time-controls {
  display: flex;
  align-items: center;
}

.control-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 8px;
}

.control-button:hover {
  background-color: #2563eb;
}

.time-indicator {
  font-size: 12px;
  color: #90caf9;
}
</style> 