/**
 * 文件名: DroneMapTracker.vue
 * 描述: 无人机地图追踪组件
 * 在项目中的作用: 
 * - 展示无人机实时位置和移动轨迹
 * - 显示任务详情和检测目标信息
 * - 提供地图交互和状态监控功能
 * - 支持多无人机协同监控和任务管理
 * - 集成无人机巡逻任务设置功能
 */

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue';
// import MapComponent from '@/components/dashboard/MapComponent.vue';
import FixedMapComponent from '@/components/dashboard/FixedMapComponent.vue';
import DronePatrolPanel from '@/components/dashboard/DronePatrolPanel.vue';
import { ElMessage, ElMessageBox } from 'element-plus';

// 定义DroneInfo接口，代替导入
interface GeoCoordinate {
  lng: number;
  lat: number;
}

interface DroneInfo {
  id: string;
  name: string;
  type: string;
  batteryLevel: number;
  signalStrength: number;
  maxSpeed: number;
  maxAltitude: number;
  operationRadius: number;
  payload: string;
  position?: GeoCoordinate;
  status?: 'idle' | 'active' | 'returning' | 'charging' | 'maintenance';
  available?: boolean;
  suitable?: string[];
}

// 当前视图模式：基本追踪模式或巡逻任务模式
const viewMode = ref<'tracking' | 'patrol'>('tracking');

// 当前任务信息
const activeTask = ref({
  id: 'DRN-2023-0542',
  type: '区域巡检',
  startTime: '2023-11-08 14:30',
  endTime: '2023-11-08 17:30',
  droneId: 'Drone-X10',
  batteryLevel: '78%',
  batteryTime: '约2小时15分',
  signalStrength: '87%',
  signalQuality: '良好',
  status: 'active'
});

// 无人机列表数据
const drones = ref<DroneInfo[]>([
  {
    id: 'Drone-X10',
    name: '侦察无人机 X10',
    type: '侦察型',
    batteryLevel: 78,
    signalStrength: 87,
    maxSpeed: 65,
    maxAltitude: 5000,
    operationRadius: 8,
    payload: '4K摄像头,热成像仪',
    status: 'idle',
    available: true,
    suitable: ['区域巡检', '人员搜索']
  },
  {
    id: 'Drone-S20',
    name: '监控无人机 S20',
    type: '监控型',
    batteryLevel: 92,
    signalStrength: 95,
    maxSpeed: 45,
    maxAltitude: 3000,
    operationRadius: 5,
    payload: '高清摄像头,信号增强器',
    status: 'idle',
    available: true,
    suitable: ['定点监控', '区域巡检', '交通监控']
  },
  {
    id: 'Drone-N8',
    name: '夜视无人机 N8',
    type: '夜视型',
    batteryLevel: 85,
    signalStrength: 82,
    maxSpeed: 50,
    maxAltitude: 3500,
    operationRadius: 7,
    payload: '夜视设备,红外摄像头',
    status: 'idle',
    available: true,
    suitable: ['夜间检测', '区域巡检']
  },
  {
    id: 'Drone-F12',
    name: '消防无人机 F12',
    type: '消防型',
    batteryLevel: 72,
    signalStrength: 81,
    maxSpeed: 55,
    maxAltitude: 4000,
    operationRadius: 6,
    payload: '热感应器,防火材料',
    status: 'idle',
    available: true,
    suitable: ['火灾检测', '区域巡检']
  },
  {
    id: 'Drone-W5',
    name: '水域无人机 W5',
    type: '水域型',
    batteryLevel: 68,
    signalStrength: 76,
    maxSpeed: 60,
    maxAltitude: 3000,
    operationRadius: 8,
    payload: '防水摄像机,水位传感器',
    status: 'idle',
    available: true,
    suitable: ['洪水检测', '区域巡检']
  }
]);

