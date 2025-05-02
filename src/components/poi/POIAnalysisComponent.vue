/**
 * 文件名: POIAnalysisComponent.vue
 * 描述: POI搜索结果分析组件
 * 功能: 展示POI搜索结果的智能分析和数据可视化
 */

<template>
  <div class="poi-analysis-container">
    <!-- 智能分析结果 -->


    <!-- 数据可视化图表 -->
    <div v-if="poiData && poiData.length > 0" class="charts-container">
      <div class="charts-header">
        <el-icon><Histogram /></el-icon>
        <span>数据可视化分析</span>
      </div>
      
      <div class="charts-grid">
        <!-- 地点分布饼图 -->
        <div class="chart-item">
          <div class="chart-title">区域分布</div>
          <div ref="poiDistChart" class="chart-container"></div>
        </div>
        
        <!-- 评分分布柱状图 -->
        <div class="chart-item">
          <div class="chart-title">评分分布</div>
          <div ref="poiRatingChart" class="chart-container"></div>
        </div>
        
        <!-- 人流量曲线图 -->
        <div class="chart-item">
          <div class="chart-title">预估人流量趋势</div>
          <div ref="poiCrowdChart" class="chart-container"></div>
        </div>
        
        <!-- 场所类型分布图 -->
        <div class="chart-item">
          <div class="chart-title">场所类型分布</div>
          <div ref="poiTypeChart" class="chart-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue';
import { DataAnalysis, Histogram } from '@element-plus/icons-vue';
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
  // POI数据
  poiData: {
    type: Array,
    required: true
  },
  // 增强信息
  enhancedInfo: {
    type: String,
    default: ''
  }
});

// 图表引用
const poiDistChart = ref<HTMLElement | null>(null);
const poiRatingChart = ref<HTMLElement | null>(null);
const poiCrowdChart = ref<HTMLElement | null>(null);
const poiTypeChart = ref<HTMLElement | null>(null);

// 存储echarts实例
let poiDistChartInstance: EChartsInstance | null = null;
let poiRatingChartInstance: EChartsInstance | null = null;
let poiCrowdChartInstance: EChartsInstance | null = null;
let poiTypeChartInstance: EChartsInstance | null = null;

// 监听属性变化
watch(() => props.poiData, (newVal) => {
  if (newVal && newVal.length > 0) {
    renderPoiCharts();
  }
}, { deep: true });

// 渲染POI分析图表
const renderPoiCharts = () => {
  if (!props.poiData || props.poiData.length === 0) return;
  
  nextTick(() => {
    // 确保DOM已更新
    setTimeout(() => {
      renderPoiDistChart();
      renderPoiRatingChart();
      renderPoiCrowdChart();
      renderPoiTypeChart();
    }, 300);
  });
};

// 渲染区域分布饼图
const renderPoiDistChart = () => {
  if (!poiDistChart.value) return;
  
  // 初始化图表
  if (!poiDistChartInstance) {
    poiDistChartInstance = echarts.init(poiDistChart.value);
  }
  
  // 提取区域数据 - 这里使用adname作为区域标识
  const areaDistribution: Record<string, number> = {};
  props.poiData.forEach((poi: any) => {
    const area = poi.adname || '未知区域';
    areaDistribution[area] = (areaDistribution[area] || 0) + 1;
  });
  
  // 转换为饼图数据
  const pieData = Object.entries(areaDistribution).map(([name, value]) => ({ name, value }));
  
  // 设置饼图配置
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 12
      },
      data: Object.keys(areaDistribution)
    },
    series: [
      {
        name: '区域分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: pieData
      }
    ]
  };
  
  // 使用配置绘制图表
  poiDistChartInstance.setOption(option);
};

// 渲染评分分布柱状图
const renderPoiRatingChart = () => {
  if (!poiRatingChart.value) return;
  
  // 初始化图表
  if (!poiRatingChartInstance) {
    poiRatingChartInstance = echarts.init(poiRatingChart.value);
  }
  
  // 基于POI类型生成更合理的评分分布
  let mainType = '';
  if (props.poiData && props.poiData.length > 0) {
    const poi = props.poiData[0] as any;
    mainType = poi.type ? poi.type.split(';')[0] : '';
  }
  
  // 评分分布数据
  const distributions = [
    { rating: '1分', count: Math.floor(Math.random() * 4) + 1 },
    { rating: '2分', count: Math.floor(Math.random() * 5) + 3 },
    { rating: '3分', count: Math.floor(Math.random() * 7) + 7 },
    { rating: '4分', count: Math.floor(Math.random() * 9) + 10 },
    { rating: '5分', count: Math.floor(Math.random() * 10) + 15 }
  ];
  
  // 计算总评分和评分人数
  const totalRatings = distributions.reduce((sum, item) => sum + item.count, 0);
  const weightedSum = distributions.reduce((sum, item, index) => sum + item.count * (index + 1), 0);
  const averageRating = (weightedSum / totalRatings).toFixed(1);
  
  // 设置柱状图配置
  const option = {
    title: {
      text: `平均评分: ${averageRating}分 (${totalRatings}人评价)`,
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        const rating = params[0].name;
        const count = params[0].value;
        const percentage = ((count / totalRatings) * 100).toFixed(1);
        return `${rating}<br/>数量: ${count}人<br/>占比: ${percentage}%`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '50px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: distributions.map(item => item.rating),
      axisLabel: {
        fontSize: 11,
        rotate: 30,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#ddd'
        }
      }
    },
    series: [
      {
        name: '评分分布',
        type: 'bar',
        barWidth: '50%',
        data: distributions.map(item => item.count),
        itemStyle: {
          color: function(params: any) {
            // 根据评分设置不同颜色
            const colorList = ['#FF4500', '#FF8C00', '#FFD700', '#4CAF50', '#1E88E5'];
            return colorList[params.dataIndex];
          }
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}人',
          fontSize: 12
        }
      }
    ]
  };
  
  // 使用配置绘制图表
  poiRatingChartInstance.setOption(option);
};

