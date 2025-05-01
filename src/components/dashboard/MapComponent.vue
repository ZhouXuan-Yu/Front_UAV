/**
 * 文件名: MapComponent.vue
 * 描述: 地图显示和交互组件
 * 在项目中的作用: 
 * - 集成高德地图API，提供地图显示和操作功能
 * - 支持地点标记、路径规划和区域显示
 * - 提供地图控件和交互功能
 * - 作为地理信息展示的基础组件
 */

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, reactive, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
// 导入Element Plus消息组件
import { ElMessage, ElLoading } from 'element-plus';

// 定义组件属性
const props = defineProps({
  isDrawing: {
    type: Boolean,
    default: false
  },
  taskAreaPoints: {
    type: Array,
    default: () => []
  },
  showDroneInfo: {
    type: Boolean,
    default: true
  },
  center: {
    type: Array,
    default: () => [116.397428, 39.90923]
  }
});

// 高德地图API密钥
const amapKey = '5c98219ee72ff8b122e46b8167333eb9'; // 使用有效的WebService Key
const securityCode = ''; // 安全密钥不再需要，设置为空字符串

// 地图实例
const mapInstance = ref<any>(null);

// 无人机位置
const dronePosition = ref<[number, number]>([116.397428, 39.90923]);

// 当前任务类型
const taskType = ref<string>('normal');

// 任务区域点
const areaPoints = ref([
  [116.386037, 39.913122],
  [116.389684, 39.904507],
  [116.405563, 39.90654],
  [116.401787, 39.915309],
  [116.386037, 39.913122]
]);

// 无人机信息
const droneInfo = reactive({
  id: 'Drone-X10',
  status: '执行任务中',
  battery: 78,
  altitude: 120,
  speed: 36,
  signal: 98
});

// 信息窗口内容
const infoContent = ref(`
  <div class="info-window">
    <h3>${droneInfo.id}</h3>
    <div class="info-row">
      <span class="info-label">状态:</span>
      <span class="info-value">${droneInfo.status}</span>
    </div>
    <div class="info-row">
      <span class="info-label">电量:</span>
      <span class="info-value">${droneInfo.battery}%</span>
    </div>
    <div class="info-row">
      <span class="info-label">高度:</span>
      <span class="info-value">${droneInfo.altitude}米</span>
    </div>
    <div class="info-row">
      <span class="info-label">速度:</span>
      <span class="info-value">${droneInfo.speed} m/s</span>
    </div>
  </div>
`);

// 定义无人机标记
const droneMarker = ref<any>(null);

// 添加Canvas引用
const canvasRef = ref<HTMLCanvasElement | null>(null);

// 用于多边形绘制
const drawingPoints = ref<Array<[number, number]>>([]);
const tempPolygon = ref(null);
const drawingMarkers = ref<Array<any>>([]);

// 信息窗口实例
const infoWindow = ref<any>(null);

// 定义无人机标记
const marker = ref<any>(null);

// 添加emit函数
const emit = defineEmits(['update:droneInfo', 'update:taskAreaPoints', 'update:taskAreaScreenshot']);

// 声明AMap全局变量
declare global {
  interface Window {
    AMap: any;
  }
}

// 是否使用Canvas模式
const useCanvas = ref(false);

// 定义centerPosition变量
const centerPosition = ref<[number, number]>([116.397428, 39.90923]); // 默认中心点

// 首先定义所有必要的响应式变量，确保它们在使用前声明
const taskAreaPoints = ref<Array<[number, number]>>([]);
const droneTimer = ref<number | null>(null);
const dronePath = ref<Array<[number, number]>>([]);
const pathPolyline = ref<any>(null);
const dronePathPolyline = ref<any>(null);
const taskAreaCenter = ref<[number, number] | null>(null);
const taskAreaScreenshot = ref<string | null>(null);

// 更新任务区域截图的监听器，确保更新值时能够正确触发事件
watch(() => taskAreaScreenshot.value, (newValue) => {
  if (newValue) {
    emit('update:taskAreaScreenshot', newValue);
    console.log('任务区域截图已通过监听器更新');
  }
});

// 定义函数initCanvas
const initCanvas = () => {
  try {
    const canvas = document.getElementById('canvas-overlay') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 重新绘制必要的元素
    if (dronePath.value && dronePath.value.length > 1) {
      renderDronePathOnCanvas();
    }
    
    if (taskAreaPoints.value && taskAreaPoints.value.length > 2) {
      drawTaskAreaOnCanvas(taskAreaPoints.value);
    }
    
    updateCanvasDroneMarker();
  } catch (e) {
    console.error('初始化Canvas失败:', e);
  }
};

