<template>
  <div class="geo-api-dashboard">
    <div class="dashboard-layout">
      <!-- 左侧控制面板 -->
      <div class="control-panel">
        <div class="panel-header">
          <h2>地理信息服务控制台</h2>
          <div class="panel-subtitle">实时地理数据分析与智能决策</div>
        </div>
        
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
                </el-form-item>
              </el-form>
              
              <div v-if="poiResult.status === '1'" class="result-section">
                <div class="result-header">
                  <el-icon><Compass /></el-icon>
                  <span>搜索结果 (共{{ poiResult.count }}条)</span>
                </div>
                
                <div class="result-list">
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
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="路线规划" name="route">
            <div class="tab-content">
              <div class="section-title">智能路线规划</div>
              <el-form :model="routeForm" label-position="top">
                <el-form-item label="起点">
                  <el-input v-model="routeForm.origin" placeholder="地址或经纬度，例如：北京">
                    <template #prefix>
                      <el-icon><Position /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="终点">
                  <el-input v-model="routeForm.destination" placeholder="地址或经纬度，例如：上海">
                    <template #prefix>
                      <el-icon><Position /></el-icon>
                    </template>
                  </el-input>
                </el-form-item>
                <el-form-item label="策略">
                  <el-select v-model="routeForm.strategy" class="full-width">
                    <el-option label="最快捷模式" :value="0" />
                    <el-option label="最经济模式" :value="1" />
                    <el-option label="最短距离" :value="2" />
                    <el-option label="考虑实时路况" :value="4" />
                  </el-select>
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="handleRouteSearch" :loading="loading" class="search-btn">
                    <el-icon><Guide /></el-icon> 规划路线
                  </el-button>
                </el-form-item>
              </el-form>
              
              <div v-if="routeResult.status === '1'" class="result-section">
                <div class="result-header">
                  <el-icon><Guide /></el-icon>
                  <span>路线结果</span>
                </div>
                
                <el-card class="route-card" shadow="hover">
                  <div class="route-stats">
                    <div class="stat-item">
                      <div class="stat-icon"><el-icon><Odometer /></el-icon></div>
                      <div class="stat-content">
                        <div class="stat-value">{{ formatDistance(routeResult.route?.paths?.[0]?.distance) }}</div>
                        <div class="stat-label">总距离</div>
                      </div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-icon"><el-icon><Timer /></el-icon></div>
                      <div class="stat-content">
                        <div class="stat-value">{{ formatDuration(routeResult.route?.paths?.[0]?.duration) }}</div>
                        <div class="stat-label">预计时间</div>
                      </div>
                    </div>
                    <div class="stat-item">
                      <div class="stat-icon"><el-icon><Money /></el-icon></div>
                      <div class="stat-content">
                        <div class="stat-value">{{ routeResult.route?.paths?.[0]?.tolls || 0 }} 元</div>
                        <div class="stat-label">过路费</div>
                      </div>
                    </div>
                  </div>
                  
                  <div v-if="routeResult.route_analysis" class="analysis-section">
                    <div class="analysis-header">
                      <el-icon><DataAnalysis /></el-icon>
                      <span>路线分析</span>
                    </div>
                    <div class="analysis-content">{{ routeResult.route_analysis }}</div>
                  </div>
                  
                  <div class="card-actions">
                    <el-button type="primary" @click="showRouteOnMap(routeResult)">
                      <el-icon><MapLocation /></el-icon> 在地图中显示路线
                    </el-button>
                  </div>
                </el-card>
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
        </el-tabs>
      </div>
      
      <!-- 右侧地图容器 -->
      <div class="map-panel">
        <div class="map-header">
          <div class="map-title">
            <el-icon><MapLocation /></el-icon>
            <span>实时地图</span>
          </div>
        </div>
        <div ref="mapContainer" class="map-container"></div>
      </div>
    </div>
    
    <!-- 错误提示 -->
    <el-dialog v-model="errorVisible" title="错误" width="30%">
      <span>{{ errorMessage }}</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="errorVisible = false">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  Sunny, Moon, Search, Location, Position, Files, 
  Compass, MapLocation, DataAnalysis, Money, Guide, 
  Timer, Odometer, Histogram, WindPower, Cloudy 
} from '@element-plus/icons-vue';

