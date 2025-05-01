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
    <!-- 使用之前文件中的模板内容 -->
    <div class="dashboard-layout">
      <!-- 左侧控制面板 -->
      <div class="control-panel" :class="{'full-width-panel': !isMapVisible}" :style="{ width: controlPanelWidth + 'px' }">
        <div class="panel-header">
          <h2>地理信息服务控制台</h2>
          <div class="panel-subtitle">实时地理数据分析与智能决策</div>
        </div>
        
        <!-- 拖拽分割线 -->
        <div 
          v-if="isMapVisible" 
          class="resizer" 
          @mousedown="startResize"
          :style="{ right: '0' }"
        ></div>
        
        <!-- 控制台内容区域 -->
        <div class="panel-content">
          <!-- 标签页切换栏 -->
          <el-tabs v-model="activeTab" class="geo-tabs">
            <!-- 天气查询标签页 -->
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
                      <!-- 天气信息内容 -->
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
                      <!-- 天气预报内容 -->
                    </div>
                  </el-card>
                  
                  <!-- 添加DeepSeek智能分析结果卡片 -->
                  <el-card v-if="weatherResult.forecast_advice" class="weather-card analysis-card" shadow="hover">
                    <template #header>
                      <div class="weather-header">
                        <span>DeepSeek天气智能分析</span>
                        <el-tag size="small" type="success">AI生成</el-tag>
                      </div>
                    </template>
                    
                    <div class="analysis-content deepseek-analysis">
                      {{ weatherResult.forecast_advice }}
                    </div>
                  </el-card>
                  
                  <!-- 添加天气数据可视化图表区域 -->
                  <div v-if="weatherResult.forecasts" class="weather-charts-container">
                    <h3 class="charts-title">
                      <el-icon><DataAnalysis /></el-icon>
                      <span>天气数据可视化</span>
                    </h3>
                    
                    <div class="charts-grid">
                      <!-- 温度曲线图 -->
                      <div class="chart-card">
                        <div class="chart-title">温度预报趋势</div>
                        <div ref="tempChartRef" class="chart-container"></div>
                      </div>
                      
                      <!-- 降水量图表 -->
                      <div class="chart-card">
                        <div class="chart-title">降水量预报</div>
                        <div ref="precipChartRef" class="chart-container"></div>
                      </div>
                      
                      <!-- 风力图表 -->
                      <div class="chart-card">
                        <div class="chart-title">风力预报趋势</div>
                        <div ref="windChartRef" class="chart-container"></div>
                      </div>
                      
                      <!-- 历史天气对比图表 -->
                      <div class="chart-card">
                        <div class="chart-title">
                          历史天气对比
                          <el-tag size="small" type="info" v-if="historyWeatherData.loaded">过去7天</el-tag>
                        </div>
                        <div v-if="historyWeatherData.loaded" ref="historyChartRef" class="chart-container"></div>
                        <div v-else class="loading-container">
                          <el-skeleton animated :rows="5" />
                          <div class="loading-text">正在加载历史数据...</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <!-- 其他标签页 -->
          </el-tabs>
        </div>
      </div>
      
      <!-- 地图容器 -->
      <div class="map-container" v-if="isMapVisible" :style="{ left: controlPanelWidth + 'px' }">
        <!-- 地图内容 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, computed, watch } from 'vue';
