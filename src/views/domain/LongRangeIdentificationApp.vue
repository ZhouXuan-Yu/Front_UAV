<script setup lang="ts">
import { ref } from 'vue';
import BasePage from './templates/BasePage.vue';

const title = '超远距离识别';
</script>

<template>
  <BasePage :title="title">
    <div class="space-y-8">
      <!-- 这里是超远距离识别应用的特定内容区域 -->
      <section class="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
        <h2 class="text-2xl font-semibold mb-4">超远距离识别功能</h2>
        <p class="text-gray-700">采用尖端光学技术和AI增强算法，可在几公里外精确识别和分类目标，为远程监控和安全应用提供无与伦比的能力，突破传统监控的距离限制。</p>
      </section>

      <!-- 远距离识别功能内容区域 -->
      <div class="bg-white rounded-lg shadow-lg p-6 min-h-[500px]">
        <!-- 此处可添加具体实现 -->
      </div>
    </div>
  </BasePage>
</template> 