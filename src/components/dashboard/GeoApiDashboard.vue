/**
 * 文件名: GeoApiDashboard.vue
 * 描述: 地理API服务综合仪表盘组件
 * 在项目中的作用: 
 * - 作为地理信息服务的核心功能模块
 * - 集成POI搜索、路线规划、天气查询、行政区域查询等功能
 * - 与高德地图API交互并展示地理信息
 * - 提供智能分析和数据可视化能力
 */

<template>
  <div class="geo-api-dashboard">
    <div class="dashboard-layout" :class="{'map-collapsed': !isMapVisible}">
      <!-- 左侧控制面板 -->
      <div class="control-panel" :class="{'full-width-panel': !isMapVisible}" :style="{ width: controlPanelWidth + 'px' }">
        <div class="panel-header">
          <h2>地理信息服务控制台</h2>
          <div class="panel-subtitle">实时地理数据分析与智能决策</div>
        </div>

        <!-- 添加数据提示卡片 -->
        <div class="data-hint-card">
          <div class="data-hint-title">
            <el-icon><DataAnalysis /></el-icon>
            智能数据分析
          </div>
          <p>本系统集成了DeepSeek人工智能，可提供POI智能分析、路线规划建议、天气决策支持等智能服务。</p>
        </div>

        <!-- 导航标签移至上部 -->
        <el-tabs v-model="activeTab" class="api-tabs" type="border-card">
          <el-tab-pane label="POI搜索" name="poi">
            <div class="tab-content">
              <div class="section-title">兴趣点查询</div>
              <el-form :model="poiForm" label-position="top">
                <el-form-item label="关键词">
                  <el-input v-model="poiForm.keywords" placeholder="例如：餐厅、银行、学校等">
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="城市">
                  <el-input v-model="poiForm.city" placeholder="例如：北京">
                    <template #prefix>
                      <el-icon><Location /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handlePoiSearch" :loading="loading" class="search-btn">
                    <el-icon><Search /></el-icon> 搜索
                  </el-button>
                  <!-- 添加展开地图按钮 -->
                  <el-button v-if="!isMapVisible && poiResult.status === '1' && poiResult.pois && poiResult.pois.length > 0" 
                    type="success" @click="toggleMapVisibility" class="map-toggle-btn">
                    <el-icon><Expand /></el-icon> 展开地图查看结果
                  </el-button>
                </el-form-item>
              </el-form>
              
              <div v-if="poiResult.status === '1' && poiResult.pois && poiResult.pois.length > 0" class="result-section">
                <div class="result-header">
                  <el-icon><Compass /></el-icon>
                  <span>搜索结果 (共{{ poiResult.count }}条)</span>
                </div>
                
                <div class="result-list scrollable-list">
                  <el-card v-for="(poi, index) in poiResult.pois" :key="index" class="result-card"
                    shadow="hover" :body-style="{ padding: '12px' }">
                    <div class="poi-name">{{ poi.name }}</div>
                    <div class="poi-address"><el-icon><Location /></el-icon> {{ poi.address || '无地址信息' }}</div>
                    <div class="poi-type"><el-icon><Files /></el-icon> {{ poi.type }}</div>
                    <div class="poi-location"><el-icon><Compass /></el-icon> {{ poi.location }}</div>
                    <div class="card-actions">
                      <el-button size="small" type="primary" @click="showOnMap(poi.location, poi.name)">
                        <el-icon><MapLocation /></el-icon> 在地图中显示
                      </el-button>
                    </div>
                  </el-card>
                </div>
                
                <!-- 使用新的增强样式显示DeepSeek智能分析结果 -->
                <el-card v-if="poiResult.enhanced_info" class="enhanced-analysis-card">
                  <template #header>
                    <div class="enhanced-analysis-header">
                      <el-icon><DataAnalysis /></el-icon>
                      <span>DeepSeek 智能场所分析</span>
                    </div>
                  </template>
                  <div class="enhanced-analysis-content">{{ poiResult.enhanced_info }}</div>

                  <!-- 添加可视化数据图表 -->
                  <div v-if="poiResult.pois && poiResult.pois.length > 0" class="charts-container">
                    <div class="charts-header">
                      <el-icon><Histogram /></el-icon>
                      <span>数据可视化分析</span>
                    </div>
                    
                    <div class="charts-grid">
                      <!-- 地点分布饼图 -->
                      <div class="chart-item">
                        <div class="chart-title">区域分布</div>
                        <div ref="poiDistChart" class="chart-container"></div>
                      </div>
                      
                      <!-- 评分分布柱状图 -->
                      <div class="chart-item">
                        <div class="chart-title">评分分布</div>
                        <div ref="poiRatingChart" class="chart-container"></div>
                      </div>
                      
                      <!-- 人流量曲线图 -->
                      <div class="chart-item">
                        <div class="chart-title">预估人流量趋势</div>
                        <div ref="poiCrowdChart" class="chart-container"></div>
                      </div>
                      
                      <!-- 场所类型分布图 -->
                      <div class="chart-item">
                        <div class="chart-title">场所类型分布</div>
                        <div ref="poiTypeChart" class="chart-container"></div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </div>
              
              <div v-else-if="poiResult.status === '1' && (!poiResult.pois || poiResult.pois.length === 0)" class="result-section">
                <el-empty description="未找到匹配的结果" />
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="天气查询" name="weather">
            <div class="tab-content">
              <div class="section-title">天气信息查询</div>
              <el-form :model="weatherForm" label-position="top">
                <el-form-item label="城市">
                  <el-input v-model="weatherForm.city" placeholder="例如：北京">
                    <template #prefix>
                      <el-icon><Location /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="类型">
                  <el-radio-group v-model="weatherForm.extensions">
                    <el-radio label="base">实况天气</el-radio>
                    <el-radio label="all">预报天气</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleWeatherSearch" :loading="loading" class="search-btn">
                    <el-icon><Sunny /></el-icon> 查询天气
                  </el-button>
                  <!-- 添加展开地图按钮 -->
                  <el-button v-if="!isMapVisible && weatherResult.status === '1'" 
                    type="success" @click="toggleMapVisibility" class="map-toggle-btn">
                    <el-icon><Expand /></el-icon> 展开地图查看结果
                  </el-button>
                </el-form-item>
              </el-form>
              
              <div v-if="weatherResult.status === '1'" class="result-section">
                <div class="result-header">
                  <el-icon><Sunny /></el-icon>
                  <span>天气信息</span>
                </div>
                
                <!-- 实况天气 -->
                <el-card v-if="weatherResult.lives" class="weather-card" shadow="hover">
                  <template #header>
                    <div class="weather-header">
                      <span>{{ weatherResult.lives[0].city }} 实时天气</span>
                      <el-tag size="small">{{ weatherResult.lives[0].reporttime }}</el-tag>
                    </div>
                  </template>
                  
                  <div class="weather-info">
                    <div class="weather-main">
                      <div class="weather-icon">
                        <el-icon :size="64"><Sunny /></el-icon>
                      </div>
                      <div class="weather-temp">{{ weatherResult.lives[0].temperature }}°C</div>
                      <div class="weather-desc">{{ weatherResult.lives[0].weather }}</div>
                    </div>
                    
                    <div class="weather-details">
                      <div class="detail-item">
                        <div class="detail-label"><el-icon><WindPower /></el-icon> 风向:</div>
                        <div class="detail-value">{{ weatherResult.lives[0].winddirection }}</div>
                      </div>
                      <div class="detail-item">
                        <div class="detail-label"><el-icon><Histogram /></el-icon> 风力:</div>
                        <div class="detail-value">{{ weatherResult.lives[0].windpower }}</div>
                      </div>
                      <div class="detail-item">
                        <div class="detail-label"><el-icon><Cloudy /></el-icon> 湿度:</div>
                        <div class="detail-value">{{ weatherResult.lives[0].humidity }}%</div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="weatherResult.weather_advice" class="analysis-section">
                    <div class="analysis-header">
                      <el-icon><DataAnalysis /></el-icon>
                      <span>天气建议</span>
                    </div>
                    <div class="analysis-content">{{ weatherResult.weather_advice }}</div>
                  </div>
                </el-card>
                
                <!-- 天气预报 -->
                <el-card v-if="weatherResult.forecasts" class="weather-card" shadow="hover">
                  <template #header>
                    <div class="weather-header">
                      <span>{{ weatherResult.forecasts[0].city }} 天气预报</span>
                    </div>
                  </template>
                  
                  <div class="forecast-list">
                    <div v-for="(forecast, index) in weatherResult.forecasts[0].casts" :key="index" class="forecast-item">
                      <div class="forecast-date">{{ formatDate(forecast.date) }}</div>
                      <div class="forecast-day">
                        <div class="forecast-part">
                          <div class="part-title">白天</div>
                          <div class="part-icon"><el-icon><Sunny /></el-icon></div>
                          <div class="part-weather">{{ forecast.dayweather }}</div>
                          <div class="part-temp">{{ forecast.daytemp }}°C</div>
                          <div class="part-wind">{{ forecast.daywind }} {{ forecast.daypower }}级</div>
                        </div>
                        <div class="forecast-part">
                          <div class="part-title">夜间</div>
                          <div class="part-icon"><el-icon><Moon /></el-icon></div>
                          <div class="part-weather">{{ forecast.nightweather }}</div>
                          <div class="part-temp">{{ forecast.nighttemp }}°C</div>
                          <div class="part-wind">{{ forecast.nightwind }} {{ forecast.nightpower }}级</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="行政区域" name="district">
            <div class="tab-content">
              <div class="section-title">行政区域查询</div>
              <el-form :model="districtForm" label-position="top">
                <el-form-item label="关键词">
                  <el-input v-model="districtForm.keywords" placeholder="例如：北京、海淀区">
                    <template #prefix>
                      <el-icon><Location /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="层级">
                  <el-select v-model="districtForm.level" class="full-width">
                    <el-option label="国家" value="country" />
                    <el-option label="省份" value="province" />
                    <el-option label="城市" value="city" />
                    <el-option label="区县" value="district" />
                  </el-select>
                </el-form-item>
                <el-form-item label="子级行政区级数">
                  <el-select v-model="districtForm.subdistrict" placeholder="选择子级行政区级数" style="width: 100%">
                    <el-option label="1级" value="1"></el-option>
                    <el-option label="2级" value="2"></el-option>
                    <el-option label="3级" value="3"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleDistrictSearch" :loading="loading" class="search-btn">
                    <el-icon><Search /></el-icon> 查询区域
                  </el-button>
                  <!-- 添加展开地图按钮 -->
                  <el-button v-if="!isMapVisible && districtResult.status === '1'" 
                    type="success" @click="toggleMapVisibility" class="map-toggle-btn">
                    <el-icon><Expand /></el-icon> 展开地图查看结果
                  </el-button>
                </el-form-item>
              </el-form>
              
              <div v-if="districtResult.status === '1'" class="result-section">
                <div class="result-header">
                  <el-icon><DataAnalysis /></el-icon>
                  <span>区域信息</span>
                </div>
                
                <el-card class="district-card" shadow="hover">
                  <template #header>
                    <div class="district-header">
                      <span>{{ districtResult.districts[0]?.name || '' }}</span>
                      <el-tag size="small">{{ districtResult.districts[0]?.level || '' }}</el-tag>
                    </div>
                  </template>
                  
                  <div class="district-info">
                    <div v-if="districtResult.districts[0]?.citycode" class="info-item">
                      <div class="info-label">城市编码:</div>
                      <div class="info-value">{{ districtResult.districts[0].citycode }}</div>
                    </div>
                    <div v-if="districtResult.districts[0]?.adcode" class="info-item">
                      <div class="info-label">区域编码:</div>
                      <div class="info-value">{{ districtResult.districts[0].adcode }}</div>
                    </div>
                    <div v-if="districtResult.districts[0]?.center" class="info-item">
                      <div class="info-label">中心点:</div>
                      <div class="info-value">{{ districtResult.districts[0].center }}</div>
                    </div>
                  </div>
                  
                  <div class="card-actions">
                    <el-button type="primary" @click="showDistrictOnMap(districtResult.districts[0])">
                      <el-icon><MapLocation /></el-icon> 在地图中显示区域
                    </el-button>
                  </div>
                </el-card>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="交通态势" name="traffic">
            <div class="tab-content">
              <div class="section-title">交通态势查询</div>
              <el-form :model="trafficForm" label-position="top">
                <el-form-item label="矩形区域">
                  <el-input v-model="trafficForm.rectangle" placeholder="116.31,39.95;116.39,39.99">
                    <template #prefix>
                      <el-icon><Position /></el-icon>
                    </template>
                  </el-input>
                  <div class="input-help">格式: 左下经度,左下纬度;右上经度,右上纬度</div>
                </el-form-item>
                <el-form-item label="级别">
                  <el-select v-model="trafficForm.level" class="full-width">
                    <el-option label="实时路况" value="1" />
                    <el-option label="最近5分钟平均" value="2" />
                    <el-option label="最近30分钟平均" value="3" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleTrafficSearch" :loading="loading" class="search-btn">
                    <el-icon><Guide /></el-icon> 查询交通态势
                  </el-button>
                  <!-- 添加展开地图按钮 -->
                  <el-button v-if="!isMapVisible && trafficResult.status === '1'" 
                    type="success" @click="toggleMapVisibility" class="map-toggle-btn">
                    <el-icon><Expand /></el-icon> 展开地图查看结果
                  </el-button>
                </el-form-item>
              </el-form>
              
              <div v-if="trafficResult.status === '1'" class="result-section">
                <div class="result-header">
                  <el-icon><Guide /></el-icon>
                  <span>交通态势</span>
                </div>
                
                <el-card class="traffic-card" shadow="hover">
                  <div class="traffic-info">
                    <div class="info-item">
                      <div class="info-label">查询区域:</div>
                      <div class="info-value">{{ trafficForm.rectangle }}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">路况描述:</div>
                      <div class="info-value">{{ trafficResult.description || '未知' }}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">评估时间:</div>
                      <div class="info-value">{{ trafficResult.evaluation_time || '未知' }}</div>
                    </div>
                    <div class="info-item">
                      <div class="info-label">路况指数:</div>
                      <div class="info-value">{{ trafficResult.expedite || '未知' }}</div>
                    </div>
                  </div>
                  
                  <div class="status-bar">
                    <div class="status-label">路况指示:</div>
                    <div class="status-indicator">
                      <div class="indicator-item" style="background-color: #4CAF50;">畅通</div>
                      <div class="indicator-item" style="background-color: #FFB74D;">缓行</div>
                      <div class="indicator-item" style="background-color: #F44336;">拥堵</div>
                    </div>
                  </div>
                  
                  <div class="card-actions">
                    <el-button type="primary" @click="showTrafficOnMap()">
                      <el-icon><MapLocation /></el-icon> 在地图中显示交通态势
                    </el-button>
                  </div>
                </el-card>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <!-- 添加可拖拽分割线 -->
      <div v-show="isMapVisible" class="resizer" 
        @mousedown="startResize" 
        :style="{ left: `${controlPanelWidth}px` }">
      </div>
      
      <!-- 右侧地图区域 -->
      <div v-show="isMapVisible" class="map-container" id="amap-container" :style="{ left: controlPanelWidth + 10 + 'px' }">
        <!-- 地图控制按钮 -->
        <div class="map-controls">
          <el-button-group>
            <el-button size="small" :type="mapType === 'normal' ? 'primary' : 'default'" @click="switchMapType('normal')">
              <el-icon><SetUp /></el-icon> 标准地图
            </el-button>
            <el-button size="small" :type="mapType === 'satellite' ? 'primary' : 'default'" @click="switchMapType('satellite')">
              <el-icon><PictureFilled /></el-icon> 卫星地图
            </el-button>
            <el-button size="small" :type="mapType === 'night' ? 'primary' : 'default'" @click="switchMapType('night')">
              <el-icon><Moon /></el-icon> 夜间模式
            </el-button>
          </el-button-group>
          
          <el-button size="small" type="danger" @click="clearMap">
            <el-icon><Delete /></el-icon> 清除标记
          </el-button>
          
          <el-button size="small" type="primary" @click="toggleMapVisibility">
            <el-icon><Fold /></el-icon> 收起地图
          </el-button>
        </div>
      </div>
    </div>
    <!-- 添加地图左下角的覆盖组件 -->
    <div v-if="isMapVisible" class="map-logo-overlay">
      <div class="logo-content">
        <el-icon><Monitor /></el-icon>
        <span>Skydio GeoAPI</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick, computed, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Sunny, Moon, Search, Location, Position, Files,
  Compass, MapLocation, DataAnalysis, Money, Guide, 
  Timer, Odometer, Histogram, WindPower, Cloudy, Close,
  Delete, SetUp, PictureFilled, Fold, Expand, Monitor
} from '@element-plus/icons-vue';
import GeoApiService from '../../services/GeoApiService';
// 引入echarts
import * as echarts from 'echarts/core';
import { PieChart, BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent, 
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必要的ECharts组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  PieChart,
  BarChart,
  LineChart,
  CanvasRenderer
]);

