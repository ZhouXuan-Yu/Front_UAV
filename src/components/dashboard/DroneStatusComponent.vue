/**
 * 文件名: DroneStatusComponent.vue
 * 描述: 无人机和监控设备状态显示组件
 * 在项目中的作用: 
 * - 提供无人机及各类监控设备的实时状态监控
 * - 展示设备健康度、温度、信号强度等关键指标
 * - 支持按设备类型筛选和查看详细信息
 * - 通过动态数据更新和视觉反馈增强监控体验
 */

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { gsap } from 'gsap';

// 定义监测设备状态类型
interface MonitoringDevice {
  id: string;
  name: string;
  type: 'camera' | 'license-plate' | 'person-detection' | 'wildfire' | 'flood';
  health: number; // 0-100
  temperature: number;
  batteryLevel?: number;
  signalStrength?: number;
  lastMaintenance?: string;
  location: string;
  status: 'normal' | 'warning' | 'critical' | 'offline';
  details: string;
}

// 获取设备类型名称
const getDeviceTypeName = (type: string): string => {
  switch (type) {
    case 'camera':
      return '标准摄像头';
    case 'license-plate':
      return '车牌识别';
    case 'person-detection':
      return '人物识别';
    case 'wildfire':
      return '火灾监测';
    case 'flood':
      return '洪水监测';
    default:
      return '未知设备';
  }
};

// 模拟数据
const monitoringDevices = ref<MonitoringDevice[]>([
  {
    id: 'device-01',
    name: '摄像头 A1',
    type: 'camera',
    health: 92,
    temperature: 39.5,
    signalStrength: 95,
    location: '城市中心区',
    status: 'normal',
    details: '4K超高清摄像头，支持热成像，16倍光学变焦'
  },
  {
    id: 'device-02',
    name: '车牌识别 B1',
    type: 'license-plate',
    health: 78,
    temperature: 42.3,
    batteryLevel: 64,
    signalStrength: 87,
    location: '高速公路入口',
    status: 'normal',
    lastMaintenance: '2023-10-15',
    details: '高精度车牌识别系统，夜视功能，识别精度98%'
  },
  {
    id: 'device-03',
    name: '人物识别 C1',
    type: 'person-detection',
    health: 95,
    temperature: 45.7,
    signalStrength: 91,
    location: '公园西区',
    status: 'normal',
    details: 'AI人物识别系统，面部特征检测，行为分析'
  },
  {
    id: 'device-04',
    name: '火灾监测 D1',
    type: 'wildfire',
    health: 87,
    temperature: 38.2,
    signalStrength: 92,
    location: '森林保护区北部',
    status: 'normal',
    details: '热成像火点检测，烟雾识别，实时告警系统'
  },
  {
    id: 'device-05',
    name: '火灾监测 D2',
    type: 'wildfire',
    health: 68,
    temperature: 58.9,
    signalStrength: 76,
    location: '森林保护区南部',
    status: 'warning',
    details: '热成像火点检测，烟雾识别，实时告警系统'
  },
  {
    id: 'device-06',
    name: '洪水监测 E1',
    type: 'flood',
    health: 91,
    temperature: 37.2,
    signalStrength: 89,
    location: '河流上游',
    status: 'normal',
    details: '水位监测，流速测量，降水量分析'
  },
  {
    id: 'device-07',
    name: '洪水监测 E2',
    type: 'flood',
    health: 42,
    temperature: 40.5,
    signalStrength: 65,
    location: '河流下游',
    status: 'critical',
    details: '水位监测，流速测量，降水量分析，当前需要维修'
  },
  {
    id: 'device-08',
    name: '人物识别 C2',
    type: 'person-detection',
    health: 0,
    temperature: 0,
    signalStrength: 0,
    location: '公园东区',
    status: 'offline',
    details: 'AI人物识别系统，面部特征检测，行为分析'
  }
]);

// 选中的设备
const selectedDevice = ref<MonitoringDevice | null>(null);

// 显示设备详情对话框
const showDetails = ref(false);

// 获取状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal':
      return '#4CAF50';
    case 'warning':
      return '#FF9800';
    case 'critical':
      return '#F44336';
    case 'offline':
      return '#9E9E9E';
    default:
      return '#4CAF50';
  }
};

// 获取健康度描述
const getHealthDescription = (health: number) => {
  if (health >= 90) return '优秀';
  if (health >= 70) return '良好';
  if (health >= 50) return '一般';
  if (health >= 30) return '较差';
  return '危险';
};

