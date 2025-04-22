/**
 * 文件名: DataChartsComponent.vue
 * 描述: 数据图表可视化组件
 * 在项目中的作用: 
 * - 使用ECharts提供多种数据图表展示
 * - 可视化展示无人机的电量、信号、速度等核心指标
 * - 提供实时数据更新和历史数据趋势分析
 * - 支持多种图表类型和交互方式
 */

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import * as echarts from 'echarts';

// 图表实例
let batteryChart: echarts.ECharts | null = null;
let signalChart: echarts.ECharts | null = null;
let speedChart: echarts.ECharts | null = null;
let recognitionChart: echarts.ECharts | null = null;

// 模拟数据
const batteryData = ref<number[]>([85, 84, 83, 82, 80, 79, 78, 77, 76, 75]);
const signalData = ref<number[]>([92, 94, 90, 88, 85, 87, 91, 89, 90, 88]);
const speedData = ref<number[]>([8.4, 12.1, 10.5, 9.2, 11.8, 13.2, 12.4, 10.8, 9.6, 11.2]);
const timePoints = ref<string[]>([]);

// 人物识别数据
const recognitionData = ref([
  { name: '成年男性', value: 42 },
  { name: '成年女性', value: 38 },
  { name: '老年人', value: 15 },
  { name: '儿童', value: 5 }
]);

// 车辆监控数据
const vehicleData = ref([
  { time: '08:00', cars: 125, trucks: 20, motorcycles: 45 },
  { time: '10:00', cars: 230, trucks: 35, motorcycles: 62 },
  { time: '12:00', cars: 310, trucks: 42, motorcycles: 78 },
  { time: '14:00', cars: 245, trucks: 38, motorcycles: 51 },
  { time: '16:00', cars: 278, trucks: 45, motorcycles: 47 },
  { time: '18:00', cars: 358, trucks: 36, motorcycles: 65 },
  { time: '20:00', cars: 289, trucks: 22, motorcycles: 42 },
]);

// 任务执行数据
const taskData = ref([
  { name: '人物识别', value: 32 },
  { name: '车辆监控', value: 28 },
  { name: '灾害检测', value: 15 },
  { name: '车牌识别', value: 18 },
  { name: '其他任务', value: 7 }
]);

// 灾害检测数据
const disasterWarnings = ref([
  { type: '森林火灾', level: '中等风险', location: '西北角', time: '14:32', details: '检测到热点，需进一步确认' },
  { type: '洪水风险', level: '高风险', location: '东南区域', time: '10:15', details: '水位上升迅速，建议密切关注' },
  { type: '基础设施损坏', level: '低风险', location: '中心区域', time: '09:45', details: '发现小型结构性损伤' },
]);

// 生成时间点序列
const generateTimePoints = () => {
  const now = new Date();
  const points = [];
  
  for (let i = 9; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000); // 每分钟一个点
    points.push(
      `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`
    );
  }
  
  timePoints.value = points;
};

// 初始化电池图表
const initBatteryChart = () => {
  const chartDom = document.getElementById('battery-chart');
  if (!chartDom) return;
  
  batteryChart = echarts.init(chartDom);
  
  const option = {
    grid: {
      top: '15%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c}%'
    },
    xAxis: {
      type: 'category',
      data: timePoints.value,
      axisLabel: {
        color: '#90caf9'
      },
      axisLine: {
        lineStyle: {
          color: '#1e3a5f'
        }
      }
    },
    yAxis: {
      type: 'value',
      min: 50,
      max: 100,
      axisLabel: {
        formatter: '{value}%',
        color: '#90caf9'
      },
      splitLine: {
        lineStyle: {
          color: '#1e3a5f'
        }
      }
    },
    series: [
      {
        name: '电池电量',
        type: 'line',
        data: batteryData.value,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#4CAF50' },
            { offset: 1, color: '#8BC34A' }
          ])
        },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(76, 175, 80, 0.5)' },
            { offset: 1, color: 'rgba(76, 175, 80, 0)' }
          ])
        }
      }
    ]
  };
  
  batteryChart.setOption(option);
};