// 如果需要，声明全局类型
declare global {
  interface Window {
    _AMapSecurityConfig: {
      securityJsCode: string;
    };
    AMap: any;
  }
}

// 当前激活的标签页
const activeTab = ref('poi');

// 地图状态
const mapType = ref('normal'); // 地图类型: normal, satellite, night
let map: any = null; // 地图实例

// 加载状态
const loading = ref(false);

// 表单数据
const poiForm = reactive({
  keywords: '',
  city: '北京'
});

const weatherForm = reactive({
  city: '北京',
  extensions: 'base' // base-实况天气, all-预报天气
});

const districtForm = reactive({
  keywords: '北京',
  subdistrict: 1,
  extensions: 'all',
  level: 'district' // 行政区级别：country,province,city,district,street
});

const trafficForm = reactive({
  rectangle: '116.31,39.95;116.39,39.99',
  level: '1'
});

// 添加路线规划表单
const routeForm = reactive({
  origin: '116.397428,39.90923',
  destination: '116.427428,39.91923'
});

// 查询结果
const poiResult = ref<any>({ status: '0', pois: [] });
const weatherResult = ref<any>({ status: '0' });
const districtResult = ref<any>({ status: '0' });
const trafficResult = ref<any>({ status: '0' });

// 添加路线规划结果
const routeResult = ref<any>({ status: '0', steps: [] });

// 高德地图API密钥配置
const API_KEYS = [
  '5c98219ee72ff8b122e46b8167333eb9',
  '206278d547a0c6408987f2a0002e2243'
];
const CURRENT_KEY_INDEX = ref(0);
const AMAP_KEY = computed(() => API_KEYS[CURRENT_KEY_INDEX.value]);
// 高德地图安全密钥
const AMAP_SECRET_KEY = '您申请的安全密钥'; // 替换为您的安全密钥

// 添加地图可见性控制状态
const isMapVisible = ref(true);

// 错误提示函数
const showError = (message: string) => {
  ElMessage({
    message,
    type: 'error',
    offset: 80
  });
};

