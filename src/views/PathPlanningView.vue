<script setup lang="ts">
import { ref } from 'vue';
import FeatureHero from '@/components/feature/FeatureHero.vue';
import FeatureContent from '@/components/feature/FeatureContent.vue';
import CtaSection from '@/components/home/CtaSection.vue';

const features = ref([
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

]);
</script>

<template>
  <div>
    <FeatureHero
      title="智程导航"
      subtitle="LLM驱动，融合高德地图，智能解析并实时规划最优出行路径"
      description="集成高德地图，利用本地大模型解析用户自然语言输入，精准识别起点、终点及出行需求，
                   融合多种算法策略实时规划最优路线，提供详细导航指引与路况预警，高效满足用户出行规划需求。"
      image="https://media.istockphoto.com/id/1389490813/video/aerial-time-lapse-hyperlapse-sunrise-over-big-city-morning-cityscape-drone-flight-over.jpg?s=640x640&k=20&c=iMWoT6ZIoXW36ciFCkG3nE9akQCyMnzizpt_lGvr2vM="
    />

    <FeatureContent :features="features" />

    <!-- 留作后续进行扩展，进行演示视频可以用用下面组件-->


    <!-- <section class="py-20 bg-gray-50">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center gap-12">
          <div class="md:w-1/2" data-aos="fade-right">
            <img
              src="https://images.stockcake.com/public/2/9/1/291b2bb6-7239-4fbc-924c-e844fbae2c23_large/drone-aerial-surveillance-stockcake.jpg"
              alt="Drone in action"
              class="w-full h-auto rounded-lg shadow-lg"
            >
          </div>

          <div class="md:w-1/2" data-aos="fade-left">
            <h2 class="text-3xl font-bold mb-6">Take control of your flight operations</h2>

            <p class="text-gray-600 mb-6">
              From simple linear paths to complex 3D missions, our Path Planning system gives you complete control. Designed for professionals who need reliable, repeatable results in any environment.
            </p>

            <ul class="space-y-4 mb-8">
              <li class="flex items-start">
                <svg class="w-6 h-6 text-skydio-blue mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Save time with automated planning tools</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-skydio-blue mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Reduce risk with intelligent obstacle avoidance</span>
              </li>
              <li class="flex items-start">
                <svg class="w-6 h-6 text-skydio-blue mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span>Increase data quality with precise flight control</span>
              </li>
            </ul>

            <router-link to="#" class="btn btn-primary">
              Request a demo
            </router-link>
          </div>
        </div>
      </div>
    </section> -->

    <CtaSection />
  </div>
</template>
