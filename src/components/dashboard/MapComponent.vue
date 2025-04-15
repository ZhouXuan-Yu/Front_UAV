<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

// 高德地图API密钥
const amapKey = '206278d547a0c6408987f2a0002e2243';

// 地图实例
let map: any = null;

// 无人机位置
const dronePosition = ref<[number, number]>([116.397428, 39.90923]);

// 当前任务类型
const taskType = ref<string>('normal');

// 任务区域点
const taskAreaPoints = ref([
  [116.386037, 39.913122],
  [116.389684, 39.904507],
  [116.405563, 39.90654],
  [116.401787, 39.915309],
  [116.386037, 39.913122]
]);

// 信息窗口内容
const infoContent = ref(`
  <div class="info-window">
    <h3>Drone-X10</h3>
    <div class="info-row">
      <span class="info-label">状态:</span>
      <span class="info-value">执行任务中</span>
    </div>
    <div class="info-row">
      <span class="info-label">电量:</span>
      <span class="info-value">78%</span>
    </div>
    <div class="info-row">
      <span class="info-label">高度:</span>
      <span class="info-value">120米</span>
    </div>
    <div class="info-row">
      <span class="info-label">速度:</span>
      <span class="info-value">8.5 m/s</span>
    </div>
  </div>
`);

// 初始化高德地图
const initMap = () => {
  // 检查是否已经加载了高德地图脚本
  if (typeof AMap === 'undefined') {
    loadAMapScript().then(() => {
      createMap();
    });
  } else {
    createMap();
  }
};

