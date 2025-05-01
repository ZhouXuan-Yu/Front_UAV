<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import CtaSection from '@/components/home/CtaSection.vue';

// 定义组件属性
defineProps<{
  title: string;
}>();

// 获取路由器实例
const router = useRouter();

// 返回上一页方法
const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="bg-white min-h-screen">
    <!-- 顶部标题 -->
    <header class="bg-gray-800 text-white shadow-md">
      <div class="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold">{{ title }}</h1>
        <div class="flex items-center space-x-4">
          <button 
            @click="goBack" 
            class="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition flex items-center"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            返回
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="container mx-auto px-4 py-8">
      <!-- 插槽用于各功能页面的自定义内容 -->
      <slot></slot>
    </main>

    <!-- 底部组件 -->
    <CtaSection />
  </div>
</template>

<style scoped>
/* 基础样式 */
</style> 