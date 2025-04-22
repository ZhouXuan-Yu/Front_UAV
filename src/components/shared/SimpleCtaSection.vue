/**
 * 文件名: SimpleCtaSection.vue
 * 描述: 简化版行动号召(Call-to-Action)组件
 * 在项目中的作用: 
 * - 提供轻量级的用户行动引导区域
 * - 支持自定义背景色和按钮样式
 * - 比CtaSection更灵活，适用于不同页面位置
 * - 增强用户体验和页面转化效果
 */

<script setup lang="ts">
interface CtaProps {
  title?: string;
  description?: string;
  primaryBtnText?: string;
  secondaryBtnText?: string;
  primaryBtnLink?: string;
  secondaryBtnLink?: string;
  bgColor?: string;
}

const props = withDefaults(defineProps<CtaProps>(), {
  title: "立即开始使用 Skydio 解决方案",
  description: "体验 Skydio 无人机如何提升您的业务效率和安全性。",
  primaryBtnText: "联系我们",
  secondaryBtnText: "查看解决方案",
  primaryBtnLink: "/contact",
  secondaryBtnLink: "/solutions",
  bgColor: "bg-skydio-dark"
});
</script>

<template>
  <section class="cta-section" :class="bgColor">
    <div class="container">
      <h2 class="title">{{ title }}</h2>
      <p class="description">{{ description }}</p>
      <div class="actions">
        <router-link :to="primaryBtnLink" class="primary-button">
          {{ primaryBtnText }}
        </router-link>
        <router-link 
          v-if="secondaryBtnText" 
          :to="secondaryBtnLink" 
          class="secondary-button"
        >
          {{ secondaryBtnText }}
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta-section {
  padding: 80px 0;
  background-color: #0f172a; /* 深蓝色背景 */
  text-align: center;
  color: white;
}

.bg-skydio-dark {
  background-color: #0f172a;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 20px;
}

.description {
  font-size: 1.25rem;
  max-width: 800px;
  margin: 0 auto 40px;
  opacity: 0.8;
  line-height: 1.6;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.primary-button, .secondary-button {
  padding: 12px 30px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
  text-decoration: none;
}

.primary-button {
  background-color: #3b82f6; /* Skydio蓝色 */
  color: white;
  border: none;
}

.primary-button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
}

.secondary-button {
  background-color: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.7);
}

.secondary-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .description {
    font-size: 1.1rem;
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
  
  .primary-button, .secondary-button {
    width: 100%;
    max-width: 300px;
  }
}
</style> 