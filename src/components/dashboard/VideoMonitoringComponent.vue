/**
 * 文件名: VideoMonitoringComponent.vue
 * 描述: 视频监控组件
 * 在项目中的作用: 
 * - 提供无人机视频流的实时监控界面
 * - 支持多路视频源的切换和管理
 * - 实现对视频内容的分析和警报功能
 * - 提供视频回放和视频数据的筛选功能
 */

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed, watch } from 'vue';
import { gsap } from 'gsap';

// 定义监控视频类型
type VideoType = 'normal' | 'license-plate' | 'person-detection' | 'wildfire' | 'night-street' | 'night-vehicle' | 'long-distance';

// 定义无人机视频源接口
interface DroneVideo {
  id: string;
  name: string;
  videoType: VideoType;
  location: string;
  status: 'online' | 'offline';
  alertLevel: 'normal' | 'warning' | 'critical';
  imageUrl: string; // 模拟视频用的图片URL
  detectionResults?: DetectionResult[]; // 新增：检测结果
}

// 定义检测结果接口
interface DetectionResult {
  type: 'object' | 'face' | 'text' | 'scene' | 'anomaly';
  confidence: number;
  label: string;
  boundingBox?: { x: number, y: number, width: number, height: number };
  timestamp: number;
}

// 模拟无人机视频数据
const droneVideos = ref<DroneVideo[]>([
  {
    id: 'drone-01',
    name: '无人机-A1',
    videoType: 'normal',
    location: '城市中心区',
    status: 'online',
    alertLevel: 'normal',
    imageUrl: 'https://ext.same-assets.com/913537297/1124492884.jpeg'
  },
  {
    id: 'drone-02',
    name: '无人机-B2',
    videoType: 'license-plate',
    location: '高速公路入口',
    status: 'online',
    alertLevel: 'normal',
    imageUrl: 'https://ext.same-assets.com/913537297/1121177740.png'
  },
  {
    id: 'drone-03',
    name: '无人机-C3',
    videoType: 'person-detection',
    location: '公园西区',
    status: 'online',
    alertLevel: 'warning',
    imageUrl: 'https://ext.same-assets.com/913537297/1124492884.jpeg'
  },
  {
    id: 'drone-04',
    name: '无人机-D4',
    videoType: 'wildfire',
    location: '森林保护区',
    status: 'online',
    alertLevel: 'critical',
    imageUrl: 'https://ext.same-assets.com/913537297/145035404.jpeg'
  },
  {
    id: 'drone-05',
    name: '无人机-E5',
    videoType: 'night-street',
    location: '市中心商业区',
    status: 'online',
    alertLevel: 'warning',
    imageUrl: 'https://ext.same-assets.com/913537297/145035404.jpeg'
  },
  {
    id: 'drone-06',
    name: '无人机-F6',
    videoType: 'night-vehicle',
    location: '环城高速',
    status: 'online',
    alertLevel: 'warning',
    imageUrl: 'https://ext.same-assets.com/913537297/3416323236.png'
  },
  {
    id: 'drone-07',
    name: '无人机-G7',
    videoType: 'long-distance',
    location: '城市边界区',
    status: 'online',
    alertLevel: 'normal',
    imageUrl: 'https://ext.same-assets.com/913537297/1124492884.jpeg'
  },
  {
    id: 'drone-08',
    name: '无人机-H8',
    videoType: 'normal',
    location: '工业园区',
    status: 'offline',
    alertLevel: 'normal',
    imageUrl: 'https://ext.same-assets.com/913537297/3416323236.png'
  }
]);

// 活跃无人机ID
const activeVideoId = ref<string | null>(null);

// 显示的无人机视频
const displayedVideos = ref<DroneVideo[]>([]);

// 视图模式：单视图或多视图
const viewMode = ref<'single' | 'multiple'>('multiple');

// 初始化时显示的摄像头数量
const displayCount = ref(4);