// 检测目标
const detectionTargets = ref([
  {
    id: 'target-A',
    icon: '👥',
    name: '人群聚集点A',
    details: '约45人，活动正常',
    highlight: false,
    position: {lat: 39.972, lng: 116.402}
  },
  {
    id: 'target-B',
    icon: '🚗',
    name: '交通监控点B',
    details: '车流量中等，无拥堵',
    highlight: false,
    position: {lat: 39.977, lng: 116.407}
  },
  {
    id: 'target-C',
    icon: '⚠️',
    name: '重点区域C',
    details: '检测到异常活动，建议关注',
    highlight: true,
    position: {lat: 39.976, lng: 116.412}
  },
  {
    id: 'target-D',
    icon: '🚙',
    name: '车辆集中区D',
    details: '停放正常，车位充足',
    highlight: false,
    position: {lat: 39.969, lng: 116.409}
  }
]);

// 选中的无人机
const selectedDrone = ref('Drone-X10');

// 更新无人机位置的定时器
let positionUpdateTimer: number | null = null;

// 地图实例引用
const mapComponentRef = ref(null);

// 任务控制面板显示状态
const showControlPanel = ref(false);

// 模拟更新无人机位置
const updateDronePositions = () => {
  // 实际项目中这里会从WebSocket或API获取实时数据
  // 这里仅做模拟
  
  // 使用调试标志控制日志输出
  const debugMode = false; // 设置为false减少日志输出
  if (debugMode) {
    console.log('更新无人机位置数据');
  }
  
  // 更新地图上的无人机位置
  if (mapComponentRef.value) {
    // mapComponentRef.value.updateDronePositions(dronePositions);
    if (debugMode) {
      console.log('地图组件已更新');
    }
  }
};

// 启动新任务
const startNewTask = () => {
  ElMessage.success('新任务已启动');
  showControlPanel.value = false;
  
  // 实际项目中这里会发送任务指令到后端
};

// 暂停当前任务
const pauseTask = () => {
  ElMessage.info('任务已暂停');
  
  if (activeTask.value) {
    activeTask.value.status = 'paused';
  }
};

// 恢复任务
const resumeTask = () => {
  ElMessage.success('任务已恢复');
  
  if (activeTask.value) {
    activeTask.value.status = 'active';
  }
};

// 终止任务
const stopTask = () => {
  ElMessage.warning('任务已终止');
  
  if (activeTask.value) {
    activeTask.value.status = 'stopped';
  }
};

// 切换控制面板显示
const toggleControlPanel = () => {
  showControlPanel.value = !showControlPanel.value;
};

// 选择无人机
const selectDrone = (droneId: string) => {
  selectedDrone.value = droneId;
  ElMessage.success(`已选择无人机: ${droneId}`);
};

// 切换视图模式
const toggleViewMode = () => {
  if (viewMode.value === 'tracking') {
    viewMode.value = 'patrol';
    ElMessage.info('已切换到无人机巡逻任务模式');
  } else {
    viewMode.value = 'tracking';
    ElMessage.info('已切换到地图追踪模式');
  }
};

// 组件挂载
onMounted(() => {
  // 启动位置更新定时器
  positionUpdateTimer = window.setInterval(updateDronePositions, 3000);
});

// 组件卸载前清理
onBeforeUnmount(() => {
  // 清除定时器
  if (positionUpdateTimer !== null) {
    clearInterval(positionUpdateTimer);
  }
});
</script>

