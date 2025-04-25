/**
 * 文件名: HomeView.vue
 * 描述: 网站首页视图
 * 在项目中的作用: 
 * - 作为用户访问网站的第一个页面
 * - 展示产品的主要特点和核心功能
 * - 提供导航到其他页面的入口
 * - 通过视觉元素和交互体验吸引用户
 */

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import HeroBanner from '../components/home/HeroBanner.vue';
import MissionStatement from '../components/home/MissionStatement.vue';
import VideoProductShowcase from '../components/home/VideoProductShowcase.vue';
import ProductHighlights from '../components/home/ProductHighlights.vue';
import SolutionsCarousel from '../components/home/SolutionsCarousel.vue';
import ActionCards from '../components/home/ActionCards.vue';
import SuccessStories from '../components/home/SuccessStories.vue';
import CtaSection from '../components/home/CtaSection.vue';
import TransitionBanner from '../components/home/TransitionBanner.vue';

const router = useRouter();
const videoShowcaseRef = ref<HTMLElement | null>(null);
const secondShowcaseRef = ref<HTMLElement | null>(null);
const productHighlightsRef = ref<HTMLElement | null>(null);

// 第一个产品数据
const productOne = {
  title: 'Skydio X10:',
  subtitle: "You've never seen like this before",
  description: 'A world-class drone program starts with Skydio X10. Loaded with the best sensors in its class, guided by the most advanced AI in the sky, and built to gather the data you need, wherever and whenever you need it.',
  videoSrc: '/src/assets/videos/file.mp4',
  ctaText: 'See X10 in action',
  ctaLink: '/monitor-screen'
};

// 第二个产品数据
const productTwo = {
  title: 'Skydio 3:',
  subtitle: 'Mission-ready. Day or night.',
  description: 'Skydio drone programs help even the most dangerous work get done safer, smarter, and faster through remote autonomous flight. From Drone as First Responder to automated inspection and site security, Skydio helps you get the intelligence you need to make the best decisions.',
  videoSrc: '/src/assets/videos/file.mp4',
  ctaText: 'Vehicle Monitoring',
  ctaLink: '/vehicle-monitoring'
};

// Smooth scroll to the video showcase section
const scrollToVideoShowcase = () => {
  if (videoShowcaseRef.value) {
    videoShowcaseRef.value.scrollIntoView({ behavior: 'smooth' });
  }
};

// Smooth scroll to the second showcase section
const scrollToSecondShowcase = () => {
  if (secondShowcaseRef.value) {
    secondShowcaseRef.value.scrollIntoView({ behavior: 'smooth' });
  }
};

// Smooth scroll to the product highlights section
const scrollToProductHighlights = () => {
  if (productHighlightsRef.value) {
    productHighlightsRef.value.scrollIntoView({ behavior: 'smooth' });
  }
};

// 前往无人机任务页面
const goToDroneTask = () => {
  router.push('/drone-task');
};
</script>

<template>
  <main class="home-view">
    <!-- 首屏区域 -->
    <HeroBanner @scroll-to-showcase="scrollToVideoShowcase" />
    
    <!-- 演示功能入口 -->
    <!-- <div class="demo-section">
      <div class="container mx-auto px-4 py-8">
        <h2 class="text-2xl font-bold text-center mb-8">产品功能演示</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="demo-card" @click="router.push('/data-dashboard-detail')">
            <div class="demo-icon">📊</div>
            <h3>数据仪表盘</h3>
            <p>查看无人机数据分析和可视化界面</p>
          </div>
          
          <div class="demo-card" @click="goToDroneTask">
            <div class="demo-icon">🛸</div>
            <h3>无人机巡逻任务</h3>
            <p>查看正在执行的无人机巡逻任务</p>
          </div>
          
          <div class="demo-card" @click="router.push('/geo-api')">
            <div class="demo-icon">🗺️</div>
            <h3>地理服务API</h3>
            <p>体验位置搜索、路径规划等地理服务</p>
          </div>
        </div>
      </div>
    </div> -->
    
    <!-- 过渡区域 - 静态展示标题 -->
    <div class="transition-section">
      <div class="wave-divider top">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d="M0,192L48,165.3C96,139,192,85,288,96C384,107,480,181,576,202.7C672,224,768,192,864,176C960,160,1056,160,1152,176C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      <TransitionBanner 
        title="全天候执行任务" 
        subtitle="最先进的自主飞行系统，满足您的各种需求"
        bgImage="https://images.unsplash.com/photo-1622552279904-5c0c3f379f6c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1974&q=80"
      />
      <div class="wave-divider bottom">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d="M0,192L48,165.3C96,139,192,85,288,96C384,107,480,181,576,202.7C672,224,768,192,864,176C960,160,1056,160,1152,176C1248,192,1344,224,1392,240L1440,256L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
    
    <!-- 使命宣言 -->
    <MissionStatement />
    
    <!-- 第一个视频展示区域 -->
    <div ref="videoShowcaseRef" class="video-showcase-container">
      <VideoProductShowcase :product="productOne" />
    </div>
    
    <!-- 第二个视频展示区域 -->
    <div ref="secondShowcaseRef" class="video-showcase-container">
      <VideoProductShowcase :product="productTwo" />
    </div>
    
    <!-- 功能卡片 -->
    <ActionCards />
    
    <!-- 解决方案轮播 -->
    <SolutionsCarousel @scrollToNext="scrollToProductHighlights" />
    
    <!-- 产品亮点 -->
    <div ref="productHighlightsRef">
      <ProductHighlights />
    </div>
    
    <!-- 用户故事 -->
    <SuccessStories title="用户使用体验" description="看看专业人士如何评价Skydio无人机解决方案" />
    
    <!-- 行动号召 -->
    <CtaSection />
  </main>
</template>

<style scoped>
.home-view {
  padding-top: 60px;
  position: relative;
  overflow-x: hidden;
  background-color: #ffffff;
}

/* 演示功能区域 */
.demo-section {
  background-color: #f8fafc;
  padding: 40px 0;
}

.demo-card {
  background-color: white;
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.3s ease;
}

.demo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.demo-icon {
  font-size: 2.5rem;
  margin-bottom: 15px;
}

.demo-card h3 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1e293b;
}

.demo-card p {
  font-size: 0.9rem;
  color: #64748b;
}

.transition-section {
  position: relative;
  width: 100%;
  z-index: 2;
  margin: -20px 0;
  transform: translateZ(0);
}

/* 移除可能造成蒙图效果的伪元素 */
.transition-section::before {
  display: none;
}

.transition-section::after {
  display: none;
}

.video-showcase-container {
  position: relative;
  min-height: auto;
  overflow: visible;
  z-index: 1;
  background-color: transparent;
  margin: 0;
}

/* 减少视频展示区域的间距 */
.video-showcase-container + .video-showcase-container {
  margin-top: -40px;
}

/* 移除波浪效果的伪元素，可能会与轮播图干扰 */
.wave-divider {
  display: none; /* 完全移除波浪分隔符 */
}

@media (max-width: 768px) {
  .transition-section {
    margin: -10px 0;
  }
  
  .video-showcase-container {
    min-height: auto;
    margin-top: 0;
  }
  
  /* 移动端同样减少视频区域间距 */
  .video-showcase-container + .video-showcase-container {
    margin-top: -20px;
  }
  
  .home-view {
    padding-top: 40px;
  }
}
</style>
