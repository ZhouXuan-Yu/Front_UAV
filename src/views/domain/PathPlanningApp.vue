<script setup lang="ts">
import { ref } from 'vue';
import BasePage from './templates/BasePage.vue';

const title = '智程导航';
</script>

<template>
  <BasePage :title="title">
    <div class="space-y-8">
      <!-- 这里是智程导航应用的特定内容区域 -->
      <section class="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
        <h2 class="text-2xl font-semibold mb-4">智程导航功能</h2>
        <p class="text-gray-700">基于高德地图，利用本地大模型解析用户自然语言输入，精准识别起点、终点及出行需求，融合多种算法策略实时规划最优路线，提供详细导航指引与路况预警，高效满足用户出行规划需求。</p>
      </section>

      <!-- 导航功能内容区域 -->
      <div class="bg-white rounded-lg shadow-lg p-6 min-h-[500px]">
        <!-- 此处可添加具体实现 -->
      </div>
    </div>
  </BasePage>
</template> 