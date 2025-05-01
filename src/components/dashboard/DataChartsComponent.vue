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
import { ref, onMounted, onBeforeUnmount, computed, reactive, watch, PropType } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { Refresh, Download, ZoomIn, Search, Calendar, Location, Filter } from '@element-plus/icons-vue';

// 支持的图表类型
type ChartType = 'battery' | 'signal' | 'speed' | 'person' | 'personActivity' | 'vehicle' | 'task' | 'risk' | 'heatmap' | 'all';

// 组件属性
const props = defineProps({
  // 图表类型：电量、信号、速度、人物分析等
  chartType: {
    type: String as PropType<ChartType>,
    default: 'all'
  },
  // 数据更新间隔（毫秒）
  updateInterval: {
    type: Number,
    default: 30000 // 默认30秒更新一次
  }
});

// 使用echarts内置的类型
type EChartsType = any; // 使用any临时解决类型问题

// 图表实例
let batteryChart: EChartsType | null = null;
let signalChart: EChartsType | null = null;
let speedChart: EChartsType | null = null;
let recognitionChart: EChartsType | null = null;
let heatmapChart: EChartsType | null = null; // 新增热力图
let personActivityChart: EChartsType | null = null; // 人物活动趋势图
let riskChart: EChartsType | null = null; // 风险分析图

// 定时器
let updateTimer: number | null = null;

// 添加图表加载状态跟踪
const chartsLoading = reactive({
  battery: false,
  signal: false,
  speed: false,
  recognition: false,
  person: false,
  personActivity: false,
  vehicle: false,
  task: false,
  risk: false,
  heatmap: false,
  comparison: false
});

// 新增筛选相关的状态
const dateRange = ref<[Date, Date]>([
  new Date(new Date().setDate(new Date().getDate() - 7)),
  new Date()
]);

// 区域数据
const regions = ref([
  { value: 'north', label: '北部区域' },
  { value: 'south', label: '南部区域' },
  { value: 'east', label: '东部区域' },
  { value: 'west', label: '西部区域' },
  { value: 'central', label: '中心区域' }
]);
const selectedRegions = ref(['central']);

// 数据类型筛选
const dataTypeOptions = ref([
  { value: 'person', label: '人流量' },
  { value: 'vehicle', label: '车流量' },
  { value: 'risk', label: '风险事件' },
  { value: 'drone', label: '无人机状态' }
]);
const selectedDataTypes = ref(['person', 'vehicle', 'risk']);

// 显示/隐藏筛选面板
const showFilterPanel = ref(false);

// 模拟数据
const batteryData = ref<number[]>([85, 84, 83, 82, 80, 79, 78, 77, 76, 75]);
const signalData = ref<number[]>([92, 94, 90, 88, 85, 87, 91, 89, 90, 88]);
const speedData = ref<number[]>([8.4, 12.1, 10.5, 9.2, 11.8, 13.2, 12.4, 10.8, 9.6, 11.2]);
const timePoints = ref<string[]>([]);

// 新增历史数据对比
const historyBatteryData = ref<number[]>([88, 86, 85, 84, 82, 81, 80, 79, 77, 76]);
const historySignalData = ref<number[]>([95, 93, 92, 90, 88, 89, 93, 91, 88, 87]);
const historySpeedData = ref<number[]>([7.8, 11.3, 9.8, 8.7, 10.9, 12.4, 11.8, 10.2, 9.1, 10.5]);

// 滤波配置
const useDataFiltering = ref(true);
const filterStrength = ref(3); // 值越高过滤效果越强

// 过滤数据噪声，使曲线更平滑
const applyDataFilter = (data: number[], newValue: number): number => {
  if (!useDataFiltering.value || data.length === 0) return newValue;
  
  // 对数据应用移动平均线滤波
  const lastValue = data[data.length - 1];
  const filtered = lastValue + (newValue - lastValue) / filterStrength.value;
  return Number(filtered.toFixed(1));
};

