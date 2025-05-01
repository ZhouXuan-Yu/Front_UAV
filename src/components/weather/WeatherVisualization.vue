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

// 添加局部计时器变量
let resizeTimer: number | null = null;

// 历史天气数据
const historyWeatherData = ref<any>({
  loaded: false,
  data: []
});

// 监听属性变化
watch(() => props.weatherData, (newVal) => {
  if (newVal) {
    // 给DOM渲染留出时间，然后重新生成图表
    nextTick(() => {
      // 重新初始化图表
      if (tempChart) tempChart.dispose();
      if (precipChart) precipChart.dispose();
      if (windChart) windChart.dispose();
      if (historyChart) historyChart.dispose();
      
      tempChart = null;
      precipChart = null;
      windChart = null;
      historyChart = null;
      
      // 重新生成可视化图表
      generateWeatherVisualization();
    });
  }
}, { deep: true });

watch(() => props.city, (newVal) => {
  if (newVal) {
    // 重新获取历史天气数据
    getHistoryWeatherData(newVal);
  }
});

// 创建或更新图表的通用函数
const createOrUpdateChart = (chartRef: HTMLElement | null, chartInstance: EChartsInstance | null, options: any): EChartsInstance | null => {
  if (!chartRef) return null;
  
  try {
    // 如果图表实例已存在，先销毁
    if (chartInstance) {
      chartInstance.dispose();
    }
    
    // 创建新的图表实例，并添加设备像素比支持以提高清晰度
    const newChart = echarts.init(chartRef, null, {
      devicePixelRatio: window.devicePixelRatio || 1, // 支持高清屏幕
      renderer: 'canvas' // 使用canvas渲染器以获得更好的性能
    });
    
    // 设置图表选项
    newChart.setOption(options);
    
    return newChart;
  } catch (error) {
    console.error('创建/更新图表失败:', error);
    return null;
  }
};

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
    // 温度曲线图配置
    if (tempChartRef.value) {
      const tempOption = {
        title: {
          text: '温度预报',
          left: 'center',
          textStyle: {
            color: '#333',
            fontWeight: '600',
            fontSize: 16
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: '{b}<br />{a0}: {c0}°C<br />{a1}: {c1}°C',
          confine: true, // 确保提示框在图表区域内
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: '#ddd',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          }
        },
        legend: {
          data: ['白天温度', '夜间温度'],
          bottom: 0
        },
        grid: {
          top: 60,
          left: '3%',
          right: '4%',
          bottom: 30,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: {
            rotate: 30,
            color: '#666'
          },
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '温度(°C)',
          nameLocation: 'middle',
          nameGap: 30,
          axisLabel: {
            formatter: '{value}°C',
            color: '#333'
          },
          min: function(value) {
            // 计算最低温度（向下取整到5的倍数）
            const minTemp = Math.min(...nightTemps);
            return Math.floor(minTemp / 5) * 5;
          },
          max: function(value) {
            // 计算最高温度（向上取整到5的倍数）
            const maxTemp = Math.max(...dayTemps);
            return Math.ceil(maxTemp / 5) * 5;
          },
          interval: 5, // 固定间隔为5
          splitNumber: 5, // 固定分割段数
          axisTick: {
            alignWithLabel: true
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#333'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: '#ddd'
            }
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
            },
            symbolSize: 8,
            emphasis: {
              scale: true
            },
            markPoint: {
              data: [
                { type: 'max', name: '最高' },
                { type: 'min', name: '最低' }
              ]
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
            },
            symbolSize: 8,
            emphasis: {
              scale: true
            },
            markPoint: {
              data: [
                { type: 'max', name: '最高' },
                { type: 'min', name: '最低' }
              ]
            }
          }
        ]
      };
      
      // 使用通用函数创建图表
      tempChart = createOrUpdateChart(tempChartRef.value, tempChart, tempOption);
    }
    
    // 降水量图表
    if (precipChartRef.value) {
      const precipOption = {
        title: {
          text: '降水量预报',
          left: 'center',
          textStyle: {
            color: '#333',
            fontWeight: '600',
            fontSize: 16
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: '{b}<br />降水量: {c} mm',
          confine: true,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: '#ddd',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          }
        },
        grid: {
          top: 60,
          left: '3%',
          right: '4%',
          bottom: 30,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: {
            rotate: 30,
            color: '#666'
          },
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '降水量(mm)',
          nameLocation: 'middle',
          nameGap: 30,
          axisLabel: {
            formatter: '{value}mm',
            color: '#333'
          },
          min: 0,
          max: function(value) {
            // 计算最大降水量并向上取整到5的倍数
            const maxVal = Math.max(...precipData);
            return Math.max(5, Math.ceil(maxVal * 1.2 / 5) * 5);
          },
          interval: 5, // 固定间隔为5
          splitNumber: 5, // 固定分割段数
          axisTick: {
            alignWithLabel: true
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#333'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: '#ddd'
            }
          }
        },
        series: [
          {
            name: '降水量',
            type: 'bar',
            data: precipData,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#2196F3' },
                { offset: 1, color: '#0d47a1' }
              ])
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#5ab1ef' },
                  { offset: 0.7, color: '#1976D2' },
                  { offset: 1, color: '#0a3880' }
                ])
              }
            },
            barWidth: '60%',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(220, 220, 220, 0.2)'
            }
          }
        ]
      };
      
      // 使用通用函数创建图表
      precipChart = createOrUpdateChart(precipChartRef.value, precipChart, precipOption);
    }
    
    // 风力图表
    if (windChartRef.value) {
      const windOption = {
        title: {
          text: '风力预报',
          left: 'center',
          textStyle: {
            color: '#333',
            fontWeight: '600',
            fontSize: 16
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: '{b}<br />{a0}: {c0}级<br />{a1}: {c1}级',
          confine: true,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: '#ddd',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          }
        },
        legend: {
          data: ['白天风力', '夜间风力'],
          bottom: 0
        },
        grid: {
          top: 60,
          left: '3%',
          right: '4%',
          bottom: 30,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: dates,
          axisLabel: {
            rotate: 30,
            color: '#666'
          },
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '风力(级)',
          nameLocation: 'middle',
          nameGap: 30,
          axisLabel: {
            formatter: '{value}级',
            color: '#333'
          },
          min: 0,
          max: function(value) {
            // 计算最大风力值
            const maxVal = Math.max(...dayWinds, ...nightWinds);
            // 风力级别通常为整数，保持向上取整到整数
            return Math.min(12, Math.max(6, Math.ceil(maxVal * 1.2)));
          },
          interval: 1, // 风力刻度间隔为1
          splitNumber: 6,
          axisTick: {
            alignWithLabel: true
          },
          axisLine: {
            show: true,
            lineStyle: {
              color: '#333'
            }
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: '#ddd'
            }
          }
        },
        series: [
          {
            name: '白天风力',
            type: 'bar',
            data: dayWinds,
            barGap: 0,
            itemStyle: {
              color: '#4CAF50'
            },
            emphasis: {
              itemStyle: {
                color: '#2E7D32'
              }
            },
            barWidth: '30%'
          },
          {
            name: '夜间风力',
            type: 'bar',
            data: nightWinds,
            barGap: 0,
            itemStyle: {
              color: '#8BC34A'
            },
            emphasis: {
              itemStyle: {
                color: '#558B2F'
              }
            },
            barWidth: '30%'
          }
        ]
      };
      
      // 使用通用函数创建图表
      windChart = createOrUpdateChart(windChartRef.value, windChart, windOption);
    }
  });
};

