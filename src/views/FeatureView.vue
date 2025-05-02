/**
 * 文件名: FeatureView.vue
 * 描述: 功能特性展示视图组件
 * 在项目中的作用: 
 * - 根据路由动态展示不同功能特性的详情
 * - 提供可复用的特性页面模板
 * - 展示产品各个功能模块的详细信息
 * - 管理特性数据和视图展示逻辑
 */

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import FeatureHero from '@/components/feature/FeatureHero.vue';
import FeatureContent from '@/components/feature/FeatureContent.vue';
import CtaSection from '@/components/home/CtaSection.vue';

const route = useRoute();

// Feature data based on route
const featureData = computed(() => {
  const routeName = route.name as string;

  const featureInfo: Record<string, {
    title: string;
    subtitle: string;
    description: string;
    image: string;
    features: Array<{ title: string; description: string; icon?: string; }>;
  }> = {
    'data-dashboard': {
      title: '智航监控',
      subtitle: '',
      description: '基于Vue3和TypeScript开发的无人机数据监控平台，集成高德地图API实现地理信息处理，通过Vue 3组合式API打造双模式视图，使用ECharts呈现实时监测数据。系统支持无人机状态监控、飞行路径规划和目标识别分析，为无人机巡检、安全监控和数据采集提供可视化支持。',
      image: new URL('@/assets/function/screen.png', import.meta.url).href,
      features: [
        {
          title: '智能地理服务',
          description: '集成了多项地理信息服务功能，包括POI搜索定位、行政区域和实时天气监测。通过高精度坐标转换和边界处理算法，确保地理数据的准确性；同时提供地理编码与逆地理编码服务，支持地址与坐标的双向转换，为无人机任务提供全方位的地理信息支持和环境感知能力。',
          icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
        },
        {
          title: '无人机地图追踪',
          description: '基于Vue 3组合式API打造双模式视图，集成地图组件实现无人机位置可视化与轨迹追踪。通过定时器更新位置、面板组件化设计及条件渲染，配合动态电量和信号强度显示，提供多无人机状态监控与任务管理核心能力，助力运营人员实时掌握无人机状态，提升监控效率与安全性。',
          icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
        },
        {
          title: '数据可视化',
          description: '使用ECharts实现实时数据的可视化展示，包括无人机状态、飞行轨迹、目标识别结果等。系统通过数据缓存和异步更新机制，确保数据展示的流畅性和实时性，为操作者提供全面、直观的监控信息。',
          icon: 'https://ext.same-assets.com/794583279/2067545548.svg'
        }
      ]
    },

  };

  // Return the data for the current route, or a default if not found
  return featureInfo[routeName] || {
    title: 'Feature',
    subtitle: 'Advanced drone technology',
    description: 'This feature provides cutting-edge capabilities for your drone operations.',
    image: 'https://ext.same-assets.com/913537297/1124492884.jpeg',
    features: []
  };
});
</script>

<template>
  <div>
    <FeatureHero
      :title="featureData.title"
      :subtitle="featureData.subtitle"
      :description="featureData.description"
      :image="featureData.image"
    />

    <FeatureContent :features="featureData.features" />

    <CtaSection />
  </div>
</template>
