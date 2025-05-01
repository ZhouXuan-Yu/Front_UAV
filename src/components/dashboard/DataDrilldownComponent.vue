/**
 * 文件名: DataDrilldownComponent.vue
 * 描述: 数据钻取分析组件
 * 在项目中的作用: 
 * - 提供数据钻取和深度分析功能
 * - 支持从高层次数据到详细数据的探索
 * - 可视化展示数据层次结构和关系
 * - 集成异常检测和智能分析
 */

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { ArrowLeft, ZoomIn, Download, Filter, Connection, WarningFilled } from '@element-plus/icons-vue';

// 组件属性
const props = defineProps({
  // 初始数据类型
  dataType: {
    type: String,
    default: 'person'
  },
  // 初始区域
  region: {
    type: String,
    default: 'central'
  },
  // 初始时间段
  timeRange: {
    type: Array,
    default: () => [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()]
  }
});

// 组件事件
const emit = defineEmits(['back', 'export-data']);

// 加载状态
const loading = ref(false);
// 当前数据层级
const currentLevel = ref('overview');
// 选中的数据项
const selectedItem = ref(null);
// 图表实例
let drillChart: any = null;

// 异常检测开关
const anomalyDetection = ref(true);
// 异常阈值
const anomalyThreshold = ref(2.5);

// 数据钻取路径
const drillPath = reactive([
  { level: 'overview', label: '总览' }
]);

// 模拟数据 - 人员监测
const personData = reactive({
  overview: [
    { name: '成年男性', value: 42, trend: '+12%', anomaly: false },
    { name: '成年女性', value: 38, trend: '+8%', anomaly: false },
    { name: '老年人', value: 15, trend: '-5%', anomaly: false },
    { name: '儿童', value: 5, trend: '+2%', anomaly: false }
  ],
  '成年男性': [
    { name: '25-34岁', value: 18, trend: '+15%', anomaly: false },
    { name: '35-44岁', value: 14, trend: '+8%', anomaly: false },
    { name: '45-54岁', value: 10, trend: '+5%', anomaly: true }
  ],
  '成年女性': [
    { name: '25-34岁', value: 15, trend: '+10%', anomaly: false },
    { name: '35-44岁', value: 12, trend: '+6%', anomaly: false },
    { name: '45-54岁', value: 11, trend: '+4%', anomaly: false }
  ],
  '老年人': [
    { name: '55-64岁', value: 8, trend: '-2%', anomaly: false },
    { name: '65-74岁', value: 5, trend: '-8%', anomaly: false },
    { name: '75岁以上', value: 2, trend: '-12%', anomaly: true }
  ],
  '儿童': [
    { name: '0-5岁', value: 2, trend: '+1%', anomaly: false },
    { name: '6-12岁', value: 3, trend: '+3%', anomaly: false }
  ]
});

// 模拟数据 - 车辆监测
const vehicleData = reactive({
  overview: [
    { name: '轿车', value: 1850, trend: '+22%', anomaly: false },
    { name: '卡车', value: 420, trend: '+5%', anomaly: false },
    { name: '摩托车', value: 650, trend: '+18%', anomaly: false },
    { name: '巴士', value: 180, trend: '+3%', anomaly: false }
  ],
  '轿车': [
    { name: '私家车', value: 1620, trend: '+25%', anomaly: false },
    { name: '出租车', value: 230, trend: '+10%', anomaly: false }
  ],
  '卡车': [
    { name: '轻型卡车', value: 280, trend: '+8%', anomaly: false },
    { name: '重型卡车', value: 140, trend: '+2%', anomaly: true }
  ],
  '摩托车': [
    { name: '标准摩托车', value: 480, trend: '+20%', anomaly: false },
    { name: '电动摩托车', value: 170, trend: '+12%', anomaly: false }
  ],
  '巴士': [
    { name: '公交车', value: 145, trend: '+2%', anomaly: false },
    { name: '旅游巴士', value: 35, trend: '+5%', anomaly: false }
  ]
});

