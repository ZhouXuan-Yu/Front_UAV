/**
 * 文件名: FixedMapComponent.vue
 * 描述: 修复版本的地图组件，用于解决地图无法显示的问题
 * 在项目中的作用: 
 * - 集成高德地图API，提供地图显示和操作功能
 * - 支持无人机轨迹展示、区域绘制和数据展示
 * - 替代原有的MapComponent，确保地图正确加载
 */

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import MapDrawTools from './MapDrawTools.vue'; // 导入绘制工具组件

// 定义组件属性
const props = defineProps({
  showDroneInfo: {
    type: Boolean,
    default: true
  }
});

// 组件状态
const loading = ref(true);
const mapInstance = ref<any>(null);
const droneMarker = ref<any>(null);
const pathPolyline = ref<any>(null);
const droneTimer = ref<number | null>(null);

// 无人机数据
const dronePosition = ref<[number, number]>([116.397428, 39.90923]);
const dronePath = ref<Array<[number, number]>>([]);
const droneInfo = reactive({
  id: 'Drone-X10',
  status: '执行任务中',
  battery: 78,
  altitude: 120,
  speed: 36,
  signal: 98
});

// 地图设置
const taskType = ref('normal');
const centerPosition = ref<[number, number]>([116.397428, 39.90923]);

// 区域绘制相关
const showDrawTools = ref(false);
const taskAreaPoints = ref<Array<[number, number]>>([]);
const taskAreaScreenshot = ref('');

// 高德地图API密钥
const amapKey = '5c98219ee72ff8b122e46b8167333eb9';

