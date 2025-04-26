<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

// 导入视频文件
import videoFile from '../../assets/videos/file.mp4';

interface Props {
  title?: string;
  description?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '用户使用案例',
  description: '空融智链成功案例，由空融智链用户提供'
});
// 
interface SuccessStory {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  source: string;
  hasVideo: boolean;
  link: string;
  logo?: string;
  videoSrc?: string;
}

const successStories = ref<SuccessStory[]>([
  {
    id: 'email-service',
    title: '邮件发送智能服务系统',
    subtitle: '客户服务小组',
    description: '通过DeepSeek分析用户需求生成结构化回复，借助智能解析与格式化构建层级清晰的响应邮件，并利用EmailJS实现自动化投递，大幅提升客户响应效率。',
    image: 'https://ext.same-assets.com/913537297/3416323236.png',
    source: '客户服务小组',
    hasVideo: true,
    videoSrc: videoFile,
    link: '/success-stories/email-service',
    logo: '📧'
  },
  {
    id: 'data-dashboard',
    title: '无人机监控数据大屏系统',
    subtitle: '空融智链团队',
    description: '基于Vue3和TypeScript开发的监控平台，集成高德地图API实现地理信息处理，通过Three.js展示3D飞行路径，并使用ECharts呈现实时监测数据，为无人机巡检提供可视化支持。',
    image: 'https://ext.same-assets.com/913537297/1121177740.png',
    source: '空融智链团队',
    hasVideo: true,
    videoSrc: videoFile,
    link: '/success-stories/data-dashboard',
    logo: '📊'
  },
  {
    id: 'smart-navigation',
    title: '智程导航：多策略路径规划系统',
    subtitle: '智能规划小组',
    description: '集成高德地图的智能路径规划系统，通过多种算法策略为用户提供最优出行方案，支持实时路况分析、多方案智能比较和自然语言交互式查询，让出行更加便捷高效。',
    image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
    source: '智能规划小组',
    hasVideo: true,
    videoSrc: videoFile,
    link: '/success-stories/smart-navigation',
    logo: '🧭'
  },
  {
    id: 'person-recognition',
    title: '智眸千析：人物特征智能识别系统',
    subtitle: '计算机视觉实验室团队',
    description: '基于深度学习技术的人物特征分析系统，采用多模型特征融合技术，精确识别性别、年龄、服装颜色等多维特征，通过ResNet50等模型实现复杂场景下的高精度识别。',
    image: 'https://ext.same-assets.com/913537297/3416323236.png',
    source: '计算机视觉实验室团队',
    hasVideo: true,
    videoSrc: videoFile,
    link: '/success-stories/person-recognition',
    logo: '👁️'
  },
  {
    id: 'disaster-warning',
    title: '智能灾害预警与监测系统',
    subtitle: '灾害检测小组',
    description: '基于无人机航拍图像的自然灾害检测系统，应用U-Net网络架构进行火灾语义分割，结合异常模式检测技术，实现对森林火灾、洪水等自然灾害的早期识别和精确监测。',
    image: 'https://ext.same-assets.com/913537297/1121177740.png',
    source: '灾害检测小组',
    hasVideo: true,
    videoSrc: videoFile,
    link: '/success-stories/disaster-warning',
    logo: '🔥'
  },
  {
    id: 'semantic-segmentation',
    title: '本地大模型语义分割实现路径规划',
    subtitle: '智能规划小组',
    description: '通过深度学习模型对环境进行语义分割，实现无人机的精准路径规划，有效避开障碍物并选择最佳飞行路线。',
    image: 'https://ext.same-assets.com/913537297/3416323236.png', 
    source: '智能规划小组',
    hasVideo: true,
    videoSrc: videoFile,
    link: '/success-stories/semantic-segmentation',
    logo: '🛣️'
  },
  {
    id: 'image-recognition',
    title: '图像识别与分类系统应用',
    subtitle: '计算机视觉实验室团队',
    description: '基于ResNet50切割模型、年龄识别、性别分类及衣物颜色识别等多个本地训练模型，结合视觉模型实现多场景精准识别。',
    image: 'https://ext.same-assets.com/913537297/1121177740.png',
    source: '计算机视觉实验室团队',
    hasVideo: true,
    videoSrc: videoFile,
    link: '/success-stories/image-recognition',
    logo: '👁️'
  },
  {
    id: 'knowledge-base',
    title: '智能知识库交流系统上线',
    subtitle: '人工智能实验小组',
    description: '整合联网搜索、本地大语言模型对话及知识图谱构建，为用户提供全方位、深度的知识查询与交互体验。',
    image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
    source: '人工智能实验小组',
    hasVideo: true,
    videoSrc: videoFile,
    link: '/success-stories/knowledge-base',
    logo: '🧠'
  },
  {
    id: 'night-vehicle',
    title: '夜间车辆识别技术新突破',
    subtitle: '车辆识别小组',
    description: '采用先进图像增强算法结合YOLOv8模型，大幅提升夜间低光环境下的车辆检测准确率，为夜间交通监控提供可靠解决方案。',
    image: 'https://ext.same-assets.com/913537297/3416323236.png',
    source: '车辆识别小组',
    hasVideo: true,
    videoSrc: videoFile,
    link: '/success-stories/night-vehicle',
    logo: '🚗'
  },
  {
    id: 'long-distance',
    title: '超远距离物体识别系统',
    subtitle: '车辆识别小组',
    description: '专为高空或远距离监控设计的微小移动物体识别系统，能在极端条件下捕捉并识别移动目标，为边境安全提供技术支持。',
    image: 'https://ext.same-assets.com/913537297/1121177740.png',
    source: '车辆识别小组',
    hasVideo: true,
    videoSrc: videoFile,
    link: '/success-stories/long-distance',
    logo: '🔭'
  },
  {
    id: 'behavior-recognition',
    title: '夜间行为识别与智能报警系统',
    subtitle: '图像算法小组',
    description: '通过深度学习算法识别拥抱、握手、斗殴等人类行为，当检测到危险信号时，系统自动通过电子邮件发送警报至指定联系人。',
    image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
    source: '图像算法小组',
    hasVideo: true,
    videoSrc: videoFile,
    link: '/success-stories/behavior-recognition',
    logo: '⚠️'
  },
  {
    id: 'disaster-monitoring',
    title: '森林火灾与洪水实时监测系统',
    subtitle: '自然灾害检测小组',
    description: '结合高精度图像识别与热成像技术，实时监测森林火灾、洪水及泥石流等自然灾害，提前预警并协助应急决策。',
    image: 'https://ext.same-assets.com/913537297/3416323236.png',
    source: '自然灾害检测小组',
    hasVideo: true,
    videoSrc: videoFile,
    link: '/success-stories/disaster-monitoring',
    logo: '🔥'
  },
  {
    id: 'license-plate',
    title: '智能车牌识别与匹配告警系统',
    subtitle: '车辆识别小组',
    description: '上传目标车牌照片后，系统可实时监控视频流并匹配特定车牌，一旦发现匹配车辆，立即触发告警机制，大幅提升交通管理效率。',
    image: 'https://ext.same-assets.com/913537297/1121177740.png',
    source: '车辆识别小组',
    hasVideo: true,
    videoSrc: videoFile,
    link: '/success-stories/license-plate',
    logo: '🚓'
  },
  {
    id: 'drone-rescue',
    title: '无人机救援行动：山区搜救的新时代',
    subtitle: '无人机视觉小组',
    description: '在一次危险的山区救援行动中，空融智链成功定位了一名迷路登山者，为救援队提供了实时地形数据，大大缩短了救援时间。',
    image: 'https://ext.same-assets.com/913537297/3416323236.png',
    source: '无人机视觉小组',
    hasVideo: true,
    videoSrc: videoFile,
    link: '/success-stories/drone-rescue',
    logo: '🚨'
  },

]);