// 更新Canvas上的无人机标记
const updateCanvasDroneMarker = () => {
  try {
    const canvas = document.getElementById('canvas-overlay') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    if (!dronePosition.value) return;
    
    // 计算像素坐标
    const pixel = convertGeoToCanvasCoord(dronePosition.value);
    
    // 绘制无人机标记
    ctx.save();
    
    // 绘制圆形背景
    ctx.beginPath();
    ctx.arc(pixel.x, pixel.y, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#FF4500';
    ctx.fill();
    
    // 绘制内圆
    ctx.beginPath();
    ctx.arc(pixel.x, pixel.y, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    
    ctx.restore();
  } catch (e) {
    console.error('Canvas更新无人机标记失败:', e);
  }
};

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
    // 检查是否已经存在加载中的脚本
    if (document.querySelector('script[src*="webapi.amap.com/maps"]')) {
      // 如果脚本正在加载，等待加载完成
      const checkAMap = () => {
        if (typeof (window as any).AMap !== 'undefined') {
          resolve();
        } else {
          setTimeout(checkAMap, 100);
        }
      };
      checkAMap();
      return;
    }
    
    // 创建并加载脚本
    const script = document.createElement('script');
    script.type = 'text/javascript';
    // 使用动态回调名称避免冲突
    const callbackName = 'initAMap_' + Math.random().toString(36).substring(2, 9);
    // 添加应用名称，移除securityCode参数
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${amapKey}&plugin=AMap.Scale,AMap.ToolBar,AMap.Polygon,AMap.HeatMap,AMap.ControlBar,AMap.Weather,AMap.Geocoder&callback=${callbackName}`;
    
    // 将脚本添加到文档
    document.head.appendChild(script);
    
    // 设置全局回调以加载其他插件
    (window as any)[callbackName] = () => {
      // 加载完成后初始化插件
      if ((window as any).AMap) {
        try {
          // 显式加载地理编码插件
          (window as any).AMap.plugin(['AMap.Geocoder'], () => {
            console.log('AMap.Geocoder插件加载成功');
          });
        } catch (error) {
          console.error('AMap插件加载失败:', error);
        }
      }
      // 删除临时回调函数
      setTimeout(() => {
        delete (window as any)[callbackName];
      }, 100);
      resolve();
    };
    
    // 设置超时处理
    const timeout = setTimeout(() => {
      console.error('加载高德地图API超时');
      // 移除脚本元素
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      // 进入Canvas备用模式
      (window as any).usingCanvasMode = true;
      ElMessage({
        message: '地图加载超时，已切换到备用模式',
        type: 'warning',
        duration: 5000
      });
      resolve(); // 仍然解析Promise以继续流程
    }, 10000); // 10秒超时
    
    script.onload = () => {
      clearTimeout(timeout);
      // 验证AMap是否正确加载
      if (typeof (window as any).AMap === 'undefined') {
        console.error('高德地图API未正确加载');
        (window as any).usingCanvasMode = true;
        ElMessage({
          message: '地图API加载异常，已切换到备用模式',
          type: 'warning',
          duration: 5000
        });
      }
    };
    
    script.onerror = (e) => {
      clearTimeout(timeout);
      console.error('加载高德地图API失败:', e);
      // 进入Canvas备用模式
      (window as any).usingCanvasMode = true;
      ElMessage({
        message: '地图加载失败，已切换到备用模式',
        type: 'warning',
        duration: 5000
      });
      resolve(); // 仍然解析Promise以继续流程
    };
  });
};

// 创建地图
const createMap = () => {
  try {
    if (useCanvas.value) {
      console.log('使用Canvas模式，跳过高德地图创建');
      return;
    }
    
    if (!window.AMap) {
      console.error('高德地图API未加载');
      return;
    }
    
    // 创建地图实例，禁用双击缩放等干扰绘图的功能
    mapInstance.value = new window.AMap.Map('amap-container', {
      zoom: 15,
      center: dronePosition.value,
      viewMode: '3D',
      doubleClickZoom: false, // 禁用双击缩放
      zoomEnable: true,      // 允许缩放
      rotateEnable: true,    // 允许旋转
      resizeEnable: true     // 允许调整大小
    });
    
    // 标记地图加载完成
    mapLoaded.value = true;
    
    // 添加控件
    mapInstance.value.addControl(new window.AMap.Scale());
    mapInstance.value.addControl(new window.AMap.ToolBar({
      position: 'RT'
    }));
    
    // 添加无人机标记
    const droneMarker = new window.AMap.Marker({
      position: dronePosition.value,
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(32, 32),
        image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgZmlsbD0iIzAwQjJGRiIgZmlsbC1vcGFjaXR5PSIwLjgiLz48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSI4IiBmaWxsPSJ3aGl0ZSIvPjxjaXJjbGUgY3g9IjE2IiBjeT0iMTYiIHI9IjQiIGZpbGw9IiMwMEIyRkYiLz48cGF0aCBkPSJNMTYgMzJMMTMgMjVIMTlMMTYgMzJaIiBmaWxsPSIjMDBCMkZGIiBmaWxsLW9wYWNpdHk9IjAuOCIvPjwvc3ZnPg==',
        imageSize: new window.AMap.Size(32, 32)
      }),
      offset: new window.AMap.Pixel(-16, -16),
      angle: 0
    });
    mapInstance.value.add(droneMarker);
    
    // 设置地图事件
    if (props.isDrawing) {
      // 在绘图模式中，禁用地图的点击缩放行为
      mapInstance.value.setStatus({
        doubleClickZoom: false,
        zoomToAccuracy: false,
        jogEnable: false
      });
      
      // 为点击事件添加回调，但阻止默认行为
      mapInstance.value.on('click', (e) => {
        // 阻止地图默认的缩放行为
        if (e.originalEvent) {
          e.originalEvent.preventDefault();
          e.originalEvent.stopPropagation();
        }
        handleMapClick(e);
      });
    } else {
      mapInstance.value.on('click', handleMapClick);
    }
    
    // 添加任务区域
    addTaskArea(taskAreaPoints.value);
    
    // 模拟无人机移动
    simulateDroneMovement();
    
    // 添加其他功能
    addSearchNearby();
    addHeatMap();
    showWeatherInfo();
    
  } catch (e) {
    console.error('创建地图失败:', e);
    useCanvas.value = true;
  }
};

// 添加搜索周边功能
const addSearchNearby = () => {
  if (!mapInstance.value || !window.AMap) return;
  
  // 定义不同类型的地点和它们的图标
  const poiTypes = [
    { type: '充电站', icon: 'charging-station', color: '#4CAF50' },
    { type: '停机坪', icon: 'landing-pad', color: '#2196F3' },
    { type: '维修点', icon: 'repair-station', color: '#FF9800' },
    { type: '警卫站', icon: 'security-post', color: '#F44336' }
  ];
  
  // 随机生成各类型的兴趣点
  for (const poi of poiTypes) {
    for (let i = 0; i < 3; i++) {
      // 随机生成在中心点附近的位置
      const offset = 0.01; // 大约1km
      const randomLng = dronePosition.value[0] + (Math.random() * 2 - 1) * offset;
      const randomLat = dronePosition.value[1] + (Math.random() * 2 - 1) * offset;
      
      // 创建标记
      const markerContent = document.createElement('div');
      markerContent.className = 'point-label';
      markerContent.innerHTML = poi.type;
      markerContent.style.borderColor = poi.color;
      
      const marker = new window.AMap.Marker({
        position: [randomLng, randomLat],
        content: markerContent,
        offset: new window.AMap.Pixel(0, -15)
      });
      
      mapInstance.value.add(marker);
    }
  }
};

// 添加热力图
const addHeatMap = () => {
  if (!mapInstance.value || !window.AMap || !window.AMap.HeatMap) return;
  
  // 创建热力图数据
  const heatmapData = {
    max: 100,
    data: [] as Array<{lng: number; lat: number; count: number}>
  };
  
  // 生成热力图数据点
  for (let i = 0; i < 50; i++) {
    // 在中心点周围随机生成点
    const offset = 0.02; // 大约2km
    const randomLng = dronePosition.value[0] + (Math.random() * 2 - 1) * offset;
    const randomLat = dronePosition.value[1] + (Math.random() * 2 - 1) * offset;
    
    heatmapData.data.push({
      lng: randomLng,
      lat: randomLat,
      count: Math.floor(Math.random() * 100)
    });
  }
  
  // 创建热力图实例
  const heatmap = new window.AMap.HeatMap(mapInstance.value, {
    radius: 25,
    opacity: [0, 0.8],
    gradient: {
      0.5: 'blue',
      0.65: 'rgb(117,211,248)',
      0.7: 'rgb(0,255,0)',
      0.9: 'yellow',
      1.0: 'red'
    }
  });
  
  // 设置热力图数据
  heatmap.setDataSet({
    data: heatmapData.data,
    max: heatmapData.max
  });
  
  // 默认不显示热力图
  heatmap.hide();
  
  // 将热力图实例保存以便后续控制
  (window as any).heatmap = heatmap;
};

// 显示天气信息
const showWeatherInfo = () => {
  if (!mapInstance.value || !window.AMap || !window.AMap.Weather) return;
  
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
      
      mapInstance.value.addControl(weatherControl);
    }
  });
};

// 切换任务类型
const switchTaskType = (type: string) => {
  taskType.value = type;
  
  // 根据任务类型调整地图样式
  if (mapInstance.value) {
    switch (type) {
      case 'night':
        mapInstance.value.setMapStyle('amap://styles/dark');
        break;
      case 'satellite':
        mapInstance.value.setMapStyle('amap://styles/satellite');
        break;
      case 'heatmap':
        mapInstance.value.setMapStyle('amap://styles/normal');
        // 显示或隐藏热力图
        const heatmap = (window as any).heatmap;
        if (heatmap) {
          heatmap.show();
        }
        break;
      default:
        mapInstance.value.setMapStyle('amap://styles/normal');
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
    droneInfo: droneInfo,
    taskAreaPoints: areaPoints.value,
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

// 定义Point类型，兼容两种表示形式
type GeoPoint = [number, number];
interface PointObject {
  x: number;
  y: number;
}
interface GeoPointObject {
  lng: number;
  lat: number;
}
type Point = GeoPoint | PointObject | GeoPointObject;

// 把各种点格式转换为[lng, lat]格式
const formatPoint = (point: Point): [number, number] => {
  if (Array.isArray(point) && point.length >= 2) {
    return [point[0], point[1]];
  } else if (typeof point === 'object') {
    if ('lng' in point && 'lat' in point) {
      return [point.lng, point.lat];
    } else if ('x' in point && 'y' in point) {
      return [point.x, point.y];
    }
  }
  console.error('无效的点格式:', point);
  return [0, 0]; // 返回默认值防止错误
};

// 处理地图点击事件
const handleMapClick = (e: any) => {
  try {
    if (!props.isDrawing) return;
    
    // 阻止默认行为，防止地图放大
    if (e.originalEvent) {
      e.originalEvent.preventDefault();
      e.originalEvent.stopPropagation();
    }
    
    // 获取点击位置坐标
    const position = e.lnglat || (e.target && e.target.getPosition ? e.target.getPosition() : null);
    
    if (!position) {
      console.error('无法获取点击位置坐标');
      return;
    }
    
    // 提取经纬度
    let lng = 0, lat = 0;
    if (typeof position.getLng === 'function' && typeof position.getLat === 'function') {
      lng = position.getLng();
      lat = position.getLat();
    } else if ('lng' in position && 'lat' in position) {
      lng = position.lng;
      lat = position.lat;
    } else if (Array.isArray(position) && position.length >= 2) {
      lng = position[0];
      lat = position[1];
    } else {
      console.error('无效的坐标格式');
      return;
    }
    
    // 将点添加到任务区域点
    const newPoint: [number, number] = [lng, lat];
    taskAreaPoints.value.push(newPoint);
    
    console.log(`已添加点 #${taskAreaPoints.value.length}: (${lng}, ${lat})`);
    
    // 如果有足够的点(>=3)，尝试添加任务区域
    if (taskAreaPoints.value.length >= 3) {
      addTaskArea(taskAreaPoints.value);
    }
  } catch (e) {
    console.error('处理地图点击事件出错:', e);
  }
};