// 加载高德地图脚本
const loadAMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载了高德地图脚本
    if (typeof window.AMap !== 'undefined') {
      resolve();
      return;
    }
    
    // 创建脚本元素
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&plugin=AMap.Scale,AMap.ToolBar,AMap.HeatMap,AMap.Weather`;
    script.async = true;
    
    // 设置加载回调
    script.onload = () => {
      console.log('高德地图脚本加载成功');
      resolve();
    };
    
    script.onerror = (e) => {
      console.error('高德地图脚本加载失败:', e);
      ElMessage({
        message: '地图加载失败，请检查网络连接',
        type: 'error'
      });
      reject(new Error('地图脚本加载失败'));
    };
    
    // 添加到文档
    document.head.appendChild(script);
  });
};

// 创建地图
const createMap = async () => {
  try {
    console.log('开始创建地图实例...');
    
    // 确保AMap已加载
    if (typeof window.AMap === 'undefined') {
      console.error('高德地图API未加载');
      throw new Error('高德地图API未加载');
    }
    
    // 创建地图实例
    mapInstance.value = new window.AMap.Map('amap-container', {
      zoom: 15,
      center: centerPosition.value,
      viewMode: '3D',
      mapStyle: 'amap://styles/normal'
    });
    
    console.log('地图实例已创建', mapInstance.value);
    
    // 添加控件
    mapInstance.value.addControl(new window.AMap.Scale());
    mapInstance.value.addControl(new window.AMap.ToolBar({
      position: 'RT'
    }));
    
    // 添加无人机标记
    addDroneMarker();
    
    // 模拟无人机移动
    simulateDroneMovement();
    
    // 设置加载状态
    loading.value = false;
  } catch (e) {
    console.error('创建地图失败:', e);
    ElMessage.error('地图创建失败，请刷新页面重试');
    loading.value = false;
  }
};

// 添加无人机标记
const addDroneMarker = () => {
  if (!mapInstance.value || !window.AMap) return;
  
  try {
    // 创建标记
    droneMarker.value = new window.AMap.Marker({
      position: dronePosition.value,
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(32, 32),
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgZmlsbD0iIzAwQjJGRiIgZmlsbC1vcGFjaXR5PSIwLjgiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjQiIGZpbGw9IiMwMEIyRkYiLz48cGF0aCBkPSJNMTYgMzJMMTMgMjVIMTlMMTYgMzJaIiBmaWxsPSIjMDBCMkZGIiBmaWxsLW9wYWNpdHk9IjAuOCIvPjwvc3ZnPg==',
        imageSize: new window.AMap.Size(32, 32)
      }),
      offset: new window.AMap.Pixel(-16, -16),
      angle: 0
    });
    
    // 添加到地图
    mapInstance.value.add(droneMarker.value);
    
    // 添加无人机信息窗口
    if (props.showDroneInfo) {
      addDroneInfoWindow();
    }
  } catch (e) {
    console.error('添加无人机标记失败:', e);
  }
};

// 添加无人机信息窗口
const addDroneInfoWindow = () => {
  if (!mapInstance.value || !window.AMap || !droneMarker.value) return;
  
  try {
    // 创建信息窗口内容
    const content = `
      <div class="drone-info-window" style="color: #333;">
        <div class="drone-info-header">
          <strong style="color: #000;">${droneInfo.id}</strong>
          <span class="drone-status" style="color: #000;">${droneInfo.status}</span>
        </div>
        <div class="drone-info-body">
          <div class="info-row">
            <span class="info-label" style="color: #333;">电量:</span>
            <span class="info-value" style="color: #000;">${droneInfo.battery}%</span>
          </div>
          <div class="info-row">
            <span class="info-label" style="color: #333;">高度:</span>
            <span class="info-value" style="color: #000;">${droneInfo.altitude}m</span>
          </div>
          <div class="info-row">
            <span class="info-label" style="color: #333;">速度:</span>
            <span class="info-value" style="color: #000;">${droneInfo.speed}km/h</span>
          </div>
          <div class="info-row">
            <span class="info-label" style="color: #333;">信号:</span>
            <span class="info-value" style="color: #000;">${droneInfo.signal}%</span>
          </div>
        </div>
      </div>
    `;
    
    // 创建信息窗口
    const infoWindow = new window.AMap.InfoWindow({
      content: content,
      offset: new window.AMap.Pixel(0, -30),
      closeWhenClickMap: true
    });
    
    // 打开信息窗口
    infoWindow.open(mapInstance.value, dronePosition.value);
  } catch (e) {
    console.error('添加无人机信息窗口失败:', e);
  }
};

// 模拟无人机运动
const simulateDroneMovement = () => {
  if (droneTimer.value !== null) {
    clearInterval(droneTimer.value);
  }
  
  // 初始化无人机位置
  const initPosition: [number, number] = [centerPosition.value[0], centerPosition.value[1]];
  dronePosition.value = initPosition;
  
  // 创建一条路径
  const path: Array<[number, number]> = [
    [initPosition[0], initPosition[1]],
    [initPosition[0] + 0.001, initPosition[1] + 0.001],
    [initPosition[0] + 0.002, initPosition[1]],
    [initPosition[0] + 0.001, initPosition[1] - 0.001],
    [initPosition[0], initPosition[1]],
  ];
  
  let pathIndex = 0;
  const totalPoints = 50; // 路径细分的点数
  
  dronePath.value = [];
  
  // 设置模拟移动的计时器
  droneTimer.value = window.setInterval(() => {
    if (!mapInstance.value) return;
    
    // 获取当前路径段
    const startPoint = path[pathIndex];
    const endPoint = path[(pathIndex + 1) % path.length];
    
    // 计算路径插值
    const stepX = (endPoint[0] - startPoint[0]) / totalPoints;
    const stepY = (endPoint[1] - startPoint[1]) / totalPoints;
    
    // 更新无人机位置
    dronePosition.value = [
      dronePosition.value[0] + stepX,
      dronePosition.value[1] + stepY
    ];
    
    // 更新无人机路径
    dronePath.value.push([dronePosition.value[0], dronePosition.value[1]]);
    
    // 如果接近终点，切换到下一段路径
    if (dronePath.value.length % totalPoints === 0) {
      pathIndex = (pathIndex + 1) % (path.length - 1);
    }
    
    // 更新无人机状态
    droneInfo.battery = Math.max(70, 100 - dronePath.value.length * 0.1);
    droneInfo.altitude = 120 + Math.sin(dronePath.value.length * 0.1) * 10;
    droneInfo.speed = 36 + Math.cos(dronePath.value.length * 0.2) * 5;
    droneInfo.signal = Math.max(85, 100 - dronePath.value.length * 0.05);
    
    // 更新无人机标记位置
    updateDroneMarker();
    
    // 更新无人机路径
    updateDronePath();
  }, 500);
};

// 更新无人机标记位置
const updateDroneMarker = () => {
  if (!mapInstance.value || !droneMarker.value) return;
  
  try {
    // 更新标记位置
    droneMarker.value.setPosition(dronePosition.value);
  } catch (e) {
    console.error('更新无人机标记位置失败:', e);
  }
};

// 更新无人机路径
const updateDronePath = () => {
  if (!mapInstance.value || dronePath.value.length < 2) return;
  
  try {
    // 移除旧路径
    if (pathPolyline.value) {
      mapInstance.value.remove(pathPolyline.value);
    }
    
    // 创建新路径
    pathPolyline.value = new window.AMap.Polyline({
      path: dronePath.value,
      strokeColor: '#FF4500',
      strokeWeight: 3,
      strokeStyle: 'solid'
    });
    
    // 添加到地图
    mapInstance.value.add(pathPolyline.value);
  } catch (e) {
    console.error('更新无人机路径失败:', e);
  }
};

// 切换地图类型
const switchTaskType = (type: string) => {
  taskType.value = type;
  
  if (!mapInstance.value) return;
  
  // 根据任务类型调整地图样式
  switch (type) {
    case 'normal':
      mapInstance.value.setMapStyle('amap://styles/normal');
      break;
    case 'satellite':
      mapInstance.value.setMapStyle('amap://styles/satellite');
      break;
    case 'night':
      mapInstance.value.setMapStyle('amap://styles/dark');
      break;
    case 'heatmap':
      mapInstance.value.setMapStyle('amap://styles/grey');
      // 这里还可以添加热力图层的逻辑
      break;
  }
};

// 获取当前位置
const getCurrentLocation = () => {
  if (navigator.geolocation) {
    ElMessage.info('正在获取当前位置...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        centerPosition.value = [lng, lat];
        
        // 更新地图中心
        if (mapInstance.value) {
          mapInstance.value.setCenter(centerPosition.value);
        }
        
        ElMessage.success('已获取当前位置');
      },
      (error) => {
        console.error('地理定位失败:', error);
        ElMessage.error('无法获取当前位置，使用默认位置');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  } else {
    ElMessage.warning('您的浏览器不支持地理定位');
  }
};

// 导出地图数据
const exportMapData = () => {
  if (!mapInstance.value) return;
  
  try {
    // 准备导出数据
    const exportData = {
      center: mapInstance.value.getCenter(),
      zoom: mapInstance.value.getZoom(),
      dronePath: dronePath.value,
      droneInfo: { ...droneInfo },
      timestamp: new Date().toISOString()
    };
    
    // 转换为JSON
    const dataStr = JSON.stringify(exportData, null, 2);
    
    // 创建下载链接
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // 创建下载链接元素
    const a = document.createElement('a');
    a.href = url;
    a.download = `map-data-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    ElMessage.success('地图数据已导出');
  } catch (e) {
    console.error('导出地图数据失败:', e);
    ElMessage.error('导出数据失败');
  }
};