// 状态变量
const activeTab = ref('poi');
const loading = ref(false);
const mapContainer = ref<HTMLDivElement | null>(null);
const errorVisible = ref(false);
const errorMessage = ref('');
let map: any = null;

// POI搜索表单
const poiForm = reactive({
  keywords: '餐厅',
  city: '北京',
  types: '',
  offset: 10,
  page: 1,
  extensions: 'all'
});

// 路线规划表单
const routeForm = reactive({
  origin: '北京',
  destination: '上海',
  strategy: 0
});

// 天气查询表单
const weatherForm = reactive({
  city: '北京',
  extensions: 'base'
});

// 查询结果
const poiResult = ref<any>({ status: '0' });
const routeResult = ref<any>({ status: '0' });
const weatherResult = ref<any>({ status: '0' });

// 高德地图API密钥
const AMAP_KEY = '206278d547a0c6408987f2a0002e2243';

// 初始化地图
const initMap = () => {
  if (!window.AMap) {
    loadAMapScript().then(() => {
      createMap();
    }).catch(error => {
      console.error('加载高德地图脚本失败:', error);
      showError('加载地图失败，请刷新页面重试');
    });
  } else {
    createMap();
  }
};

// 加载高德地图脚本
const loadAMapScript = () => {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_KEY}&plugin=AMap.Scale,AMap.ToolBar,AMap.ControlBar&callback=initAMap`;
    script.onerror = (e) => {
      console.error('AMap脚本加载失败:', e);
      reject(new Error('AMap脚本加载失败'));
    };
    
    window.initAMap = () => {
      console.log('AMap初始化回调成功调用');
      resolve();
    };
    
    script.onload = () => {
      console.log('AMap脚本加载成功，等待初始化回调...');
      // 如果加载成功但5秒内没收到回调，则直接解析promise
      setTimeout(() => {
        if (window.AMap && !map) {
          console.log('AMap已加载但未收到回调，手动初始化');
          resolve();
        }
      }, 5000);
    };
    
    document.head.appendChild(script);
    console.log('AMap脚本已添加到文档中');
  });
};

// 创建地图实例
const createMap = () => {
  try {
    console.log('开始创建地图，mapContainer:', mapContainer.value, 'AMap:', window.AMap);
    
    if (!mapContainer.value) {
      console.error('地图容器DOM元素不存在');
      showError('地图容器DOM元素不存在，请刷新页面重试');
      return;
    }
    
    if (!window.AMap) {
      console.error('AMap库未加载');
      showError('地图API未加载，请刷新页面重试');
      return;
    }
    
    // 确保DOM元素已经挂载并有尺寸
    const containerWidth = mapContainer.value.clientWidth;
    const containerHeight = mapContainer.value.clientHeight;
    console.log(`地图容器尺寸: ${containerWidth} x ${containerHeight}`);
    
    if (containerWidth === 0 || containerHeight === 0) {
      console.warn('地图容器尺寸为0，延迟创建地图');
      setTimeout(createMap, 200);
      return;
    }
    
    map = new window.AMap.Map(mapContainer.value, {
      zoom: 11,
      center: [116.397428, 39.90923],  // 北京
      viewMode: '3D',
      pitch: 35,
      mapStyle: 'amap://styles/macaron'
    });
    
    console.log('地图实例创建成功:', map);
    
    // 地图事件监听
    map.on('complete', () => {
      console.log('地图加载完成');
    });
    
    // 添加工具栏控件
    map.addControl(new window.AMap.ToolBar({
      position: {
        top: '110px',
        right: '40px'
      }
    }));
    
    // 添加比例尺控件
    map.addControl(new window.AMap.Scale());
    
    // 添加3D控制控件
    map.addControl(new window.AMap.ControlBar({
      position: {
        top: '10px',
        right: '10px'
      }
    }));
    
    return map;
  } catch (error) {
    console.error('创建地图实例出错:', error);
    showError(`创建地图失败: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