<template>
  <div class="drone-map-tracker">
    <!-- 模式切换按钮 -->
    <div class="mode-switcher">
      <button 
        @click="toggleViewMode" 
        class="mode-switch-btn"
        :class="{ 'active': viewMode === 'tracking' }"
      >
        地图追踪模式
      </button>
      <button 
        @click="toggleViewMode" 
        class="mode-switch-btn"
        :class="{ 'active': viewMode === 'patrol' }"
      >
        无人机巡逻任务模式
      </button>
    </div>
    
    <!-- 地图追踪模式 -->
    <div v-if="viewMode === 'tracking'" class="map-container-full">
      <!-- 左侧信息面板 -->
      <div class="map-side-panel">
        <h3>任务信息</h3>
        <div class="info-list">
          <div class="info-item">
            <div class="info-label">任务ID:</div>
            <div class="info-value">{{ activeTask.id }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">任务类型:</div>
            <div class="info-value">{{ activeTask.type }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">开始时间:</div>
            <div class="info-value">{{ activeTask.startTime }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">预计结束:</div>
            <div class="info-value">{{ activeTask.endTime }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">无人机编号:</div>
            <div class="info-value">{{ activeTask.droneId }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">电池状态:</div>
            <div class="info-value">{{ activeTask.batteryLevel }} ({{ activeTask.batteryTime }})</div>
          </div>
          <div class="info-item">
            <div class="info-label">信号强度:</div>
            <div class="info-value">{{ activeTask.signalStrength }} ({{ activeTask.signalQuality }})</div>
          </div>
        </div>
        
        <h3>检测目标</h3>
        <div class="target-list">
          <div v-for="target in detectionTargets" 
               :key="target.id" 
               class="target-item"
               :class="{ highlight: target.highlight }">
            <div class="target-icon">{{ target.icon }}</div>
            <div class="target-info">
              <div class="target-name">{{ target.name }}</div>
              <div class="target-details">{{ target.details }}</div>
            </div>
          </div>
        </div>
        
        <h3>任务控制</h3>
        <div class="control-buttons">
          <button @click="toggleControlPanel" class="control-btn primary">
            管理任务
          </button>
          <button @click="pauseTask" :disabled="activeTask.status !== 'active'" class="control-btn warning">
            暂停任务
          </button>
          <button @click="stopTask" :disabled="activeTask.status === 'stopped'" class="control-btn danger">
            终止任务
          </button>
        </div>
        
        <!-- 无人机选择列表 -->
        <h3>可用无人机</h3>
        <div class="drone-list">
          <div v-for="drone in drones" 
               :key="drone.id" 
               class="drone-item"
               :class="{ 'selected': selectedDrone === drone.id }"
               @click="selectDrone(drone.id)">
            <div class="drone-icon">🛸</div>
            <div class="drone-info">
              <div class="drone-name">{{ drone.name }}</div>
              <div class="drone-stats">
                <div class="drone-stat">
                  <span class="stat-label">电量:</span>
                  <div class="battery-indicator">
                    <div class="battery-level" :style="{ width: `${drone.batteryLevel}%` }"></div>
                  </div>
                  <span class="stat-value">{{ drone.batteryLevel }}%</span>
                </div>
                <div class="drone-stat">
                  <span class="stat-label">信号:</span>
                  <div class="signal-indicator">
                    <div class="signal-level" :style="{ width: `${drone.signalStrength}%` }"></div>
                  </div>
                  <span class="stat-value">{{ drone.signalStrength }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 地图主区域 -->
      <div class="map-main-area">
        <!-- 任务控制面板 -->
        <div v-if="showControlPanel" class="task-control-panel">
          <div class="panel-header">
            <h3>任务控制面板</h3>
            <button @click="toggleControlPanel" class="close-btn">&times;</button>
          </div>
          <div class="panel-content">
            <div class="panel-section">
              <h4>创建新任务</h4>
              <div class="form-group">
                <label>任务类型</label>
                <select class="form-control">
                  <option>区域巡检</option>
                  <option>定点监控</option>
                  <option>路线追踪</option>
                  <option>人员搜索</option>
                  <option>交通监控</option>
                </select>
              </div>
              <div class="form-group">
                <label>派遣无人机</label>
                <select class="form-control">
                  <option v-for="drone in drones" :key="drone.id" :value="drone.id">
                    {{ drone.name }} ({{ drone.batteryLevel }}%)
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>预计时长</label>
                <select class="form-control">
                  <option>30分钟</option>
                  <option>1小时</option>
                  <option>2小时</option>
                  <option>3小时</option>
                  <option>自定义</option>
                </select>
              </div>
              <div class="form-actions">
                <button @click="startNewTask" class="form-button primary">启动任务</button>
                <button @click="toggleControlPanel" class="form-button">取消</button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 地图组件 - 使用新的FixedMapComponent替代MapComponent -->
        <FixedMapComponent ref="mapComponentRef" style="height: 100%;" :showDroneInfo="true" />
      </div>
    </div>
    
    <!-- 无人机巡逻任务模式 -->
    <div v-if="viewMode === 'patrol'" class="patrol-container">
      <DronePatrolPanel />
    </div>
  </div>
</template>

<style scoped>
.drone-map-tracker {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.mode-switcher {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  justify-content: center;
}

.mode-switch-btn {
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 5px;
  color: #e3f2fd;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
}

.mode-switch-btn:hover {
  background-color: rgba(33, 150, 243, 0.2);
}

.mode-switch-btn.active {
  background-color: #2196F3;
  color: white;
}

.map-container-full {
  display: flex;
  height: 800px;
  gap: 20px;
  flex: 1;
}

.patrol-container {
  height: 800px;
  flex: 1;
}

.map-side-panel {
  width: 320px;
  background-color: #132f4c;
  border-radius: 10px;
  padding: 20px;
  overflow-y: auto;
}

.map-side-panel h3 {
  color: #4fc3f7;
  margin: 0 0 15px;
  font-size: 1.2rem;
  border-bottom: 1px solid #1e3a5f;
  padding-bottom: 10px;
}

.map-main-area {
  flex: 1;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.info-list {
  margin-bottom: 25px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.info-label {
  width: 100px;
  color: #90caf9;
  font-weight: bold;
}

.info-value {
  flex: 1;
}

.target-list {
  margin-bottom: 25px;
}

.target-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.target-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.target-item.highlight {
  background-color: rgba(244, 67, 54, 0.15);
}

.target-icon {
  font-size: 1.5rem;
  margin-right: 15px;
  width: 30px;
  text-align: center;
}

.target-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.control-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.control-btn {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.control-btn.primary {
  background-color: #2196F3;
  color: white;
}

.control-btn.primary:hover {
  background-color: #1976D2;
}

.control-btn.warning {
  background-color: #FF9800;
  color: white;
}

.control-btn.warning:hover {
  background-color: #F57C00;
}

.control-btn.danger {
  background-color: #F44336;
  color: white;
}

.control-btn.danger:hover {
  background-color: #D32F2F;
}

.control-btn:disabled {
  background-color: #455A64;
  color: #90A4AE;
  cursor: not-allowed;
}

.drone-list {
  margin-bottom: 25px;
}

.drone-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 12px;
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.drone-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.drone-item.selected {
  background-color: rgba(33, 150, 243, 0.15);
  border-left: 3px solid #2196F3;
}

.drone-icon {
  font-size: 1.8rem;
  margin-right: 15px;
  width: 40px;
  text-align: center;
}

.drone-info {
  flex: 1;
}

.drone-name {
  font-weight: bold;
  margin-bottom: 8px;
  color: #e3f2fd;
}

.drone-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drone-stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  width: 45px;
  font-size: 0.85rem;
  color: #90caf9;
}

.stat-value {
  font-size: 0.85rem;
  min-width: 40px;
  text-align: right;
}

.battery-indicator, .signal-indicator {
  height: 8px;
  flex: 1;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.battery-level {
  height: 100%;
  background: linear-gradient(to right, #f44336, #ffeb3b, #4caf50);
  border-radius: 4px;
}

.signal-level {
  height: 100%;
  background: linear-gradient(to right, #f44336, #ffeb3b, #4caf50);
  border-radius: 4px;
}

.task-control-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 350px;
  background-color: #132f4c;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  z-index: 10;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #1e3a5f;
}

.panel-header h3 {
  margin: 0;
  color: #e3f2fd;
}

.close-btn {
  background: none;
  border: none;
  color: #90caf9;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.close-btn:hover {
  color: #e3f2fd;
}

.panel-content {
  padding: 20px;
}

.panel-section {
  margin-bottom: 20px;
}

.panel-section h4 {
  color: #4fc3f7;
  margin: 0 0 15px;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  color: #90caf9;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  color: #e3f2fd;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.form-button {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  flex: 1;
}

.form-button.primary {
  background-color: #2196F3;
  color: white;
}

.form-button.primary:hover {
  background-color: #1976D2;
}

@media (max-width: 1200px) {
  .map-container-full {
    flex-direction: column;
    height: auto;
  }
  
  .map-side-panel {
    width: 100%;
    max-height: 300px;
  }
  
  .map-main-area {
    height: 500px;
  }
}

@media (max-width: 768px) {
  .mode-switcher {
    flex-direction: column;
  }
  
  .task-control-panel {
    width: 100%;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
  }
}
</style>