// 人物识别数据
const recognitionData = ref([
  { name: '成年男性', value: 42 },
  { name: '成年女性', value: 38 },
  { name: '老年人', value: 15 },
  { name: '儿童', value: 5 }
]);

// 人物活动趋势数据
const personActivityData = ref([
  { date: '7:00', active: 32, stationary: 18, entering: 8, leaving: 5 },
  { date: '8:00', active: 48, stationary: 25, entering: 15, leaving: 7 },
  { date: '9:00', active: 65, stationary: 30, entering: 18, leaving: 12 },
  { date: '10:00', active: 72, stationary: 35, entering: 20, leaving: 15 },
  { date: '11:00', active: 80, stationary: 45, entering: 15, leaving: 18 },
  { date: '12:00', active: 95, stationary: 52, entering: 10, leaving: 25 },
  { date: '13:00', active: 85, stationary: 45, entering: 12, leaving: 20 }
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

// 风险分析数据
const riskData = ref([
  { date: '6/1', level1: 2, level2: 5, level3: 1 },
  { date: '6/2', level1: 3, level2: 4, level3: 0 },
  { date: '6/3', level1: 5, level2: 6, level3: 2 },
  { date: '6/4', level1: 4, level2: 7, level3: 1 },
  { date: '6/5', level1: 6, level2: 5, level3: 2 },
  { date: '6/6', level1: 2, level2: 3, level3: 0 },
  { date: '6/7', level1: 3, level2: 4, level3: 1 }
]);

// 灾害检测数据
const disasterWarnings = ref([
  { type: '森林火灾', level: '中等风险', location: '西北角', time: '14:32', details: '检测到热点，需进一步确认' },
  { type: '夜间街道异常', level: '高风险', location: '东南区域', time: '10:15', details: '检测到异常人员聚集，建议派出巡逻' },
  { type: '夜间车辆异常', level: '中等风险', location: '环城高速', time: '23:45', details: '发现超速行驶车辆，建议加强监控' },
  { type: '远距离监控报警', level: '高风险', location: '湖泊监测点', time: '08:20', details: '监测设备状态异常，需立即检修' },
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

// 单个图表显示逻辑
const shouldShowChart = (type: ChartType): boolean => {
  return props.chartType === 'all' || props.chartType === type;
};

// 初始化组件
onMounted(() => {
  console.log('DataChartsComponent mounted, chartType:', props.chartType);
  generateTimePoints();
  
  if (shouldShowChart('battery')) {
    initBatteryChart();
  }
  
  if (shouldShowChart('signal')) {
    initSignalChart();
  }
  
  if (shouldShowChart('speed')) {
    initSpeedChart();
  }
  
  if (shouldShowChart('person')) {
    initRecognitionChart();
  }
  
  if (shouldShowChart('personActivity')) {
    initPersonActivityChart();
  }
  
  if (shouldShowChart('task')) {
    initTaskChart();
  }
  
  if (shouldShowChart('risk')) {
    initRiskChart();
  }
  
  // 全局显示时初始化所有图表
  if (props.chartType === 'all') {
    // 给DOM一些时间加载
    setTimeout(() => {
      initBatteryChart();
      initSignalChart();
      initSpeedChart();
      initRecognitionChart();
      initPersonActivityChart();
      initTaskChart();
      initRiskChart();
    }, 300);
  }
  
  // 启动数据更新定时器
  updateTimer = window.setInterval(updateChartData, props.updateInterval);
  
  // 添加窗口大小变化监听，响应式调整图表
  window.addEventListener('resize', handleResize);
});

// 监听chartType变化，重新初始化图表
watch(() => props.chartType, (newType) => {
  console.log('chartType changed to:', newType);
  // 销毁现有图表
  disposeCharts();
  
  // 根据新类型初始化图表
  if (shouldShowChart('battery')) {
    initBatteryChart();
  }
  
  if (shouldShowChart('signal')) {
    initSignalChart();
  }
  
  if (shouldShowChart('speed')) {
    initSpeedChart();
  }
  
  if (shouldShowChart('person')) {
    initRecognitionChart();
  }
  
  if (shouldShowChart('personActivity')) {
    initPersonActivityChart();
  }
  
  if (shouldShowChart('task')) {
    initTaskChart();
  }
  
  if (shouldShowChart('risk')) {
    initRiskChart();
  }
  
  // 处理其他图表类型...
});

// 销毁所有图表实例
const disposeCharts = () => {
  if (batteryChart) {
    batteryChart.dispose();
    batteryChart = null;
  }
  
  if (signalChart) {
    signalChart.dispose();
    signalChart = null;
  }
  
  if (speedChart) {
    speedChart.dispose();
    speedChart = null;
  }
  
  if (recognitionChart) {
    recognitionChart.dispose();
    recognitionChart = null;
  }
  
  if (personActivityChart) {
    personActivityChart.dispose();
    personActivityChart = null;
  }
  
  if (riskChart) {
    riskChart.dispose();
    riskChart = null;
  }
  
  // 销毁其他图表...
};

// 组件销毁前清理
onBeforeUnmount(() => {
  if (updateTimer) {
    clearInterval(updateTimer);
    updateTimer = null;
  }
  
  // 移除事件监听
  window.removeEventListener('resize', handleResize);
  
  // 销毁图表实例
  disposeCharts();
});

// 窗口大小变化处理
const handleResize = () => {
  // 调整所有活跃的图表
  if (batteryChart) batteryChart.resize();
  if (signalChart) signalChart.resize();
  if (speedChart) speedChart.resize();
  if (recognitionChart) recognitionChart.resize();
  if (personActivityChart) personActivityChart.resize();
  if (riskChart) riskChart.resize();
  // 调整其他图表...
};

// 启动数据更新定时器
const startUpdateTimer = () => {
  if (updateTimer) {
    clearInterval(updateTimer);
  }
  
  // 设置定时更新
  updateTimer = setInterval(() => {
    updateChartData();
  }, props.updateInterval) as unknown as number;
};

// 更新图表数据
const updateChartData = () => {
  // 生成新的时间点
  generateTimePoints();
  
  // 模拟新数据生成
  const newBatteryValue = batteryData.value[batteryData.value.length - 1] - Math.random() * 1.5;
  const newSignalValue = Math.max(70, Math.min(100, signalData.value[signalData.value.length - 1] + (Math.random() * 6 - 3)));
  const newSpeedValue = Math.max(5, Math.min(20, speedData.value[speedData.value.length - 1] + (Math.random() * 4 - 2)));
  
  // 应用滤波平滑数据
  const filteredBatteryValue = applyDataFilter(batteryData.value, newBatteryValue);
  const filteredSignalValue = applyDataFilter(signalData.value, newSignalValue);
  const filteredSpeedValue = applyDataFilter(speedData.value, newSpeedValue);
  
  // 更新数据数组，移除最早的数据点
  batteryData.value.shift();
  batteryData.value.push(parseFloat(filteredBatteryValue.toFixed(1)));
  
  signalData.value.shift();
  signalData.value.push(parseFloat(filteredSignalValue.toFixed(1)));
  
  speedData.value.shift();
  speedData.value.push(parseFloat(filteredSpeedValue.toFixed(1)));
  
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
      formatter: '{b}<br/>{a}: {c}%',
      backgroundColor: 'rgba(19, 47, 76, 0.9)',
      borderColor: '#4fc3f7',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'rgba(79, 195, 247, 0.5)',
          width: 2
        }
      }
    },
    xAxis: {
      type: 'category',
      data: timePoints.value,
      axisLabel: {
        color: '#90caf9',
        fontSize: 10,
        rotate: 30
      },
      axisLine: {
        lineStyle: {
          color: '#1e3a5f'
        }
      },
      axisTick: {
        alignWithLabel: true,
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
          color: 'rgba(30, 58, 95, 0.3)',
          type: 'dashed'
        }
      },
      axisPointer: {
        snap: true
      }
    },
    series: [
      {
        name: '电池电量',
        type: 'line',
        data: batteryData.value,
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#4CAF50' },
            { offset: 1, color: '#8BC34A' }
          ]),
          shadowColor: 'rgba(76, 175, 80, 0.3)',
          shadowBlur: 10
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: '#4CAF50',
            borderColor: 'rgba(76, 175, 80, 0.5)',
            borderWidth: 3,
            shadowColor: 'rgba(76, 175, 80, 0.5)',
            shadowBlur: 15
          }
        },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(76, 175, 80, 0.5)' },
            { offset: 1, color: 'rgba(76, 175, 80, 0)' }
          ])
        },
        markLine: {
          symbol: ['none', 'none'],
          label: {
            show: false
          },
          lineStyle: {
            color: '#E57373',
            type: 'dashed'
          },
          data: [{ yAxis: 60, name: '低电量警告' }]
        }
      }
    ],
    // 增加动画效果
    animationDuration: 2000,
    animationEasing: 'cubicInOut'
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
      formatter: '{b}<br/>{a}: {c}%',
      backgroundColor: 'rgba(19, 47, 76, 0.9)',
      borderColor: '#4fc3f7',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'rgba(79, 195, 247, 0.5)',
          width: 2
        }
      }
    },
    xAxis: {
      type: 'category',
      data: timePoints.value,
      axisLabel: {
        color: '#90caf9',
        fontSize: 10,
        rotate: 30
      },
      axisLine: {
        lineStyle: {
          color: '#1e3a5f'
        }
      },
      axisTick: {
        alignWithLabel: true,
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
          color: 'rgba(30, 58, 95, 0.3)',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '信号强度',
        type: 'line',
        data: signalData.value,
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#2196F3' },
            { offset: 1, color: '#03A9F4' }
          ]),
          shadowColor: 'rgba(33, 150, 243, 0.3)',
          shadowBlur: 10
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: '#2196F3',
            borderColor: 'rgba(33, 150, 243, 0.5)',
            borderWidth: 3,
            shadowColor: 'rgba(33, 150, 243, 0.5)',
            shadowBlur: 15
          }
        },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(33, 150, 243, 0.5)' },
            { offset: 1, color: 'rgba(33, 150, 243, 0)' }
          ])
        },
        markLine: {
          symbol: ['none', 'none'],
          label: {
            show: false
          },
          lineStyle: {
            color: '#E57373',
            type: 'dashed'
          },
          data: [{ yAxis: 60, name: '信号弱警告' }]
        }
      }
    ],
    animationDuration: 2000,
    animationEasing: 'cubicInOut'
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
      formatter: '{b}<br/>{a}: {c} m/s',
      backgroundColor: 'rgba(19, 47, 76, 0.9)',
      borderColor: '#4fc3f7',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: 'rgba(79, 195, 247, 0.5)',
          width: 2
        }
      }
    },
    xAxis: {
      type: 'category',
      data: timePoints.value,
      axisLabel: {
        color: '#90caf9',
        fontSize: 10,
        rotate: 30
      },
      axisLine: {
        lineStyle: {
          color: '#1e3a5f'
        }
      },
      axisTick: {
        alignWithLabel: true,
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
          color: 'rgba(30, 58, 95, 0.3)',
          type: 'dashed'
        }
      }
    },
    visualMap: {
      show: false,
      dimension: 1,
      pieces: [{
        lte: 5,
        color: '#4ECDC4'
      }, {
        gt: 5,
        lte: 10,
        color: '#FFA726'
      }, {
        gt: 10,
        color: '#FF5722'
      }]
    },
    series: [
      {
        name: '飞行速度',
        type: 'line',
        data: speedData.value,
        smooth: true,
        symbol: 'emptyCircle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: {
          width: 3,
          shadowColor: 'rgba(255, 152, 0, 0.3)',
          shadowBlur: 10
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            borderColor: 'rgba(255, 152, 0, 0.5)',
            borderWidth: 3,
            shadowColor: 'rgba(255, 152, 0, 0.5)',
            shadowBlur: 15
          }
        },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 152, 0, 0.5)' },
            { offset: 1, color: 'rgba(255, 152, 0, 0)' }
          ])
        },
        markPoint: {
          symbol: 'pin',
          symbolSize: 40,
          data: [
            { type: 'max', name: '最高速度' }
          ],
          label: {
            formatter: '{b}: {c} m/s'
          },
          itemStyle: {
            color: '#FF5722'
          }
        }
      }
    ],
    animationDuration: 2000,
    animationEasing: 'cubicInOut'
  };
  
  speedChart.setOption(option);
};

