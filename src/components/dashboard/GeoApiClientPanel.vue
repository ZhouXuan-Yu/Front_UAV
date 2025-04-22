/**
 * 文件名: GeoApiClientPanel.vue
 * 描述: 高德地图API客户端面板组件
 * 在项目中的作用: 
 * - 提供与高德地图API交互的用户界面
 * - 支持POI搜索、路线规划、天气查询等地理服务功能
 * - 通过WebSocket实现与后端服务的实时通信
 * - 在地图上直观展示查询结果和地理信息
 */

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, reactive } from 'vue';
import type { GeoCoordinate } from '@/services/GeoApiService';

// 连接状态
const wsStatus = ref('未连接');
const wsStatusColor = ref('red');
const isConnected = ref(false);
const clientId = ref<string | null>(null);

// WebSocket实例
let ws: WebSocket | null = null;

// 请求类型
const requestTypes = [
  { value: 'search_poi', label: 'POI搜索' },
  { value: 'route_planning', label: '路线规划' },
  { value: 'weather', label: '天气查询' },
  { value: 'geocode', label: '地理编码' },
  { value: 'regeocode', label: '逆地理编码' },
  { value: 'district', label: '行政区域查询' },
  { value: 'traffic_status', label: '交通态势' }
];

// 当前选择的请求类型
const selectedRequestType = ref('search_poi');

// 请求参数
const requestParams = reactive<Record<string, string>>({});

// 请求结果
const resultContent = ref<string>('');
const isLoading = ref(false);

// 地图标记
const markers: any[] = [];
let map: any = null;

// 初始化高德地图
const initMap = () => {
  const mapContainer = document.getElementById('geo-map-container');
  if (!mapContainer) return;
  
  if (typeof window.AMap === 'undefined') {
    // 加载高德地图脚本
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `https://webapi.amap.com/maps?v=2.0&key=206278d547a0c6408987f2a0002e2243`;
    script.onload = createMap;
    document.head.appendChild(script);
  } else {
    createMap();
  }
};

// 创建地图
const createMap = () => {
  const mapContainer = document.getElementById('geo-map-container');
  if (!mapContainer) return;
  
  map = new window.AMap.Map('geo-map-container', {
    zoom: 11,
    center: [116.397428, 39.90923],
    viewMode: '3D',
    pitch: 40
  });
};

// 清除地图上的标记
const clearMarkers = () => {
  if (map && markers.length > 0) {
    map.remove(markers);
    markers.length = 0;
  }
};

// 连接到WebSocket服务器
const connectToServer = () => {
  try {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = window.location.hostname || 'localhost';
    const wsPort = 6789;
    const wsUrl = `${wsProtocol}//${wsHost}:${wsPort}`;
    
    wsStatus.value = `正在连接 ${wsUrl}...`;
    wsStatusColor.value = 'orange';
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      wsStatus.value = `已连接到 ${wsUrl}`;
      wsStatusColor.value = 'green';
      isConnected.value = true;
    };
    
    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        if (message.type === 'connection_established') {
          clientId.value = message.client_id;
          console.log('已连接到服务器，客户端ID：', clientId.value);
        } else if (message.type === 'response') {
          handleResponse(message);
        } else if (message.type === 'error') {
          resultContent.value = `错误: ${message.message}`;
          isLoading.value = false;
        }
      } catch (e) {
        console.error('处理消息时出错:', e);
        resultContent.value = '处理服务器消息时出错';
        isLoading.value = false;
      }
    };
    
    ws.onclose = (event) => {
      wsStatus.value = '已断开连接';
      wsStatusColor.value = 'red';
      isConnected.value = false;
      clientId.value = null;
      
      // 显示更多信息
      if (event.code !== 1000) {
        console.log('WebSocket意外断开，代码:', event.code, '原因:', event.reason);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket错误:', error);
      resultContent.value = 'WebSocket连接错误';
      wsStatus.value = '连接错误';
      wsStatusColor.value = 'red';
      isConnected.value = false;
    };
  } catch (e) {
    console.error('创建WebSocket时出错:', e);
    wsStatus.value = '连接失败';
    wsStatusColor.value = 'red';
    resultContent.value = '无法创建WebSocket连接，请检查网络';
    isConnected.value = false;
  }
};