const currentIndex = ref(0);
const isTransitioning = ref(false);
const visibleItems = ref(4);
const autoScrollInterval = ref<number | null>(null);
const isReverse = ref(false);
const activeVideoId = ref<string | null>(null);

const displayedStories = computed(() => {
  const startIndex = currentIndex.value;
  const endIndex = Math.min(startIndex + visibleItems.value, successStories.value.length);
  return successStories.value.slice(startIndex, endIndex);
});

const hasNext = computed(() => {
  return currentIndex.value + visibleItems.value < successStories.value.length;
});

const hasPrev = computed(() => {
  return currentIndex.value > 0;
});

const goToNext = () => {
  if (isTransitioning.value) return;
  
    isTransitioning.value = true;
  
  if (!isReverse.value) {
    // 正向滚动
    if (hasNext.value) {
      currentIndex.value++;
    } else {
      // 到达末尾，切换为反向滚动
      isReverse.value = true;
      setTimeout(() => {
        currentIndex.value--;
      }, 100);
    }
  } else {
    // 反向滚动
    if (hasPrev.value) {
      currentIndex.value--;
    } else {
      // 到达开始，切换为正向滚动
      isReverse.value = false;
      setTimeout(() => {
    currentIndex.value++;
      }, 100);
    }
  }
  
    setTimeout(() => {
      isTransitioning.value = false;
    }, 500);
};