// 防抖函数，提高性能
function debounce(fn: Function, delay: number) {
  let timer: any = null;
  return function(this: any, ...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 更新临时多边形
const updateTempPolygon = () => {
  // 如果已经有临时多边形，先移除
  if (tempPolygon.value) {
    mapInstance.value.remove(tempPolygon.value);
  }
  
  // 至少有3个点时才创建多边形
  if (drawingPoints.value.length >= 3) {
    tempPolygon.value = new window.AMap.Polygon({
      path: drawingPoints.value,
      strokeColor: '#00eeff',
      strokeWeight: 2,
      strokeOpacity: 0.8,
      fillColor: '#00eeff',
      fillOpacity: 0.2,
      zIndex: 50
    });
    
    mapInstance.value.add(tempPolygon.value);
  }
};

// 清除绘制状态
const clearDrawing = () => {
  if (!mapInstance.value) return;
  
  // 移除所有标记点
  if (drawingMarkers.value.length > 0) {
    mapInstance.value.remove(drawingMarkers.value);
    drawingMarkers.value = [];
  }
  
  // 移除临时多边形
  if (tempPolygon.value) {
    mapInstance.value.remove(tempPolygon.value);
    tempPolygon.value = null;
  }
  
  // 清空点数组
  drawingPoints.value = [];
};

// 完成绘制，返回地理坐标数组
const finishDrawing = () => {
  if (drawingPoints.value.length < 3) {
    ElMessage.warning('请至少绘制3个点以形成有效区域');
    return null;
  }
  
  const points = drawingPoints.value.map(point => {
    return {
      lng: point[0],
      lat: point[1]
    };
  });
  
  // 清除绘制状态
  clearDrawing();
  
  return points;
};

// 地图截图功能
const captureMapScreenshot = (): string | null => {
  if (!mapLoaded.value) {
    ElMessage.warning('地图未完全加载，请稍后再试');
    return null;
  }

  try {
    // 显示加载消息
    ElMessage.info('正在截取地图，请稍候...');
    
    // 临时隐藏控制按钮和页脚，以免影响截图
    const controlsEl = document.querySelector('.map-controls') as HTMLElement | null;
    const footerEl = document.querySelector('.map-footer') as HTMLElement | null;
    const originalControlsDisplay = controlsEl ? controlsEl.style.display : '';
    const originalFooterDisplay = footerEl ? footerEl.style.display : '';
    
    if (controlsEl) controlsEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'none';
    
    const mapEl = document.getElementById('amap-container');
    if (!mapEl) {
      // 恢复控制按钮显示
      if (controlsEl) controlsEl.style.display = originalControlsDisplay;
      if (footerEl) footerEl.style.display = originalFooterDisplay;
      
      ElMessage.warning('找不到地图容器');
      return null;
    }
    
    // 尝试使用AMap API截图
    if (mapInstance.value && !useCanvas.value && window.AMap && window.AMap.MapScreenshot) {
      try {
        console.log('使用AMap API截图');
        mapInstance.value.plugin(['AMap.MapScreenshot'], () => {
          const screenshot = new window.AMap.MapScreenshot();
          screenshot.getCanvas(mapInstance.value, (canvas: HTMLCanvasElement) => {
            // 恢复控制按钮显示
            if (controlsEl) controlsEl.style.display = originalControlsDisplay;
            if (footerEl) footerEl.style.display = originalFooterDisplay;
            
            const imgDataUrl = canvas.toDataURL('image/png');
            showAreaSelector(imgDataUrl);
          });
        });
        return null;
      } catch (e) {
        console.error('AMap截图失败，尝试使用html2canvas:', e);
      }
    }
    
    // 如果AMap API不可用或截图失败，使用html2canvas
    console.log('使用html2canvas截图');
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(mapEl, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        scale: window.devicePixelRatio // 使用设备像素比以获得更高质量
      }).then(canvas => {
        // 恢复控制按钮显示
        if (controlsEl) controlsEl.style.display = originalControlsDisplay;
        if (footerEl) footerEl.style.display = originalFooterDisplay;
        
        const imgDataUrl = canvas.toDataURL('image/png');
        console.log('截图已生成，URL长度:', imgDataUrl.length);
        showAreaSelector(imgDataUrl);
      }).catch(err => {
        console.error('截图失败:', err);
        
        // 恢复控制按钮显示
        if (controlsEl) controlsEl.style.display = originalControlsDisplay;
        if (footerEl) footerEl.style.display = originalFooterDisplay;
        
        ElMessage.error('截图失败，请重试');
      });
    }).catch(err => {
      console.error('加载html2canvas失败:', err);
      
      // 恢复控制按钮显示
      if (controlsEl) controlsEl.style.display = originalControlsDisplay;
      if (footerEl) footerEl.style.display = originalFooterDisplay;
      
      ElMessage.error('截图功能加载失败');
    });
    
    return null;
  } catch (e) {
    console.error('截图过程发生错误:', e);
    ElMessage.error('截图功能出错，请重试');
    return null;
  }
};

