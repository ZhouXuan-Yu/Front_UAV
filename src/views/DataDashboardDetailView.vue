<script setup lang="ts">
import { ref, onMounted } from 'vue';
import ThreeDronePathComponent from '@/components/dashboard/ThreeDronePathComponent.vue';
import DroneStatusComponent from '@/components/dashboard/DroneStatusComponent.vue';
import MapComponent from '@/components/dashboard/MapComponent.vue';
import DataChartsComponent from '@/components/dashboard/DataChartsComponent.vue';
import VideoMonitoringComponent from '@/components/dashboard/VideoMonitoringComponent.vue';
import GeoApiDashboard from '@/components/dashboard/GeoApiDashboard.vue';

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
            
            <!-- 地图组件 -->
            <div class="dashboard-card map-card">
              <h2 class="card-title">地理位置追踪</h2>
              <MapComponent class="card-content" />
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
          <div class="map-container-full">
            <div class="map-side-panel">
              <h3>任务信息</h3>
              <div class="info-list">
                <div class="info-item">
                  <div class="info-label">任务ID:</div>
                  <div class="info-value">DRN-2023-0542</div>
                </div>
                <div class="info-item">
                  <div class="info-label">任务类型:</div>
                  <div class="info-value">区域巡检</div>
                </div>
                <div class="info-item">
                  <div class="info-label">开始时间:</div>
                  <div class="info-value">2023-11-08 14:30</div>
                </div>
                <div class="info-item">
                  <div class="info-label">预计结束:</div>
                  <div class="info-value">2023-11-08 17:30</div>
                </div>
                <div class="info-item">
                  <div class="info-label">无人机编号:</div>
                  <div class="info-value">Drone-X10</div>
                </div>
                <div class="info-item">
                  <div class="info-label">电池状态:</div>
                  <div class="info-value">78% (约2小时15分)</div>
                </div>
                <div class="info-item">
                  <div class="info-label">信号强度:</div>
                  <div class="info-value">87% (良好)</div>
                </div>
              </div>
              
              <h3>检测目标</h3>
              <div class="target-list">
                <div class="target-item">
                  <div class="target-icon">👥</div>
                  <div class="target-info">
                    <div class="target-name">人群聚集点A</div>
                    <div class="target-details">约45人，活动正常</div>
                  </div>
                </div>
                <div class="target-item">
                  <div class="target-icon">🚗</div>
                  <div class="target-info">
                    <div class="target-name">交通监控点B</div>
                    <div class="target-details">车流量中等，无拥堵</div>
                  </div>
                </div>
                <div class="target-item highlight">
                  <div class="target-icon">⚠️</div>
                  <div class="target-info">
                    <div class="target-name">重点区域C</div>
                    <div class="target-details">检测到异常活动，建议关注</div>
                  </div>
                </div>
                <div class="target-item">
                  <div class="target-icon">🚙</div>
                  <div class="target-info">
                    <div class="target-name">车辆集中区D</div>
                    <div class="target-details">停放正常，车位充足</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="map-main-area">
              <MapComponent style="height: 100%;" />
            </div>
          </div>
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
  border: 5px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #4fc3f7;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 页面标题 */
.dashboard-header {
  padding: 40px 0 20px;
  background-color: #132f4c;
  border-bottom: 1px solid #1e3a5f;
  margin-bottom: 30px;
}

.dashboard-header h1 {
  font-size: 2.5rem;
  margin: 0 0 10px;
  color: #4fc3f7;
  text-align: center;
}

.header-description {
  font-size: 1.2rem;
  text-align: center;
  color: #90caf9;
  margin: 0 0 30px;
}

/* 标签页导航 */
.tab-navigation {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tab-button {
  padding: 10px 20px;
  background-color: #1e3a5f;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-size: 1rem;
}

.tab-button:hover {
  background-color: #2c5282;
}

.tab-button.active {
  background-color: #1976d2;
  font-weight: bold;
}

/* 概览统计卡片 */
.overview-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: #132f4c;
  border-radius: 10px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon svg {
  width: 30px;
  height: 30px;
}

.stat-icon-blue {
  background-color: rgba(33, 150, 243, 0.2);
  color: #2196F3;
}

.stat-icon-green {
  background-color: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
}

.stat-icon-orange {
  background-color: rgba(255, 152, 0, 0.2);
  color: #FF9800;
}

.stat-icon-purple {
  background-color: rgba(156, 39, 176, 0.2);
  color: #9C27B0;
}

.stat-content h3 {
  font-size: 1.8rem;
  margin: 0 0 5px;
  font-weight: bold;
}

.stat-content p {
  margin: 0;
  color: #90caf9;
  font-size: 0.9rem;
}

/* 主网格布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 450px);
  gap: 20px;
  margin-bottom: 30px;
}

.dashboard-card {
  background-color: #132f4c;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-title {
  margin: 0;
  padding: 15px 20px;
  font-size: 1.2rem;
  color: #4fc3f7;
  background-color: #0a1929;
  border-bottom: 1px solid #1e3a5f;
}

.card-content {
  flex: 1;
  overflow: hidden;
}

/* 地图追踪标签页 */
.map-container-full {
  display: flex;
  height: 800px;
  gap: 20px;
}

.map-side-panel {
  width: 300px;
  background-color: #132f4c;
  border-radius: 10px;
  padding: 20px;
  overflow-y: auto;
}

.map-side-panel h3 {
  color: #4fc3f7;
  margin: 0 0 15px;
  font-size: 1.2rem;
  border-bottom: 1px solid #1e3a5f;
  padding-bottom: 10px;
}

.map-main-area {
  flex: 1;
  border-radius: 10px;
  overflow: hidden;
}

.info-list {
  margin-bottom: 25px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.info-label {
  width: 100px;
  color: #90caf9;
  font-weight: bold;
}

.info-value {
  flex: 1;
}

.target-list {
  margin-bottom: 25px;
}

.target-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 10px;
  background-color: rgba(255, 255, 255, 0.05);
}

.target-item.highlight {
  background-color: rgba(244, 67, 54, 0.15);
}

.target-icon {
  font-size: 1.5rem;
  margin-right: 15px;
  width: 30px;
  text-align: center;
}

.target-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.target-details {
  font-size: 0.9rem;
  color: #90caf9;
}

/* 页脚 */
.dashboard-footer {
  background-color: #132f4c;
  padding: 20px 0;
  border-top: 1px solid #1e3a5f;
  margin-top: 30px;
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
}
</style> 