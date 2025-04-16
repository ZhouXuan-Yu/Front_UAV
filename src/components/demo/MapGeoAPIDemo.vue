<template>
  <div class="map-geo-api-demo">
    <h2>高德地图API演示</h2>
    
    <div class="api-selection">
      <el-select v-model="selectedAPI" placeholder="选择API类型">
        <el-option v-for="api in apiOptions" :key="api.value" :label="api.label" :value="api.value" />
      </el-select>
      <el-button type="primary" @click="executeAPICall" :loading="isLoading">执行请求</el-button>
    </div>
    
    <!-- POI搜索表单 -->
    <div v-if="selectedAPI === 'poi'" class="api-form">
      <h3>POI搜索</h3>
      <el-form :model="poiForm" label-width="120px">
        <el-form-item label="关键词">
          <el-input v-model="poiForm.keywords" placeholder="例如：餐厅、银行、学校等" />
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="poiForm.city" placeholder="例如：北京" />
        </el-form-item>
        <el-form-item label="每页记录数">
          <el-input-number v-model="poiForm.offset" :min="1" :max="25" :step="1" />
        </el-form-item>
        <el-form-item label="页码">
          <el-input-number v-model="poiForm.page" :min="1" :max="100" :step="1" />
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 路线规划表单 -->
    <div v-if="selectedAPI === 'route'" class="api-form">
      <h3>路线规划</h3>
      <el-form :model="routeForm" label-width="120px">
        <el-form-item label="起点">
          <el-input v-model="routeForm.origin" placeholder="地址或经纬度，例如：北京或116.481028,39.989643" />
        </el-form-item>
        <el-form-item label="终点">
          <el-input v-model="routeForm.destination" placeholder="地址或经纬度，例如：上海或121.473701,31.230416" />
        </el-form-item>
        <el-form-item label="策略">
          <el-select v-model="routeForm.strategy">
            <el-option label="最快捷模式" :value="0" />
            <el-option label="最经济模式" :value="1" />
            <el-option label="最短距离" :value="2" />
            <el-option label="考虑实时路况" :value="4" />
            <el-option label="多策略" :value="5" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 天气查询表单 -->
    <div v-if="selectedAPI === 'weather'" class="api-form">
      <h3>天气查询</h3>
      <el-form :model="weatherForm" label-width="120px">
        <el-form-item label="城市">
          <el-input v-model="weatherForm.city" placeholder="城市名称或编码，例如：北京" />
        </el-form-item>
        <el-form-item label="类型">
          <el-radio-group v-model="weatherForm.extensions">
            <el-radio label="base">实况天气</el-radio>
            <el-radio label="all">预报天气</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 地理编码表单 -->
    <div v-if="selectedAPI === 'geocode'" class="api-form">
      <h3>地理编码</h3>
      <el-form :model="geocodeForm" label-width="120px">
        <el-form-item label="地址">
          <el-input v-model="geocodeForm.address" placeholder="结构化地址，例如：北京市朝阳区阜通东大街6号" />
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="geocodeForm.city" placeholder="例如：北京" />
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 逆地理编码表单 -->
    <div v-if="selectedAPI === 'regeocode'" class="api-form">
      <h3>逆地理编码</h3>
      <el-form :model="regeoForm" label-width="120px">
        <el-form-item label="坐标">
          <el-input v-model="regeoForm.location" placeholder="经纬度坐标，例如：116.481028,39.989643" />
        </el-form-item>
        <el-form-item label="搜索半径">
          <el-input-number v-model="regeoForm.radius" :min="1" :max="3000" :step="100" />
        </el-form-item>
        <el-form-item label="返回数据类型">
          <el-radio-group v-model="regeoForm.extensions">
            <el-radio label="base">基本地址信息</el-radio>
            <el-radio label="all">详细地址信息</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 结果展示 -->
    <div class="api-result" v-if="apiResult">
      <h3>API返回结果</h3>
      <div class="result-status" :class="{ success: apiResult.status === '1', error: apiResult.status !== '1' }">
        状态: {{ apiResult.status === '1' ? '成功' : '失败' }}
        <span v-if="apiResult.info && apiResult.status !== '1'">错误信息: {{ apiResult.info }}</span>
      </div>
      
      <div v-if="selectedAPI === 'poi' && apiResult.pois" class="poi-results">
        <h4>找到 {{ apiResult.count }} 个地点</h4>
        <div class="poi-list">
          <div v-for="(poi, index) in apiResult.pois" :key="index" class="poi-item">
            <div class="poi-name">{{ poi.name }}</div>
            <div class="poi-address">地址: {{ poi.address }}</div>
            <div class="poi-type">类型: {{ poi.type }}</div>
            <div class="poi-location">坐标: {{ poi.location }}</div>
          </div>
        </div>
      </div>
      
      <div v-if="selectedAPI === 'route' && apiResult.route" class="route-results">
        <h4>路线信息</h4>
        <div class="route-info">
          <div>路线距离: {{ apiResult.route.paths?.[0]?.distance || 0 }} 米</div>
          <div>预计时间: {{ (apiResult.route.paths?.[0]?.duration || 0) / 60 }} 分钟</div>
          <div>过路费: {{ apiResult.route.paths?.[0]?.tolls || 0 }} 元</div>
        </div>
      </div>
      
      <div v-if="selectedAPI === 'weather' && apiResult.lives" class="weather-results">
        <h4>天气信息</h4>
        <div class="weather-info">
          <div>城市: {{ apiResult.lives[0].city }}</div>
          <div>天气: {{ apiResult.lives[0].weather }}</div>
          <div>温度: {{ apiResult.lives[0].temperature }}°C</div>
          <div>风向: {{ apiResult.lives[0].winddirection }}</div>
          <div>风力: {{ apiResult.lives[0].windpower }}</div>
          <div>湿度: {{ apiResult.lives[0].humidity }}%</div>
          <div>报告时间: {{ apiResult.lives[0].reporttime }}</div>
        </div>
      </div>
      
      <div v-if="selectedAPI === 'weather' && apiResult.forecasts" class="forecast-results">
        <h4>天气预报</h4>
        <div class="forecast-info">
          <div v-for="(forecast, index) in apiResult.forecasts[0].casts" :key="index" class="forecast-day">
            <div>日期: {{ forecast.date }}</div>
            <div>白天天气: {{ forecast.dayweather }}</div>
            <div>白天温度: {{ forecast.daytemp }}°C</div>
            <div>白天风向: {{ forecast.daywind }}</div>
            <div>白天风力: {{ forecast.daypower }}</div>
            <div>夜间天气: {{ forecast.nightweather }}</div>
            <div>夜间温度: {{ forecast.nighttemp }}°C</div>
            <div>夜间风向: {{ forecast.nightwind }}</div>
            <div>夜间风力: {{ forecast.nightpower }}</div>
          </div>
        </div>
      </div>
      
      <div v-if="selectedAPI === 'geocode' && apiResult.geocodes" class="geocode-results">
        <h4>地理编码结果</h4>
        <div class="geocode-list">
          <div v-for="(geocode, index) in apiResult.geocodes" :key="index" class="geocode-item">
            <div>格式化地址: {{ geocode.formatted_address }}</div>
            <div>坐标: {{ geocode.location }}</div>
            <div>省份: {{ geocode.province }}</div>
            <div>城市: {{ geocode.city }}</div>
            <div>区县: {{ geocode.district }}</div>
            <div>级别: {{ geocode.level }}</div>
          </div>
        </div>
      </div>
      
      <div v-if="selectedAPI === 'regeocode' && apiResult.regeocode" class="regeo-results">
        <h4>逆地理编码结果</h4>
        <div class="regeo-info">
          <div>格式化地址: {{ apiResult.regeocode.formatted_address }}</div>
          <div v-if="apiResult.regeocode.addressComponent">
            <div>国家: {{ apiResult.regeocode.addressComponent.country }}</div>
            <div>省份: {{ apiResult.regeocode.addressComponent.province }}</div>
            <div>城市: {{ apiResult.regeocode.addressComponent.city }}</div>
            <div>区县: {{ apiResult.regeocode.addressComponent.district }}</div>
            <div>乡镇: {{ apiResult.regeocode.addressComponent.township }}</div>
            <div>街道: {{ apiResult.regeocode.addressComponent.streetNumber?.street }}</div>
          </div>
        </div>
      </div>
      
      <el-collapse v-if="apiResult">
        <el-collapse-item title="原始返回数据">
          <pre class="raw-result">{{ JSON.stringify(apiResult, null, 2) }}</pre>
        </el-collapse-item>
      </el-collapse>
    </div>
    
    <!-- 请求历史 -->
    <div class="request-history" v-if="apiService?.requestHistory.length">
      <h3>请求历史</h3>
      <el-table :data="apiService.requestHistory" style="width: 100%">
        <el-table-column prop="timestamp" label="时间" width="180" />
        <el-table-column prop="type" label="API类型" width="150" />
        <el-table-column label="参数">
          <template #default="scope">
            {{ JSON.stringify(scope.row.params).substring(0, 50) + '...' }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="scope">
            {{ scope.row.response?.status === '1' ? '成功' : '失败' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button size="small" @click="viewHistoryDetails(scope.row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <!-- 历史详情弹窗 -->
    <el-dialog
      v-model="historyDialogVisible"
      title="请求详情"
      width="70%"
    >
      <div v-if="selectedHistory">
        <h4>请求参数</h4>
        <pre>{{ JSON.stringify(selectedHistory.params, null, 2) }}</pre>
        
        <h4>响应结果</h4>
        <pre>{{ JSON.stringify(selectedHistory.response, null, 2) }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import 'element-plus/es/components/message/style/css';

// 引用地图API服务组件
const apiService = ref<any>(null);

// API选项
const apiOptions = [
  { label: 'POI搜索', value: 'poi' },
  { label: '路线规划', value: 'route' },
  { label: '天气查询', value: 'weather' },
  { label: '地理编码', value: 'geocode' },
  { label: '逆地理编码', value: 'regeocode' }
];

// 当前选择的API
const selectedAPI = ref('poi');

// 加载状态
const isLoading = ref(false);

// API返回结果
const apiResult = ref<any>(null);

// 表单数据
const poiForm = reactive({
  keywords: '餐厅',
  city: '北京',
  types: '',
  offset: 10,
  page: 1,
  extensions: 'all'
});

const routeForm = reactive({
  origin: '北京',
  destination: '上海',
  strategy: 0
});

const weatherForm = reactive({
  city: '北京',
  extensions: 'base'
});

const geocodeForm = reactive({
  address: '北京市朝阳区阜通东大街6号',
  city: '北京'
});

const regeoForm = reactive({
  location: '116.481028,39.989643',
  radius: 1000,
  extensions: 'all'
});

// 历史记录相关
const historyDialogVisible = ref(false);
const selectedHistory = ref<any>(null);

// 查看历史详情
const viewHistoryDetails = (historyItem: any) => {
  selectedHistory.value = historyItem;
  historyDialogVisible.value = true;
};

// 执行API调用
const executeAPICall = async () => {
  if (!apiService.value) {
    ElMessage.error('API服务组件未初始化');
    return;
  }
  
  isLoading.value = true;
  try {
    let result;
    
    switch (selectedAPI.value) {
      case 'poi':
        result = await apiService.value.searchPOI(poiForm);
        break;
      case 'route':
        result = await apiService.value.routePlanning(routeForm);
        break;
      case 'weather':
        result = await apiService.value.weather(weatherForm);
        break;
      case 'geocode':
        result = await apiService.value.geocode(geocodeForm);
        break;
      case 'regeocode':
        result = await apiService.value.regeocode(regeoForm);
        break;
      default:
        ElMessage.warning('未选择API类型');
        return;
    }
    
    apiResult.value = result;
    
    if (result.status === '1') {
      ElMessage.success('API调用成功');
    } else {
      ElMessage.error(`API调用失败: ${result.info || '未知错误'}`);
    }
  } catch (error) {
    ElMessage.error(`执行出错: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    isLoading.value = false;
  }
};

// 初始化
onMounted(async () => {
  try {
    // 这里需要异步导入组件
    const { default: GaoDeMapAPIService } = await import('../GaoDeMapAPIService.vue');
    
    // 创建组件实例
    const componentConstructor = new GaoDeMapAPIService();
    
    // 等待组件设置完成
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // 设置API服务引用
    apiService.value = componentConstructor;
    
    console.log('高德地图API服务组件初始化成功');
  } catch (error) {
    console.error('初始化高德地图API服务组件失败:', error);
    ElMessage.error('初始化高德地图API服务组件失败');
  }
});
</script>

<style scoped>
.map-geo-api-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
  color: #409EFF;
}

.api-selection {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.api-form {
  margin-top: 20px;
  padding: 20px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.api-result {
  margin-top: 20px;
  padding: 20px;
  border-radius: 4px;
  background-color: #f5f7fa;
}

.result-status {
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
}

.result-status.success {
  background-color: #f0f9eb;
  color: #67c23a;
}

.result-status.error {
  background-color: #fef0f0;
  color: #f56c6c;
}

.poi-results, .route-results, .weather-results, 
.forecast-results, .geocode-results, .regeo-results {
  margin-top: 15px;
}

.poi-list, .geocode-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 15px;
  margin-top: 10px;
}

.poi-item, .geocode-item {
  padding: 10px;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.poi-name {
  font-weight: bold;
  margin-bottom: 5px;
}

.route-info, .weather-info, .forecast-info, .regeo-info {
  padding: 15px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.forecast-day {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.forecast-day:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.raw-result {
  background-color: #282c34;
  color: #abb2bf;
  padding: 10px;
  border-radius: 4px;
  overflow: auto;
  max-height: 300px;
}

.request-history {
  margin-top: 30px;
}
</style> 