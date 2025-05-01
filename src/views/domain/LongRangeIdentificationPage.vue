<script setup lang="ts">
import { ref } from 'vue';
import BaseFunctionPage from './BaseFunctionPage.vue';

const pageData = {
  title: '超远距离识别系统',
  subtitle: '领先业界的远距离目标识别与追踪技术',
  description: '我们的超远距离识别系统采用尖端光学技术和AI增强算法，可在几公里外精确识别和分类目标，为远程监控和安全应用提供无与伦比的能力。',
  image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
  features: [
    {
      title: '高倍光学变焦',
      description: '配备业界领先的变焦镜头系统，实现远距离高清成像，保证识别精度。',
      icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
    },
    {
      title: '特征增强技术',
      description: '通过特征提取和增强算法，放大图像中的关键特征，提高远距离目标的可识别性。',
      icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
    },
    {
      title: '多帧融合算法',
      description: '利用多帧图像融合技术，降低噪声影响，提高远距离成像的清晰度和稳定性。',
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