// 获取电池状态样式类
const getBatteryClass = () => {
  if (droneInfo.battery > 50) return 'good';
  if (droneInfo.battery > 20) return 'warning';
  return 'danger';
};

// 获取信号状态样式类
const getSignalClass = () => {
  if (droneInfo.signal > 70) return 'good';
  if (droneInfo.signal > 30) return 'warning';
  return 'danger';
};

// 截图区域
const captureMapScreenshot = () => {
  if (!mapInstance.value) {
    ElMessage.warning('地图还未加载完成');
    return;
  }
  
  // 显示区域绘制工具
  showDrawTools.value = true;
};

// 处理区域选择完成
const handleAreaSelected = (data: any) => {
  // 更新区域点和截图
  taskAreaPoints.value = data.points;
  if (data.screenshot) {
    taskAreaScreenshot.value = data.screenshot;
    ElMessage.success('区域截图已保存');
  } else {
    ElMessage.warning('无法获取区域截图');
  }
  
  // 隐藏绘制工具
  showDrawTools.value = false;
};

// 处理绘制取消
const handleDrawCancel = () => {
  // 隐藏绘制工具
  showDrawTools.value = false;
  ElMessage.info('已取消区域绘制');
};

// 生命周期钩子 - 组件挂载时初始化地图
onMounted(async () => {
  console.log('FixedMapComponent 已挂载，准备初始化地图...');
  
  // 检查容器元素
  const mapContainer = document.getElementById('amap-container');
  if (!mapContainer) {
    console.error('找不到地图容器元素');
    ElMessage.error('找不到地图容器元素');
    return;
  }
  
  // 确保容器有尺寸
  if (mapContainer.clientWidth === 0 || mapContainer.clientHeight === 0) {
    console.warn('地图容器尺寸为0，设置默认高度');
    mapContainer.style.height = '600px';
  }
  
  try {
    // 加载高德地图API
    await loadAMapScript();
    
    // 创建地图
    await createMap();
    
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize);
  } catch (error) {
    console.error('地图初始化失败:', error);
    ElMessage.error('地图初始化失败，请刷新页面重试');
    loading.value = false;
  }
});