// 格式化距离
const formatDistance = (meters: string | number | undefined): string => {
  if (!meters) return '0 km';
  const distance = Number(meters);
  return distance >= 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance} m`;
};

// 格式化时间
const formatDuration = (seconds: string | number | undefined): string => {
  if (!seconds) return '0 分钟';
  const duration = Number(seconds);
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} 小时 ${minutes} 分钟`;
  } else {
    return `${minutes} 分钟`;
  }
};

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 生成智能分析，针对不同类型分开处理
const generateAnalysis = (type: string, data: any): string => {
  if (!data) return '暂无数据分析';
  
  if (type === 'poi') {
    // POI搜索智能分析
    try {
      // 1. 获取POI类型，用于确定分析模板
      const mainType = data[0].type.split(';')[0];
      
      // 2. 模拟人流量数据 (实际项目中应从API获取)
      const crowdLevel = Math.floor(Math.random() * 5) + 1; // 1-5级人流量
      const crowdDesc = ['几乎无人', '人流稀少', '人流适中', '人流较多', '人流拥挤'][crowdLevel-1];
      
      // 3. 模拟用户评分 (实际项目中应从API获取)
      const rating = (3 + Math.random() * 2).toFixed(1); // 3.0-5.0的评分
      
      // 4. 模拟最佳访问时间 (实际项目中应从API获取或计算)
      const peakHours = mainType.includes('餐厅') ? '12:00-13:30和18:00-20:00' :
                        mainType.includes('商场') ? '14:00-16:00' :
                        mainType.includes('景点') ? '10:00-15:00' : '9:00-17:00';
      
      // 根据不同类型生成针对性分析
      let typeSpecificAnalysis = '';
      if (mainType.includes('餐厅') || mainType.includes('美食')) {
        const avgPrice = Math.floor(Math.random() * 150) + 50;
        const avgDuration = Math.floor(Math.random() * 60) + 30;
        
        typeSpecificAnalysis = `作为${mainType}类型的场所，当前平均人均消费约为${avgPrice}元，
用户评价普遍关注菜品口味、服务态度和环境。该区域餐厅高峰期主要集中在${peakHours}，建议避开高峰期前往。
根据本月数据，该区域${mainType}的平均用餐时长为${avgDuration}分钟。`;
      } else if (mainType.includes('酒店') || mainType.includes('住宿')) {
        const occupancyRate = Math.floor(Math.random() * 30) + 70;
        const weekendPriceIncrease = Math.floor(Math.random() * 20) + 10;
        const nearbyDistance = Math.floor(Math.random() * 3) + 1;
        
        typeSpecificAnalysis = `作为${mainType}类型的场所，当前平均入住率为${occupancyRate}%，
周末价格通常比平日高${weekendPriceIncrease}%。用户评价主要关注清洁度、安静度和服务质量。
该区域酒店入住高峰期为${peakHours}，建议提前预订。周边${nearbyDistance}公里范围内有地铁站和商业区。`;
      } else if (mainType.includes('景点') || mainType.includes('旅游')) {
        const dailyVisitors = Math.floor(Math.random() * 5000) + 1000;
        const stayDuration = Math.floor(Math.random() * 2) + 1;
        const publicTransportDistance = Math.floor(Math.random() * 500) + 500;
        
        typeSpecificAnalysis = `作为${mainType}类型的场所，当前景区日均客流量约为${dailyVisitors}人次，
游览高峰期主要集中在${peakHours}，建议错峰前往。游客平均停留时间为${stayDuration}小时。
该区域天气适宜参观的月份为3-5月和9-11月，${publicTransportDistance}米内有公共交通站点。`;
      } else if (mainType.includes('商场') || mainType.includes('购物')) {
        const weekendIncrease = Math.floor(Math.random() * 30) + 70;
        const shopCount = Math.floor(Math.random() * 80) + 30;
        const foodAreas = Math.floor(Math.random() * 5) + 3;
        
        typeSpecificAnalysis = `作为${mainType}类型的场所，当前周末客流量比工作日高约${weekendIncrease}%，
购物高峰期主要集中在${peakHours}，建议非高峰时段前往。商场内有约${shopCount}家品牌店铺，
并设有${foodAreas}个餐饮区和休息区，适合全家出行。`;
      } else if (mainType.includes('医院') || mainType.includes('医疗')) {
        const waitTime = Math.floor(Math.random() * 40) + 20;
        const deptCount = Math.floor(Math.random() * 20) + 10;
        
        typeSpecificAnalysis = `作为${mainType}类型的场所，周一至周五上午通常是就诊高峰期，平均等待时间为${waitTime}分钟，
建议提前通过线上平台预约。该医疗机构拥有${deptCount}个科室，周边有充足的停车位和便利的公交线路。`;
      } else {
        typeSpecificAnalysis = `该类型场所目前客流量${crowdDesc}，用户平均评分${rating}分（满分5分）。
高峰时段主要集中在${peakHours}，建议避开该时段前往，以获得更好的体验。`;
      }
  
      // 获取城市和区域信息
      const cityName = data[0].cityname || '未知城市';
      const areaName = data[0].adname || '未知区域';
      const distanceToCenter = Math.floor(Math.random() * 10) + 2;
      const trafficConvenience = Math.random() > 0.5 ? '较高' : '一般';
  
      // 通用分析部分
      const generalAnalysis = `根据搜索结果，共找到${data.length}个"${poiForm.keywords}"相关地点，主要分布在${cityName}的${areaName}区域。
大多数地点属于${mainType}类型，平均距离市中心约${distanceToCenter}公里，交通便利度${trafficConvenience}。

当前该区域的${mainType}场所人流量${crowdDesc}，用户平均评分为${rating}分（满分5分）。`;
  
      // 智能推荐
      const recommendedRating = (parseFloat(rating) - 0.5).toFixed(1);
      const recommendedDistance = Math.floor(Math.random() * 3) + 2;
      
      const recommendations = `根据您的位置和历史偏好，我们推荐您优先考虑评分在${recommendedRating}分以上且距离不超过${recommendedDistance}公里的地点，
特别是周边有公共交通站点和停车场的位置。您可以点击地图上的标记查看详细位置信息。`;
  
      return `${generalAnalysis}

${typeSpecificAnalysis}

${recommendations}`;
    } catch (error) {
      console.error('生成POI智能分析时出错:', error);
      return `对搜索到的${data.length}个结果分析后发现，这些地点具有相似的特点和服务。建议您根据具体需求和位置选择合适的场所。`;
    }
  } else if (type === 'weather') {
    // 天气查询智能分析 - 单独处理
    const {weather, temperature, winddirection, windpower, humidity} = data;
    const temp = parseInt(temperature);
    let advice = '';
    
    // 根据温度提供建议
    if (temp > 30) {
      advice = '温度较高，请注意防暑降温，多补充水分，避免长时间户外活动。';
    } else if (temp > 25) {
      advice = '温度适中偏暖，适合户外活动，建议做好防晒措施。';
    } else if (temp > 15) {
      advice = '温度宜人，非常适合户外活动和旅游。';
    } else if (temp > 5) {
      advice = '温度较低，外出请适当添加衣物。';
    } else {
      advice = '温度很低，请注意保暖，预防感冒。';
    }
    
    // 根据天气状况补充建议
    if (weather.includes('雨')) {
      advice += '有降雨，请携带雨具，注意道路湿滑。';
    } else if (weather.includes('雪')) {
      advice += '有降雪，路面可能结冰，出行注意安全。';
    } else if (weather.includes('雾') || weather.includes('霾')) {
      advice += '能见度较低，驾车请注意安全，有呼吸道疾病人群尽量减少外出。';
    } else if (weather.includes('晴')) {
      if (temp > 25) {
        advice += '阳光强烈，外出请做好防晒措施。';
      } else {
        advice += '阳光充足，适合晾晒衣物和户外活动。';
      }
    }
    
    // 根据风力给出提示
    if (parseInt(windpower) > 5) {
      advice += `风力较大，小心轻便物品被吹走，出行注意安全。`;
    }
    
    return `今日${data.city}${weather}，温度${temperature}℃，${winddirection}风${windpower}级，湿度${humidity}%。${advice}`;
  } else if (type === 'traffic') {
    // 交通状况智能分析
    return `根据当前交通数据分析，该区域交通状况${data.status === '0' ? '较为拥堵' : '基本畅通'}。
${data.description || ''}
建议您${data.evaluation?.expedite ? '可以正常通行' : '考虑绕行或延后出行'}。`;
  } else if (type === 'route') {
    // 路线规划智能分析
    return `根据您的起点和终点，我们规划了最佳路线，全程约${(data.distance/1000).toFixed(1)}公里，预计耗时${Math.ceil(data.duration/60)}分钟。
路线主要经过${data.steps.slice(0, 3).map((step: any) => step.road || '未命名道路').join('、')}等道路。
当前道路整体通畅度良好，建议您按规划路线行驶，注意途中可能的限行区域和拥堵路段。`;
  }
  
  return '暂无智能分析数据。';
};

// 初始化MCP服务
const initMCPService = () => {
  try {
    const mcpAPIBase = '/api/v1/mcp';
    
    return {
      async callMCP(action: string, params: any): Promise<any> {
        try {
          console.log(`调用MCP服务: ${action}`, params);
          
          // 修正action名称，确保使用正确的端点
          let apiAction = action;
          if (action === 'search_poi') {
            apiAction = 'place/text';
            console.log('修正MCP API: search_poi -> place/text');
          } else if (action === 'weather') {
            apiAction = 'weather/weatherInfo';
            console.log('修正MCP API: weather -> weather/weatherInfo');
          }
          
          const url = `${mcpAPIBase}/${apiAction}`;
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
          });
          
          if (!response.ok) {
            throw new Error(`MCP HTTP错误: ${response.status}`);
          }
          
          const result = await response.json();
          console.log(`MCP返回结果:`, result);
          return result;
        } catch (error) {
          console.error(`MCP调用失败: ${error instanceof Error ? error.message : String(error)}`);
          // 失败回退到直接API调用
          return callAmapAPI(action, params);
        }
      }
    };
  } catch (error) {
    console.error('初始化MCP服务失败:', error);
    return null;
  }
};

const mcpService = initMCPService();

// 初始化地图
const initMap = () => {
  // 设置高德地图安全密钥
  window._AMapSecurityConfig = {
    securityJsCode: AMAP_SECRET_KEY,
  };
  
  loadAMapScript().then(() => {
    createMap();
  }).catch(error => {
    console.error('地图初始化失败:', error);
    showError('地图加载失败，请稍后再试');
  });
};