// POI搜索
const handlePoiSearch = async () => {
  try {
    loading.value = true;
    const response = await callAmapAPI('place/text', poiForm);
    poiResult.value = response;
    
    if (response.status === '1') {
      ElMessage({
        message: `找到 ${response.count} 个结果`,
        type: 'success',
        offset: 80
      });
      
      // 智能增强处理 (模拟app.py中DeepSeek API调用)
      if (response.pois && response.pois.length > 0) {
        setTimeout(() => {
          poiResult.value.enhanced_info = generateAnalysis('poi', response.pois);
        }, 800);
      }
      
      // 在地图上标记所有POI点
      if (map && response.pois && response.pois.length > 0) {
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
                content: `<div style="padding: 2px 5px; background-color: #1976d2; color: white; border-radius: 2px;">${index + 1}</div>`,
                direction: 'top'
              }
            });
          }
          return null;
        }).filter(Boolean);
        
        if (markers.length > 0) {
          map.add(markers);
          
          // 创建信息窗口
          markers.forEach((marker: any, index: number) => {
            const poi = response.pois[index];
            const info = `
              <div style="padding: 10px; max-width: 200px;">
                <div style="font-weight: bold; margin-bottom: 5px; color: #1976d2;">${poi.name}</div>
                <div style="font-size: 12px; color: #606266; margin-bottom: 3px;">类型: ${poi.type}</div>
                <div style="font-size: 12px; color: #606266;">${poi.address || '无地址信息'}</div>
              </div>
            `;
            
            marker.on('mouseover', () => {
              const infoWindow = new window.AMap.InfoWindow({
                content: info,
                offset: new window.AMap.Pixel(0, -35)
              });
              
              infoWindow.open(map, marker.getPosition());
            });
          });
          
          // 调整地图视野
          map.setFitView();
        }
      }
    } else {
      ElMessage.error(`搜索失败: ${response.info}`);
    }
  } catch (error) {
    console.error('POI搜索出错:', error);
    showError(`POI搜索出错: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    loading.value = false;
  }
};

// 路线规划
const handleRouteSearch = async () => {
  try {
    loading.value = true;
    const response = await callAmapAPI('direction/driving', { 
      ...routeForm,
      output: 'json'
    });
    routeResult.value = response;
    
    if (response.status === '1') {
      ElMessage({
        message: '路线规划成功',
        type: 'success',
        offset: 80
      });
      
      // 智能增强处理 (模拟app.py中DeepSeek API调用)
      if (response.route) {
        setTimeout(() => {
          routeResult.value.route_analysis = generateAnalysis('route', response.route);
        }, 800);
      }
      
      // 在地图上显示路线
      showRouteOnMap(response);
    } else {
      ElMessage.error(`路线规划失败: ${response.info}`);
    }
  } catch (error) {
    console.error('路线规划出错:', error);
    showError(`路线规划出错: ${error instanceof Error ? error.message : String(error)}`);
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
          
          const infoWindow = new window.AMap.InfoWindow({
            content: info,
            offset: new window.AMap.Pixel(0, -35)
          });
          
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

// 在地图中显示位置
const showOnMap = (location: string, name: string) => {
  try {
    if (!map) {
      console.error('地图实例未初始化');
      showError('地图未初始化，请稍后再试');
      return;
    }
    
    if (!location) {
      console.error('无效的位置信息');
      showError('无效的位置信息');
      return;
    }
    
    console.log('显示位置:', location, name);
    const position = location.split(',');
    const point = [parseFloat(position[0]), parseFloat(position[1])];
    
    // 移动地图到指定位置
    map.setCenter(point);
    map.setZoom(15);
    
    // 添加标记
    map.clearMap();
    const marker = new window.AMap.Marker({
      position: point,
      title: name,
      animation: 'AMAP_ANIMATION_DROP'
    });
    
    map.add(marker);
    
    // 创建信息窗口
    const info = `
      <div style="padding: 10px; max-width: 200px;">
        <div style="font-weight: bold; margin-bottom: 5px; color: #1976d2;">${name}</div>
        <div style="font-size: 12px; color: #606266;">坐标: ${location}</div>
      </div>
    `;
    
    const infoWindow = new window.AMap.InfoWindow({
      content: info,
      offset: new window.AMap.Pixel(0, -35)
    });
    
    infoWindow.open(map, point);
  } catch (error) {
    console.error('在地图上显示位置时出错:', error);
    showError(`显示位置失败: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// 在地图中显示路线
const showRouteOnMap = (response: any) => {
  if (!map || !response.route || !response.route.paths || response.route.paths.length === 0) {
    return;
  }
  
  map.clearMap();
  
  try {
    // 解析路径坐标
    const path = response.route.paths[0];
    const steps = path.steps;
    const polylinePaths: number[][] = [];
    
    // 从steps中提取所有坐标点
    steps.forEach((step: any) => {
      const stepPoints = step.polyline.split(';');
      stepPoints.forEach((point: string) => {
        const [lng, lat] = point.split(',');
        polylinePaths.push([parseFloat(lng), parseFloat(lat)]);
      });
    });
    
    // 添加起点和终点标记
    if (polylinePaths.length > 0) {
      const startMarker = new window.AMap.Marker({
        position: polylinePaths[0],
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(25, 34),
          image: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
          imageSize: new window.AMap.Size(25, 34)
        }),
        title: '起点'
      });
      
      const endMarker = new window.AMap.Marker({
        position: polylinePaths[polylinePaths.length - 1],
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(25, 34),
          image: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
          imageSize: new window.AMap.Size(25, 34)
        }),
        title: '终点'
      });
      
      map.add([startMarker, endMarker]);
      
      // 添加起点终点标签
      const startInfoWindow = new window.AMap.InfoWindow({
        content: `<div style="padding: 6px;">起点：${routeForm.origin}</div>`,
        offset: new window.AMap.Pixel(0, -35)
      });
      
      const endInfoWindow = new window.AMap.InfoWindow({
        content: `<div style="padding: 6px;">终点：${routeForm.destination}</div>`,
        offset: new window.AMap.Pixel(0, -35)
      });
      
      startInfoWindow.open(map, polylinePaths[0]);
      
      // 设置延迟显示终点信息窗口，避免重叠
      setTimeout(() => {
        endInfoWindow.open(map, polylinePaths[polylinePaths.length - 1]);
      }, 300);
    }
    
    // 绘制路线
    const polyline = new window.AMap.Polyline({
      path: polylinePaths,
      isOutline: true,
      outlineColor: '#ffffff',
      borderWeight: 2,
      strokeWeight: 6,
      strokeColor: '#1976d2',
      strokeOpacity: 0.8,
      lineJoin: 'round',
      lineCap: 'round',
      showDir: true
    });
    
    map.add(polyline);
    
    // 创建路线轨迹动画
    const passedPolyline = new window.AMap.Polyline({
      path: [polylinePaths[0]],
      strokeColor: '#FF9800',
      strokeWeight: 6,
      strokeOpacity: 0.8,
      lineJoin: 'round',
      lineCap: 'round'
    });
    
    map.add(passedPolyline);
    
    // 使用marker代表移动的点
    const marker = new window.AMap.Marker({
      position: polylinePaths[0],
      icon: new window.AMap.Icon({
        size: new window.AMap.Size(25, 25),
        image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
        imageSize: new window.AMap.Size(25, 25)
      })
    });
    
    map.add(marker);
    
    // 设置定时器播放轨迹
    let i = 0;
    const interval = setInterval(() => {
      if (i < polylinePaths.length) {
        marker.setPosition(polylinePaths[i]);
        passedPolyline.setPath(polylinePaths.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 100);
    
    // 调整地图视野以包含所有点
    map.setFitView();
  } catch (error) {
    console.error('显示路线出错:', error);
    ElMessage.error('显示路线出错');
  }
};

// 调用高德地图API
const callAmapAPI = async (endpoint: string, params: any): Promise<any> => {
  try {
    // 添加公共参数
    const queryParams = {
      ...params,
      key: AMAP_KEY,
      output: "json"
    };
    
    // 构建URL和查询参数
    const url = new URL(`https://restapi.amap.com/v3/${endpoint}`);
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] !== undefined && queryParams[key] !== null) {
        url.searchParams.append(key, queryParams[key]);
      }
    });
    
    console.log(`调用高德API: ${url.toString()}`);
    
    // 发送请求
    const response = await fetch(url.toString());
    
    // 检查HTTP状态码
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`高德API返回: 状态=${result.status || 'unknown'}`);
    
    return result;
  } catch (error) {
    console.error(`调用高德地图API出错: ${error instanceof Error ? error.message : String(error)}`);
    return { status: "0", info: `API调用失败: ${error instanceof Error ? error.message : String(error)}` };
  }
};