// 时间序列数据 - 用于趋势图
const timeSeriesData = reactive({
  '成年男性': [38, 36, 39, 42, 40, 43, 42],
  '成年女性': [35, 36, 38, 37, 39, 37, 38],
  '老年人': [16, 17, 15, 16, 14, 15, 15],
  '儿童': [4, 5, 5, 4, 6, 5, 5],
  '轿车': [1720, 1760, 1790, 1820, 1840, 1830, 1850],
  '卡车': [400, 395, 410, 415, 405, 420, 420],
  '摩托车': [600, 610, 625, 635, 640, 645, 650],
  '巴士': [175, 178, 176, 182, 179, 180, 180],
  dates: [
    new Date(new Date().setDate(new Date().getDate() - 6)).toLocaleDateString(),
    new Date(new Date().setDate(new Date().getDate() - 5)).toLocaleDateString(),
    new Date(new Date().setDate(new Date().getDate() - 4)).toLocaleDateString(),
    new Date(new Date().setDate(new Date().getDate() - 3)).toLocaleDateString(),
    new Date(new Date().setDate(new Date().getDate() - 2)).toLocaleDateString(),
    new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString(),
    new Date().toLocaleDateString()
  ]
});

// 计算当前展示的数据
const currentData = computed(() => {
  if (props.dataType === 'person') {
    return personData[currentLevel.value] || personData.overview;
  } else if (props.dataType === 'vehicle') {
    return vehicleData[currentLevel.value] || vehicleData.overview;
  }
  return [];
});

// 当前图表标题
const chartTitle = computed(() => {
  const typeLabel = props.dataType === 'person' ? '人员' : '车辆';
  if (currentLevel.value === 'overview') {
    return `${typeLabel}监测数据分布`;
  }
  return `${currentLevel.value}细分数据`;
});

// 初始化图表，使用MutationObserver确保DOM就绪
const initChart = () => {
  loading.value = true;
  
  // 检查DOM是否已经存在
  const chartDom = document.getElementById('drilldown-chart');
  if (chartDom) {
    createChart(chartDom);
    return;
  }
  
  // 如果DOM不存在，使用MutationObserver监听DOM变化
  const observer = new MutationObserver((mutations, obs) => {
    const chartDom = document.getElementById('drilldown-chart');
    if (chartDom) {
      // DOM元素存在，创建图表
      createChart(chartDom);
      // 停止观察
      obs.disconnect();
    }
  });
  
  // 开始观察document的子树变化
  observer.observe(document.body, { 
    childList: true,
    subtree: true
  });
  
  // 设置一个超时以防止无限等待
  setTimeout(() => {
    observer.disconnect();
    const chartDom = document.getElementById('drilldown-chart');
    if (chartDom) {
      createChart(chartDom);
    } else {
      console.error('无法找到图表容器，超时');
      loading.value = false;
    }
  }, 5000); // 5秒超时
};

// 创建图表实例
const createChart = (chartDom: HTMLElement) => {
  console.log('创建图表实例', chartDom);
  
  // 确保echarts实例被正确创建
  if (!drillChart) {
    drillChart = echarts.init(chartDom);
    
    // 添加窗口大小变化的监听
    window.addEventListener('resize', handleResize);
    
    // 添加图表点击事件
    drillChart.on('click', (params: any) => {
      if (params && typeof params.name === 'string') {
        drillDown(params.name);
      } else {
        console.error('点击事件参数异常', params);
      }
    });
  }
  
  // 确保图表被更新
  updateChart();
  loading.value = false;
};

// 处理窗口大小变化
const handleResize = () => {
  if (drillChart) {
    drillChart.resize();
  }
};

