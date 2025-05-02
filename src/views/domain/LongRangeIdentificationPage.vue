<script setup lang="ts">
import { ref } from 'vue';
import BaseFunctionPage from './BaseFunctionPage.vue';

const pageData = {
  title: '超远距离识别系统',
  subtitle: '先进算法实现远距离目标识别与追踪技术',
  description: '集成可见光和热成像双模态数据，专注于小目标检测与识别，特别适用于复杂背景下的目标探测。系统融合两种图像信息，提高恶劣环境和夜间条件下的目标检测性能。',
  image: new URL('@/assets/function/remote.png', import.meta.url).href,
  features: [
    {
      title: '多模态特征融合',
      description: '创新性地结合可见光和红外热像信息，通过特征级和决策级的融合策略，提升检测系统的环境适应性。',
      icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
    },
    {
      title: '小目标增强检测',
      description: '采用深度学习模型专门优化小尺寸目标的检测性能，解决传统方法对微小目标检测不足的问题。',
      icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
    },
    {
      title: '跨模态匹配算法',
      description: '实现可见光与热成像图像的精准对齐和匹配，解决不同模态传感器间的空间和时间同步挑战。',
      icon: 'https://ext.same-assets.com/794583279/2067545548.svg'
    }
  ],
  actionRoute: '/domain/long-range-identification/app',
  actionText: '开始使用超远距离识别'
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