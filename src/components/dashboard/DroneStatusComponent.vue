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
import type { DeviceType } from '@/types/devices';

// 定义监测设备状态类型
interface MonitoringDevice {
  id: string;
  name: string;
  type: 'camera' | 'license-plate' | 'person-detection' | 'wildfire' | 'night-street' | 'night-vehicle' | 'long-distance';
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
    case 'night-street':
      return '夜间街道巡视';
    case 'night-vehicle':
      return '夜间车辆检测';
    case 'long-distance':
      return '远距离监控';
    default:
      return '未知设备';
  }
};

// 设备类型定义
const deviceTypes = [
  { value: null, label: '全部设备' },
  { value: 'camera', label: '标准摄像头' },
  { value: 'license-plate', label: '车牌识别' },
  { value: 'person-detection', label: '人物识别' },
  { value: 'wildfire', label: '火灾监测' },
  { value: 'night-street', label: '夜间街道巡视' },
  { value: 'night-vehicle', label: '夜间车辆检测' },
  { value: 'long-distance', label: '远距离监控' }
];

// 当前筛选状态
const currentFilter = ref('all');
const currentTypeFilter = ref(null);
const currentPage = ref(1);
const pageSize = ref(10);

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
    name: '夜间街道 E1',
    type: 'night-street',
    health: 91,
    temperature: 37.2,
    signalStrength: 89,
    location: '市中心商业区',
    status: 'normal',
    details: '红外夜视系统，行人流量分析，异常行为识别'
  },
  {
    id: 'device-07',
    name: '夜间车辆 F1',
    type: 'night-vehicle',
    health: 42,
    temperature: 40.5,
    signalStrength: 65,
    location: '环城高速',
    status: 'critical',
    details: '夜间车辆检测系统，车型识别，超速监测，轨迹跟踪'
  },
  {
    id: 'device-08',
    name: '远距离监控 G1',
    type: 'long-distance',
    health: 78,
    temperature: 42.3,
    signalStrength: 85,
    location: '城市边界区',
    status: 'normal',
    details: '远距离高清监控，30倍光学变焦，红外夜视，全天候监测'
  },
  {
    id: 'device-09',
    name: '摄像头 A2',
    type: 'camera',
    health: 89,
    temperature: 37.8,
    signalStrength: 93,
    location: '火车站广场',
    status: 'normal',
    details: '全景高清摄像头，智能追踪，360度旋转'
  },
  {
    id: 'device-10',
    name: '摄像头 A3',
    type: 'camera',
    health: 76,
    temperature: 43.2,
    signalStrength: 81,
    location: '购物中心入口',
    status: 'warning',
    details: '双目立体视觉摄像头，人流统计，密度监测'
  },
  {
    id: 'device-11',
    name: '摄像头 A4',
    type: 'camera',
    health: 94,
    temperature: 36.5,
    signalStrength: 94,
    location: '体育场北门',
    status: 'normal',
    details: '超高清摄像头，智能异常检测，远程控制'
  },
  {
    id: 'device-12',
    name: '车牌识别 B2',
    type: 'license-plate',
    health: 82,
    temperature: 41.7,
    batteryLevel: 72,
    signalStrength: 88,
    location: '地下停车场入口',
    status: 'normal',
    details: '智能车牌识别系统，人脸比对，车辆信息匹配'
  },
  {
    id: 'device-13',
    name: '车牌识别 B3',
    type: 'license-plate',
    health: 65,
    temperature: 47.8,
    batteryLevel: 53,
    signalStrength: 79,
    location: '商业区停车场',
    status: 'warning',
    details: '高速车牌识别系统，车型分类，违章拍摄'
  },
  {
    id: 'device-14',
    name: '车牌识别 B4',
    type: 'license-plate',
    health: 87,
    temperature: 39.9,
    batteryLevel: 78,
    signalStrength: 90,
    location: '高速路口检查站',
    status: 'normal',
    details: '全天候车牌识别系统，多角度识别，防伪验证'
  },
  {
    id: 'device-15',
    name: '人物识别 C2',
    type: 'person-detection',
    health: 91,
    temperature: 40.2,
    signalStrength: 92,
    location: '步行街中心',
    status: 'normal',
    details: '智能人物跟踪系统，行为分析，异常识别'
  },
  {
    id: 'device-16',
    name: '人物识别 C3',
    type: 'person-detection',
    health: 81,
    temperature: 42.8,
    signalStrength: 87,
    location: '公园东区',
    status: 'normal',
    details: '多目标人物识别系统，人群密度监测，行为预测'
  },
  {
    id: 'device-17',
    name: '人物识别 C4',
    type: 'person-detection',
    health: 74,
    temperature: 44.5,
    signalStrength: 83,
    location: '儿童游乐区',
    status: 'warning',
    details: '特殊人群识别系统，儿童安全监测，走失预警'
  },
  {
    id: 'device-18',
    name: '火灾监测 D3',
    type: 'wildfire',
    health: 92,
    temperature: 37.5,
    signalStrength: 94,
    location: '城市公园林区',
    status: 'normal',
    details: '先进热成像系统，早期火灾预警，自动报警'
  },
  {
    id: 'device-19',
    name: '火灾监测 D4',
    type: 'wildfire',
    health: 31,
    temperature: 62.4,
    signalStrength: 64,
    location: '森林保护区东部',
    status: 'critical',
    details: '多光谱火灾监测系统，烟雾分析，风向预测'
  },
  {
    id: 'device-20',
    name: '夜间街道 E2',
    type: 'night-street',
    health: 87,
    temperature: 39.1,
    signalStrength: 91,
    location: '大学校园周边',
    status: 'normal',
    details: '高感光夜视系统，低光照监控，声音感应'
  },
  {
    id: 'device-21',
    name: '夜间街道 E3',
    type: 'night-street',
    health: 83,
    temperature: 41.2,
    signalStrength: 88,
    location: '住宅区小巷',
    status: 'normal',
    details: '智能夜间巡逻系统，异常行为检测，自动警报'
  },
  {
    id: 'device-22',
    name: '夜间街道 E4',
    type: 'night-street',
    health: 58,
    temperature: 51.3,
    signalStrength: 71,
    location: '工业区边缘',
    status: 'warning',
    details: '复合式夜间监控系统，热成像+红外，全天候监测'
  },
  {
    id: 'device-23',
    name: '夜间车辆 F2',
    type: 'night-vehicle',
    health: 84,
    temperature: 38.7,
    signalStrength: 89,
    location: '城市快速路',
    status: 'normal',
    details: '夜间车辆监测系统，超速检测，轨迹追踪'
  },
  {
    id: 'device-24',
    name: '夜间车辆 F3',
    type: 'night-vehicle',
    health: 76,
    temperature: 43.5,
    signalStrength: 82,
    location: '郊区公路',
    status: 'warning',
    details: '先进夜视系统，车辆分类，异常驾驶行为检测'
  },
  {
    id: 'device-25',
    name: '夜间车辆 F4',
    type: 'night-vehicle',
    health: 93,
    temperature: 36.9,
    signalStrength: 95,
    location: '机场高速',
    status: 'normal',
    details: '全天候车辆监控系统，车牌识别，速度监测'
  },
  {
    id: 'device-26',
    name: '远距离监控 G2',
    type: 'long-distance',
    health: 88,
    temperature: 39.5,
    signalStrength: 90,
    location: '城市制高点',
    status: 'normal',
    details: '超远距离监控系统，50倍光学变焦，高清成像'
  },
  {
    id: 'device-27',
    name: '远距离监控 G3',
    type: 'long-distance',
    health: 69,
    temperature: 46.8,
    signalStrength: 77,
    location: '山顶观测站',
    status: 'warning',
    details: '全景远距离监控，360度视角，气象适应性强'
  },
  {
    id: 'device-28',
    name: '远距离监控 G4',
    type: 'long-distance',
    health: 24,
    temperature: 59.7,
    signalStrength: 48,
    location: '湖泊监测点',
    status: 'critical',
    details: '水域远距离监控系统，防水设计，船只识别跟踪'
  },
  {
    id: 'device-29',
    name: '摄像头 A5',
    type: 'camera',
    health: 0,
    temperature: 0,
    signalStrength: 0,
    location: '城市东门',
    status: 'offline',
    details: '智能摄像头系统，人流统计，交通监控'
  },
  {
    id: 'device-30',
    name: '人物识别 C5',
    type: 'person-detection',
    health: 0,
    temperature: 0,
    signalStrength: 0,
    location: '商业街区',
    status: 'offline',
    details: '高精度人物识别系统，行为分析，VIP识别'
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

// 计算属性 - 设备列表
const devices = computed(() => monitoringDevices.value);

// 根据状态和类型筛选设备
const filteredDevices = computed(() => {
  let result = [...monitoringDevices.value];
  
  // 按状态筛选
  if (currentFilter.value !== 'all') {
    result = result.filter(device => {
      if (currentFilter.value === 'online') return device.status === 'normal';
      if (currentFilter.value === 'alert') return device.status === 'warning' || device.status === 'critical';
      if (currentFilter.value === 'offline') return device.status === 'offline';
      return true;
    });
  }
  
  // 按类型筛选
  if (currentTypeFilter.value !== null) {
    result = result.filter(device => device.type === currentTypeFilter.value);
  }
  
  return result;
});

// 分页相关计算属性
const totalPages = computed(() => Math.ceil(filteredDevices.value.length / pageSize.value));

const paginatedDevices = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize.value;
  const endIndex = startIndex + pageSize.value;
  return filteredDevices.value.slice(startIndex, endIndex);
});

