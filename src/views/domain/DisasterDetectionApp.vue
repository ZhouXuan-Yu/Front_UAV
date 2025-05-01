<script setup lang="ts">
import { ref } from 'vue';
import BasePage from './templates/BasePage.vue';

const title = '灾害预警';
</script>

<template>
  <BasePage :title="title">
    <div class="space-y-8">
      <!-- 这里是灾害预警应用的特定内容区域 -->
      <section class="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
        <h2 class="text-2xl font-semibold mb-4">灾害预警功能</h2>
        <p class="text-gray-700">基于无人机航拍图像的森林火灾与洪水检测系统，实现对自然灾害的早期识别和监测。系统采用深度学习模型分析航拍图像，快速定位可能的灾害区域，为应急决策提供数据支持。</p>
      </section>

      <!-- 灾害检测功能内容区域 -->
      <div class="bg-white rounded-lg shadow-lg p-6 min-h-[500px]">
        <!-- 此处可添加具体实现 -->
      </div>
    </div>
  </BasePage>
</template> 