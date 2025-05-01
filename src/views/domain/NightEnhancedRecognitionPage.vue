<script setup lang="ts">
import { ref } from 'vue';
import BaseFunctionPage from './BaseFunctionPage.vue';

const pageData = {
  title: '夜间增强识别技术',
  subtitle: '先进的夜间光线增强与图像识别系统',
  description: '我们的夜间增强识别技术结合了先进的光学成像和人工智能算法，使无人机能够在低光环境下进行高精度的目标识别和跟踪。',
  image: 'https://ext.same-assets.com/913537297/3416323236.png',
  features: [
    {
      title: '低光环境成像',
      description: '在极低光照条件下捕获高质量图像，实现夜间监控和检测的清晰视觉。',
      icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
    },
    {
      title: '红外热成像集成',
      description: '结合红外热成像技术，提供全天候、全天时的监控能力，不受光照条件限制。',
      icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
    },
    {
      title: 'AI增强处理',
      description: '使用深度学习算法对夜间获取的图像进行实时增强和分析，提高识别精度。',
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