// 按设备类型过滤
const filterByType = (type: string | null) => {
  if (!type) return monitoringDevices.value;
  return monitoringDevices.value.filter(device => device.type === type);
};

// 设备数量统计
const deviceStats = computed(() => {
  const total = monitoringDevices.value.length;
  const online = monitoringDevices.value.filter(d => d.status !== 'offline').length;
  const warning = monitoringDevices.value.filter(d => d.status === 'warning').length;
  const critical = monitoringDevices.value.filter(d => d.status === 'critical').length;
  const offline = monitoringDevices.value.filter(d => d.status === 'offline').length;
  
  return { total, online, warning, critical, offline };
});

// 选择设备
const selectDevice = (device: MonitoringDevice) => {
  selectedDevice.value = device;
  showDetails.value = true;
};

// 关闭详情
const closeDetails = () => {
  showDetails.value = false;
};

// 更新设备状态 (模拟数据变化)
const updateDevicesData = () => {
  setInterval(() => {
    monitoringDevices.value.forEach(device => {
      // 忽略离线设备
      if (device.status === 'offline') return;
      
      // 小幅度随机波动
      const tempChange = (Math.random() - 0.5) * 2;
      device.temperature = Math.max(20, Math.min(80, device.temperature + tempChange));
      
      // 更新健康状态
      if (device.temperature > 60) {
        device.health = Math.max(20, device.health - 0.5);
        device.status = device.health < 30 ? 'critical' : 'warning';
      } else if (device.temperature > 50) {
        device.health = Math.max(50, device.health - 0.1);
        device.status = 'warning';
      } else {
        device.health = Math.min(100, device.health + 0.05);
        device.status = device.health > 70 ? 'normal' : 'warning';
      }
      
      // 更新电池电量 (如果有)
      if (device.batteryLevel !== undefined) {
        device.batteryLevel = Math.max(0, Math.min(100, device.batteryLevel - 0.1));
      }
      
      // 更新信号强度 (如果有)
      if (device.signalStrength !== undefined) {
        const signalChange = (Math.random() - 0.5) * 5;
        device.signalStrength = Math.max(0, Math.min(100, device.signalStrength + signalChange));
      }
    });
  }, 3000);
};

// 当前选择的过滤类型
const selectedType = ref<string | null>(null);

// 切换类型过滤
const toggleTypeFilter = (type: string | null) => {
  selectedType.value = selectedType.value === type ? null : type;
};

// 组件加载时初始化动画
onMounted(() => {
  // 添加加载动画
  const devices = document.querySelectorAll('.device-item');
  
  gsap.from(devices, {
    y: 20,
    opacity: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: "power1.out",
  });
  
  // 开始模拟数据更新
  updateDevicesData();
});
</script>

