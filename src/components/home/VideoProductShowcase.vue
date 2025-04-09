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
});

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
  <section class="py-24 bg-gray-50">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- 产品描述 -->
        <div class="order-2 lg:order-1" data-aos="fade-right">
          <h2 class="text-3xl md:text-4xl font-bold mb-4">
            {{ product.title }}
          </h2>
          <h3 class="text-2xl md:text-3xl font-medium mb-6 text-gray-700">
            {{ product.subtitle }}
          </h3>
          <p class="text-lg mb-8 text-gray-600">
            {{ product.description }}
          </p>
          <router-link 
            :to="product.ctaLink" 
            class="inline-flex items-center px-6 py-3 bg-skydio-blue text-white rounded-md hover:bg-opacity-90 transition-colors"
          >
            {{ product.ctaText }}
            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </router-link>
        </div>
        
        <!-- 视频展示 -->
        <div class="order-1 lg:order-2" data-aos="fade-left">
          <div class="rounded-lg overflow-hidden shadow-xl bg-white p-2">
            <div class="aspect-video relative overflow-hidden rounded">
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
              
              <!-- 视频控制覆盖层 -->
              <div 
                class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 hover:bg-opacity-30 transition-all cursor-pointer"
                @click="toggleVideoPlayback"
              >
                <div class="w-20 h-20 rounded-full bg-white bg-opacity-80 flex items-center justify-center shadow-lg">
                  <svg v-if="!isPlaying" class="w-10 h-10 text-skydio-blue" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                  </svg>
                  <svg v-else class="w-10 h-10 text-skydio-blue" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
              
              <!-- 视频控制按钮 -->
              <div class="absolute bottom-4 right-4 flex space-x-2">
                <button 
                  class="p-2 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition-all focus:outline-none"
                  @click="toggleVideoPlayback"
                  aria-label="播放/暂停视频"
                >
                  <svg v-if="!isPlaying" class="w-5 h-5 text-skydio-blue" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                  </svg>
                  <svg v-else class="w-5 h-5 text-skydio-blue" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.aspect-video {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 宽高比 */
  height: 0;
  overflow: hidden;
}

.aspect-video video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style> 