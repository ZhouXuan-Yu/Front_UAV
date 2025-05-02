<script setup lang="ts">
import { ref } from 'vue';
import BaseFunctionPage from './BaseFunctionPage.vue';

const pageData = {
  title: '夜间增强识别技术',
  subtitle: '先进的夜间光线增强与图像识别系统',
  description: '融合低光图像增强与目标检测技术，解决夜间、弱光环境下的视觉感知挑战。系统对低质量图像进行增强处理，同时进行目标识别和跟踪，适用于夜间交通监控、安保巡检等场景。',
  image: new URL('@/assets/function/NighttimeEnhancement.png', import.meta.url).href,
  features: [
    {
      title: '自适应增强算法',
      description: '针对不同程度的低光环境，动态调整图像亮度、对比度和细节，提升图像可视性同时保持自然效果。',
      icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
    },
    {
      title: '噪声抑制与细节重建',
      description: '结合降噪网络和细节增强网络，在提高亮度的同时抑制噪声放大，保持图像边缘和纹理细节。',
      icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
    },
    {
      title: '低光目标检测',
      description: '特别优化的目标检测算法，针对低光条件下目标特征不明显的问题，提高检测灵敏度和准确性。',
      icon: 'https://ext.same-assets.com/794583279/2067545548.svg'
    }
  ],
  actionRoute: '/domain/night-enhanced-recognition/app',
  actionText: '开始使用夜间增强识别'
};
</script>

<template>
  <BaseFunctionPage
    :title="pageData.title"
    :subtitle="pageData.subtitle"
    :description="pageData.description"
    :image="pageData.image"
    :features="pageData.features"
    :actionRoute="pageData.actionRoute"
    :actionText="pageData.actionText"
  />
</template> 