// 错误提示
const showError = (message: string) => {
  errorMessage.value = message;
  errorVisible.value = true;
};

// 模拟DeepSeek API的分析结果
const generateAnalysis = (type: string, data: any): string => {
  if (type === 'poi') {
    return `根据分析，这些地点主要集中在商业区和居民区交界处，客流量预计在工作日午餐和晚餐时段达到高峰。周边交通便利，有多条公交线路和地铁站点，适合各类人群就餐。其中，评分较高的几家餐厅在口味和服务方面都有不错的表现，建议可以优先考虑预约用餐以避免高峰期等待时间过长。`;
  } else if (type === 'route') {
    return `根据交通数据分析，该路线全长约${Math.round(data.paths[0].distance/1000)}公里，预计行驶时间${Math.round(data.paths[0].duration/60)}分钟。路线主要通过高速公路，途经多个服务区，适合长途驾驶。建议避开工作日的7:00-9:00和17:00-19:00的高峰期出行，周末出行时应注意旅游景点附近可能出现的拥堵情况。根据历史数据，该路线在平日中午和傍晚前的通行效率最高。`;
  } else if (type === 'weather') {
    const weatherData = data;
    if (weatherData.weather.includes('雨')) {
      return `今日${weatherData.city}有雨，气温${weatherData.temperature}°C，建议携带雨具出行，驾车注意路滑，减速慢行。穿着方面建议穿防水外套和防滑鞋。不适宜进行户外活动，可选择室内娱乐场所。`;
    } else if (Number(weatherData.temperature) > 30) {
      return `今日${weatherData.city}天气炎热，气温${weatherData.temperature}°C，建议做好防晒措施，多补充水分。出行建议尽量选择公共交通，减少户外活动时间。适合穿轻薄、宽松、透气的衣物，建议携带遮阳伞和防晒霜。`;
    } else {
      return `今日${weatherData.city}天气良好，气温${weatherData.temperature}°C，${weatherData.weather}，${weatherData.winddirection}风${weatherData.windpower}级。适合正常出行和户外活动，建议穿着舒适的衣物。早晚温差可能较大，建议适当增减衣物，预防感冒。`;
    }
  }
  return '';
};