// 处理API响应
const handleResponse = (response: any) => {
  isLoading.value = false;
  const resultData = response.data;
  let resultHtml = `<h4>${getRequestTypeName(response.request_type)}结果:</h4>`;
  
  if (resultData.status === '1') {
    // 根据不同的请求类型处理结果
    switch (response.request_type) {
      case 'search_poi':
        resultHtml += handlePoiResult(resultData);
        break;
      case 'route_planning':
        resultHtml += handleRouteResult(resultData);
        break;
      case 'weather':
        resultHtml += handleWeatherResult(resultData);
        break;
      case 'geocode':
        resultHtml += handleGeocodeResult(resultData);
        break;
      case 'regeocode':
        resultHtml += handleRegeocodeResult(resultData);
        break;
      case 'district':
        resultHtml += handleDistrictResult(resultData);
        break;
      case 'traffic_status':
        resultHtml += handleTrafficResult(resultData);
        break;
      default:
        resultHtml += `<pre>${JSON.stringify(resultData, null, 2)}</pre>`;
    }
  } else {
    resultHtml += `<p class="error">请求失败: ${resultData.info || '未知错误'}</p>`;
  }
  
  resultContent.value = resultHtml;
};

// POI搜索结果处理
const handlePoiResult = (data: any) => {
  clearMarkers();
  
  let html = `<p>找到 ${data.count} 个结果</p>`;
  
  if (data.pois && data.pois.length > 0) {
    html += '<ul class="result-list">';
    data.pois.forEach((poi: any) => {
      html += `<li><strong>${poi.name}</strong> - ${poi.address || '无地址'}</li>`;
      
      // 在地图上添加标记
      if (poi.location && map) {
        const location = poi.location.split(',');
        const marker = new window.AMap.Marker({
          position: new window.AMap.LngLat(location[0], location[1]),
          title: poi.name
        });
        markers.push(marker);
        map.add(marker);
      }
    });
    html += '</ul>';
    
    // 如果有增强信息，显示
    if (data.enhanced_info) {
      html += `<div class="enhanced-info">
        <h4>AI分析:</h4>
        <p>${data.enhanced_info}</p>
      </div>`;
    }
    
    // 调整地图视野以包含所有标记
    if (markers.length > 0 && map) {
      map.setFitView(markers);
    }
  }
  
  return html;
};

// 路线规划结果处理
const handleRouteResult = (data: any) => {
  clearMarkers();
  
  let html = '';
  
  if (data.status === '1' && data.route && data.route.paths && data.route.paths.length > 0) {
    const path = data.route.paths[0];
    html += `<p>距离: ${(path.distance / 1000).toFixed(2)}公里</p>`;
    html += `<p>预计用时: ${(path.duration / 60).toFixed(0)}分钟</p>`;
    
    // 显示路线
    if (path.steps && path.steps.length > 0 && map) {
      const pathArray: any[] = [];
      path.steps.forEach((step: any) => {
        if (step.polyline) {
          const polyline = step.polyline.split(';');
          polyline.forEach((pos: string) => {
            const lnglat = pos.split(',');
            pathArray.push(new window.AMap.LngLat(lnglat[0], lnglat[1]));
          });
        }
      });
      
      // 绘制路线
      const route = new window.AMap.Polyline({
        path: pathArray,
        strokeColor: '#3366FF',
        strokeWeight: 6,
        strokeOpacity: 0.8
      });
      markers.push(route);
      map.add(route);
      map.setFitView(markers);
    }
    
    // 如果有路线分析，显示
    if (data.route_analysis) {
      html += `<div class="enhanced-info">
        <h4>路线分析:</h4>
        <p>${data.route_analysis}</p>
      </div>`;
    }
  } else {
    html += `<p class="error">路线规划失败: ${data.info || '未知错误'}</p>`;
    if (data.info && data.info.includes('转换为坐标')) {
      html += `<p>请确保输入有效的城市名称或正确格式的经纬度坐标。</p>`;
    }
  }
  
  return html;
};

// 天气查询结果处理
const handleWeatherResult = (data: any) => {
  let html = '';
  
  if (data.lives && data.lives.length > 0) {
    const weather = data.lives[0];
    html += `<p><strong>${weather.city}</strong> - ${weather.reporttime}</p>`;
    html += `<p>天气: ${weather.weather}</p>`;
    html += `<p>温度: ${weather.temperature}°C</p>`;
    html += `<p>风向: ${weather.winddirection}</p>`;
    html += `<p>风力: ${weather.windpower}</p>`;
    html += `<p>湿度: ${weather.humidity}%</p>`;
    
    // 如果有天气建议，显示
    if (data.weather_advice) {
      html += `<div class="enhanced-info">
        <h4>出行建议:</h4>
        <p>${data.weather_advice}</p>
      </div>`;
    }
  }
  
  return html;
};