// 显示区域选择器
const showAreaSelector = (imgUrl: string) => {
  // 创建一个固定的容器
  const selectorContainer = document.createElement('div');
  selectorContainer.id = 'area-selector-container';
  selectorContainer.style.position = 'fixed';
  selectorContainer.style.top = '0';
  selectorContainer.style.left = '0';
  selectorContainer.style.width = '100%';
  selectorContainer.style.height = '100%';
  selectorContainer.style.backgroundColor = 'rgba(0,0,0,0.8)';
  selectorContainer.style.zIndex = '9999';
  selectorContainer.style.display = 'flex';
  selectorContainer.style.flexDirection = 'column';
  selectorContainer.style.justifyContent = 'center';
  selectorContainer.style.alignItems = 'center';
  selectorContainer.style.padding = '20px';
  
  // 创建标题
  const title = document.createElement('h2');
  title.textContent = '请在地图上选择任务区域';
  title.style.color = '#fff';
  title.style.marginBottom = '10px';
  
  // 添加说明文字
  const instructions = document.createElement('p');
  instructions.textContent = '点击地图上的位置来绘制区域，至少需要3个点。完成后点击确认按钮。';
  instructions.style.color = '#ccc';
  instructions.style.marginBottom = '20px';
    
  // 创建图片容器
  const imageContainer = document.createElement('div');
  imageContainer.style.position = 'relative';
  imageContainer.style.maxWidth = '90%';
  imageContainer.style.maxHeight = '70vh';
  imageContainer.style.margin = '0 auto';
  imageContainer.style.border = '2px solid #444';
  imageContainer.style.overflow = 'hidden';
  
  // 创建地图图片
  const mapImage = document.createElement('img');
  mapImage.src = imgUrl;
  mapImage.style.maxWidth = '100%';
  mapImage.style.maxHeight = '100%';
  mapImage.style.display = 'block';
  
  // 创建绘制区域的canvas覆盖层
    const drawCanvas = document.createElement('canvas');
    drawCanvas.style.position = 'absolute';
    drawCanvas.style.top = '0';
    drawCanvas.style.left = '0';
    drawCanvas.style.width = '100%';
    drawCanvas.style.height = '100%';
    drawCanvas.style.cursor = 'crosshair';
  
  // 添加图片加载事件
  mapImage.onload = () => {
    // 调整canvas的尺寸以匹配图片
    drawCanvas.width = mapImage.width;
    drawCanvas.height = mapImage.height;
    console.log('绘图Canvas尺寸调整为:', drawCanvas.width, 'x', drawCanvas.height);
  };
  
  // 添加图片和canvas到容器
  imageContainer.appendChild(mapImage);
  imageContainer.appendChild(drawCanvas);
  
  // 创建按钮容器
  const buttonContainer = document.createElement('div');
  buttonContainer.style.display = 'flex';
  buttonContainer.style.justifyContent = 'center';
  buttonContainer.style.gap = '10px';
  buttonContainer.style.marginTop = '20px';
  
  // 创建确认按钮（初始禁用）
  const confirmButton = document.createElement('button');
  confirmButton.textContent = '确认选择';
  confirmButton.style.padding = '8px 16px';
  confirmButton.style.backgroundColor = '#3b82f6';
  confirmButton.style.color = 'white';
  confirmButton.style.border = 'none';
  confirmButton.style.borderRadius = '4px';
  confirmButton.style.cursor = 'not-allowed';
  confirmButton.style.opacity = '0.5';
  confirmButton.disabled = true;
  
  // 创建重置按钮
  const resetButton = document.createElement('button');
  resetButton.textContent = '重置选择';
  resetButton.style.padding = '8px 16px';
  resetButton.style.backgroundColor = '#475569';
  resetButton.style.color = 'white';
  resetButton.style.border = 'none';
  resetButton.style.borderRadius = '4px';
  resetButton.style.cursor = 'pointer';
  
  // 创建取消按钮
  const cancelButton = document.createElement('button');
  cancelButton.textContent = '取消';
  cancelButton.style.padding = '8px 16px';
  cancelButton.style.backgroundColor = '#475569';
  cancelButton.style.color = 'white';
  cancelButton.style.border = 'none';
  cancelButton.style.borderRadius = '4px';
  cancelButton.style.cursor = 'pointer';
  
  // 添加按钮到容器
  buttonContainer.appendChild(confirmButton);
  buttonContainer.appendChild(resetButton);
  buttonContainer.appendChild(cancelButton);
  
  // 添加所有元素到主容器
  selectorContainer.appendChild(title);
  selectorContainer.appendChild(instructions);
  selectorContainer.appendChild(imageContainer);
  selectorContainer.appendChild(buttonContainer);
  
  // 将选择器添加到页面
  document.body.appendChild(selectorContainer);
  
  // 绘图状态变量
  let isDrawing = false;
  
  // 存储绘制的点（使用PointObject类型）
  const points: PointObject[] = [];
  
  // 获取画布上下文
  const ctx = drawCanvas.getContext('2d');
  if (!ctx) {
    ElMessage.error('无法创建绘图上下文');
    return;
  }
  
  // 绘制点和线的函数
  const drawPoints = () => {
    // 清除画布
    ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    
    // 绘制已选择的点
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    
    // 绘制线条连接点
    if (points.length > 1) {
      ctx.beginPath();
      
      // 安全获取第一个点的坐标
      const firstPoint = points[0];
      ctx.moveTo(firstPoint.x, firstPoint.y);
      
      for (let i = 1; i < points.length; i++) {
        const point = points[i];
        ctx.lineTo(point.x, point.y);
      }
      
      // 如果有至少3个点，闭合多边形
      if (points.length >= 3) {
        ctx.lineTo(points[0].x, points[0].y);
      }
      
      ctx.stroke();
      
      // 如果至少有3个点，填充区域
      if (points.length >= 3) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
        ctx.fill();
      }
    }
    
    // 绘制点
    points.forEach((point, index) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 显示点的序号
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(String(index + 1), point.x + 8, point.y - 8);
    });
    
    // 更新确认按钮状态 - 确保有至少3个点才能确认
    if (points.length >= 3) {
      confirmButton.disabled = false;
      confirmButton.style.opacity = '1';
      confirmButton.style.cursor = 'pointer';
      console.log('已启用确认按钮，当前点数:', points.length);
    } else {
      confirmButton.disabled = true;
      confirmButton.style.opacity = '0.5';
      confirmButton.style.cursor = 'not-allowed';
      console.log('已禁用确认按钮，当前点数:', points.length);
    }
  };
  
  // 定义handleLocalConfirmClick函数
  const handleLocalConfirmClick = () => {
    // 显式检测点的数量
    console.log('确认选择，点数量:', points.length);
    
    // 确保有足够的点
    if (points.length < 3) {
      ElMessage.warning('请至少绘制3个点以形成有效区域');
      return;
    }
    
    try {
      // 将画布坐标转换为地理坐标
      const geoPoints: [number, number][] = [];
      for (const point of points) {
        try {
          const geoPoint = convertPixelToGeo(point.x, point.y, drawCanvas.width, drawCanvas.height);
          // 验证转换后的点是否有效
          if (isNaN(geoPoint[0]) || isNaN(geoPoint[1]) || 
              !isFinite(geoPoint[0]) || !isFinite(geoPoint[1])) {
            console.error('无效的地理坐标点:', geoPoint);
            continue;
          }
          geoPoints.push(geoPoint);
        } catch (err) {
          console.error('转换点时出错:', err);
        }
      }
      
      // 确保转换后仍有足够的点
      if (geoPoints.length < 3) {
        ElMessage.warning('有效点数不足，无法形成区域，请重新绘制');
        return;
      }
      
      console.log('转换后的地理坐标点:', geoPoints);
      
      // 更新任务区域点
      taskAreaPoints.value = geoPoints;
      
      // 添加任务区域到地图
      addTaskArea(geoPoints);
      
      // 更新任务区域截图
      setTimeout(() => {
        updateTaskAreaScreenshot();
      }, 300); // 延迟截图，确保地图已更新
      
      // 移除选择器
      document.body.removeChild(selectorContainer);
      
      // 显示成功消息
      ElMessage.success('任务区域设置成功');
    } catch (e) {
      console.error('处理任务区域时出错:', e);
      ElMessage.error('处理任务区域失败，请重试');
    }
  };
  
  // 监听Canvas上的点击事件
  drawCanvas.addEventListener('click', (e: MouseEvent) => {
    // 获取点击位置相对于Canvas的坐标
    const rect = drawCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (drawCanvas.width / rect.width);
    const y = (e.clientY - rect.top) * (drawCanvas.height / rect.height);
    
    // 添加点
    points.push({ x, y });
    console.log(`添加点 #${points.length}: (${x}, ${y})`);
    
    // 重新绘制
    drawPoints();
    
    // 打印当前点的数量，方便调试
    console.log(`当前已绘制 ${points.length} 个点，points数组:`, JSON.stringify(points));
  });
  
  // 重置按钮事件
  resetButton.addEventListener('click', () => {
    points.length = 0;
    drawPoints();
    console.log('已重置所有点');
  });
  
  // 取消按钮事件
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(selectorContainer);
    console.log('已取消区域选择');
  });
  
  // 确认按钮事件
  confirmButton.addEventListener('click', handleLocalConfirmClick);
};

// 像素坐标转地理坐标
const convertPixelToGeo = (x: number, y: number, width: number, height: number): [number, number] => {
  // 确保地图已初始化
  if (!mapInstance.value) {
    console.error('地图未初始化，无法进行坐标转换');
    return [0, 0]; // 返回默认值
  }
  
  try {
    // 获取地图的边界
    const bounds = mapInstance.value.getBounds();
    if (!bounds || !bounds.northeast || !bounds.southwest) {
      console.error('无法获取有效的地图边界', bounds);
      return [0, 0];
    }
    
    const ne = bounds.northeast;
    const sw = bounds.southwest;
    
    // 安全检查：确保边界点有效
    if (!ne || !sw || typeof ne.lng !== 'number' || typeof ne.lat !== 'number' || 
        typeof sw.lng !== 'number' || typeof sw.lat !== 'number') {
      console.error('地图边界点无效', ne, sw);
      return [0, 0];
    }
    
    // 将像素坐标转换为地理坐标的比例
    const lngRatio = (ne.lng - sw.lng) / width;
    const latRatio = (ne.lat - sw.lat) / height;
    
    // 计算地理坐标
    const lng = sw.lng + x * lngRatio;
    const lat = ne.lat - y * latRatio;
    
    console.log(`像素坐标 (${x}, ${y}) 转换为地理坐标 [${lng}, ${lat}]`);
    
    return [lng, lat];
  } catch (e) {
    console.error('坐标转换失败:', e);
    return [0, 0]; // 返回默认值
  }
};