// 选择的视频类型过滤器
const selectedVideoType = ref<VideoType | 'all'>('all');

// 模拟实时视频帧更新
let videoFrameInterval: number;

// 过滤无人机视频
const filterDroneVideos = () => {
  if (selectedVideoType.value === 'all') {
    return droneVideos.value.filter(video => video.status === 'online');
  } else {
    return droneVideos.value.filter(
      video => video.status === 'online' && video.videoType === selectedVideoType.value
    );
  }
};

// 更新显示的视频
const updateDisplayedVideos = () => {
  const filteredVideos = filterDroneVideos();
  
  if (viewMode.value === 'single') {
    if (activeVideoId.value) {
      const activeVideo = droneVideos.value.find(v => v.id === activeVideoId.value);
      if (activeVideo) {
        displayedVideos.value = [activeVideo];
      } else if (filteredVideos.length > 0) {
        displayedVideos.value = [filteredVideos[0]];
        activeVideoId.value = filteredVideos[0].id;
      } else {
        displayedVideos.value = [];
        activeVideoId.value = null;
      }
    } else if (filteredVideos.length > 0) {
      displayedVideos.value = [filteredVideos[0]];
      activeVideoId.value = filteredVideos[0].id;
    } else {
      displayedVideos.value = [];
    }
  } else {
    displayedVideos.value = filteredVideos.slice(0, displayCount.value);
  }
};

// 切换视图模式
const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'single' ? 'multiple' : 'single';
  updateDisplayedVideos();
};

// 设置活跃视频
const setActiveVideo = (videoId: string) => {
  activeVideoId.value = videoId;
  if (viewMode.value === 'single') {
    updateDisplayedVideos();
  }
};

// 切换视频类型过滤器
const changeVideoTypeFilter = (type: VideoType | 'all') => {
  selectedVideoType.value = type;
  updateDisplayedVideos();
};

// 获取视频类型标题
const getVideoTypeTitle = (type: VideoType): string => {
  switch (type) {
    case 'normal':
      return '标准监控';
    case 'license-plate':
      return '车牌识别';
    case 'person-detection':
      return '人物识别';
    case 'wildfire':
      return '森林火灾监测';
    case 'night-street':
      return '夜间街道巡视';
    case 'night-vehicle':
      return '夜间车辆检测';
    case 'long-distance':
      return '远距离监控';
    default:
      return '标准监控';
  }
};

// 获取告警级别颜色
const getAlertLevelColor = (level: 'normal' | 'warning' | 'critical'): string => {
  switch (level) {
    case 'normal':
      return '#4CAF50';
    case 'warning':
      return '#FF9800';
    case 'critical':
      return '#F44336';
    default:
      return '#4CAF50';
  }
};

// 模拟视频抖动效果
const simulateVideoShake = () => {
  const videoElements = document.querySelectorAll('.video-feed');
  
  videoElements.forEach((element) => {
    // 随机小幅度移动，模拟无人机晃动
    const xOffset = (Math.random() - 0.5) * 3;
    const yOffset = (Math.random() - 0.5) * 3;
    
    gsap.to(element, {
      x: xOffset,
      y: yOffset,
      duration: 0.5,
      ease: "power1.out",
      onComplete: () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "power1.out"
        });
      }
    });
  });
};

// 告警计数
const alertCounts = computed(() => {
  return {
    normal: droneVideos.value.filter(v => v.alertLevel === 'normal' && v.status === 'online').length,
    warning: droneVideos.value.filter(v => v.alertLevel === 'warning' && v.status === 'online').length,
    critical: droneVideos.value.filter(v => v.alertLevel === 'critical' && v.status === 'online').length
  };
});

// 总告警数
const totalAlerts = computed(() => {
  return alertCounts.value.warning + alertCounts.value.critical;
});

// 当前活跃视频的检测结果
const activeVideoDetectionResults = computed(() => {
  if (!activeVideoId.value) return [];
  const activeVideo = droneVideos.value.find(v => v.id === activeVideoId.value);
  return activeVideo?.detectionResults || [];
});

