/**
 * 文件名: ProgressBar.vue
 * 描述: 进度条组件
 * 功能: 显示操作进度，支持动画和状态显示
 */

<template>
  <div class="progress-container" :class="{ 'completed': completed, 'failed': failed }">
    <div class="progress-info">
      <div class="progress-title">{{ title }}</div>
      <div class="progress-percentage">{{ progressText }}</div>
    </div>
    <div class="progress-bar-wrapper">
      <div 
        class="progress-bar" 
        :style="{ width: `${progress}%` }"
        :class="{ 'completed': completed, 'failed': failed }"
      ></div>
    </div>
    <div class="progress-message">{{ message || '处理中...' }}</div>
    
    <div class="progress-status">
      <!-- 进行中显示动态加载图标 -->
      <div v-if="!completed && !failed" class="loader"></div>
      
      <!-- 完成显示勾选图标 -->
      <div v-if="completed" class="status-icon success">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path>
        </svg>
      </div>
      
      <!-- 失败显示错误图标 -->
      <div v-if="failed" class="status-icon error">
        <svg viewBox="0 0 24 24" width="16" height="16">
          <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

// 定义组件属性
const props = defineProps({
  // 进度标题
  title: {
    type: String,
    default: '处理进度'
  },
  // 当前进度(0-100)
  progress: {
    type: Number,
    default: 0,
    validator: (val: number) => val >= 0 && val <= 100
  },
  // 提示消息
  message: {
    type: String,
    default: ''
  },
  // 是否已完成
  completed: {
    type: Boolean,
    default: false
  },
  // 是否失败
  failed: {
    type: Boolean,
    default: false
  }
});

// 计算当前进度文本
const progressText = computed(() => {
  if (props.completed) {
    return '100%';
  } else if (props.failed) {
    return '失败';
  } else {
    return `${Math.round(props.progress)}%`;
  }
});

// 监听完成状态
watch(() => props.completed, (newVal) => {
  if (newVal && props.progress < 100) {
    // 如果标记为完成但进度不到100%，触发事件
    console.log('任务已完成，但进度不足100%');
  }
});
</script>

<style scoped>
.progress-container {
  padding: 15px;
  border-radius: 8px;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.progress-container.completed {
  border-color: #52c41a;
  background-color: rgba(82, 196, 26, 0.05);
}

.progress-container.failed {
  border-color: #f5222d;
  background-color: rgba(245, 34, 45, 0.05);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-title {
  font-weight: 500;
  color: #333;
}

.progress-percentage {
  font-size: 14px;
  color: #606266;
}

.progress-bar-wrapper {
  height: 8px;
  background-color: #e9e9e9;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-bar {
  height: 100%;
  background-color: #1976d2;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-bar.completed {
  background-color: #52c41a;
}

.progress-bar.failed {
  background-color: #f5222d;
}

.progress-message {
  font-size: 13px;
  color: #606266;
  margin-top: 8px;
  min-height: 20px;
}

.progress-status {
  display: flex;
  justify-content: flex-end;
  margin-top: 5px;
}

.status-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.status-icon.success {
  background-color: #52c41a;
  color: white;
}

.status-icon.error {
  background-color: #f5222d;
  color: white;
}

/* 加载指示器动画 */
.loader {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #1976d2;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 