const goToPrev = () => {
  if (isTransitioning.value) return;
  
    isTransitioning.value = true;
  
  if (!isReverse.value) {
    if (hasPrev.value) {
      currentIndex.value--;
    } else {
      isReverse.value = true;
      setTimeout(() => {
        currentIndex.value++;
      }, 100);
    }
  } else {
    if (hasNext.value) {
      currentIndex.value++;
    } else {
      isReverse.value = false;
      setTimeout(() => {
    currentIndex.value--;
      }, 100);
    }
  }
  
    setTimeout(() => {
      isTransitioning.value = false;
    }, 500);
};

const startAutoScroll = () => {
  // 每3秒自动滚动
  autoScrollInterval.value = window.setInterval(() => {
    goToNext();
  }, 3000);
};

const stopAutoScroll = () => {
  if (autoScrollInterval.value !== null) {
    clearInterval(autoScrollInterval.value);
    autoScrollInterval.value = null;
  }
};

const toggleVideoPlayback = (videoId: string, event: Event) => {
  // 阻止事件冒泡
  event.stopPropagation();
  
  const videoElement = document.getElementById(`video-${videoId}`) as HTMLVideoElement;
  if (!videoElement) return;
  
  if (activeVideoId.value === videoId) {
    // 暂停当前播放的视频
    videoElement.pause();
    activeVideoId.value = null;
  } else {
    // 如果有其他视频在播放，先暂停它
    if (activeVideoId.value) {
      const activeVideo = document.getElementById(`video-${activeVideoId.value}`) as HTMLVideoElement;
      if (activeVideo) {
        activeVideo.pause();
      }
    }
    
    // 播放当前视频
    videoElement.play();
    activeVideoId.value = videoId;
  }
};

const adjustVisibleItems = () => {
  const width = window.innerWidth;
  if (width < 640) {
    visibleItems.value = 1;
  } else if (width < 1024) {
    visibleItems.value = 2;
  } else if (width < 1280) {
    visibleItems.value = 3;
  } else {
    visibleItems.value = 4;
  }
  
  // 确保当前索引合法
  if (currentIndex.value + visibleItems.value > successStories.value.length) {
    currentIndex.value = Math.max(0, successStories.value.length - visibleItems.value);
  }
};

onMounted(() => {
  adjustVisibleItems();
  window.addEventListener('resize', adjustVisibleItems);
  // 启动自动滚动
  startAutoScroll();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', adjustVisibleItems);
  // 组件卸载前停止自动滚动
  stopAutoScroll();
  
  // 确保所有视频都停止播放
  if (activeVideoId.value) {
    const activeVideo = document.getElementById(`video-${activeVideoId.value}`) as HTMLVideoElement;
    if (activeVideo) {
      activeVideo.pause();
    }
  }
});
</script>

<template>
  <section class="success-stories-section" 
           @mouseenter="stopAutoScroll" 
           @mouseleave="startAutoScroll">
    <div class="container-wide">
      <div class="section-header">
        <div class="title-container">
          <h2 class="section-title">{{ props.title }}</h2>
          <p v-if="props.description" class="section-description">{{ props.description }}</p>
        </div>
        <div class="navigation-buttons">
          <button 
            class="nav-button prev" 
            @click="goToPrev"
            aria-label="Previous stories"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button 
            class="nav-button next" 
            @click="goToNext"
            aria-label="Next stories"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div class="stories-carousel">
        <div class="stories-track">
        <div class="stories-wrapper" :style="{ transform: `translateX(-${currentIndex * (100 / visibleItems)}%)` }">
          <div 
            v-for="story in successStories" 
            :key="story.id" 
            class="story-card"
            :style="{ width: `calc(${100 / visibleItems}% - 1.5rem)` }"
          >
            <div class="card-header">
              <div class="source-info">
                  <div v-if="story.logo" class="source-logo">{{ story.logo }}</div>
                <span class="source-name">{{ story.source }}</span>
              </div>
              <div class="social-links">
                <a href="#" class="social-link">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="social-icon">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
              </div>
            </div>

            <div class="card-image">
                <video 
                  v-if="story.hasVideo" 
                  :id="`video-${story.id}`"
                  class="story-video" 
                  :class="{ 'playing': activeVideoId === story.id }"
                  muted 
                  playsinline
                  preload="metadata"
                  :poster="story.image"
                >
                  <source :src="story.videoSrc" type="video/mp4">
                </video>
                <img v-else :src="story.image" :alt="story.title" class="story-image" />
                <div 
                  class="video-overlay"
                  :class="{ 'playing': activeVideoId === story.id }"
                  @click="toggleVideoPlayback(story.id, $event)"
                >
                  <button 
                    class="play-button" 
                    aria-label="Play video"
                  >
                    <svg v-if="activeVideoId !== story.id" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.3)"></circle>
                    <path d="M10 8l6 4-6 4V8z"></path>
                  </svg>
                    <svg v-else xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.3)"></circle>
                      <path d="M10 8h-2v8h2V8zm6 0h-2v8h2V8z"></path>
                    </svg>
                </button>
              </div>
            </div>

            <div class="card-content">
              <h3 class="story-title">{{ story.title }}</h3>
              <p class="story-description">{{ story.description }}</p>
                <div class="content-blur-gradient"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.success-stories-section {
  padding: 6rem 0;
  background-color: #f8fafc;
  position: relative;
  width: 100%;
  overflow: hidden;
}

