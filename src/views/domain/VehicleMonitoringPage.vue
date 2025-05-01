<script setup lang="ts">
import { ref } from 'vue';
import BaseFunctionPage from './BaseFunctionPage.vue';

const pageData = {
  title: '车辆监控与报警',
  subtitle: '深度学习精准识别，多技术协同高效定位车牌。',
  description: '基于无人机图像的智能车辆监控系统，通过深度学习模型识别车牌信息，并结合多传感器数据实现精准定位和报警。系统支持实时监控、历史回放和报警联动，为交通管理提供智能化解决方案。',
  image: 'https://ext.same-assets.com/913537297/145035404.jpeg',
  features: [
    {
      title: '级联检测架构',
      description: '采用两阶段检测策略，先定位车辆，再精确识别车牌区域，大幅提高系统处理效率和识别准确率。',
      icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
    },
    {
      title: '字符分割与识别',
      description: '结合CNN与OCR技术，实现对车牌字符的精准分割和识别，支持各类标准和非标准车牌格式。',
      icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
    },
    {
      title: '角点定位技术',
      description: '创新性地采用车牌四角点定位方法，通过透视变换获取规范化车牌图像，解决倾斜、变形等问题。',
      icon: 'https://ext.same-assets.com/794583279/2067545548.svg'
    }
  ],
  actionRoute: '/domain/vehicle-monitoring/app',
  actionText: '开始使用车辆监控'
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