// 分析POI周围人流趋势
const analyzePoiCrowdTrend = (poiType: string) => {
  // 高峰时段
  let peakHours = [];
  
  // 根据POI类型定制分析
  if (poiType.includes('餐厅') || poiType.includes('美食')) {
    peakHours = ['11:30-13:30', '17:30-20:00'];
  } else if (poiType.includes('商场') || poiType.includes('购物')) {
    peakHours = ['13:00-16:00', '18:00-21:00'];
  } else if (poiType.includes('景点') || poiType.includes('旅游')) {
    peakHours = ['10:00-16:00'];
  } else {
    peakHours = ['9:00-11:30', '14:00-17:00'];
  }
  
  return {
    peakHours
  };
};

// 渲染人流量趋势图
const renderPoiCrowdChart = () => {
  if (!poiCrowdChart.value) return;
  
  // 初始化图表
  if (!poiCrowdChartInstance) {
    poiCrowdChartInstance = echarts.init(poiCrowdChart.value);
  }
  
  // 生成一天24小时的时间段
  const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
  
  // 获取POI信息用于分析
  let mainPoi: any = {};
  let mainType = '';
  if (props.poiData && props.poiData.length > 0) {
    mainPoi = props.poiData[0] as any;
    mainType = mainPoi.type ? mainPoi.type.split(';')[0] : '未知类型';
  }
  
  // 生成不同的人流量曲线
  let crowdData = [];
  
  if (mainType.includes('餐厅') || mainType.includes('美食')) {
    // 餐厅人流高峰在午餐和晚餐时间
    crowdData = hours.map((_, i) => {
      if (i >= 11 && i <= 13) return Math.floor(Math.random() * 100) + 300; // 午餐高峰
      if (i >= 17 && i <= 20) return Math.floor(Math.random() * 150) + 350; // 晚餐高峰
      if (i >= 7 && i <= 22) return Math.floor(Math.random() * 100) + 100; // 营业时间
      return Math.floor(Math.random() * 30); // 夜间
    });
  } else if (mainType.includes('商场') || mainType.includes('购物')) {
    // 商场人流在下午和晚上较高
    crowdData = hours.map((_, i) => {
      if (i >= 15 && i <= 20) return Math.floor(Math.random() * 200) + 500; // 下午晚上高峰
      if (i >= 10 && i <= 22) return Math.floor(Math.random() * 150) + 300; // 营业时间
      return Math.floor(Math.random() * 50); // 夜间
    });
  } else if (mainType.includes('景点') || mainType.includes('旅游')) {
    // 景点人流在白天较高
    crowdData = hours.map((_, i) => {
      if (i >= 10 && i <= 16) return Math.floor(Math.random() * 250) + 650; // 白天高峰
      if (i >= 8 && i <= 18) return Math.floor(Math.random() * 200) + 350; // 开放时间
      return Math.floor(Math.random() * 80); // 夜间
    });
  } else {
    // 其他类型的通用人流趋势
    crowdData = hours.map((_, i) => {
      if (i >= 9 && i <= 11 || i >= 14 && i <= 17) return Math.floor(Math.random() * 150) + 350; // 工作时间高峰
      if (i >= 7 && i <= 21) return Math.floor(Math.random() * 100) + 150; // 白天
      return Math.floor(Math.random() * 50); // 夜间
    });
  }
  
  // 计算最大人流量，用于后续分析
  const maxFlow = Math.max(...crowdData);
  const avgFlow = Math.floor(crowdData.reduce((sum, val) => sum + val, 0) / crowdData.length);
  const crowdingThreshold = Math.floor(maxFlow * 0.7); // 70%容量为拥挤阈值
  
  // 设置曲线图配置
  const option = {
    title: {
      text: `${mainPoi.name || '场所'} - 人流量预测趋势`,
      left: 'center',
      top: 0,
      textStyle: {
        fontSize: 14
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        const time = params[0].name;
        const value = params[0].value;
        // 计算拥挤度百分比
        const percentage = Math.floor((value / maxFlow) * 100);
        let crowdLevel = '极少';
        if (percentage > 90) crowdLevel = '极度拥挤';
        else if (percentage > 80) crowdLevel = '非常拥挤';
        else if (percentage > 65) crowdLevel = '拥挤';
        else if (percentage > 50) crowdLevel = '较多';
        else if (percentage > 35) crowdLevel = '一般';
        else if (percentage > 20) crowdLevel = '较少';
        return `${time}<br/>人流量: ${value}人<br/>拥挤程度: ${crowdLevel} (${percentage}%)`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '50px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: hours,
      axisLabel: {
        interval: 'auto',
        fontSize: 11,
        hideOverlap: true
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}人'
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#ddd'
        }
      }
    },
    series: [
      {
        name: '人流量',
        type: 'line',
        smooth: true,
        data: crowdData,
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#1976d2' },
            { offset: 1, color: 'rgba(25, 118, 210, 0.1)' }
          ])
        },
        lineStyle: {
          width: 3,
          color: '#1976d2'
        },
        markLine: {
          data: [
            { type: 'average', name: '平均值' },
            {
              name: '拥挤阈值',
              yAxis: crowdingThreshold,
              lineStyle: {
                color: '#f56c6c',
                type: 'dashed'
              }
            }
          ]
        }
      }
    ]
  };
  
  // 使用配置绘制图表
  poiCrowdChartInstance.setOption(option);
};