// 加载高德地图脚本
const loadAMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&plugin=AMap.Scale,AMap.ToolBar,AMap.Polygon`;
    script.onload = () => resolve();
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
};

// 创建地图
const createMap = () => {
  // 创建地图实例
  const mapContainer = document.getElementById('amap-container');
  if (!mapContainer) return;
  
  // 创建地图
  map = new AMap.Map('amap-container', {
    zoom: 14,
    center: dronePosition.value,
    viewMode: '3D',
    pitch: 50,
    mapStyle: 'amap://styles/dark',
    features: ['bg', 'road', 'building', 'point']
  });
  
  // 添加控件
  map.addControl(new AMap.Scale());
  map.addControl(new AMap.ToolBar());
  
  // 添加无人机标记
  addDroneMarker();
  
  // 添加任务区域
  addTaskArea();
  
  // 模拟无人机移动
  simulateDroneMovement();
  
  // 添加搜索周边功能
  addSearchNearby();
};

// 添加无人机标记
const addDroneMarker = () => {
  // 创建自定义标记
  const markerContent = document.createElement('div');
  markerContent.className = 'drone-marker';
  markerContent.innerHTML = `
    <div class="drone-icon"></div>
    <div class="drone-pulse"></div>
  `;
  
  // 创建高德地图标记
  const droneMarker = new AMap.Marker({
    position: dronePosition.value,
    content: markerContent,
    anchor: 'center',
    offset: new AMap.Pixel(0, 0),
    zIndex: 100,
    autoRotation: true,
    angle: 0
  });
  
  // 将标记添加到地图
  map.add(droneMarker);
  
  // 创建信息窗口
  const infoWindow = new AMap.InfoWindow({
    content: infoContent.value,
    offset: new AMap.Pixel(0, -20)
  });
  
  // 点击标记时显示信息窗口
  droneMarker.on('click', () => {
    infoWindow.open(map, dronePosition.value);
  });
  
  // 保存标记引用用于后续更新
  (window as any).droneMarker = droneMarker;
};

// 添加任务区域
const addTaskArea = () => {
  // 创建多边形
  const polygon = new AMap.Polygon({
    path: taskAreaPoints.value,
    strokeColor: '#00eeff',
    strokeWeight: 2,
    strokeOpacity: 0.8,
    fillColor: '#00eeff',
    fillOpacity: 0.2,
    zIndex: 50
  });
  
  // 将多边形添加到地图
  map.add(polygon);
  
  // 为任务区域添加文本标记
  const taskLabel = new AMap.Text({
    text: '任务区域',
    position: [116.395563, 39.909],
    offset: new AMap.Pixel(0, 0),
    style: {
      'background-color': '#132f4c',
      'border-color': '#00eeff',
      'color': 'white',
      'padding': '5px 10px',
      'border-radius': '3px',
      'font-size': '12px'
    }
  });
  
  map.add(taskLabel);
};

// 模拟无人机移动
const simulateDroneMovement = () => {
  // 定义路径点
  const pathPoints = [
    [116.397428, 39.90923],
    [116.391634, 39.908063],
    [116.389488, 39.904507],
    [116.395282, 39.906321],
    [116.401359, 39.9089],
    [116.401787, 39.913304],
    [116.395454, 39.911083],
    [116.397428, 39.90923]
  ];
  
  let currentPointIndex = 0;
  
  // 开始动画
  const moveAnimation = setInterval(() => {
    const nextPoint = pathPoints[currentPointIndex];
    updateDronePosition(nextPoint);
    
    currentPointIndex = (currentPointIndex + 1) % pathPoints.length;
  }, 3000);
  
  // 保存定时器引用用于清理
  (window as any).droneMovementTimer = moveAnimation;
};

// 更新无人机位置
const updateDronePosition = (position: [number, number]) => {
  dronePosition.value = position;
  
  // 更新标记位置
  const droneMarker = (window as any).droneMarker;
  if (droneMarker) {
    droneMarker.setPosition(position);
  }
};

// 添加搜索周边功能
const addSearchNearby = () => {
  // 创建周边默认标记点
  const points = [
    { position: [116.400037, 39.915122], name: '人群聚集点A', type: 'crowd' },
    { position: [116.387684, 39.910507], name: '交通监控点B', type: 'traffic' },
    { position: [116.395563, 39.90454], name: '重点区域C', type: 'important' },
    { position: [116.403787, 39.907309], name: '车辆集中区D', type: 'vehicle' }
  ];
  
  // 标记类型对应的样式
  const markerStyles: Record<string, any> = {
    crowd: {
      icon: '👥',
      color: '#ff9800'
    },
    traffic: {
      icon: '🚗',
      color: '#2196f3'
    },
    important: {
      icon: '⚠️',
      color: '#f44336'
    },
    vehicle: {
      icon: '🚙',
      color: '#4caf50'
    }
  };
  
  // 创建标记
  points.forEach(point => {
    const style = markerStyles[point.type];
    
    // 创建标记点
    const marker = new AMap.Marker({
      position: point.position,
      title: point.name,
      label: {
        content: `<div class="point-label">${style.icon} ${point.name}</div>`,
        direction: 'top'
      }
    });
    
    // 添加到地图
    map.add(marker);
  });
};

// 切换任务类型
const switchTaskType = (type: string) => {
  taskType.value = type;
  
  // 根据任务类型调整地图样式
  if (map) {
    switch (type) {
      case 'night':
        map.setMapStyle('amap://styles/dark');
        break;
      case 'satellite':
        map.setMapStyle('amap://styles/satellite');
        break;
      default:
        map.setMapStyle('amap://styles/normal');
    }
  }
};

// 在组件挂载时初始化地图
onMounted(() => {
  // 延迟初始化以确保DOM已经渲染
  setTimeout(initMap, 100);
});

// 在组件卸载前清理资源
onBeforeUnmount(() => {
  // 清理定时器
  if ((window as any).droneMovementTimer) {
    clearInterval((window as any).droneMovementTimer);
  }
  
  // 销毁地图
  if (map) {
    map.destroy();
  }
});
</script>

<template>
  <div class="map-container">
    <div class="map-header">
      <h2>无人机位置 & 任务监控</h2>
      
      <div class="map-controls">
        <div class="control-group">
          <button 
            class="control-button" 
            :class="{ active: taskType === 'normal' }"
            @click="switchTaskType('normal')"
          >
            标准地图
          </button>
          <button 
            class="control-button" 
            :class="{ active: taskType === 'night' }"
            @click="switchTaskType('night')"
          >
            夜间模式
          </button>
          <button 
            class="control-button" 
            :class="{ active: taskType === 'satellite' }"
            @click="switchTaskType('satellite')"
          >
            卫星图像
          </button>
        </div>
      </div>
    </div>
    
    <div id="amap-container" class="amap-container"></div>
    
    <div class="coordinate-display">
      当前坐标: {{ dronePosition[0].toFixed(6) }}, {{ dronePosition[1].toFixed(6) }}
    </div>
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  height: 100%;
  min-height: 400px;
  background-color: #132f4c;
  border-radius: 10px;
  overflow: hidden;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #0a1929;
  color: white;
}

.map-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #4fc3f7;
}

.map-controls {
  display: flex;
  gap: 10px;
}

.control-group {
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #1e3a5f;
}

.control-button {
  padding: 6px 12px;
  background-color: #132f4c;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 0.85rem;
  border-right: 1px solid #1e3a5f;
}

.control-button:last-child {
  border-right: none;
}

.control-button.active {
  background-color: #1976d2;
}

.control-button:hover:not(.active) {
  background-color: #1e3a5f;
}

.amap-container {
  height: calc(100% - 110px);
  min-height: 300px;
  width: 100%;
}

.coordinate-display {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 15px;
  background-color: rgba(10, 25, 41, 0.8);
  color: #90caf9;
  font-size: 0.9rem;
  text-align: center;
}

/* 无人机标记样式 */
:deep(.drone-marker) {
  position: relative;
  width: 40px;
  height: 40px;
}

:deep(.drone-icon) {
  position: absolute;
  width: 20px;
  height: 20px;
  top: 10px;
  left: 10px;
  background-color: #00eeff;
  border-radius: 50%;
  z-index: 2;
}

:deep(.drone-icon::before) {
  content: '';
  position: absolute;
  width: 30px;
  height: 30px;
  top: -5px;
  left: -5px;
  border: 2px solid #00eeff;
  border-radius: 50%;
  box-sizing: border-box;
}

:deep(.drone-pulse) {
  position: absolute;
  width: 40px;
  height: 40px;
  top: 0;
  left: 0;
  background-color: rgba(0, 238, 255, 0.4);
  border-radius: 50%;
  z-index: 1;
  animation: pulse 2s infinite;
}

/* 信息窗口样式 */
:deep(.info-window) {
  padding: 5px;
}

:deep(.info-window h3) {
  margin-top: 0;
  margin-bottom: 10px;
  color: #00eeff;
  font-size: 16px;
}

:deep(.info-row) {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

:deep(.info-label) {
  font-weight: bold;
  color: #90caf9;
}

:deep(.info-value) {
  color: white;
}

/* 标记点标签样式 */
:deep(.point-label) {
  padding: 3px 6px;
  background-color: rgba(19, 47, 76, 0.9);
  border-radius: 3px;
  color: white;
  font-size: 12px;
  white-space: nowrap;
}

@keyframes pulse {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}
</style> 