// 新增方法：初始化人物活动趋势图
const initPersonActivityChart = () => {
  const chartDom = document.getElementById('person-activity-chart');
  if (!chartDom) return;
  
  personActivityChart = echarts.init(chartDom);
  chartsLoading.personActivity = true;
  
  setTimeout(() => {
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(19, 47, 76, 0.9)',
        borderColor: '#4fc3f7',
        borderWidth: 1,
        textStyle: { color: '#fff' }
      },
      legend: {
        data: ['活跃人员', '静止人员', '进入区域', '离开区域'],
        textStyle: { color: '#90caf9' },
        top: '5%'
      },
      grid: {
        top: '25%',
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: personActivityData.value.map(item => item.date),
        axisLabel: {
          color: '#90caf9',
          fontSize: 10
        },
        axisLine: {
          lineStyle: { color: '#1e3a5f' }
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#90caf9' },
        splitLine: {
          lineStyle: { color: '#1e3a5f', type: 'dashed' }
        }
      },
      series: [
        {
          name: '活跃人员',
          type: 'line',
          smooth: true,
          data: personActivityData.value.map(item => item.active),
          lineStyle: { width: 3 },
          itemStyle: { color: '#4CAF50' }
        },
        {
          name: '静止人员',
          type: 'line',
          smooth: true,
          data: personActivityData.value.map(item => item.stationary),
          lineStyle: { width: 3 },
          itemStyle: { color: '#2196F3' }
        },
        {
          name: '进入区域',
          type: 'bar',
          data: personActivityData.value.map(item => item.entering),
          itemStyle: { color: '#8bc34a' }
        },
        {
          name: '离开区域',
          type: 'bar',
          data: personActivityData.value.map(item => item.leaving),
          itemStyle: { color: '#ff9800' }
        }
      ]
    };
    
    personActivityChart.setOption(option);
    chartsLoading.personActivity = false;
  }, 500);
};

