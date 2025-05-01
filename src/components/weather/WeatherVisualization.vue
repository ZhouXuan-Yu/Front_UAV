/**
 * 文件名: WeatherVisualization.vue
 * 描述: 天气数据可视化组件
 * 功能: 展示温度、降水量、风力和历史天气数据的图表
 */

<template>
  <div class="weather-charts-container">
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
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { DataAnalysis } from '@element-plus/icons-vue';
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

// 接收的属性
const props = defineProps({
  // 天气数据
  weatherData: {
    type: Object,
    required: true
  },
  // 城市名称
  city: {
    type: String,
    default: ''
  }
});

// 图表实例
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

// 监听属性变化
watch(() => props.weatherData, (newVal) => {
  if (newVal) {
    generateWeatherVisualization();
  }
}, { deep: true });

watch(() => props.city, (newVal) => {
  if (newVal) {
    getHistoryWeatherData(newVal);
  }
});

// 生成天气数据可视化
const generateWeatherVisualization = () => {
  // 准备模拟数据
  const dates = ['05-01', '05-02', '05-03', '05-04', '05-05'];
  const dayTemps = [22, 24, 25, 23, 21];
  const nightTemps = [15, 17, 18, 16, 14];
  const precipData = [0, 5, 10, 2, 0];
  const dayWinds = [3, 4, 5, 4, 3];
  const nightWinds = [2, 3, 4, 3, 2];
  
  // 如果有真实数据，可以从props.weatherData中提取
  if (props.weatherData.forecasts && props.weatherData.forecasts.length > 0 && props.weatherData.forecasts[0].casts) {
    const forecasts = props.weatherData.forecasts[0];
    const casts = forecasts.casts;
    
    // 如果有预报数据，使用真实数据
    if (casts && casts.length > 0) {
      // 提取日期
      const extractedDates = casts.map((cast: any) => {
        const date = new Date(cast.date);
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
      });
      
      // 提取温度数据
      const extractedDayTemps = casts.map((cast: any) => parseInt(cast.daytemp));
      const extractedNightTemps = casts.map((cast: any) => parseInt(cast.nighttemp));
      
      // 提取风力数据
      const extractedDayWinds = casts.map((cast: any) => {
        const power = cast.daypower;
        return power === '≤3' ? 3 : parseInt(power);
      });
      const extractedNightWinds = casts.map((cast: any) => {
        const power = cast.nightpower;
        return power === '≤3' ? 2 : parseInt(power);
      });
      
      // 使用提取的数据
      if (extractedDates.length > 0) dates.splice(0, extractedDates.length, ...extractedDates);
      if (extractedDayTemps.length > 0) dayTemps.splice(0, extractedDayTemps.length, ...extractedDayTemps);
      if (extractedNightTemps.length > 0) nightTemps.splice(0, extractedNightTemps.length, ...extractedNightTemps);
      if (extractedDayWinds.length > 0) dayWinds.splice(0, extractedDayWinds.length, ...extractedDayWinds);
      if (extractedNightWinds.length > 0) nightWinds.splice(0, extractedNightWinds.length, ...extractedNightWinds);
    }
  }
  
  // 模拟降水数据 (如果没有真实数据)
  for (let i = 0; i < dates.length; i++) {
    precipData[i] = Math.random() < 0.3 ? Math.floor(Math.random() * 20) : 0;
  }
  
  // 获取历史天气数据(模拟)
  if (props.city) {
    getHistoryWeatherData(props.city);
  }
  
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
const handleResize = () => {
  tempChart?.resize();
  precipChart?.resize();
  windChart?.resize();
  historyChart?.resize();
};

// 生命周期钩子
onMounted(() => {
  generateWeatherVisualization();
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
</script>

<style scoped>
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

@media (max-width: 992px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style> 