<script setup lang="ts">
import { ref } from 'vue';
import HeroBanner from '../components/home/HeroBanner.vue';
import MissionStatement from '../components/home/MissionStatement.vue';
import VideoProductShowcase from '../components/home/VideoProductShowcase.vue';
import ProductHighlights from '../components/home/ProductHighlights.vue';
import SolutionsCarousel from '../components/home/SolutionsCarousel.vue';
import ActionCards from '../components/home/ActionCards.vue';
import SuccessStories from '../components/home/SuccessStories.vue';
import CtaSection from '../components/home/CtaSection.vue';
import TransitionBanner from '../components/home/TransitionBanner.vue';

const videoShowcaseRef = ref<HTMLElement | null>(null);
const productHighlightsRef = ref<HTMLElement | null>(null);

// Smooth scroll to the video showcase section
const scrollToVideoShowcase = () => {
  if (videoShowcaseRef.value) {
    videoShowcaseRef.value.scrollIntoView({ behavior: 'smooth' });
  }
};

// Smooth scroll to the product highlights section
const scrollToProductHighlights = () => {
  if (productHighlightsRef.value) {
    productHighlightsRef.value.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<template>
  <main class="home-view">
    <!-- 首屏区域 -->
    <HeroBanner @scroll-to-showcase="scrollToVideoShowcase" />
    
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
    
    <!-- 视频展示区域 -->
    <div ref="videoShowcaseRef" class="video-showcase-container">
      <VideoProductShowcase />
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
  min-height: 90vh;
  overflow: visible;
  z-index: 1;
  background-color: transparent; /* 改为透明背景 */
  margin-top: 40px;
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
    margin-top: 20px;
  }
}
</style>
