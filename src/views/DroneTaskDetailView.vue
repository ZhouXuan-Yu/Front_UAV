<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import MapComponent from '@/components/dashboard/MapComponentFixed.vue';
import { clearAllMapPoints } from '../patches/fix-map-component';

// 创建路由实例
const router = useRouter();

// 任务信息
const taskInfo = ref({
  id: 'DRN-2023-0542',
  name: '东部湿地公园巡检',
  type: '区域巡检',
  startTime: '2023-11-08 14:30',
  endTime: '2023-11-08 17:30',
  area: '湿地保护区东区',
  status: 'running',
  droneId: 'Drone-X10',
  droneName: 'SkyGuard X10',
  droneBattery: 78,
  droneSignal: 87,
  droneAltitude: 120,
  droneSpeed: 15,
  batteryLevel: '78% (约2小时15分)',
  signalStrength: '87% (良好)'
});

// 检测目标
const detectionTargets = ref([
  {
    id: 'A',
    type: 'person',
    name: '人群聚集点A',
    description: '约45人，活动正常',
    position: { lng: 116.393428, lat: 39.91123 },
    status: 'normal'
  },
  {
    id: 'B',
    type: 'traffic',
    name: '交通监控点B',
    description: '车流量中等，无拥堵',
    position: { lng: 116.397428, lat: 39.90623 },
    status: 'normal'
  },
  {
    id: 'C',
    type: 'warning',
    name: '重点区域C',
    description: '检测到异常活动，建议关注',
    position: { lng: 116.401428, lat: 39.90923 },
    status: 'warning'
  },
  {
    id: 'D',
    type: 'parking',
    name: '车辆集中点D',
    description: '停放正常，车位充足',
    position: { lng: 116.395428, lat: 39.90523 },
    status: 'normal'
  }
]);

// 无人机当前位置
const dronePosition = ref({ lng: 116.397428, lat: 39.90923 });

// 地图组件引用
const mapInstance = ref(null);

// 切换地图类型
const mapTypes = [
  { value: 'standard', label: '标准地图' },
  { value: 'satellite', label: '卫星模式' },
  { value: '3d', label: '3D图像' },
  { value: 'heatmap', label: '热力图' }
];
const activeMapType = ref('标准地图');
const currentMapType = ref('standard');

const switchMapType = (type: string) => {
  activeMapType.value = type;
  currentMapType.value = type;
  console.log('切换地图类型:', type);
};

// 获取任务状态文本
const getStatusText = (status: string): string => {
  switch (status) {
    case 'waiting':
      return '等待中';
    case 'running':
      return '执行中';
    case 'completed':
      return '已完成';
    case 'failed':
      return '失败';
    default:
      return '未知';
  }
};

// 更新任务区域点
const updateTaskArea = (points: any) => {
  console.log('更新任务区域点:', points);
  // 这里添加更新区域的逻辑
};

// 页面初始化时清理地图
onMounted(() => {
  console.log('组件挂载，清理地图点');
  setTimeout(() => {
    try {
      // 尝试使用外部函数清理点
      clearAllMapPoints();
    } catch (e) {
      console.error('清理地图点失败:', e);
    }
  }, 1000);
});

// 组件卸载前清理资源
onBeforeUnmount(() => {
  if (simulationInterval !== null) {
    clearInterval(simulationInterval);
  }
});

// 无人机移动模拟
let simulationInterval: number | null = null;

const startDroneSimulation = () => {
  // 清除可能存在的旧定时器
  if (simulationInterval !== null) {
    clearInterval(simulationInterval);
  }
  
  let pathIndex = 0;
  const path = [
    { lng: 116.386037, lat: 39.913122 },
    { lng: 116.389684, lat: 39.904507 },
    { lng: 116.405563, lat: 39.90654 },
    { lng: 116.401787, lat: 39.915309 },
    { lng: 116.393428, lat: 39.91123 }, // 人群点
    { lng: 116.397428, lat: 39.90623 }, // 交通点
    { lng: 116.401428, lat: 39.90923 }, // 重点区域
    { lng: 116.395428, lat: 39.90523 }  // 车辆点
  ];
  
  simulationInterval = window.setInterval(() => {
    // 获取下一个目标点
    const targetPoint = path[pathIndex];
    
    // 平滑移动
    dronePosition.value = {
      lng: dronePosition.value.lng + (targetPoint.lng - dronePosition.value.lng) * 0.1,
      lat: dronePosition.value.lat + (targetPoint.lat - dronePosition.value.lat) * 0.1
    };
    
    // 检查是否足够接近目标点
    const distance = Math.sqrt(
      Math.pow(dronePosition.value.lng - targetPoint.lng, 2) + 
      Math.pow(dronePosition.value.lat - targetPoint.lat, 2)
    );
    
    // 如果足够接近，前往下一个点
    if (distance < 0.0002) {
      pathIndex = (pathIndex + 1) % path.length;
    }
    
    // 更新地图上的无人机位置
    updateDronePosition();
  }, 500);
};

// 更新无人机位置在地图上的显示
const updateDronePosition = () => {
  if (window.map && window.droneMarker) {
    window.droneMarker.setPosition(dronePosition.value);
  }
};

// 在组件挂载后开始模拟
onMounted(() => {
  // 等待地图初始化
  setTimeout(() => {
    startDroneSimulation();
  }, 2000);
});
</script>

