<script setup lang="ts">
import { ref } from 'vue';
import BaseFunctionPage from './BaseFunctionPage.vue';

const pageData = {
  title: '智程导航',
  subtitle: 'LLM驱动，融合高德地图，智能解析并实时规划最优出行路径',
  description: '集成高德地图，利用本地大模型解析用户自然语言输入，精准识别起点、终点及出行需求，融合多种算法策略实时规划最优路线，提供详细导航指引与路况预警，高效满足用户出行规划需求。',
  image: 'https://media.istockphoto.com/id/1389490813/video/aerial-time-lapse-hyperlapse-sunrise-over-big-city-morning-cityscape-drone-flight-over.jpg?s=640x640&k=20&c=iMWoT6ZIoXW36ciFCkG3nE9akQCyMnzizpt_lGvr2vM=',
  features: [
    {
      title: '多策略路线规划',
      description: '基于高德地图，实现最快、最经济等多种路线规划策略，系统会同时计算不同方案并进行智能比较，考虑时间、距离、过路费等多维度因素，为用户推荐最合适的出行路线。',
      icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
    },
    {
      title: '实时路况可视化',
      description: '集成路况图层和卫星图像，实时监控和展示道路拥堵情况，通过不同颜色直观展示道路畅通、缓行和拥堵状态，帮助用户及时调整行程计划，避开拥堵路段。',
      icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
    },
    {
      title: '自然语言交互查询',
      description: '基于大模型的自然语言处理技术，支持用户使用日常语言进行路线查询和规划，系统能够智能理解出发地、目的地和途经点等信息，实现类似"帮我规划从北京到上海的路线"这样的自然交互体验。',
      icon: 'https://ext.same-assets.com/794583279/2067545548.svg'
    }
  ],
  actionRoute: '/domain/path-planning/app',
  actionText: '开始使用智程导航'
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