// 新增方法：初始化人物识别分布图
const initRecognitionChart = () => {
  const chartDom = document.getElementById('recognition-chart');
  if (!chartDom) return;
  
  recognitionChart = echarts.init(chartDom);
  chartsLoading.recognition = true;
  
  setTimeout(() => {
  const option = {
    tooltip: {
      trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'rgba(19, 47, 76, 0.9)',
        borderColor: '#4fc3f7',
        borderWidth: 1,
        textStyle: { color: '#fff' }
    },
    legend: {
        orient: 'horizontal',
        bottom: '5%',
        textStyle: { color: '#90caf9' },
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 20
    },
    series: [
      {
          name: '人物识别',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
            borderColor: '#0a1929',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
              fontSize: '14',
            fontWeight: 'bold',
            color: '#ffffff'
          }
        },
        labelLine: {
          show: false
        },
          data: [
            { value: 42, name: '成年男性', itemStyle: { color: '#42A5F5' } },
            { value: 38, name: '成年女性', itemStyle: { color: '#EC407A' } },
            { value: 15, name: '老年人', itemStyle: { color: '#66BB6A' } },
            { value: 5, name: '儿童', itemStyle: { color: '#FFA726' } }
          ]
      }
    ]
  };
  
  recognitionChart.setOption(option);
    chartsLoading.recognition = false;
  }, 500);
};

