<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useEventListener } from '@vueuse/core';

// 产品数据
const product = ref({
  title: 'Skydio X10:',
  subtitle: '前所未有的飞行视角',
  description: '世界级无人机项目从Skydio X10开始。配备同类最佳传感器，由天空中最先进的人工智能引导，专为收集您需要的数据而设计，无论何时何地。',
  videoSrc: '@/assets/videos/file.mp4',
  ctaText: '查看X10实际应用',
  ctaLink: '#'
});

const isPlaying = ref(false);
const videoElement = ref<HTMLVideoElement | null>(null);

// 确保视频正确加载
onMounted(() => {
  videoElement.value = document.getElementById('product-video') as HTMLVideoElement;
  if (videoElement.value) {
    videoElement.value.play().catch(error => {
      console.error('视频自动播放失败:', error);
    });
  }
  
  // 添加页面滚动事件监听
  window.addEventListener('scroll', handleScroll);
  
  // 组件卸载时移除事件监听
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
});

// 处理页面滚动，添加动画效果
const handleScroll = () => {
  if (!videoElement.value) return;
  
  // 计算元素在视口中的位置
  const rect = videoElement.value.getBoundingClientRect();
  const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  
  // 如果视频在视口中
  if (rect.top < viewHeight && rect.bottom > 0) {
    // 根据滚动位置计算播放速率
    const scrollProgress = 1 - Math.abs(rect.top) / viewHeight;
    const playbackRate = Math.max(0.5, Math.min(1.2, scrollProgress * 1.5));
    
    videoElement.value.playbackRate = playbackRate;
    
    // 如果视频暂停且在视口中超过50%，自动播放
    if (videoElement.value.paused && scrollProgress > 0.5) {
      videoElement.value.play().catch(() => {});
    }
  } else if (!videoElement.value.paused) {
    // 如果视频不在视口中，暂停播放
    videoElement.value.pause();
  }
};

// 控制视频播放/暂停
const toggleVideoPlayback = () => {
  if (!videoElement.value) return;
  
  if (videoElement.value.paused) {
    videoElement.value.play();
    isPlaying.value = true;
  } else {
    videoElement.value.pause();
    isPlaying.value = false;
  }
};

// 监听视频播放状态变化
useEventListener(videoElement, 'play', () => {
  isPlaying.value = true;
});

useEventListener(videoElement, 'pause', () => {
  isPlaying.value = false;
});
</script>

<template>
  <section class="video-showcase">
    <div class="container mx-auto px-4 py-16 md:py-24">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- 产品描述 -->
        <div class="order-2 lg:order-1 video-content" data-aos="fade-right">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">
            {{ product.title }}
          </h2>
          <h3 class="text-2xl md:text-3xl font-medium mb-6">
            {{ product.subtitle }}
          </h3>
          <p class="text-lg mb-8">
            {{ product.description }}
          </p>
          <router-link 
            :to="product.ctaLink" 
            class="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {{ product.ctaText }}
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </router-link>
        </div>
        
        <!-- 视频展示 -->
        <div class="order-1 lg:order-2 video-container" data-aos="fade-left">
          <div class="video-card">
            <div class="aspect-video relative overflow-hidden rounded-lg shadow-xl">
              <video 
                id="product-video"
                class="w-full h-full object-cover"
                autoplay
                loop
                muted
                playsinline
              >
                <source :src="product.videoSrc" type="video/mp4" />
                您的浏览器不支持视频标签。
              </video>
              
              <!-- 视频控制覆盖层 - 降低遮挡程度 -->
              <div 
                class="video-controls"
                @click="toggleVideoPlayback"
              >
                <div class="control-btn">
                  <svg v-if="!isPlaying" class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                  </svg>
                  <svg v-else class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              
              <!-- 视频浮动装饰 -->
              <div class="video-decorations">
                <div class="decoration top-left"></div>
                <div class="decoration bottom-right"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 移动到下一个部分的箭头 -->
      <div class="scroll-down-indicator">
        <svg class="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </div>
  </section>
</template>

<style scoped>
.video-showcase {
  position: relative;
  background-color: #ffffff;
  color: #2d3748;
  overflow: visible;
  padding-top: 40px;
  padding-bottom: 60px;
  z-index: 1; /* 降低z-index，避免与其他组件发生堆叠问题 */
}

.container {
  position: relative;
  z-index: 1;
}

.aspect-video {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 宽高比 */
  height: 0;
  overflow: hidden;
  background-color: #f7fafc; /* 添加背景色，防止加载时出现空白 */
}

.aspect-video video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease, filter 0.5s ease;
  filter: contrast(1.05) brightness(1.05);
}

.aspect-video:hover video {
  transform: scale(1.02);
  filter: brightness(1.1);
}

.video-card {
  position: relative;
  transform: perspective(1000px) rotateY(-5deg);
  transition: transform 0.6s ease;
  transform-style: preserve-3d;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(226, 232, 240, 1);
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  /* 添加will-change提高动画性能 */
  will-change: transform;
}

.video-card:hover {
  transform: perspective(1000px) rotateY(0deg);
}

.video-controls {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0); /* 完全移除遮罩背景 */
  opacity: 0;
  transition: opacity 0.3s ease;
  cursor: pointer;
}

.video-container:hover .video-controls {
  opacity: 1;
}

.control-btn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transform: scale(0.9);
  transition: transform 0.3s ease, background 0.3s ease;
}

.control-btn:hover {
  transform: scale(1);
  background: rgba(255, 255, 255, 0.9);
}

.control-btn svg {
  color: #3182ce;
}

.video-container, .video-content {
  position: relative;
  z-index: 1; /* 降低z-index，确保不会覆盖整个页面 */
}

/* 移除视频装饰元素，避免引起问题 */
.video-decorations {
  display: none;
}

.decoration {
  display: none;
}

.scroll-down-indicator {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.scroll-down-indicator:hover {
  opacity: 1;
}

.scroll-down-indicator svg {
  color: #3182ce;
}

.video-content h2 {
  color: #2d3748;
}

.video-content h3 {
  color: #4a5568;
}

.video-content p {
  color: #718096;
}

@media (max-width: 768px) {
  .video-card {
    transform: none;
  }
}
</style> 