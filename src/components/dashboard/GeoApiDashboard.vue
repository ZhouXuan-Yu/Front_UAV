<template>
  <div class="geo-api-dashboard">
    <div class="dashboard-layout" :class="{'map-collapsed': !isMapVisible}">
      <!-- 左侧控制面板 -->
      <div class="control-panel" :class="{'full-width-panel': !isMapVisible}">
        <div class="panel-header">
          <h2>地理信息服务控制台</h2>
          <div class="panel-subtitle">实时地理数据分析与智能决策</div>
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
                
                <div v-if="poiResult.enhanced_info" class="analysis-section">
                  <div class="analysis-header">
                    <el-icon><DataAnalysis /></el-icon>
                    <span>智能分析</span>
                  </div>
                  <div class="analysis-content">{{ poiResult.enhanced_info }}</div>
                </div>
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
import { ref, reactive, onMounted, watch, nextTick } from 'vue';
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

// 高德地图API密钥
const AMAP_KEY = '206278d547a0c6408987f2a0002e2243';
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

// 智能增强分析 (模拟函数)
const generateAnalysis = (type: string, data: any): string => {
  if (type === 'poi') {
    return `根据搜索结果分析，共找到${data.length}个地点。主要集中在${data[0].adname}区域，多为${data[0].type.split(';')[0]}类型。建议您可以优先考虑评分较高且位置便利的选项。`;
  } else if (type === 'weather') {
    const {weather, temperature, winddirection, windpower} = data;
    return `今日${data.city}${weather}，温度${temperature}℃，${winddirection}风${windpower}级。适合${parseInt(temperature) > 25 ? '室内活动，注意防暑降温' : parseInt(temperature) < 10 ? '户外活动，注意保暖' : '户外活动，天气宜人'}。`;
  }
  return '暂无智能分析数据。';
};

