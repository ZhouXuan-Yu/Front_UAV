/**
 * 文件名: DataDashboardView.vue
 * 描述: 数据仪表盘视图
 * 在项目中的作用: 
 * - 作为数据仪表盘功能的入口页面
 * - 展示数据仪表盘的概览信息
 * - 提供链接到详细数据分析界面
 */

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import FeatureView from './FeatureView.vue';

const router = useRouter();

// 处理Learn more按钮点击事件
const handleLearnMoreClick = () => {
  router.push('/data-dashboard-detail');
};

// 在组件挂载后覆盖Learn more按钮的默认行为
onMounted(() => {
  // 等待页面渲染完成
  setTimeout(() => {
    // 查找"Learn more"按钮
    const learnMoreBtn = document.querySelector('.btn.btn-primary');
    if (learnMoreBtn) {
      // 覆盖点击事件
      learnMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        router.push('/data-dashboard-detail');
      });
    }
  }, 500);
});
</script>

<template>
  <div>
    <FeatureView />
  </div>
</template>