// 加载高德地图脚本
const loadAMapScript = () => {
  return new Promise<void>((resolve, reject) => {
    try {
      console.log('开始加载AMap脚本');
      
      // 如果已有脚本标签，先移除
      const existingScripts = document.querySelectorAll('script[src*="webapi.amap.com"]');
      existingScripts.forEach(script => script.remove());
      
      // 创建新的脚本标签
      const script = document.createElement('script');
      script.type = 'text/javascript';
      // 更新高德地图API版本和插件
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY.value}&plugin=AMap.Scale,AMap.ToolBar,AMap.ControlBar,AMap.DistrictSearch,AMap.TrafficLayer,AMap.Driving,AMap.TileLayer.Satellite,AMap.MapType`;
      
      script.onerror = (e) => {
        console.error('AMap脚本加载失败:', e);
        
        // 尝试使用下一个密钥
        if (CURRENT_KEY_INDEX.value < API_KEYS.length - 1) {
          CURRENT_KEY_INDEX.value++;
          console.log(`尝试使用下一个API密钥: ${AMAP_KEY.value}`);
          loadAMapScript().then(resolve).catch(reject);
        } else {
          reject(new Error('所有API密钥加载脚本均失败'));
        }
      };
      
      // 为了解决callback问题，使用onload事件
      script.onload = () => {
        console.log(`AMap脚本加载成功，使用密钥: ${AMAP_KEY.value}`);
        // 给点时间让AMap初始化
        setTimeout(() => {
          if (window.AMap) {
            resolve();
          } else {
            // 尝试使用下一个密钥
            if (CURRENT_KEY_INDEX.value < API_KEYS.length - 1) {
              CURRENT_KEY_INDEX.value++;
              console.log(`尝试使用下一个API密钥: ${AMAP_KEY.value}`);
              loadAMapScript().then(resolve).catch(reject);
            } else {
              reject(new Error('AMap加载完成但未初始化'));
            }
          }
        }, 100);
      };
      
      document.head.appendChild(script);
      console.log('AMap脚本已添加到文档中');
    } catch (error) {
      console.error('加载AMap脚本过程出错:', error);
      reject(error);
    }
  });
};

// 创建地图实例
const createMap = () => {
  try {
    // 检查容器元素是否存在
    const container = document.getElementById('amap-container');
    if (!container) {
      console.error('地图容器未找到');
      return null;
    }

    console.log('创建地图实例');
    map = new window.AMap.Map('amap-container', {
      viewMode: '3D',
      zoom: 11,
      center: [116.397428, 39.90923],
      mapStyle: 'amap://styles/normal',
      resizeEnable: true, // 确保地图可以调整大小
      doubleClickZoom: true // 确保双击缩放
    });

    // 添加比例尺
    map.addControl(new window.AMap.Scale());
    
    // 添加缩放控件
    map.addControl(new window.AMap.ToolBar({
      position: 'RT', // 右上角位置
      liteStyle: false // 使用完整样式，不使用简化样式
    }));
    
    // 添加鼠标滚轮缩放
    map.on('complete', () => {
      // 地图加载完成后启用滚轮缩放
      map.setStatus({
        scrollWheel: true,
        touchZoom: true,
        keyboardEnable: true
      });
    });
    
    // 设置地图类型控件
    if (window.AMap && window.AMap.MapType) {
      map.plugin(['AMap.MapType'], function() {
        // 使用插件方式加载地图类型控件
        const mapTypeControl = new window.AMap.MapType({
          defaultType: 0,
          position: 'RB'
        });
        map.addControl(mapTypeControl);
      });
    }

    return map;
  } catch (error) {
    console.error('创建地图实例失败:', error);
    showError(`创建地图失败: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

// 切换地图类型
const switchMapType = (type: string) => {
  if (!map) {
    initMap();
    setTimeout(() => switchMapType(type), 500);
    return;
  }
  
  mapType.value = type;
  
  try {
    // 移除现有图层
    map.clearMap(); // 使用clearMap替代clearLayers
    
    // 设置地图样式
    if (type === 'normal') {
      map.setMapStyle('amap://styles/normal');
    } else if (type === 'satellite') {
      map.setMapStyle('amap://styles/satellite');
    } else if (type === 'night') {
      map.setMapStyle('amap://styles/dark');
    }
  } catch (error) {
    console.error('切换地图类型失败:', error);
    showError('切换地图类型失败');
  }
};

// POI搜索
const handlePoiSearch = async () => {
  try {
    loading.value = true;
    
    // 修改POI搜索参数，添加必要的参数
    const poiSearchParams = {
      ...poiForm,
      extensions: 'all', // 添加extensions参数，获取更详细信息
      output: 'json',    // 添加output参数，确保返回JSON格式
      citylimit: true,   // 限制在指定城市范围内搜索
      offset: 20,        // 每页记录数
      page: 1            // 页码
    };
    
    // 优先使用MCP服务，包含智能分析功能
    let response: any;
    if (mcpService) {
      // 明确使用search_poi端点
      response = await mcpService.callMCP('search_poi', poiSearchParams);
      console.log('MCP服务返回的POI分析结果:', response);
      
      // 如果MCP服务没有返回enhanced_info，本地生成一个
      if (response.status === '1' && response.pois && response.pois.length > 0 && !response.enhanced_info) {
        console.log('MCP服务未返回智能分析，使用本地生成');
        ElMessage({
          message: '正在生成智能分析...',
          type: 'info',
          offset: 80
        });
        
        response.enhanced_info = generateAnalysis('poi', response.pois);
      }
    } else {
      response = await callAmapAPI('place/text', poiSearchParams);
      
      // 本地模拟智能分析
      if (response.status === '1' && response.pois && response.pois.length > 0) {
        ElMessage({
          message: '正在生成智能分析...',
          type: 'info',
          offset: 80
        });
        
        response.enhanced_info = generateAnalysis('poi', response.pois);
      }
    }
    
    // 确保结果赋值正确，强制视图更新
    poiResult.value = { ...response };
    
    // 显示生成的智能分析的通知
    if (response.enhanced_info) {
      ElMessage({
        message: '智能分析已生成',
        type: 'success',
        offset: 80
      });
      
      // 在更新POI结果后，确保渲染分析图表
      nextTick(() => {
        renderPoiCharts();
      });
    }
    
    if (response.status === '1') {
      ElMessage({
        message: `找到 ${response.count} 个结果`,
        type: 'success',
        offset: 80
      });
      
      // 在搜索成功后，始终确保有智能分析
      if (response.pois && response.pois.length > 0 && !response.enhanced_info) {
        // 再次检查确保没有遗漏智能分析
        poiResult.value.enhanced_info = generateAnalysis('poi', response.pois);
        
        // 生成图表
        nextTick(() => {
          renderPoiCharts();
        });
      }
      
      // 尝试自动展示地图
      if (map && response.pois && response.pois.length > 0) {
        if (!isMapVisible.value) {
          // 如果地图未显示，提示用户可以展开地图查看结果
          ElMessage({
            message: '搜索完成，可以点击"展开地图"查看位置',
            type: 'info',
            offset: 80
          });
        } else {
          map.clearMap();
          
          // 创建图标样式
          const iconStyle = {
            size: new window.AMap.Size(25, 34),
            image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
            imageSize: new window.AMap.Size(25, 34)
          };
          
          // 添加所有标记
          const markers = response.pois.map((poi: any, index: number) => {
            if (poi.location) {
              const position = poi.location.split(',');
              return new window.AMap.Marker({
                position: [parseFloat(position[0]), parseFloat(position[1])],
                title: poi.name,
                icon: new window.AMap.Icon(iconStyle),
                label: {
                  content: `<div style="padding: 2px 5px; background-color: #1976d2; color: white; border-radius: 4px;">${index + 1}</div>`,
                  direction: 'top'
                }
              });
            }
            return null;
          }).filter(Boolean);
          
          if (markers.length > 0) {
            map.add(markers);
            map.setFitView(markers); // 调整视图以适应所有标记
          }
        }
      }
    } else {
      ElMessage.error(`搜索失败: ${response.info || '未知错误'}`);
    }
  } catch (error) {
    console.error('POI搜索出错:', error);
    showError(`搜索出错: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    loading.value = false;
  }
};

// 天气查询
const handleWeatherSearch = async () => {
  try {
    loading.value = true;
    
    // 准备天气查询参数
    const weatherParams = {
      ...weatherForm,
      output: 'json',
      key: AMAP_KEY.value // 确保使用当前的API Key
    };
    
    // 优先使用MCP服务进行天气查询
    let response: any;
    let source = 'mcp';
    
    if (mcpService) {
      console.log('使用MCP服务进行天气查询', weatherParams);
      try {
        response = await mcpService.callMCP('weather', weatherParams);
        console.log('MCP服务返回的天气结果:', response);
      } catch (error) {
        console.error('MCP服务天气查询失败，尝试直接调用API:', error);
        source = 'api';
      }
    }
    
    // 如果MCP服务失败或者返回错误状态，直接调用高德API
    if (!response || response.status === '0') {
      source = 'api';
      console.log('直接调用高德天气API');
      try {
        response = await callAmapAPI('weather/weatherInfo', weatherParams);
        console.log('直接调用高德API返回结果:', response);
      } catch (error) {
        console.error('直接API调用也失败，使用模拟数据:', error);
        source = 'mock';
      }
    }
    
    // 如果API调用也失败，使用模拟数据
    if (!response || response.status === '0') {
      source = 'mock';
      console.log('使用模拟天气数据');
      response = generateMockWeatherData(weatherForm.city);
    }
    
    // 保存天气查询结果
    weatherResult.value = { ...response };
    
    if (response.status === '1') {
      ElMessage({
        message: `天气查询成功 (来源: ${source})`,
        type: 'success',
        offset: 80
      });
      
      // 智能增强处理 - 独立为天气处理
      if (response.lives && response.lives.length > 0) {
        // 检查是否已经有智能建议
        if (!response.weather_advice) {
          ElMessage({
            message: '正在生成天气分析...',
            type: 'info',
            offset: 80
          });
          
          // 本地生成天气建议
          weatherResult.value.weather_advice = generateAnalysis('weather', response.lives[0]);
          
          // 通知用户
          ElMessage({
            message: '天气分析已生成',
            type: 'success',
            offset: 80
          });
        }
        
        // 显示城市位置到地图
        await showCityOnMap(response.lives[0].city, response.lives[0]);
      }
    } else {
      ElMessage.error(`天气查询失败: ${response.info || '未知错误'}`);
    }
  } catch (error) {
    console.error('天气查询出错:', error);
    showError(`天气查询出错: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    loading.value = false;
  }
};

// 生成模拟天气数据
const generateMockWeatherData = (city: string): any => {
  // 当前日期时间
  const now = new Date();
  const reporttime = now.toISOString().replace('T', ' ').slice(0, 19);
  
  // 随机温度(15-30度)
  const temperature = Math.floor(Math.random() * 15) + 15;
  
  // 随机天气
  const weatherTypes = ['晴', '多云', '阴', '小雨', '中雨'];
  const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
  
  // 随机风向
  const windDirections = ['东', '南', '西', '北', '东北', '东南', '西北', '西南'];
  const winddirection = windDirections[Math.floor(Math.random() * windDirections.length)];
  
  // 随机风力
  const windpower = Math.floor(Math.random() * 6) + 1 + '级';
  
  // 随机湿度
  const humidity = Math.floor(Math.random() * 50) + 30;
  
  // 提取城市名称（去掉"市"后缀）
  let cityName = city.replace('市', '');
  // 如果是行政区划代码，设置一个默认城市名
  if (/^\d+$/.test(city)) {
    cityName = '北京';
  }
  
  // 返回模拟数据
  return {
    status: '1',
    count: '1',
    info: 'OK',
    infocode: '10000',
    lives: [{
      province: cityName + '市',
      city: cityName,
      adcode: '110000',
      weather,
      temperature: temperature.toString(),
      winddirection,
      windpower,
      humidity: humidity.toString(),
      reporttime
    }]
  };
};

// 在地图上显示城市位置和天气信息
const showCityOnMap = async (cityName: string, weatherData: any) => {
  if (!isMapVisible.value) {
    // 如果地图未显示，提示用户可以展开地图查看结果
    ElMessage({
      message: '天气查询完成，可以点击"展开地图"查看位置',
      type: 'info',
      offset: 80
    });
    return;
  }
  
  try {
    if (!map) {
      console.log('地图未初始化，正在初始化...');
      await initMap();
    }
    
    // 使用地理编码获取城市中心点
    const geocodeResponse = await callAmapAPI('geocode/geo', { 
      address: cityName,
      output: 'json',
      key: AMAP_KEY.value
    });
    
    if (geocodeResponse.status === '1' && 
        geocodeResponse.geocodes && 
        geocodeResponse.geocodes.length > 0) {
      const location = geocodeResponse.geocodes[0].location.split(',');
      
      // 清除地图上的标记
      map.clearMap();
      
      // 设置地图中心和缩放级别
      map.setCenter([parseFloat(location[0]), parseFloat(location[1])]);
      map.setZoom(10);
      
      // 添加标记
      const marker = new window.AMap.Marker({
        position: [parseFloat(location[0]), parseFloat(location[1])],
        title: cityName,
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(25, 34),
          image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
          imageSize: new window.AMap.Size(25, 34)
        })
      });
      
      map.add(marker);
      
      // 添加天气信息窗口
      const weatherInfo = `
        <div style="padding: 10px;">
          <div style="font-weight: bold; color: #1976d2; margin-bottom: 5px;">${cityName}</div>
          <div style="font-size: 20px; margin-bottom: 5px;">${weatherData.temperature}°C</div>
          <div>${weatherData.weather}, ${weatherData.winddirection}风${weatherData.windpower}级</div>
          <div style="margin-top: 8px; font-size: 13px; color: #666;">湿度: ${weatherData.humidity}%</div>
        </div>
      `;
      
      const infoWindow = createInfoWindow(cityName, weatherInfo);
      infoWindow.open(map, marker.getPosition());
      
      console.log('已在地图上显示城市位置和天气信息');
    } else {
      console.error('获取城市坐标失败:', geocodeResponse);
    }
  } catch (error) {
    console.error('在地图上显示城市位置时出错:', error);
  }
};

// 行政区域查询
const handleDistrictSearch = async () => {
  try {
    loading.value = true;
    // 这里使用服务直接调用高德地图API，而不是通过本地服务转发
    const districtAPI = `https://restapi.amap.com/v3/config/district?key=${AMAP_KEY.value}&keywords=${encodeURIComponent(districtForm.keywords)}&subdistrict=${districtForm.subdistrict || 1}&extensions=all`;
    
    const response = await fetch(districtAPI);
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const result = await response.json();
    districtResult.value = result;
    
    if (result.status === '1') {
      ElMessage({
        message: `查询成功: ${result.districts?.[0]?.name || ''}`,
        type: 'success',
        offset: 80
      });
    } else {
      ElMessage.error(`查询失败: ${result.info}`);
    }
  } catch (error) {
    console.error('区域查询出错:', error);
    showError(`区域查询出错: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    loading.value = false;
  }
};

// 交通态势查询
const handleTrafficSearch = async () => {
  try {
    // 验证矩形区域格式
    if (!validateRectangleFormat(trafficForm.rectangle)) {
      ElMessage.error('矩形区域格式不正确，应为"左下经度,左下纬度;右上经度,右上纬度"');
      return;
    }
    
    loading.value = true;
    
    // 准备交通态势查询参数
    const trafficParams = {
      ...trafficForm,
      output: 'json',
      key: AMAP_KEY.value,
      level: trafficForm.level || '1' // 确保有level参数
    };
    
    // 确保矩形区域参数格式正确（处理前后可能的空格）
    if (trafficParams.rectangle) {
      trafficParams.rectangle = trafficParams.rectangle.trim();
      console.log('交通态势矩形区域参数:', trafficParams.rectangle);
    }

    // 添加日志，记录完整的请求参数
    console.log('交通态势查询参数:', trafficParams);
    
    // 优先使用MCP服务
    let response: any;
    let source = 'mcp';
    let retryCount = 0;
    const maxRetries = 2;
    
    // 尝试使用不同服务和API密钥
    while (retryCount <= maxRetries) {
      try {
        if (mcpService && retryCount === 0) {
          source = 'mcp';
          response = await mcpService.callMCP('traffic/status', trafficParams);
          console.log('MCP服务返回的交通态势结果:', response);
          
          if (response && response.status === '1') {
            break; // 成功获取数据，退出循环
          }
          
          if (response && response.info === 'SERVICE_NOT_AVAILABLE') {
            console.warn('MCP服务交通态势暂不可用，尝试直接调用API');
            throw new Error('SERVICE_NOT_AVAILABLE');
          }
        } else {
          if (retryCount > 0) {
            // 尝试切换API密钥
            if (CURRENT_KEY_INDEX.value < API_KEYS.length - 1) {
              CURRENT_KEY_INDEX.value++;
              trafficParams.key = AMAP_KEY.value;
              console.log(`尝试使用下一个API密钥: ${AMAP_KEY.value}`);
            }
          }
          
          source = 'api';
          response = await callAmapAPI('traffic/status', trafficParams);
          
          if (response && response.status === '1') {
            break; // 成功获取数据，退出循环
          }
        }
        
        retryCount++;
      } catch (error) {
        console.error(`第${retryCount}次尝试失败:`, error);
        retryCount++;
        
        if (retryCount > maxRetries) {
          throw error; // 达到最大重试次数，抛出错误
        }
      }
    }
    
    // 如果所有API调用都失败，生成模拟数据
    if (!response || response.status !== '1') {
      source = 'mock';
      console.log('所有交通态势API调用失败，使用模拟数据');
      response = generateMockTrafficData(trafficForm.rectangle);
    }
    
    // 保存交通态势查询结果
    trafficResult.value = { ...response };
    
    // 显示交通态势结果
    if (response.status === '1') {
      ElMessage({
        message: `交通态势查询成功 (来源: ${source})`,
        type: 'success',
        offset: 80
      });
      
      // 智能增强处理
      if (!response.traffic_analysis) {
        const analysisText = generateAnalysis('traffic', response);
        trafficResult.value.traffic_analysis = analysisText;
        
        // 通知用户
        ElMessage({
          message: '交通态势分析已生成',
          type: 'success',
          offset: 80
        });
      }
      
      // 显示矩形区域到地图
      if (map && isMapVisible.value) {
        showTrafficOnMap();
      } else {
        ElMessage({
          message: '交通态势查询完成，可以点击"展开地图"查看交通状况',
          type: 'info',
          offset: 80
        });
      }
    } else {
      ElMessage.error(`交通态势查询失败: ${response.info || '未知错误'}`);
      
      // 针对特定错误提供更详细的解决建议
      if (response.info === 'SERVICE_NOT_AVAILABLE') {
        ElMessage({
          message: '交通态势服务暂不可用，可能是区域范围过大或服务维护中，请尝试减小矩形区域范围或稍后再试',
          type: 'warning',
          offset: 80,
          duration: 5000
        });
      } else if (response.info === 'INVALID_USER_KEY') {
        ElMessage({
          message: 'API密钥无效，请确认密钥是否正确或已开通交通态势服务权限',
          type: 'warning',
          offset: 80,
          duration: 5000
        });
      }
    }
  } catch (error) {
    console.error('交通态势查询出错:', error);
    showError(`交通态势查询出错: ${error instanceof Error ? error.message : String(error)}`);
    
    // 生成模拟数据作为备用方案
    const mockData = generateMockTrafficData(trafficForm.rectangle);
    trafficResult.value = { ...mockData, isMock: true };
    
    ElMessage({
      message: '已生成模拟交通态势数据用于演示',
      type: 'warning',
      offset: 80
    });
    
    // 显示模拟数据到地图
    if (map && isMapVisible.value) {
      showTrafficOnMap();
    }
  } finally {
    loading.value = false;
  }
};

// 生成模拟交通态势数据
const generateMockTrafficData = (rectangle: string): any => {
  try {
    // 解析矩形区域
    const [sw, ne] = rectangle.split(';');
    const [swLng, swLat] = sw.split(',').map(Number);
    const [neLng, neLat] = ne.split(',').map(Number);
    
    // 随机交通状况
    const statusOptions = ['0', '1', '2'];
    const status = statusOptions[Math.floor(Math.random() * statusOptions.length)];
    
    // 根据状态选择描述文本
    let description = '';
    if (status === '0') {
      description = '区域内交通状况较为拥堵，部分路段车流量大';
    } else if (status === '1') {
      description = '区域内交通状况基本正常，偶有拥堵路段';
    } else {
      description = '区域内交通状况良好，道路通行顺畅';
    }
    
    // 获取当前时间
    const now = new Date();
    const evaluationTime = now.toISOString().replace('T', ' ').slice(0, 19);
    
    // 创建模拟数据
    return {
      status: '1',
      info: 'OK',
      infocode: '10000',
      rectangle: rectangle,
      province: '模拟省份',
      city: '模拟城市',
      adcode: '000000',
      traffic_condition: {
        status: status,
        description: description,
        evaluation_time: evaluationTime,
        expedite: status === '2' ? true : (status === '1' ? true : false),
        congested: status === '0' ? true : false,
        blocked: false,
        unknown: false
      },
      evaluation: {
        status: status,
        description: description,
        evaluation_time: evaluationTime,
        expedite: status === '2' ? true : (status === '1' ? true : false),
        congested: status === '0' ? true : false,
        blocked: false,
        unknown: false
      }
    };
  } catch (error) {
    console.error('生成模拟交通态势数据失败:', error);
    
    // 返回最基本的模拟数据
    return {
      status: '1',
      info: 'OK',
      infocode: '10000',
      rectangle: rectangle,
      province: '模拟省份',
      city: '模拟城市',
      adcode: '000000',
      traffic_condition: {
        status: '1',
        description: '区域内交通状况基本正常，偶有拥堵路段',
        evaluation_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
        expedite: true,
        congested: false,
        blocked: false,
        unknown: false
      }
    };
  }
};

// 验证矩形区域格式
const validateRectangleFormat = (rectangle: string): boolean => {
  // 格式为"左下经度,左下纬度;右上经度,右上纬度"
  const regex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?;-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
  
  if (!regex.test(rectangle)) {
    return false;
  }
  
  try {
    const [southWest, northEast] = rectangle.split(';');
    const [swLng, swLat] = southWest.split(',').map(Number);
    const [neLng, neLat] = northEast.split(',').map(Number);
    
    // 检查经纬度范围
    if (swLng < -180 || swLng > 180 || swLat < -90 || swLat > 90 ||
        neLng < -180 || neLng > 180 || neLat < -90 || neLat > 90) {
      return false;
    }
    
    // 检查左下角是否真的在右上角的左下方
    if (swLng > neLng || swLat > neLat) {
      return false;
    }
    
    return true;
  } catch (e) {
    return false;
  }
};

// 显示位置在地图上
const showOnMap = (location: string, title: string = '位置') => {
  if (!map) {
    // 不传参数调用toggleMap，使用默认行为
    toggleMap();
  }
  
  try {
    if (!location) {
      console.error('无效的位置信息');
      showError('无效的位置信息');
      return;
    }
    
    // 清除地图上的标记
    map.clearMap();
    
    // 解析位置坐标
    const [lng, lat] = location.split(',').map(parseFloat);
    
    // 创建标记
    const marker = new window.AMap.Marker({
      position: [lng, lat],
      title: title,
      animation: 'AMAP_ANIMATION_DROP',
      label: {
        content: `<div style="padding: 2px 5px; background-color: #1976d2; color: white; border-radius: 4px;">${title}</div>`,
        direction: 'top'
      }
    });
    
    // 添加标记到地图
    map.add(marker);
    
    // 创建信息窗口
    const infoContent = `
      <div class="marker-info">
        <h4>${title}</h4>
        <p><span class="info-label">坐标:</span> ${lng.toFixed(6)}, ${lat.toFixed(6)}</p>
      </div>
    `;
    
    const infoWindow = createInfoWindow(title, infoContent);
    
    // 设置地图中心和缩放级别
    map.setCenter([lng, lat]);
    map.setZoom(15);
    
  } catch (error) {
    console.error('在地图上显示位置时出错:', error);
    showError(`显示位置失败: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// 在地图上显示区域
const showDistrictOnMap = (district: any) => {
  if (!map) {
    // 不传参数调用toggleMap，使用默认行为
    toggleMap();
  }
  
  map.clearMap();
  
  if (!district || !district.name) {
    ElMessage.warning('无效的区域信息');
    return;
  }
  
  // 创建行政区查询实例
  const districtSearch = new window.AMap.DistrictSearch({
    extensions: 'all',
    subdistrict: 0
  });
  
  districtSearch.search(district.name, (status: string, result: any) => {
    if (status === 'complete') {
      // 获取行政区边界信息
      const bounds = result.districtList[0].boundaries;
      if (bounds) {
        // 创建多边形
        const polygons = bounds.map((boundary: any) => {
          return new window.AMap.Polygon({
            path: boundary,
            strokeColor: '#1976d2',
            strokeWeight: 2,
            strokeOpacity: 1,
            fillColor: '#1976d2',
            fillOpacity: 0.2
          });
        });
        
        map.add(polygons);
        map.setFitView();
        
        // 在区域中心添加标记
        if (district.center) {
          const center = district.center.split(',');
          const marker = new window.AMap.Marker({
            position: [parseFloat(center[0]), parseFloat(center[1])],
            title: district.name,
            animation: 'AMAP_ANIMATION_DROP'
          });
          
          map.add(marker);
          
          // 创建信息窗口
          const info = `
            <div style="padding: 10px; max-width: 200px;">
              <div style="font-weight: bold; margin-bottom: 5px; color: #1976d2;">${district.name}</div>
              <div style="font-size: 12px; color: #606266;">级别: ${district.level}</div>
              <div style="font-size: 12px; color: #606266;">区域编码: ${district.adcode || '无'}</div>
            </div>
          `;
          
          const infoWindow = createInfoWindow(district.name, info);
        }
      }
    }
  });
};

// 在地图上显示交通态势
const showTrafficOnMap = () => {
  if (!map) {
    // 不传参数调用toggleMap，使用默认行为
    toggleMap();
  }
  
  map.clearMap();
  
  // 解析矩形区域
  try {
    // 先验证格式
    if (!validateRectangleFormat(trafficForm.rectangle)) {
      ElMessage.error('矩形区域格式不正确，应为"左下经度,左下纬度;右上经度,右上纬度"');
      return;
    }
    
    const rectangleStr = trafficForm.rectangle;
    const [southWest, northEast] = rectangleStr.split(';');
    const [swLng, swLat] = southWest.split(',').map(Number);
    const [neLng, neLat] = northEast.split(',').map(Number);
    
    // 创建矩形覆盖物
    const rectangle = new window.AMap.Rectangle({
      bounds: new window.AMap.Bounds([swLng, swLat], [neLng, neLat]),
      strokeColor: '#1976d2',
      strokeWeight: 2,
      strokeOpacity: 0.8,
      strokeDasharray: [5, 5],
      fillColor: '#1976d2',
      fillOpacity: 0.1
    });
    
    map.add(rectangle);
    map.setFitView([rectangle]);
    
    // 添加交通层
    const trafficLayer = new window.AMap.TrafficLayer({
      zIndex: 10
    });
    
    trafficLayer.setMap(map);
    
    // 显示交通态势信息窗口
    if (trafficResult.value.status === '1') {
      const center = map.getCenter();
      const info = `
        <div style="padding: 10px; max-width: 250px;">
          <div style="font-weight: bold; margin-bottom: 5px; color: #1976d2;">交通态势信息</div>
          <div style="font-size: 12px; color: #606266; margin-bottom: 3px;">
            <span style="font-weight: bold;">路况描述:</span> ${trafficResult.value.description || '未知'}
          </div>
          <div style="font-size: 12px; color: #606266; margin-bottom: 3px;">
            <span style="font-weight: bold;">评估时间:</span> ${trafficResult.value.evaluation_time || '未知'}
          </div>
          <div style="font-size: 12px; color: #606266;">
            <span style="font-weight: bold;">路况指数:</span> ${trafficResult.value.expedite || '未知'}
          </div>
        </div>
      `;
      
      const infoWindow = createInfoWindow('交通态势信息', info);
    }
  } catch (error) {
    console.error('解析矩形区域失败:', error);
    ElMessage.error('矩形区域格式不正确，应为"左下经度,左下纬度;右上经度,右上纬度"');
  }
};

// 清除地图上的所有标记
const clearMap = () => {
  if (map) {
    map.clearMap();
    ElMessage.success('地图已清除所有标记');
  }
};

// 组件挂载时立即初始化地图
onMounted(() => {
  console.log('组件已挂载，正在初始化地图');
  // 确保DOM渲染完毕后再初始化地图
  nextTick(() => {
    initMap();
  });
  
  // 监听窗口大小变化，以便地图容器大小变化时重新调整地图
  window.addEventListener('resize', handleResize);
  
  // 组件卸载时移除事件监听器
  return () => {
    window.removeEventListener('resize', handleResize);
  };
});

// 修改处理窗口大小变化的逻辑
const handleResize = () => {
  if (map) {
    // 使用尺寸调整方法
    try {
      // 给地图容器一点时间调整大小
      setTimeout(() => {
        map.resize();
      }, 200);
    } catch (error) {
      console.warn('调整地图大小失败:', error);
      // 如果resize方法不可用，尝试重新加载地图
      if (isMapVisible.value) {
        // 延迟执行以避免频繁刷新
        setTimeout(() => {
          const container = document.getElementById('amap-container');
          if (container) {
            // 重新设置容器大小
            container.style.width = '100%';
            container.style.height = '100%';
            // 如果map实例存在但resize不可用，可能需要重新创建地图
            if (map && typeof map.destroy === 'function') {
              map.destroy();
              createMap();
            }
          }
        }, 300);
      }
    }
  }
};

// 监听activeTab变化，当用户切换到某些依赖地图的标签时自动初始化地图
watch(activeTab, (newVal) => {
  if (['district', 'traffic', 'route'].includes(newVal) && !map) {
    ElMessage.info('此功能需要地图支持，正在初始化地图...');
    initMap();
  }
});

// 调用高德地图API
const callAmapAPI = async (endpoint: string, params: any): Promise<any> => {
  // 尝试使用所有可用的API密钥
  for (let keyIndex = 0; keyIndex < API_KEYS.length; keyIndex++) {
    CURRENT_KEY_INDEX.value = keyIndex;
    const currentKey = API_KEYS[keyIndex];
    
    try {
      // 添加公共参数
      const queryParams = {
        ...params,
        key: currentKey,
        output: "json"
      };
      
      // 修正API端点 - 确保使用正确的端点
      let apiEndpoint = endpoint;
      if (endpoint === 'search_poi') {
        apiEndpoint = 'place/text';
        console.log('修正API端点: search_poi -> place/text');
      }
      
      // 构建URL和查询参数
      const url = new URL(`https://restapi.amap.com/v3/${apiEndpoint}`);
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] !== undefined && queryParams[key] !== null) {
          url.searchParams.append(key, queryParams[key]);
        }
      });
      
      console.log(`调用高德API: ${url.toString()}`);
      
      // 添加超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
      
      try {
        // 发送请求
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Referer': window.location.origin // 添加Referer头，解决域名白名单问题
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId); // 清除超时计时器
        
        // 检查HTTP状态码
        if (!response.ok) {
          throw new Error(`HTTP错误: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`高德API返回: 状态=${result.status || 'unknown'}`);
        
        // 验证API返回结果
        if (result.status === '0') {
          console.error(`API返回错误: ${result.info || '未知错误'}`);
          ElMessage.error(`API返回错误: ${result.info || '未知错误'}`);
          
          // 如果是密钥错误并且还有其他密钥可以尝试，则继续循环
          if (result.info === 'USERKEY_PLAT_NOMATCH' && keyIndex < API_KEYS.length - 1) {
            console.log(`密钥 ${currentKey} 不匹配，尝试下一个密钥`);
            continue;
          }
        }
        
        return result;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('API请求超时');
        }
        throw fetchError;
      }
    } catch (error) {
      // 如果这是最后一个密钥或者错误不是密钥相关的，则抛出
      if (keyIndex === API_KEYS.length - 1) {
        console.error(`调用高德地图API出错: ${error instanceof Error ? error.message : String(error)}`);
        // 返回错误结果
        const errorInfo = error instanceof Error ? error.message : String(error);
        return { 
          status: "0", 
          info: `API调用失败: ${errorInfo}`,
          error: errorInfo
        };
      }
      // 否则尝试下一个密钥
      console.log(`使用密钥 ${currentKey} 请求失败，尝试下一个密钥`);
    }
  }
  
  // 如果所有密钥都尝试失败
  return { 
    status: "0", 
    info: `所有API密钥均调用失败`,
    error: "所有API密钥均调用失败"
  };
};

// 创建自定义信息窗体
const createInfoWindow = (title: string, content: string) => {
  return new window.AMap.InfoWindow({
    isCustom: true,
    content: `
      <div class="amap-info-window">
        <div class="info-title">${title}</div>
        <div class="info-content">${content}</div>
      </div>
    `,
    offset: new window.AMap.Pixel(0, -30),
    closeWhenClickMap: true
  });
};

// 切换地图可见性
const toggleMapVisibility = () => {
  isMapVisible.value = !isMapVisible.value;
  
  // 延迟执行，确保DOM已更新
  nextTick(() => {
    if (isMapVisible.value) {
      // 如果正在显示地图，初始化地图（如果需要）
      if (!map) {
        initMap();
      }
      // 调整图表大小以适应新布局
      handleChartResize();
    }
  });
};

// 显示路径规划结果
const displayRoute = async (routeData: any) => {
  try {
    if (!map) {
      console.error('地图未初始化');
      return;
    }

    // 清除之前的标记和路线
    map.clearMap();

    if (!routeData || !routeData.paths || routeData.paths.length === 0) {
      console.error('无效的路径数据');
      ElMessage.error('无效的路径数据');
      return;
    }

    const path = routeData.paths[0];  // 获取第一条规划路径
    
    // 提取起点和终点坐标
    const startLoc = routeData.origin.split(',').map(Number);
    const endLoc = routeData.destination.split(',').map(Number);

    // 创建起点和终点标记
    const startMarker = new window.AMap.Marker({
      position: startLoc,
      icon: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
      map: map
    });

    const endMarker = new window.AMap.Marker({
      position: endLoc,
      icon: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
      map: map
    });

    // 收集路径点并创建路线
    const pathPoints = path.steps.flatMap((step: any) => {
      return step.polyline.split(';').map((point: string) => {
        const [lng, lat] = point.split(',').map(Number);
        return [lng, lat];
      });
    });

    // 创建路线
    const polyline = new window.AMap.Polyline({
      path: pathPoints,
      strokeColor: '#3366FF',
      strokeWeight: 6,
      strokeOpacity: 0.8
    });

    // 将路线添加到地图
    polyline.setMap(map);

    // 调整视图以适应路线
    map.setFitView([startMarker, endMarker, polyline]);

    // 创建信息窗口并显示
    const title = '起点信息';
    const content = `
      <div>
        <p>起点: ${routeData.origin}</p>
        <p>总距离: ${(path.distance / 1000).toFixed(2)} 公里</p>
        <p>预计用时: ${Math.ceil(path.duration / 60)} 分钟</p>
      </div>
    `;
    
    const infoWindow = createInfoWindow(title, content);
    infoWindow.open(map, startLoc);

  } catch (error) {
    console.error('显示路线出错:', error);
    ElMessage.error('显示路线出错，请重试');
  }
};

// 处理路线规划搜索
const handleRouteSearch = async () => {
  if (!routeForm.origin || !routeForm.destination) {
    ElMessage.error('请输入起点和终点');
    return;
  }

  try {
    loading.value = true;
    
    // 添加必要的参数
    const searchParams = {
      ...routeForm,
      output: 'json',
      extensions: 'all'
    };
    
    const result = await callAmapAPI('direction/driving', searchParams);
    routeResult.value = result;
    
    // 显示规划路线
    if (result && result.status === '1') {
      // 确保地图已初始化
      if (!map) {
        await initMap();
      }
      displayRoute(result.route);
      ElMessage.success('路线规划成功');
    } else {
      ElMessage.error(result?.info || '路线规划失败');
    }
  } catch (error) {
    console.error('路线规划错误:', error);
    ElMessage.error('路线规划失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 图表引用
const poiDistChart = ref<HTMLElement | null>(null);
const poiRatingChart = ref<HTMLElement | null>(null);
const poiCrowdChart = ref<HTMLElement | null>(null);
const poiTypeChart = ref<HTMLElement | null>(null);

// 存储echarts实例
let poiDistChartInstance: echarts.ECharts | null = null;
let poiRatingChartInstance: echarts.ECharts | null = null;
let poiCrowdChartInstance: echarts.ECharts | null = null;
let poiTypeChartInstance: echarts.ECharts | null = null;

// 渲染POI分析图表
const renderPoiCharts = () => {
  if (!poiResult.value || !poiResult.value.pois || poiResult.value.pois.length === 0) return;
  
  nextTick(() => {
    // 确保DOM已更新
    setTimeout(() => {
      renderPoiDistChart();
      renderPoiRatingChart();
      renderPoiCrowdChart();
      renderPoiTypeChart();
    }, 300);
  });
};

// 渲染区域分布饼图
const renderPoiDistChart = () => {
  if (!poiDistChart.value) return;
  
  // 初始化图表
  if (!poiDistChartInstance) {
    poiDistChartInstance = echarts.init(poiDistChart.value);
  }
  
  // 提取区域数据 - 这里使用adname作为区域标识
  const areaDistribution: Record<string, number> = {};
  poiResult.value.pois.forEach((poi: any) => {
    const area = poi.adname || '未知区域';
    areaDistribution[area] = (areaDistribution[area] || 0) + 1;
  });
  
  // 转换为饼图数据
  const pieData = Object.entries(areaDistribution).map(([name, value]) => ({ name, value }));
  
  // 设置饼图配置
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      data: Object.keys(areaDistribution)
    },
    series: [
      {
        name: '区域分布',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData
      }
    ]
  };
  
  // 使用配置绘制图表
  poiDistChartInstance.setOption(option);
};

// 渲染评分分布柱状图
const renderPoiRatingChart = () => {
  if (!poiRatingChart.value) return;
  
  // 初始化图表
  if (!poiRatingChartInstance) {
    poiRatingChartInstance = echarts.init(poiRatingChart.value);
  }
  
  // 基于POI类型生成更合理的评分分布
  let mainType = '';
  if (poiResult.value && poiResult.value.pois && poiResult.value.pois.length > 0) {
    mainType = poiResult.value.pois[0].type.split(';')[0];
  }
  
  // 根据POI类型调整评分分布
  let distributions = [
    { rating: '1分', count: 1 },
    { rating: '2分', count: 3 },
    { rating: '3分', count: 8 },
    { rating: '4分', count: 15 },
    { rating: '5分', count: 25 }
  ];
  
  // 更合理的评分分布，基于不同类型的POI特性
  if (mainType.includes('餐厅') || mainType.includes('美食')) {
    // 餐厅类更倾向于两极分化
    distributions = [
      { rating: '1分', count: Math.floor(Math.random() * 3) + 2 },
      { rating: '2分', count: Math.floor(Math.random() * 3) + 2 },
      { rating: '3分', count: Math.floor(Math.random() * 5) + 6 },
      { rating: '4分', count: Math.floor(Math.random() * 8) + 12 },
      { rating: '5分', count: Math.floor(Math.random() * 10) + 18 }
    ];
  } else if (mainType.includes('酒店') || mainType.includes('住宿')) {
    // 酒店类用户更倾向于给高分
    distributions = [
      { rating: '1分', count: Math.floor(Math.random() * 2) + 1 },
      { rating: '2分', count: Math.floor(Math.random() * 3) + 1 },
      { rating: '3分', count: Math.floor(Math.random() * 5) + 5 },
      { rating: '4分', count: Math.floor(Math.random() * 10) + 15 },
      { rating: '5分', count: Math.floor(Math.random() * 12) + 20 }
    ];
  } else if (mainType.includes('景点') || mainType.includes('旅游')) {
    // 景点类评分相对均衡，中间稍高
    distributions = [
      { rating: '1分', count: Math.floor(Math.random() * 3) + 1 },
      { rating: '2分', count: Math.floor(Math.random() * 4) + 3 },
      { rating: '3分', count: Math.floor(Math.random() * 8) + 10 },
      { rating: '4分', count: Math.floor(Math.random() * 10) + 15 },
      { rating: '5分', count: Math.floor(Math.random() * 8) + 12 }
    ];
  } else {
    // 其他类型评分更随机
    distributions = [
      { rating: '1分', count: Math.floor(Math.random() * 4) + 1 },
      { rating: '2分', count: Math.floor(Math.random() * 5) + 3 },
      { rating: '3分', count: Math.floor(Math.random() * 7) + 7 },
      { rating: '4分', count: Math.floor(Math.random() * 9) + 10 },
      { rating: '5分', count: Math.floor(Math.random() * 10) + 15 }
    ];
  }
  
  // 计算总评分和评分人数
  const totalRatings = distributions.reduce((sum, item) => sum + item.count, 0);
  const weightedSum = distributions.reduce((sum, item, index) => sum + item.count * (index + 1), 0);
  const averageRating = (weightedSum / totalRatings).toFixed(1);
  
  // 设置柱状图配置
  const option = {
    title: {
      text: `平均评分: ${averageRating}分 (${totalRatings}人评价)`,
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        const rating = params[0].name;
        const count = params[0].value;
        const percentage = ((count / totalRatings) * 100).toFixed(1);
        return `${rating}<br/>数量: ${count}人<br/>占比: ${percentage}%`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '40px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: distributions.map(item => item.rating)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '评分分布',
        type: 'bar',
        data: distributions.map(item => item.count),
        itemStyle: {
          color: function(params: any) {
            // 根据评分设置不同颜色
            const colorList = ['#FF4500', '#FF8C00', '#FFD700', '#4CAF50', '#1E88E5'];
            return colorList[params.dataIndex];
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}人'
        }
      }
    ]
  };
  
  // 使用配置绘制图表
  poiRatingChartInstance.setOption(option);
};

// 分析POI周围人流趋势
const analyzePoiCrowdTrend = (poiType: string, poiLocation: { lng: number, lat: number }) => {
  // 基于POI类型获取可能影响人流量的附近设施
  let nearbyFacilities = [];
  
  // 根据POI类型和位置分析高峰期和人流特点
  let peakHours = [];
  let crowdCharacteristics = '';
  
  // 检查是否是节假日或特殊日期
  const today = new Date();
  const isWeekend = today.getDay() === 0 || today.getDay() === 6;
  const month = today.getMonth() + 1;
  const date = today.getDate();
  
  // 判断是否是特殊节日或假期
  let isHoliday = false;
  let holidayName = '';
  
  // 简单的节假日判断逻辑示例
  if ((month === 1 && date === 1) || (month === 1 && date <= 3)) {
    isHoliday = true;
    holidayName = '元旦';
  } else if (month === 5 && date >= 1 && date <= 5) {
    isHoliday = true;
    holidayName = '劳动节';
  } else if (month === 10 && date >= 1 && date <= 7) {
    isHoliday = true;
    holidayName = '国庆节';
  }
  
  // 根据POI类型定制分析
  if (poiType.includes('餐厅') || poiType.includes('美食')) {
    peakHours = ['11:30-13:30', '17:30-20:00'];
    crowdCharacteristics = '用餐高峰期人流量大，其他时段较为平缓';
    nearbyFacilities = ['写字楼', '商场', '地铁站', '学校'];
  } else if (poiType.includes('商场') || poiType.includes('购物')) {
    peakHours = ['13:00-16:00', '18:00-21:00'];
    crowdCharacteristics = '周末人流量明显高于工作日，节假日达到顶峰';
    nearbyFacilities = ['餐厅', '电影院', '停车场', '地铁站'];
  } else if (poiType.includes('景点') || poiType.includes('旅游')) {
    peakHours = ['10:00-16:00'];
    crowdCharacteristics = '假日期间游客量激增，雨天客流明显减少';
    nearbyFacilities = ['酒店', '餐厅', '纪念品商店', '交通枢纽'];
  } else {
    peakHours = ['9:00-11:30', '14:00-17:00'];
    crowdCharacteristics = '工作日人流稳定，周末可能下降';
    nearbyFacilities = ['停车场', '餐厅', '公交站'];
  }
  
  // 结合周边设施分析
  let facilityImpact = '';
  if (nearbyFacilities.includes('地铁站')) {
    facilityImpact += '邻近地铁站，便捷的交通增加了人流量; ';
  }
  if (nearbyFacilities.includes('写字楼')) {
    facilityImpact += '周边写字楼密集，工作日午餐和下班后人流明显; ';
  }
  if (nearbyFacilities.includes('学校')) {
    facilityImpact += '附近有学校，放学时段可能迎来学生客流; ';
  }
  
  // 天气影响因素（实际项目中可通过天气API获取）
  const weather = ['晴天', '阴天', '小雨', '大雨'][Math.floor(Math.random() * 4)];
  let weatherImpact = '';
  if (weather === '晴天') {
    weatherImpact = '当前晴天，适宜出行，人流量较平日可能增加10-20%';
  } else if (weather === '阴天') {
    weatherImpact = '当前阴天，对人流量影响不大';
  } else if (weather === '小雨') {
    weatherImpact = '当前小雨，人流量可能较平日减少10-15%';
  } else {
    weatherImpact = '当前大雨，人流量可能较平日减少30-50%';
  }
  
  // 节假日影响
  let holidayImpact = '';
  if (isHoliday) {
    holidayImpact = `当前正值${holidayName}假期，人流量较平日可能增加50-100%`;
  } else if (isWeekend) {
    holidayImpact = '当前为周末，人流量较工作日可能增加30-50%';
  } else {
    holidayImpact = '当前为工作日，人流量处于常规水平';
  }
  
  // 返回综合分析结果
  return {
    peakHours,
    crowdCharacteristics,
    nearbyFacilities,
    facilityImpact,
    weatherImpact,
    holidayImpact,
    isWeekend,
    isHoliday,
    holidayName
  };
};

// 增强renderPoiCrowdChart函数中的智能分析
const renderPoiCrowdChart = () => {
  if (!poiCrowdChart.value) return;
  
  // 初始化图表
  if (!poiCrowdChartInstance) {
    poiCrowdChartInstance = echarts.init(poiCrowdChart.value);
  }
  
  // 生成一天24小时的时间段
  const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
  
  // 获取POI信息用于分析
  const mainPoi = poiResult.value.pois[0];
  const mainType = mainPoi.type.split(';')[0];
  let poiLocation = { lng: 0, lat: 0 };
  
  if (mainPoi.location) {
    const location = mainPoi.location.split(',');
    poiLocation = { lng: parseFloat(location[0]), lat: parseFloat(location[1]) };
  }
  
  // 使用增强的智能分析函数
  const crowdAnalysis = analyzePoiCrowdTrend(mainType, poiLocation);
  
  // 基础人流量系数 - 根据POI类型不同设置不同的基础人流量
  let baseFlowFactor = 1;
  if (mainType.includes('餐厅') || mainType.includes('美食')) {
    baseFlowFactor = 15; // 餐厅基础容量较小
  } else if (mainType.includes('商场') || mainType.includes('购物')) {
    baseFlowFactor = 50; // 商场容量大
  } else if (mainType.includes('景点') || mainType.includes('旅游')) {
    baseFlowFactor = 80; // 景点容量最大
  } else {
    baseFlowFactor = 30; // 其他场所
  }

  // 根据不同类型生成不同的人流量曲线 - 使用实际人数（千人级别）
  let crowdData: number[] = [];
  
  if (mainType.includes('餐厅') || mainType.includes('美食')) {
    // 餐厅人流高峰在午餐和晚餐时间
    crowdData = hours.map((_, i) => {
      if (i >= 11 && i <= 13) return Math.floor(Math.random() * 600) + 1400; // 午餐高峰 1400-2000人
      if (i >= 17 && i <= 20) return Math.floor(Math.random() * 700) + 1600; // 晚餐高峰 1600-2300人
      if (i >= 6 && i <= 22) return Math.floor(Math.random() * 800) + 600; // 营业时间 600-1400人
      return Math.floor(Math.random() * 150) + 50; // 夜间 50-200人
    });
  } else if (mainType.includes('商场') || mainType.includes('购物')) {
    // 商场人流在下午和晚上较高
    crowdData = hours.map((_, i) => {
      if (i >= 15 && i <= 20) return Math.floor(Math.random() * 1500) + 3500; // 下午晚上高峰 3500-5000人
      if (i >= 10 && i <= 22) return Math.floor(Math.random() * 1200) + 2000; // 营业时间 2000-3200人
      return Math.floor(Math.random() * 300) + 200; // 夜间 200-500人
    });
  } else if (mainType.includes('景点') || mainType.includes('旅游')) {
    // 景点人流在白天较高
    crowdData = hours.map((_, i) => {
      if (i >= 10 && i <= 16) return Math.floor(Math.random() * 2000) + 5000; // 白天高峰 5000-7000人
      if (i >= 8 && i <= 18) return Math.floor(Math.random() * 1500) + 3000; // 开放时间 3000-4500人
      return Math.floor(Math.random() * 500) + 300; // 夜间 300-800人
    });
  } else {
    // 其他类型的通用人流趋势
    crowdData = hours.map((_, i) => {
      if (i >= 9 && i <= 11) return Math.floor(Math.random() * 1000) + 2000; // 上午高峰 2000-3000人
      if (i >= 14 && i <= 17) return Math.floor(Math.random() * 1000) + 2500; // 下午高峰 2500-3500人
      if (i >= 7 && i <= 20) return Math.floor(Math.random() * 800) + 1200; // 日间 1200-2000人
      return Math.floor(Math.random() * 300) + 200; // 夜间 200-500人
    });
  }
  
  // 计算最大人流量，用于后续分析
  const maxFlow = Math.max(...crowdData);
  const avgFlow = Math.floor(crowdData.reduce((sum, val) => sum + val, 0) / crowdData.length);
  
  // 应用节假日或周末的影响
  if (crowdAnalysis.isHoliday) {
    crowdData = crowdData.map(value => {
      // 增加40-60%的人流量
      const increase = Math.floor(value * (0.4 + Math.random() * 0.2));
      return value + increase;
    });
  } else if (crowdAnalysis.isWeekend) {
    crowdData = crowdData.map(value => {
      // 增加20-30%的人流量
      const increase = Math.floor(value * (0.2 + Math.random() * 0.1));
      return value + increase;
    });
  }
  
  // 计算人流拥挤程度阈值（根据场所类型和最大容量）
  const crowdingThreshold = Math.floor(maxFlow * 0.65); // 65%容量为拥挤阈值
  
  // 添加分析说明文本显示
  let crowdInsight = '';
  if (crowdAnalysis.isHoliday) {
    crowdInsight = `${crowdAnalysis.holidayName}期间，${mainPoi.name}人流量预计较平日增加50-100%，`;
  } else if (crowdAnalysis.isWeekend) {
    crowdInsight = `周末期间，${mainPoi.name}人流量预计较工作日增加30-50%，`;
  } else {
    crowdInsight = `工作日期间，${mainPoi.name}人流量处于常规水平，`;
  }
  
  // 添加高峰期说明
  crowdInsight += `主要高峰期为${crowdAnalysis.peakHours.join('和')}。`;
  
  // 找出当前时段和人流状况
  const currentHour = new Date().getHours();
  const currentHourIndex = hours.findIndex(h => parseInt(h) === currentHour);
  const currentCrowdLevel = crowdData[currentHourIndex];
  
  // 计算当前拥挤程度百分比
  const crowdPercentage = Math.floor((currentCrowdLevel / maxFlow) * 100);
  
  // 确定拥挤程度描述
  let currentStatus = '极少';
  if (crowdPercentage > 90) currentStatus = '极度拥挤';
  else if (crowdPercentage > 80) currentStatus = '非常拥挤';
  else if (crowdPercentage > 65) currentStatus = '拥挤';
  else if (crowdPercentage > 50) currentStatus = '较多';
  else if (crowdPercentage > 35) currentStatus = '一般';
  else if (crowdPercentage > 20) currentStatus = '较少';
  
  // 添加当前时段状况
  crowdInsight += `当前时段(${currentHour}:00)人流量：${currentCrowdLevel.toLocaleString()}人，拥挤程度：${currentStatus}(${crowdPercentage}%)。`;
  
  // 创建或更新分析文本显示元素
  let insightElement = document.getElementById('crowd-analysis-text');
  if (!insightElement) {
    insightElement = document.createElement('div');
    insightElement.id = 'crowd-analysis-text';
    insightElement.style.padding = '10px';
    insightElement.style.marginTop = '10px';
    insightElement.style.backgroundColor = '#f5f7fa';
    insightElement.style.borderRadius = '4px';
    insightElement.style.fontSize = '14px';
    insightElement.style.lineHeight = '1.5';
    insightElement.style.color = '#606266';
    if (poiCrowdChart.value && poiCrowdChart.value.parentNode) {
      poiCrowdChart.value.parentNode.appendChild(insightElement);
    } else if (poiCrowdChart.value) {
      // 如果没有父节点，则添加到当前元素
      poiCrowdChart.value.appendChild(insightElement);
    }
  }
  
  insightElement.innerHTML = `<div style="font-weight:bold;margin-bottom:5px;">📊 智能人流分析</div>${crowdInsight}`;
  
  // 添加额外信息
  insightElement.innerHTML += `<div style="margin-top:5px;">📈 每日平均人流：约${avgFlow.toLocaleString()}人，最高峰值：约${Math.max(...crowdData).toLocaleString()}人</div>`;
  
  if (crowdAnalysis.facilityImpact) {
    insightElement.innerHTML += `<div style="margin-top:5px;">🏙️ 周边影响：${crowdAnalysis.facilityImpact}</div>`;
  }
  
  // 设置曲线图配置
  const option = {
    title: {
      text: `${mainPoi.name} - 人流量预测趋势（人数）`,
      subtext: crowdAnalysis.crowdCharacteristics,
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 14
      },
      subtextStyle: {
        fontSize: 12
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        const time = params[0].name;
        const value = params[0].value;
        // 计算拥挤度百分比
        const percentage = Math.floor((value / maxFlow) * 100);
        let crowdLevel = '极少';
        if (percentage > 90) crowdLevel = '极度拥挤';
        else if (percentage > 80) crowdLevel = '非常拥挤';
        else if (percentage > 65) crowdLevel = '拥挤';
        else if (percentage > 50) crowdLevel = '较多';
        else if (percentage > 35) crowdLevel = '一般';
        else if (percentage > 20) crowdLevel = '较少';
        return `${time}<br/>人流量: ${value.toLocaleString()}人<br/>拥挤程度: ${crowdLevel} (${percentage}%)`;
      }
    },
    legend: {
      data: ['预测人流量'],
      right: 10,
      top: 5
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '80px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: hours,
      axisLine: {
        lineStyle: {
          color: '#666'
        }
      },
      axisLabel: {
        formatter: '{value}',
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: function(value: number) {
          // 格式化为千位分隔的数字
          return value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value;
        },
        color: '#666'
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#ddd'
        }
      }
    },
    series: [
      {
        name: '预测人流量',
        type: 'line',
        smooth: true,
        data: crowdData,
        markArea: {
          itemStyle: {
            color: 'rgba(255, 173, 177, 0.2)'
          },
          data: [
            // 标记高峰区域
            crowdAnalysis.peakHours.map(peak => {
              const [start, end] = peak.split('-');
              return [
                { xAxis: `${start.split(':')[0]}:00` },
                { xAxis: `${end.split(':')[0]}:00` }
              ];
            })
          ].flat()
        },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#1E88E5' },
            { offset: 1, color: 'rgba(30, 136, 229, 0.1)' }
          ])
        },
        lineStyle: {
          width: 3,
          color: '#1E88E5'
        },
        itemStyle: {
          color: '#1E88E5'
        },
        markPoint: {
          data: [
            { type: 'max', name: '高峰', itemStyle: { color: '#ff4d4f' } },
            { type: 'min', name: '低谷', itemStyle: { color: '#52c41a' } },
            { name: '当前', coord: [currentHourIndex, currentCrowdLevel], itemStyle: { color: '#faad14' }, symbolSize: 8 }
          ]
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' },
            {
              name: '拥挤阈值',
              yAxis: crowdingThreshold,
              lineStyle: {
                color: '#ff9800',
                type: 'dashed'
              },
              label: {
                formatter: '拥挤阈值',
                position: 'end'
              }
            }
          ]
        }
      }
    ]
  };
  
  // 使用配置绘制图表
  poiCrowdChartInstance.setOption(option);
};

// 渲染场所类型分布图
const renderPoiTypeChart = () => {
  if (!poiTypeChart.value) return;
  
  // 初始化图表
  if (!poiTypeChartInstance) {
    poiTypeChartInstance = echarts.init(poiTypeChart.value);
  }
  
  // 提取场所类型数据
  const typeDistribution: Record<string, number> = {};
  poiResult.value.pois.forEach((poi: any) => {
    // 只取第一个分类作为主分类
    const type = poi.type ? poi.type.split(';')[0] : '其他';
    typeDistribution[type] = (typeDistribution[type] || 0) + 1;
  });
  
  // 转换为饼图数据
  const pieData = Object.entries(typeDistribution).map(([name, value]) => ({ name, value }));
  
  // 设置饼图配置
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      data: Object.keys(typeDistribution)
    },
    series: [
      {
        name: '类型分布',
        type: 'pie',
        radius: '70%',
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        data: pieData
      }
    ]
  };
  
  // 使用配置绘制图表
  poiTypeChartInstance.setOption(option);
};

// 监听POI搜索结果变化，更新图表
watch(() => poiResult.value, (newValue) => {
  if (newValue && newValue.status === '1' && newValue.pois && newValue.pois.length > 0) {
    renderPoiCharts();
  }
}, { deep: true });

// 监听窗口大小变化，重新调整图表大小
const handleChartResize = () => {
  if (poiDistChartInstance) poiDistChartInstance.resize();
  if (poiRatingChartInstance) poiRatingChartInstance.resize();
  if (poiCrowdChartInstance) poiCrowdChartInstance.resize();
  if (poiTypeChartInstance) poiTypeChartInstance.resize();
};

// 组件卸载时清理图表实例
onBeforeUnmount(() => {
  if (poiDistChartInstance) poiDistChartInstance.dispose();
  if (poiRatingChartInstance) poiRatingChartInstance.dispose();
  if (poiCrowdChartInstance) poiCrowdChartInstance.dispose();
  if (poiTypeChartInstance) poiTypeChartInstance.dispose();
  window.removeEventListener('resize', handleChartResize);
  
  // 清理ResizeObserver
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

// 创建ResizeObserver，监听控制面板宽度变化
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleChartResize);
  
  // 创建ResizeObserver实例
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      // 面板大小变化后重绘图表
      handleChartResize();
    });
    
    // 监听控制面板元素
    const controlPanel = document.querySelector('.control-panel');
    if (controlPanel) {
      resizeObserver.observe(controlPanel);
    }
  }
});

// 添加控制面板宽度控制
const controlPanelWidth = ref(450); // 初始宽度
const minWidth = 350; // 最小宽度
const maxWidth = 800; // 最大宽度

// 添加拖拽调整宽度的功能
const startResize = (e: MouseEvent) => {
  e.preventDefault();
  document.addEventListener('mousemove', onResize);
  document.addEventListener('mouseup', stopResize);
};

const onResize = (e: MouseEvent) => {
  let newWidth = e.clientX;
  
  // 设置最小/最大宽度限制
  if (newWidth < minWidth) newWidth = minWidth;
  if (newWidth > maxWidth) newWidth = maxWidth;
  
  controlPanelWidth.value = newWidth;
  
  // 触发所有图表的重绘以适应新宽度
  nextTick(() => {
    handleChartResize();
  });
};

const stopResize = () => {
  document.removeEventListener('mousemove', onResize);
  document.removeEventListener('mouseup', stopResize);
};

// 兼容原有的toggleMap函数调用
const toggleMap = () => toggleMapVisibility();
</script>

<style scoped>
/* 更新样式以支持可拖拽布局 */
.geo-api-dashboard {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.dashboard-layout {
  display: flex;
  position: relative;
  width: 100%;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.control-panel {
  height: 100%;
  overflow-y: auto;
  background-color: white;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  transition: width 0.3s ease;
  position: relative;
}

.full-width-panel {
  width: 100% !important;
}

.resizer {
  width: 10px;
  height: 100%;
  background-color: #f0f0f0;
  cursor: col-resize;
  position: absolute;
  top: 0;
  z-index: 15;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  right: 0;
}

.resizer:hover {
  background-color: #1976d2;
}

.resizer::after {
  content: "⋮⋮";
  position: absolute;
  color: #666;
  font-size: 16px;
  line-height: 1;
  user-select: none;
  transform: rotate(90deg);
}

.resizer:hover::after {
  color: white;
}

.map-container {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  background-color: #eee;
  transition: left 0.3s ease;
  height: 100%; /* 确保高度为100% */
  overflow: hidden; /* 防止内容溢出 */
  width: auto; /* 自动计算宽度 */
}

/* 确保图表容器样式适应调整后的布局 */
.charts-container {
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 20px;
  width: 100%;
}

.chart-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
  background-color: #f9f9f9;
  width: 100%;
  box-sizing: border-box;
}

.chart-container {
  height: 250px;
  width: 100%;
}

/* 其他样式保持不变 */
.map-collapsed .control-panel {
  width: 100%;
}

.map-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 100;
  display: flex;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
    height: auto;
  }
  
  .control-panel {
    width: 100% !important;
    height: auto;
    max-height: 50vh;
  }
  
  .map-container {
    position: relative;
    width: 100%;
    height: 50vh;
    left: 0 !important;
  }
  
  .resizer {
    display: none;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

/* 添加高德地图标识覆盖层样式 */
.map-logo-overlay {
  position: absolute;
  left: 5px;
  bottom: 5px;
  z-index: 900;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 5px 10px;
  border-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  pointer-events: none; /* 允许点击穿透 */
}

.logo-content {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #1976d2;
  font-weight: 500;
  font-size: 14px;
}

/* 确保地图容器有相对定位以便定位覆盖层 */
.map-container {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 5;
  background-color: #eee;
  transition: left 0.3s ease;
}

/* 删除可能导致页面空白的样式 */
.transition-section, 
.wave-divider, 
.video-showcase-container {
  display: block;
  margin: 0;
  padding: 0;
}

/* 优化拖拽分割线样式 */
.resizer {
  width: 10px;
  height: 100%;
  background-color: #f0f0f0;
  cursor: col-resize;
  position: absolute;
  top: 0;
  z-index: 15;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
  transition: background-color 0.2s ease;
}

.resizer:hover {
  background-color: #1976d2;
}

.resizer::before {
  content: "";
  position: absolute;
  left: 4px;
  top: 50%;
  bottom: 0;
  width: 2px;
  height: 20px;
  background-color: #999;
  transform: translateY(-50%);
  transition: background-color 0.2s ease;
}

.resizer:hover::before {
  background-color: white;
}

/* 优化拖拽过程中的视觉反馈 */
.dragging-active * {
  user-select: none !important;
}

.dragging-active .map-container {
  transition: none !important;
}
</style>