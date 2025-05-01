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
import { ref, onMounted, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { QuestionFilled, Filter, Refresh, Download } from '@element-plus/icons-vue';
// import ThreeDronePathComponent from '@/components/dashboard/ThreeDronePathComponent.vue';
import DroneStatusComponent from '@/components/dashboard/DroneStatusComponent.vue';
// import MapComponent from '@/components/dashboard/MapComponent.vue';
import FixedMapComponent from '@/components/dashboard/FixedMapComponent.vue';
import DataChartsComponent from '@/components/dashboard/DataChartsComponent.vue';
import VideoMonitoringComponent from '@/components/dashboard/VideoMonitoringComponent.vue';
import GeoApiDashboard from '@/components/dashboard/GeoApiDashboard.vue';
import DroneMapTracker from '@/components/dashboard/DroneMapTracker.vue';
// 新增导入高级分析组件
import DataDrilldownComponent from '@/components/dashboard/DataDrilldownComponent.vue';
import DataComparisonComponent from '@/components/dashboard/DataComparisonComponent.vue';
import InteractiveFilteringComponent from '@/components/dashboard/InteractiveFilteringComponent.vue';
// import ThreeDVisualizationComponent from '@/components/visualization/ThreeDVisualizationComponent.vue';
import AnomalyDetectionComponent from '@/components/dashboard/AnomalyDetectionComponent.vue';
// import CustomDashboardComponent from '@/components/dashboard/CustomDashboardComponent.vue';

// 导入AI服务
import { useVisualizationStore } from '@/store/visualization';

const loading = ref(true);
const activeTab = ref('overview');
// 添加数据分析日期选择器变量
const analyticsDate = ref(new Date());

// 高级分析相关状态
const analysisMode = ref('charts'); // 'charts', 'drilldown', 'comparison', 'ai'
const drilldownType = ref('person'); // 'person', 'vehicle'
const drilldownRegion = ref('central');
const comparisonMode = ref('time'); // 'time', 'region', 'custom'
// const visualizationType = ref('heatmap'); // 'heatmap', 'surface', 'timeAnimation'

// 筛选面板状态
const showFilterPanel = ref(false);

// 筛选配置
const filterConfig = reactive({
  dateRange: [
    new Date(new Date().setDate(new Date().getDate() - 7)),
    new Date()
  ],
  regions: ['central'],
  dataTypes: ['person', 'vehicle', 'risk'],
  deviceStatus: true
});

// 区域选项
const regionOptions = [
  { value: 'central', label: '中心区域' },
  { value: 'north', label: '北部区域' },
  { value: 'south', label: '南部区域' },
  { value: 'east', label: '东部区域' },
  { value: 'west', label: '西部区域' }
];

// 数据类型选项
const dataTypeOptions = [
  { value: 'person', label: '人员监测' },
  { value: 'vehicle', label: '车辆监测' },
  { value: 'risk', label: '风险事件' },
  { value: 'drone', label: '无人机状态' }
];

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

// 切换分析模式
const switchAnalysisMode = (mode: string) => {
  analysisMode.value = mode;
};

// 导出钻取数据
const handleExportDrilldownData = (data: any) => {
  console.log('导出钻取数据', data);
  // 在实际应用中，这里可以调用下载或保存逻辑
};

// 显示提示消息
const showTip = (message: string) => {
  ElMessage({
    message,
    type: 'info'
  });
};

// 应用筛选条件
const applyFilters = () => {
  showFilterPanel.value = false;
  
  ElMessage({
    message: '筛选条件已应用',
    type: 'success'
  });
  
  // 在实际项目中，这里会将筛选条件传递给各个组件或调用API重新获取数据
};

// 重置筛选条件
const resetFilters = () => {
  filterConfig.dateRange = [
    new Date(new Date().setDate(new Date().getDate() - 7)),
    new Date()
  ];
  filterConfig.regions = ['central'];
  filterConfig.dataTypes = ['person', 'vehicle', 'risk'];
  filterConfig.deviceStatus = true;
  
  ElMessage({
    message: '筛选条件已重置',
    type: 'info'
  });
};

// 刷新数据
const refreshData = () => {
  ElMessage({
    message: '数据已更新',
    type: 'success'
  });
  
  // 实际项目中刷新数据的逻辑
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
          
          <div class="overview-dashboard">
          <div class="dashboard-grid">
              <!-- 3D路径可视化 - 已移除 -->
              <!-- <div class="dashboard-card drone-path-card">
              <h2 class="card-title">无人机飞行路径</h2>
              <ThreeDronePathComponent class="card-content" />
              </div> -->
              
              <!-- 添加替代卡片 -->
              <div class="dashboard-card drone-status-card">
                <h2 class="card-title">无人机状态一览</h2>
                <DroneStatusComponent class="card-content" />
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
              <DataChartsComponent class="card-content" chartType="all" />
            </div>
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
          <div class="analytics-header">
            <h2>数据分析平台</h2>
            <p class="analytics-description">
              通过高级数据分析技术，为运营提供实时决策支持和趋势洞察
            </p>
            <div class="analytics-actions">
              <el-button-group>
                <el-button 
                  :type="analysisMode === 'charts' ? 'primary' : ''" 
                  size="small" 
                  @click="switchAnalysisMode('charts')"
                >
                  基础图表
                </el-button>
                <el-button 
                  :type="analysisMode === 'drilldown' ? 'primary' : ''" 
                  size="small" 
                  @click="switchAnalysisMode('drilldown')"
                >
                  数据钻取
                </el-button>
                <el-button 
                  :type="analysisMode === 'comparison' ? 'primary' : ''" 
                  size="small" 
                  @click="switchAnalysisMode('comparison')"
                >
                  数据对比
                </el-button>
                <el-button 
                  :type="analysisMode === 'ai' ? 'primary' : ''" 
                  size="small" 
                  @click="switchAnalysisMode('ai')"
                >
                  异常检测
                </el-button>
              </el-button-group>
              
              <div class="action-buttons">
                <el-button size="small" @click="showFilterPanel = !showFilterPanel">
                  <el-icon><Filter /></el-icon>
                  筛选
                </el-button>
                <el-button size="small" @click="refreshData">
                  <el-icon><Refresh /></el-icon>
                  刷新
                </el-button>
                <el-button size="small">
                  <el-icon><Download /></el-icon>
                  导出
                </el-button>
              </div>
              
              <el-date-picker
                v-model="analyticsDate"
                type="date"
                placeholder="选择日期"
                size="small"
                style="width: 160px;"
              ></el-date-picker>
            </div>
          </div>
          
          <!-- 筛选面板 -->
          <div v-if="showFilterPanel" class="filter-panel">
            <div class="filter-panel-header">
              <h3>数据筛选</h3>
              <el-button type="text" @click="showFilterPanel = false">关闭</el-button>
            </div>
            
            <div class="filter-panel-content">
              <div class="filter-row">
                <div class="filter-group">
                  <span class="filter-label">时间范围</span>
                  <el-date-picker
                    v-model="filterConfig.dateRange"
                    type="daterange"
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    size="default"
                    style="width: 100%"
                  />
                </div>
                
                <div class="filter-group">
                  <span class="filter-label">监测区域</span>
                  <el-select 
                    v-model="filterConfig.regions" 
                    multiple 
                    placeholder="选择区域" 
                    size="default" 
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in regionOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
                
                <div class="filter-group">
                  <span class="filter-label">数据类型</span>
                  <el-select 
                    v-model="filterConfig.dataTypes" 
                    multiple 
                    placeholder="选择数据类型" 
                    size="default" 
                    style="width: 100%"
                  >
                    <el-option
                      v-for="item in dataTypeOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
              </div>
              
              <div class="filter-group">
                <el-checkbox v-model="filterConfig.deviceStatus">包含设备状态数据</el-checkbox>
              </div>
              
              <div class="filter-actions">
                <el-button type="primary" @click="applyFilters">应用筛选</el-button>
                <el-button @click="resetFilters">重置</el-button>
              </div>
            </div>
          </div>
          
          <!-- 根据分析模式显示不同的组件 -->
          <template v-if="analysisMode === 'charts'">
            <!-- 重新排列顺序：人物分析和项目分析放在前面，无人机状态放在后面 -->
            <div class="analytics-compact-layout">
              <!-- 人物分析区域 -->
              <div class="analytics-section">
                <h3 class="section-title">人物分析</h3>
                <div class="analytics-card-grid">
                  <div class="analytics-card">
                    <h4>人物识别分布</h4>
                    <DataChartsComponent class="chart-container" chartType="person" />
                  </div>
                  <div class="analytics-card">
                    <h4>人物活动趋势</h4>
                    <DataChartsComponent class="chart-container" chartType="personActivity" />
                  </div>
                </div>
              </div>
              
              <!-- 项目分析区域 -->
              <div class="analytics-section">
                <h3 class="section-title">项目分析</h3>
                <div class="analytics-card-grid">
                  <div class="analytics-card">
                    <h4>任务执行情况</h4>
                    <DataChartsComponent class="chart-container" chartType="task" />
                  </div>
                  <div class="analytics-card">
                    <h4>风险识别分析</h4>
                    <DataChartsComponent class="chart-container" chartType="risk" />
                  </div>
                </div>
              </div>
              
              <!-- 无人机状态区域 -->
              <div class="analytics-section">
                <h3 class="section-title">设备状态监测</h3>
                <div class="analytics-card-grid">
                  <div class="analytics-card">
                    <h4>电量趋势</h4>
                    <DataChartsComponent class="chart-container" chartType="battery" />
                  </div>
                  <div class="analytics-card">
                    <h4>信号强度</h4>
                    <DataChartsComponent class="chart-container" chartType="signal" />
                  </div>
                  <div class="analytics-card">
                    <h4>飞行速度</h4>
                    <DataChartsComponent class="chart-container" chartType="speed" />
                  </div>
                </div>
              </div>
            </div>
          </template>
          
          <template v-else-if="analysisMode === 'drilldown'">
            <div class="drilldown-controls">
              <div class="control-item">
                <span class="control-label">数据类型</span>
                <el-select v-model="drilldownType" placeholder="选择数据类型" size="small">
                  <el-option label="人员监测" value="person" />
                  <el-option label="车辆监测" value="vehicle" />
                </el-select>
              </div>
              
              <div class="control-item">
                <span class="control-label">监测区域</span>
                <el-select v-model="drilldownRegion" placeholder="选择区域" size="small">
                  <el-option label="中心区域" value="central" />
                  <el-option label="北部区域" value="north" />
                  <el-option label="南部区域" value="south" />
                  <el-option label="东部区域" value="east" />
                  <el-option label="西部区域" value="west" />
                </el-select>
              </div>
              
              <el-tooltip content="了解高级分析" placement="top">
                <el-button size="small" circle @click="showTip('数据钻取允许您从概览数据深入到详细数据，逐层分析信息。点击图表扇区可查看细分数据。')">
                  <el-icon><QuestionFilled /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
            
            <DataDrilldownComponent
              :dataType="drilldownType"
              :region="drilldownRegion"
              @export-data="handleExportDrilldownData"
              @back="switchAnalysisMode('charts')"
            />
          </template>
          
          <template v-else-if="analysisMode === 'comparison'">
            <div class="comparison-controls">
              <div class="control-item">
                <span class="control-label">对比类型</span>
                <el-select v-model="comparisonMode" placeholder="选择对比类型" size="small">
                  <el-option label="时间对比" value="time" />
                  <el-option label="区域对比" value="region" />
                  <el-option label="自定义对比" value="custom" />
                </el-select>
              </div>
              
              <el-tooltip content="了解数据对比" placement="top">
                <el-button size="small" circle @click="showTip('数据对比功能允许您比较不同时间段或不同区域的数据，发现趋势变化和异常模式。')">
                  <el-icon><QuestionFilled /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
            
            <DataComparisonComponent :mode="comparisonMode" />
          </template>

          <template v-else-if="analysisMode === 'ai'">
            <AnomalyDetectionComponent />
          </template>
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
          <GeoApiDashboard style="height: 900px;" />
        </section>
      </main>
      
      <!-- 页脚 -->
      <footer class="dashboard-footer">
        <div class="container">
          <div class="footer-left">
            <p>© 2025 空融智链 无人机监控平台</p>
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

/* 仪表盘网格布局 */
.overview-dashboard {
  margin-bottom: 40px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: auto auto;
  gap: 20px;
}

.dashboard-card {
  background-color: #132f4c;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.drone-status-card {
  grid-column: 1;
  grid-row: span 2;
  height: 800px;
}

.video-card {
  grid-column: 2;
  grid-row: 1;
  height: 450px;
}

.map-card {
  grid-column: 2;
  grid-row: 2;
  height: 330px;
}

.charts-card {
  grid-column: 1 / span 2;
  grid-row: 3;
  height: 500px;
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

/* 数据分析页面样式 */
.analytics-header {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.analytics-header h2 {
  font-size: 1.5rem;
  margin: 0 0 8px 0;
  color: #ffffff;
}

.analytics-description {
  font-size: 1rem;
  color: #90caf9;
  margin: 0 0 20px 0;
}

.analytics-actions {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.analytics-component {
  margin-top: 30px;
  background-color: #0a1929;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  min-height: 700px;
}

/* 新增分析布局样式 */
.analytics-compact-layout {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 16px;
}

.analytics-section {
  background-color: #132f4c;
  border-radius: 8px;
  padding: 16px 20px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #e3f2fd;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.analytics-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.analytics-card {
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  padding: 12px;
  height: 300px;
  display: flex;
  flex-direction: column;
}

.analytics-card h4 {
  font-size: 14px;
  margin: 0 0 12px 0;
  color: #90caf9;
  font-weight: normal;
}

.chart-container {
  flex: 1;
  min-height: 250px;
  overflow: hidden;
}

/* 高级分析相关样式 */
.drilldown-controls,
.comparison-controls {
  background-color: #132F4C;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  display: flex;
  gap: 16px;
  align-items: center;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-label {
  color: #90CAF9;
  white-space: nowrap;
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
  
  .analytics-card-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .drilldown-controls,
  .comparison-controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .control-item {
    width: 100%;
  }
  
  .overview-stats {
    grid-template-columns: 1fr;
  }
  
  .tab-navigation {
    flex-wrap: wrap;
  }
  
  .tab-button {
    flex: 1;
    min-width: 120px;
  }
  
  .analytics-header {
    flex-direction: column;
    align-items: flex-start;
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

/* 数据筛选面板样式 */
.action-buttons {
  display: flex;
  gap: 8px;
}

.filter-panel {
  background-color: #132f4c;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.filter-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.filter-panel-header h3 {
  margin: 0;
  color: #e3f2fd;
  font-size: 16px;
  font-weight: 500;
}

.filter-panel-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  color: #90caf9;
  font-size: 14px;
}

.filter-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .filter-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filter-row {
    grid-template-columns: 1fr;
  }
  
  .analytics-actions {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: space-between;
  }
}

/* 3D可视化容器 */
.visualization-container {
  width: 100%;
  height: 600px;
  background-color: #132f4c;
  border-radius: 8px;
  overflow: hidden;
  margin-top: 20px;
}

.visualization-controls {
  display: flex;
  align-items: center;
  margin-top: 20px;
  padding: 10px;
  background-color: #132f4c;
  border-radius: 8px;
}

/* 添加交互式过滤组件样式 */
.interactive-filtering {
  margin-top: 20px;
}

/* 添加自定义仪表盘样式 */
.custom-dashboard {
  margin-top: 20px;
}

/* 异常检测组件样式 */
.anomaly-detection {
  margin-top: 20px;
}
</style> 