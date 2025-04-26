/**
 * 文件名: VideoProductShowcase.vue
 * 描述: 产品视频展示组件
 * 在项目中的作用: 
 * - 通过视频形式展示产品亮点和功能
 * - 提供交互式的产品演示体验
 * - 增强用户对产品的理解和兴趣
 * - 作为首页重要的产品宣传区域
 */

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useEventListener } from '@vueuse/core';

// 接收外部传入的产品数据
const props = defineProps({
  product: {
    type: Object,
    default: () => ({
  title: 'Skydio X10:',
      subtitle: "You've never seen like this before",
      description: 'A world-class drone program starts with Skydio X10. Loaded with the best sensors in its class, guided by the most advanced AI in the sky, and built to gather the data you need, wherever and whenever you need it.',
      videoSrc: '/src/assets/videos/file.mp4',
      ctaText: 'See X10 in action',
      ctaLink: '/monitor-screen'
    })
  }
});

const videoElement = ref<HTMLVideoElement | null>(null);

// 确保视频正确加载
onMounted(() => {
  videoElement.value = document.getElementById(`product-video-${props.product.title}`) as HTMLVideoElement;
  if (videoElement.value) {
    videoElement.value.play().catch(error => {
      console.error('视频自动播放失败:', error);
    });
  }
});
</script>

<template>
  <section class="video-showcase">
    <div class="container mx-auto px-4 py-10 md:py-16">
      <div class="flex flex-col lg:flex-row items-start">
        <!-- 产品描述 - 左侧 -->
        <div class="lg:w-[35%] mb-8 lg:mb-0 product-content lg:pr-8">
          <h2 class="text-5xl lg:text-6xl font-bold mb-3">{{ props.product.title }}</h2>
          <h3 class="text-3xl lg:text-4xl font-medium mb-5">{{ props.product.subtitle }}</h3>
          <p class="mb-8 text-xl leading-relaxed">{{ props.product.description }}</p>
        </div>
        
        <!-- 视频/图片展示 - 右侧 -->
        <div class="lg:w-[65%] video-container">
          <div class="media-card ml-auto">
            <div class="relative rounded-lg overflow-hidden shadow-lg">
              <video 
                :id="`product-video-${props.product.title}`"
                class="w-full h-full object-cover"
                autoplay
                loop
                muted
                playsinline
              >
                <source :src="props.product.videoSrc" type="video/mp4" />
                您的浏览器不支持视频标签。
              </video>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.video-showcase {
  position: relative;
  background-color: #ffffff;
  color: #000000;
  overflow: hidden;
  padding: 40px 0;
  width: 95%;
  margin: 0 auto;
}

.container {
  position: relative;
  z-index: 1;
  max-width: 1800px;
  width: 100%;
}

.product-content {
  padding-left: 2%;
  padding-top: 0;
}

.product-content h2 {
  color: #000000;
  line-height: 1.1;
  margin-top: 0;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.product-content h3 {
  color: #000000;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

/* 产品字号修改description */
.product-content p {
  color: #333333;
  line-height: 1.6;
  font-size: 1.5rem;
  font-weight: 400;
}

.cta-button {
  background-color: transparent;
  color: #000000;
  font-weight: 500;
  padding: 0.75rem 1.75rem;
  border-radius: 4px;
  border: 1px solid #000000;
  transition: all 0.2s ease;
  font-size: 1.125rem;
  letter-spacing: 0.01em;
}

.cta-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.media-card {
  width: 92%;
  border-radius: 8px;
  overflow: hidden;
}

.media-card video {
  aspect-ratio: 16/9;
  width: 100%;
  max-height: 750px;
  object-fit: cover;
}

@media (max-width: 1023px) {
  .product-content {
    text-align: center;
    padding-right: 0;
    padding-left: 0;
}

  .product-content h2 {
    font-size: 2.75rem;
}

  .product-content h3 {
    font-size: 1.75rem;
}

  .product-content p {
    font-size: 1.3rem;
}

  .container {
    padding-left: 12px;
    padding-right: 12px;
    width: 98%;
}

  .media-card {
    width: 100%;
    margin: 0 auto;
}

  .media-card video {
    max-height: 450px;
  }
  
  .cta-button {
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
  }
}
</style> 