<template>
  <div class="drone-task-detail">
    <!-- 任务信息侧边栏 -->
    <div class="task-sidebar">
      <div class="header">
        <div class="back-button" @click="router.push('/dashboard')">
          <i class="el-icon-arrow-left"></i>
          返回
        </div>
        <div class="title">任务详情</div>
      </div>
      
      <div class="task-info">
        <div class="info-item">
          <div class="label">任务ID</div>
          <div class="value">{{ taskInfo.id }}</div>
        </div>
        <div class="info-item">
          <div class="label">任务名称</div>
          <div class="value">{{ taskInfo.name }}</div>
        </div>
        <div class="info-item">
          <div class="label">开始时间</div>
          <div class="value">{{ taskInfo.startTime }}</div>
        </div>
        <div class="info-item">
          <div class="label">任务区域</div>
          <div class="value">{{ taskInfo.area }}</div>
        </div>
        <div class="info-item">
          <div class="label">任务类型</div>
          <div class="value">{{ taskInfo.type }}</div>
        </div>
        <div class="info-item">
          <div class="label">任务状态</div>
          <div class="value status">
            <span :class="['status-dot', taskInfo.status]"></span>
            {{ getStatusText(taskInfo.status) }}
          </div>
        </div>
      </div>
      
      <div class="drone-info">
        <div class="section-title">执行无人机</div>
        <div class="drone-card">
          <div class="drone-header">
            <img src="" alt="无人机" class="drone-image" />
            <div class="drone-name">{{ taskInfo.droneName }}</div>
          </div>
          <div class="drone-stats">
            <div class="stat-item">
              <div class="stat-icon battery"></div>
              <div class="stat-value">{{ taskInfo.droneBattery }}%</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon signal"></div>
              <div class="stat-value">{{ taskInfo.droneSignal }}%</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon altitude"></div>
              <div class="stat-value">{{ taskInfo.droneAltitude }}m</div>
            </div>
            <div class="stat-item">
              <div class="stat-icon speed"></div>
              <div class="stat-value">{{ taskInfo.droneSpeed }}km/h</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="action-buttons">
        <el-button type="primary" v-if="taskInfo.status === 'waiting'">开始任务</el-button>
        <el-button type="danger" v-if="taskInfo.status === 'running'">终止任务</el-button>
        <el-button type="info" v-if="taskInfo.status === 'running'">暂停任务</el-button>
        <el-button>导出报告</el-button>
      </div>
    </div>
    
    <!-- 地图显示区域 -->
    <div class="map-container">
      <div class="map-header">
        <div class="map-title">实时监控</div>
        <div class="map-controls">
          <div class="map-type-selector">
            <div 
              v-for="type in mapTypes" 
              :key="type.value"
              :class="['type-item', { active: currentMapType === type.value }]"
              @click="switchMapType(type.value)"
            >
              {{ type.label }}
            </div>
          </div>
        </div>
      </div>
      
      <div class="map-wrapper">
        <MapComponent 
          :task-type="currentMapType"
          :drone-position="dronePosition"
          @update:task-area-points="updateTaskArea"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.drone-task-detail {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 任务侧边栏样式 */
.task-sidebar {
  width: 300px;
  background-color: #fff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #409EFF;
  margin-right: 15px;
  font-size: 14px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.task-info {
  margin-bottom: 20px;
}

.info-item {
  margin-bottom: 12px;
}

.label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.value {
  font-size: 14px;
  color: #303133;
}

.status {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.status-dot.waiting {
  background-color: #E6A23C;
}

.status-dot.running {
  background-color: #67C23A;
}

.status-dot.completed {
  background-color: #409EFF;
}

.status-dot.failed {
  background-color: #F56C6C;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

.drone-card {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
}

.drone-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.drone-image {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  background-color: #ddd;
  border-radius: 5px;
}

.drone-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.drone-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
  background-size: contain;
  background-repeat: no-repeat;
}

.stat-icon.battery {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2367C23A' d='M17 5v2H7V5h10m0-2H7a2 2 0 00-2 2v2a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2V3a2 2 0 00-2-2zM7 11h10v9H7v-9z'/%3E%3C/svg%3E");
}

.stat-icon.signal {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23409EFF' d='M5 20h2v-7H5v7zm4 0h2V9H9v11zm4 0h2V6h-2v14zm4 0h2V3h-2v17z'/%3E%3C/svg%3E");
}

.stat-icon.altitude {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23E6A23C' d='M9 3L5 7h3v7h2V7h3L9 3m10 3l-4 4h3v7h2v-7h3l-4-4z'/%3E%3C/svg%3E");
}

.stat-icon.speed {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23F56C6C' d='M12 2.5L2 21.5h20L12 2.5zm0 5l5.5 9.5h-11L12 7.5z'/%3E%3C/svg%3E");
}

.stat-value {
  font-size: 14px;
  color: #606266;
}

.action-buttons {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 地图容器样式 */
.map-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.map-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 5;
}

.map-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.map-controls {
  display: flex;
  align-items: center;
}

.map-type-selector {
  display: flex;
  background-color: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.type-item {
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  color: #606266;
  transition: all 0.3s;
}

.type-item.active {
  background-color: #409EFF;
  color: #fff;
}

.type-item:hover:not(.active) {
  background-color: #e4e7ed;
}

.map-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .drone-task-detail {
    flex-direction: column;
  }
  
  .task-sidebar {
    width: 100%;
    height: 40vh;
    overflow-y: auto;
  }
  
  .map-container {
    height: 60vh;
  }
}
</style> 