<!--
文件名: InteractiveFilteringComponent.vue
描述: 交互式数据筛选组件
功能: 
- 支持从一个图表的选择反映到其他相关图表
- 实现多维度数据联动筛选
- 提供实时的筛选结果反馈
-->

<template>
  <div class="interactive-filtering-container">
    <div class="filtering-header">
      <el-row :gutter="20">
        <el-col :span="16">
          <h3 class="component-title">{{ title }}</h3>
        </el-col>
        <el-col :span="8" class="controls">
          <el-button
            size="small"
            type="primary"
            plain
            icon="el-icon-refresh-right"
            @click="resetAllFilters">
            重置筛选
          </el-button>
          <el-tooltip content="查看筛选帮助" placement="top">
            <el-button
              size="small"
              type="info"
              plain
              icon="el-icon-question"
              @click="showHelp = true">
            </el-button>
          </el-tooltip>
        </el-col>
      </el-row>
    </div>
    
    <div class="filtering-body">
      <div class="active-filters" v-if="activeFilters.length > 0">
        <span class="active-filters-label">已选筛选条件:</span>
        <el-tag
          v-for="filter in activeFilters"
          :key="filter.id"
          closable
          type="info"
          size="small"
          class="filter-tag"
          @close="removeFilter(filter.id)">
          {{ filter.dimension }}: {{ filter.displayValue }}
        </el-tag>
      </div>
      
      <div class="filter-controls" v-if="activeFilters.length > 0">
        <button class="clear-filters-btn" @click="clearAllFilters">清除所有筛选条件</button>
        <button class="ai-recommend-btn" v-if="deepSeekEnabled" @click="requestAiVisualizationRecommend">
          <i class="el-icon-magic-stick"></i> AI推荐可视化
        </button>
      </div>
      
      <div class="charts-container">
        <el-row :gutter="20">
          <el-col v-for="(chart, index) in chartConfigs" :key="index" :span="chart.span || 12">
            <div
              :ref="`chart-${index}`"
              class="chart-wrapper"
              :class="{ 'is-filtered': isChartFiltered(chart.id) }"
              @click="handleChartClick($event, chart)">
              <h4 class="chart-title">{{ chart.title }}</h4>
              <div class="chart-container"></div>
              <div class="chart-footer">
                <span class="dimension-label">{{ chart.dimension }}</span>
                <span class="metric-label">{{ chart.metric }}</span>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <div class="filtering-summary">
        <div class="summary-content">
          <div class="summary-counts">
            <div class="summary-stat">
              <div class="stat-value">{{ filteredData.length }}</div>
              <div class="stat-label">已筛选数据</div>
            </div>
            <div class="summary-stat">
              <div class="stat-value">{{ totalRecords }}</div>
              <div class="stat-label">总记录数</div>
            </div>
            <div class="summary-stat">
              <div class="stat-value">{{ ((filteredData.length / totalRecords) * 100).toFixed(1) }}%</div>
              <div class="stat-label">占比</div>
            </div>
          </div>
          <div class="summary-actions">
            <el-button size="small" type="primary" @click="exportFilteredData">导出筛选结果</el-button>
            <el-button size="small" @click="emitFilteredData">应用筛选</el-button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 帮助对话框 -->
    <el-dialog
      title="联动筛选使用帮助"
      v-model="showHelp"
      width="500px">
      <div class="help-content">
        <h4>使用方法</h4>
        <ol>
          <li>点击任意图表中的数据点或条形选择该维度的值</li>
          <li>其他图表会自动根据您的选择进行筛选</li>
          <li>点击已选择的同一个区域可以取消选择</li>
          <li>可以在多个图表中进行选择，实现多维度筛选</li>
          <li>使用"重置筛选"按钮清除所有筛选条件</li>
          <li>使用"导出筛选结果"下载当前筛选的数据</li>
          <li>使用"应用筛选"将当前筛选条件应用到其他组件</li>
        </ol>
        <h4>筛选逻辑</h4>
        <p>同一维度内的多个选择使用"或(OR)"逻辑，不同维度之间使用"与(AND)"逻辑。</p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showHelp = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
    
    <!-- AI推荐加载中 -->
    <div class="ai-loading-overlay" v-if="isAiLoading">
      <div class="ai-loading-content">
        <div class="ai-loading-spinner"></div>
        <div class="ai-loading-text">{{ aiLoadingMessage }}</div>
        <div class="ai-loading-progress">
          <div class="ai-progress-bar" :style="{width: `${aiLoadingProgress}%`}"></div>
        </div>
      </div>
    </div>
    
    <!-- AI推荐结果面板 -->
    <div class="ai-recommendations-panel" v-if="showRecommendations && !isAiLoading">
      <div class="panel-header">
        <h3>DeepSeek AI推荐可视化</h3>
        <button class="close-btn" @click="showRecommendations = false">×</button>
      </div>
      
      <div class="recommendations-list">
        <div class="recommendation-item" 
             v-for="(rec, index) in aiRecommendations" 
             :key="index"
             @click="applyAiRecommendation(rec)">
          <div class="rec-icon" :class="rec.type"></div>
          <div class="rec-content">
            <div class="rec-title">{{ rec.label }}</div>
            <div class="rec-description">{{ rec.description }}</div>
            <div class="rec-confidence">
              置信度: 
              <div class="confidence-bar">
                <div class="confidence-fill" :style="{width: `${rec.confidence * 100}%`}"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, watch, nextTick, PropType, computed } from 'vue';
