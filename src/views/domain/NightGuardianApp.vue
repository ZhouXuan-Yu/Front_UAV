<script setup lang="ts">
import { ref } from 'vue';
import BasePage from './templates/BasePage.vue';

const title = '夜间守护者';
</script>

<template>
  <BasePage :title="title">
    <div class="space-y-8">
      <!-- 这里是夜间守护者应用的特定内容区域 -->
      <section class="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm">
        <h2 class="text-2xl font-semibold mb-4">夜间守护者功能</h2>
        <p class="text-gray-700">夜间守护者系统是专为夜间安全监控设计的综合解决方案，集成了夜视技术、热成像和AI智能分析，提供全方位的夜间安全防护能力。</p>
      </section>

      <!-- 夜间守护功能内容区域 -->
      <div class="bg-white rounded-lg shadow-lg p-6 min-h-[500px]">
        <!-- 此处可添加具体实现 -->
      </div>
    </div>
  </BasePage>
</template> 