.container-wide {
  width: 88%;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 0 0.5rem;
}

.title-container {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.02em;
  background: linear-gradient(90deg, #1e293b, #3b82f6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.section-description {
  font-size: 1.25rem;
  color: #64748b;
  margin-top: 0.75rem;
  max-width: 650px;
}

.navigation-buttons {
  display: flex;
  gap: 0.75rem;
}

.nav-button {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: white;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.nav-button:hover {
  background-color: #f1f5f9;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.stories-carousel {
  position: relative;
  width: 100%;
  margin-bottom: 1.5rem;
}

.stories-track {
  overflow: hidden;
  width: 100%;
  padding: 0.5rem 0;
}

.stories-wrapper {
  display: flex;
  transition: transform 0.5s ease-out;
  gap: 1.5rem;
  margin-left: 0.5rem;
}

.story-card {
  flex-shrink: 0;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  height: 100%;
  min-height: 480px;
  position: relative;
  border: 1px solid rgba(230, 230, 230, 0.8);
}

.story-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 30px rgba(59, 130, 246, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.source-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.source-logo {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background-color: #f8fafc;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.source-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #4b5563;
}

.social-links {
  display: flex;
  gap: 0.5rem;
}

.social-link {
  color: #6b7280;
  transition: color 0.2s ease;
}

.social-link:hover {
  color: #3b82f6;
}

.social-icon {
  width: 20px;
  height: 20px;
}

.card-image {
  position: relative;
  height: 240px;
  overflow: hidden;
}

.story-image, .story-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.story-card:hover .story-image,
.story-card:hover .story-video:not(.playing) {
  transform: scale(1.06);
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.3));
  cursor: pointer;
  transition: background 0.3s ease;
}

.video-overlay.playing {
  background: rgba(0, 0, 0, 0.1);
  opacity: 0;
}

.video-overlay:hover {
  opacity: 1;
}

.play-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.3));
  transform: scale(0.8);
}

.play-button:hover {
  transform: scale(0.9);
}

.card-content {
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  height: 180px;
}

.content-blur-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), white 80%);
  pointer-events: none;
}

.story-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin-top: 0;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  line-height: 1.4;
}

.story-description {
  font-size: 0.9rem;
  color: #4b5563;
  margin: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
  line-height: 1.5;
}

/* 响应式调整 */
@media (max-width: 1280px) {
  .container-wide {
    width: 92%;
  }
  
  .section-title {
    font-size: 2.25rem;
  }
  
  .story-card {
    min-height: 460px;
  }
  
  .card-image {
    height: 220px;
  }
  
  .card-content {
    height: 170px;
  }
}

@media (max-width: 1024px) {
  .section-title {
    font-size: 2rem;
  }
  
  .section-description {
    font-size: 1.1rem;
  }
  
  .story-card {
    min-height: 440px;
  }
  
  .card-image {
    height: 200px;
  }
  
  .card-content {
    height: 160px;
  }
}

@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.25rem;
  }
  
  .navigation-buttons {
    align-self: flex-end;
  }
  
  .success-stories-section {
    padding: 4rem 0;
  }
  
  .container-wide {
    width: 94%;
  }
  
  .section-title {
    font-size: 1.75rem;
  }
  
  .section-description {
    font-size: 1rem;
    max-width: 100%;
  }
  
  .story-card {
    min-height: 420px;
  }
  
  .card-image {
    height: 180px;
  }
}

@media (max-width: 640px) {
  .container-wide {
    width: 90%;
  }
  
  .story-card {
    min-height: 400px;
  }
  
  .card-image {
    height: 180px;
  }
  
  .story-title {
    font-size: 1rem;
  }
  
  .card-content {
    height: 150px;
  }
  
  .story-description {
    font-size: 0.85rem;
  }
  
  .nav-button {
    width: 40px;
    height: 40px;
  }
}
</style>