// 新增方法：初始化任务执行情况图表
const initTaskChart = () => {
  const chartDom = document.getElementById('task-chart');
  if (!chartDom) return;
  
  const taskChart = echarts.init(chartDom);
  chartsLoading.task = true;
  
  setTimeout(() => {
  const option = {
    tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        backgroundColor: 'rgba(19, 47, 76, 0.9)',
        borderColor: '#4fc3f7',
        borderWidth: 1,
        textStyle: { color: '#fff' }
    },
    legend: {
        orient: 'horizontal',
        bottom: '5%',
        textStyle: { color: '#90caf9' },
        icon: 'rect',
        itemWidth: 10,
        itemHeight: 10,
        itemGap: 20
      },
      series: [
        {
          name: '任务执行',
          type: 'pie',
          radius: '70%',
          label: {
            show: true,
            formatter: '{b}: {c}',
            color: '#e3f2fd',
            fontSize: 12
          },
          labelLine: {
            lineStyle: {
              color: '#1e3a5f'
            }
          },
          data: [
            { value: 32, name: '人物识别', itemStyle: { color: '#26A69A' } },
            { value: 28, name: '车辆监控', itemStyle: { color: '#5C6BC0' } },
            { value: 15, name: '灾害检测', itemStyle: { color: '#EF5350' } },
            { value: 18, name: '车牌识别', itemStyle: { color: '#FFA726' } },
            { value: 7, name: '其他任务', itemStyle: { color: '#78909C' } }
          ]
        }
      ]
    };
    
    taskChart.setOption(option);
    chartsLoading.task = false;
  }, 500);
};

