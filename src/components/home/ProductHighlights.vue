<script setup lang="ts">
import { ref } from 'vue';

interface ProductFeature {
  id: number;
  title: string;
  description: string;
  image: string;
  video?: string;
}

const features = ref<ProductFeature[]>([
  {
    id: 1,
    title: "先进的避障系统",
    description: "Skydio的3D扫描避障系统能360度全方位探测障碍物，即使在复杂环境中也能保证安全飞行。",
    image: "https://images.unsplash.com/photo-1506947411487-a56738267384?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    video: "https://ext.same-assets.com/913537297/24051968.mp4"
  },
  {
    id: 2,
    title: "人工智能跟踪",
    description: "内置的AI跟踪系统能够自动识别并跟随移动目标，适用于运动拍摄、人物跟踪和专业监控。",
    image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 3,
    title: "自主飞行技术",
    description: "即使是新手也能实现专业级航拍效果，AI自动规划飞行路径，让您专注于创作。",
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 4,
    title: "企业级数据安全",
    description: "满足企业安全标准，提供端到端加密和完全数据控制，保障您的数据安全。",
    image: "https://images.unsplash.com/photo-1563770660941-10a8b3099f6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: 5,
    title: "强大的3D建模",
    description: "自动捕捉并创建高精度3D模型，为建筑、测绘和基础设施检查提供可靠数据。",
    image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  }
]);
</script>

<template>
  <section class="py-20 bg-gradient-to-b from-gray-100 to-white">
    <div class="container mx-auto px-4">
      <div class="text-center mb-16" data-aos="fade-up">
        <h2 class="text-4xl font-bold text-skydio-dark mb-6">产品亮点</h2>
        <div class="w-20 h-1 bg-skydio-blue mx-auto mb-8"></div>
        <p class="max-w-2xl mx-auto text-lg text-gray-700">
          Skydio 无人机搭载最先进的自主飞行技术，提供卓越的飞行体验和革命性的航拍效果。
        </p>
      </div>
      
      <!-- 特性内容 -->
      <div class="space-y-24">
        <div 
          v-for="(feature, index) in features" 
          :key="`feature-${feature.id}`"
          class="feature-item flex flex-col lg:flex-row items-center gap-16"
          :class="index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'"
          data-aos="fade-up"
          :data-aos-delay="index * 100"
        >
          <!-- 内容区域 -->
          <div 
            class="lg:w-1/2 feature-content" 
            data-aos="fade-right"
            :data-aos-delay="index % 2 === 0 ? '0' : '200'"
          >
            <span class="text-skydio-blue font-medium mb-2 block">特性 {{ index + 1 }}/{{ features.length }}</span>
            <h3 class="text-3xl font-bold mb-6 text-skydio-dark">{{ feature.title }}</h3>
            <p class="text-lg text-gray-700 mb-8">{{ feature.description }}</p>
            
            <router-link 
              to="#" 
              class="inline-flex items-center text-skydio-blue font-medium hover:underline"
            >
              了解更多
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </router-link>
          </div>
          
          <!-- 媒体区域 -->
          <div 
            class="lg:w-1/2 feature-media" 
            data-aos="fade-left"
            :data-aos-delay="index % 2 === 0 ? '200' : '0'"
          >
            <div class="relative overflow-hidden rounded-xl shadow-2xl bg-skydio-dark">
              <!-- 视频或图片 -->
              <template v-if="feature.video">
                <video 
                  :src="feature.video" 
                  autoplay 
                  loop 
                  muted 
                  playsinline
                  class="w-full h-full object-cover max-h-[500px]"
                ></video>
              </template>
              <template v-else>
                <img 
                  :src="feature.image" 
                  :alt="feature.title" 
                  class="w-full max-h-[500px] object-cover"
                />
              </template>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 查看更多按钮 -->
      <div class="text-center mt-16">
        <router-link 
          to="#" 
          class="inline-block py-3 px-8 bg-skydio-blue text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors"
        >
          了解更多产品特性
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.feature-content, .feature-media {
  transition: transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.feature-item {
  transition: opacity 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.feature-item:hover {
  opacity: 1;
}

@media (max-width: 768px) {
  .feature-item {
    margin-bottom: 4rem;
  }
}
</style> 