// 初始化信号图表
const initSignalChart = () => {
  const chartDom = document.getElementById('signal-chart');
  if (!chartDom) return;
  
  signalChart = echarts.init(chartDom);
  
  const option = {
    grid: {
      top: '15%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c}%'
    },
    xAxis: {
      type: 'category',
      data: timePoints.value,
      axisLabel: {
        color: '#90caf9'
      },
      axisLine: {
        lineStyle: {
          color: '#1e3a5f'
        }
      }
    },
    yAxis: {
      type: 'value',
      min: 50,
      max: 100,
      axisLabel: {
        formatter: '{value}%',
        color: '#90caf9'
      },
      splitLine: {
        lineStyle: {
          color: '#1e3a5f'
        }
      }
    },
    series: [
      {
        name: '信号强度',
        type: 'line',
        data: signalData.value,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#2196F3' },
            { offset: 1, color: '#03A9F4' }
          ])
        },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(33, 150, 243, 0.5)' },
            { offset: 1, color: 'rgba(33, 150, 243, 0)' }
          ])
        }
      }
    ]
  };
  
  signalChart.setOption(option);
};

// 初始化速度图表
const initSpeedChart = () => {
  const chartDom = document.getElementById('speed-chart');
  if (!chartDom) return;
  
  speedChart = echarts.init(chartDom);
  
  const option = {
    grid: {
      top: '15%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      formatter: '{b}<br/>{a}: {c} m/s'
    },
    xAxis: {
      type: 'category',
      data: timePoints.value,
      axisLabel: {
        color: '#90caf9'
      },
      axisLine: {
        lineStyle: {
          color: '#1e3a5f'
        }
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 20,
      axisLabel: {
        formatter: '{value} m/s',
        color: '#90caf9'
      },
      splitLine: {
        lineStyle: {
          color: '#1e3a5f'
        }
      }
    },
    series: [
      {
        name: '飞行速度',
        type: 'line',
        data: speedData.value,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#FF9800' },
            { offset: 1, color: '#FFC107' }
          ])
        },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 152, 0, 0.5)' },
            { offset: 1, color: 'rgba(255, 152, 0, 0)' }
          ])
        }
      }
    ]
  };
  
  speedChart.setOption(option);
};

// 初始化人物识别图表
const initRecognitionChart = () => {
  const chartDom = document.getElementById('recognition-chart');
  if (!chartDom) return;
  
  recognitionChart = echarts.init(chartDom);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      top: '5%',
      left: 'center',
      textStyle: {
        color: '#90caf9'
      }
    },
    series: [
      {
        name: '人物识别结果',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#132f4c',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold',
            color: '#ffffff'
          }
        },
        labelLine: {
          show: false
        },
        data: recognitionData.value
      }
    ]
  };
  
  recognitionChart.setOption(option);
};

// 初始化车辆监控图表
const initVehicleChart = () => {
  const chartDom = document.getElementById('vehicle-chart');
  if (!chartDom) return;
  
  const vehicleChart = echarts.init(chartDom);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['轿车', '卡车', '摩托车'],
      top: '5%',
      textStyle: {
        color: '#90caf9'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: vehicleData.value.map(item => item.time),
      axisLabel: {
        color: '#90caf9'
      },
      axisLine: {
        lineStyle: {
          color: '#1e3a5f'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#90caf9'
      },
      splitLine: {
        lineStyle: {
          color: '#1e3a5f'
        }
      }
    },
    series: [
      {
        name: '轿车',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: vehicleData.value.map(item => item.cars),
        itemStyle: { color: '#4CAF50' }
      },
      {
        name: '卡车',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: vehicleData.value.map(item => item.trucks),
        itemStyle: { color: '#FF9800' }
      },
      {
        name: '摩托车',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        data: vehicleData.value.map(item => item.motorcycles),
        itemStyle: { color: '#2196F3' }
      }
    ]
  };
  
  vehicleChart.setOption(option);
};