// 地理编码结果处理
const handleGeocodeResult = (data: any) => {
  clearMarkers();
  
  let html = '';
  
  if (data.geocodes && data.geocodes.length > 0) {
    html += '<ul class="result-list">';
    data.geocodes.forEach((geocode: any) => {
      html += `<li><strong>${geocode.formatted_address}</strong></li>`;
      
      // 在地图上添加标记
      if (geocode.location && map) {
        const location = geocode.location.split(',');
        const marker = new window.AMap.Marker({
          position: new window.AMap.LngLat(location[0], location[1]),
          title: geocode.formatted_address
        });
        markers.push(marker);
        map.add(marker);
      }
    });
    html += '</ul>';
    
    // 调整地图视野
    if (markers.length > 0 && map) {
      map.setFitView(markers);
    }
  }
  
  return html;
};

// 逆地理编码结果处理
const handleRegeocodeResult = (data: any) => {
  clearMarkers();
  
  let html = '';
  
  if (data.regeocode) {
    const regeo = data.regeocode;
    html += `<p><strong>${regeo.formatted_address}</strong></p>`;
    
    // 在地图上添加标记
    if (data.location && map) {
      const location = data.location.split(',');
      const marker = new window.AMap.Marker({
        position: new window.AMap.LngLat(location[0], location[1]),
        title: regeo.formatted_address
      });
      markers.push(marker);
      map.add(marker);
      map.setCenter([location[0], location[1]]);
    }
    
    // 显示POI信息
    if (regeo.pois && regeo.pois.length > 0) {
      html += '<h4>周边POI:</h4><ul class="result-list">';
      regeo.pois.slice(0, 5).forEach((poi: any) => {
        html += `<li>${poi.name} (${poi.type}) - ${poi.distance}米</li>`;
      });
      html += '</ul>';
    }
  }
  
  return html;
};

// 行政区域查询结果处理
const handleDistrictResult = (data: any) => {
  let html = '';
  
  if (data.districts && data.districts.length > 0) {
    html += '<ul class="result-list">';
    data.districts.forEach((district: any) => {
      html += `<li><strong>${district.name}</strong> (${district.level})</li>`;
    });
    html += '</ul>';
  }
  
  return html;
};

// 交通态势结果处理
const handleTrafficResult = (data: any) => {
  let html = '';
  
  if (data.trafficinfo) {
    const info = data.trafficinfo;
    html += `<p>交通状况描述: ${info.description || '无'}</p>`;
    html += `<p>交通指数: ${info.evaluation?.expedite || '无'}</p>`;
    
    // 如果有交通分析，显示
    if (data.traffic_analysis) {
      html += `<div class="enhanced-info">
        <h4>交通分析:</h4>
        <p>${data.traffic_analysis}</p>
      </div>`;
    }
  }
  
  return html;
};

// 获取请求类型名称
const getRequestTypeName = (type: string): string => {
  const typeNames: Record<string, string> = {
    'search_poi': 'POI搜索',
    'route_planning': '路线规划',
    'weather': '天气查询',
    'geocode': '地理编码',
    'regeocode': '逆地理编码',
    'district': '行政区域查询',
    'traffic_status': '交通态势'
  };
  return typeNames[type] || type;
};

// 生成参数输入表单
const generateParamsForm = () => {
  // 清除现有参数
  for (const key in requestParams) {
    delete requestParams[key];
  }
  
  // 根据不同请求类型设置默认参数
  switch (selectedRequestType.value) {
    case 'search_poi':
      requestParams.keywords = '';
      requestParams.city = '北京';
      requestParams.offset = '10';
      break;
    case 'route_planning':
      requestParams.origin = '';
      requestParams.destination = '';
      break;
    case 'weather':
      requestParams.city = '110000';
      requestParams.extensions = 'base';
      break;
    case 'geocode':
      requestParams.address = '';
      requestParams.city = '北京';
      break;
    case 'regeocode':
      requestParams.location = '';
      requestParams.extensions = 'base';
      break;
    case 'district':
      requestParams.keywords = '';
      requestParams.subdistrict = '1';
      break;
    case 'traffic_status':
      requestParams.rectangle = '';
      break;
  }
};

// 验证参数
const validateParams = (): string[] => {
  const missingParams: string[] = [];
  
  switch (selectedRequestType.value) {
    case 'search_poi':
      if (!requestParams.keywords) missingParams.push('关键词');
      if (!requestParams.city) missingParams.push('城市');
      break;
    case 'route_planning':
      if (!requestParams.origin) missingParams.push('起点');
      if (!requestParams.destination) missingParams.push('终点');
      break;
    case 'weather':
      if (!requestParams.city) missingParams.push('城市编码');
      break;
    case 'geocode':
      if (!requestParams.address) missingParams.push('地址');
      break;
    case 'regeocode':
      if (!requestParams.location) missingParams.push('坐标');
      break;
    case 'district':
      if (!requestParams.keywords) missingParams.push('关键词');
      break;
    case 'traffic_status':
      if (!requestParams.rectangle) missingParams.push('矩形区域');
      break;
  }
  
  return missingParams;
};

