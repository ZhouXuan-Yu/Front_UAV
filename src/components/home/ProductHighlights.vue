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
    title: "多模态融合感知",
    description: "融合可见光与热成像数据，结合深度学习模型实现复杂环境下小目标检测与识别，为低空经济活动提供全天候智能监测，提升安全性与效率，完美契合国家低空经济智能化发展政策。",
    image: "/src/assets/images/image.png",
    //video: "https://ext.same-assets.com/913537297/24051968.mp4"
  },
  {
    id: 2,
    title: "深度学习赋能精准识别",
    description: "利用多模型特征融合及深度学习算法，精准识别图像中的关键目标，为安防监控、人员管理等场景提供高效智能解决方案，拓展低空经济应用范围，符合国家对无人机技术智能化发展方向。",
    image: "/src/assets/images/image.png"
  },
  {
    id: 3,
    title: "低空智能决策支持",
    description: "借助知识图谱与语义理解技术，整合低空经济专业知识，实现智能问答与决策支持，为无人机任务规划与低空经济运营管理提供精准建议，推动低空经济向智能化方向发展。",
    image: "/src/assets/images/image.png"
  },
  {
    id: 4,
    title: "夜间行为识别与智能报警",
    description: "通过深度学习分类算法，精准识别夜间场景中的拥抱、握手、斗殴等人类行为，当检测到危险行为时自动触发报警系统，通过邮件、消息推送等多种方式实时通知安保人员，提升夜间安全监管能力。",
    image: "/src/assets/images/image.png"
  },
  {
    id: 5,
    title: "智能灾害预警",
    description: "基于无人机航拍图像和深度学习模型，快速精准定位火灾、洪水等自然灾害区域，提升灾害响应速度，减少低空经济活动中的风险，保障人民生命财产安全，符合国家加强低空经济应急管理要求。",
    image: "/src/assets/images/image.png"
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
          空融智链—融合多模态感知与深度学习技术，通过智能监测、精准决策和高效协同作业，给空中和低空经济提供新的智能化解决方案。
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
                  class="w-full object-cover"
                  width="720"
                  height="500"
                />
              </template>
            </div>
          </div>
        </div>
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