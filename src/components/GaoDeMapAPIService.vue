/**
 * 文件名: GaoDeMapAPIService.vue
 * 描述: 高德地图API服务组件
 * 在项目中的作用: 
 * - 封装高德地图API的调用和交互功能
 * - 提供地图展示、标记、搜索等地图服务功能
 * - 支持地理编码、路径规划、定位等地理信息服务
 * - 作为地图相关功能的核心组件，供其他组件调用
 */

<script setup lang="ts">
import { ref, reactive } from 'vue';

// 配置信息
const CONFIG = {
  "amap_key": "206278d547a0c6408987f2a0002e2243",
  "amap_api_base": "https://restapi.amap.com/v3",
};

// 响应状态
const responseStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
const responseMessage = ref<string>('');
const requestId = ref<string>('');

// 接口返回的数据
const responseData = ref<any>(null);

// 记录请求历史
const requestHistory = reactive<{
  type: string;
  params: any;
  response: any;
  timestamp: string;
}[]>([]);

// 生成请求ID
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

// 高德地图API调用函数
const callAmapAPI = async (endpoint: string, params: any): Promise<any> => {
  try {
    responseStatus.value = 'loading';
    
    // 添加公共参数
    const queryParams = {
      ...params,
      key: CONFIG.amap_key,
      output: "json"
    };
    
    // 构建URL和查询参数
    const url = new URL(`${CONFIG.amap_api_base}/${endpoint}`);
    Object.keys(queryParams).forEach(key => {
      url.searchParams.append(key, queryParams[key]);
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
    
    // 保存请求历史
    requestHistory.push({
      type: endpoint,
      params: queryParams,
      response: result,
      timestamp: new Date().toISOString()
    });
    
    responseStatus.value = 'success';
    responseData.value = result;
    return result;
  } catch (error) {
    console.error(`调用高德地图API出错: ${error instanceof Error ? error.message : String(error)}`);
    responseStatus.value = 'error';
    responseMessage.value = `API调用失败: ${error instanceof Error ? error.message : String(error)}`;
    return { status: "0", info: `API调用失败: ${error instanceof Error ? error.message : String(error)}` };
  }
};

// POI搜索
const searchPOI = async (params: {
  keywords?: string;
  city?: string;
  types?: string;
  page?: number;
  offset?: number;
  extensions?: 'base' | 'all';
}): Promise<any> => {
  requestId.value = generateRequestId();
  return await callAmapAPI("place/text", params);
};

// 路线规划
const routePlanning = async (params: {
  origin: string;
  destination: string;
  strategy?: number;
  waypoints?: string;
  avoidpolygons?: string;
  avoidroad?: string;
}): Promise<any> => {
  requestId.value = generateRequestId();
  
  try {
    // 如果不是经纬度格式，尝试将城市名转换为坐标
    let origin = params.origin.trim();
    let destination = params.destination.trim();
    
    // 简单判断是否为经纬度格式（包含逗号且两边都是数字）
    const isCoordinateFormat = (str: string) => {
      return str.includes(',') && str.replace('.', '').replace('-', '').replace(',', '').match(/^\d+$/);
    };
    
    if (!isCoordinateFormat(origin)) {
      // 尝试将城市名转换为经纬度
      console.log(`尝试将城市名 '${origin}' 转换为坐标`);
      const geocodeParams = { address: origin, city: "全国" };
      const geocodeResult = await callAmapAPI("geocode/geo", geocodeParams);
      
      if (geocodeResult.status === "1" && geocodeResult.geocodes && geocodeResult.geocodes.length > 0) {
        origin = geocodeResult.geocodes[0].location;
        console.log(`城市名 '${params.origin}' 转换为坐标: ${origin}`);
      } else {
        return { status: "0", info: `无法将起点 '${params.origin}' 转换为坐标` };
      }
    }
    
    if (!isCoordinateFormat(destination)) {
      // 尝试将城市名转换为经纬度
      console.log(`尝试将城市名 '${destination}' 转换为坐标`);
      const geocodeParams = { address: destination, city: "全国" };
      const geocodeResult = await callAmapAPI("geocode/geo", geocodeParams);
      
      if (geocodeResult.status === "1" && geocodeResult.geocodes && geocodeResult.geocodes.length > 0) {
        destination = geocodeResult.geocodes[0].location;
        console.log(`城市名 '${params.destination}' 转换为坐标: ${destination}`);
      } else {
        return { status: "0", info: `无法将终点 '${params.destination}' 转换为坐标` };
      }
    }
    
    // 更新参数
    const updatedParams = {
      ...params,
      origin,
      destination
    };
    
    // 调用高德API
    return await callAmapAPI("direction/driving", updatedParams);
  } catch (error) {
    console.error(`路线规划处理错误: ${error instanceof Error ? error.message : String(error)}`);
    return { status: "0", info: `路线规划处理错误: ${error instanceof Error ? error.message : String(error)}` };
  }
};

// 地理编码
const geocode = async (params: {
  address: string;
  city?: string;
  batch?: boolean;
}): Promise<any> => {
  requestId.value = generateRequestId();
  return await callAmapAPI("geocode/geo", params);
};

// 逆地理编码
const regeocode = async (params: {
  location: string;
  radius?: number;
  extensions?: 'base' | 'all';
}): Promise<any> => {
  requestId.value = generateRequestId();
  return await callAmapAPI("geocode/regeo", params);
};

// 天气查询
const weather = async (params: {
  city: string;
  extensions?: 'base' | 'all';
}): Promise<any> => {
  requestId.value = generateRequestId();
  return await callAmapAPI("weather/weatherInfo", params);
};

// 行政区域查询
const district = async (params: {
  keywords: string;
  subdistrict?: number;
  extensions?: 'base' | 'all';
}): Promise<any> => {
  requestId.value = generateRequestId();
  return await callAmapAPI("config/district", params);
};

// 交通态势
const trafficStatus = async (params: {
  rectangle: string;
  level?: number;
}): Promise<any> => {
  requestId.value = generateRequestId();
  return await callAmapAPI("traffic/status/rectangle", params);
};

// 暴露API
defineExpose({
  searchPOI,
  routePlanning,
  geocode,
  regeocode,
  weather,
  district,
  trafficStatus,
  responseStatus,
  responseData,
  responseMessage,
  requestId,
  requestHistory
});
</script>

<template>
  <!-- 此组件无UI，仅作为服务使用 -->
</template> 