// 格式化距离
const formatDistance = (distance: number): string => {
  if (!distance) return '0 米';
  return distance > 1000 ? `${(distance / 1000).toFixed(1)} 公里` : `${distance} 米`;
};

// 格式化时间
const formatDuration = (duration: number): string => {
  if (!duration) return '0 分钟';
  if (duration < 60) {
    return `${duration} 秒`;
  } else if (duration < 3600) {
    return `${Math.floor(duration / 60)} 分钟`;
  } else {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours} 小时 ${minutes} 分钟`;
  }
};

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const dayOfWeek = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
  return `${month}月${day}日 ${dayOfWeek}`;
};

// 组件挂载时初始化地图
onMounted(() => {
  console.log('组件已挂载，开始初始化地图');
  
  // 确保DOM渲染完成后再初始化地图
  setTimeout(() => {
    initMap();
    
    // 如果5秒后地图仍未初始化，尝试重新加载
    setTimeout(() => {
      if (!map) {
        console.warn('地图初始化超时，尝试重新加载');
        // 清除可能存在的AMap脚本，完全重新加载
        const existingScripts = document.querySelectorAll('script[src*="webapi.amap.com"]');
        existingScripts.forEach(script => script.remove());
        
        // 重置全局AMap对象
        window.AMap = undefined;
        
        // 重新初始化
        initMap();
      }
    }, 5000);
  }, 100);
});

// 声明AMap类型
declare global {
  interface Window {
    AMap: any;
    initAMap: () => void;
  }
}
</script>

<style scoped>
.geo-api-dashboard {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #f5f7fa;
  overflow: hidden;
}

.dashboard-layout {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
}

/* 左侧控制面板 */
.control-panel {
  width: 40%;
  min-width: 380px;
  max-width: 480px;
  height: 100%;
  overflow-y: auto;
  background-color: #fff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 20px;
  background: linear-gradient(135deg, #1976d2, #64b5f6);
  color: white;
}

.panel-header h2 {
  margin: 0 0 5px;
  font-size: 1.5rem;
  font-weight: 600;
}

.panel-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
}

.api-tabs {
  flex: 1;
  border-radius: 0;
  box-shadow: none;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1976d2;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  display: block;
  width: 4px;
  height: 16px;
  background-color: #1976d2;
  border-radius: 2px;
}

.tab-content {
  padding: 16px;
}

.full-width {
  width: 100%;
}

.search-btn {
  width: 100%;
  margin-top: 8px;
}

/* 结果区域 */
.result-section {
  margin-top: 20px;
  background-color: #fafafa;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #1976d2;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 350px;
  overflow-y: auto;
  padding-right: 4px;
}

.result-card {
  border-left: 3px solid #1976d2;
  transition: all 0.3s ease;
}

.result-card:hover {
  transform: translateY(-2px);
}

.poi-name {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 8px;
  color: #1976d2;
}

.poi-address, .poi-type, .poi-location {
  margin-bottom: 4px;
  color: #606266;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}

.card-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

/* 分析区域 */
.analysis-section {
  margin-top: 16px;
  padding: 16px;
  background-color: #f0f9eb;
  border-radius: 8px;
  border-left: 4px solid #67c23a;
}

.analysis-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #67c23a;
  margin-bottom: 8px;
}

.analysis-content {
  color: #606266;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* 路线结果 */
.route-stats {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background-color: #f5f7fa;
  flex: 1;
  margin: 0 4px;
}

.stat-icon {
  font-size: 24px;
  color: #1976d2;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(25, 118, 210, 0.1);
  border-radius: 50%;
}

.stat-value {
  font-weight: 600;
  font-size: 1.1rem;
  color: #303133;
}

.stat-label {
  font-size: 0.8rem;
  color: #909399;
}

/* 天气卡片 */
.weather-card {
  margin-bottom: 16px;
}

.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.weather-info {
  display: flex;
  padding: 16px 0;
}

.weather-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 32px;
  padding-right: 32px;
  border-right: 1px solid #ebeef5;
}

.weather-icon {
  margin-bottom: 8px;
  color: #1976d2;
}

.weather-temp {
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #303133;
}

.weather-desc {
  color: #606266;
  font-size: 1rem;
}

.weather-details {
  flex: 1;
  padding-left: 16px;
}

.detail-item {
  display: flex;
  margin-bottom: 12px;
  align-items: center;
}

.detail-label {
  width: 80px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 5px;
}

.detail-value {
  color: #606266;
  font-weight: 500;
}

.forecast-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.forecast-item {
  flex: 1;
  min-width: 200px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease;
}

.forecast-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.forecast-date {
  background-color: #1976d2;
  color: white;
  padding: 8px;
  text-align: center;
  font-weight: 600;
}

.forecast-day {
  display: flex;
}

.forecast-part {
  flex: 1;
  padding: 12px;
  text-align: center;
}

.forecast-part:first-child {
  border-right: 1px solid #e4e7ed;
}

.part-title {
  font-weight: 600;
  margin-bottom: 8px;
  color: #303133;
}

.part-icon {
  font-size: 24px;
  margin-bottom: 8px;
  color: #1976d2;
}

.part-weather {
  margin-bottom: 8px;
  font-weight: 500;
  color: #303133;
}

.part-temp {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1976d2;
}

.part-wind {
  font-size: 0.9rem;
  color: #909399;
}

/* 右侧地图面板 */
.map-panel {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #f5f7fa;
}

.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.map-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.map-container {
  flex: 1;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

@media (max-width: 1100px) {
  .dashboard-layout {
    flex-direction: column;
  }
  
  .control-panel {
    width: 100%;
    max-width: 100%;
    height: 40%;
    min-height: 300px;
  }
  
  .map-panel {
    height: 60%;
  }
  
  .route-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .stat-item {
    margin: 0;
  }
}

@media (max-width: 768px) {
  .control-panel {
    height: 50%;
  }
  
  .map-panel {
    height: 50%;
  }
  
  .weather-info {
    flex-direction: column;
  }
  
  .weather-main {
    margin-right: 0;
    margin-bottom: 16px;
    padding-right: 0;
    border-right: none;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 16px;
  }
  
  .weather-details {
    padding-left: 0;
  }
  
  .forecast-item {
    min-width: 100%;
  }
}
</style> 