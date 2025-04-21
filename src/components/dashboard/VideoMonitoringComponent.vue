<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { gsap } from 'gsap';

// 定义监控视频类型
type VideoType = 'normal' | 'license-plate' | 'person-detection' | 'wildfire' | 'flood';

// 定义无人机视频源接口
interface DroneVideo {
  id: string;
  name: string;
  videoType: VideoType;
  location: string;
  status: 'online' | 'offline';
  alertLevel: 'normal' | 'warning' | 'critical';
  imageUrl: string; // 模拟视频用的图片URL
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
    videoType: 'flood',
    location: '沿河地区',
    status: 'online',
    alertLevel: 'warning',
    imageUrl: 'https://ext.same-assets.com/913537297/145035404.jpeg'
  },
  {
    id: 'drone-06',
    name: '无人机-F6',
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
    case 'flood':
      return '洪水监测';
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

// 模拟视频帧更新
const startVideoFrameSimulation = () => {
  // 每3秒更新一次
  videoFrameInterval = window.setInterval(() => {
    // 模拟视频抖动
    simulateVideoShake();
    
    // 模拟告警级别变化
    droneVideos.value.forEach(video => {
      // 一定概率改变告警级别
      if (Math.random() < 0.1) {
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
  startVideoFrameSimulation();
  
  // 添加入场动画
  const videoContainers = document.querySelectorAll('.video-container');
  gsap.from(videoContainers, {
    y: 30,
    opacity: 0,
    stagger: 0.1,
    duration: 0.5,
    ease: "power2.out"
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
      <h2 class="title">无人机视频监控</h2>
      
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
          :class="{ active: selectedVideoType === 'flood' }"
          @click="changeVideoTypeFilter('flood')"
        >
          洪水监测
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
                  <span class="detection-value">京A88888</span>
                  <span class="detection-confidence">置信度: 92%</span>
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
                  <span class="detection-value">检测到 5 人</span>
                  <span class="detection-confidence">置信度: 89%</span>
                </div>
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
                  <span class="detection-value warning-text">发现热点异常!</span>
                  <span class="detection-confidence">风险等级: 高</span>
                </div>
              </div>
            </div>
            
            <div 
              v-if="video.videoType === 'flood'" 
              class="effect-overlay flood-effect"
            >
              <!-- 模拟洪水检测结果 -->
              <div class="detection-box warning-box">
                <div class="detection-title">洪水风险检测</div>
                <div class="detection-result">
                  <span class="detection-value warning-text">水位上升警告!</span>
                  <span class="detection-confidence">上升速度: 0.5m/h</span>
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
}

.multiple-view {
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  grid-auto-rows: minmax(300px, 1fr);
}

.single-view {
  grid-template-columns: 1fr;
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
    min-height: 250px;
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
</style> 