// 生成模拟检测结果
const generateDetectionResults = (videoType: VideoType): DetectionResult[] => {
  const results: DetectionResult[] = [];
  const now = Date.now();
  
  switch (videoType) {
    case 'license-plate':
      // 模拟车牌识别结果
      results.push({
        type: 'text',
        confidence: 0.85 + Math.random() * 0.14,
        label: ['京A88888', '沪B12345', '粤C67890', '津D54321', '冀E13579'][Math.floor(Math.random() * 5)],
        boundingBox: { x: 0.4, y: 0.6, width: 0.2, height: 0.1 },
        timestamp: now
      });
      break;
    case 'person-detection':
      // 模拟人物识别结果
      const personCount = Math.floor(Math.random() * 8) + 1;
      for (let i = 0; i < personCount; i++) {
        results.push({
          type: 'object',
          confidence: 0.75 + Math.random() * 0.2,
          label: '人物',
          boundingBox: {
            x: Math.random() * 0.7,
            y: Math.random() * 0.7,
            width: 0.1 + Math.random() * 0.1,
            height: 0.2 + Math.random() * 0.1
          },
          timestamp: now
        });
      }
      break;
    case 'wildfire':
      // 模拟火灾检测结果
      if (Math.random() > 0.4) {
        results.push({
          type: 'anomaly',
          confidence: 0.7 + Math.random() * 0.25,
          label: '热点异常',
          boundingBox: {
            x: 0.3 + Math.random() * 0.4,
            y: 0.3 + Math.random() * 0.4,
            width: 0.2,
            height: 0.2
          },
          timestamp: now
        });
      }
      break;
    case 'night-street':
      // 模拟夜间街道巡视结果
      results.push({
        type: 'scene',
        confidence: 0.8 + Math.random() * 0.15,
        label: '夜间街道巡视',
        timestamp: now
      });
      break;
    case 'night-vehicle':
      // 模拟夜间车辆检测结果
      results.push({
        type: 'scene',
        confidence: 0.8 + Math.random() * 0.15,
        label: '夜间车辆检测',
        timestamp: now
      });
      break;
    case 'long-distance':
      // 模拟远距离监控结果
      results.push({
        type: 'scene',
        confidence: 0.8 + Math.random() * 0.15,
        label: '远距离监控',
        timestamp: now
      });
      break;
    default:
      // 普通监控随机检测
      if (Math.random() > 0.7) {
        results.push({
          type: 'object',
          confidence: 0.65 + Math.random() * 0.3,
          label: ['车辆', '建筑', '树木', '道路'][Math.floor(Math.random() * 4)],
          boundingBox: {
            x: Math.random() * 0.6,
            y: Math.random() * 0.6,
            width: 0.15 + Math.random() * 0.2,
            height: 0.15 + Math.random() * 0.2
          },
          timestamp: now
        });
      }
      break;
  }
  
  return results;
};

// 更新所有视频的检测结果
const updateAllDetectionResults = () => {
  droneVideos.value.forEach(video => {
    if (video.status === 'online') {
      video.detectionResults = generateDetectionResults(video.videoType);
      
      // 根据检测结果判断告警级别
      if (video.videoType === 'wildfire' && video.detectionResults.some(d => d.label === '热点异常' && d.confidence > 0.85)) {
        video.alertLevel = 'critical';
      } else if (video.videoType === 'night-street' && video.detectionResults.some(d => d.label === '夜间街道巡视' && d.confidence > 0.85)) {
        video.alertLevel = 'warning';
      } else if (video.videoType === 'night-vehicle' && video.detectionResults.some(d => d.label === '夜间车辆检测' && d.confidence > 0.85)) {
        video.alertLevel = 'warning';
      } else if (video.videoType === 'long-distance' && video.detectionResults.some(d => d.label === '远距离监控' && d.confidence > 0.85)) {
        video.alertLevel = 'warning';
      } else if (video.videoType === 'person-detection' && video.detectionResults.length > 5) {
        video.alertLevel = 'warning';
      }
    }
  });
};