// 添加信息窗口
const addInfoWindow = (position: any, content: string) => {
  if (!mapInstance.value || !window.AMap) {
    console.error('地图实例或AMap未初始化，使用备用Canvas方式');
    return addCanvasInfoWindow(position, content);
  }
  
  try {
    // 先清除之前的信息窗口
    try {
      const overlays = mapInstance.value.getAllOverlays('infoWindow');
      if (overlays && Array.isArray(overlays) && overlays.length > 0) {
        overlays.forEach((overlay: any) => {
          mapInstance.value.remove(overlay);
        });
      }
    } catch (e) {
      console.error('清除旧信息窗口失败:', e);
    }
    
    // 创建新的信息窗口
    try {
      const infoWindow = new window.AMap.InfoWindow({
        content: `<div class="info-window-content">${content}</div>`,
        anchor: 'bottom-center',
        offset: new window.AMap.Pixel(0, -10),
        closeWhenClickMap: true,
        autoMove: true,
        retainWhenClose: false // 关闭时移除DOM
      });
      
      if (Array.isArray(position) && position.length === 2) {
        // 如果是经纬度数组，直接使用
        infoWindow.open(mapInstance.value, position);
      } else if (position && typeof position === 'object' && position.lng && position.lat) {
        // 如果是LngLat对象，转换为数组
        infoWindow.open(mapInstance.value, [position.lng, position.lat]);
      } else if (position && typeof position === 'object' && position.getPosition) {
        // 如果是Marker对象，获取其位置
        infoWindow.open(mapInstance.value, position.getPosition());
      } else {
        console.error('无效的位置信息:', position);
        throw new Error('无效的位置信息');
      }
      
      return infoWindow;
    } catch (e) {
      console.error('创建信息窗口失败，使用备用方式:', e);
      return addCanvasInfoWindow(position, content);
    }
  } catch (e) {
    console.error('添加信息窗口失败:', e);
    return addCanvasInfoWindow(position, content);
  }
};

// 添加Canvas模式的信息窗口（备用方案）
const addCanvasInfoWindow = (position: any, content: string) => {
  try {
    // 清除所有现有的备用信息窗口
    document.querySelectorAll('.canvas-info-window').forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    
    // 创建DOM元素直接显示
    const infoDiv = document.createElement('div');
    infoDiv.className = 'canvas-info-window';
    infoDiv.innerHTML = content;
    infoDiv.style.position = 'absolute';
    infoDiv.style.backgroundColor = 'white';
    infoDiv.style.border = '1px solid #ccc';
    infoDiv.style.borderRadius = '4px';
    infoDiv.style.padding = '8px';
    infoDiv.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    infoDiv.style.zIndex = '160';
    infoDiv.style.maxWidth = '280px';
    
    // 添加关闭按钮
    const closeButton = document.createElement('div');
    closeButton.innerHTML = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '2px';
    closeButton.style.right = '6px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '16px';
    closeButton.onclick = () => {
      if (infoDiv.parentNode) {
        infoDiv.parentNode.removeChild(infoDiv);
      }
    };
    
    infoDiv.appendChild(closeButton);
    
    // 添加到地图容器
    const mapContainer = document.getElementById('amap-container');
    if (mapContainer) {
      mapContainer.appendChild(infoDiv);
      
      // 在右下角固定位置显示，避免坐标转换问题
      infoDiv.style.bottom = '10px';
      infoDiv.style.right = '10px';
      infoDiv.style.left = 'auto';
      infoDiv.style.top = 'auto';
      
      // 自动移除
      setTimeout(() => {
        if (infoDiv.parentNode) {
          infoDiv.parentNode.removeChild(infoDiv);
        }
      }, 10000);
    }
    
    return infoDiv;
  } catch (backupError) {
    console.error('备用信息窗口也失败:', backupError);
    return null;
  }
};

// 在模式切换或初始化时清除已有点
const clearAllMapPoints = () => {
  try {
    if (!mapInstance.value) return;
    
    if (useCanvas.value) {
      // Canvas模式下清除
      clearCanvasPoints();
      return;
    }
    
    // AMap模式下清除
    if (window.AMap) {
      try {
        // 清除所有标记和图形
        mapInstance.value.clearMap();
        
        // 重新添加无人机标记
        if (droneMarker.value) {
          mapInstance.value.add(droneMarker.value);
        }
      } catch (e) {
        console.error('清除高德地图点位失败:', e);
      }
    }
  } catch (e) {
    console.error('清除地图点位失败:', e);
  }
};

// 监听taskType变化，在模式切换时清除点
watch(() => taskType.value, (newType, oldType) => {
  if (newType !== oldType) {
    // 延迟执行以确保地图已完全加载
    setTimeout(() => {
      clearAllMapPoints();
    }, 200);
  }
});

// 获取电池状态样式类
const getBatteryClass = () => {
  if (!droneInfo.battery) return '';
  if (droneInfo.battery > 50) return 'good';
  if (droneInfo.battery > 20) return 'warning';
  return 'danger';
};

// 获取信号状态样式类
const getSignalClass = () => {
  if (!droneInfo.signal) return '';
  if (droneInfo.signal > 70) return 'good';
  if (droneInfo.signal > 30) return 'warning';
  return 'danger';
};

// 添加任务区域
const addTaskArea = (points: Array<[number, number]>) => {
  try {
    // 检查地图是否已初始化
    if (!mapInstance.value || !window.AMap) {
      console.warn('无法添加任务区域：地图未初始化或点数不足');
      return;
    }
    
    // 确保有足够的点
    if (!points || points.length < 3) {
      console.warn('无法添加任务区域：点数不足，需要至少3个点');
      return;
    }
    
    console.log('添加任务区域，点数:', points.length);
    
    // 清除之前的任务区域
    clearTaskArea();
    
    // 使用高德地图API创建多边形区域
    if (!useCanvas.value) {
      try {
        // 创建多边形
        taskAreaPolygon.value = new window.AMap.Polygon({
          path: points,
          strokeColor: '#3B82F6',
          strokeWeight: 2,
          strokeOpacity: 0.8,
          fillColor: '#3B82F6',
          fillOpacity: 0.3,
          zIndex: 50
        });
        
        // 添加到地图
        mapInstance.value.add(taskAreaPolygon.value);
        
        // 自动适应视图以显示整个区域
        mapInstance.value.setFitView([taskAreaPolygon.value]);
        
        // 添加区域标签
        addTaskAreaLabel(points);
        
        console.log('任务区域添加成功');
      } catch (e) {
        console.error('使用高德地图添加任务区域失败:', e);
        // 如果高德地图添加失败，回退到Canvas模式
        drawTaskAreaOnCanvas(points);
      }
    } else {
      // 使用Canvas绘制任务区域
      drawTaskAreaOnCanvas(points);
    }
    
    // 更新任务区域信息
    calculateTaskAreaInfo(points);
    
    // 更新任务区域截图
    updateTaskAreaScreenshot();
    
  } catch (e) {
    console.error('无法添加任务区域:', e);
  }
};