// 处理窗口大小变化
const handleResize = () => {
  if (mapInstance.value) {
    mapInstance.value.resize();
  }
};

// 生命周期钩子 - 组件卸载前清理资源
onBeforeUnmount(() => {
  // 清除计时器
  if (droneTimer.value !== null) {
    clearInterval(droneTimer.value);
    droneTimer.value = null;
  }
  
  // 移除事件监听器
  window.removeEventListener('resize', handleResize);
  
  // 销毁地图实例
  if (mapInstance.value) {
    mapInstance.value.destroy();
    mapInstance.value = null;
  }
});
</script>

<template>
  <div class="map-container">
    <div class="map-header">
      <h2>实时地图</h2>
      
      <div class="map-controls">
        <div class="control-group">
          <button 
            class="control-button" 
            :class="{ active: taskType === 'normal' }"
            @click="switchTaskType('normal')"
            title="标准地图"
          >
            标准
          </button>
          <button 
            class="control-button" 
            :class="{ active: taskType === 'satellite' }"
            @click="switchTaskType('satellite')"
            title="卫星地图"
          >
            卫星
          </button>
          <button 
            class="control-button" 
            :class="{ active: taskType === 'night' }"
            @click="switchTaskType('night')"
            title="夜间模式"
          >
            夜间
          </button>
          <button 
            class="control-button" 
            :class="{ active: taskType === 'heatmap' }"
            @click="switchTaskType('heatmap')"
            title="热力图"
          >
            热力图
          </button>
        </div>
        
        <button 
          class="control-button capture-button" 
          @click="captureMapScreenshot"
          title="区域截图"
        >
          <i class="capture-icon"></i> 绘制区域
        </button>
        
        <button 
          class="control-button export-button" 
          @click="exportMapData"
          title="导出地图数据"
        >
          <i class="export-icon"></i> 导出
        </button>
        
        <button 
          class="control-button location-button" 
          @click="getCurrentLocation"
          title="获取当前位置"
        >
          <i class="location-icon"></i> 定位
        </button>
      </div>
    </div>

    <!-- 加载中状态 -->
    <div v-if="loading" class="map-loading">
      <div class="loading-spinner"></div>
      <p>地图加载中...</p>
    </div>

    <!-- 地图容器 -->
    <div id="amap-container" class="amap-container"></div>
    
    <!-- 区域绘制工具 -->
    <MapDrawTools 
      v-if="mapInstance"
      :mapInstance="mapInstance" 
      v-model:visible="showDrawTools"
      @area-selected="handleAreaSelected"
      @cancel="handleDrawCancel"
    />
    
    <!-- 无人机状态信息面板 -->
    <div v-if="props.showDroneInfo" class="map-footer">
      <div class="coordinate-display">
        经度: {{ dronePosition[0].toFixed(6) }} 纬度: {{ dronePosition[1].toFixed(6) }}
      </div>
      
      <div class="drone-status">
        <div class="status-item">
          <div class="status-label">电量</div>
          <div class="status-value" :class="getBatteryClass()">{{ Math.round(droneInfo.battery) }}%</div>
        </div>
        <div class="status-item">
          <div class="status-label">高度</div>
          <div class="status-value">{{ Math.round(droneInfo.altitude) }}m</div>
        </div>
        <div class="status-item">
          <div class="status-label">速度</div>
          <div class="status-value">{{ Math.round(droneInfo.speed) }}m/s</div>
        </div>
        <div class="status-item">
          <div class="status-label">信号</div>
          <div class="status-value" :class="getSignalClass()">{{ Math.round(droneInfo.signal) }}%</div>
        </div>
      </div>
    </div>
    
    <!-- 任务区域截图预览 -->
    <div v-if="taskAreaScreenshot" class="task-screenshot-preview">
      <div class="preview-header">
        <h3>任务区域截图</h3>
        <button class="close-button" @click="taskAreaScreenshot = ''">
          &times;
        </button>
      </div>
      <div class="preview-content">
        <img :src="taskAreaScreenshot" alt="任务区域截图" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #111827;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgba(17, 24, 39, 0.8);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  border-top-color: #3b82f6;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.map-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #1e293b;
  color: white;
  border-bottom: 1px solid #334155;
}