// 发送请求
const sendRequest = () => {
  if (!isConnected.value) {
    // 尝试连接
    connectToServer();
    setTimeout(() => {
      if (isConnected.value) {
        sendRequest();
      } else {
        resultContent.value = '<p class="error">未能连接到服务器，请稍后再试</p>';
      }
    }, 1000);
    return;
  }
  
  // 验证必填参数
  const missingParams = validateParams();
  if (missingParams.length > 0) {
    resultContent.value = `<p class="error">请填写以下必填参数: ${missingParams.join(', ')}</p>`;
    return;
  }
  
  try {
    // 生成请求ID
    const requestId = Date.now().toString();
    
    // 发送WebSocket消息
    const message = {
      type: selectedRequestType.value,
      params: requestParams,
      request_id: requestId
    };
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
      resultContent.value = '<p class="loading">正在处理请求...</p>';
      isLoading.value = true;
      
      // 设置请求超时
      setTimeout(() => {
        if (isLoading.value) {
          resultContent.value = '<p class="error">请求超时，服务器未及时响应</p>';
          isLoading.value = false;
        }
      }, 30000); // 30秒超时
    } else {
      resultContent.value = '<p class="error">WebSocket未连接或已关闭</p>';
    }
  } catch (e) {
    console.error('发送请求时出错:', e);
    resultContent.value = '<p class="error">发送请求时发生错误</p>';
  }
};

// 监听请求类型变化
const handleRequestTypeChange = () => {
  generateParamsForm();
};

// 组件挂载时初始化
onMounted(() => {
  // 生成参数表单
  generateParamsForm();
  
  // 初始化地图
  setTimeout(initMap, 500);
});

// 组件销毁时清理资源
onBeforeUnmount(() => {
  // 关闭WebSocket连接
  if (ws) {
    ws.close();
    ws = null;
  }
  
  // 清理地图资源
  if (map) {
    map.destroy();
    map = null;
  }
});

// 配置主机信息
const host = {
  protocol: window.location.protocol,
  hostname: window.location.hostname || 'localhost',
  wsPort: 6789,
  httpPort: 5000
};

// 声明AMap类型
declare global {
  interface Window {
    AMap: any;
  }
}
</script>