// 清除任务区域
const clearTaskArea = () => {
  try {
    // 如果是Canvas模式，清除画布上的任务区域
    if (useCanvas.value) {
      const canvas = document.getElementById('canvas-overlay') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
    
    // 如果是AMap模式，移除多边形
    if (!useCanvas.value && mapInstance.value && taskAreaPolygon.value) {
      mapInstance.value.remove(taskAreaPolygon.value);
      taskAreaPolygon.value = null;
    }
    
    // 重置任务区域点
    taskAreaPoints.value = [];
    taskAreaCenter.value = null;
  } catch (e) {
    console.error('清除任务区域失败:', e);
  }
};

// 计算任务区域信息
const calculateTaskAreaInfo = (points: Array<[number, number]>) => {
  if (!points || points.length < 3) return;
  
  try {
    // 计算区域中心点
    const center = calculatePolygonCenter(points);
    taskAreaCenter.value = center;
    
    // 计算区域面积（简化计算）
    // 这里可以添加更复杂的面积计算逻辑
    
    console.log('任务区域中心点:', center);
  } catch (e) {
    console.error('计算任务区域信息失败:', e);
  }
};

// 在Canvas上清除点位
const clearCanvasPoints = () => {
  try {
    const canvas = document.getElementById('canvas-overlay') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  } catch (e) {
    console.error('清除Canvas点位失败:', e);
  }
};

// 在Canvas上绘制任务区域 - 修复类型错误
const drawTaskAreaOnCanvas = (points: Point[]) => {
  const canvas = document.getElementById('canvas-overlay') as HTMLCanvasElement;
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  
  // 清除之前的绘制
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (points.length < 3) return;
  
  // 绘制区域
  ctx.beginPath();
  
  // 安全获取第一个点
  const firstPoint = formatPoint(points[0]);
  const canvasPoint1 = convertGeoToCanvasCoord(firstPoint);
  
  ctx.moveTo(canvasPoint1.x, canvasPoint1.y);
  
  // 绘制连接线
  for (let i = 1; i < points.length; i++) {
    const geoPoint = formatPoint(points[i]);
    const canvasPoint = convertGeoToCanvasCoord(geoPoint);
    ctx.lineTo(canvasPoint.x, canvasPoint.y);
  }
  
  // 闭合路径
  ctx.closePath();
  
  // 设置样式并填充
  ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
  ctx.fill();
  
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  // 计算并绘制中心标签
  const center = calculatePolygonCenter(points.map(formatPoint));
  if (center) {
    const centerPoint = convertGeoToCanvasCoord(center);
    
    // 绘制标签背景
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.rect(centerPoint.x - 30, centerPoint.y - 10, 60, 20);
    ctx.fill();
    
    // 绘制文本
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('任务区域', centerPoint.x, centerPoint.y);
  }
};

// 将地理坐标转换为Canvas坐标
const convertGeoToCanvasCoord = (point: GeoPoint | GeoPointObject): { x: number; y: number } => {
  try {
    const canvas = document.getElementById('canvas-overlay') as HTMLCanvasElement;
    if (!canvas) return { x: 0, y: 0 };
    
    // 将点转换为[lng, lat]标准格式
    let lng: number, lat: number;
    if (Array.isArray(point)) {
      [lng, lat] = point;
    } else {
      lng = point.lng;
      lat = point.lat;
    }
    
    // 使用地图边界计算像素位置
    const mapBounds = mapInstance.value ? mapInstance.value.getBounds() : {
      getSouthWest: () => ({ lng: 116.38, lat: 39.9 }),
      getNorthEast: () => ({ lng: 116.42, lat: 39.94 })
    };
    
    const sw = mapBounds.getSouthWest();
    const ne = mapBounds.getNorthEast();
    
    const lngSpan = ne.lng - sw.lng;
    const latSpan = ne.lat - sw.lat;
    
    // 经纬度转换为画布坐标
    const x = ((lng - sw.lng) / lngSpan) * canvas.width;
    const y = ((ne.lat - lat) / latSpan) * canvas.height;
    
    return { x, y };
  } catch (e) {
    console.error('地理坐标转Canvas坐标失败:', e);
    return { x: 0, y: 0 };
  }
};

// 模拟无人机运动
const simulateDroneMovement = () => {
  if (!mapInstance.value) return;
  
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
  
  // 清除现有计时器
  if (droneTimer.value !== null) {
    clearInterval(droneTimer.value);
    droneTimer.value = null;
  }
  
  // 设置模拟移动的计时器
  droneTimer.value = window.setInterval(() => {
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
    
    // 更新无人机标记位置和路径
    updateDroneMarker();
    updateDronePath();
    
    // 更新无人机信息
    updateDroneInfo();
  }, 500);
};

// 更新无人机路径
const updateDronePath = () => {
  try {
    // 检查地图实例
    if (!mapInstance.value || !dronePath.value || dronePath.value.length === 0) {
      console.warn('地图实例不存在或无人机路径为空，跳过路径更新');
      return;
    }
    
    // Canvas模式下的路径更新
    if (useCanvas.value) {
      const canvas = document.getElementById('canvas-overlay') as HTMLCanvasElement;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // 清除旧路径区域
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
      initCanvas(); // 重新初始化画布，保留其他元素
      
      // 绘制路径
      if (dronePath.value.length > 1) {
        renderDronePathOnCanvas();
      }
      
      return;
    }
    
    // AMap模式下的路径更新
    // 先移除现有路径
    try {
      if (dronePathPolyline.value) {
        // 检查dronePathPolyline是否为有效对象
        if (typeof dronePathPolyline.value === 'object' && dronePathPolyline.value !== null) {
          mapInstance.value.remove(dronePathPolyline.value);
        }
        dronePathPolyline.value = null;
      }
    } catch (e) {
      console.warn('移除旧路径失败:', e);
      // 重置变量以避免重复错误
      dronePathPolyline.value = null;
    }
    
    // 确保有足够的点来创建路径
    if (dronePath.value.length < 2) return;
    
    // ⭐⭐⭐关键修复：检查AMap对象是否可用，避免使用未加载的AMap实例⭐⭐⭐
    if (!window.AMap) {
      console.error('AMap未加载，无法创建路径');
      return;
    }
    
    try {
      // 创建新的路径线
      if (!window.AMap.Polyline) {
        console.error('AMap.Polyline未加载，无法创建路径');
        return;
      }
      
      dronePathPolyline.value = new window.AMap.Polyline({
        path: dronePath.value,
        strokeColor: '#1890ff',
        strokeWeight: 4,
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
        borderWeight: 1,
        borderColor: '#ffffff',
        lineJoin: 'round'
      });
      
      // ⭐⭐⭐关键修复：确保地图实例已完全初始化且存在add方法⭐⭐⭐
      if (mapInstance.value && typeof mapInstance.value.add === 'function') {
        console.log('准备添加路径到地图，地图实例:', !!mapInstance.value);
        mapInstance.value.add(dronePathPolyline.value);
        console.log('路径已添加到地图');
      } else {
        console.error('地图实例不可用或add方法不存在');
      }
    } catch (e) {
      console.error('创建无人机路径失败:', e);
      dronePathPolyline.value = null;
    }
    
  } catch (e) {
    console.error('更新高德地图无人机路径失败:', e);
  }
};

// 清除无人机路径
const clearDronePath = () => {
  try {
    if (!useCanvas.value && mapInstance.value && dronePathLine.value) {
      try {
        mapInstance.value.remove(dronePathLine.value);
        dronePathLine.value = null;
      } catch (e) {
        console.error('清除无人机路径失败:', e);
      }
    } else if (useCanvas.value) {
      // 在Canvas上清除路径
      const canvas = document.getElementById('canvas-overlay') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // 仅清除路径部分，然后重新绘制其他元素
          initCanvas();
        }
      }
    }
  } catch (e) {
    console.error('清除路径出错:', e);
  }
};

// 在Canvas上渲染无人机路径
const renderDronePathOnCanvas = () => {
  try {
    const canvas = document.getElementById('canvas-overlay') as HTMLCanvasElement;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 绘制路径
    ctx.save();
    
    // 绘制无人机轨迹
    ctx.beginPath();
    
    for (let i = 0; i < dronePath.value.length; i++) {
      const point = dronePath.value[i];
      const pixel = convertGeoToCanvasCoord(point);
      
      if (i === 0) {
        ctx.moveTo(pixel.x, pixel.y);
      } else {
        ctx.lineTo(pixel.x, pixel.y);
      }
    }
    
    // 设置路径样式
    ctx.strokeStyle = '#FF4500';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.restore();
  } catch (e) {
    console.error('Canvas渲染无人机路径失败:', e);
  }
};