// 初始化任务分布图表
const initTaskChart = () => {
  const chartDom = document.getElementById('task-chart');
  if (!chartDom) return;
  
  const taskChart = echarts.init(chartDom);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      top: '5%',
      left: 'center',
      textStyle: {
        color: '#90caf9'
      }
    },
    series: [
      {
        name: '任务分布',
        type: 'pie',
        radius: '55%',
        center: ['50%', '60%'],
        roseType: 'radius',
        itemStyle: {
          borderRadius: 5
        },
        label: {
          color: '#fff'
        },
        data: taskData.value,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  
  taskChart.setOption(option);
};

// 更新模拟数据
const updateSimulationData = () => {
  // 随机更新电池数据
  const lastBattery = batteryData.value[batteryData.value.length - 1];
  const newBattery = Math.max(0, Math.min(100, lastBattery + (Math.random() - 0.8)));
  batteryData.value.push(Number(newBattery.toFixed(1)));
  batteryData.value.shift();
  
  // 随机更新信号数据
  const lastSignal = signalData.value[signalData.value.length - 1];
  const newSignal = Math.max(50, Math.min(100, lastSignal + (Math.random() * 6 - 3)));
  signalData.value.push(Number(newSignal.toFixed(1)));
  signalData.value.shift();
  
  // 随机更新速度数据
  const lastSpeed = speedData.value[speedData.value.length - 1];
  const newSpeed = Math.max(5, Math.min(15, lastSpeed + (Math.random() * 4 - 2)));
  speedData.value.push(Number(newSpeed.toFixed(1)));
  speedData.value.shift();
  
  // 更新时间点
  const now = new Date();
  const newTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  timePoints.value.push(newTime);
  timePoints.value.shift();
  
  // 更新图表
  if (batteryChart) {
    batteryChart.setOption({
      xAxis: { data: timePoints.value },
      series: [{ data: batteryData.value }]
    });
  }
  
  if (signalChart) {
    signalChart.setOption({
      xAxis: { data: timePoints.value },
      series: [{ data: signalData.value }]
    });
  }
  
  if (speedChart) {
    speedChart.setOption({
      xAxis: { data: timePoints.value },
      series: [{ data: speedData.value }]
    });
  }
};

// 用于数据更新的定时器
let updateTimer: number;

// 格式化时间
const formatDatetime = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 组件挂载时初始化图表
onMounted(() => {
  // 生成时间点
  generateTimePoints();
  
  // 初始化图表
  initBatteryChart();
  initSignalChart();
  initSpeedChart();
  initRecognitionChart();
  initVehicleChart();
  initTaskChart();
  
  // 设置定时更新
  updateTimer = window.setInterval(updateSimulationData, 5000);
  
  // 窗口大小调整时重新调整图表大小
  window.addEventListener('resize', handleResize);
});

// 组件卸载前清理资源
onBeforeUnmount(() => {
  // 清理定时器
  clearInterval(updateTimer);
  
  // 销毁图表实例
  if (batteryChart) batteryChart.dispose();
  if (signalChart) signalChart.dispose();
  if (speedChart) speedChart.dispose();
  if (recognitionChart) recognitionChart.dispose();
  
  // 移除事件监听
  window.removeEventListener('resize', handleResize);
});

// 窗口大小调整处理
const handleResize = () => {
  if (batteryChart) batteryChart.resize();
  if (signalChart) signalChart.resize();
  if (speedChart) speedChart.resize();
  if (recognitionChart) recognitionChart.resize();
};

// 获取剩余电量估计时间
const estimatedTimeRemaining = computed(() => {
  const currentBattery = batteryData.value[batteryData.value.length - 1];
  // 假设每分钟消耗0.2%的电池
  const minutesRemaining = currentBattery / 0.2;
  const hours = Math.floor(minutesRemaining / 60);
  const minutes = Math.floor(minutesRemaining % 60);
  
  return `${hours}小时 ${minutes}分钟`;
});
</script>

<template>
  <div class="data-charts-container">
    <div class="charts-grid">
      <!-- 电池图表 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>电池电量</h3>
          <div class="status">
            <span class="status-value">{{ batteryData[batteryData.length - 1].toFixed(1) }}%</span>
            <span class="status-info">剩余: {{ estimatedTimeRemaining }}</span>
          </div>
        </div>
        <div id="battery-chart" class="chart"></div>
      </div>
      
      <!-- 信号图表 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>信号强度</h3>
          <div class="status">
            <span class="status-value">{{ signalData[signalData.length - 1].toFixed(1) }}%</span>
            <span 
              class="status-info"
              :class="{ 
                'status-warning': signalData[signalData.length - 1] < 80,
                'status-danger': signalData[signalData.length - 1] < 60
              }"
            >
              {{ 
                signalData[signalData.length - 1] >= 80 ? '信号良好' :
                signalData[signalData.length - 1] >= 60 ? '信号一般' : '信号弱'
              }}
            </span>
          </div>
        </div>
        <div id="signal-chart" class="chart"></div>
      </div>
      
      <!-- 速度图表 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>飞行速度</h3>
          <div class="status">
            <span class="status-value">{{ speedData[speedData.length - 1].toFixed(1) }} m/s</span>
            <span class="status-info">
              约 {{ (speedData[speedData.length - 1] * 3.6).toFixed(1) }} km/h
            </span>
          </div>
        </div>
        <div id="speed-chart" class="chart"></div>
      </div>
      
      <!-- 人物识别图表 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>人物识别</h3>
          <div class="status">
            <span class="status-value">{{ recognitionData.reduce((sum, item) => sum + item.value, 0) }}</span>
            <span class="status-info">总识别人数</span>
          </div>
        </div>
        <div id="recognition-chart" class="chart"></div>
      </div>
      
      <!-- 车辆监控图表 -->
      <div class="chart-card wide">
        <div class="chart-header">
          <h3>车辆监控</h3>
          <div class="status">
            <span class="status-value">{{ vehicleData.reduce((sum, item) => sum + item.cars + item.trucks + item.motorcycles, 0) }}</span>
            <span class="status-info">今日监测车辆总数</span>
          </div>
        </div>
        <div id="vehicle-chart" class="chart"></div>
      </div>
      
      <!-- 任务分布图表 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>任务分布</h3>
          <div class="status">
            <span class="status-value">{{ taskData.reduce((sum, item) => sum + item.value, 0) }}</span>
            <span class="status-info">总任务数量</span>
          </div>
        </div>
        <div id="task-chart" class="chart"></div>
      </div>
      
      <!-- 灾害检测表格 -->
      <div class="chart-card">
        <div class="chart-header">
          <h3>灾害检测</h3>
          <div class="status">
            <span 
              class="status-value"
              :class="{
                'status-danger': disasterWarnings.some(item => item.level.includes('高')),
                'status-warning': !disasterWarnings.some(item => item.level.includes('高')) && 
                                  disasterWarnings.some(item => item.level.includes('中'))
              }"
            >
              {{ 
                disasterWarnings.some(item => item.level.includes('高')) ? '高风险警报' :
                disasterWarnings.some(item => item.level.includes('中')) ? '中等风险' : '低风险'
              }}
            </span>
          </div>
        </div>
        <div class="disaster-table">
          <table>
            <thead>
              <tr>
                <th>类型</th>
                <th>风险级别</th>
                <th>位置</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(warning, index) in disasterWarnings" 
                :key="index"
                :class="{
                  'high-risk': warning.level.includes('高'),
                  'medium-risk': warning.level.includes('中'),
                  'low-risk': warning.level.includes('低')
                }"
              >
                <td>{{ warning.type }}</td>
                <td>{{ warning.level }}</td>
                <td>{{ warning.location }}</td>
                <td>{{ warning.time }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-charts-container {
  background-color: #0a1929;
  border-radius: 10px;
  padding: 20px;
  height: 100%;
  min-height: 600px;
  overflow: auto;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.chart-card {
  background-color: #132f4c;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.chart-card.wide {
  grid-column: span 2;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #1e3a5f;
}

.chart-header h3 {
  margin: 0;
  color: #4fc3f7;
  font-size: 1.1rem;
  font-weight: 500;
}

.status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.status-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: white;
}

.status-info {
  font-size: 0.8rem;
  color: #90caf9;
}

.status-warning {
  color: #FFC107;
}

.status-danger {
  color: #F44336;
}

.chart {
  flex: 1;
  min-height: 200px;
}

/* 灾害检测表格样式 */
.disaster-table {
  flex: 1;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  color: white;
}

th {
  background-color: #1e3a5f;
  padding: 8px;
  text-align: left;
  font-weight: 500;
  color: #4fc3f7;
  font-size: 0.9rem;
}

td {
  padding: 8px;
  border-bottom: 1px solid #1e3a5f;
  font-size: 0.9rem;
}

tr.high-risk {
  background-color: rgba(244, 67, 54, 0.15);
}

tr.medium-risk {
  background-color: rgba(255, 152, 0, 0.15);
}

tr.low-risk {
  background-color: rgba(76, 175, 80, 0.15);
}

tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-card.wide {
    grid-column: span 2;
  }
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-card.wide {
    grid-column: span 1;
  }
  
  .chart {
    min-height: 180px;
  }
}
</style> 