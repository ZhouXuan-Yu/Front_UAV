<script setup lang="ts">
import { ref } from 'vue';
import BasePage from './templates/BasePage.vue';

const title = '夜间增强识别';
</script>

<template>
  <BasePage :title="title">
    <div class="space-y-8">
      <!-- 这里是夜间增强识别应用的特定内容区域 -->
      <section class="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
        <h2 class="text-2xl font-semibold mb-4">夜间增强识别功能</h2>
        <p class="text-gray-700">结合了先进的光学成像和人工智能算法，使无人机能够在低光环境下进行高精度的目标识别和跟踪，提高夜间监控的效果和精度。</p>
      </section>

      <!-- 夜间识别功能内容区域 -->
      <div class="bg-white rounded-lg shadow-lg p-6 min-h-[500px]">
        <!-- 此处可添加具体实现 -->
      </div>
    </div>
  </BasePage>
</template> 