// 设备状态计数
const onlineCount = computed(() => 
  monitoringDevices.value.filter(d => d.status === 'normal').length
);

const alertCount = computed(() => 
  monitoringDevices.value.filter(d => d.status === 'warning' || d.status === 'critical').length
);

const offlineCount = computed(() => 
  monitoringDevices.value.filter(d => d.status === 'offline').length
);

// 百分比计算
const onlinePercentage = computed(() => 
  Math.round((onlineCount.value / monitoringDevices.value.length) * 100)
);

const alertPercentage = computed(() => 
  Math.round((alertCount.value / monitoringDevices.value.length) * 100)
);

const offlinePercentage = computed(() => 
  Math.round((offlineCount.value / monitoringDevices.value.length) * 100)
);

// 方法
const setFilter = (filter: string) => {
  currentFilter.value = filter;
  resetPagination();
};

const setTypeFilter = (type: string | null) => {
  currentTypeFilter.value = type;
  resetPagination();
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const resetPagination = () => {
  currentPage.value = 1;
};

// 获取设备类型标签
const getDeviceTypeLabel = (type: string) => {
  const found = deviceTypes.find(dt => dt.value === type);
  return found ? found.label : '未知设备';
};

// 获取设备图标
const getDeviceTypeIcon = (type: DeviceType | string) => {
  const icons: Record<string, string> = {
    'camera': '/icons/camera.svg',
    'license-plate': '/icons/license-plate.svg',
    'person-detection': '/icons/person.svg',
    'wildfire': '/icons/fire.svg',
    'night-street': '/icons/night.svg',
    'night-vehicle': '/icons/car.svg',
    'long-distance': '/icons/telescope.svg'
  };
  
  return icons[type as string] || '/icons/device.svg';
};

// 获取健康度颜色
const getHealthColor = (health: number) => {
  if (health >= 80) return '#4CAF50';
  if (health >= 60) return '#FFC107';
  if (health >= 40) return '#FF9800';
  return '#F44336';
};
</script>

<template>
  <div class="drone-status-component">
    <div class="status-header">
      <div class="status-title">监控设备状态</div>
      <div class="status-filter">
        <div class="status-filter-item" :class="{ active: currentFilter === 'all' }" @click="setFilter('all')">
          全部设备 <span class="count">{{ devices.length }}</span>
        </div>
        <div class="status-filter-item" :class="{ active: currentFilter === 'online' }" @click="setFilter('online')">
          在线设备 <span class="count">{{ onlineCount }}</span>
        </div>
        <div class="status-filter-item" :class="{ active: currentFilter === 'alert' }" @click="setFilter('alert')">
          告警状态 <span class="count">{{ alertCount }}</span>
        </div>
        <div class="status-filter-item" :class="{ active: currentFilter === 'offline' }" @click="setFilter('offline')">
          离线设备 <span class="count">{{ offlineCount }}</span>
        </div>
        </div>
      <div class="status-filter-buttons">
        <span 
          v-for="(type, index) in deviceTypes" 
          :key="index" 
          class="filter-button"
          :class="{ active: currentTypeFilter === type.value }"
          @click="setTypeFilter(type.value)"
        >
          {{ type.label }}
        </span>
      </div>
    </div>
    
    <div class="status-summary">
      <div class="status-count">
        <span class="value">{{ filteredDevices.length }}</span>
        <span class="label">设备总数</span>
          </div>
      <div class="status-chart">
        <div class="chart-bar-container">
          <div class="chart-bar online" :style="{ width: `${onlinePercentage}%` }">
            <span class="bar-label">在线</span>
            <span class="bar-value">{{ onlineCount }}</span>
        </div>
          <div class="chart-bar alert" :style="{ width: `${alertPercentage}%` }">
            <span class="bar-label">告警</span>
            <span class="bar-value">{{ alertCount }}</span>
            </div>
          <div class="chart-bar offline" :style="{ width: `${offlinePercentage}%` }">
            <span class="bar-label">离线</span>
            <span class="bar-value">{{ offlineCount }}</span>
            </div>
          </div>
            </div>
            </div>
            
    <div class="status-list-container">
      <div class="status-list">
        <div 
          v-for="device in paginatedDevices" 
          :key="device.id" 
          class="status-item"
          :class="{ 'status-alert': device.status === 'warning' || device.status === 'critical', 'status-offline': device.status === 'offline' }"
          @click="selectDevice(device)"
        >
          <div class="status-icon">
            <img 
              :src="getDeviceTypeIcon(device.type)" 
              alt="Device icon" 
              class="device-icon"
              :class="{ 'pulse-alert': device.status === 'warning' || device.status === 'critical' }"
            />
            <div class="status-indicator" :class="device.status"></div>
            </div>
          <div class="status-details">
            <div class="device-name">{{ device.name }}</div>
            <div class="device-type">{{ getDeviceTypeLabel(device.type) }}</div>
            <div class="device-health">
              <span class="health-label">健康度:</span>
              <div class="health-bar-container">
                <div class="health-bar" :style="{ width: `${device.health}%`, backgroundColor: getHealthColor(device.health) }"></div>
            </div>
              <span class="health-value">{{ device.health }}%</span>
              </div>
              </div>
          <div class="device-location">
            <i class="el-icon-location"></i>
            {{ device.location }}
              </div>
            </div>
          </div>
          
      <div class="pagination-controls">
        <button type="button" class="pagination-button" :disabled="currentPage === 1" @click="prevPage">上一页</button>
        <span class="pagination-info">{{ currentPage }} / {{ totalPages }}</span>
        <button type="button" class="pagination-button" :disabled="currentPage === totalPages" @click="nextPage">下一页</button>
        
        <div class="page-size-selector">
          <span>每页显示:</span>
          <select v-model.number="pageSize" @change="resetPagination">
            <option :value="10">10</option>
            <option :value="15">15</option>
            <option :value="20">20</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drone-status-component {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  color: #e3f2fd;
}

.status-header {
  padding: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.status-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 15px;
}

.status-filter {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.status-filter-item {
  background-color: rgba(255, 255, 255, 0.08);
  padding: 8px 15px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.status-filter-item:hover {
  background-color: rgba(255, 255, 255, 0.12);
}

.status-filter-item.active {
  background-color: #3b82f6;
}

.count {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 2px 8px;
  margin-left: 5px;
  font-size: 0.8rem;
}

.status-filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.filter-button {
  background-color: rgba(255, 255, 255, 0.08);
  padding: 6px 12px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}

.filter-button:hover {
  background-color: rgba(255, 255, 255, 0.12);
}

.filter-button.active {
  background-color: #5c6bc0;
}

.status-summary {
  display: flex;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.status-count {
  display: flex;
  flex-direction: column;
  margin-right: 20px;
  width: 90px;
}

.status-count .value {
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
  line-height: 1;
}

.status-count .label {
  font-size: 0.9rem;
  color: #90caf9;
}

.status-chart {
  flex: 1;
  display: flex;
  align-items: center;
}

.chart-bar-container {
  width: 100%;
  height: 28px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  display: flex;
  overflow: hidden;
}

.chart-bar {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 10px;
  position: relative;
  transition: width 0.5s ease-in-out;
  min-width: 60px;
}

.chart-bar.online {
  background-color: #4caf50;
}

.chart-bar.alert {
  background-color: #ff9800;
}

.chart-bar.offline {
  background-color: #f44336;
}

.bar-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.9);
  margin-right: 5px;
}

.bar-value {
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
}

.status-list-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.status-list {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  grid-gap: 10px;
}

.status-item {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  border-left: 4px solid transparent;
}

.status-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.status-item.status-alert {
  border-left-color: #ff9800;
  animation: pulse 2s infinite;
}

.status-item.status-offline {
  border-left-color: #f44336;
  opacity: 0.7;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(255, 152, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
  }
}

.status-icon {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.device-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
  margin-right: 10px;
}

.device-icon.pulse-alert {
  animation: iconPulse 1.5s infinite;
}

@keyframes iconPulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
  100% {
    opacity: 1;
  }
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 10px;
}

.status-indicator.normal {
  background-color: #4caf50;
}

.status-indicator.alert {
  background-color: #ff9800;
}

.status-indicator.offline {
  background-color: #f44336;
}

.status-details {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.device-name {
  font-weight: bold;
  font-size: 1rem;
  margin-bottom: 5px;
  color: #fff;
}

.device-type {
  font-size: 0.85rem;
  color: #90caf9;
  margin-bottom: 8px;
}

.device-health {
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.health-label {
  font-size: 0.85rem;
  margin-right: 8px;
  color: #e3f2fd;
}

.health-bar-container {
  height: 6px;
  width: 100px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin-right: 8px;
}

.health-bar {
  height: 100%;
  transition: width 0.5s ease, background-color 0.5s ease;
}

.health-value {
  font-size: 0.85rem;
  color: #e3f2fd;
}

.device-location {
  font-size: 0.85rem;
  color: #b3e5fc;
  display: flex;
  align-items: center;
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
}

.device-location i {
  margin-right: 5px;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.pagination-button {
  background-color: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 4px;
  color: white;
  padding: 8px 15px;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.15);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  margin: 0 15px;
  color: #e3f2fd;
  background-color: rgba(0, 0, 0, 0.3);
  padding: 5px 10px;
  border-radius: 4px;
}

.page-size-selector {
  margin-left: auto;
  display: flex;
  align-items: center;
  color: #e3f2fd;
}

.page-size-selector span {
  margin-right: 8px;
  font-size: 0.9rem;
}

.page-size-selector select {
  background-color: rgba(255, 255, 255, 0.08);
  border: none;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  appearance: menulist-button;
}

.page-size-selector select option {
  background-color: #132f4c;
  color: white;
}
</style> 