/**
 * 文件名: MissionStatement.vue
 * 描述: 企业使命宣言组件
 * 在项目中的作用: 
 * - 展示公司的使命和价值主张
 * - 以简洁有力的方式传达品牌理念
 * - 通过视频背景增强视觉效果
 * - 在首页提供品牌定位和价值阐述
 */

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
// 导入视频资源
import videoSrc from '@/assets/videos/home2.mp4';

// 动态调整高度
const adjustHeight = () => {
  const section = document.querySelector('.mission-statement-section') as HTMLElement;
  if (section) {
    // 设置为视口高度
    section.style.height = `${window.innerHeight}px`;
  }
};

// 组件挂载时设置高度并添加窗口大小变化监听
onMounted(() => {
  adjustHeight();
  window.addEventListener('resize', adjustHeight);
});

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('resize', adjustHeight);
});
</script>

<template>
  <section class="mission-statement-section relative overflow-hidden">
    <!-- Video Background -->
    <div class="absolute inset-0 z-0">
      <video
        class="object-cover w-full h-full"
        autoplay
        loop
        muted
        playsinline
      >
        <source :src="videoSrc" type="video/mp4" />
      </video>
    </div>
    
    <div class="container-narrow relative z-10 flex flex-col justify-center h-full">
      <h2
        class="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-12 text-white"
        data-aos="fade-up"
      >
      空融智链，全天候守护低空经济
      </h2>
      <p
        class="text-xl md:text-2xl text-center max-w-4xl mx-auto text-white"
        data-aos="fade-up"
        data-aos-delay="100"
      >
      空融智链无人机软件平台，融合多模态感知技术，实现智能监测、精准决策和高效协同作业。我们致力于为低空经济活动提供全方位、全天候的智能化解决方案，确保安全与效率，助力低空经济的智能化发展。
      </p>
    </div>
  </section>
</template>

<style scoped>
.mission-statement-section {
  height: 100vh; /* 默认占满整个视口高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000; /* 更改为黑色背景，与视频更加搭配 */
}

.container-narrow {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* 为移动设备添加额外的调整 */
@media (max-width: 768px) {
  .mission-statement-section {
    padding: 2rem 0;
  }
  
  h2 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
  }
  
  p {
    font-size: 1.25rem;
  }
}
</style>
