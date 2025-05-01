<script setup lang="ts">
import { ref } from 'vue';
import BasePage from './templates/BasePage.vue';

const title = '车辆监控与报警';
</script>

<template>
  <BasePage :title="title">
    <div class="space-y-8">
      <!-- 这里是车辆监控应用的特定内容区域 -->
      <section class="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
        <h2 class="text-2xl font-semibold mb-4">车辆监控与报警功能</h2>
        <p class="text-gray-700">基于无人机图像的智能车辆监控系统，通过深度学习模型识别车牌信息，并结合多传感器数据实现精准定位和报警。系统支持实时监控、历史回放和报警联动，为交通管理提供智能化解决方案。</p>
      </section>

      <!-- 车辆监控功能内容区域 -->
      <div class="bg-white rounded-lg shadow-lg p-6 min-h-[500px]">
        <!-- 此处可添加具体实现 -->
      </div>
    </div>
  </BasePage>
</template> 