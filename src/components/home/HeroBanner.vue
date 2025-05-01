/**
 * 文件名: HeroBanner.vue
 * 描述: 首页英雄区横幅组件
 * 在项目中的作用: 
 * - 作为网站首页的主视觉区域
 * - 展示产品的核心价值主张和品牌形象
 * - 提供视觉冲击力和用户第一印象
 * - 引导用户进一步浏览网站内容
 */

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const currentTime = ref('00:00:00');
const currentDate = ref('00.00.0000');
const videoReady = ref(false);
const videoLoaded = ref(false);
const videoError = ref(false);
const scrollProgress = ref(0);

// 滚动事件监听
const handleScroll = () => {
  const scrollY = window.scrollY;
  const winHeight = window.innerHeight;
  // 计算滚动进度百分比
  scrollProgress.value = Math.min(1, scrollY / (winHeight * 0.7));
};

// 每秒更新时间和日期
const updateTime = () => {
  const now = new Date();

  // 格式化时间: HH:MM:SS
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  currentTime.value = `${hours}:${minutes}:${seconds}`;

  // 格式化日期: MM.DD.YYYY
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  currentDate.value = `${month}.${day}.${year}`;
};

const handleVideoReady = () => {
  videoReady.value = true;
  videoLoaded.value = true;
  console.log('视频已准备就绪');
};

const handleVideoError = () => {
  videoError.value = true;
  videoReady.value = true; // 即使视频错误也显示内容
  console.error('视频加载失败');
};

// 触发滚动到下一部分
const emit = defineEmits(['scroll-to-showcase']);

const scrollToNextSection = () => {
  emit('scroll-to-showcase');
};

let timeInterval: number | null = null;

onMounted(() => {
  updateTime();
  timeInterval = window.setInterval(updateTime, 1000);

  const video = document.getElementById('hero-video') as HTMLVideoElement;
  if (video) {
    // 使用更多事件监听视频状态
    video.addEventListener('loadeddata', handleVideoReady);
    video.addEventListener('canplay', handleVideoReady);
    video.addEventListener('error', handleVideoError);
    video.addEventListener('stalled', handleVideoError);
    
    // 如果视频已经加载
    if (video.readyState >= 2) {
      handleVideoReady();
    } else {
      // 设置加载超时，如果5秒内视频未加载完成，也显示内容
      setTimeout(() => {
        if (!videoReady.value) {
          console.warn('视频加载超时，显示备用内容');
          videoReady.value = true;
        }
      }, 5000); // 减少等待时间
    }
    
    // 确保视频播放
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('自动播放失败:', error);
        // 如果自动播放失败，尝试静音后再播放
        video.muted = true;
        video.play().catch(innerError => {
          console.error('即使静音也无法播放:', innerError);
          videoReady.value = true;
        });
      });
    }
  } else {
    // 如果找不到视频元素，直接显示内容
    console.warn('未找到视频元素');
    videoReady.value = true;
  }
  
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  // 清理视频相关事件监听
  const video = document.getElementById('hero-video') as HTMLVideoElement;
  if (video) {
    video.removeEventListener('loadeddata', handleVideoReady);
    video.removeEventListener('canplay', handleVideoReady);
    video.removeEventListener('error', handleVideoError);
    video.removeEventListener('stalled', handleVideoError);
  }
  
  if (timeInterval) {
    clearInterval(timeInterval);
  }
  
  // 移除滚动监听
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <section class="relative w-full h-screen overflow-hidden">
    <!-- 视频背景 - 优化视频质量和显示效果 -->
    <div class="video-container absolute w-full h-full">
      <!-- 预加载高质量图像作为背景 -->
      <div 
        class="absolute w-full h-full bg-cover bg-center"
        style="background-image: url('https://images.unsplash.com/photo-1579829366248-204fe8413f31?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80'); opacity: 0.99;"
      ></div>
      
      <video
        id="hero-video"
        class="absolute w-full h-full object-cover video-enhanced"
        autoplay
        loop
        muted
        playsinline
        preload="auto"
        :class="{ 'opacity-100': videoLoaded, 'opacity-0': !videoLoaded || videoError }"
        :style="{
          transition: 'opacity 1.5s ease-in-out, transform 0.5s ease-out',
          transform: `scale(${1 + scrollProgress * 0.1}) translateY(${scrollProgress * -5}%)`
        }"
      >
        <source
          src="@/assets/videos/file.mp4"
          type="video/mp4"
        >
      </video>
    </div>
    
    <!-- 内容区域 - 强化文字阴影使内容在任何背景上可见 -->
    <div 
      class="relative container mx-auto px-4 flex flex-col items-center justify-center h-screen z-20"
      :class="{ 'opacity-100 translate-y-0': videoReady, 'opacity-0 translate-y-8': !videoReady }"
      :style="{
        transition: 'opacity 1s ease-in-out, transform 1s ease-in-out',
        transform: `translateY(${scrollProgress * -100}px)`,
        opacity: 1 - scrollProgress * 1.5
      }"
    >
      <div class="max-w-4xl text-center">
        <h1 
          class="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight text-white hero-text-shadow"
          data-aos="fade-up"
          data-aos-delay="300"
          style="margin-top: -100px;"
        >
          智能飞行，尽在掌握
        </h1>
        
        <p 
          class="text-xl md:text-2xl mb-12 leading-relaxed text-white hero-desc-shadow"
          data-aos="fade-up"
          data-aos-delay="400"
        >
        探索最先进的低空多模态智能互联平台，融合大模型与深度学习，为低空经济打造智能协同的创新引擎。
        </p>
        
        <!-- 日期时间显示 -->
        <div
          class="mb-10 text-center mt-28"
          style="position: relative; top: 100px;"
          data-aos="fade-up"
          data-aos-delay="450"
        >
          <div class="flex items-center justify-center">
            <span class="text-3xl md:text-4xl font-bold text-white counter-text-shadow">{{ currentDate }}</span>
            <span class="ml-3 text-3xl md:text-4xl font-bold text-white counter-text-shadow">|</span>
            <span class="ml-3 text-3xl md:text-4xl font-bold text-white counter-text-shadow">{{ currentTime }}</span>
          </div>
        </div>
        
        <!-- 滚动指示器 -->
        <div 
          class="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
          :class="{ 'animation-bounce': scrollProgress < 0.1 }"
          data-aos="fade-up"
          data-aos-delay="600"
          @click="scrollToNextSection"
        >
          <svg 
            class="w-10 h-10 text-white filter drop-shadow-lg" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.6));"
          >
            <path 
              stroke-linecap="round" 
              stroke-linejoin="round" 
              stroke-width="2" 
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 完全清除任何可能的遮罩效果 */
.hero-section::before,
.hero-section::after,
section::before,
section::after,
.hero-section-overlay,
.hero-gradient-overlay,
.video-overlay,
.overlay-dark,
.overlay-light,
.overlay,
.bg-overlay,
.gradient-overlay {
  display: none !important;
  opacity: 0 !important;
  content: none !important;
  background: none !important;
  background-color: transparent !important;
  background-image: none !important;
}