<template>
  <div class="monitoring-devices-container">
    <div class="header-section">
      <h2 class="title">监控设备状态</h2>
      
      <div class="stats-bar">
        <div class="stat-item">
          <div class="stat-value">{{ deviceStats.total }}</div>
          <div class="stat-label">设备总数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value online">{{ deviceStats.online }}</div>
          <div class="stat-label">在线设备</div>
        </div>
        <div class="stat-item">
          <div class="stat-value warning">{{ deviceStats.warning }}</div>
          <div class="stat-label">警告状态</div>
        </div>
        <div class="stat-item">
          <div class="stat-value critical">{{ deviceStats.critical }}</div>
          <div class="stat-label">危险状态</div>
        </div>
        <div class="stat-item">
          <div class="stat-value offline">{{ deviceStats.offline }}</div>
          <div class="stat-label">离线设备</div>
        </div>
      </div>
      
      <div class="filter-buttons">
        <button 
          class="filter-button"
          :class="{ active: selectedType === null }"
          @click="toggleTypeFilter(null)"
        >
          全部设备
        </button>
        <button 
          class="filter-button"
          :class="{ active: selectedType === 'camera' }"
          @click="toggleTypeFilter('camera')"
        >
          标准摄像头
        </button>
        <button 
          class="filter-button"
          :class="{ active: selectedType === 'license-plate' }"
          @click="toggleTypeFilter('license-plate')"
        >
          车牌识别
        </button>
        <button 
          class="filter-button"
          :class="{ active: selectedType === 'person-detection' }"
          @click="toggleTypeFilter('person-detection')"
        >
          人物识别
        </button>
        <button 
          class="filter-button"
          :class="{ active: selectedType === 'wildfire' }"
          @click="toggleTypeFilter('wildfire')"
        >
          火灾监测
        </button>
        <button 
          class="filter-button"
          :class="{ active: selectedType === 'flood' }"
          @click="toggleTypeFilter('flood')"
        >
          洪水监测
        </button>
      </div>
    </div>
    
    <div class="devices-grid">
      <div 
        v-for="device in filterByType(selectedType)" 
        :key="device.id"
        class="device-item"
        :class="{ 
          'warning': device.status === 'warning',
          'critical': device.status === 'critical',
          'offline': device.status === 'offline'
        }"
        @click="selectDevice(device)"
      >
        <div class="device-header">
          <div class="device-title">
            <span class="device-name">{{ device.name }}</span>
            <span class="device-type">{{ getDeviceTypeName(device.type) }}</span>
          </div>
          <span class="status-indicator" :style="{ backgroundColor: getStatusColor(device.status) }"></span>
        </div>
        
        <div class="device-details">
          <div class="health-bar">
            <div class="health-bar-label">
              健康度: {{ device.status === 'offline' ? '离线' : `${Math.round(device.health)}%` }}
            </div>
            <div class="health-bar-track">
              <div 
                class="health-bar-fill" 
                :style="{ 
                  width: `${device.health}%`, 
                  backgroundColor: getStatusColor(device.status) 
                }"
              ></div>
            </div>
          </div>
          
          <div class="device-info">
            <div class="info-row">
              <span class="info-label">位置:</span>
              <span class="info-value">{{ device.location }}</span>
            </div>
            
            <div class="info-row" v-if="device.status !== 'offline'">
              <span class="info-label">温度:</span>
              <span class="info-value">{{ device.temperature.toFixed(1) }}°C</span>
            </div>
            
            <div class="info-row" v-if="device.signalStrength !== undefined && device.status !== 'offline'">
              <span class="info-label">信号:</span>
              <span class="info-value">{{ Math.round(device.signalStrength) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 设备详情对话框 -->
    <div v-if="showDetails && selectedDevice" class="device-details-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ selectedDevice.name }} 详情</h3>
          <button class="close-button" @click="closeDetails">×</button>
        </div>
        
        <div class="modal-body">
          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">设备类型:</span>
              <span class="detail-value">{{ getDeviceTypeName(selectedDevice.type) }}</span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">状态:</span>
              <span 
                class="detail-value status"
                :style="{ color: getStatusColor(selectedDevice.status) }"
              >
                {{ 
                  selectedDevice.status === 'normal' ? '正常' : 
                  selectedDevice.status === 'warning' ? '警告' : 
                  selectedDevice.status === 'critical' ? '危险' : '离线'
                }}
              </span>
            </div>
            
            <div class="detail-row">
              <span class="detail-label">位置:</span>
              <span class="detail-value">{{ selectedDevice.location }}</span>
            </div>
            
            <template v-if="selectedDevice.status !== 'offline'">
              <div class="detail-row">
                <span class="detail-label">健康度:</span>
                <span class="detail-value">
                  {{ Math.round(selectedDevice.health) }}% ({{ getHealthDescription(selectedDevice.health) }})
                </span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">温度:</span>
                <span 
                  class="detail-value"
                  :class="{
                    'warning-text': selectedDevice.temperature > 50,
                    'critical-text': selectedDevice.temperature > 60
                  }"
                >
                  {{ selectedDevice.temperature.toFixed(1) }}°C
                  {{ selectedDevice.temperature > 60 ? ' (过热!)' : selectedDevice.temperature > 50 ? ' (偏高)' : '' }}
                </span>
              </div>
              
              <div v-if="selectedDevice.batteryLevel !== undefined" class="detail-row">
                <span class="detail-label">电量:</span>
                <span 
                  class="detail-value"
                  :class="{ 'warning-text': selectedDevice.batteryLevel < 30 }"
                >
                  {{ Math.round(selectedDevice.batteryLevel) }}%
                  {{ selectedDevice.batteryLevel < 20 ? ' (电量不足!)' : '' }}
                </span>
              </div>
              
              <div v-if="selectedDevice.signalStrength !== undefined" class="detail-row">
                <span class="detail-label">信号强度:</span>
                <span 
                  class="detail-value"
                  :class="{ 'warning-text': selectedDevice.signalStrength < 50 }"
                >
                  {{ Math.round(selectedDevice.signalStrength) }}%
                  {{ selectedDevice.signalStrength < 40 ? ' (信号弱)' : '' }}
                </span>
              </div>
            </template>
            
            <div v-if="selectedDevice.lastMaintenance" class="detail-row">
              <span class="detail-label">上次维护:</span>
              <span class="detail-value">{{ selectedDevice.lastMaintenance }}</span>
            </div>
          </div>
          
          <div class="detail-description">
            <h4>技术参数</h4>
            <p>{{ selectedDevice.details }}</p>
          </div>
          
          <div class="action-buttons">
            <button 
              class="action-button primary" 
              :disabled="selectedDevice.status === 'offline'"
            >
              查看实时画面
            </button>
            <button class="action-button">历史记录</button>
            <button 
              class="action-button warning" 
              :disabled="selectedDevice.status === 'offline'"
            >
              标记为待修
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.monitoring-devices-container {
  background-color: #0a1929;
  color: #fff;
  border-radius: 10px;
  padding: 20px;
  position: relative;
  height: 100%;
  min-height: 400px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
}

.header-section {
  margin-bottom: 20px;
}

.title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #4fc3f7;
  border-bottom: 1px solid #1e3a5f;
  padding-bottom: 10px;
}