// 更新图表
const updateChart = () => {
  if (!drillChart) return;
  
  loading.value = true;
  
  setTimeout(() => {
    const seriesData = currentData.value.map(item => {
      return {
        name: item.name,
        value: item.value,
        itemStyle: {
          color: item.anomaly ? '#E57373' : undefined
        },
        emphasis: {
          itemStyle: {
            color: item.anomaly ? '#EF5350' : undefined
          }
        }
      };
    });
    
    const option = {
      title: {
        text: chartTitle.value,
        left: 'center',
        textStyle: {
          color: '#E3F2FD',
          fontSize: 16
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const item = currentData.value.find(d => d.name === params.name);
          if (item) {
            let valueDisplay = typeof params.value === 'object' ? params.value.value : params.value;
            return `${params.name}<br />数量: ${valueDisplay}<br />趋势: ${item.trend}${item.anomaly ? '<br /><span style="color:#E57373">⚠️ 异常变化</span>' : ''}`;
          }
          return `${params.name}: ${params.value}`;
        }
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        textStyle: {
          color: '#90CAF9'
        }
      },
      series: [
        {
          name: '数据分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#0A1929',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
              color: '#fff'
            }
          },
          labelLine: {
            show: false
          },
          data: seriesData
        }
      ],
      color: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#3F51B5', '#009688', '#795548'],
      backgroundColor: 'transparent',
      textStyle: {
        color: '#FFF'
      }
    };
    
    drillChart.setOption(option);
    loading.value = false;
  }, 500);
};

// 数据钻取
const drillDown = (itemName: string) => {
  if (currentLevel.value === 'overview') {
    // 检查是否有下一级数据
    const hasNextLevel = props.dataType === 'person' 
      ? !!personData[itemName] 
      : !!vehicleData[itemName];
    
    if (hasNextLevel) {
      selectedItem.value = itemName;
      currentLevel.value = itemName;
      drillPath.push({ level: itemName, label: itemName });
      updateChart();
    }
  }
};

// 返回上一层
const drillUp = () => {
  if (drillPath.length > 1) {
    drillPath.pop();
    currentLevel.value = drillPath[drillPath.length - 1].level;
    updateChart();
  } else {
    emit('back');
  }
};

// 导出数据
const exportData = () => {
  emit('export-data', {
    dataType: props.dataType,
    level: currentLevel.value,
    data: currentData.value,
    exportTime: new Date().toLocaleString()
  });
  
  ElMessage({
    message: '数据已导出',
    type: 'success'
  });
};

// 运行异常检测
const runAnomalyDetection = () => {
  loading.value = true;
  
  setTimeout(() => {
    const dataSet = props.dataType === 'person' ? personData : vehicleData;
    
    // 模拟异常检测逻辑
    Object.keys(dataSet).forEach(key => {
      dataSet[key].forEach(item => {
        // 随机生成一些异常点
        item.anomaly = Math.random() > 0.8;
      });
    });
    
    updateChart();
    
    ElMessage({
      message: '异常检测已完成',
      type: 'success'
    });
    
    loading.value = false;
  }, 1000);
};

