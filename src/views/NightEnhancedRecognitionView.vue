/**
 * 文件名: NightEnhancedRecognitionView.vue
 * 描述: 夜间增强识别页面
 * 在项目中的作用: 
 * - 展示夜间增强识别技术的功能和特点
 * - 提供相关技术介绍和应用场景
 * - 展示夜间增强识别的示例和效果
 */

<script setup lang="ts">
import FeatureView from './FeatureView.vue';
</script>

<template>
  <FeatureView />
</template>

<style scoped>
.night-enhanced-recognition-view {
  width: 100%;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.workflow-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 2rem;
}

@media (min-width: 768px) {
  .workflow-container {
    flex-direction: row;
    align-items: center;
  }
  
  .workflow-image {
    flex: 1;
  }
  
  .workflow-content {
    flex: 1;
  }
}

.workflow-image img {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.workflow-content h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.workflow-content p {
  margin-bottom: 1.5rem;
  color: #555;
  line-height: 1.6;
}

.case-studies-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.comparison-container {
  display: flex;
  flex-direction: column;
  gap: 3rem;
  margin-top: 2rem;
}

.comparison-item {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

@media (min-width: 768px) {
  .comparison-item {
    flex-direction: row;
  }
  
  .comparison-before,
  .comparison-after {
    flex: 1;
  }
}

.comparison-before,
.comparison-after {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.comparison-before h4,
.comparison-after h4 {
  padding: 1rem;
  margin: 0;
  background-color: #f5f5f5;
  text-align: center;
  font-weight: 600;
}

.comparison-before img,
.comparison-after img {
  width: 100%;
  display: block;
}

.contact-container {
  max-width: 800px;
  margin: 2rem auto;
  text-align: center;
}

.contact-container p {
  margin-bottom: 2rem;
  font-size: 1.1rem;
  color: #555;
  line-height: 1.6;
}

.primary-button {
  background-color: #3B82F6;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-button:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
}
</style> 