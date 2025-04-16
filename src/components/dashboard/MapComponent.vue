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

// 无人机信息
const droneInfo = ref({
  id: 'Drone-X10',
  status: '执行任务中',
  battery: 78,
  altitude: 120,
  speed: 8.5,
  signal: 87,
  task: '区域巡检',
  startTime: '2023-11-08 14:30',
  endTime: '2023-11-08 17:30'
});

// 信息窗口内容
const infoContent = ref(`
  <div class="info-window">
    <h3>${droneInfo.value.id}</h3>
    <div class="info-row">
      <span class="info-label">状态:</span>
      <span class="info-value">${droneInfo.value.status}</span>
    </div>
    <div class="info-row">
      <span class="info-label">电量:</span>
      <span class="info-value">${droneInfo.value.battery}%</span>
    </div>
    <div class="info-row">
      <span class="info-label">高度:</span>
      <span class="info-value">${droneInfo.value.altitude}米</span>
    </div>
    <div class="info-row">
      <span class="info-label">速度:</span>
      <span class="info-value">${droneInfo.value.speed} m/s</span>
    </div>
  </div>
`);

// 声明AMap全局变量
declare global {
  interface Window {
    AMap: any;
  }
}

// 初始化高德地图
const initMap = () => {
  // 检查是否已经加载了高德地图脚本
  if (typeof window.AMap === 'undefined') {
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
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&plugin=AMap.Scale,AMap.ToolBar,AMap.Polygon,AMap.HeatMap,AMap.ControlBar,AMap.Weather`;
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
  map = new window.AMap.Map('amap-container', {
    zoom: 14,
    center: dronePosition.value,
    viewMode: '3D',
    pitch: 50,
    mapStyle: 'amap://styles/dark',
    features: ['bg', 'road', 'building', 'point']
  });
  
  // 添加控件
  map.addControl(new window.AMap.Scale());
  map.addControl(new window.AMap.ToolBar());
  map.addControl(new window.AMap.ControlBar({
    position: {
      right: '10px',
      top: '10px'
    }
  }));
  
  // 添加无人机标记
  addDroneMarker();
  
  // 添加任务区域
  addTaskArea();
  
  // 模拟无人机移动
  simulateDroneMovement();
  
  // 添加搜索周边功能
  addSearchNearby();
  
  // 添加热力图
  addHeatMap();
  
  // 添加天气信息
  showWeatherInfo();
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
  const droneMarker = new window.AMap.Marker({
    position: dronePosition.value,
    content: markerContent,
    anchor: 'center',
    offset: new window.AMap.Pixel(0, 0),
    zIndex: 100,
    autoRotation: true,
    angle: 0
  });
  
  // 将标记添加到地图
  map.add(droneMarker);
  
  // 创建信息窗口
  const infoWindow = new window.AMap.InfoWindow({
    content: infoContent.value,
    offset: new window.AMap.Pixel(0, -20)
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
  const polygon = new window.AMap.Polygon({
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
  const taskLabel = new window.AMap.Text({
    text: '任务区域',
    position: [116.395563, 39.909],
    offset: new window.AMap.Pixel(0, 0),
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
  ] as [number, number][];
  
  let currentPointIndex = 0;
  
  // 绘制路径线
  const path = [...pathPoints];
  const polyline = new window.AMap.Polyline({
    path: path,
    strokeColor: '#00eeff',
    strokeWeight: 3,
    strokeOpacity: 0.5,
    lineJoin: 'round',
    lineCap: 'round',
    zIndex: 50
  });
  
  map.add(polyline);
  
  // 开始动画
  const moveAnimation = setInterval(() => {
    const nextPoint = pathPoints[currentPointIndex];
    updateDronePosition(nextPoint);
    
    // 更新无人机信息
    updateDroneInfo();
    
    currentPointIndex = (currentPointIndex + 1) % pathPoints.length;
  }, 3000);
  
  // 保存定时器引用用于清理
  (window as any).droneMovementTimer = moveAnimation;
};

// 更新无人机信息
const updateDroneInfo = () => {
  // 随机更新电量和信号强度
  droneInfo.value.battery = Math.max(1, droneInfo.value.battery - Math.random() * 0.5);
  droneInfo.value.signal = Math.max(50, Math.min(100, droneInfo.value.signal + (Math.random() * 6 - 3)));
  droneInfo.value.altitude = Math.max(50, Math.min(200, droneInfo.value.altitude + (Math.random() * 10 - 5)));
  droneInfo.value.speed = Math.max(5, Math.min(15, droneInfo.value.speed + (Math.random() * 2 - 1)));
  
  // 更新信息窗口内容
  infoContent.value = `
    <div class="info-window">
      <h3>${droneInfo.value.id}</h3>
      <div class="info-row">
        <span class="info-label">状态:</span>
        <span class="info-value">${droneInfo.value.status}</span>
      </div>
      <div class="info-row">
        <span class="info-label">电量:</span>
        <span class="info-value">${droneInfo.value.battery.toFixed(1)}%</span>
      </div>
      <div class="info-row">
        <span class="info-label">高度:</span>
        <span class="info-value">${droneInfo.value.altitude.toFixed(1)}米</span>
      </div>
      <div class="info-row">
        <span class="info-label">速度:</span>
        <span class="info-value">${droneInfo.value.speed.toFixed(1)} m/s</span>
      </div>
      <div class="info-row">
        <span class="info-label">信号:</span>
        <span class="info-value" :class="{ 'status-warning': droneInfo.value.signal < 70, 'status-danger': droneInfo.value.signal < 50 }">
          {{ droneInfo.value.signal.toFixed(1) }}%
        </span>
      </div>
    </div>
  `;
  
  // 如果信息窗口已打开，更新其内容
  const infoWindow = map.getInfoWindow();
  if (infoWindow && infoWindow.getIsOpen()) {
    infoWindow.setContent(infoContent.value);
  }
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
    const marker = new window.AMap.Marker({
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

// 添加热力图
const addHeatMap = () => {
  // 创建热力图数据
  const heatmapData = [
    { "lng": 116.395, "lat": 39.910, "count": 10 },
    { "lng": 116.394, "lat": 39.915, "count": 15 },
    { "lng": 116.403, "lat": 39.907, "count": 25 },
    { "lng": 116.402, "lat": 39.912, "count": 30 },
    { "lng": 116.388, "lat": 39.905, "count": 18 },
    { "lng": 116.387, "lat": 39.913, "count": 20 },
    { "lng": 116.400, "lat": 39.900, "count": 12 },
    { "lng": 116.395, "lat": 39.917, "count": 8 }
  ];
  
  if (window.AMap && window.AMap.HeatMap) {
    // 初始化热力图
    const heatmap = new window.AMap.HeatMap(map, {
      radius: 25, // 热力图半径
      opacity: [0, 0.8], // 热力图透明度
      gradient: {
        0.4: 'rgb(0, 255, 255)',
        0.65: 'rgb(0, 110, 255)',
        0.85: 'rgb(100, 0, 255)',
        1.0: 'rgb(255, 0, 0)'
      }
    });
    
    // 设置热力图数据
    heatmap.setDataSet({
      data: heatmapData,
      max: 30
    });
    
    // 默认不显示热力图
    heatmap.hide();
    
    // 将热力图实例保存以便后续控制
    (window as any).heatmap = heatmap;
  }
};

// 显示天气信息
const showWeatherInfo = () => {
  if (window.AMap && window.AMap.Weather) {
    // 创建天气查询实例
    const weather = new window.AMap.Weather();
    
    // 查询实时天气
    weather.getLive('北京市', (err: any, data: any) => {
      if (!err) {
        // 创建天气信息面板
        const weatherInfo = document.createElement('div');
        weatherInfo.className = 'weather-info';
        weatherInfo.innerHTML = `
          <span>${data.city} ${data.weather}</span>
          <span>${data.temperature}°C ${data.windDirection}风 ${data.windPower}级</span>
        `;
        
        // 添加到地图上
        const weatherControl = new window.AMap.Control({
          position: 'RB',
          content: weatherInfo
        });
        
        map.addControl(weatherControl);
      }
    });
  }
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
      case 'heatmap':
        map.setMapStyle('amap://styles/normal');
        // 显示或隐藏热力图
        const heatmap = (window as any).heatmap;
        if (heatmap) {
          heatmap.show();
        }
        break;
      default:
        map.setMapStyle('amap://styles/normal');
        // 隐藏热力图
        const heatmapHide = (window as any).heatmap;
        if (heatmapHide) {
          heatmapHide.hide();
        }
    }
  }
};

// 导出地图数据
const exportMapData = () => {
  // 收集地图上的数据
  const data = {
    dronePosition: dronePosition.value,
    droneInfo: droneInfo.value,
    taskAreaPoints: taskAreaPoints.value,
    timestamp: new Date().toISOString()
  };
  
  // 转换为JSON
  const jsonData = JSON.stringify(data, null, 2);
  
  // 创建下载链接
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // 创建下载元素
  const a = document.createElement('a');
  a.href = url;
  a.download = `drone_map_data_${new Date().toISOString().replace(/:/g, '-')}.json`;
  a.click();
  
  // 清理URL对象
  URL.revokeObjectURL(url);
};

// 获取并更新当前位置信息
const getCurrentLocation = () => {
  if (map && dronePosition.value) {
    // 使用高德地图的地理编码服务获取位置描述
    const geocoder = new window.AMap.Geocoder();
    geocoder.getAddress(dronePosition.value, (status: string, result: any) => {
      if (status === 'complete' && result.info === 'OK') {
        const address = result.regeocode.formattedAddress;
        // 更新位置描述
        const locationDesc = document.getElementById('location-description');
        if (locationDesc) {
          locationDesc.textContent = address;
        }
      }
    });
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
          <button 
            class="control-button" 
            :class="{ active: taskType === 'heatmap' }"
            @click="switchTaskType('heatmap')"
          >
            热力图
          </button>
        </div>
        
        <button class="export-button" @click="exportMapData">
          导出数据
        </button>
        
        <button class="location-button" @click="getCurrentLocation">
          获取位置
        </button>
      </div>
    </div>
    
    <div id="amap-container" class="amap-container"></div>
    
    <div class="map-footer">
      <div class="coordinate-display">
        当前坐标: {{ dronePosition[0].toFixed(6) }}, {{ dronePosition[1].toFixed(6) }}
      </div>
      
      <div class="drone-status">
        <span class="status-item">
          <span class="status-label">电量:</span>
          <span class="status-value" :class="{ 'status-warning': droneInfo.battery < 30, 'status-danger': droneInfo.battery < 15 }">
            {{ droneInfo.battery.toFixed(1) }}%
          </span>
        </span>
        
        <span class="status-item">
          <span class="status-label">高度:</span>
          <span class="status-value">{{ droneInfo.altitude.toFixed(1) }}米</span>
        </span>
        
        <span class="status-item">
          <span class="status-label">速度:</span>
          <span class="status-value">{{ droneInfo.speed.toFixed(1) }}m/s</span>
        </span>
        
        <span class="status-item">
          <span class="status-label">信号:</span>
          <span class="status-value" :class="{ 'status-warning': droneInfo.signal < 70, 'status-danger': droneInfo.signal < 50 }">
            {{ droneInfo.signal.toFixed(1) }}%
          </span>
        </span>
      </div>
      
      <div id="location-description" class="location-description"></div>
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
  display: flex;
  flex-direction: column;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #0a1929;
  color: white;
  flex: 0 0 auto;
}

.map-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #4fc3f7;
}

.map-controls {
  display: flex;
  gap: 10px;
  align-items: center;
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

.export-button,
.location-button {
  padding: 6px 12px;
  background-color: #132f4c;
  color: white;
  border: 1px solid #1e3a5f;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 0.85rem;
}

.export-button:hover,
.location-button:hover {
  background-color: #1e3a5f;
}

.amap-container {
  flex: 1 1 auto;
  width: 100%;
}

.map-footer {
  background-color: rgba(10, 25, 41, 0.8);
  padding: 10px 15px;
  color: #90caf9;
  font-size: 0.9rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 0 0 auto;
}

.coordinate-display {
  flex: 1;
}

.drone-status {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex: 2;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-label {
  color: #90caf9;
  font-size: 0.85rem;
}

.status-value {
  font-weight: bold;
  color: white;
}

.status-warning {
  color: #FFC107;
}

.status-danger {
  color: #F44336;
}

.location-description {
  flex: 1;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  padding: 10px;
  min-width: 200px;
}

:deep(.info-window h3) {
  margin-top: 0;
  margin-bottom: 10px;
  color: #00eeff;
  font-size: 16px;
  border-bottom: 1px solid rgba(0, 238, 255, 0.3);
  padding-bottom: 5px;
}

:deep(.info-row) {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
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
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

/* 天气信息样式 */
:deep(.weather-info) {
  background-color: rgba(19, 47, 76, 0.9);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.amap-logo) {
  opacity: 0.5!important;
}

:deep(.amap-copyright) {
  opacity: 0.5!important;
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