import * as echarts from 'echarts';
import { useVisualizationStore, DataPoint, FilterCondition } from '../../store/visualization';
import { DeepSeekVisualizationService, VisualizationRecommendation } from '../../services/DeepSeekVisualizationService';

// 数据项接口
interface DataItem {
  [key: string]: any;
}

// 图表配置接口
interface ChartConfig {
  id: string;
  title: string;
  type: 'bar' | 'pie' | 'line' | 'scatter' | 'heatmap';
  dimension: string;
  metric: string;
  span?: number;
  colorField?: string;
  sortBy?: 'asc' | 'desc' | 'none';
  limit?: number;
  options?: any;
}

// 筛选条件接口
interface FilterCondition {
  id: string;
  dimension: string;
  operator: 'equals' | 'in' | 'range';
  value: any;
  displayValue: string;
  chartId: string;
}

// 图表数据类型接口
interface LineChartData {
  xAxisData: string[];
  seriesData: number[];
}

interface HeatmapData {
  xValues: any[];
  yValues: any[];
  data: any[];
}

export default defineComponent({
  name: 'InteractiveFilteringComponent',
  
  props: {
    // 组件标题
    title: {
      type: String,
      default: '数据联动筛选'
    },
    
    // 原始数据
    data: {
      type: Array as PropType<DataItem[]>,
      required: true
    },
    
    // 图表配置
    chartConfigs: {
      type: Array as PropType<ChartConfig[]>,
      required: true
    },
    
    // 是否支持多选
    multiSelect: {
      type: Boolean,
      default: true
    },
    
    // 是否默认显示全部数据
    showAllByDefault: {
      type: Boolean,
      default: true
    },
    
    // 新增deepSeekEnabled属性
    deepSeekEnabled: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['filter-change', 'apply-filter', 'chart-click', 'data-select', 'visualization-recommend'],
  
  setup(props, { emit }) {
    // 图表实例
    const chartInstances = ref<{ [key: string]: any }>({});
    
    // 筛选条件
    const filters = ref<FilterCondition[]>([]);
    
    // 筛选后的数据
    const filteredData = ref<DataItem[]>([]);
    
    // 是否显示帮助弹窗
    const showHelp = ref(false);
    
    // 总记录数
    const totalRecords = ref(0);
    
    // 计算活动的筛选条件
    const activeFilters = computed(() => filters.value);
    
    // 使用可视化状态存储
    const visualizationStore = useVisualizationStore();
    
    // AI推荐相关状态
    const aiRecommendations = ref<VisualizationRecommendation[]>([]);
    const isAiLoading = ref(false);
    const aiLoadingProgress = ref(0);
    const aiLoadingMessage = ref('');
    const showRecommendations = ref(false);
    
    // 初始化
    onMounted(async () => {
      totalRecords.value = props.data.length;
      
      // 首次筛选
      applyFilters();
      
      // 等待DOM更新
      await nextTick();
      
      // 初始化所有图表
      initCharts();
      
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize);
    });
    
    // 清理
    onBeforeUnmount(() => {
      // 销毁所有图表实例
      Object.values(chartInstances.value).forEach(chart => {
        chart.dispose();
      });
      
      // 移除事件监听
      window.removeEventListener('resize', handleResize);
    });
    
    // 监听数据变化
    watch(() => props.data, () => {
      totalRecords.value = props.data.length;
      resetAllFilters();
    }, { deep: true });
    
    // 初始化所有图表
    const initCharts = () => {
      props.chartConfigs.forEach((config, index) => {
        const chartContainer = document.querySelector(`#chart-${index} .chart-container`);
        if (!chartContainer) return;
        
        // 如果已经有实例，先销毁
        if (chartInstances.value[config.id]) {
          chartInstances.value[config.id].dispose();
        }
        
        // 创建新的图表实例
        const chart = echarts.init(chartContainer as HTMLElement);
        
        // 更新图表
        updateChart(chart, config, filteredData.value);
        
        // 注册点击事件
        chart.on('click', params => {
          handleChartEvent(params, config);
        });
        
        // 保存实例
        chartInstances.value[config.id] = chart;
      });
      
      // 注册可视化组件
      props.chartConfigs.forEach(chart => {
        visualizationStore.registerVisualization(chart.id);
      });
    };
    
    // 更新单个图表
    const updateChart = (chart: any, config: ChartConfig, data: DataItem[]) => {
      const { type, dimension, metric, colorField, sortBy, limit, options } = config;
      
      // 准备数据
      let chartData: any;
      
      switch (type) {
        case 'bar':
          chartData = prepareBarChartData(data, dimension, metric, sortBy, limit);
          break;
        case 'pie':
          chartData = preparePieChartData(data, dimension, metric, limit);
          break;
        case 'line':
          chartData = prepareLineChartData(data, dimension, metric, sortBy);
          break;
        case 'scatter':
          chartData = prepareScatterChartData(data, dimension, metric, colorField);
          break;
        case 'heatmap':
          chartData = prepareHeatmapData(data, dimension, metric);
          break;
      }
      
      // 设置图表选项
      const chartOptions = generateChartOptions(type, chartData, dimension, metric, colorField, options);
      
      // 应用选项
      chart.setOption(chartOptions, true);
    };
    
    // 准备柱状图数据
    const prepareBarChartData = (
      data: DataItem[],
      dimension: string,
      metric: string,
      sortBy: 'asc' | 'desc' | 'none' = 'desc',
      limit: number = 10
    ) => {
      // 按维度分组并计算指标
      const grouped = groupBy(data, dimension);
      
      // 转换为图表数据
      let result = Object.entries(grouped).map(([key, items]) => {
        const totalValue = items.reduce((sum, item) => sum + (Number(item[metric]) || 0), 0);
        return { name: key, value: totalValue };
      });
      
      // 排序
      if (sortBy === 'asc') {
        result.sort((a, b) => a.value - b.value);
      } else if (sortBy === 'desc') {
        result.sort((a, b) => b.value - a.value);
      }
      
      // 限制数量
      if (limit > 0 && result.length > limit) {
        result = result.slice(0, limit);
      }
      
      return result;
    };
    
    // 准备饼图数据
    const preparePieChartData = (
      data: DataItem[],
      dimension: string,
      metric: string,
      limit: number = 8
    ) => {
      // 按维度分组并计算指标
      const grouped = groupBy(data, dimension);
      
      // 转换为图表数据
      let result = Object.entries(grouped).map(([key, items]) => {
        const totalValue = items.reduce((sum, item) => sum + (Number(item[metric]) || 0), 0);
        return { name: key, value: totalValue };
      });
      
      // 排序
      result.sort((a, b) => b.value - a.value);
      
      // 如果超过限制，合并剩余部分
      if (limit > 0 && result.length > limit) {
        const topItems = result.slice(0, limit - 1);
        const otherItems = result.slice(limit - 1);
        const otherValue = otherItems.reduce((sum, item) => sum + item.value, 0);
        
        result = [
          ...topItems,
          { name: '其他', value: otherValue }
        ];
      }
      
      return result;
    };
    
    // 准备折线图数据
    const prepareLineChartData = (
      data: DataItem[],
      dimension: string,
      metric: string,
      sortBy: 'asc' | 'desc' | 'none' = 'asc'
    ): LineChartData => {
      // 按维度分组并计算指标
      const grouped = groupBy(data, dimension);
      
      // 获取所有维度值
      let dimensionValues = Object.keys(grouped);
      
      // 排序
      if (sortBy === 'asc') {
        dimensionValues.sort();
      } else if (sortBy === 'desc') {
        dimensionValues.sort().reverse();
      }
      
      // 转换为x轴和y轴数据
      const xAxisData = dimensionValues;
      const seriesData = dimensionValues.map(dim => {
        const items = grouped[dim];
        return items.reduce((sum, item) => sum + (Number(item[metric]) || 0), 0);
      });
      
      return { xAxisData, seriesData };
    };
    
    // 准备散点图数据
    const prepareScatterChartData = (
      data: DataItem[],
      xField: string,
      yField: string,
      colorField?: string
    ) => {
      return data.map(item => {
        const result: any[] = [item[xField], item[yField]];
        
        if (colorField) {
          result.push(item[colorField]);
        }
        
        return result;
      });
    };
    
    // 准备热力图数据
    const prepareHeatmapData = (
      data: DataItem[],
      xField: string,
      yField: string
    ): HeatmapData => {
      // 获取所有维度值
      const xValues = [...new Set(data.map(item => item[xField]))].sort();
      const yValues = [...new Set(data.map(item => item[yField]))].sort();
      
      // 创建数据映射
      const valueMap = new Map();
      data.forEach(item => {
        const key = `${item[xField]}-${item[yField]}`;
        const currentVal = valueMap.get(key) || 0;
        valueMap.set(key, currentVal + 1);
      });
      
      // 准备热力图数据
      const heatmapData = [];
      for (let i = 0; i < xValues.length; i++) {
        for (let j = 0; j < yValues.length; j++) {
          const key = `${xValues[i]}-${yValues[j]}`;
          const value = valueMap.get(key) || 0;
          
          if (value > 0) {
            heatmapData.push([i, j, value]);
          }
        }
      }
      
      return { xValues, yValues, data: heatmapData };
    };
    
    // 生成图表选项
    const generateChartOptions = (
      type: string,
      data: any,
      dimension: string,
      metric: string,
      colorField?: string,
      customOptions?: any
    ) => {
      let options: any = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}: {c}'
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        }
      };
      
      // 根据图表类型设置特定选项
      switch (type) {
        case 'bar':
          options = {
            ...options,
            xAxis: {
              type: 'category',
              data: data.map((item: any) => item.name),
              axisLabel: {
                interval: 0,
                rotate: data.length > 8 ? 45 : 0,
                formatter: (value: string) => {
                  return value.length > 10 ? value.substring(0, 10) + '...' : value;
                }
              }
            },
            yAxis: {
              type: 'value',
              name: metric
            },
            series: [{
              name: metric,
              type: 'bar',
              data: data.map((item: any) => item.value),
              itemStyle: {
                borderRadius: [4, 4, 0, 0]
              },
              emphasis: {
                focus: 'series',
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }]
          };
          break;
        
        case 'pie':
          options = {
            ...options,
            tooltip: {
              trigger: 'item',
              formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            series: [{
              name: metric,
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: true,
              label: {
                show: true,
                position: 'outer',
                formatter: '{b}: {d}%'
              },
              emphasis: {
                focus: 'series',
                label: {
                  show: true,
                  fontSize: '12',
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: true
              },
              data: data
            }]
          };
          break;
        
        case 'line':
          options = {
            ...options,
            xAxis: {
              type: 'category',
              data: data.xAxisData,
              axisLabel: {
                interval: 0,
                rotate: data.xAxisData.length > 8 ? 45 : 0
              }
            },
            yAxis: {
              type: 'value',
              name: metric
            },
            series: [{
              name: metric,
              type: 'line',
              data: data.seriesData,
              smooth: true,
              symbol: 'circle',
              symbolSize: 6,
              emphasis: {
                focus: 'series',
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }]
          };
          break;
        
        case 'scatter':
          options = {
            ...options,
            xAxis: {
              type: 'value',
              name: dimension
            },
            yAxis: {
              type: 'value',
              name: metric
            },
            series: [{
              name: `${dimension} vs ${metric}`,
              type: 'scatter',
              data: data,
              symbolSize: 10,
              emphasis: {
                focus: 'self',
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }]
          };
          
          // 如果有颜色字段，添加视觉映射
          if (colorField) {
            options.visualMap = {
              show: false,
              dimension: 2,
              min: Math.min(...data.map((item: any) => item[2])),
              max: Math.max(...data.map((item: any) => item[2])),
              inRange: {
                color: ['#5470c6', '#91cc75', '#fac858', '#ee6666']
              }
            };
          }
          break;
        
        case 'heatmap':
          options = {
            ...options,
            tooltip: {
              position: 'top',
              formatter: (params: any) => {
                const xValue = data.xValues[params.data[0]];
                const yValue = data.yValues[params.data[1]];
                return `${xValue} / ${yValue}: ${params.data[2]}`;
              }
            },
            grid: {
              top: '10%',
              left: '3%',
              right: '10%',
              bottom: '15%',
              containLabel: true
            },
            xAxis: {
              type: 'category',
              data: data.xValues,
              axisLabel: {
                interval: 0,
                rotate: data.xValues.length > 8 ? 45 : 0
              }
            },
            yAxis: {
              type: 'category',
              data: data.yValues
            },
            visualMap: {
              min: 0,
              max: Math.max(...data.data.map((item: any[]) => item[2])),
              calculable: true,
              orient: 'horizontal',
              left: 'center',
              bottom: '0%',
              inRange: {
                color: ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
              }
            },
            series: [{
              name: `${dimension} x ${metric} 热力图`,
              type: 'heatmap',
              data: data.data,
              label: {
                show: false
              },
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
              }
            }]
          };
          break;
      }
      
      // 合并自定义选项
      if (customOptions) {
        options = deepMerge(options, customOptions);
      }
      
      return options;
    };
    
    // 处理图表事件
    const handleChartEvent = (params: any, config: ChartConfig) => {
      const { type, dimension, metric } = config;
      let filterValue: any;
      let displayValue: string;
      
      // 根据图表类型提取筛选值
      switch (type) {
        case 'bar':
        case 'pie':
          filterValue = params.name;
          displayValue = params.name;
          break;
        
        case 'line':
          filterValue = params.name;
          displayValue = params.name;
          break;
        
        case 'scatter':
          const xVal = params.data[0];
          const yVal = params.data[1];
          filterValue = [xVal, yVal];
          displayValue = `${xVal}, ${yVal}`;
          break;
        
        case 'heatmap':
          const xValue = params.data[0];
          const yValue = params.data[1];
          filterValue = { x: xValue, y: yValue };
          displayValue = `${xValue}, ${yValue}`;
          break;
      }
      
      // 检查是否已有相同的筛选条件
      const existingFilterIndex = filters.value.findIndex(
        f => f.dimension === dimension && f.value === filterValue && f.chartId === config.id
      );
      
      // 如果已存在，则移除(取消筛选)
      if (existingFilterIndex !== -1) {
        filters.value.splice(existingFilterIndex, 1);
      } else {
        // 如果不允许多选，移除同一维度的所有筛选
        if (!props.multiSelect) {
          const sameDimensionFilters = filters.value.filter(f => f.dimension === dimension);
          sameDimensionFilters.forEach(filter => {
            const idx = filters.value.indexOf(filter);
            if (idx !== -1) {
              filters.value.splice(idx, 1);
            }
          });
        }
        
        // 添加新的筛选条件
        filters.value.push({
          id: `filter-${Date.now()}`,
          dimension,
          operator: 'equals',
          value: filterValue,
          displayValue,
          chartId: config.id
        });
      }
      
      // 应用筛选
      applyFilters();
      
      // 触发事件
      emit('chart-click', { chartId: config.id, dimension, value: filterValue });
    };
    
    // 应用筛选条件
    const applyFilters = () => {
      const { data } = props;
      
      // 如果没有筛选条件，显示所有数据
      if (filters.value.length === 0) {
        filteredData.value = props.showAllByDefault ? [...data] : [];
      } else {
        // 按维度分组筛选条件
        const filtersByDimension = groupBy(filters.value, 'dimension');
        
        // 筛选数据
        filteredData.value = data.filter(item => {
          // 对每个维度应用筛选条件
          return Object.entries(filtersByDimension).every(([dimension, dimensionFilters]) => {
            // 同一维度内使用OR逻辑
            return dimensionFilters.some(filter => {
              const { operator, value } = filter;
              
              if (operator === 'equals') {
                return item[dimension] === value;
              } else if (operator === 'in') {
                return value.includes(item[dimension]);
              } else if (operator === 'range') {
                return item[dimension] >= value[0] && item[dimension] <= value[1];
              }
              
              return false;
            });
          });
        });
      }
      
      // 更新所有图表
      updateAllCharts();
      
      // 触发过滤变更事件
      emit('filter-change', {
        filters: filters.value,
        filteredData: filteredData.value
      });
    };
    
    // 更新所有图表
    const updateAllCharts = () => {
      props.chartConfigs.forEach(config => {
        const chart = chartInstances.value[config.id];
        if (chart) {
          updateChart(chart, config, filteredData.value);
        }
      });
    };
    
    // 移除筛选条件
    const removeFilter = (filterId: string) => {
      const index = filters.value.findIndex(f => f.id === filterId);
      if (index !== -1) {
        filters.value.splice(index, 1);
        applyFilters();
      }
    };
    
    // 重置所有筛选条件
    const resetAllFilters = () => {
      filters.value = [];
      applyFilters();
    };
    
    // 导出筛选后的数据
    const exportFilteredData = () => {
      if (filteredData.value.length === 0) {
        // 提示没有数据
        alert('没有符合条件的数据可以导出');
        return;
      }
      
      // 提取列名
      const columns = Object.keys(filteredData.value[0]);
      
      // 创建CSV内容
      let csvContent = columns.join(',') + '\n';
      
      filteredData.value.forEach(item => {
        const row = columns.map(col => {
          // 处理包含逗号的字段
          const val = item[col];
          if (typeof val === 'string' && val.includes(',')) {
            return `"${val}"`;
          }
          return val;
        }).join(',');
        
        csvContent += row + '\n';
      });
      
      // 创建Blob
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      // 创建下载链接
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `filtered_data_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      
      // 触发下载
      link.click();
      
      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
    
    // 应用筛选结果到父组件
    const emitFilteredData = () => {
      emit('apply-filter', {
        filters: filters.value,
        filteredData: filteredData.value
      });
    };
    
    // 检查图表是否被筛选
    const isChartFiltered = (chartId: string) => {
      return filters.value.some(f => f.chartId === chartId);
    };
    
    // 处理窗口大小变化
    const handleResize = () => {
      Object.values(chartInstances.value).forEach(chart => {
        chart.resize();
      });
    };
    
    // 处理图表点击
    const handleChartClick = (event: Event, chart: ChartConfig) => {
      // 这里只处理图表容器的点击，具体的数据点点击事件在init时已经注册
    };
    
    // 辅助函数：按键分组
    const groupBy = <T>(array: T[], key: keyof T | string): Record<string, T[]> => {
      return array.reduce((result: Record<string, T[]>, item: T) => {
        const keyValue = String(item[key as keyof T]);
        if (!result[keyValue]) {
          result[keyValue] = [];
        }
        result[keyValue].push(item);
        return result;
      }, {});
    };
    
    // 辅助函数：深度合并对象
    const deepMerge = (target: any, source: any) => {
      const result = { ...target };
      
      for (const key in source) {
        if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
          result[key] = deepMerge(target[key], source[key]);
        } else {
          result[key] = source[key];
        }
      }
      
      return result;
    };
    
    // 处理筛选条件变化
    const handleFilterChange = (filterId: string, newValue: any) => {
      // ... 保留原有代码 ...
      
      // 同步到状态管理
      const condition: FilterCondition = {
        id: `filter-${Date.now()}`,
        field: filter.dimension,
        operator: filter.operator === 'equals' ? 'equal' : 
                  filter.operator === 'in' ? 'contains' : 'between',
        value: newValue
      };
      
      visualizationStore.addFilter(condition);
      
      // 更新所有图表
      updateAllCharts();
      
      // 发送事件
      emit('filter-change', activeFilters.value);
    };
    
    // 清除所有筛选条件
    const clearAllFilters = () => {
      // ... 保留原有代码 ...
      
      // 从状态管理中清除
      visualizationStore.clearFilters();
      
      // 更新所有图表
      updateAllCharts();
      
      // 发送事件
      emit('filter-change', []);
    };
    
    // 监听外部筛选条件变化
    watch(() => visualizationStore.filterConditions, (newFilters) => {
      // 只处理从其他组件添加的筛选条件
      const externalFilters = newFilters.filter(filter => 
        !activeFilters.value.some(af => af.dimension === filter.field)
      );
      
      if (externalFilters.length > 0) {
        // 将外部筛选条件转换为组件内部格式
        externalFilters.forEach(extFilter => {
          const matchingChartConfig = props.chartConfigs.find(chart => 
            chart.dimension === extFilter.field
          );
          
          if (matchingChartConfig) {
            // 添加到内部筛选条件
            activeFilters.value.push({
              id: extFilter.id,
              dimension: extFilter.field,
              operator: extFilter.operator === 'equal' ? 'equals' : 
                        extFilter.operator === 'contains' ? 'in' : 'range',
              value: extFilter.value,
              displayValue: String(extFilter.value),
              chartId: matchingChartConfig.id
            });
          }
        });
        
        // 更新所有图表
        updateAllCharts();
      }
    }, { deep: true });
    
    // 监听外部选中数据点变化
    watch(() => visualizationStore.selectedDataPoints, (newPoints) => {
      if (newPoints.length > 0) {
        // 处理外部选中的数据点，高亮相关图表元素
        newPoints.forEach(point => {
          highlightDataPointInCharts(point);
        });
      }
    }, { deep: true });
    
    // 在图表中高亮数据点
    const highlightDataPointInCharts = (point: DataPoint) => {
      chartInstances.forEach((instance, chartId) => {
        if (!instance) return;
        
        const chart = props.chartConfigs.find(c => c.id === chartId);
        if (!chart) return;
        
        // 根据图表类型处理高亮
        switch (chart.type) {
          case 'bar':
            // 找到对应的系列和数据索引
            const barIndex = filteredData.value.findIndex(item => 
              JSON.stringify(item) === JSON.stringify(point)
            );
            
            if (barIndex !== -1) {
              instance.dispatchAction({
                type: 'highlight',
                seriesIndex: 0,
                dataIndex: barIndex
              });
            }
            break;
            
          case 'pie':
            // 在饼图中查找匹配的数据项
            const pieData = instance.getOption().series[0].data;
            const pieIndex = pieData.findIndex((item: any) => 
              item.name === point[chart.dimension]
            );
            
            if (pieIndex !== -1) {
              instance.dispatchAction({
                type: 'highlight',
                seriesIndex: 0,
                dataIndex: pieIndex
              });
            }
            break;
            
          // ... 其他图表类型的高亮处理 ...
        }
      });
    };
    
    // 请求AI可视化推荐
    const requestAiVisualizationRecommend = async () => {
      if (!props.deepSeekEnabled) return;
      
      isAiLoading.value = true;
      aiLoadingProgress.value = 0;
      aiLoadingMessage.value = '准备数据分析...';
      
      try {
        // 收集用户行为数据
        const userBehavior = {
          filters: activeFilters.value,
          selectedData: visualizationStore.selectedDataPoints,
          viewedCharts: props.chartConfigs.map(c => c.id),
          goal: '探索数据关系'
        };
        
        // 调用DeepSeek可视化推荐服务
        aiRecommendations.value = await DeepSeekVisualizationService.recommendVisualization(
          filteredData.value,
          userBehavior,
          (progress, message) => {
            aiLoadingProgress.value = progress;
            if (message) aiLoadingMessage.value = message;
          }
        );
        
        // 显示推荐结果
        showRecommendations.value = true;
        
        // 发送推荐事件
        emit('visualization-recommend', aiRecommendations.value);
        
      } catch (error) {
        console.error('AI可视化推荐失败:', error);
      } finally {
        isAiLoading.value = false;
      }
    };
    
    // 应用AI推荐
    const applyAiRecommendation = (recommendation: VisualizationRecommendation) => {
      // 发送推荐应用事件
      emit('visualization-recommend', [recommendation]);
      
      // 关闭推荐面板
      showRecommendations.value = false;
    };
    
    return {
      chartInstances,
      filters,
      filteredData,
      activeFilters,
      showHelp,
      totalRecords,
      removeFilter,
      resetAllFilters,
      exportFilteredData,
      emitFilteredData,
      isChartFiltered,
      handleChartClick,
      aiRecommendations,
      isAiLoading,
      aiLoadingProgress,
      aiLoadingMessage,
      showRecommendations,
      requestAiVisualizationRecommend,
      applyAiRecommendation
    };
  }
});
</script>

<style scoped>
.interactive-filtering-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.filtering-header {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.component-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.controls {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.filtering-body {
  padding: 16px;
  flex: 1;
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
  background-color: #f5f7fa;
  padding: 8px 12px;
  border-radius: 4px;
}

.active-filters-label {
  margin-right: 8px;
  font-size: 14px;
  color: #606266;
}

.filter-tag {
  margin-right: 8px;
  margin-bottom: 4px;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.clear-filters-btn {
  background: none;
  border: none;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
}

.ai-recommend-btn {
  background: linear-gradient(135deg, #6e8efb, #a777e3);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  transition: all 0.3s;
}

.ai-recommend-btn:hover {
  background: linear-gradient(135deg, #5d7be8, #9666d8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.charts-container {
  margin-bottom: 16px;
}

.chart-wrapper {
  height: 300px;
  margin-bottom: 20px;
  padding: 12px;
  border-radius: 4px;
  background-color: #f5f7fa;
  transition: all 0.3s ease;
  position: relative;
}

.chart-wrapper.is-filtered {
  box-shadow: 0 0 0 2px #409eff;
}

.chart-wrapper:hover {
  background-color: #eef5fe;
  cursor: pointer;
}

.chart-title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  height: calc(100% - 50px);
  width: 100%;
}

.chart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #909399;
  padding-top: 8px;
}

.filtering-summary {
  background-color: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  margin-top: 16px;
}

.summary-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-counts {
  display: flex;
  gap: 24px;
}

.summary-stat {
  text-align: center;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.help-content {
  line-height: 1.6;
}

.help-content h4 {
  margin-top: 16px;
  margin-bottom: 8px;
  font-size: 16px;
  color: #303133;
}

.help-content p, .help-content li {
  font-size: 14px;
  color: #606266;
}

/* AI推荐相关样式 */
.ai-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.ai-loading-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.ai-loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 2s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.ai-loading-text {
  margin-bottom: 16px;
  font-size: 16px;
}

.ai-loading-progress {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.ai-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #9b59b6);
  transition: width 0.3s;
}

.ai-recommendations-panel {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 1000;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
}

.panel-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.recommendations-list {
  padding: 16px;
}

.recommendation-item {
  display: flex;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  background: #f9f9f9;
  cursor: pointer;
  transition: all 0.2s;
}

.recommendation-item:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.rec-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #ddd;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.rec-icon.scatter3D {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
}

.rec-icon.bar3D {
  background: linear-gradient(135deg, #fa709a, #fee140);
}

.rec-icon.heatmapSurface {
  background: linear-gradient(135deg, #ff0844, #ffb199);
}

.rec-icon.geoMap3D {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
}

.rec-icon.timeSeries3D {
  background: linear-gradient(135deg, #6a11cb, #2575fc);
}

.rec-content {
  flex: 1;
}

.rec-title {
  font-weight: bold;
  margin-bottom: 4px;
  font-size: 16px;
}

.rec-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.rec-confidence {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.confidence-bar {
  width: 100px;
  height: 6px;
  background: #eee;
  border-radius: 3px;
  margin-left: 8px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, #4facfe, #00f2fe);
}

/* 移动设备适配 */
@media (max-width: 768px) {
  .chart-container {
    grid-template-columns: 1fr;
  }
  
  [data-span="2"] {
    grid-column: auto;
  }
  
  .filter-pill {
    max-width: 150px;
  }
  
  .ai-recommendations-panel {
    width: 95%;
    max-height: 90vh;
  }
  
  .recommendation-item {
    flex-direction: column;
  }
  
  .rec-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }
}
</style> 