import { ElMessage, ElNotification, ElMessageBox } from 'element-plus';
import {
  Search, 
  Location, 
  MapLocation, 
  Sunny, 
  Cloudy, 
  Lightning, 
  Moon, 
  WindPower, 
  Histogram, 
  Expand, 
  Picture, 
  DataAnalysis,
  Position, 
  Files,
  Compass, 
  Money, 
  Guide, 
  Timer, 
  Odometer, 
  Close,
  Delete, 
  SetUp, 
  PictureFilled, 
  Fold, 
  Monitor
} from '@element-plus/icons-vue';
import GeoApiService from '../../services/GeoApiService';
// 引入echarts (统一导入方式)
import * as echarts from 'echarts/core';
import { PieChart, BarChart, LineChart } from 'echarts/charts';
import {
  TitleComponent, 
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必要的组件
echarts.use([
  PieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer
]);

// 定义类型
type EChartsInstance = echarts.ECharts;

// 各种变量和状态
const activeTab = ref('weather');
const isMapVisible = ref(false);
const controlPanelWidth = ref(400);
const loading = ref(false);

// 地图实例
let map: any = null;

// 图表实例
let poiDistChartInstance: EChartsInstance | null = null;
let poiRatingChartInstance: EChartsInstance | null = null;
let poiCrowdChartInstance: EChartsInstance | null = null;
let poiTypeChartInstance: EChartsInstance | null = null;
let tempChart: EChartsInstance | null = null;
let precipChart: EChartsInstance | null = null;
let windChart: EChartsInstance | null = null;
let historyChart: EChartsInstance | null = null;

// 图表相关ref
const tempChartRef = ref<HTMLElement | null>(null);
const precipChartRef = ref<HTMLElement | null>(null);
const windChartRef = ref<HTMLElement | null>(null);
const historyChartRef = ref<HTMLElement | null>(null);

// 历史天气数据
const historyWeatherData = ref<any>({
  loaded: false,
  data: []
});

// 天气相关数据
const weatherForm = reactive({
  city: '北京',
  extensions: 'base' // base实况天气，all天气预报
});

const weatherResult = ref<any>({
  status: '0'
});

// API密钥
const AMAP_KEY = ref('');

// 开始拖拽
const startResize = (e: MouseEvent) => {
  const startX = e.clientX;
  const startWidth = controlPanelWidth.value;
  
  const handleMouseMove = (moveEvent: MouseEvent) => {
    const offsetX = moveEvent.clientX - startX;
    const newWidth = Math.max(300, Math.min(800, startWidth + offsetX));
    controlPanelWidth.value = newWidth;
  };
  
  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.classList.remove('dragging-active');
  };
  
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  document.body.classList.add('dragging-active');
};

// 切换地图可见性
const toggleMapVisibility = () => {
  isMapVisible.value = !isMapVisible.value;
};

// DeepSeek API的配置
const DEEPSEEK_API_KEY = 'sk-e120c0aae8074a368d26fff5136a83fd';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 调用DeepSeek API获取智能分析
const callDeepSeekAPI = async (prompt: string): Promise<string> => {
  try {
    console.log('调用DeepSeek API分析天气数据...');
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的气象数据分析师，擅长分析气象数据并提供有价值的见解和建议。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      console.error('DeepSeek API返回格式不正确:', data);
      return '无法获取智能分析结果，请稍后再试';
    }
  } catch (error) {
    console.error('调用DeepSeek API出错:', error);
    // 如果API调用失败，返回错误信息
    return `智能分析暂时不可用。错误: ${error instanceof Error ? error.message : String(error)}`;
  }
};

// 使用DeepSeek API生成天气分析
const generateWeatherAnalysisWithAI = async (type: string, data: any): Promise<string> => {
  try {
    let prompt = '';
    
    if (type === 'weather' && data) {
      // 实况天气分析
      prompt = `请分析以下天气数据并提供专业的天气分析和建议：
城市: ${data.city}
天气: ${data.weather}
温度: ${data.temperature}°C
风向: ${data.winddirection}
风力: ${data.windpower}
湿度: ${data.humidity}%
报告时间: ${data.reporttime}

请提供:
1. 当前天气状况的简要分析
2. 适合的户外活动建议
3. 出行穿着建议
4. 对身体健康的影响和注意事项
5. 如果有恶劣天气，请提供安全预警
`;
    } else if (type === 'forecast' && data) {
      // 天气预报分析
      const castsData = data.casts.map((cast: any, index: number) => {
        return `日期${index+1}: ${cast.date}
白天天气: ${cast.dayweather}, 温度: ${cast.daytemp}°C, 风向: ${cast.daywind}, 风力: ${cast.daypower}
夜间天气: ${cast.nightweather}, 温度: ${cast.nighttemp}°C, 风向: ${cast.nightwind}, 风力: ${cast.nightpower}`;
      }).join('\n\n');
      
      prompt = `请分析以下天气预报数据并提供专业的分析和建议：
城市: ${data.city}

${castsData}

请提供:
1. 未来天气趋势分析
2. 温度变化趋势分析
3. 适宜的户外活动安排建议
4. 是否有极端天气预警
5. 对旅行和出行的建议
`;
    } else {
      return '无法分析，数据不完整或类型不支持';
    }
    
    // 调用DeepSeek API获取分析
    const analysis = await callDeepSeekAPI(prompt);
    return analysis;
  } catch (error) {
    console.error('生成AI天气分析出错:', error);
    // 调用失败时返回错误信息
    return `AI分析生成失败: ${error instanceof Error ? error.message : String(error)}`;
  }
};

