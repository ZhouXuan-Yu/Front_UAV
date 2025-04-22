/**
 * 文件名: App.vue
 * 描述: 应用程序的根组件，是整个应用的入口视图
 * 在项目中的作用: 
 * - 定义了应用程序的主布局结构
 * - 包含公共导航和页脚
 * - 集成了路由视图，使应用可以进行页面切换
 * - 管理全局的CSS样式和主题
 */

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import TheHeader from './components/layout/TheHeader.vue';
import TheFooter from './components/layout/TheFooter.vue';

const scrolled = ref(false);

const handleScroll = () => {
  scrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="app">
    <TheHeader :scrolled="scrolled" />

    <main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <TheFooter />
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