/* 确保视频没有任何滤镜效果 */
video {
  filter: none !important;
  -webkit-filter: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* 使用 important 彻底移除任何可能的背景叠加 */
section {
  min-height: 100vh; /* 确保足够的高度 */
  background: transparent !important;
  position: relative !important;
  overflow: hidden !important;
}

/* 禁用任何层叠样式 */
*:before, *:after {
  display: none !important;
  content: none !important;
}

.animation-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  40% {
    transform: translateX(-50%) translateY(-20px);
  }
  60% {
    transform: translateX(-50%) translateY(-10px);
  }
}

/* 增强文字阴影以确保在任何背景下的可见度 */
.hero-text-shadow {
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.9), 
               0 2px 4px rgba(0, 0, 0, 0.9),
               0 0 8px rgba(0, 0, 0, 0.8);
}

.hero-desc-shadow {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8), 
               0 0 5px rgba(0, 0, 0, 0.6);
}

/* 移除波浪分隔符或其他装饰元素 */
.wave-separator {
  display: none !important;
}

.counter-text-shadow {
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8), 
               0 1px 3px rgba(0, 0, 0, 0.7);
}

/* 优化视频显示效果 */
.video-enhanced {
  /* 优化视频质量 */
  object-fit: cover;
  object-position: center;
  will-change: transform;
  filter: contrast(1.05) brightness(1.05) !important; /* 轻微增加对比度和亮度 */
  -webkit-filter: contrast(1.05) brightness(1.05) !important;
  
  /* 确保最佳性能 */
  backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-font-smoothing: antialiased;
  z-index: 2;
}

/* 视频容器样式 */
.video-container {
  overflow: hidden;
  z-index: 1;
}
</style>
