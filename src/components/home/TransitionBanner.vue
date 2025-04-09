<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  bgImage?: string;
  overlay?: boolean;
}>();
</script>

<template>
  <section 
    class="transition-banner" 
    :class="{ 'overlay-mode': overlay }"
    :style="{ backgroundImage: bgImage ? `url(${bgImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }"
  >
    <div class="container">
      <div class="content">
        <h2 class="title">{{ title }}</h2>
        <p class="subtitle">{{ subtitle }}</p>
        
        <!-- 特性列表 -->
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="feature-title">全天候可靠性</h3>
            <p class="feature-desc">无论白天黑夜，无论恶劣天气，始终保持稳定飞行</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="feature-title">高性能电池</h3>
            <p class="feature-desc">长达35分钟飞行时间，支持快速充电，满足连续任务需求</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="feature-title">数据安全保障</h3>
            <p class="feature-desc">端到端加密，离线操作模式，保障敏感数据安全</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="feature-title">智能避障</h3>
            <p class="feature-desc">360°全方位感知障碍物，自动规划最优飞行路径</p>
          </div>
        </div>
        
        <div class="actions">
          <button class="action-btn primary">了解更多</button>
          <button class="action-btn secondary">查看产品</button>
        </div>
      </div>
      
      <div class="decorative-elements">
        <div class="icon-wrapper top-left">
          <i class="icon-drone"></i>
        </div>
        <div class="icon-wrapper bottom-right">
          <i class="icon-camera"></i>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.transition-banner {
  position: relative;
  width: 100%;
  padding: 160px 0;  /* 增加了高度 */
  background-color: transparent; /* 确保背景透明以显示背景图 */
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  color: #2d3748;
  overflow: hidden;
  text-align: center;
  box-shadow: none; /* 移除阴影避免产生蒙图感 */
}

.transition-banner.overlay-mode {
  padding: 120px 0;  /* 增加了高度 */
  background: transparent;
  box-shadow: none;
}

.transition-banner::before,
.transition-banner::after {
  content: none !important; /* 确保禁用任何可能的伪元素 */
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin: 40px 0;
  max-width: 1000px;
  margin-left: auto;
  margin-right: auto;
}

.feature-item {
  background-color: rgba(255, 255, 255, 0.9); /* 增加不透明度 */
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  backdrop-filter: blur(5px); /* 添加轻微模糊效果使文字更易读 */
}

.feature-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.08);
}

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #3182ce, #4299e1);
  border-radius: 50%;
  color: white;
}

.feature-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #2d3748;
}

.feature-desc {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.5;
}

.container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  z-index: 2;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
  animation: fadeIn 0.8s ease-out;
}

.title {
  font-size: 48px;
  font-weight: 700;
  margin-bottom: 24px;
  color: #2d3748; /* 保持黑色文字 */
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.5); /* 加强文字阴影提高可读性 */
  position: relative;
  display: inline-block;
}

.title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #3182ce, #4299e1);
  border-radius: 2px;
}

.overlay-mode .title {
  font-size: 64px;
  text-shadow: 0 3px 6px rgba(255, 255, 255, 0.5); /* 加强文字阴影 */
  color: #1a202c; /* 更深的黑色 */
}

.subtitle {
  font-size: 22px;
  line-height: 1.6;
  margin-bottom: 40px;
  max-width: 700px;
  color: #2d3748; /* 保持黑色文字 */
  text-shadow: 0 1px 3px rgba(255, 255, 255, 0.5); /* 加强文字阴影 */
}

.actions {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

.action-btn {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3182ce, #4299e1);
  color: white;
  box-shadow: 0 4px 10px rgba(49, 130, 206, 0.4);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(49, 130, 206, 0.5);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #3182ce;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.action-btn.secondary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.15);
  background: white;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .title {
    font-size: 42px;
  }
  
  .overlay-mode .title {
    font-size: 54px;
  }
}

@media (max-width: 640px) {
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .title {
    font-size: 36px;
  }
  
  .overlay-mode .title {
    font-size: 42px;
  }
  
  .transition-banner,
  .transition-banner.overlay-mode {
    padding: 80px 0;
  }
}
</style> 