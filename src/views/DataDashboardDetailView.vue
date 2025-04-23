/**
 * 文件名: DataDashboardDetailView.vue
 * 描述: 数据仪表盘详情视图
 * 在项目中的作用: 
 * - 展示详细的数据分析和可视化信息
 * - 集成各种数据图表和监控组件
 * - 提供无人机数据、视频监控和地理信息的综合视图
 * - 支持数据筛选和交互式数据探索
 */

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ThreeDronePathComponent from '@/components/dashboard/ThreeDronePathComponent.vue';
import DroneStatusComponent from '@/components/dashboard/DroneStatusComponent.vue';
// import MapComponent from '@/components/dashboard/MapComponent.vue';
import FixedMapComponent from '@/components/dashboard/FixedMapComponent.vue';
import DataChartsComponent from '@/components/dashboard/DataChartsComponent.vue';
import VideoMonitoringComponent from '@/components/dashboard/VideoMonitoringComponent.vue';
import GeoApiDashboard from '@/components/dashboard/GeoApiDashboard.vue';
import DroneMapTracker from '@/components/dashboard/DroneMapTracker.vue';

const loading = ref(true);
const activeTab = ref('overview');

// 模拟加载过程
onMounted(() => {
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});

// 切换标签页
const switchTab = (tab: string) => {
  activeTab.value = tab;
};
</script>

<template>
  <div class="data-dashboard-detail">
    <!-- 加载动画 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>加载数据大屏...</p>
    </div>
    
    <div v-else>
      <!-- 页面标题 -->
      <header class="dashboard-header">
        <div class="container">
          <h1>无人机监控数据大屏</h1>
          <p class="header-description">实时监控、数据分析与智能决策平台</p>
          
          <!-- 标签页导航 -->
          <div class="tab-navigation">
            <button 
              class="tab-button" 
              :class="{ active: activeTab === 'overview' }" 
              @click="switchTab('overview')"
            >
              概览
            </button>
            <button 
              class="tab-button" 
              :class="{ active: activeTab === 'video' }" 
              @click="switchTab('video')"
            >
              视频监控
            </button>
            <button 
              class="tab-button" 
              :class="{ active: activeTab === 'status' }" 
              @click="switchTab('status')"
            >
              状态监控
            </button>
            <button 
              class="tab-button" 
              :class="{ active: activeTab === 'analytics' }" 
              @click="switchTab('analytics')"
            >
              数据分析
            </button>
            <button 
              class="tab-button" 
              :class="{ active: activeTab === 'map' }" 
              @click="switchTab('map')"
            >
              地图追踪
            </button>
            <button 
              class="tab-button" 
              :class="{ active: activeTab === 'geo-api' }" 
              @click="switchTab('geo-api')"
            >
              地理服务
            </button>
          </div>
        </div>
      </header>
      
      <!-- 主内容区域 -->
      <main class="dashboard-content container">
        <!-- 概览标签页 -->
        <section v-if="activeTab === 'overview'" class="tab-content">
          <div class="overview-stats">
            <div class="stat-card">
              <div class="stat-icon stat-icon-blue">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l9 2-9-18-9 18 9-2z"></path></svg>
              </div>
              <div class="stat-content">
                <h3>5</h3>
                <p>在线无人机</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon stat-icon-green">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div class="stat-content">
                <h3>26</h3>
                <p>已完成任务</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon stat-icon-orange">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              </div>
              <div class="stat-content">
                <h3>3</h3>
                <p>告警事件</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon stat-icon-purple">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
              </div>
              <div class="stat-content">
                <h3>127</h3>
                <p>识别目标</p>
              </div>
            </div>
          </div>
          
          <div class="dashboard-grid">
            <!-- 3D路径可视化 -->
            <div class="dashboard-card drone-path-card">
              <h2 class="card-title">无人机飞行路径</h2>
              <ThreeDronePathComponent class="card-content" />
            </div>
            
            <!-- 视频监控组件 -->
            <div class="dashboard-card video-card">
              <h2 class="card-title">视频监控</h2>
              <VideoMonitoringComponent class="card-content" />
            </div>
            
            <!-- 地图组件，使用修复版本的组件 -->
            <div class="dashboard-card map-card">
              <h2 class="card-title">地理位置追踪</h2>
              <FixedMapComponent class="card-content" :showDroneInfo="true" />
            </div>
            
            <!-- 数据图表 -->
            <div class="dashboard-card charts-card">
              <h2 class="card-title">数据分析</h2>
              <DataChartsComponent class="card-content" />
            </div>
          </div>
        </section>
        
        <!-- 视频监控标签页 -->
        <section v-if="activeTab === 'video'" class="tab-content">
          <VideoMonitoringComponent style="height: 800px;" />
        </section>
        
        <!-- 状态监控标签页 -->
        <section v-if="activeTab === 'status'" class="tab-content">
          <DroneStatusComponent style="height: 800px;" />
        </section>
        
        <!-- 数据分析标签页 -->
        <section v-if="activeTab === 'analytics'" class="tab-content">
          <DataChartsComponent style="height: 800px;" />
        </section>
        
        <!-- 地图追踪标签页 -->
        <section v-if="activeTab === 'map'" class="tab-content">
          <div class="map-actions">
            <router-link to="/drone-task" class="view-drone-task-btn">
              查看正在执行的无人机任务
            </router-link>
          </div>
          <DroneMapTracker />
        </section>

        <!-- 地理服务标签页 -->
        <section v-if="activeTab === 'geo-api'" class="tab-content">
          <GeoApiDashboard style="height: 800px;" />
        </section>
      </main>
      
      <!-- 页脚 -->
      <footer class="dashboard-footer">
        <div class="container">
          <div class="footer-left">
            <p>© 2023 Skydio 无人机监控平台</p>
          </div>
          <div class="footer-right">
            <p>数据更新时间: {{ new Date().toLocaleString() }}</p>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.data-dashboard-detail {
  background-color: #0a1929;
  color: white;
  min-height: 100vh;
}