// 模拟视频帧更新
const startVideoFrameSimulation = () => {
  // 每3秒更新一次
  videoFrameInterval = window.setInterval(() => {
    // 模拟视频抖动
    simulateVideoShake();
    
    // 更新检测结果
    updateAllDetectionResults();
    
    // 随机更新告警级别（在updateAllDetectionResults后，给一些随机性）
    droneVideos.value.forEach(video => {
      // 一定概率改变告警级别，但不覆盖前面根据检测结果设置的级别
      if (Math.random() < 0.05) {
        const levels: ('normal' | 'warning' | 'critical')[] = ['normal', 'warning', 'critical'];
        const randomIndex = Math.floor(Math.random() * 3);
        video.alertLevel = levels[randomIndex];
      }
    });
  }, 3000);
};

// 初始化组件
onMounted(() => {
  updateDisplayedVideos();
  
  // 初始化检测结果
  updateAllDetectionResults();
  
  startVideoFrameSimulation();
  
  // 添加入场动画 - 使用nextTick确保DOM已渲染
  nextTick(() => {
    const videoContainers = document.querySelector('.video-grid');
    if (videoContainers) {
      const containers = videoContainers.querySelectorAll('.video-container');
      if (containers && containers.length > 0) {
        gsap.from(containers, {
          y: 30,
          opacity: 0,
          stagger: 0.1,
          duration: 0.5,
          ease: "power2.out"
        });
      } else {
        console.warn('未找到视频容器元素，跳过动画');
      }
    } else {
      console.warn('未找到视频网格元素，跳过动画');
    }
  });
});

// 组件卸载前清理
onBeforeUnmount(() => {
  if (videoFrameInterval) {
    clearInterval(videoFrameInterval);
  }
});
</script>