<template>
  <div class="geo-api-client-panel">
    <div class="panel-header">
      <h3>高德地图API客户端</h3>
      <div class="connection-status">
        <span>连接状态：</span>
        <span :style="{ color: wsStatusColor }">{{ wsStatus }}</span>
        <button class="connect-button" @click="connectToServer">
          {{ isConnected ? '重新连接' : '连接服务器' }}
        </button>
      </div>
    </div>
    
    <div class="panel-body">
      <div class="panel-left">
        <!-- 请求配置 -->
        <div class="request-config">
          <div class="form-group">
            <label>请求类型：</label>
            <select v-model="selectedRequestType" @change="handleRequestTypeChange">
              <option v-for="type in requestTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>
          
          <!-- 请求参数表单 -->
          <div class="params-form">
            <!-- POI搜索参数 -->
            <template v-if="selectedRequestType === 'search_poi'">
              <div class="form-group">
                <label>关键词：</label>
                <input type="text" v-model="requestParams.keywords" placeholder="例如：银行、餐厅">
              </div>
              <div class="form-group">
                <label>城市：</label>
                <input type="text" v-model="requestParams.city" placeholder="例如：北京">
              </div>
              <div class="form-group">
                <label>每页数量：</label>
                <input type="number" v-model="requestParams.offset" placeholder="10">
              </div>
            </template>
            
            <!-- 路线规划参数 -->
            <template v-if="selectedRequestType === 'route_planning'">
              <div class="form-group">
                <label>起点：</label>
                <input type="text" v-model="requestParams.origin" placeholder="城市名或经纬度 例如：北京 或 116.434307,39.90909">
              </div>
              <div class="form-group">
                <label>终点：</label>
                <input type="text" v-model="requestParams.destination" placeholder="城市名或经纬度 例如：上海 或 116.434446,39.90816">
              </div>
            </template>
            
            <!-- 天气查询参数 -->
            <template v-if="selectedRequestType === 'weather'">
              <div class="form-group">
                <label>城市编码：</label>
                <input type="text" v-model="requestParams.city" placeholder="例如：110000">
              </div>
              <div class="form-group">
                <label>扩展：</label>
                <select v-model="requestParams.extensions">
                  <option value="base">基础</option>
                  <option value="all">全部</option>
                </select>
              </div>
            </template>
            
            <!-- 地理编码参数 -->
            <template v-if="selectedRequestType === 'geocode'">
              <div class="form-group">
                <label>地址：</label>
                <input type="text" v-model="requestParams.address" placeholder="例如：北京市朝阳区阜通东大街6号">
              </div>
              <div class="form-group">
                <label>城市：</label>
                <input type="text" v-model="requestParams.city" placeholder="例如：北京">
              </div>
            </template>
            
            <!-- 逆地理编码参数 -->
            <template v-if="selectedRequestType === 'regeocode'">
              <div class="form-group">
                <label>坐标：</label>
                <input type="text" v-model="requestParams.location" placeholder="经度,纬度 例如：116.481488,39.990464">
              </div>
              <div class="form-group">
                <label>扩展：</label>
                <select v-model="requestParams.extensions">
                  <option value="base">基础</option>
                  <option value="all">全部</option>
                </select>
              </div>
            </template>
            
            <!-- 行政区域查询参数 -->
            <template v-if="selectedRequestType === 'district'">
              <div class="form-group">
                <label>关键词：</label>
                <input type="text" v-model="requestParams.keywords" placeholder="例如：北京">
              </div>
              <div class="form-group">
                <label>子级行政区：</label>
                <select v-model="requestParams.subdistrict">
                  <option value="1">返回下一级</option>
                  <option value="2">返回下两级</option>
                  <option value="3">返回下三级</option>
                </select>
              </div>
            </template>
            
            <!-- 交通态势参数 -->
            <template v-if="selectedRequestType === 'traffic_status'">
              <div class="form-group">
                <label>矩形区域：</label>
                <input type="text" v-model="requestParams.rectangle" placeholder="左下右上坐标 例如：116.351147,39.966309;116.357134,39.968727">
              </div>
            </template>
          </div>
          
          <div class="form-actions">
            <button class="send-button" @click="sendRequest" :disabled="isLoading">
              {{ isLoading ? '请求中...' : '发送请求' }}
            </button>
          </div>
        </div>
        
        <!-- 结果显示区域 -->
        <div class="result-panel" v-html="resultContent"></div>
      </div>
      
      <div class="panel-right">
        <!-- 地图显示区域 -->
        <div id="geo-map-container" class="map-container"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.geo-api-client-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #132f4c;
  border-radius: 10px;
  overflow: hidden;
  color: white;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background-color: #0a1929;
  border-bottom: 1px solid #1e3a5f;
}

.panel-header h3 {
  margin: 0;
  color: #4fc3f7;
  font-size: 1.2rem;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.connect-button {
  padding: 5px 10px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.connect-button:hover {
  background-color: #1565c0;
}

.panel-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.panel-left {
  flex: 1;
  padding: 15px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.panel-right {
  flex: 1;
  border-left: 1px solid #1e3a5f;
}

.request-config {
  background-color: rgba(10, 25, 41, 0.5);
  border-radius: 8px;
  padding: 15px;
}

.form-group {
  margin-bottom: 10px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 0.9rem;
  color: #90caf9;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 10px;
  background-color: #0a1929;
  color: white;
  border: 1px solid #1e3a5f;
  border-radius: 4px;
  font-size: 0.9rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1976d2;
}

.form-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.send-button {
  padding: 8px 15px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.send-button:hover:not(:disabled) {
  background-color: #1565c0;
}

.send-button:disabled {
  background-color: #1e3a5f;
  cursor: not-allowed;
}

.result-panel {
  background-color: rgba(10, 25, 41, 0.5);
  border-radius: 8px;
  padding: 15px;
  flex: 1;
  overflow-y: auto;
  font-size: 0.9rem;
}

.map-container {
  width: 100%;
  height: 100%;
}

.result-panel :deep(h4) {
  color: #4fc3f7;
  margin: 15px 0 10px;
  font-size: 1rem;
}

.result-panel :deep(.error) {
  color: #f44336;
}

.result-panel :deep(.loading) {
  color: #ffc107;
}

.result-panel :deep(.enhanced-info) {
  margin-top: 15px;
  padding: 10px;
  background-color: rgba(25, 118, 210, 0.2);
  border-radius: 4px;
  border-left: 3px solid #1976d2;
}

.result-panel :deep(.result-list) {
  margin: 0;
  padding-left: 20px;
}

.result-panel :deep(.result-list li) {
  margin-bottom: 5px;
}
</style> 