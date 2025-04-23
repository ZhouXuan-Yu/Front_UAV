/**
 * 文件名: MapDrawTools.vue
 * 描述: 地图绘制工具组件
 * 在项目中的作用: 
 * - 提供地图区域绘制功能
 * - 解决AMap绘制空白问题
 * - 支持任务区域选择和截图
 */

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, defineProps, defineEmits, watch } from 'vue';
import { ElMessage } from 'element-plus';
import html2canvas from 'html2canvas';

const props = defineProps({
  mapInstance: {
    type: Object,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:visible', 'area-selected', 'cancel']);

// 绘制状态
const isDrawing = ref(false);
const drawPoints = ref<Array<[number, number]>>([]);
const mousePosition = ref<[number, number]>([0, 0]);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const canvasContext = ref<CanvasRenderingContext2D | null>(null);
const drawingOverlayRef = ref<HTMLDivElement | null>(null);

// 地图绘制工具
const drawTool = ref<any>(null);
const polygonEditor = ref<any>(null);
const polygonInstance = ref<any>(null);

// 初始化绘制工具
const initDrawTools = () => {
  if (!props.mapInstance || !window.AMap) {
    console.error('地图实例或AMap不可用');
    return;
  }

  try {
    // 加载绘制插件
    window.AMap.plugin(['AMap.MouseTool', 'AMap.PolygonEditor'], () => {
      // 创建绘制工具
      drawTool.value = new window.AMap.MouseTool(props.mapInstance);
      
      // 监听绘制完成事件
      drawTool.value.on('draw', (event: any) => {
        const { obj } = event;
        polygonInstance.value = obj;
        
        // 创建编辑器
        polygonEditor.value = new window.AMap.PolygonEditor(props.mapInstance, polygonInstance.value);
        polygonEditor.value.open();
        
        // 获取多边形的路径
        const path = polygonInstance.value.getPath();
        drawPoints.value = path.map((point: any) => [point.lng, point.lat]);
        
        // 发送选定区域事件
        if (drawPoints.value.length >= 3) {
          emit('area-selected', {
            points: drawPoints.value,
            polygon: polygonInstance.value
          });
        } else {
          ElMessage.warning('请至少绘制3个点以形成有效区域');
        }
      });
    });
  } catch (e) {
    console.error('初始化绘制工具失败:', e);
    ElMessage.error('初始化绘制工具失败，将使用备用绘制方法');
    initFallbackDrawTool();
  }
};

// 初始化备用绘制工具（Canvas绘制）
const initFallbackDrawTool = () => {
  if (!drawingOverlayRef.value) return;
  
  // 创建Canvas元素
  canvasRef.value = document.createElement('canvas');
  canvasRef.value.width = drawingOverlayRef.value.clientWidth;
  canvasRef.value.height = drawingOverlayRef.value.clientHeight;
  canvasRef.value.style.position = 'absolute';
  canvasRef.value.style.top = '0';
  canvasRef.value.style.left = '0';
  canvasRef.value.style.pointerEvents = 'none';
  
  // 添加到覆盖层
  drawingOverlayRef.value.appendChild(canvasRef.value);
  
  // 获取Context
  canvasContext.value = canvasRef.value.getContext('2d');
  
  // 添加事件监听
  if (drawingOverlayRef.value) {
    drawingOverlayRef.value.addEventListener('mousedown', startDrawing);
    drawingOverlayRef.value.addEventListener('mousemove', updateDrawing);
    drawingOverlayRef.value.addEventListener('mouseup', endDrawing);
    drawingOverlayRef.value.addEventListener('mouseleave', cancelDrawing);
  }
};

// 开始绘制
const startDrawing = (e: MouseEvent) => {
  isDrawing.value = true;
  const rect = (e.target as HTMLElement).getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // 记录鼠标位置
  mousePosition.value = [x, y];
  
  // 添加点
  const mapPoint = pixelToLngLat(x, y);
  if (mapPoint) {
    drawPoints.value.push(mapPoint);
    drawCanvas();
  }
};

// 更新绘制
const updateDrawing = (e: MouseEvent) => {
  if (!isDrawing.value) return;
  
  const rect = (e.target as HTMLElement).getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // 更新鼠标位置
  mousePosition.value = [x, y];
  
  // 更新绘制
  drawCanvas();
};

// 结束绘制
const endDrawing = (e: MouseEvent) => {
  if (!isDrawing.value) return;
  
  const rect = (e.target as HTMLElement).getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // 添加最后一个点
  const mapPoint = pixelToLngLat(x, y);
  if (mapPoint) {
    drawPoints.value.push(mapPoint);
  }
  
  // 结束绘制
  isDrawing.value = false;
  
  // 验证有效的多边形（至少3个点）
  if (drawPoints.value.length >= 3) {
    emit('area-selected', {
      points: drawPoints.value,
      fallback: true
    });
  } else {
    ElMessage.warning('请至少绘制3个点以形成有效区域');
  }
};

// 取消绘制
const cancelDrawing = () => {
  isDrawing.value = false;
  drawCanvas();
};

// 绘制Canvas
const drawCanvas = () => {
  // 确保canvas上下文存在
  if (!canvasContext.value || !drawingOverlayRef.value) {
    console.error('Canvas上下文或画布元素不存在');
    return;
  }
  
  // 清除画布
  canvasContext.value.clearRect(0, 0, drawingOverlayRef.value.clientWidth, drawingOverlayRef.value.clientHeight);
  
  // 如果没有点，则不绘制
  if (drawPoints.value.length === 0) return;
  
  // 绘制所有点
  canvasContext.value.fillStyle = '#1989fa';
  drawPoints.value.forEach((point) => {
    canvasContext.value?.beginPath();
    canvasContext.value?.arc(point[0], point[1], 5, 0, Math.PI * 2);
    canvasContext.value?.fill();
  });
  
  // 绘制连接线
  canvasContext.value.strokeStyle = '#1989fa';
  canvasContext.value.lineWidth = 2;
  canvasContext.value.beginPath();
  
  // 移动到第一个点
  if (drawPoints.value.length > 0) {
    canvasContext.value.moveTo(drawPoints.value[0][0], drawPoints.value[0][1]);
  }
  
  // 连接剩余的点
  for (let i = 1; i < drawPoints.value.length; i++) {
    canvasContext.value.lineTo(drawPoints.value[i][0], drawPoints.value[i][1]);
  }
  
  // 如果有足够的点，闭合路径
  if (drawPoints.value.length >= 3) {
    canvasContext.value.lineTo(drawPoints.value[0][0], drawPoints.value[0][1]);
  }
  
  canvasContext.value.stroke();
  
  // 检查是否有足够的点形成有效区域
  const validArea = ref(drawPoints.value.length >= 3);
};

// 经纬度转像素坐标
const lngLatToPixel = (lng: number, lat: number): [number, number] | null => {
  if (!props.mapInstance || !canvasRef.value) return null;
  
  try {
    const pixel = props.mapInstance.lngLatToContainer(new window.AMap.LngLat(lng, lat));
    return [pixel.x, pixel.y];
  } catch (e) {
    console.error('经纬度转像素坐标失败:', e);
    return null;
  }
};

// 像素坐标转经纬度
const pixelToLngLat = (x: number, y: number): [number, number] | null => {
  if (!props.mapInstance) return null;
  
  try {
    const lngLat = props.mapInstance.containerToLngLat(new window.AMap.Pixel(x, y));
    return [lngLat.lng, lngLat.lat];
  } catch (e) {
    console.error('像素坐标转经纬度失败:', e);
    return null;
  }
};

// 清除绘制
const clearDrawing = () => {
  // 清除绘制点
  drawPoints.value = [];
  
  // 清除Canvas
  if (canvasContext.value && canvasRef.value) {
    canvasContext.value.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  }
  
  // 清除高德地图绘制
  if (polygonEditor.value) {
    polygonEditor.value.close();
  }
  
  if (polygonInstance.value) {
    props.mapInstance.remove(polygonInstance.value);
    polygonInstance.value = null;
  }
  
  if (drawTool.value) {
    drawTool.value.close();
  }
};

// 开始绘制多边形
const startPolygonDraw = () => {
  clearDrawing();
  
  if (drawTool.value) {
    // 使用高德地图绘制工具
    drawTool.value.polygon({
      fillColor: 'rgba(59, 130, 246, 0.2)',
      strokeColor: '#3b82f6',
      strokeWeight: 2
    });
  } else {
    // 使用备用绘制工具
    drawPoints.value = [];
    isDrawing.value = false;
    ElMessage.info('请在地图上点击以绘制区域');
  }
};

// 取消绘制
const cancelDraw = () => {
  clearDrawing();
  emit('cancel');
  emit('update:visible', false);
};

// 确认绘制
const confirmDraw = () => {
  if (drawPoints.value.length < 3) {
    ElMessage.warning('请至少绘制3个点以形成有效区域');
    return;
  }
  
  // 捕获地图截图
  captureMapScreenshot().then(screenshot => {
    emit('area-selected', {
      points: drawPoints.value,
      polygon: polygonInstance.value,
      screenshot
    });
    
    emit('update:visible', false);
    clearDrawing();
  });
};

// 截取地图截图
const captureMapScreenshot = async (): Promise<string> => {
  // 如果存在地图实例且支持截图功能
  if (props.mapInstance && props.mapInstance.getContainer) {
    try {
      const mapContainer = props.mapInstance.getContainer();
      
      // 尝试使用html2canvas
      try {
        const canvas = await html2canvas(mapContainer, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          scale: window.devicePixelRatio
        });
        
        return canvas.toDataURL('image/png');
      } catch (e) {
        console.error('html2canvas截图失败:', e);
        
        // 尝试使用原生AMap截图
        if (props.mapInstance.getSnapshot) {
          try {
            return new Promise((resolve) => {
              props.mapInstance.getSnapshot((dataURL: string) => {
                resolve(dataURL);
              });
            });
          } catch (e) {
            console.error('AMap截图失败:', e);
          }
        }
      }
    } catch (e) {
      console.error('获取地图容器失败:', e);
    }
  }
  
  return '';
};

// 监听可见性变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 显示绘制工具
    nextTick(() => {
      initDrawTools();
      startPolygonDraw();
    });
  } else {
    // 隐藏绘制工具
    clearDrawing();
  }
});