// 获取当前位置
const getCurrentLocation = () => {
  try {
    // 首先尝试使用浏览器地理定位API
    if (navigator.geolocation) {
      ElMessage.info('正在获取当前位置...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          ElMessage.success('已获取当前位置');
          
          // 更新地图中心
          updateMapCenter([lng, lat]);
        },
        (error) => {
          console.error('地理定位失败:', error);
          ElMessage.error('无法获取当前位置，使用默认位置');
          
          // 使用默认IP定位
          useIpLocation();
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      ElMessage.warning('您的浏览器不支持地理定位，使用默认位置');
      useIpLocation();
    }
  } catch (e) {
    console.error('获取当前位置失败:', e);
    ElMessage.error('获取位置时出错，使用默认位置');
    useIpLocation();
  }
};

// 使用IP定位
const useIpLocation = () => {
  try {
    // 这里应该调用IP定位服务
    // 由于这是示例，我们直接使用默认位置
    const defaultLocation: [number, number] = [116.397428, 39.90923];
    updateMapCenter(defaultLocation);
  } catch (e) {
    console.error('IP定位失败:', e);
  }
};

// 更新地图中心
const updateMapCenter = (center: [number, number]) => {
  try {
    centerPosition.value = center;
    
    if (!useCanvas.value && mapInstance.value) {
      // AMap模式下更新中心点
      try {
        mapInstance.value.setCenter(center);
      } catch (e) {
        console.error('更新高德地图中心点失败:', e);
      }
    } else {
      // Canvas模式下更新中心点
      // 重新渲染Canvas
      initCanvas();
    }
    
    // 更新无人机位置
    dronePosition.value = center;
    updateDroneMarker();
    
    // 更新无人机信息
    updateDroneInfo();
  } catch (e) {
    console.error('更新地图中心点失败:', e);
  }
};

// 更新无人机标记位置
const updateDroneMarker = () => {
  if (!mapInstance.value) return;
  
  try {
    if (useCanvas.value) {
      // Canvas模式下更新标记
      updateCanvasDroneMarker();
      return;
    }
    
    // AMap模式下更新标记
    if (window.AMap && droneMarker.value) {
      try {
        droneMarker.value.setPosition(dronePosition.value);
      } catch (e) {
        console.error('更新高德地图无人机标记失败:', e);
      }
    }
  } catch (e) {
    console.error('更新无人机标记失败:', e);
  }
};

// 更新无人机信息
const updateDroneInfo = () => {
  if (!mapInstance.value) return;
  
  // 生成无人机信息HTML内容
  const content = `
    <div class="drone-info-window">
      <div class="drone-info-header">
        <strong>${droneInfo.id}</strong>
        <span class="drone-status">${droneInfo.status}</span>
      </div>
      <div class="drone-info-body">
        <div class="info-row">
          <span class="info-label">电量:</span>
          <span class="info-value">${droneInfo.battery}%</span>
        </div>
        <div class="info-row">
          <span class="info-label">高度:</span>
          <span class="info-value">${droneInfo.altitude}m</span>
        </div>
        <div class="info-row">
          <span class="info-label">速度:</span>
          <span class="info-value">${droneInfo.speed}km/h</span>
        </div>
        <div class="info-row">
          <span class="info-label">信号:</span>
          <span class="info-value">${droneInfo.signal}%</span>
        </div>
      </div>
    </div>
  `;
  
  // 检查应用模式
  if (useCanvas.value) {
    try {
      const mapContainer = document.getElementById('amap-container');
      if (mapContainer) {
        // 在右下角固定显示信息
        updateCanvasDroneInfo(content);
      }
    } catch (e) {
      console.error('Canvas模式更新无人机信息失败:', e);
    }
    return;
  }
  
  // AMap模式 - 尝试创建信息窗口
  try {
    // 仅在标准模式下显示信息窗口
    if (taskType.value === 'normal' && props.showDroneInfo) {
      // 使用timeout确保地图加载完成
      setTimeout(() => {
        try {
          addInfoWindow(dronePosition.value, content);
        } catch (e) {
          console.error('添加信息窗口失败，使用备用方式:', e);
          addCanvasInfoWindow(dronePosition.value, content);
        }
      }, 100);
    }
  } catch (e) {
    console.error('更新无人机信息失败:', e);
  }
};

// Canvas模式下更新无人机信息
const updateCanvasDroneInfo = (content: string) => {
  try {
    // 先移除可能存在的旧信息窗口
    document.querySelectorAll('.drone-info-container').forEach(el => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    });
    
    // 只在任务类型为normal且需要显示无人机信息时显示
    if (taskType.value !== 'normal' || !props.showDroneInfo) {
      return;
    }
    
    // 创建固定位置的信息容器
    const container = document.createElement('div');
    container.className = 'drone-info-container';
    container.innerHTML = content;
    container.style.position = 'absolute';
    container.style.bottom = '80px';
    container.style.right = '10px';
    container.style.backgroundColor = 'white';
    container.style.padding = '10px';
    container.style.borderRadius = '4px';
    container.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    container.style.zIndex = '100';
    container.style.maxWidth = '250px';
    
    // 添加到地图容器
    const mapContainer = document.getElementById('amap-container');
    if (mapContainer) {
      mapContainer.appendChild(container);
    }
  } catch (e) {
    console.error('更新Canvas无人机信息失败:', e);
  }
};

// 更新任务区域截图
const updateTaskAreaScreenshot = () => {
  try {
    console.log('开始更新任务区域截图...');
    const mapEl = document.getElementById('amap-container');
    if (!mapEl) {
      console.error('找不到地图容器');
      ElMessage.warning('无法找到地图容器，截图失败');
      return;
    }
    
    // 确保地图区域有实际尺寸
    if (mapEl.offsetWidth === 0 || mapEl.offsetHeight === 0) {
      console.error('地图容器尺寸为0，无法截图');
      ElMessage.warning('地图区域不可见，无法截图');
      return;
    }
    
    // 添加正在处理的提示
    const loadingMsg = ElMessage({
      message: '正在处理任务区域截图...',
      type: 'info',
      duration: 0 // 不自动关闭
    });
    
    // 优先使用AMap的原生截图功能
    if (mapInstance.value && window.AMap && mapInstance.value.getContainer) {
      try {
        console.log('尝试使用AMap原生截图功能');
        const plugin = 'AMap.ToolBar';
        
        // 加载工具条插件
        window.AMap.plugin([plugin], () => {
          // 通过引用获取实例
          const containerNode = mapInstance.value.getContainer();
          
          if (containerNode) {
            // 调用原生截图
            window.AMap.DomUtil.getScreenshot(containerNode, {
              type: 'png',
              quality: 0.95
            }).then((imgDataUrl: string) => {
              // 更新截图值
              taskAreaScreenshot.value = imgDataUrl;
              // 显式触发事件
              emit('update:taskAreaScreenshot', imgDataUrl);
              console.log('AMap原生截图成功', imgDataUrl.substring(0, 50) + '...');
              
              loadingMsg.close();
              ElMessage.success('任务区域截图已更新');
            }).catch((err: any) => {
              console.error('AMap截图失败，回退到html2canvas:', err);
              useHtml2Canvas();
            });
          } else {
            console.error('无法获取地图容器节点');
            useHtml2Canvas();
          }
        });
      } catch (mapErr) {
        console.error('AMap截图功能失败:', mapErr);
        useHtml2Canvas();
      }
    } else {
      console.log('AMap实例不可用，使用html2canvas');
      useHtml2Canvas();
    }
    
    // 使用html2canvas的备用方法
    function useHtml2Canvas() {
      import('html2canvas').then(({ default: html2canvas }) => {
        // 临时隐藏可能导致跨域问题的元素
        const elementsToHide = mapEl.querySelectorAll('img[crossorigin], iframe, .amap-logo, .amap-copyright');
        const originalDisplay: {el: Element, style: string}[] = [];
        
        elementsToHide.forEach(el => {
          originalDisplay.push({el, style: (el as HTMLElement).style.display});
          (el as HTMLElement).style.display = 'none';
        });
        
        // 设置选项以提高质量和处理跨域问题
        html2canvas(mapEl, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#FFFFFF',
          logging: false,
          scale: 1, // 使用固定比例避免可能的缩放问题
          ignoreElements: (element) => {
            return element.classList?.contains('amap-copyright') || 
                  element.classList?.contains('amap-logo') ||
                  element.tagName === 'IFRAME';
          }
        }).then(canvas => {
          // 恢复隐藏的元素
          originalDisplay.forEach(item => {
            (item.el as HTMLElement).style.display = item.style;
          });
          
          // 转换为数据URL
          const imgDataUrl = canvas.toDataURL('image/png');
          
          // 检查生成的URL是否有效
          if (!imgDataUrl || imgDataUrl === 'data:,' || imgDataUrl === 'data:image/png;base64,') {
            console.error('生成的图片URL无效');
            loadingMsg.close();
            ElMessage.error('截图生成失败，请重试');
            return;
          }
          
          // 更新截图值
          taskAreaScreenshot.value = imgDataUrl;
          // 显式触发事件
          emit('update:taskAreaScreenshot', imgDataUrl);
          console.log('html2canvas截图成功', imgDataUrl.substring(0, 50) + '...');
          
          loadingMsg.close();
          ElMessage.success('任务区域截图已更新');
        }).catch(err => {
          // 恢复隐藏的元素
          originalDisplay.forEach(item => {
            (item.el as HTMLElement).style.display = item.style;
          });
          
          console.error('html2canvas截图失败:', err);
          loadingMsg.close();
          ElMessage.error('截图处理失败，请重试');
        });
      }).catch(err => {
        console.error('加载html2canvas失败:', err);
        loadingMsg.close();
        ElMessage.error('截图功能加载失败');
      });
    }
  } catch (e) {
    console.error('更新任务区域截图过程中出错:', e);
    ElMessage.error('截图过程出错，请重试');
  }
};

// 在Vue模板后面添加一个处理窗口大小变化的函数
const handleResize = () => {
  if (mapInstance.value) {
    try {
      // 调整地图大小
      mapInstance.value.resize();
    } catch (e) {
      console.error('调整地图大小失败:', e);
    }
  }
};

// 添加一个变量表示地图是否加载完成
const mapLoaded = ref(false);