.stats-bar {
  display: flex;
  justify-content: space-between;
  background-color: #132f4c;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.8rem;
  color: #90caf9;
}

.stat-value.online {
  color: #4CAF50;
}

.stat-value.warning {
  color: #FF9800;
}

.stat-value.critical {
  color: #F44336;
}

.stat-value.offline {
  color: #9E9E9E;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.filter-button {
  background-color: #132f4c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 0.9rem;
}

.filter-button:hover {
  background-color: #1e3a5f;
}

.filter-button.active {
  background-color: #1976d2;
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
  overflow-y: auto;
  flex: 1;
}

.device-item {
  background-color: #132f4c;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
  cursor: pointer;
  border-left: 4px solid #4CAF50;
}

.device-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.device-item.warning {
  border-left-color: #FF9800;
}

.device-item.critical {
  border-left-color: #F44336;
  animation: pulse 2s infinite;
}

.device-item.offline {
  border-left-color: #9E9E9E;
  opacity: 0.7;
}

.device-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.device-title {
  display: flex;
  flex-direction: column;
}

.device-name {
  font-weight: bold;
  font-size: 1.1rem;
}

.device-type {
  font-size: 0.8rem;
  color: #90caf9;
  margin-top: 3px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.device-details {
  margin-top: 10px;
}

.health-bar {
  margin-bottom: 15px;
}

.health-bar-label {
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.health-bar-track {
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.health-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease, background-color 0.5s ease;
}

.device-info {
  font-size: 0.9rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.info-label {
  color: #90caf9;
}

/* 详情模态窗口 */
.device-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #132f4c;
  border-radius: 8px;
  min-width: 500px;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #1e3a5f;
}

.modal-header h3 {
  margin: 0;
  color: #4fc3f7;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #ccc;
  cursor: pointer;
}

.close-button:hover {
  color: white;
}

.modal-body {
  padding: 20px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-row {
  display: flex;
  margin-bottom: 10px;
}

.detail-label {
  width: 100px;
  color: #90caf9;
  font-weight: bold;
}

.detail-value {
  flex: 1;
}

.detail-value.status {
  font-weight: bold;
}

.warning-text {
  color: #FF9800;
}

.critical-text {
  color: #F44336;
}

.detail-description {
  background-color: rgba(0, 0, 0, 0.2);
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
}

.detail-description h4 {
  margin-top: 0;
  color: #4fc3f7;
  margin-bottom: 10px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #1e3a5f;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
}

.action-button:hover:not(:disabled) {
  background-color: #27496d;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.primary {
  background-color: #1976d2;
}

.action-button.primary:hover:not(:disabled) {
  background-color: #1565c0;
}

.action-button.warning {
  background-color: #d32f2f;
}

.action-button.warning:hover:not(:disabled) {
  background-color: #c62828;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-bar {
    flex-wrap: wrap;
  }
  
  .stat-item {
    flex-basis: 33%;
    margin-bottom: 10px;
  }
  
  .filter-buttons {
    justify-content: center;
  }
  
  .filter-button {
    flex: 1;
    min-width: 100px;
  }
  
  .modal-content {
    width: 90%;
    min-width: auto;
  }
}
</style> 