// 组件挂载时
onMounted(() => {
  // 初始化绘制工具
  if (props.visible) {
    initDrawTools();
    startPolygonDraw();
  }
});

// 组件卸载前
onBeforeUnmount(() => {
  // 清理资源
  clearDrawing();
  
  // 移除事件监听
  if (drawingOverlayRef.value) {
    drawingOverlayRef.value.removeEventListener('mousedown', startDrawing);
    drawingOverlayRef.value.removeEventListener('mousemove', updateDrawing);
    drawingOverlayRef.value.removeEventListener('mouseup', endDrawing);
    drawingOverlayRef.value.removeEventListener('mouseleave', cancelDrawing);
  }
});

// 立即执行
const nextTick = (callback: () => void) => {
  setTimeout(callback, 0);
};
</script>

<template>
  <div v-if="visible" class="map-draw-tools">
    <div ref="drawingOverlayRef" class="drawing-overlay"></div>
    
    <div class="draw-controls">
      <div class="draw-instructions">
        点击地图添加区域点，完成后点击"完成绘制"按钮
      </div>
      
      <div class="draw-buttons">
        <button class="confirm-button" @click="confirmDraw" :disabled="drawPoints.length < 3">
          完成绘制
        </button>
        <button class="cancel-button" @click="cancelDraw">
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-draw-tools {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 100;
}

.drawing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
}

.draw-controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(17, 24, 39, 0.8);
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 101;
}

.draw-instructions {
  color: white;
  font-size: 0.9rem;
}

.draw-buttons {
  display: flex;
  gap: 12px;
}

.confirm-button, .cancel-button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.confirm-button {
  background-color: #10b981;
  color: white;
}

.confirm-button:hover:not(:disabled) {
  background-color: #059669;
}

.confirm-button:disabled {
  background-color: #d1d5db;
  cursor: not-allowed;
}

.cancel-button {
  background-color: #ef4444;
  color: white;
}

.cancel-button:hover {
  background-color: #dc2626;
}
</style> 