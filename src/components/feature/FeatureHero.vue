/**
 * 文件名: FeatureHero.vue
 * 描述: 功能特性页面的英雄区组件
 * 在项目中的作用: 
 * - 展示各功能页面的顶部横幅区域
 * - 以视觉冲击力强的方式呈现功能标题和简介
 * - 提供背景图片和渐变效果增强视觉体验
 * - 作为功能页面的视觉焦点和入口
 */

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  description: string;
  image: string;
}>();
</script>

<template>
  <section class="relative py-32 overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0 z-0">
      <img
        :src="image"
        :alt="title"
        class="object-cover w-full h-full"
      >
      <!-- Overlay -->
      <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 container mx-auto px-4">
      <div class="max-w-2xl text-white">
        <h1
          class="text-4xl md:text-5xl font-bold mb-4"
          data-aos="fade-up"
        >
          {{ title }}
        </h1>

        <h2
          class="text-2xl md:text-3xl font-medium mb-6"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          {{ subtitle }}
        </h2>

        <p
          class="text-lg text-white/80 mb-8"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          {{ description }}
        </p>

        <div
          data-aos="fade-up"
          data-aos-delay="300"
        >
          <router-link to="#" class="btn btn-primary">
            Learn more
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>