// 添加一个DOM引用变量
const mapContainer = ref<HTMLElement | null>(null);

onMounted(() => {
  // 确保在组件挂载后初始化地图
  console.log('MapComponent mounted, initializing map...');
  
  // 检查地图容器是否存在
  mapContainer.value = document.getElementById('amap-container');
  if (!mapContainer.value) {
    console.error('地图容器不存在');
    return;
  }
  
  // 检查容器尺寸
  if (mapContainer.value.offsetWidth === 0 || mapContainer.value.offsetHeight === 0) {
    console.error('地图容器尺寸为0');
    return;
  }
  
  // 初始化地图
  initMap();
  
  // 添加窗口大小调整监听
  window.addEventListener('resize', handleResize);
  
  // 如果有默认中心点，设置地图中心
  const defaultMapCenter = props.center || [116.397428, 39.90923]; // 默认北京中心
  if (mapInstance.value) {
    setTimeout(() => {
      mapInstance.value.setCenter(defaultMapCenter);
    }, 500);
  }
});

onBeforeUnmount(() => {
  console.log('MapComponent unmounting, cleaning up...');
  
  // 移除窗口大小调整监听
  window.removeEventListener('resize', handleResize);
  
  // 清除定时器
  if (droneTimer.value) {
    clearInterval(droneTimer.value);
    droneTimer.value = null;
  }
  
  // 销毁地图实例
  if (mapInstance.value) {
    mapInstance.value.destroy();
    mapInstance.value = null;
    console.log('Map instance destroyed');
  }
});

// 添加必要的类型定义和变量声明
const mapMarkers = ref<any[]>([]);
const taskAreaPolygon = ref<any>(null);
const dronePathLine = ref<any>(null);

// 在地图上添加任务区域标签
const addTaskAreaLabel = (center: [number, number] | Array<[number, number]>, text?: string) => {
  try {
    // 如果传入的是点数组，计算中心点
    let centerPoint: [number, number] | null = null;
    
    if (Array.isArray(center) && center.length >= 2 && typeof center[0] === 'number') {
      // 已经是中心点坐标
      centerPoint = center as [number, number];
    } else if (Array.isArray(center) && center.length >= 3) {
      // 是点数组，需要计算中心点
      centerPoint = calculatePolygonCenter(center as Array<[number, number]>);
    }
    
    if (!centerPoint) {
      console.error('无法确定标签位置');
      return;
    }
    
    // 使用计算出的中心点添加标签
    const labelText = text || '任务区域';
    
    if (!useCanvas.value && mapInstance.value) {
      // 使用AMap添加文本标签
      const textMarker = new window.AMap.Text({
        text: labelText,
        position: centerPoint,
        style: {
          'padding': '5px 10px',
          'backgroundColor': '#1890ff',
          'border': '1px solid #1890ff',
          'color': 'white',
          'fontSize': '12px',
          'fontWeight': 'bold',
          'borderRadius': '4px'
        },
        offset: new window.AMap.Pixel(0, -5),
        zIndex: 100
      });
      
      mapInstance.value.add(textMarker);
    } else {
      // Canvas模式下添加文本标签
      const canvasPoint = convertGeoToCanvasCoord(centerPoint);
      const canvas = document.getElementById('canvas-overlay') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.save();
          ctx.font = 'bold 14px Arial';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.fillText(labelText, canvasPoint.x, canvasPoint.y - 15);
          ctx.restore();
        }
      }
    }
  } catch (e) {
    console.error('添加文本标签失败:', e);
  }
};

// 更新任务区域多边形
const updateTaskAreaPolygon = () => {
  if (!mapInstance.value || !window.AMap || taskAreaPoints.value.length < 3) return;
  
  try {
    // 清除现有多边形
    if (taskAreaPolygon.value) {
      mapInstance.value.remove(taskAreaPolygon.value);
      taskAreaPolygon.value = null;
    }
    
    // 创建新多边形
    taskAreaPolygon.value = new window.AMap.Polygon({
      path: taskAreaPoints.value,
      strokeColor: '#3b82f6',
      strokeWeight: 3,
      strokeOpacity: 0.8,
      fillColor: '#3b82f6',
      fillOpacity: 0.3,
      zIndex: 50,
      bubble: true
    });
    
    // 添加到地图
    mapInstance.value.add(taskAreaPolygon.value);
    
    // 添加区域标签
    const center = calculatePolygonCenter(taskAreaPoints.value);
    if (center) {
      addTaskAreaLabel(center, '任务区域');
    }
  } catch (e) {
    console.error('更新任务区域多边形失败:', e);
  }
};

// 在区域选择器中确认选择区域
const confirmAreaSelection = (points: Point[], drawCanvas: HTMLCanvasElement) => {
  // 显式检测点的数量
  const numPoints = points.length;
  console.log('确认选择，点数量:', numPoints);
  
  // 确保有足够的点
  if (numPoints < 3) {
    ElMessage.warning('请至少绘制3个点以形成有效区域');
    return false;
  }
  
  try {
    // 将画布坐标转换为地理坐标
    const geoPoints = points.map(point => {
      // 根据Point类型处理坐标
      let x = 0, y = 0;
      
      if (Array.isArray(point) && point.length >= 2) {
        // 如果是GeoPoint类型 [lng, lat]
        x = point[0];
        y = point[1];
      } else if ('x' in point && 'y' in point) {
        // 如果是PointObject类型 {x, y}
        x = (point as PointObject).x;
        y = (point as PointObject).y;
      } else if ('lng' in point && 'lat' in point) {
        // 如果是GeoPointObject类型 {lng, lat}
        x = (point as GeoPointObject).lng;
        y = (point as GeoPointObject).lat;
      }
      
      return convertPixelToGeo(x, y, drawCanvas.width, drawCanvas.height);
    });
    
    console.log('转换后的地理坐标点:', geoPoints);
    
    // 重置现有点
    taskAreaPoints.value = [];
    
    // 防止渲染冲突，使用nextTick
    nextTick(() => {
      // 更新任务区域点
      taskAreaPoints.value = geoPoints;
      
      // 添加任务区域到地图（确保地图已初始化）
      if (mapInstance.value && mapLoaded.value) {
        addTaskArea(geoPoints);
      } else {
        console.warn('地图未初始化，将在地图加载后添加任务区域');
        // 设置标记，等待地图初始化后添加
        setTimeout(() => {
          if (mapInstance.value) {
            addTaskArea(geoPoints);
          }
        }, 500);
      }
      
      // 更新任务区域截图
      updateTaskAreaScreenshot();
    });
    
    return true;
  } catch (e) {
    console.error('处理任务区域时出错:', e);
    ElMessage.error('处理任务区域失败，请重试');
    return false;
  }
};

// 添加多边形中心点计算函数
const calculatePolygonCenter = (points: Array<[number, number]>): [number, number] | null => {
  if (!points || points.length < 3) {
    console.warn('计算中心点需要至少3个有效点');
    return null;
  }

  try {
    // 计算多边形的中心点 (简单平均值)
    let sumLng = 0;
    let sumLat = 0;
    
    for (const point of points) {
      if (Array.isArray(point) && point.length >= 2) {
        sumLng += point[0];
        sumLat += point[1];
      } else {
        console.warn('无效的点格式:', point);
      }
    }
    
    const centerLng = sumLng / points.length;
    const centerLat = sumLat / points.length;
    
    return [centerLng, centerLat];
  } catch (e) {
    console.error('计算多边形中心点失败:', e);
    return null;
  }
};
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
          class="control-button area-select-button" 
          @click="captureMapScreenshot"
          title="截图并选择区域"
        >
          <i class="area-select-icon"></i> 选择区域
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

    <div id="amap-container" class="amap-container"></div>
    
    <!-- 只在showDroneInfo为true时显示无人机状态信息面板 -->
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
  min-height: 600px; /* 增加地图高度 */
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

/* 媒体查询，确保在较小屏幕上也有合适的展示 */
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
}

/* 在巡逻任务模式下增大地图尺寸 */
:deep(.drone-patrol-view) .amap-container {
  min-height: 800px; /* 在巡逻任务视图中增加地图高度 */
}

.area-select-button, .export-button, .location-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.area-select-icon::before, .export-icon::before, .location-icon::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.area-select-icon::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'/%3E%3C/svg%3E");
}

.export-icon::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'/%3E%3C/svg%3E");
}

.location-icon::before {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'/%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'/%3E%3C/svg%3E");
}
</style>