// 新增方法：初始化风险分析图表
const initRiskChart = () => {
  const chartDom = document.getElementById('risk-chart');
  if (!chartDom) return;
  
  riskChart = echarts.init(chartDom);
  chartsLoading.risk = true;
  
  setTimeout(() => {
    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(19, 47, 76, 0.9)',
        borderColor: '#4fc3f7',
        borderWidth: 1,
        textStyle: { color: '#fff' }
      },
      legend: {
        data: ['低风险', '中风险', '高风险'],
        textStyle: { color: '#90caf9' },
        top: '5%'
    },
    grid: {
        top: '25%',
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
        data: riskData.value.map(item => item.date),
      axisLabel: {
          color: '#90caf9',
          fontSize: 10
      },
      axisLine: {
          lineStyle: { color: '#1e3a5f' }
      }
    },
    yAxis: {
      type: 'value',
        axisLabel: { color: '#90caf9' },
      splitLine: {
          lineStyle: { color: '#1e3a5f', type: 'dashed' }
      }
    },
    series: [
      {
          name: '低风险',
        type: 'bar',
        stack: 'total',
          data: riskData.value.map(item => item.level1),
          itemStyle: { color: '#66BB6A' }
        },
        {
          name: '中风险',
        type: 'bar',
        stack: 'total',
          data: riskData.value.map(item => item.level2),
          itemStyle: { color: '#FFA726' }
        },
        {
          name: '高风险',
        type: 'bar',
        stack: 'total',
          data: riskData.value.map(item => item.level3),
          itemStyle: { color: '#EF5350' }
        }
      ]
    };
    
    riskChart.setOption(option);
    chartsLoading.risk = false;
  }, 500);
};
</script>

