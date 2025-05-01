/**
 * 文件名: DataComparisonComponent.vue
 * 描述: 数据比较组件
 * 作用: 
 * - 对比不同时间段或不同区域的数据
 * - 提供直观的数据差异可视化
 * - 支持多维度数据比较分析
 */

<script setup lang="ts">
import { ref, onMounted, computed, reactive, watch, onUnmounted } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { Delete, Plus } from '@element-plus/icons-vue';
import AnomalyDetectionService from '@/services/AnomalyDetectionService';

// 图表实例
let comparisonChart: any = null;

// 组件属性
const props = defineProps({
  // 比较模式: 'time' - 时间比较, 'region' - 区域比较, 'custom' - 自定义比较
  mode: {
    type: String,
    default: 'time'
  }
});

// 加载状态
const loading = ref(false);

// 比较项配置
const comparisons = reactive([
  {
    name: '本周期',
    color: '#4CAF50',
    timeRange: [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()],
    region: '中心区域',
    selected: true
  },
  {
    name: '上周期',
    color: '#2196F3',
    timeRange: [new Date(new Date().setDate(new Date().getDate() - 14)), new Date(new Date().setDate(new Date().getDate() - 7))],
    region: '中心区域',
    selected: true
  }
]);

// 区域选项
const regionOptions = [
  { value: '中心区域', label: '中心区域' },
  { value: '北部区域', label: '北部区域' },
  { value: '南部区域', label: '南部区域' },
  { value: '东部区域', label: '东部区域' },
  { value: '西部区域', label: '西部区域' }
];

// 数据类型
const dataTypeOptions = [
  { value: 'person', label: '人员监测' },
  { value: 'vehicle', label: '车辆监测' },
  { value: 'task', label: '任务执行' },
  { value: 'risk', label: '风险监测' }
];
const selectedDataType = ref('person');

// 添加一个新的比较项
const addComparison = () => {
  if (comparisons.length >= 4) {
    ElMessage.warning('最多支持4个比较项');
    return;
  }
  
  const colors = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63'];
  const usedColors = comparisons.map(c => c.color);
  const availableColors = colors.filter(c => !usedColors.includes(c));
  
  comparisons.push({
    name: `比较项 ${comparisons.length + 1}`,
    color: availableColors[0] || '#9C27B0',
    timeRange: [
      new Date(new Date().setDate(new Date().getDate() - (7 * (comparisons.length + 1)))), 
      new Date(new Date().setDate(new Date().getDate() - (7 * comparisons.length)))
    ],
    region: '中心区域',
    selected: true
  });
};

// 删除比较项
const removeComparison = (index: number) => {
  if (comparisons.length <= 2) {
    ElMessage.warning('至少需要2个比较项');
    return;
  }
  
  comparisons.splice(index, 1);
  updateChart();
};

// 模拟数据 - 按数据类型和时间/区域获取
const fetchData = (dataType: string, timeRange: Date[], region: string) => {
  // 这里应该是从API获取数据，这里使用模拟数据
  const startDate = timeRange[0].getTime();
  const endDate = timeRange[1].getTime();
  const dateRange = endDate - startDate;
  
  // 生成日期序列
  const days = Math.ceil(dateRange / (1000 * 60 * 60 * 24));
  const dates = Array(days).fill(0).map((_, i) => {
    const date = new Date(startDate + i * 1000 * 60 * 60 * 24);
    return date.toISOString().split('T')[0];
  });
  
  // 根据数据类型生成不同的数据
  let values;
  const regionFactor = {
    '中心区域': 1,
    '北部区域': 0.8,
    '南部区域': 0.9,
    '东部区域': 0.7,
    '西部区域': 0.6
  }[region] || 1;
  
  if (dataType === 'person') {
    const baseValue = 100;
    values = dates.map((_, i) => {
      // 添加一些波动和趋势
      const dayFactor = 1 + (i / dates.length) * 0.2; // 增长趋势
      const variance = Math.random() * 20 - 10; // 随机波动
      return Math.round((baseValue * dayFactor + variance) * regionFactor);
    });
  } else if (dataType === 'vehicle') {
    const baseValue = 200;
    values = dates.map((_, i) => {
      const dayOfWeek = new Date(dates[i]).getDay();
      const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1; // 周末减少
      const variance = Math.random() * 30 - 15;
      return Math.round((baseValue * weekendFactor + variance) * regionFactor);
    });
  } else if (dataType === 'task') {
    const baseValue = 30;
    values = dates.map(() => {
      const variance = Math.round(Math.random() * 10 - 5);
      return Math.max(5, Math.round((baseValue + variance) * regionFactor));
    });
  } else if (dataType === 'risk') {
    const baseValue = 5;
    values = dates.map(() => {
      const variance = Math.round(Math.random() * 4 - 2);
      return Math.max(0, Math.round((baseValue + variance) * regionFactor));
    });
  } else {
    values = dates.map(() => Math.round(Math.random() * 100 * regionFactor));
  }
  
  return { dates, values };
};