<template>
  <div class="video-monitoring-container">
    <div class="control-panel">
      <div class="header-row">
        <h2 class="title">无人机视频监控</h2>
        
        <div class="alert-summary" v-if="totalAlerts > 0">
          <div class="alert-badge">
            <span class="alert-count">{{ totalAlerts }}</span>
            <span class="alert-text">告警</span>
          </div>
          
          <div class="alert-details">
            <div v-if="alertCounts.critical > 0" class="alert-detail critical">
              <span class="dot"></span>
              <span>{{ alertCounts.critical }} 严重</span>
            </div>
            <div v-if="alertCounts.warning > 0" class="alert-detail warning">
              <span class="dot"></span>
              <span>{{ alertCounts.warning }} 警告</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="control-group">
        <button 
          class="control-button" 
          :class="{ active: viewMode === 'multiple' }"
          @click="toggleViewMode"
        >
          <span class="icon">⊞</span> 分屏视图
        </button>
        <button 
          class="control-button" 
          :class="{ active: viewMode === 'single' }"
          @click="toggleViewMode"
        >
          <span class="icon">▣</span> 单屏视图
        </button>
      </div>
      
      <div class="filter-group">
        <button 
          class="filter-button" 
          :class="{ active: selectedVideoType === 'all' }"
          @click="changeVideoTypeFilter('all')"
        >
          全部
        </button>
        <button 
          class="filter-button" 
          :class="{ active: selectedVideoType === 'normal' }"
          @click="changeVideoTypeFilter('normal')"
        >
          标准监控
        </button>
        <button 
          class="filter-button" 
          :class="{ active: selectedVideoType === 'license-plate' }"
          @click="changeVideoTypeFilter('license-plate')"
        >
          车牌识别
        </button>
        <button 
          class="filter-button" 
          :class="{ active: selectedVideoType === 'person-detection' }"
          @click="changeVideoTypeFilter('person-detection')"
        >
          人物识别
        </button>
        <button 
          class="filter-button" 
          :class="{ active: selectedVideoType === 'wildfire' }"
          @click="changeVideoTypeFilter('wildfire')"
        >
          火灾监测
        </button>
        <button 
          class="filter-button" 
          :class="{ active: selectedVideoType === 'night-street' }"
          @click="changeVideoTypeFilter('night-street')"
        >
          夜间街道巡视
        </button>
        <button 
          class="filter-button" 
          :class="{ active: selectedVideoType === 'night-vehicle' }"
          @click="changeVideoTypeFilter('night-vehicle')"
        >
          夜间车辆检测
        </button>
        <button 
          class="filter-button" 
          :class="{ active: selectedVideoType === 'long-distance' }"
          @click="changeVideoTypeFilter('long-distance')"
        >
          远距离监控
        </button>
      </div>
    </div>
    
    <div 
      class="video-grid" 
      :class="{ 
        'single-view': viewMode === 'single',
        'multiple-view': viewMode === 'multiple'
      }"
    >
      <div 
        v-for="video in displayedVideos" 
        :key="video.id"
        class="video-container"
        :class="{ 
          active: video.id === activeVideoId,
          warning: video.alertLevel === 'warning',
          critical: video.alertLevel === 'critical'
        }"
        @click="setActiveVideo(video.id)"
      >
        <div class="video-header">
          <div class="video-title">
            {{ video.name }} - {{ getVideoTypeTitle(video.videoType) }}
          </div>
          <div 
            class="alert-indicator" 
            :style="{ backgroundColor: getAlertLevelColor(video.alertLevel) }"
          ></div>
        </div>
        
        <div class="video-content">
          <!-- 模拟视频播放，使用图片替代视频流 -->
          <div class="video-feed">
            <img :src="video.imageUrl" alt="无人机视频流">
            
            <!-- 特效覆盖层: 根据视频类型显示不同特效 -->
            <div 
              v-if="video.videoType === 'license-plate'" 
              class="effect-overlay license-plate-effect"
            >
              <!-- 模拟车牌识别框和识别结果 -->
              <div class="detection-box">
                <div class="detection-title">车牌识别中...</div>
                <div class="detection-result">
                  <span class="detection-value">
                    {{ video.detectionResults && video.detectionResults.length > 0 ? 
                      video.detectionResults[0].label : '京A88888' }}
                  </span>
                  <span class="detection-confidence">
                    置信度: {{ video.detectionResults && video.detectionResults.length > 0 ? 
                      Math.round(video.detectionResults[0].confidence * 100) : 92 }}%
                  </span>
                </div>
              </div>
            </div>
            
            <div 
              v-if="video.videoType === 'person-detection'" 
              class="effect-overlay person-detection-effect"
            >
              <!-- 模拟人物识别框和识别结果 -->
              <div class="detection-box person-box">
                <div class="detection-title">人物识别中...</div>
                <div class="detection-result">
                  <span class="detection-value">检测到 {{ video.detectionResults ? video.detectionResults.length : 0 }} 人</span>
                  <span class="detection-confidence">
                    置信度: {{ video.detectionResults && video.detectionResults.length > 0 ? 
                      Math.round(video.detectionResults[0].confidence * 100) : 89 }}%
                  </span>
                </div>
              </div>
              
              <!-- 显示所有人物检测框 -->
              <div v-if="video.detectionResults">
                <div 
                  v-for="(detection, index) in video.detectionResults" 
                  :key="index"
                  class="person-detection-box"
                  :style="{
                    left: `${detection.boundingBox?.x ? detection.boundingBox.x * 100 : 0}%`,
                    top: `${detection.boundingBox?.y ? detection.boundingBox.y * 100 : 0}%`,
                    width: `${detection.boundingBox?.width ? detection.boundingBox.width * 100 : 0}%`,
                    height: `${detection.boundingBox?.height ? detection.boundingBox.height * 100 : 0}%`
                  }"
                ></div>
              </div>
            </div>
            
            <div 
              v-if="video.videoType === 'wildfire'" 
              class="effect-overlay wildfire-effect"
            >
              <!-- 模拟火灾检测结果 -->
              <div class="detection-box warning-box">
                <div class="detection-title">火灾风险检测</div>
                <div class="detection-result">
                  <span class="detection-value warning-text">
                    {{ video.detectionResults && video.detectionResults.length > 0 ? 
                      '发现热点异常!' : '未检测到异常' }}
                  </span>
                  <span class="detection-confidence">
                    风险等级: {{ video.detectionResults && video.detectionResults.length > 0 ? 
                      '高' : '低' }}
                  </span>
                </div>
              </div>
              
              <!-- 显示热点检测区域 -->
              <div v-if="video.detectionResults && video.detectionResults.length > 0">
                <div 
                  v-for="(detection, index) in video.detectionResults" 
                  :key="index"
                  class="heat-detection-area"
                  :style="{
                    left: `${detection.boundingBox?.x ? detection.boundingBox.x * 100 : 0}%`,
                    top: `${detection.boundingBox?.y ? detection.boundingBox.y * 100 : 0}%`,
                    width: `${detection.boundingBox?.width ? detection.boundingBox.width * 100 : 0}%`,
                    height: `${detection.boundingBox?.height ? detection.boundingBox.height * 100 : 0}%`
                  }"
                ></div>
              </div>
            </div>
            
            <div 
              v-if="video.videoType === 'night-street'" 
              class="effect-overlay night-street-effect"
            >
              <!-- 模拟夜间街道巡视结果 -->
              <div class="detection-box warning-box">
                <div class="detection-title">夜间街道巡视</div>
                <div class="detection-result">
                  <span class="detection-value warning-text">
                    {{ video.detectionResults && video.detectionResults.length > 0 ? 
                      '发现异常!' : '未发现异常' }}
                  </span>
                  <span class="detection-confidence">
                    风险等级: {{ video.detectionResults && video.detectionResults.length > 0 ? 
                      '中' : '低' }}
                  </span>
                </div>
              </div>
            </div>
            
            <div 
              v-if="video.videoType === 'night-vehicle'" 
              class="effect-overlay night-vehicle-effect"
            >
              <!-- 模拟夜间车辆检测结果 -->
              <div class="detection-box warning-box">
                <div class="detection-title">夜间车辆检测</div>
                <div class="detection-result">
                  <span class="detection-value warning-text">
                    {{ video.detectionResults && video.detectionResults.length > 0 ? 
                      '发现异常!' : '未发现异常' }}
                  </span>
                  <span class="detection-confidence">
                    风险等级: {{ video.detectionResults && video.detectionResults.length > 0 ? 
                      '中' : '低' }}
                  </span>
                </div>
              </div>
            </div>
            
            <div 
              v-if="video.videoType === 'long-distance'" 
              class="effect-overlay long-distance-effect"
            >
              <!-- 模拟远距离监控结果 -->
              <div class="detection-box warning-box">
                <div class="detection-title">远距离监控</div>
                <div class="detection-result">
                  <span class="detection-value warning-text">
                    {{ video.detectionResults && video.detectionResults.length > 0 ? 
                      '发现异常!' : '未发现异常' }}
                  </span>
                  <span class="detection-confidence">
                    风险等级: {{ video.detectionResults && video.detectionResults.length > 0 ? 
                      '中' : '低' }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- 视频时间戳和坐标 -->
            <div class="video-metadata">
              <div class="video-timestamp">{{ new Date().toLocaleTimeString() }}</div>
              <div class="video-location">{{ video.location }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 活跃视频的详细分析结果 -->
    <div v-if="viewMode === 'single' && activeVideoId && displayedVideos.length > 0" class="analysis-panel">
      <h3 class="analysis-title">视频分析结果</h3>
      
      <div class="analysis-content">
        <div v-if="activeVideoDetectionResults.length === 0" class="no-results">
          暂无分析结果
        </div>
        
        <div v-else class="result-list">
          <div v-for="(result, index) in activeVideoDetectionResults" :key="index" class="result-item">
            <div class="result-icon" :class="result.type"></div>
            <div class="result-details">
              <div class="result-label">{{ result.label }}</div>
              <div class="result-confidence">置信度: {{ Math.round(result.confidence * 100) }}%</div>
              <div class="result-time">{{ new Date(result.timestamp).toLocaleTimeString() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-monitoring-container {
  background-color: #0a1929;
  color: #fff;
  border-radius: 10px;
  padding: 20px;
  height: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.title {
  font-size: 1.5rem;
  margin: 0 0 20px;
  color: #4fc3f7;
}

.control-panel {
  margin-bottom: 20px;
}

.control-group {
  display: flex;
  margin-bottom: 15px;
  gap: 10px;
}

.control-button {
  background-color: #132f4c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.control-button:hover {
  background-color: #1e3a5f;
}

.control-button.active {
  background-color: #1976d2;
}

.icon {
  font-size: 1.2rem;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.filter-button {
  background-color: #132f4c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
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

.video-grid {
  display: grid;
  gap: 15px;
  flex: 1;
  overflow: auto;
  position: relative;
  z-index: 2;
  min-height: 400px;
}

.multiple-view {
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  grid-auto-rows: minmax(300px, 1fr);
}

.single-view {
  grid-template-columns: 1fr;
  grid-auto-rows: minmax(450px, 1fr);
}

.video-container {
  background-color: #132f4c;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #1e3a5f;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
}

.video-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.video-container.active {
  border-color: #1976d2;
}

.video-container.warning {
  border-color: #FF9800;
}

.video-container.critical {
  border-color: #F44336;
  animation: pulse 2s infinite;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: rgba(0, 0, 0, 0.3);
}

.video-title {
  font-weight: bold;
  font-size: 0.9rem;
}

.alert-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.video-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.video-feed {
  width: 100%;
  height: 100%;
  min-height: 250px;
  position: relative;
  overflow: hidden;
  z-index: 2;
}

.video-feed img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: relative;
  z-index: 1;
}

.video-metadata {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: white;
}

.video-timestamp {
  font-weight: bold;
}

.video-location {
  font-size: 0.75rem;
  opacity: 0.8;
}

/* 特效覆盖层 */
.effect-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
}

.detection-box {
  position: absolute;
  background-color: rgba(33, 150, 243, 0.7);
  border: 2px solid #2196F3;
  border-radius: 4px;
  padding: 8px;
  color: white;
  font-size: 0.8rem;
}

.license-plate-effect .detection-box {
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 150px;
}

.person-detection-effect .detection-box {
  top: 40%;
  left: 30%;
  border-color: #9C27B0;
  background-color: rgba(156, 39, 176, 0.7);
}

.warning-box {
  top: 20px;
  right: 20px;
  border-color: #F44336;
  background-color: rgba(244, 67, 54, 0.7);
}

.detection-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.detection-result {
  display: flex;
  flex-direction: column;
}

.detection-value {
  font-weight: bold;
}

.detection-confidence {
  font-size: 0.75rem;
  opacity: 0.9;
}

.warning-text {
  color: #ffeb3b;
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
  .multiple-view {
    grid-template-columns: 1fr;
  }
  
  .video-container {
    min-height: 300px;
  }
  
  .filter-group {
    flex-wrap: wrap;
  }
  
  .filter-button {
    flex: 1;
    min-width: 80px;
    text-align: center;
  }
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.alert-summary {
  display: flex;
  align-items: center;
  gap: 15px;
}

.alert-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #F44336;
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  justify-content: center;
  animation: pulse 2s infinite;
}

.alert-count {
  font-weight: bold;
  font-size: 1.1rem;
  line-height: 1;
}

.alert-text {
  font-size: 0.7rem;
}

.alert-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.alert-detail {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
}

.alert-detail.critical {
  color: #F44336;
}

.alert-detail.warning {
  color: #FF9800;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.alert-detail.critical .dot {
  background-color: #F44336;
}

.alert-detail.warning .dot {
  background-color: #FF9800;
}

/* 人物检测框样式 */
.person-detection-box {
  position: absolute;
  border: 2px solid #9C27B0;
  background-color: rgba(156, 39, 176, 0.2);
  border-radius: 2px;
  pointer-events: none;
}

/* 热点检测区域样式 */
.heat-detection-area {
  position: absolute;
  border: 2px dashed #F44336;
  background-color: rgba(244, 67, 54, 0.3);
  border-radius: 2px;
  pointer-events: none;
  animation: heat-pulse 1.5s infinite;
}

@keyframes heat-pulse {
  0% {
    background-color: rgba(244, 67, 54, 0.1);
  }
  50% {
    background-color: rgba(244, 67, 54, 0.4);
  }
  100% {
    background-color: rgba(244, 67, 54, 0.1);
  }
}

/* 水位线动画 */
.water-level-indicator {
  display: none; /* 隐藏不再使用的样式 */
}

.water-level {
  display: none; /* 隐藏不再使用的样式 */
}

@keyframes water-rise {
  0% {
    height: 30%;
    background: rgba(33, 150, 243, 0.2);
  }
  50% {
    height: 40%;
    background: rgba(33, 150, 243, 0.4);
  }
  100% {
    height: 30%;
    background: rgba(33, 150, 243, 0.2);
  }
}

/* 分析面板样式 */
.analysis-panel {
  margin-top: 20px;
  background-color: #132f4c;
  border-radius: 10px;
  padding: 15px;
}

.analysis-title {
  font-size: 1.2rem;
  margin: 0 0 15px;
  color: #4fc3f7;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
}

.analysis-content {
  max-height: 200px;
  overflow-y: auto;
}

.no-results {
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 20px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}

.result-icon {
  width: 30px;
  height: 30px;
  margin-right: 15px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.result-icon.object {
  background-color: rgba(33, 150, 243, 0.2);
  position: relative;
}

.result-icon.object::before {
  content: "□";
  color: #2196F3;
  font-size: 1.2rem;
}

.result-icon.face {
  background-color: rgba(233, 30, 99, 0.2);
  position: relative;
}

.result-icon.face::before {
  content: "☺";
  color: #E91E63;
  font-size: 1.2rem;
}

.result-icon.text {
  background-color: rgba(139, 195, 74, 0.2);
  position: relative;
}

.result-icon.text::before {
  content: "T";
  color: #8BC34A;
  font-size: 1.2rem;
  font-weight: bold;
}

.result-icon.scene {
  background-color: rgba(255, 152, 0, 0.2);
  position: relative;
}

.result-icon.scene::before {
  content: "⛰";
  color: #FF9800;
  font-size: 1.2rem;
}

.result-icon.anomaly {
  background-color: rgba(244, 67, 54, 0.2);
  position: relative;
}

.result-icon.anomaly::before {
  content: "⚠";
  color: #F44336;
  font-size: 1.2rem;
}

.result-details {
  flex: 1;
}

.result-label {
  font-weight: bold;
  margin-bottom: 3px;
}

.result-confidence {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 3px;
}

.result-time {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

/* 夜间街道巡视样式 */
.night-street-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: brightness(0.8) contrast(1.2);
  pointer-events: none;
}

/* 夜间车辆检测样式 */
.night-vehicle-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 20, 0.15);
  backdrop-filter: brightness(0.7) contrast(1.3);
  pointer-events: none;
}

/* 远距离监控样式 */
.long-distance-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 30, 50, 0.1);
  backdrop-filter: blur(1px) brightness(0.9);
  pointer-events: none;
}
</style> 