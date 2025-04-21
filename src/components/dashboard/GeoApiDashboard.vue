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
      // 注意: 修正endpoint为place/text而不是search_poi
      response = await mcpService.callMCP('place/text', poiSearchParams);
    } else {
      response = await callAmapAPI('place/text', poiSearchParams);
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
          
          const infoWindow = createInfoWindow(cityName, info);
          
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
    // 使用尺寸调整方法
    try {
      map.resize();
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
  width: 450px;
  flex-shrink: 0;
  background-color: #f5f7fa;
  padding: 20px;
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
}

:deep(.el-tab-pane) {
  height: 100%;
  overflow-y: auto;
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
@media (max-width: 768px) {
  .dashboard-layout {
    flex-direction: column;
  }
  
  .control-panel {
    width: 100%;
    max-width: 100%;
    height: 50%;
    min-height: 300px;
  }
  
  .map-container {
    height: 50%;
  }
  
  .route-stats {
    flex-direction: column;
  }
  
  .stat-item {
    margin: 5px 0;
  }
  
  .weather-details {
    flex-direction: column;
  }
  
  .forecast-list {
    flex-direction: column;
  }
  
  .forecast-item {
    margin: 5px 0;
  }
}

/* 可滚动列表样式 */
.scrollable-list {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 5px;
  scrollbar-width: thin;
}

.scrollable-list::-webkit-scrollbar {
  width: 6px;
}

.scrollable-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.scrollable-list::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

.scrollable-list::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

/* 地图展开/收起相关样式 */
.map-collapsed .control-panel {
  width: 100%;
  max-width: 100%;
}

.full-width-panel {
  width: 100% !important;
  max-width: 100% !important;
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