// 查看时间趋势
const showTimeTrend = (item: any) => {
  if (!drillChart) return;
  
  loading.value = true;
  
  setTimeout(() => {
    const trendData = timeSeriesData[item.name];
    if (!trendData) {
      ElMessage.warning('没有该项目的时间序列数据');
      loading.value = false;
      return;
    }
    
    const option = {
      title: {
        text: `${item.name}趋势分析`,
        left: 'center',
        textStyle: {
          color: '#E3F2FD',
          fontSize: 16
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}<br />{a}: {c}'
      },
      xAxis: {
        type: 'category',
        data: timeSeriesData.dates,
        axisLabel: {
          color: '#90CAF9',
          fontSize: 10,
          rotate: 30
        }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#90CAF9'
        },
        splitLine: {
          lineStyle: {
            color: '#132F4C',
            type: 'dashed'
          }
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '10%',
        top: '60',
        containLabel: true
      },
      series: [
        {
          name: item.name,
          type: 'line',
          data: trendData,
          smooth: true,
          symbol: 'emptyCircle',
          symbolSize: 8,
          lineStyle: {
            width: 3,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#4CAF50' },
              { offset: 1, color: '#81C784' }
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
      ],
      backgroundColor: 'transparent',
      textStyle: {
        color: '#FFF'
      }
    };
    
    drillChart.setOption(option);
    loading.value = false;
  }, 600);
};

// 返回饼图视图
const backToPieChart = () => {
  updateChart();
};

// 监听数据类型变化
watch(() => props.dataType, () => {
  currentLevel.value = 'overview';
  drillPath.splice(1);
  updateChart();
});

// 组件挂载
onMounted(() => {
  // 使用较长的延迟确保DOM完全渲染
  setTimeout(() => {
    initChart();
  }, 500);
});

// 组件卸载前清理
onUnmounted(() => {
  // 移除事件监听
  window.removeEventListener('resize', handleResize);
  
  // 销毁图表实例
  if (drillChart) {
    drillChart.dispose();
    drillChart = null;
  }
});
</script>

<template>
  <div class="data-drilldown-component">
    <!-- 面包屑导航 -->
    <div class="drilldown-header">
      <div class="breadcrumb">
        <span 
          v-for="(path, index) in drillPath" 
          :key="path.level"
          class="breadcrumb-item"
        >
          <span 
            class="breadcrumb-link" 
            :class="{ active: index === drillPath.length - 1 }"
            @click="index < drillPath.length - 1 ? (currentLevel = path.level, drillPath.splice(index + 1), updateChart()) : null"
          >
            {{ path.label }}
          </span>
          <span v-if="index < drillPath.length - 1" class="breadcrumb-separator">/</span>
        </span>
      </div>
      
      <div class="controls">
        <el-tooltip content="返回上级" placement="top">
          <el-button size="small" circle @click="drillUp">
            <el-icon><ArrowLeft /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="导出数据" placement="top">
          <el-button size="small" circle @click="exportData">
            <el-icon><Download /></el-icon>
          </el-button>
        </el-tooltip>
        
        <el-tooltip content="异常检测" placement="top">
          <el-button 
            size="small" 
            circle 
            :type="anomalyDetection ? 'primary' : 'default'"
            @click="anomalyDetection = !anomalyDetection, runAnomalyDetection()"
          >
            <el-icon><WarningFilled /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="chart-container">
      <div id="drilldown-chart" class="chart"></div>
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </div>
    
    <!-- 数据表格 -->
    <div class="data-table">
      <h3>数据明细</h3>
      <table>
        <thead>
          <tr>
            <th>名称</th>
            <th>数量</th>
            <th>趋势</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in currentData" :key="item.name" :class="{ 'anomaly-row': item.anomaly }">
            <td>{{ item.name }}</td>
            <td>{{ item.value }}</td>
            <td :class="{'trend-up': item.trend.startsWith('+'), 'trend-down': item.trend.startsWith('-')}">
              {{ item.trend }}
              <el-icon v-if="item.anomaly" color="#E57373"><WarningFilled /></el-icon>
            </td>
            <td>
              <el-button-group size="small">
                <el-button 
                  size="small" 
                  @click="showTimeTrend(item)"
                  :icon="Connection"
                >
                  趋势
                </el-button>
                <el-button 
                  size="small" 
                  @click="drillDown(item.name)"
                  :icon="ZoomIn"
                  :disabled="currentLevel.value !== 'overview'"
                >
                  钻取
                </el-button>
              </el-button-group>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.data-drilldown-component {
  background-color: #0A1929;
  border-radius: 12px;
  padding: 20px;
  color: white;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.drilldown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-link {
  color: #90CAF9;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s;
}

.breadcrumb-link:hover {
  background-color: rgba(144, 202, 249, 0.1);
}

.breadcrumb-link.active {
  color: #E3F2FD;
  font-weight: bold;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #64B5F6;
}

.controls {
  display: flex;
  gap: 10px;
}

.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
  margin-bottom: 20px;
  background-color: rgba(19, 47, 76, 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.chart {
  height: 100%;
  width: 100%;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(10, 25, 41, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #132F4C;
  border-top-color: #4FC3F7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.data-table {
  overflow-x: auto;
}

.data-table h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #4FC3F7;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 12px 10px;
  text-align: left;
}

th {
  background-color: #132F4C;
  color: #4FC3F7;
  font-weight: normal;
}

td {
  border-bottom: 1px solid #132F4C;
}

.trend-up {
  color: #81C784;
}

.trend-down {
  color: #E57373;
}

.anomaly-row {
  background-color: rgba(229, 115, 115, 0.1);
}

.anomaly-row:hover {
  background-color: rgba(229, 115, 115, 0.2);
}

@media (max-width: 768px) {
  .drilldown-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .controls {
    width: 100%;
    justify-content: flex-end;
  }
}
</style> 