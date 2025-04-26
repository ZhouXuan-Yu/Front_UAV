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
</script>

<template>
  <section class="relative py-36 overflow-hidden">
    <!-- Video Background -->
    <div class="absolute inset-0 z-0">
      <video
        class="object-cover w-full h-full"
        autoplay
        loop
        muted
        playsinline
      >
        <source src="@/assets/videos/file.mp4" type="video/mp4" />
      </video>
      <!-- 已移除蒙图overlay -->
    </div>
    
    <div class="container-narrow relative z-10">
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
section {
  min-height: 700px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7fafc;
}

.container-narrow {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}
</style>