// 初始化智能MCP调用
const initMCPService = () => {
  try {
    const mcpAPIBase = '/api/v1/mcp';
    
    return {
      async callMCP(action: string, params: any): Promise<any> {
        try {
          console.log(`调用MCP服务: ${action}`, params);
          const url = `${mcpAPIBase}/${action}`;
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
      script.src = `https://webapi.amap.com/maps?v=1.4.15&key=${AMAP_KEY}&plugin=AMap.Scale,AMap.ToolBar,AMap.ControlBar,AMap.DistrictSearch,AMap.TrafficLayer,AMap.Driving,AMap.TileLayer.Satellite,AMap.MapType`;
      
      script.onerror = (e) => {
        console.error('AMap脚本加载失败:', e);
        reject(new Error('AMap脚本加载失败'));
      };
      
      // 为了解决callback问题，使用onload事件
      script.onload = () => {
        console.log('AMap脚本加载成功');
        // 给点时间让AMap初始化
        setTimeout(() => {
          if (window.AMap) {
            resolve();
          } else {
            reject(new Error('AMap加载完成但未初始化'));
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
      mapStyle: 'amap://styles/normal'
    });

    // 添加比例尺
    map.addControl(new window.AMap.Scale());
    
    // 添加缩放控件
    map.addControl(new window.AMap.ToolBar());
    
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
    
    // 优先使用MCP服务，包含智能分析功能
    let response: any;
    if (mcpService) {
      response = await mcpService.callMCP('search_poi', poiForm);
    } else {
      response = await callAmapAPI('place/text', poiForm);
      // 本地模拟智能分析
      if (response.status === '1' && response.pois && response.pois.length > 0) {
        setTimeout(() => {
          poiResult.value.enhanced_info = generateAnalysis('poi', response.pois);
        }, 800);
      }
    }
    
    // 确保结果赋值正确
    poiResult.value = { ...response };
    
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
      ElMessage.error(`搜索失败: ${response.info}`);
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
    const response = await callAmapAPI('weather/weatherInfo', weatherForm);
    weatherResult.value = response;
    
    if (response.status === '1') {
      ElMessage({
        message: '天气查询成功',
        type: 'success',
        offset: 80
      });
      
      // 智能增强处理 (模拟app.py中DeepSeek API调用)
      if (response.lives && response.lives.length > 0) {
        setTimeout(() => {
          weatherResult.value.weather_advice = generateAnalysis('weather', response.lives[0]);
        }, 800);
      }
      
      // 如果有城市信息，将地图定位到城市
      if (response.lives && response.lives.length > 0) {
        // 使用地理编码获取城市中心点
        const cityName = response.lives[0].city;
        const geocodeResponse = await callAmapAPI('geocode/geo', { address: cityName });
        
        if (geocodeResponse.status === '1' && 
            geocodeResponse.geocodes && 
            geocodeResponse.geocodes.length > 0) {
          const location = geocodeResponse.geocodes[0].location.split(',');
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
          
          map.clearMap();
          map.add(marker);
          
          // 添加信息窗口
          const info = `
            <div style="padding: 10px;">
              <div style="font-weight: bold; color: #1976d2; margin-bottom: 5px;">${cityName}</div>
              <div style="font-size: 20px; margin-bottom: 5px;">${response.lives[0].temperature}°C</div>
              <div>${response.lives[0].weather}, ${response.lives[0].winddirection}风${response.lives[0].windpower}级</div>
            </div>
          `;
          
          const infoWindow = createInfoWindow(info, [parseFloat(location[0]), parseFloat(location[1])]);
          
          infoWindow.open(map, marker.getPosition());
        }
      }
    } else {
      ElMessage.error(`天气查询失败: ${response.info}`);
    }
  } catch (error) {
    console.error('天气查询出错:', error);
    showError(`天气查询出错: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    loading.value = false;
  }
};

// 行政区域查询
const handleDistrictSearch = async () => {
  try {
    loading.value = true;
    // 这里使用服务直接调用高德地图API，而不是通过本地服务转发
    const districtAPI = `https://restapi.amap.com/v3/config/district?key=${AMAP_KEY}&keywords=${encodeURIComponent(districtForm.keywords)}&subdistrict=${districtForm.subdistrict || 1}&extensions=all`;
    
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

// 添加交通状态信息变量
const trafficLayer = ref<any>(null);
const statusMessage = ref<string>('');

// 交通态势查询
const handleTrafficSearch = async () => {
  const validationResult = validateRectangle(trafficForm.rectangle);
  if (validationResult !== true) {
    ElMessage.warning(validationResult);
    return;
  }
  
  loading.value = true;
  statusMessage.value = '正在获取交通态势信息...';
  trafficResult.value = { status: '0' };
  
  try {
    // 确保地图已初始化
    if (!map) {
      await toggleMap(true);
    }
    
    // 清除地图上的标记
    if (map) {
      map.clearMap();
    }
    
    const response = await callAmapAPI('traffic/status/rectangle', {
      rectangle: trafficForm.rectangle,
      level: trafficForm.level,
      extensions: 'all',
      output: 'json'
    });
    
    if (response && response.trafficinfo) {
      trafficResult.value = {
        ...response.trafficinfo,
        status: '1'
      };
      statusMessage.value = '成功获取交通态势信息';
      
      // 在地图上显示交通态势
      if (map && window.AMap) {
        // 解析矩形区域
        const [bottomLeft, topRight] = trafficForm.rectangle.split(';');
        const [lng1, lat1] = bottomLeft.split(',').map(Number);
        const [lng2, lat2] = topRight.split(',').map(Number);
        
        // 创建矩形覆盖物
        const rectangle = new window.AMap.Rectangle({
          bounds: new window.AMap.Bounds([lng1, lat1], [lng2, lat2]),
          strokeColor: '#0091FF',
          strokeWeight: 2,
          strokeOpacity: 0.8,
          strokeDasharray: [5, 5],
          strokeStyle: 'dashed',
          fillColor: '#CCE5FF',
          fillOpacity: 0.3,
          cursor: 'pointer',
          zIndex: 50
        });
        
        // 将矩形添加到地图
        map.add(rectangle);
        
        // 添加交通流量图层
        if (!trafficLayer.value) {
          trafficLayer.value = new window.AMap.TileLayer.Traffic({
            zIndex: 10,
            autoRefresh: true,
            interval: 180 // 自动刷新间隔，单位：秒
          });
        }
        
        trafficLayer.value.setMap(map);
        
        // 调整地图视野以包含矩形区域
        map.setBounds(rectangle.getBounds());
        
        // 创建信息窗口显示交通概述
        const trafficInfo = trafficResult.value;
        const infoWindow = createInfoWindow(`
          <div class="info-window">
            <h3>交通状况概览</h3>
            <p>评价时间: ${trafficInfo.evaluation_time || '未知'}</p>
            <p>交通状况: ${trafficInfo.description || '未知'}</p>
            <p>交通指数: ${trafficInfo.expedite || '未知'}</p>
          </div>
        `);
        
        // 在矩形中心打开信息窗口
        const center = rectangle.getBounds().getCenter();
        infoWindow.open(map, center);
      }
    } else {
      statusMessage.value = '未获取到交通态势信息';
      ElMessage.info('未获取到交通态势信息');
    }
  } catch (error) {
    console.error('获取交通态势时出错:', error);
    statusMessage.value = `获取交通态势失败: ${error instanceof Error ? error.message : '未知错误'}`;
    ElMessage.error(`获取交通态势失败: ${error instanceof Error ? error.message : '未知错误'}`);
    
    // 显示模拟数据
    const mockTrafficInfo = {
      status: '1',
      info: 'OK (模拟数据)',
      description: '当前路段交通状况良好，局部区域有轻微拥堵',
      evaluation_time: new Date().toLocaleTimeString(),
      expedite: '0.8',
      congested: '0.15',
      blocked: '0.05',
      unknown: '0'
    };
    
    trafficResult.value = mockTrafficInfo;
    statusMessage.value = '注意: 返回模拟交通态势数据';
    ElMessage.warning('使用模拟数据显示交通态势');
    
    // 在地图上显示交通态势（使用模拟数据）
    if (map && window.AMap) {
      // 解析矩形区域
      const [bottomLeft, topRight] = trafficForm.rectangle.split(';');
      const [lng1, lat1] = bottomLeft.split(',').map(Number);
      const [lng2, lat2] = topRight.split(',').map(Number);
      
      // 创建矩形覆盖物
      const rectangle = new window.AMap.Rectangle({
        bounds: new window.AMap.Bounds([lng1, lat1], [lng2, lat2]),
        strokeColor: '#0091FF',
        strokeWeight: 2,
        strokeOpacity: 0.8,
        strokeDasharray: [5, 5],
        strokeStyle: 'dashed',
        fillColor: '#CCE5FF',
        fillOpacity: 0.3,
        cursor: 'pointer',
        zIndex: 50
      });
      
      // 将矩形添加到地图
      map.add(rectangle);
      
      // 添加交通流量图层
      if (!trafficLayer.value) {
        trafficLayer.value = new window.AMap.TileLayer.Traffic({
          zIndex: 10,
          autoRefresh: true,
          interval: 180 // 自动刷新间隔，单位：秒
        });
      }
      
      trafficLayer.value.setMap(map);
      
      // 调整地图视野以包含矩形区域
      map.setBounds(rectangle.getBounds());
      
      // 创建信息窗口显示交通概述
      const infoWindow = createInfoWindow(`
        <div class="info-window">
          <h3>交通状况概览 (模拟数据)</h3>
          <p>评价时间: ${mockTrafficInfo.evaluation_time}</p>
          <p>交通状况: ${mockTrafficInfo.description}</p>
          <p>交通指数: ${mockTrafficInfo.expedite}</p>
        </div>
      `);
      
      // 在矩形中心打开信息窗口
      const center = rectangle.getBounds().getCenter();
      infoWindow.open(map, center);
    }
  } finally {
    loading.value = false;
  }
};

// 验证矩形区域格式
const validateRectangle = (value: string) => {
  // 检查格式是否为: 左下经度,左下纬度;右上经度,右上纬度
  const rectanglePattern = /^\d+(\.\d+)?,\d+(\.\d+)?;\d+(\.\d+)?,\d+(\.\d+)?$/;
  if (!rectanglePattern.test(value)) {
    return '矩形区域格式应为: 左下经度,左下纬度;右上经度,右上纬度';
  }
  
  const [bottomLeft, topRight] = value.split(';');
  const [lng1, lat1] = bottomLeft.split(',').map(Number);
  const [lng2, lat2] = topRight.split(',').map(Number);
  
  if (lng1 >= lng2 || lat1 >= lat2) {
    return '右上角坐标必须大于左下角坐标';
  }
  
  if (lng1 < -180 || lng1 > 180 || lng2 < -180 || lng2 > 180) {
    return '经度应在 -180 到 180 之间';
  }
  
  if (lat1 < -90 || lat1 > 90 || lat2 < -90 || lat2 > 90) {
    return '纬度应在 -90 到 90 之间';
  }
  
  return true;
};

// 在地图上显示位置在地图上
const showOnMap = (location: string, title: string = '位置') => {
  if (!map) {
    toggleMap(true);
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
    
    const infoWindow = createInfoWindow(infoContent, [lng, lat]);
    
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
    toggleMap(true);
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
          
          const infoWindow = createInfoWindow(info, [parseFloat(center[0]), parseFloat(center[1])]);
        }
      }
    }
  });
};

// 在地图上显示交通态势
const showTrafficOnMap = () => {
  if (!map) {
    toggleMap();
    return;
  }
  
  map.clearMap();
  
  // 解析矩形区域
  try {
    const rectangleStr = trafficForm.rectangle;
    
    // 再次验证格式
    if (!validateRectangle(rectangleStr)) {
      ElMessage.warning('矩形区域格式不正确，无法在地图上显示');
      return;
    }
    
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
          <div style="margin-top: 8px; font-size: 12px; color: #909399;">
            查询区域: ${rectangleStr}
          </div>
        </div>
      `;
      
      const infoWindow = createInfoWindow(info, center);
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
    ElMessage({
      message: '已清除地图标记',
      type: 'success',
      offset: 80
    });
  }
};

// 组件挂载时立即初始化地图
onMounted(() => {
  console.log('组件已挂载，正在初始化地图');
  initMap();
  
  // 监听窗口大小变化，以便地图容器大小变化时重新调整地图
  window.addEventListener('resize', handleResize);
  
  // 组件卸载时移除事件监听器
  return () => {
    window.removeEventListener('resize', handleResize);
  };
});

// 处理窗口大小变化
const handleResize = () => {
  if (map) {
    map.resize();
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
  try {
    loading.value = true;
    // 添加公共参数
    const queryParams = {
      ...params,
      key: AMAP_KEY,
      output: "json",
      extensions: params.extensions || 'all' // 默认使用扩展信息
    };
    
    // 构建URL和查询参数
    const url = new URL(`https://restapi.amap.com/v3/${endpoint}`);
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined && queryParams[key] !== null) {
        url.searchParams.append(key, queryParams[key]);
      }
    });
    
    console.log(`调用高德API: ${url.toString()}`);
    
    // 添加超时处理
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
    
    try {
      // 发送请求
      const response = await fetch(url.toString(), {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // 检查HTTP状态码
      if (!response.ok) {
        throw new Error(`HTTP错误: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`高德API返回: 状态=${result.status || 'unknown'}`);
      
      // 如果服务不可用，尝试调用MCP服务
      if (result.status === '0' && result.info === 'SERVICE_NOT_AVAILABLE') {
        console.warn('高德服务暂时不可用，尝试通过MCP服务获取数据');
        
        // 尝试通过MCP服务获取数据（包含DeepSeek增强）
        if (mcpService) {
          try {
            console.log('通过MCP服务获取数据', endpoint, params);
            let mcpEndpoint = '';
            
            if (endpoint.includes('place/text')) {
              mcpEndpoint = 'search_poi';
            } else if (endpoint.includes('weather/weatherInfo')) {
              mcpEndpoint = 'weather';
            } else if (endpoint.includes('traffic/status')) {
              mcpEndpoint = 'traffic_status';
            } else if (endpoint.includes('direction/driving')) {
              mcpEndpoint = 'route_planning';
            } else if (endpoint.includes('geocode/geo')) {
              mcpEndpoint = 'geocode';
            } else if (endpoint.includes('geocode/regeo')) {
              mcpEndpoint = 'regeocode';
            } else if (endpoint.includes('config/district')) {
              mcpEndpoint = 'district';
            }
            
            if (mcpEndpoint) {
              const mcpResult = await mcpService.callMCP(mcpEndpoint, params);
              console.log('MCP服务返回数据', mcpResult);
              return mcpResult;
            }
          } catch (mcpError) {
            console.error('MCP服务调用失败:', mcpError);
          }
        }
        
        ElMessage.warning('地图服务暂时不可用，请稍后再试');
        throw new Error('地图服务暂时不可用');
      }
      
      return result;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('API请求超时');
        throw new Error('API请求超时，请稍后再试');
      }
      
      throw error;
    }
  } catch (error) {
    console.error(`调用高德地图API出错: ${error instanceof Error ? error.message : String(error)}`);
    return { status: "0", info: `API调用失败: ${error instanceof Error ? error.message : String(error)}` };
  } finally {
    loading.value = false;
  }
};

// 生成模拟POI数据
const getMockPOIData = (keywords: string) => {
  console.log(`生成模拟POI数据，关键词: ${keywords}`);
  
  // 模拟位置是北京市中心
  const defaultLocation = '116.407394,39.904211';
  
  // 生成不同类型的POI数据
  const poiTypes: Record<string, Array<{name: string, address: string, type: string, location: string}>> = {
    '餐厅': [
      { name: `${keywords}餐厅 (模拟数据)`, address: '北京市东城区王府井大街88号', type: '餐饮;中餐厅', location: '116.418038,39.912501' },
      { name: '全聚德烤鸭店 (模拟数据)', address: '北京市东城区前门大街30号', type: '餐饮;中餐厅', location: '116.404878,39.899750' },
      { name: '花家怡园 (模拟数据)', address: '北京市东城区簋街13号', type: '餐饮;中餐厅', location: '116.413920,39.924897' }
    ],
    '酒店': [
      { name: `${keywords}大酒店 (模拟数据)`, address: '北京市西城区西长安街1号', type: '住宿;五星级酒店', location: '116.383373,39.908720' },
      { name: '丽思卡尔顿酒店 (模拟数据)', address: '北京市朝阳区建国门外大街83号', type: '住宿;五星级酒店', location: '116.459981,39.915666' },
      { name: '北京饭店 (模拟数据)', address: '北京市东城区东长安街33号', type: '住宿;五星级酒店', location: '116.413988,39.909616' }
    ],
    '商场': [
      { name: `${keywords}商场 (模拟数据)`, address: '北京市朝阳区建国路87号', type: '购物;综合商场', location: '116.468005,39.911180' },
      { name: '王府井百货大楼 (模拟数据)', address: '北京市东城区王府井大街255号', type: '购物;百货', location: '116.418231,39.917450' },
      { name: '华联商厦 (模拟数据)', address: '北京市西城区复兴门内大街101号', type: '购物;综合商场', location: '116.359098,39.907430' }
    ]
  };
  
  // 根据关键词选择POI类型，如果没有匹配则使用默认值
  const matchedType = Object.keys(poiTypes).find(type => keywords.includes(type)) || '餐厅';
  const pois = poiTypes[matchedType];
  
  return {
    status: '1',
    info: 'OK (模拟数据)',
    count: pois.length.toString(),
    pois: pois,
    enhanced_info: `这是基于"${keywords}"的模拟搜索结果，因为高德服务暂时不可用。我们展示了一些${matchedType}相关的地点供您参考。在实际应用中，将会提供更精准的搜索结果和位置信息。`
  };
};

// 生成模拟天气数据
const getMockWeatherData = (city: string) => {
  const today = new Date();
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  return {
    status: '1',
    info: 'OK (模拟数据)',
    lives: [
      {
        province: city.includes('市') ? city.split('市')[0] : '北京',
        city: city,
        adcode: '110100',
        weather: '晴',
        temperature: '22',
        winddirection: '东南',
        windpower: '3',
        humidity: '55',
        reporttime: new Date().toISOString().split('T')[0] + ' 12:00:00'
      }
    ],
    forecasts: [
      {
        city: city,
        adcode: '110100',
        province: city.includes('市') ? city.split('市')[0] : '北京',
        reporttime: new Date().toISOString().split('T')[0] + ' 12:00:00',
        casts: [
          {
            date: formatDate(today),
            week: String(today.getDay()),
            dayweather: '晴',
            nightweather: '多云',
            daytemp: '25',
            nighttemp: '18',
            daywind: '东南',
            nightwind: '东南',
            daypower: '3',
            nightpower: '3'
          },
          {
            date: formatDate(new Date(today.getTime() + 86400000)),
            week: String((today.getDay() + 1) % 7),
            dayweather: '多云',
            nightweather: '阴',
            daytemp: '24',
            nighttemp: '17',
            daywind: '东南',
            nightwind: '东南',
            daypower: '3',
            nightpower: '3'
          }
        ]
      }
    ],
    weather_advice: `这是${city}的模拟天气数据。今日天气晴朗，气温适宜，非常适合户外活动。建议穿着轻便衣物，携带防晒用品。`
  };
};

// 为createInfoWindow函数添加类型声明
const createInfoWindow = (content: string, position?: [number, number]) => {
  // 创建信息窗口实例
  const infoWindow = new window.AMap.InfoWindow({
    content: content,
    offset: new window.AMap.Pixel(0, -30),
    closeWhenClickMap: true,
    isCustom: true
  });
  
  // 如果提供了位置，则在该位置打开信息窗口
  if (position && map) {
    infoWindow.open(map, position);
  }
  
  return infoWindow;
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
        
        // 在地图初始化后监听地图是否创建成功
        const checkMapInterval = setInterval(() => {
          if (map) {
            clearInterval(checkMapInterval);
            handleActiveTabContent();
          }
        }, 200);
        
        // 5秒后如果还没有创建成功，清除定时器
        setTimeout(() => {
          clearInterval(checkMapInterval);
        }, 5000);
      });
    } else {
      // 如果地图已经存在，需要重新调整大小
      nextTick(() => {
        if (map) {
          map.resize();
          handleActiveTabContent();
        }
      });
    }
  }
  
  ElMessage({
    message: isMapVisible.value ? '已展开地图' : '已收起地图',
    type: 'success',
    offset: 80
  });
};

// 根据当前激活的标签页显示相应内容
const handleActiveTabContent = () => {
  if (activeTab.value === 'poi' && poiResult.value && poiResult.value.pois && poiResult.value.pois.length > 0) {
    handlePoiSearch();
  } else if (activeTab.value === 'weather' && weatherResult.value && weatherResult.value.status === '1') {
    handleWeatherSearch();
  } else if (activeTab.value === 'district' && districtResult.value && districtResult.value.status === '1' && 
            districtResult.value.districts && districtResult.value.districts.length > 0) {
    showDistrictOnMap(districtResult.value.districts[0]);
  } else if (activeTab.value === 'traffic' && trafficResult.value && trafficResult.value.status === '1') {
    // 调用显示交通信息的函数
    if (typeof showTrafficOnMap === 'function') {
      showTrafficOnMap();
    } else {
      handleTrafficSearch();
    }
  }
};

// 兼容原有的toggleMap函数调用
const toggleMap = (forceShow = false) => {
  if (forceShow && !isMapVisible.value) {
    toggleMapVisibility();
  } else if (!forceShow) {
    toggleMapVisibility();
  }
  
  return new Promise<void>((resolve) => {
    // 等待地图加载完成后解析Promise
    if (map) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (map) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 200);
      
      // 5秒后如果还没有创建成功，也解析Promise
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    }
  });
};

// 处理路线规划
const handleRouteSearch = async () => {
  try {
    loading.value = true;

    if (!routeForm.origin || !routeForm.destination) {
      ElMessage.warning('请输入起点和终点位置');
      return;
    }

    // 使用GeoApiService调用路线规划接口
    const result = await GeoApiService.planRoute(routeForm.origin, routeForm.destination);
    
    // 格式化返回结果
    routeResult.value = {
      ...result,
      status: '1',
      steps: []
    };

    // 如果有路径点，生成导航步骤
    if (result.waypoints && result.waypoints.length > 0) {
      // 简单处理：将路径点分段生成导航步骤
      const segments = [];
      const totalPoints = result.waypoints.length;
      const segmentSize = Math.min(Math.floor(totalPoints / 5), 20);
      
      for (let i = 0; i < totalPoints; i += segmentSize) {
        if (i > 0) {
          // 计算该段距离和时间（简单按比例计算）
          const segmentDistance = Math.round(result.distance * (segmentSize / totalPoints));
          const segmentDuration = Math.round(result.duration * (segmentSize / totalPoints));
          
          segments.push({
            instruction: `沿道路行驶，前往下一个路段`,
            distance: segmentDistance,
            duration: segmentDuration
          });
        }
      }
      
      routeResult.value.steps = segments;
    }

    ElMessage({
      message: `路线规划成功，总距离 ${formatDistance(result.distance)}`,
      type: 'success',
      offset: 80
    });

    // 默认在地图上显示路线
    showRouteOnMap();
  } catch (error) {
    console.error('路线规划出错:', error);
    showError(`路线规划出错: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    loading.value = false;
  }
};

// 在地图上显示路线
const showRouteOnMap = () => {
  if (!map) {
    toggleMap(true);
  }

  try {
    // 清除地图上的标记
    map.clearMap();

    if (!routeResult.value || routeResult.value.status !== '1' || !routeResult.value.waypoints) {
      ElMessage.warning('没有可用的路线数据');
      return;
    }

    const { startPoint, endPoint, waypoints } = routeResult.value;

    // 创建起点标记
    const startMarker = new window.AMap.Marker({
      position: [startPoint.lng, startPoint.lat],
      title: '起点',
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(25, 34),
        image: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
        imageSize: new window.AMap.Size(25, 34)
      })
    });

    // 创建终点标记
    const endMarker = new window.AMap.Marker({
      position: [endPoint.lng, endPoint.lat],
      title: '终点',
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(25, 34),
        image: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
        imageSize: new window.AMap.Size(25, 34)
      })
    });

    // 创建路径折线
    const path = waypoints.map((point: any) => [point.lng, point.lat]);
    const polyline = new window.AMap.Polyline({
      path,
      isOutline: true,
      outlineColor: '#ffeeee',
      borderWeight: 2,
      strokeWeight: 5,
      strokeColor: '#1976d2',
      lineJoin: 'round'
    });

    // 添加到地图
    map.add([startMarker, endMarker, polyline]);

    // 调整视图以适应路线
    map.setFitView([startMarker, endMarker, polyline]);

    // 添加起点信息窗口
    const startInfo = `
      <div style="padding: 10px;">
        <div style="font-weight: bold; color: #1976d2; margin-bottom: 5px;">起点</div>
        <div style="font-size: 12px; color: #606266;">坐标: ${startPoint.lng.toFixed(6)}, ${startPoint.lat.toFixed(6)}</div>
      </div>
    `;
    
    const startInfoWindow = createInfoWindow(startInfo, [startPoint.lng, startPoint.lat]);
    startInfoWindow.open(map, startMarker.getPosition());

  } catch (error) {
    console.error('显示路线出错:', error);
    showError(`显示路线失败: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// 添加模拟POI数据生成函数
const generateMockPoiData = (keyword: string) => {
  const mockPois = {
    '餐厅': [
      { name: '海底捞火锅(中关村店)', address: '北京市海淀区中关村大街28号', type: '餐饮', location: '116.312589,39.986072' },
      { name: '全聚德烤鸭(王府井店)', address: '北京市东城区王府井大街32号', type: '餐饮', location: '116.413258,39.917745' },
      { name: '西贝莜面村(西单店)', address: '北京市西城区西单北大街130号', type: '餐饮', location: '116.374592,39.913132' }
    ],
    '酒店': [
      { name: '北京国际饭店', address: '北京市东城区建国门内大街9号', type: '住宿', location: '116.425881,39.909746' },
      { name: '北京饭店', address: '北京市东城区东长安街33号', type: '住宿', location: '116.403874,39.909691' },
      { name: '北京希尔顿酒店', address: '北京市东城区建国门内大街1号', type: '住宿', location: '116.428119,39.908333' }
    ],
    '商场': [
      { name: '王府井百货大楼', address: '北京市东城区王府井大街255号', type: '购物', location: '116.413973,39.914573' },
      { name: '西单商场', address: '北京市西城区西单北大街120号', type: '购物', location: '116.375896,39.912987' },
      { name: '燕莎友谊商城', address: '北京市朝阳区亮马桥路52号', type: '购物', location: '116.462426,39.94945' }
    ]
  };

  // 如果关键词在模拟数据中，返回对应类别的数据
  if (keyword in mockPois) {
    return mockPois[keyword as keyof typeof mockPois];
  }
  
  // 否则，返回所有数据合并后的一部分
  const allPois = Object.values(mockPois).flat();
  // 随机选择2-5个POI点返回
  const count = Math.floor(Math.random() * 4) + 2;
  const shuffled = [...allPois].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// 添加模拟天气数据生成函数
const generateMockWeatherData = (city: string) => {
  const weatherTypes = ['晴', '多云', '阴', '小雨', '中雨', '大雨', '雷阵雨', '小雪', '中雪', '大雪'];
  const windDirections = ['东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风', '北风'];
  const windLevels = ['1级', '2级', '3级', '4级', '5级', '6级'];
  
  const randomTemp = Math.floor(Math.random() * 35) - 5; // -5到30度
  const randomHumidity = Math.floor(Math.random() * 100); // 0-100%
  const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
  const randomWind = `${windDirections[Math.floor(Math.random() * windDirections.length)]}${windLevels[Math.floor(Math.random() * windLevels.length)]}`;
  
  return {
    city,
    weather: randomWeather,
    temperature: `${randomTemp}℃`,
    humidity: `${randomHumidity}%`,
    wind: randomWind,
    forecast: [
      { date: '今天', weather: randomWeather, temperature: `${randomTemp}℃/${randomTemp+8}℃`, wind: randomWind },
      { date: '明天', weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)], temperature: `${randomTemp-2}℃/${randomTemp+6}℃`, wind: `${windDirections[Math.floor(Math.random() * windDirections.length)]}${windLevels[Math.floor(Math.random() * windLevels.length)]}` },
      { date: '后天', weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)], temperature: `${randomTemp-4}℃/${randomTemp+5}℃`, wind: `${windDirections[Math.floor(Math.random() * windDirections.length)]}${windLevels[Math.floor(Math.random() * windLevels.length)]}` }
    ]
  };
};
</script>

<style scoped>
.geo-api-dashboard {
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
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
}

.control-panel {
  width: 380px; /* 减小控制面板宽度，从450px改为380px */
  flex-shrink: 0;
  background-color: #f5f7fa;
  padding: 15px; /* 减小内边距，从20px改为15px */
  overflow-y: auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: 10;
}

.panel-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}

.panel-header h2 {
  font-size: 22px;
  color: #1976d2;
  margin-bottom: 5px;
}

.panel-subtitle {
  font-size: 14px;
  color: #909399;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #2c3e50;
  border-left: 4px solid #1976d2;
  padding-left: 10px;
}

.tab-content {
  padding: 15px;
}

.api-tabs {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content) {
  flex-grow: 1;
  overflow: auto;
  padding: 10px 0; /* 减小上下内边距 */
}

:deep(.el-tab-pane) {
  height: 100%;
  overflow-y: auto;
  padding: 0 5px; /* 减小左右内边距 */
}

.result-section {
  margin-top: 15px;
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
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
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #1976d2;
}

.analysis-content {
  font-size: 14px;
  line-height: 1.6;
  color: #606266;
}

.search-btn {
  width: 100%;
}

.map-toggle-btn {
  width: 100%;
  margin-top: 10px;
}

.map-controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.map-controls .el-button-group {
  display: flex;
  flex-direction: row;
}

.map-container {
  flex-grow: 1;
  position: relative;
  height: 100%;
  margin-left: 20px; /* 添加左侧外边距，使地图更靠右 */
  margin-right: 20px; /* 添加右侧外边距，保持两侧对称 */
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.1); /* 添加阴影效果，增强层次感 */
  border-radius: 8px; /* 添加圆角，美化外观 */
  overflow: hidden; /* 确保圆角效果不被内容溢出影响 */
}

.result-list {
  margin-top: 15px;
  max-height: 400px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.result-card {
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  background-color: #fff;
  transition: all 0.3s;
}

.result-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.poi-name {
  font-weight: bold;
  color: #1976d2;
  font-size: 16px;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.poi-address, .poi-type, .poi-location {
  margin: 5px 0;
  color: #606266;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.poi-address .el-icon,
.poi-type .el-icon,
.poi-location .el-icon {
  color: #909399;
  flex-shrink: 0;
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
  padding: 15px;
}

.weather-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.weather-icon {
  margin-bottom: 10px;
  color: #1976d2;
}

.weather-temp {
  font-size: 2rem;
  font-weight: 600;
  color: #1976d2;
}

.weather-desc {
  font-size: 1.1rem;
  color: #606266;
}

.weather-details {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  width: 100%;
}

.detail-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  min-width: 80px;
}

.detail-label {
  font-size: 0.8rem;
  color: #909399;
  margin-bottom: 5px;
}

.detail-value {
  font-weight: 600;
  color: #606266;
}

.forecast-list {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
}

.forecast-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  flex: 1;
  margin: 0 5px;
}

.forecast-date {
  font-weight: 600;
  margin-bottom: 10px;
  color: #1976d2;
}

.forecast-day, .forecast-night {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.forecast-part {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.part-title {
  font-size: 0.8rem;
  color: #909399;
  margin-bottom: 5px;
}

.part-weather, .part-temp {
  font-size: 0.9rem;
  color: #606266;
}

.full-width {
  width: 100%;
}

.active-map-type {
  color: #1976d2;
  border-color: #1976d2;
  background-color: #ecf5ff;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .control-panel {
    width: 320px; /* 在中等屏幕上进一步减小控制面板宽度 */
  }
  
  .map-container {
    margin-left: 15px;
    margin-right: 15px;
  }
}

@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }
  
  .control-panel {
    width: 100%;
    max-width: 100%;
    height: 50%;
    min-height: 300px;
    margin-bottom: 10px; /* 添加底部外边距，增加与地图的间距 */
  }
  
  .map-container {
    height: 50%;
    margin: 0; /* 在移动设备上移除外边距 */
    border-radius: 0; /* 在移动设备上移除圆角 */
  }
}

/* 修改地图展开/收起相关样式 */
.map-collapsed .control-panel {
  width: 100%;
  max-width: 100%;
}

.full-width-panel {
  width: 100% !important;
  max-width: 100% !important;
}

/* 添加地图工具栏的样式优化 */
.map-tools {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 信息窗口样式 */
:deep(.amap-info-window) {
  background-color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 15px;
  max-width: 280px;
  border: 1px solid #e6e6e6;
}

:deep(.info-window-content) {
  font-size: 14px;
  line-height: 1.5;
  color: #606266;
}

:deep(.marker-info h4) {
  margin: 0 0 10px 0;
  color: #1976d2;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

:deep(.marker-info p) {
  margin: 5px 0;
  color: #606266;
  display: flex;
  align-items: center;
}

:deep(.info-label) {
  font-weight: bold;
  margin-right: 5px;
  color: #909399;
}
</style>