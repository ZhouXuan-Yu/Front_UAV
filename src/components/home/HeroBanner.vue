<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const currentTime = ref('00:00:00');
const currentDate = ref('00.00.0000');
const flightCount = ref(2097423);
const displayCount = ref(0);
const videoReady = ref(false);

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

// 飞行次数动画效果
const animateCount = () => {
  const duration = 2000; // 动画持续时间(毫秒)
  const steps = 50; // 步骤数
  const increment = Math.ceil(flightCount.value / steps);
  const interval = duration / steps;

  let current = 0;
  const timer = setInterval(() => {
    current += increment;
    if (current >= flightCount.value) {
      displayCount.value = flightCount.value;
      clearInterval(timer);
    } else {
      displayCount.value = current;
    }
  }, interval);
};

const handleVideoReady = () => {
  videoReady.value = true;
};

let timeInterval: number | null = null;

onMounted(() => {
  updateTime();
  timeInterval = window.setInterval(updateTime, 1000);

  // 组件挂载时启动数字动画
  animateCount();

  const video = document.getElementById('hero-video') as HTMLVideoElement;
  if (video) {
    if (video.readyState >= 2) {
      handleVideoReady();
    } else {
      video.addEventListener('loadeddata', handleVideoReady);
    }
    
    // 确保视频播放
    video.play().catch(error => {
      console.error('自动播放失败:', error);
      // 如果自动播放失败，可以显示播放按钮或其他替代方案
    });
  }
});

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval);
  }
});
</script>

<template>
  <section class="relative w-full overflow-hidden">
    <!-- 半透明黑色遮罩 -->
    <div 
      class="absolute inset-0 bg-black bg-opacity-50 z-10"
      :class="{ 'opacity-100': videoReady, 'opacity-0': !videoReady }"
      style="transition: opacity 1s ease-in-out"
    ></div>
    
    <!-- 视频背景 -->
    <video
      id="hero-video"
      class="absolute w-full h-full object-cover"
      autoplay
      loop
      muted
      playsinline
      :class="{ 'opacity-100': videoReady, 'opacity-0': !videoReady }"
      style="transition: opacity 1s ease-in-out"
    >
      <source
        src="https://ext.same-assets.com/913537297/24051968.mp4"
        type="video/mp4"
      >
    </video>
    
    <!-- 内容区域 -->
    <div 
      class="relative container mx-auto px-4 flex flex-col items-center justify-center min-h-[800px] z-20"
      :class="{ 'opacity-100 translate-y-0': videoReady, 'opacity-0 translate-y-8': !videoReady }"
      style="transition: opacity 1s ease-in-out, transform 1s ease-in-out"
    >
      <div class="max-w-4xl text-center text-white">
        <h1 
          class="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          智能飞行，尽在掌握
        </h1>
        
        <p 
          class="text-xl md:text-2xl mb-12 leading-relaxed"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          探索全球最先进的自主无人机系统，为企业和国防应用提供无与伦比的可靠性和性能。
        </p>
        
        <!-- 飞行计数器 -->
        <div
          class="mb-10 text-center"
          data-aos="fade-up"
          data-aos-delay="450"
        >
          <div class="text-lg opacity-80">{{ currentDate }} | {{ currentTime }}</div>
          <div class="flex items-center justify-center">
            <span class="text-3xl md:text-4xl font-bold">{{ displayCount.toLocaleString() }}</span>
            <span class="ml-3 text-xl opacity-80">次客户飞行记录</span>
          </div>
        </div>
        
        <div 
          class="flex flex-col md:flex-row justify-center gap-4"
          data-aos="fade-up"
          data-aos-delay="500"
        >
          <router-link
            to="#"
            class="inline-block py-3 px-8 bg-skydio-blue text-white font-medium text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-transform"
          >
            探索解决方案
          </router-link>
          
          <router-link
            to="#"
            class="inline-block py-3 px-8 bg-transparent text-white font-medium text-lg rounded-lg border-2 border-white hover:bg-white hover:text-skydio-dark transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-transform"
          >
            观看视频介绍
          </router-link>
        </div>
      </div>
      
      <!-- 滚动指示器 -->
      <div 
        class="absolute bottom-10 left-1/2 transform -translate-x-1/2 animation-bounce"
        data-aos="fade-up"
        data-aos-delay="600"
      >
        <svg 
          class="w-10 h-10 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
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
    
    <!-- 使命宣言覆盖 -->
    <div class="absolute bottom-0 left-0 right-0 z-20">
      <div class="container mx-auto px-4">
        <div 
          class="bg-skydio-dark text-white py-6 px-8 rounded-t-2xl max-w-xl mx-auto text-center shadow-2xl"
          data-aos="fade-up"
          data-aos-offset="0"
        >
          <h2 class="text-2xl font-bold mb-2">全天候执行任务</h2>
          <p class="opacity-80">最先进的自主飞行系统，满足您的各种需求</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
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
</style>
