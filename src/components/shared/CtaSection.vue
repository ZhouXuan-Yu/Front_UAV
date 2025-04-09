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
  <section class="cta-section">
    <div class="container">
      <h2 class="title">{{ title }}</h2>
      <p class="description">{{ description }}</p>
      <div class="actions">
        <button class="primary-button">{{ primaryBtnText }}</button>
        <button v-if="secondaryBtnText" class="secondary-button">{{ secondaryBtnText }}</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta-section {
  padding: 80px 0;
  background-color: #f7f9fc;
  text-align: center;
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
  color: #1a202c;
}

.description {
  font-size: 1.25rem;
  max-width: 800px;
  margin: 0 auto 40px;
  color: #4a5568;
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
}

.primary-button {
  background-color: #0066cc;
  color: white;
  border: none;
}

.primary-button:hover {
  background-color: #0052a3;
}

.secondary-button {
  background-color: transparent;
  color: #0066cc;
  border: 2px solid #0066cc;
}

.secondary-button:hover {
  background-color: rgba(0, 102, 204, 0.1);
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