// 天气查询处理函数
const handleWeatherSearch = async () => {
  try {
    loading.value = true;
    
    // 准备天气查询参数
    const weatherParams = {
      ...weatherForm,
      output: 'json',
      key: AMAP_KEY.value
    };
    
    // 模拟API调用
    const mockResponse = {
      status: '1',
      info: 'OK',
      infocode: '10000',
      lives: [
        {
          province: '北京市',
          city: weatherForm.city,
          adcode: '110000',
          weather: '晴',
          temperature: '25',
          winddirection: '东',
          windpower: '4',
          humidity: '65',
          reporttime: new Date().toISOString().replace('T', ' ').slice(0, 19)
        }
      ]
    };
    
    // 保存天气查询结果
    weatherResult.value = mockResponse;
    
    // 智能增强处理 - 天气实况
    if (weatherResult.value.lives && weatherResult.value.lives.length > 0) {
      // 生成天气建议
      ElMessage({
        message: '正在生成天气分析...',
        type: 'info',
        offset: 80
      });
      
      // 使用DeepSeek API生成天气建议
      weatherResult.value.weather_advice = await generateWeatherAnalysisWithAI('weather', weatherResult.value.lives[0]);
      
      // 通知用户
      ElMessage({
        message: '天气分析已生成',
        type: 'success',
        offset: 80
      });
    }
    
    // 生成可视化数据
    generateWeatherVisualization(mockResponse);
    
  } catch (error) {
    console.error('天气查询出错:', error);
    ElMessage.error(`天气查询出错: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    loading.value = false;
  }
};

// 生成天气数据可视化
const generateWeatherVisualization = (forecastData: any) => {
  if (!forecastData || !forecastData.lives) {
    console.error('无法生成可视化，数据不完整');
    return;
  }
  
  // 准备模拟数据
  const dates = ['05-01', '05-02', '05-03', '05-04', '05-05'];
  const dayTemps = [22, 24, 25, 23, 21];
  const nightTemps = [15, 17, 18, 16, 14];
  const precipData = [0, 5, 10, 2, 0];
  const dayWinds = [3, 4, 5, 4, 3];
  const nightWinds = [2, 3, 4, 3, 2];
  
  // 获取历史天气数据(模拟)
  getHistoryWeatherData(forecastData.lives[0].city);
  
  // 绘制温度图表
  nextTick(() => {
    // 温度曲线图
    if (tempChartRef.value) {
      tempChart = echarts.init(tempChartRef.value);
      const tempOption = {
        title: {
          text: '温度预报',
          left: 'center',
          textStyle: {
            color: '#333'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br />{a0}: {c0}°C<br />{a1}: {c1}°C'
        },
        legend: {
          data: ['白天温度', '夜间温度'],
          bottom: 0
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: {
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: '温度(°C)',
          axisLabel: {
            formatter: '{value} °C'
          }
        },
        series: [
          {
            name: '白天温度',
            type: 'line',
            data: dayTemps,
            smooth: true,
            lineStyle: {
              width: 3,
              color: '#FF9800'
            },
            itemStyle: {
              color: '#FF9800'
            }
          },
          {
            name: '夜间温度',
            type: 'line',
            data: nightTemps,
            smooth: true,
            lineStyle: {
              width: 3,
              color: '#03A9F4'
            },
            itemStyle: {
              color: '#03A9F4'
            }
          }
        ]
      };
      tempChart.setOption(tempOption);
    }
    
    // 降水量图表
    if (precipChartRef.value) {
      precipChart = echarts.init(precipChartRef.value);
      const precipOption = {
        title: {
          text: '预计降水量',
          left: 'center',
          textStyle: {
            color: '#333'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: '{b}<br />降水量: {c} mm'
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: {
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: '降水量(mm)',
          axisLabel: {
            formatter: '{value} mm'
          }
        },
        series: [
          {
            name: '降水量',
            type: 'bar',
            data: precipData,
            itemStyle: {
              color: '#2196F3'
            },
            emphasis: {
              itemStyle: {
                color: '#1976D2'
              }
            }
          }
        ]
      };
      precipChart.setOption(precipOption);
    }
    
    // 风力图表
    if (windChartRef.value) {
      windChart = echarts.init(windChartRef.value);
      const windOption = {
        title: {
          text: '风力预报',
          left: 'center',
          textStyle: {
            color: '#333'
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: '{b}<br />{a0}: {c0}级<br />{a1}: {c1}级'
        },
        legend: {
          data: ['白天风力', '夜间风力'],
          bottom: 0
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: {
            rotate: 30
          }
        },
        yAxis: {
          type: 'value',
          name: '风力(级)',
          axisLabel: {
            formatter: '{value} 级'
          },
          max: 12
        },
        series: [
          {
            name: '白天风力',
            type: 'bar',
            data: dayWinds,
            itemStyle: {
              color: '#4CAF50'
            }
          },
          {
            name: '夜间风力',
            type: 'bar',
            data: nightWinds,
            itemStyle: {
              color: '#8BC34A'
            }
          }
        ]
      };
      windChart.setOption(windOption);
    }
  });
};

// 获取历史天气数据(模拟)
const getHistoryWeatherData = async (city: string) => {
  try {
    // 模拟API请求延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 生成模拟的历史天气数据(过去7天)
    const currentDate = new Date();
    const dates = [];
    const temperatures = [];
    const precipitations = [];
    
    for (let i = 7; i >= 1; i--) {
      const date = new Date();
      date.setDate(currentDate.getDate() - i);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      dates.push(`${month}-${day}`);
      
      // 模拟温度数据(15-30度)
      temperatures.push(Math.floor(Math.random() * 15) + 15);
      
      // 模拟降水数据(0-20mm)
      precipitations.push(Math.random() < 0.3 ? Math.floor(Math.random() * 20) : 0);
    }
    
    historyWeatherData.value = {
      loaded: true,
      city,
      dates,
      temperatures,
      precipitations
    };
    
    // 绘制历史数据对比图表
    nextTick(() => {
      if (historyChartRef.value && historyWeatherData.value.loaded) {
        historyChart = echarts.init(historyChartRef.value);
        const historyOption = {
          title: {
            text: '历史天气对比',
            left: 'center',
            textStyle: {
              color: '#333'
            }
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          legend: {
            data: ['历史温度', '历史降水'],
            bottom: 0
          },
          xAxis: {
            type: 'category',
            data: historyWeatherData.value.dates,
            axisLabel: {
              rotate: 30
            }
          },
          yAxis: [
            {
              type: 'value',
              name: '温度(°C)',
              position: 'left',
              axisLabel: {
                formatter: '{value} °C'
              }
            },
            {
              type: 'value',
              name: '降水量(mm)',
              position: 'right',
              axisLabel: {
                formatter: '{value} mm'
              }
            }
          ],
          series: [
            {
              name: '历史温度',
              type: 'line',
              data: historyWeatherData.value.temperatures,
              smooth: true,
              yAxisIndex: 0,
              lineStyle: {
                width: 3,
                color: '#FF9800'
              },
              itemStyle: {
                color: '#FF9800'
              }
            },
            {
              name: '历史降水',
              type: 'bar',
              data: historyWeatherData.value.precipitations,
              yAxisIndex: 1,
              itemStyle: {
                color: '#2196F3'
              }
            }
          ]
        };
        historyChart.setOption(historyOption);
      }
    });
    
  } catch (error) {
    console.error('获取历史天气数据失败:', error);
    historyWeatherData.value = {
      loaded: false,
      error: `获取历史数据失败: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

// 监听窗口大小变化，调整图表大小
onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  // 销毁图表实例
  tempChart?.dispose();
  precipChart?.dispose();
  windChart?.dispose();
  historyChart?.dispose();
});

// 处理窗口大小变化
const handleResize = () => {
  tempChart?.resize();
  precipChart?.resize();
  windChart?.resize();
  historyChart?.resize();
};
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

/* 添加天气数据可视化图表的样式 */
.weather-charts-container {
  margin-top: 25px;
}

.charts-title {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: #1976d2;
}

.charts-title .el-icon {
  margin-right: 8px;
  font-size: 1.3rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.chart-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chart-title {
  padding: 12px 15px;
  background-color: #f5f7fa;
  font-weight: 500;
  font-size: 1rem;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chart-container {
  height: 300px;
  padding: 10px;
}

.loading-container {
  height: 300px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.loading-text {
  text-align: center;
  margin-top: 15px;
  color: #909399;
}

/* DeepSeek AI 分析样式 */
.analysis-card {
  margin-bottom: 25px;
}

.deepseek-analysis {
  padding: 15px;
  line-height: 1.6;
  font-size: 1rem;
  white-space: pre-line;
  background-color: rgba(25, 118, 210, 0.03);
  border-left: 3px solid #1976d2;
  border-radius: 4px;
}

@media (max-width: 992px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

/* 确保图表容器样式适应调整后的布局 */
.charts-container {
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
}
</style>