// 历史数据图表渲染函数
const renderHistoryChart = () => {
  nextTick(() => {
    if (historyChartRef.value && historyWeatherData.value.loaded) {
      const historyOption = {
        title: {
          text: '历史天气对比',
          left: 'center',
          textStyle: {
            color: '#333',
            fontWeight: '600',
            fontSize: 16
          }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          confine: true,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: '#ddd',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          }
        },
        legend: {
          data: ['历史温度', '历史降水'],
          bottom: 0
        },
        grid: {
          top: 60,
          left: '3%',
          right: '4%',
          bottom: 30,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: historyWeatherData.value.dates,
          axisLabel: {
            rotate: 30,
            color: '#666'
          },
          axisLine: {
            lineStyle: {
              color: '#ddd'
            }
          }
        },
        yAxis: [
          {
            type: 'value',
            name: '温度(°C)',
            nameLocation: 'middle',
            nameGap: 30,
            position: 'left',
            axisLabel: {
              formatter: '{value}°C',
              color: '#333'
            },
            min: function(value) {
              // 计算最低温度（向下取整到5的倍数）
              const minTemp = Math.min(...historyWeatherData.value.temperatures);
              return Math.floor(minTemp / 5) * 5;
            },
            max: function(value) {
              // 计算最高温度（向上取整到5的倍数）
              const maxTemp = Math.max(...historyWeatherData.value.temperatures);
              return Math.ceil(maxTemp / 5) * 5;
            },
            interval: 5, // 固定间隔为5
            splitNumber: 5, // 固定分割段数
            axisTick: {
              alignWithLabel: true
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#333'
              }
            },
            splitLine: {
              show: true,
              lineStyle: {
                type: 'dashed',
                color: '#ddd'
              }
            }
          },
          {
            type: 'value',
            name: '降水量(mm)',
            nameLocation: 'middle',
            nameGap: 30,
            position: 'right',
            axisLabel: {
              formatter: '{value}mm',
              color: '#333'
            },
            min: 0,
            max: function(value) {
              // 计算最大降水量并向上取整到5的倍数
              const maxVal = Math.max(...historyWeatherData.value.precipitations);
              return Math.max(5, Math.ceil(maxVal * 1.2 / 5) * 5);
            },
            interval: 5, // 固定间隔为5
            splitNumber: 5, // 固定分割段数
            axisTick: {
              alignWithLabel: true
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#333'
              }
            },
            splitLine: {
              show: false // 不显示右侧Y轴的网格线，避免与左侧重叠
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
            },
            symbolSize: 8,
            emphasis: {
              scale: true
            },
            markPoint: {
              data: [
                { type: 'max', name: '最高' },
                { type: 'min', name: '最低' }
              ]
            }
          },
          {
            name: '历史降水',
            type: 'bar',
            data: historyWeatherData.value.precipitations,
            yAxisIndex: 1,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#83bff6' },
                { offset: 0.5, color: '#2196F3' },
                { offset: 1, color: '#0d47a1' }
              ])
            },
            emphasis: {
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#5ab1ef' },
                  { offset: 0.7, color: '#1976D2' },
                  { offset: 1, color: '#0a3880' }
                ])
              }
            },
            barWidth: '60%',
            showBackground: true,
            backgroundStyle: {
              color: 'rgba(220, 220, 220, 0.2)'
            }
          }
        ]
      };
      
      // 使用通用函数创建图表
      historyChart = createOrUpdateChart(historyChartRef.value, historyChart, historyOption);
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
    renderHistoryChart();
    
  } catch (error) {
    console.error('获取历史天气数据失败:', error);
    historyWeatherData.value = {
      loaded: false,
      error: `获取历史数据失败: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

// 修改handleResize函数，确保在拉伸调整后能正确更新图表
const handleResize = () => {
  // 使用节流防止频繁调用
  if (resizeTimer) clearTimeout(resizeTimer);
  
  // 延迟执行以确保DOM已更新
  resizeTimer = window.setTimeout(() => {
    if (tempChart) {
      try {
        tempChart.resize();
        console.log('温度图表大小已调整');
      } catch (e) {
        console.error('调整温度图表大小失败:', e);
      }
    }
    
    if (precipChart) {
      try {
        precipChart.resize();
        console.log('降水量图表大小已调整');
      } catch (e) {
        console.error('调整降水量图表大小失败:', e);
      }
    }
    
    if (windChart) {
      try {
        windChart.resize();
        console.log('风力图表大小已调整');
      } catch (e) {
        console.error('调整风力图表大小失败:', e);
      }
    }
    
    if (historyChart) {
      try {
        historyChart.resize();
        console.log('历史天气图表大小已调整');
      } catch (e) {
        console.error('调整历史天气图表大小失败:', e);
      }
    }
  }, 300); // 增加延迟时间，确保布局完全调整
};

// 添加resizeObserver以监听容器大小变化
let resizeObserver = null;

// 生命周期钩子
onMounted(() => {
  // 生成天气可视化图表
  generateWeatherVisualization();
  
  // 添加窗口尺寸变化监听
  window.addEventListener('resize', handleResize);
  
  // 监听dashboard面板大小变化事件
  window.addEventListener('dashboard-panel-resize', handleResize);
  
  // 使用ResizeObserver监听容器大小变化
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    
    // 获取图表容器的父元素
    const chartsContainer = document.querySelector('.weather-charts-container');
    if (chartsContainer) {
      // 监听整个图表容器，而不仅仅是单个图表
      resizeObserver.observe(chartsContainer);
      console.log('已添加对图表容器的ResizeObserver监听');
    }
    
    // 也监听各个图表容器
    if (tempChartRef.value) resizeObserver.observe(tempChartRef.value);
    if (precipChartRef.value) resizeObserver.observe(precipChartRef.value);
    if (windChartRef.value) resizeObserver.observe(windChartRef.value);
    if (historyChartRef.value) resizeObserver.observe(historyChartRef.value);
  } else {
    console.warn('浏览器不支持ResizeObserver API，将依赖window.resize事件');
  }
  
  // 初始图表调整
  setTimeout(() => {
    handleResize();
  }, 500);
});

onBeforeUnmount(() => {
  // 清除计时器
  if (resizeTimer) {
    clearTimeout(resizeTimer);
    resizeTimer = null;
  }
  
  // 移除事件监听
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('dashboard-panel-resize', handleResize);
  
  // 销毁图表实例
  if (tempChart) {
    tempChart.dispose();
    tempChart = null;
  }
  
  if (precipChart) {
    precipChart.dispose();
    precipChart = null;
  }
  
  if (windChart) {
    windChart.dispose();
    windChart = null;
  }
  
  if (historyChart) {
    historyChart.dispose();
    historyChart = null;
  }
  
  // 断开ResizeObserver连接
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
});
</script>

<style scoped>
/* 添加天气数据可视化图表的样式 */
.weather-charts-container {
  margin-top: 25px;
  width: 100%;
  box-sizing: border-box;
}

.charts-title {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  margin-bottom: 20px;
  color: #1976d2;
  font-weight: 600;
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
  width: 100%;
}

.chart-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  min-width: 0; /* 防止内容溢出 */
}

.chart-title {
  padding: 12px 15px;
  background-color: #f9f9f9;
  font-weight: 600;
  font-size: 1rem;
  color: #333333; /* 黑色字体 */
  border-bottom: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-shadow: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.chart-container {
  height: 300px;
  padding: 15px;
  width: 100%;
  box-sizing: border-box;
  background-color: #fff;
  position: relative; /* 添加相对定位以支持内部元素的绝对定位 */
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
  color: #606266;
  font-weight: 500;
}

/* 适配不同屏幕尺寸 */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-container {
    height: 250px;
  }
}

@media (max-width: 992px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 280px;
  }
  
  /* 确保图表标题在移动端可见 */
  .chart-title {
    font-size: 0.95rem;
    padding: 10px 12px;
  }
}

@media (max-width: 768px) {
  .chart-container {
    height: 250px;
    padding: 10px;
  }
  
  .chart-title {
    padding: 10px;
    font-size: 0.9rem;
  }
  
  /* 标题样式优化 */
  .charts-title {
    font-size: 1.1rem;
    margin-bottom: 15px;
  }
  
  /* 移动端网格样式调整 */
  .charts-grid {
    gap: 15px;
    margin-bottom: 15px;
  }
  
  /* 移动端卡片阴影减弱，提高性能 */
  .chart-card {
    box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.08);
  }
}

/* 添加卡片悬停效果 */
.chart-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.15);
  transition: box-shadow 0.3s ease;
}

/* 添加图表空状态样式 */
.chart-empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #909399;
  font-size: 14px;
}

.chart-empty-state .el-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #c0c4cc;
}

/* 添加图表加载状态样式 */
.chart-loading {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.chart-loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1976d2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style> 