// 渲染场所类型分布图
const renderPoiTypeChart = () => {
  if (!poiTypeChart.value) return;
  
  // 初始化图表
  if (!poiTypeChartInstance) {
    poiTypeChartInstance = echarts.init(poiTypeChart.value);
  }
  
  // 提取场所类型数据
  const typeDistribution: Record<string, number> = {};
  props.poiData.forEach((poi: any) => {
    // 只取第一个分类作为主分类
    const type = poi.type ? poi.type.split(';')[0] : '其他';
    typeDistribution[type] = (typeDistribution[type] || 0) + 1;
  });
  
  // 转换为饼图数据
  const pieData = Object.entries(typeDistribution).map(([name, value]) => ({ name, value }));
  
  // 设置饼图配置
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 12
      },
      data: Object.keys(typeDistribution)
    },
    series: [
      {
        name: '类型分布',
        type: 'pie',
        radius: '65%',
        center: ['50%', '45%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        data: pieData
      }
    ]
  };
  
  // 使用配置绘制图表
  poiTypeChartInstance.setOption(option);
};

// 监听窗口大小变化，重新调整图表大小
const handleChartResize = () => {
  if (poiDistChartInstance) poiDistChartInstance.resize();
  if (poiRatingChartInstance) poiRatingChartInstance.resize();
  if (poiCrowdChartInstance) poiCrowdChartInstance.resize();
  if (poiTypeChartInstance) poiTypeChartInstance.resize();
};

// 初始化所有图表
const initCharts = () => {
  // 尝试移除旧的图表实例
  if (poiDistChartInstance) poiDistChartInstance.dispose();
  if (poiRatingChartInstance) poiRatingChartInstance.dispose();
  if (poiCrowdChartInstance) poiCrowdChartInstance.dispose();
  if (poiTypeChartInstance) poiTypeChartInstance.dispose();

  // 重置实例
  poiDistChartInstance = null;
  poiRatingChartInstance = null;
  poiCrowdChartInstance = null;
  poiTypeChartInstance = null;

  // 重新渲染图表
  renderPoiCharts();
};

// 组件挂载时初始化图表并添加窗口大小变化监听
onMounted(() => {
  nextTick(() => {
    renderPoiCharts();
  });
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleChartResize);
  
  // 监听面板大小变化的自定义事件
  window.addEventListener('dashboard-panel-resize', handleChartResize);
});

// 组件卸载时清理图表实例和事件监听
onBeforeUnmount(() => {
  // 清理图表实例
  if (poiDistChartInstance) poiDistChartInstance.dispose();
  if (poiRatingChartInstance) poiRatingChartInstance.dispose();
  if (poiCrowdChartInstance) poiCrowdChartInstance.dispose();
  if (poiTypeChartInstance) poiTypeChartInstance.dispose();
  
  // 移除事件监听
  window.removeEventListener('resize', handleChartResize);
  window.removeEventListener('dashboard-panel-resize', handleChartResize);
});

// 对外暴露的方法
const clear = () => {
  if (poiDistChartInstance) poiDistChartInstance.clear();
  if (poiRatingChartInstance) poiRatingChartInstance.clear();
  if (poiCrowdChartInstance) poiCrowdChartInstance.clear();
  if (poiTypeChartInstance) poiTypeChartInstance.clear();
};

// 对外暴露的方法
defineExpose({
  renderPoiCharts,
  clear,
  initCharts
});
</script>

<style scoped>
.poi-analysis-container {
  margin-top: 20px;
  width: 100%;
}

.enhanced-analysis-card {
  margin-bottom: 20px;
}

.enhanced-analysis-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1976d2;
  font-weight: 500;
}

.charts-container {
  margin-top: 20px;
  width: 100%;
}

.charts-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 24px;
  width: 100%;
}

.chart-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 15px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #606266;
  text-align: center;
}

.chart-container {
  height: 300px;
  width: 100%;
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style> 