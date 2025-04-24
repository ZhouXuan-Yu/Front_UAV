<script setup lang="ts">
import { ref } from 'vue';
import FeatureHero from '@/components/feature/FeatureHero.vue';
import FeatureContent from '@/components/feature/FeatureContent.vue';
import CtaSection from '@/components/home/CtaSection.vue';

const features = ref([
  {
    title: '多策略路线规划',
    description: 'Easily plan complex flight paths with our intuitive interface. Set waypoints, adjust altitude, and define areas for detailed scanning with just a few clicks.',
    icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
  },
  {
    title: 'Obstacle Avoidance',
    description: 'Advanced AI-powered obstacle detection and avoidance ensures your drones complete their missions safely even in complex environments.',
    icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
  },
  {
    title: 'Terrain Following',
    description: 'Maintain consistent altitude above terrain regardless of landscape changes, perfect for inspections of varied topography.',
    icon: 'https://ext.same-assets.com/794583279/2067545548.svg'
  },
  {
    title: 'GIS Integration',
    description: 'Import and export route data in standard GIS formats for seamless integration with your existing mapping and planning systems.',
    icon: 'https://ext.same-assets.com/794583279/2838098675.svg'
  },
  {
    title: 'Mission Analytics',
    description: 'Analyze flight efficiency, coverage completeness, and route optimization opportunities with comprehensive post-flight analytics.',
    icon: 'https://ext.same-assets.com/794583279/2018733539.svg'
  },
  {
    title: 'Multi-Drone Coordination',
    description: 'Plan and execute coordinated operations with multiple drones for large-scale missions with increased efficiency and reduced time.',
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

    <section class="py-20 bg-gray-50">
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
    </section>

    <CtaSection />
  </div>
</template>
