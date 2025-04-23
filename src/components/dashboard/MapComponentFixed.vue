/**
 * 文件名: MapComponentFixed.vue
 * 描述: 地图显示和交互组件（修复版本）
 * 在项目中的作用: 
 * - 集成高德地图API，提供地图显示和操作功能
 * - 支持地点标记、路径规划和区域显示
 * - 提供地图控件和交互功能
 * - 作为地理信息展示的基础组件
 */

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, defineProps, defineExpose, watch, reactive, defineEmits, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
// 确保正确导入 ElMessage
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

// 地图截图功能 - 修复返回值类型问题
const captureMapScreenshot = (): string | null => {
  if (!mapInstance.value) {
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
    
    // 使用html2canvas进行截图
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(mapEl, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      }).then(canvas => {
        // 恢复控制按钮显示
        if (controlsEl) controlsEl.style.display = originalControlsDisplay;
        if (footerEl) footerEl.style.display = originalFooterDisplay;
        
        const imgDataUrl = canvas.toDataURL('image/png');
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
  // 确保之前的选择器已被移除
  const existingSelector = document.getElementById('area-selector-container');
  if (existingSelector && existingSelector.parentNode) {
    existingSelector.parentNode.removeChild(existingSelector);
  }
  
  // 创建区域选择器容器
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
  
  // 存储选择的点
  const points: {x: number, y: number}[] = [];
  
  // 获取画布上下文
  const ctx = drawCanvas.getContext('2d');
  if (!ctx) {
    ElMessage.error('无法创建绘图上下文');
    return;
  }
  
  // 绘制点和线
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
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
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
    points.forEach(point => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#3b82f6';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
    
    // 更新确认按钮状态 - 确保有至少3个点才能确认
    if (points.length >= 3) {
      confirmButton.disabled = false;
      confirmButton.style.opacity = '1';
      confirmButton.style.cursor = 'pointer';
    } else {
      confirmButton.disabled = true;
      confirmButton.style.opacity = '0.5';
      confirmButton.style.cursor = 'not-allowed';
    }
  };
  
  // 监听Canvas上的点击事件
  drawCanvas.addEventListener('click', (e) => {
    // 获取点击位置相对于Canvas的坐标
    const rect = drawCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (drawCanvas.width / rect.width);
    const y = (e.clientY - rect.top) * (drawCanvas.height / rect.height);
    
    // 添加点
    points.push({ x, y });
    
    // 重新绘制
    drawPoints();
  });
  
  // 重置按钮事件
  resetButton.addEventListener('click', () => {
    points.length = 0;
    drawPoints();
  });
  
  // 取消按钮事件
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(selectorContainer);
  });
  
  // 确认按钮事件
  confirmButton.addEventListener('click', () => {
    if (points.length < 3) {
      ElMessage.warning('请至少绘制3个点以形成有效区域');
      return;
    }
    
    try {
      // 将画布坐标转换为地理坐标
      const geoPoints = points.map(point => {
        return convertPixelToGeo(point.x, point.y, drawCanvas.width, drawCanvas.height);
      });
      
      // 更新任务区域点
      if (Array.isArray(taskAreaPoints.value)) {
        taskAreaPoints.value = geoPoints;
        
        // 添加任务区域到地图
        addTaskArea(geoPoints);
        
        // 移除选择器
        document.body.removeChild(selectorContainer);
        
        // 显示成功消息
        ElMessage.success('任务区域设置成功');
      } else {
        console.error('任务区域点不是数组类型');
        ElMessage.error('处理任务区域失败');
      }
    } catch (e) {
      console.error('处理任务区域时出错:', e);
      ElMessage.error('处理任务区域失败，请重试');
    }
  });
};

// 像素坐标转地理坐标
const convertPixelToGeo = (x: number, y: number, width: number, height: number): [number, number] => {
  if (!mapInstance.value) {
    // 如果没有地图实例，返回一个默认值
    return [116.397428, 39.90923];
  }
  
  try {
    // 获取当前地图的边界
    const bounds = mapInstance.value.getBounds();
    if (!bounds) {
      console.error('无法获取地图边界');
      return [116.397428, 39.90923];
    }
    
    const northEast = bounds.getNorthEast();
    const southWest = bounds.getSouthWest();
    
    // 计算经纬度范围
    const lngDiff = northEast.lng - southWest.lng;
    const latDiff = northEast.lat - southWest.lat;
    
    // 将像素坐标转换为经纬度
    const lng = southWest.lng + (x / width) * lngDiff;
    const lat = northEast.lat - (y / height) * latDiff;
    
    return [lng, lat];
  } catch (e) {
    console.error('坐标转换失败:', e);
    
    // 获取中心点作为备用
    const center = mapInstance.value.getCenter();
    if (center) {
      return [center.lng, center.lat];
    }
    
    // 如果都失败，返回默认中心点
    return [116.397428, 39.90923];
  }
};

// 添加任务区域（此函数仅为示例，完整实现应包含在原始文件中）
const addTaskArea = (points: any[]) => {
  if (!mapInstance.value || !points || points.length < 3) {
    console.error('无法添加任务区域：地图未初始化或点数不足');
    return null;
  }
  
  try {
    if (useCanvas.value) {
      // Canvas模式下绘制区域
      return null;
    }
    
    // AMap模式下绘制区域
    if (window.AMap) {
      try {
        // 清除现有任务区域
        return null;
      } catch (e) {
        console.error('添加任务区域失败:', e);
        return null;
      }
    }
  } catch (e) {
    console.error('添加任务区域失败:', e);
    return null;
  }
  
  return null;
};

// 清除绘制状态
const clearDrawing = () => {
  // 清除绘制点
  drawingPoints.value = [];
};
</script>

<template>
  <div class="map-container">
    <!-- 地图头部 -->
    <div class="map-header">
      <h2>实时地图</h2>
      
      <div class="map-controls">
        <!-- 控制按钮组 -->
      </div>
    </div>

    <!-- 地图容器 -->
    <div id="amap-container" class="amap-container"></div>
    
    <!-- 无人机状态信息面板 -->
    <div v-if="props.showDroneInfo" class="map-footer">
      <!-- 状态信息展示 -->
    </div>
  </div>
</template>

<style scoped>
/* 样式部分省略 */
</style> 