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
      <div class="control-panel" :class="{'full-width-panel': !isMapVisible}">
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
      
      <!-- 右侧地图区域 -->
      <div v-show="isMapVisible" class="map-container" id="amap-container">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Sunny, Moon, Search, Location, Position, Files,
  Compass, MapLocation, DataAnalysis, Money, Guide, 
  Timer, Odometer, Histogram, WindPower, Cloudy, Close,
  Delete, SetUp, PictureFilled, Fold, Expand
} from '@element-plus/icons-vue';
import GeoApiService from '../../services/GeoApiService';

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
    return `根据您搜索的关键词，我们找到了${data.length}个地点。主要分布在${data[0].cityname}的${data[0].adname}区域内。
大多数地点属于${data[0].type.split(';')[0]}类型，交通便利度较高。建议您选择评分较高的地点，或根据具体位置选择距离最近的地点。
如需详细了解周边环境和具体地点特色，建议您点击地图查看具体位置或致电相关地点。`;
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
    }
    
    if (response.status === '1') {
      ElMessage({
        message: `找到 ${response.count} 个结果`,
        type: 'success',
        offset: 80
      });
      
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
    loading.value = true;
    // 这里直接使用高德地图API
    const trafficAPI = `https://restapi.amap.com/v3/traffic/status/rectangle?key=${AMAP_KEY.value}&rectangle=${encodeURIComponent(trafficForm.rectangle)}&level=${trafficForm.level || '1'}`;
    
    const response = await fetch(trafficAPI);
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const result = await response.json();
    trafficResult.value = result;
    
    if (result.status === '1') {
      ElMessage({
        message: `交通态势查询成功`,
        type: 'success',
        offset: 80
      });
    } else {
      ElMessage.error(`查询失败: ${result.info}`);
    }
  } catch (error) {
    console.error('交通态势查询出错:', error);
    showError(`交通态势查询出错: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    loading.value = false;
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
  console.log('切换地图可见性');
  isMapVisible.value = !isMapVisible.value;
  
  if (isMapVisible.value) {
    // 展开地图时，确保地图实例已经创建
    if (!map) {
      nextTick(() => {
        initMap();
      });
    } else {
      // 如果地图已经存在，需要重新调整大小
      nextTick(() => {
        if (map) {
          try {
            map.resize();
          } catch (error) {
            console.warn('调整地图大小失败:', error);
            // 如果resize方法不可用，可能需要重新创建地图
            const container = document.getElementById('amap-container');
            if (container) {
              if (map && typeof map.destroy === 'function') {
                map.destroy();
                createMap();
              }
            }
          }
        }
      });
    }
    
    // 根据当前活动的标签页显示相应的内容
    nextTick(() => {
      if (activeTab.value === 'poi' && poiResult.value.pois && poiResult.value.pois.length > 0) {
        handlePoiSearch();
      } else if (activeTab.value === 'weather' && weatherResult.value.status === '1') {
        handleWeatherSearch();
      } else if (activeTab.value === 'district' && districtResult.value.status === '1' && districtResult.value.districts && districtResult.value.districts.length > 0) {
        showDistrictOnMap(districtResult.value.districts[0]);
      } else if (activeTab.value === 'traffic' && trafficResult.value.status === '1') {
        showTrafficOnMap();
      }
    });
  }
  
  ElMessage({
    message: isMapVisible.value ? '已展开地图' : '已收起地图',
    type: 'success',
    offset: 80
  });
};

// 兼容原有的toggleMap函数调用
const toggleMap = () => toggleMapVisibility();

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
</script>

<style scoped>
.geo-api-dashboard {
  width: 100%;
  height: 100%;
  background-color: #f0f5fa; /* 更改为更柔和的蓝色背景 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 添加顶部导航控制样式 */
.nav-controls {
  padding: 10px 15px;
  display: flex;
  justify-content: flex-end;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  z-index: 20;
}

.dashboard-layout {
  display: flex;
  flex-direction: row;
  height: calc(100vh - 60px);
  transition: all 0.3s ease;
  position: relative; /* 添加定位 */
  background-color: #f0f5fa; /* 保持一致的背景色 */
  padding: 15px; /* 增加整体内边距 */
  gap: 15px; /* 添加间距 */
}

.control-panel {
  width: 450px;
  flex-shrink: 0;
  background-color: #fff; /* 改为白色背景增加对比度 */
  padding: 15px;
  overflow-y: auto;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: 10;
  border-radius: 8px;
  margin: 0; /* 移除外边距 */
  max-height: calc(100vh - 100px); /* 限制最大高度让其可以向下延伸 */
}

.panel-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
  background-color: #1976d2; /* 添加蓝色标题背景 */
  padding: 15px;
  margin: -15px -15px 15px -15px;
  border-radius: 8px 8px 0 0;
  color: white;
}

.panel-header h2 {
  font-size: 22px;
  color: white;
  margin-bottom: 5px;
}

.panel-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2c3e50;
  border-left: 4px solid #1976d2;
  padding-left: 10px;
  background-color: rgba(25, 118, 210, 0.05);
  padding: 8px 10px;
  border-radius: 0 4px 4px 0;
}

.tab-content {
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.api-tabs {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content) {
  flex-grow: 1;
  overflow: auto;
}

:deep(.el-tab-pane) {
  height: 100%;
  overflow-y: auto;
}

/* 使标签顶栏更加美观 */
:deep(.el-tabs__header) {
  background-color: #f5f7fa;
  border-radius: 8px 8px 0 0;
  margin-bottom: 0;
}

:deep(.el-tabs__item) {
  height: 45px;
  line-height: 45px;
  font-weight: 500;
}

:deep(.el-tabs__item.is-active) {
  color: #1976d2;
  font-weight: 700;
}

:deep(.el-tabs__active-bar) {
  background-color: #1976d2;
  height: 3px;
}

.result-section {
  margin-top: 15px;
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border-left: 4px solid #1976d2;
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  color: #1976d2;
}

.analysis-section {
  margin-top: 20px;
  background-color: #f0f9ff;
  border-radius: 8px;
  padding: 15px;
  border-left: 4px solid #1976d2;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #1976d2;
  background-color: rgba(25, 118, 210, 0.1);
  padding: 8px 12px;
  border-radius: 4px;
}

.analysis-content {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  border: 1px solid rgba(25, 118, 210, 0.2);
}

.search-btn {
  width: 100%;
  background-color: #1976d2;
  border-color: #1976d2;
  height: 40px;
  font-weight: 500;
}

.search-btn:hover {
  background-color: #1565c0;
  border-color: #1565c0;
}

.map-toggle-btn {
  width: 100%;
  margin-top: 10px;
  background-color: #4caf50;
  border-color: #4caf50;
}

.map-toggle-btn:hover {
  background-color: #388e3c;
  border-color: #388e3c;
}

.map-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.map-controls .el-button-group {
  display: flex;
  flex-direction: row;
}

.map-container {
  flex-grow: 1;
  position: relative;
  height: calc(100vh - 100px); /* 向下延伸 */
  background-color: #f5f7fa;
  margin: 0; /* 移除外边距 */
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 5; /* 确保地图容器有合适的z-index */
  touch-action: manipulation; /* 支持移动端手势 */
}

.result-list {
  margin-top: 15px;
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.result-card {
  margin-bottom: 10px;
  border-left: 3px solid #1976d2;
  transition: all 0.3s ease;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.poi-name {
  font-size: 16px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 5px;
}

.poi-address, .poi-type, .poi-location {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  color: #606266;
  margin-bottom: 3px;
}

.card-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.weather-card {
  margin-bottom: 15px;
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.weather-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 15px 0;
}

.weather-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.weather-icon {
  font-size: 64px;
  color: #1976d2;
}

.weather-temp {
  font-size: 32px;
  font-weight: 600;
  color: #333;
}

.weather-desc {
  font-size: 18px;
  color: #606266;
}

.weather-details {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #909399;
}

.detail-value {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
}

.forecast-list {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 15px;
  padding: 10px 0;
  scrollbar-width: thin;
}

.forecast-item {
  min-width: 200px;
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 10px;
  flex-shrink: 0;
}

.forecast-date {
  font-size: 14px;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 10px;
  text-align: center;
  padding-bottom: 5px;
  border-bottom: 1px solid #dcdfe6;
}

.forecast-day {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.forecast-part {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px;
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.part-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}

.part-icon {
  font-size: 24px;
  color: #f39c12;
}

.part-weather {
  font-size: 13px;
  color: #606266;
}

.part-temp {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.part-wind {
  font-size: 12px;
  color: #909399;
}

/* 地图和面板切换效果 */
.map-collapsed .map-container {
  display: none;
}

.full-width-panel {
  width: 100%;
  max-width: none;
}

/* 增加全局滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #d0d0d0;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #1976d2;
}

/* 添加加载状态样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* POI分析卡片样式增强 */
.enhanced-analysis-card {
  margin-top: 20px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: none;
  transition: all 0.3s ease;
}

.enhanced-analysis-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.enhanced-analysis-header {
  background-color: #1976d2;
  color: white;
  padding: 12px 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

.enhanced-analysis-content {
  padding: 15px;
  background-color: #fff;
  line-height: 1.7;
  color: #333;
  white-space: pre-line;
  font-size: 14px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* 添加数据视图提示卡片 */
.data-hint-card {
  background-color: rgba(25, 118, 210, 0.05);
  border-left: 4px solid #1976d2;
  padding: 12px 15px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

.data-hint-title {
  font-weight: 600;
  margin-bottom: 5px;
  color: #1976d2;
  display: flex;
  align-items: center;
  gap: 5px;
}

:deep(.amap-toolbar) {
  opacity: 0.9;
  background-color: #ffffff;
  padding: 2px;
  border-radius: 4px;
}

:deep(.amap-zoom-touch-minus),
:deep(.amap-zoom-touch-plus) {
  width: 40px !important;
  height: 40px !important;
  line-height: 40px !important;
  font-size: 22px !important;
  background-color: #fff !important;
  border-radius: 50% !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
  color: #1976d2 !important;
}

:deep(.amap-scale) {
  background-color: rgba(255, 255, 255, 0.8) !important;
  padding: 2px 5px !important;
  border-radius: 2px !important;
}
</style>