// 更新图表数据
const updateChart = () => {
  if (!comparisonChart) return;
  
  loading.value = true;
  
  setTimeout(() => {
    // 获取所有选中比较项的数据
    const selectedComparisons = comparisons.filter(c => c.selected);
    const allSeries = [];
    let allDates: string[] = [];
    
    for (const comparison of selectedComparisons) {
      const { dates, values } = fetchData(selectedDataType.value, comparison.timeRange, comparison.region);
      
      // 合并所有日期
      if (allDates.length === 0) {
        allDates = dates;
      }
      
      // 检测异常值
      const dataWithAnomalies = AnomalyDetectionService.detectAnomaliesLocally(
        values.map((value, index) => ({ date: dates[index], value })),
        'value'
      );
      
      // 构建数据点，标记异常
      const dataPoints = values.map((value, index) => {
        const isAnomaly = dataWithAnomalies[index].isAnomaly;
        return {
          value,
          itemStyle: isAnomaly ? {
            color: comparison.color,
            borderColor: '#E57373',
            borderWidth: 2,
            borderType: 'dashed'
          } : null
        };
      });
      
      // 添加到系列数据
      allSeries.push({
        name: comparison.name,
        type: 'line',
        stack: props.mode === 'region' ? 'total' : undefined,
        data: dataPoints,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: comparison.color
        },
        areaStyle: props.mode === 'region' ? {
          opacity: 0.3,
          color: comparison.color
        } : undefined
      });
    }
    
    // 设置图表选项
    let yAxisType: 'value' | 'log' = 'value';
    if (selectedDataType.value === 'risk') {
      // 风险数据通常有较大的差异，使用对数坐标
      yAxisType = 'log';
    }
    
    const option = {
      title: {
        text: getChartTitle(),
        left: 'center',
        textStyle: {
          color: '#E3F2FD',
          fontSize: 16
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(19, 47, 76, 0.9)',
        borderColor: '#4fc3f7',
        borderWidth: 1,
        textStyle: { color: '#fff' },
        axisPointer: {
          type: 'cross',
          label: { backgroundColor: '#6a7985' }
        }
      },
      legend: {
        data: selectedComparisons.map(c => c.name),
        top: 30,
        textStyle: { color: '#90CAF9' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: 80,
        containLabel: true
      },
      toolbox: {
        feature: {
          saveAsImage: { title: '保存为图片' },
          dataZoom: { title: '区域缩放' },
          dataView: { title: '数据视图', readOnly: true }
        },
        iconStyle: {
          borderColor: '#90CAF9'
        }
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: allDates,
        axisLabel: {
          color: '#90CAF9',
          formatter: (value: string) => {
            const date = new Date(value);
            return `${date.getMonth() + 1}/${date.getDate()}`;
          },
          rotate: 30
        },
        axisLine: { lineStyle: { color: '#1e3a5f' } }
      },
      yAxis: {
        type: yAxisType,
        axisLabel: { color: '#90CAF9' },
        splitLine: { lineStyle: { color: '#1e3a5f', type: 'dashed' } }
      },
      series: allSeries,
      backgroundColor: 'transparent'
    };
    
    comparisonChart.setOption(option);
    loading.value = false;
  }, 600);
};

// 计算图表标题
const getChartTitle = () => {
  let typeText = '';
  switch (selectedDataType.value) {
    case 'person': typeText = '人员监测'; break;
    case 'vehicle': typeText = '车辆监测'; break;
    case 'task': typeText = '任务执行'; break;
    case 'risk': typeText = '风险监测'; break;
    default: typeText = '数据'; break;
  }
  
  if (props.mode === 'time') {
    return `${typeText}数据时间对比`;
  } else if (props.mode === 'region') {
    return `${typeText}数据区域对比`;
  }
  return `${typeText}数据对比分析`;
};

// 监听数据类型变化
watch(selectedDataType, () => {
  updateChart();
});

// 获取比较项标题
const getComparisonTitle = (comparison: any, index: number) => {
  if (props.mode === 'time') {
    return `${comparison.name} (${formatDate(comparison.timeRange[0])} - ${formatDate(comparison.timeRange[1])})`;
  } else if (props.mode === 'region') {
    return `${comparison.region} ${index === 0 ? '(当前)' : '(对比)'}`;
  }
  return comparison.name;
};

// 格式化日期
const formatDate = (date: Date) => {
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// 导出对比数据
const exportComparisonData = () => {
  const selectedComparisons = comparisons.filter(c => c.selected);
  const dataToExport = selectedComparisons.map(comparison => {
    const { dates, values } = fetchData(selectedDataType.value, comparison.timeRange, comparison.region);
    return {
      name: comparison.name,
      timeRange: comparison.timeRange.map(d => d.toISOString()),
      region: comparison.region,
      data: dates.map((date, i) => ({ date, value: values[i] }))
    };
  });
  
  // 在实际应用中，这里可以生成CSV或Excel文件
  console.log('导出数据', dataToExport);
  
  // 使用Blob创建并下载CSV
  const headers = ['日期'];
  selectedComparisons.forEach(c => headers.push(c.name));
  
  const rows = [];
  const firstComparison = dataToExport[0];
  firstComparison.data.forEach((item, i) => {
    const row = [item.date];
    selectedComparisons.forEach((_, j) => {
      row.push(dataToExport[j].data[i].value);
    });
    rows.push(row);
  });
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${selectedDataType.value}_comparison_${new Date().getTime()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  ElMessage.success('数据已导出为CSV文件');
};

// 初始化图表，使用MutationObserver确保DOM就绪
const initChart = () => {
  loading.value = true;
  
  // 检查DOM是否已经存在
  const chartDom = document.getElementById('comparison-chart');
  if (chartDom) {
    createChart(chartDom);
    return;
  }
  
  // 如果DOM不存在，使用MutationObserver监听DOM变化
  const observer = new MutationObserver((mutations, obs) => {
    const chartDom = document.getElementById('comparison-chart');
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
    const chartDom = document.getElementById('comparison-chart');
    if (chartDom) {
      createChart(chartDom);
    } else {
      console.error('无法找到比较图表容器，超时');
      loading.value = false;
    }
  }, 5000); // 5秒超时
};

// 创建图表实例
const createChart = (chartDom: HTMLElement) => {
  console.log('创建比较图表实例', chartDom);
  
  // 确保echarts实例被正确创建
  if (!comparisonChart) {
    comparisonChart = echarts.init(chartDom);
    
    // 添加窗口大小变化的监听
    window.addEventListener('resize', handleResize);
  }
  
  // 初始更新图表
  updateChart();
};

// 组件挂载
onMounted(() => {
  // 使用较长的延迟确保DOM完全渲染
  setTimeout(() => {
    initChart();
  }, 500);
});

// 处理窗口大小变化
const handleResize = () => {
  if (comparisonChart) {
    comparisonChart.resize();
  }
};

// 清理事件监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  
  if (comparisonChart) {
    comparisonChart.dispose();
    comparisonChart = null;
  }
});
</script>

<template>
  <div class="data-comparison-component">
    <div class="comparison-header">
      <h3>数据对比分析</h3>
      
      <div class="comparison-controls">
        <el-select v-model="selectedDataType" placeholder="选择数据类型" size="small">
          <el-option
            v-for="item in dataTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        
        <el-button size="small" type="primary" @click="updateChart">
          更新对比
        </el-button>
        
        <el-button size="small" @click="exportComparisonData">
          导出数据
        </el-button>
      </div>
    </div>
    
    <div class="comparison-config">
      <div class="comparison-items">
        <div 
          v-for="(comparison, index) in comparisons" 
          :key="index"
          class="comparison-item"
          :style="{ borderLeftColor: comparison.color }"
        >
          <div class="comparison-item-header">
            <el-checkbox v-model="comparison.selected" @change="updateChart" />
            <el-input 
              v-model="comparison.name" 
              placeholder="比较项名称" 
              size="small"
              class="comparison-name-input"
            />
            <el-button 
              v-if="comparisons.length > 2"
              size="small" 
              circle 
              @click="removeComparison(index)"
              type="danger"
              plain
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          
          <div class="comparison-item-content">
            <template v-if="mode === 'time'">
              <el-date-picker
                v-model="comparison.timeRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="small"
                style="width: 100%"
                @change="updateChart"
              />
            </template>
            
            <template v-if="mode === 'region' || mode === 'custom'">
              <el-select 
                v-model="comparison.region" 
                placeholder="选择区域" 
                size="small"
                style="width: 100%"
                @change="updateChart"
              >
                <el-option
                  v-for="item in regionOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </template>
          </div>
        </div>
        
        <el-button 
          v-if="comparisons.length < 4"
          size="small" 
          @click="addComparison"
          plain
          class="add-comparison-btn"
        >
          <el-icon><Plus /></el-icon> 添加比较项
        </el-button>
      </div>
    </div>
    
    <div class="chart-container">
      <div id="comparison-chart" class="chart"></div>
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
    </div>
    
    <div class="comparison-summary">
      <h4>数据对比摘要</h4>
      <ul class="summary-list">
        <li v-for="(comparison, index) in comparisons.filter(c => c.selected)" :key="index">
          <span class="summary-color" :style="{ backgroundColor: comparison.color }"></span>
          <span class="summary-name">{{ getComparisonTitle(comparison, index) }}</span>
        </li>
      </ul>
      <p class="summary-note">
        * 图表中标记的异常点表示数据偏离正常趋势超过了预设阈值
      </p>
    </div>
  </div>
</template>

<style scoped>
.data-comparison-component {
  background-color: #0A1929;
  border-radius: 12px;
  padding: 20px;
  color: white;
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.comparison-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.comparison-header h3 {
  margin: 0;
  color: #4FC3F7;
  font-size: 1.2rem;
}

.comparison-controls {
  display: flex;
  gap: 10px;
}

.comparison-config {
  margin-bottom: 20px;
  background-color: #132F4C;
  border-radius: 8px;
  padding: 16px;
}

.comparison-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.comparison-item {
  background-color: rgba(19, 47, 76, 0.6);
  border-radius: 8px;
  padding: 12px;
  border-left: 4px solid;
}

.comparison-item-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
}

.comparison-name-input {
  flex: 1;
}

.add-comparison-btn {
  width: fit-content;
  margin-top: 10px;
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

.comparison-summary {
  background-color: #132F4C;
  border-radius: 8px;
  padding: 16px;
}

.comparison-summary h4 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #90CAF9;
  font-size: 1rem;
}

.summary-list {
  list-style: none;
  padding: 0;
  margin: 0 0 12px 0;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.summary-list li {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: inline-block;
}

.summary-note {
  font-size: 0.85rem;
  color: #90CAF9;
  margin: 0;
}

@media (max-width: 768px) {
  .comparison-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .comparison-controls {
    width: 100%;
  }
}
</style> 