.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 加载动画 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #0a1929;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #132f4c;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 页面标题 */
.dashboard-header {
  padding: 20px 0;
  background-color: #132f4c;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.dashboard-header h1 {
  font-size: 2rem;
  margin-bottom: 5px;
  color: #fff;
}

.header-description {
  color: #90caf9;
  margin: 0 0 15px;
}

/* 标签页导航 */
.tab-navigation {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.tab-button {
  padding: 10px 15px;
  background-color: rgba(255, 255, 255, 0.07);
  border: none;
  border-radius: 5px;
  color: #e3f2fd;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background-color: rgba(255, 255, 255, 0.12);
}

.tab-button.active {
  background-color: #3b82f6;
  color: white;
}

/* 内容区域 */
.dashboard-content {
  padding: 30px 0;
}

.tab-content {
  margin-bottom: 40px;
}

/* 统计卡片区域 */
.overview-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: #132f4c;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-icon-blue {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.stat-icon-green {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.stat-icon-orange {
  background-color: rgba(249, 115, 22, 0.2);
  color: #f97316;
}

.stat-icon-purple {
  background-color: rgba(139, 92, 246, 0.2);
  color: #8b5cf6;
}

.stat-content h3 {
  font-size: 1.8rem;
  margin: 0;
  line-height: 1;
  color: white;
}

.stat-content p {
  font-size: 0.9rem;
  margin: 5px 0 0;
  color: #90caf9;
}

/* 卡片网格 */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 450px;
  gap: 20px;
}

.dashboard-card {
  background-color: #132f4c;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.drone-path-card, .charts-card {
  grid-column-start: 1;
}

.video-card, .map-card {
  grid-column-start: 2;
}

.card-title {
  padding: 15px 20px;
  margin: 0;
  font-size: 1.2rem;
  background-color: #1e3a5f;
  color: white;
}

.card-content {
  flex: 1;
  padding: 0;
  overflow: hidden;
}

/* 页脚 */
.dashboard-footer {
  padding: 20px 0;
  background-color: #132f4c;
  margin-top: 40px;
}

.dashboard-footer .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-left p, .footer-right p {
  margin: 0;
  font-size: 0.9rem;
  color: #90caf9;
}

/* 确保页面底部有足够空间 */
.dashboard-container {
  padding-bottom: 60px !important; /* 强制应用底部间距 */
  margin-bottom: 40px !important; /* 额外添加底部外边距 */
  min-height: calc(100vh - 120px); /* 确保最小高度可以填充视口 */
}

/* 修复可能会导致底部被遮挡的元素 */
.dashboard-wrapper {
  position: relative;
  z-index: 1; /* 确保内容不被其他固定元素遮挡 */
}

/* 处理最后一个卡片的底部边距 */
.dashboard-card:last-child,
.analysis-section:last-child,
.video-grid:last-child {
  margin-bottom: 60px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .overview-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: 450px;
  }
  
  .dashboard-card {
    min-height: 400px;
  }
  
  /* 在小屏幕上增加更多底部空间 */
  .dashboard-container {
    padding-bottom: 80px !important;
    margin-bottom: 60px !important;
  }
}

@media (max-width: 768px) {
  .overview-stats {
    grid-template-columns: 1fr;
  }
  
  .map-container-full {
    flex-direction: column;
  }
  
  .map-side-panel {
    width: 100%;
    height: auto;
    max-height: 300px;
  }
  
  .tab-navigation {
    flex-wrap: wrap;
  }
  
  .tab-button {
    flex: 1;
    min-width: 120px;
  }
  
  /* 在移动设备上进一步增加底部空间 */
  .dashboard-container {
    padding-bottom: 100px !important;
    margin-bottom: 80px !important;
  }
}

/* 添加按钮样式 */
.map-actions {
  margin-bottom: 15px;
  display: flex;
  justify-content: flex-end;
}

.view-drone-task-btn {
  background-color: #3b82f6;
  color: white;
  font-weight: 500;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 0.3s ease;
}

.view-drone-task-btn:hover {
  background-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(37, 99, 235, 0.2);
}
</style> 