.map-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.map-controls {
  display: flex;
  gap: 8px;
}

.control-group {
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 8px;
}

.control-button {
  background-color: #334155;
  color: white;
  border: none;
  padding: 6px 12px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.control-button:hover {
  background-color: #475569;
}

.control-button.active {
  background-color: #3b82f6;
}

.amap-container {
  flex: 1;
  min-height: 600px;
  width: 100%;
  background-color: #0f172a;
}

.map-footer {
  padding: 12px 16px;
  background-color: #1e293b;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #334155;
}

.coordinate-display {
  font-size: 0.8rem;
  color: #94a3b8;
}

.drone-status {
  display: flex;
  gap: 16px;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-label {
  font-size: 0.7rem;
  color: #94a3b8;
}

.status-value {
  font-size: 0.9rem;
  font-weight: 600;
}

.status-value.good {
  color: #10b981;
}

.status-value.warning {
  color: #f59e0b;
}

.status-value.danger {
  color: #ef4444;
}

.export-button, .location-button, .capture-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.export-icon::before, .location-icon::before, .capture-icon::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.export-icon::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'/%3E%3C/svg%3E");
}

.location-icon::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'/%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'/%3E%3C/svg%3E");
}

.capture-icon::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5'/%3E%3C/svg%3E");
}

.task-screenshot-preview {
  position: absolute;
  right: 20px;
  top: 80px;
  width: 280px;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  z-index: 50;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.preview-header h3 {
  margin: 0;
  font-size: 0.9rem;
  color: #334155;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s;
}

.close-button:hover {
  color: #475569;
}

.preview-content {
  padding: 12px;
}

.preview-content img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

/* 媒体查询适配 */
@media (max-width: 768px) {
  .amap-container {
    min-height: 400px;
  }
  
  .map-footer {
    flex-direction: column;
    gap: 8px;
  }
  
  .drone-status {
    width: 100%;
    justify-content: space-between;
  }
  
  .task-screenshot-preview {
    width: 200px;
  }
}
</style> 