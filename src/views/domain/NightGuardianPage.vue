<script setup lang="ts">
import { ref } from 'vue';
import BaseFunctionPage from './BaseFunctionPage.vue';

const pageData = {
  title: '夜间守护者系统',
  subtitle: '全方位夜间安全监控与保护解决方案',
  description: '夜间守护者系统是我们专为夜间安全监控设计的综合解决方案，集成了夜视技术、热成像和AI智能分析，提供无与伦比的夜间安全保障能力。',
  image: new URL('@/assets/function/guard.png', import.meta.url).href,
  features: [
    {
      title: '自动巡逻监控',
      description: '无人机自主执行预设巡逻路线，实时监控关键区域，自动识别潜在威胁并发出警报。',
      icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
    },
    {
      title: '智能异常行为检测',
      description: '利用行为分析算法，自动识别可疑行为并触发预警，大幅提高安全响应效率。',
      icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
    },
    {
      title: '多层次安全防护',
      description: '结合视觉和声音传感器，提供全方位的环境感知和安全防护，确保全天候监控无死角。',
      icon: 'https://ext.same-assets.com/794583279/2067545548.svg'
    }
  ],
  actionRoute: '/domain/night-guardian/app',
  actionText: '开始使用夜间守护者'
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