<template>
  <div class="data-charts-component">
    <!-- 针对单图表展示的模式 -->
    <template v-if="props.chartType !== 'all'">
      <!-- 电量趋势图 -->
      <div v-if="shouldShowChart('battery')" class="chart-container">
        <div id="battery-chart" class="chart"></div>
        <div v-if="chartsLoading.battery" class="chart-loading">加载中...</div>
      </div>
      
      <!-- 信号强度图 -->
      <div v-if="shouldShowChart('signal')" class="chart-container">
        <div id="signal-chart" class="chart"></div>
        <div v-if="chartsLoading.signal" class="chart-loading">加载中...</div>
      </div>
      
      <!-- 飞行速度图 -->
      <div v-if="shouldShowChart('speed')" class="chart-container">
        <div id="speed-chart" class="chart"></div>
        <div v-if="chartsLoading.speed" class="chart-loading">加载中...</div>
      </div>
      
      <!-- 人物识别图 -->
      <div v-if="shouldShowChart('person')" class="chart-container">
        <div id="recognition-chart" class="chart"></div>
        <div v-if="chartsLoading.recognition" class="chart-loading">加载中...</div>
      </div>
      
      <!-- 人物活动趋势图 -->
      <div v-if="shouldShowChart('personActivity')" class="chart-container">
        <div id="person-activity-chart" class="chart"></div>
        <div v-if="chartsLoading.personActivity" class="chart-loading">加载中...</div>
          </div>
      
      <!-- 任务执行图 -->
      <div v-if="shouldShowChart('task')" class="chart-container">
        <div id="task-chart" class="chart"></div>
        <div v-if="chartsLoading.task" class="chart-loading">加载中...</div>
        </div>
      
      <!-- 风险分析图 -->
      <div v-if="shouldShowChart('risk')" class="chart-container">
        <div id="risk-chart" class="chart"></div>
        <div v-if="chartsLoading.risk" class="chart-loading">加载中...</div>
      </div>
    </template>
    
    <!-- 完整仪表盘展示模式 - 全部图表 -->
    <template v-else>
      <!-- 保留旧版的完整仪表板布局 -->
      <div class="charts-header">
        <h2>数据分析仪表板</h2>
        <div class="filter-button" @click="showFilterPanel = !showFilterPanel">
          <el-icon><Filter /></el-icon>
          筛选
          </div>
        </div>
      
      <!-- 筛选面板 -->
      <div v-if="showFilterPanel" class="filter-panel">
        <!-- 这里保留原有的筛选面板内容 -->
      </div>
      
      <!-- 图表网格 -->
      <div class="charts-grid">
        <div class="grid-item">
          <h3>电量趋势</h3>
          <div id="battery-chart" class="chart"></div>
          </div>
        <div class="grid-item">
          <h3>信号强度</h3>
          <div id="signal-chart" class="chart"></div>
        </div>
        <div class="grid-item">
          <h3>飞行速度</h3>
          <div id="speed-chart" class="chart"></div>
        </div>
        <div class="grid-item">
          <h3>人物识别</h3>
          <div id="recognition-chart" class="chart"></div>
      </div>
        <div class="grid-item">
          <h3>风险分析</h3>
          <div id="risk-chart" class="chart"></div>
    </div>
        <div class="grid-item">
          <h3>任务执行</h3>
          <div id="task-chart" class="chart"></div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.data-charts-component {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-container {
  width: 100%;
  height: 100%;
  position: relative;
  min-height: 280px;
  overflow: hidden;
  background-color: rgba(10, 25, 41, 0.5);
  border-radius: 6px;
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 280px;
}

.chart-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(10, 25, 41, 0.7);
  color: #90caf9;
  font-size: 14px;
  border-radius: 6px;
}

.charts-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 15px 0;
}

.charts-header h2 {
  font-size: 1.2rem;
  color: #e3f2fd;
  margin: 0;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 5px;
  background-color: rgba(59, 130, 246, 0.1);
  color: #90caf9;
  font-size: 0.9rem;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-button:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

.filter-panel {
  margin-bottom: 15px;
  background-color: #132f4c;
  border-radius: 6px;
  padding: 15px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  height: 100%;
}

.grid-item {
  background-color: rgba(10, 25, 41, 0.5);
  border-radius: 6px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.grid-item h3 {
  font-size: 1rem;
  color: #e3f2fd;
  margin-top: 0;
  margin-bottom: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(6, 280px);
  }
}
</style> 