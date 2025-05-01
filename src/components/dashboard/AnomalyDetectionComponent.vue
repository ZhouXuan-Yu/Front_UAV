/**
 * 文件名: AnomalyDetectionComponent.vue
 * 描述: 无人机人员检测异常分析组件
 * 在项目中的作用: 
 * - 提供无人机检测区域内人员数量异常监测功能
 * - 集成DeepSeek API进行智能异常分析
 * - 可视化展示人员数量异常数据和趋势
 * - 支持多种区域和检测模式
 */

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import * as echarts from 'echarts';
import { ElMessage, ElLoading } from 'element-plus';
import { ArrowLeft, RefreshRight, Download, Setting, Histogram } from '@element-plus/icons-vue';
import AnomalyDetectionService from '@/services/AnomalyDetectionService';
import DeepSeekService from '@/services/DeepSeekService';
// 导入Markdown渲染器组件
import MarkdownRenderer from '@/components/common/MarkdownRenderer.vue';

// 定义组件属性
const props = defineProps({
  // 数据类型: area1, area2, area3, area4, area5 (不同监测区域)
  dataType: {
    type: String,
    default: 'area1'
  },
  // 时间范围
  timeRange: {
    type: Array as () => Date[],
    default: () => [new Date(new Date().setDate(new Date().getDate() - 7)), new Date()]
  }
});

// 定义组件事件
const emit = defineEmits(['back', 'export-data', 'analyze-anomaly']);

// 状态管理
const loading = ref(false);
const analyzing = ref(false);
const analysisResult = ref('');
const showSettings = ref(false);

// 图表实例
let timeSeriesChart: any = null;
let distributionChart: any = null;

// 异常检测设置
const detectionSettings = reactive({
  threshold: 2.5,
  enableLocalDetection: true,
  enableCloudDetection: true,
  sensitivity: 'medium', // low, medium, high
  analysisDepth: 'standard', // basic, standard, deep
});

// 区域名称映射
const areaNameMap = {
  'area1': '中央广场',
  'area2': '东部停车场',
  'area3': '西部商业区',
  'area4': '南部居民区',
  'area5': '北部工业区'
};

// 异常列表数据
const anomalies = ref<any[]>([]);

// 模拟时间序列数据
const generateTimeSeriesData = () => {
  const days = 30;
  const result = [];
  
  // 基础值和趋势设置 - 不同区域人员密度基准不同
  let baseValue = 0;
  let trend = 0;
  
  switch (props.dataType) {
    case 'area1':
      baseValue = 120; // 中央广场基础人数多
      trend = 0.5;
      break;
    case 'area2':
      baseValue = 80; // 停车场
      trend = 0.3;
      break;
    case 'area3':
      baseValue = 150; // 商业区人员最多
      trend = 0.8;
      break;
    case 'area4':
      baseValue = 60; // 居民区
      trend = 0.2;
      break;
    case 'area5':
      baseValue = 40; // 工业区人员最少
      trend = -0.1;
      break;
    default:
      baseValue = 100;
      trend = 0;
  }
  
  // 生成时间序列
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    
    // 添加时间相关的波动模式
    const dayOfWeek = date.getDay(); // 0-6，表示周日到周六
    let dayFactor = 1.0;
    
    // 周末人数增加
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      if (props.dataType === 'area1' || props.dataType === 'area3') {
        dayFactor = 1.5; // 周末商业区和广场人多
      } else if (props.dataType === 'area2') {
        dayFactor = 1.3; // 停车场周末也多
      } else if (props.dataType === 'area5') {
        dayFactor = 0.6; // 工业区周末人少
      }
    }
    
    // 工作日模式
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      if (props.dataType === 'area5') {
        dayFactor = 1.2; // 工作日工业区人多
      }
    }
    
    // 添加趋势、周期性变化和随机波动
    const trendComponent = baseValue + trend * i;
    const periodicComponent = Math.sin(i / 5) * 15; // 周期性波动
    const randomComponent = (Math.random() - 0.5) * 25; // 随机波动
    
    // 添加一些异常点
    let anomalyComponent = 0;
    if (i === 7 || i === 21) {
      // 异常可能是突然增加也可能是突然减少
      anomalyComponent = (Math.random() > 0.5) ? 80 : -40;
    }
    
    const value = Math.max(0, (trendComponent + periodicComponent + randomComponent + anomalyComponent) * dayFactor);
    
    result.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value),
      isRawAnomaly: (i === 7 || i === 21) // 预先标记的异常点
    });
  }
  
  return result;
};

// 生成时间序列数据
const timeSeriesData = ref(generateTimeSeriesData());

// 本地异常检测
const detectAnomalies = () => {
  loading.value = true;
  
  setTimeout(() => {
    // 使用服务进行本地异常检测
    const detectedData = AnomalyDetectionService.detectAnomaliesLocally(
      timeSeriesData.value,
      'value',
      detectionSettings.threshold
    );
    
    // 更新数据
    timeSeriesData.value = detectedData;
    
    // 提取异常数据到列表
    anomalies.value = detectedData
      .filter(item => item.isAnomaly)
      .map(item => {
        const areaName = areaNameMap[props.dataType] || '未知区域';
        const isIncrease = item.value > (item.expectedValue || 0);
        
        return {
          id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          date: item.date,
          value: item.value,
          expectedValue: Math.round(item.expectedValue || (item.value - item.deviation * 10)),
          deviation: item.deviation.toFixed(2),
          severity: getSeverity(item.deviation),
          category: props.dataType,
          areaName: areaName,
          details: `检测到${areaName}人员${isIncrease ? '异常增加' : '异常减少'}至 ${item.value} 人`
        };
      });
    
    // 更新图表
    updateTimeSeriesChart();
    
    loading.value = false;
    
    if (anomalies.value.length === 0) {
      ElMessage({
        message: '未检测到显著异常',
        type: 'info'
      });
    } else {
      ElMessage({
        message: `检测到 ${anomalies.value.length} 个人员数量异常点`,
        type: 'warning'
      });
    }
  }, 1000);
};

// 使用DeepSeek进行高级异常分析
const analyzeWithDeepSeek = async () => {
  if (anomalies.value.length === 0) {
    ElMessage({
      message: '没有检测到异常数据，无法进行分析',
      type: 'warning'
    });
    return;
  }
  
  analyzing.value = true;
  analysisResult.value = '';
  
  // 创建loading实例
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在进行智能分析...',
    background: 'rgba(0, 0, 0, 0.7)'
  });
  
  try {
    // 构建分析提示
    const areaName = areaNameMap[props.dataType] || '未知区域';
    const prompt = `
      作为无人机人员监测系统的智能分析师，请分析以下区域人员数量异常数据:
      
      监测区域: ${areaName}
      时间范围: ${(props.timeRange[0] as Date).toLocaleDateString()} 至 ${(props.timeRange[1] as Date).toLocaleDateString()}
      异常事件数量: ${anomalies.value.length}
      
      异常数据详情:
      ${anomalies.value.map(a => `- 日期: ${a.date}, 实际人数: ${a.value}人, 预期人数: ${a.expectedValue}人, 偏差系数: ${a.deviation}, 风险等级: ${a.severity === 'high' ? '高' : a.severity === 'medium' ? '中' : '低'}`).join('\n')}
      
      请提供:
      1. 这些人员数量异常波动的可能原因分析（考虑节假日、特殊活动、天气、突发事件等因素）
      2. 这些异常人员聚集/减少可能带来的安全风险和影响评估
      3. 针对不同类型异常的应急响应建议（包括额外无人机部署、安保人员调度等）
      4. 如何优化无人机巡航路径和监测频率以提高异常捕获率
      5. 如何利用人员流动数据进行区域规划和管理建议
      
      请根据区域特性（${areaName}是一个${props.dataType === 'area1' ? '中央广场' : props.dataType === 'area2' ? '停车场' : props.dataType === 'area3' ? '商业区' : props.dataType === 'area4' ? '居民区' : '工业区'}）来进行针对性分析。
    `;
    
    // 调用DeepSeek API
    const result = await DeepSeekService.getAnalysisWithProgress(
      prompt,
      undefined, // 使用默认模型
      (progress, message) => {
        loadingInstance.setText(`${message || '分析中...'} (${progress}%)`);
      }
    );
    
    // 更新分析结果
    analysisResult.value = result;
    
    // 关闭loading
    loadingInstance.close();
    analyzing.value = false;
    
    // 发出分析完成事件
    emit('analyze-anomaly', {
      type: props.dataType,
      areaName: areaName,
      anomalies: anomalies.value,
      analysis: result
    });
    
  } catch (error) {
    console.error('DeepSeek API调用失败:', error);
    
    // 关闭loading
    loadingInstance.close();
    analyzing.value = false;
    
    ElMessage({
      message: '智能分析服务暂时不可用，请稍后再试',
      type: 'error'
    });
  }
};

// 根据偏差确定严重程度
const getSeverity = (deviation: number): 'low' | 'medium' | 'high' => {
  if (deviation > 4) return 'high';
  if (deviation > 3) return 'medium';
  return 'low';
};

// 初始化时间序列图表
const initTimeSeriesChart = () => {
  const chartDom = document.getElementById('anomaly-timeseries-chart');
  if (!chartDom) return;
  
  timeSeriesChart = echarts.init(chartDom);
  updateTimeSeriesChart();
};

// 更新时间序列图表
const updateTimeSeriesChart = () => {
  if (!timeSeriesChart) return;
  
  const areaName = areaNameMap[props.dataType] || '未知区域';
  
  const option = {
    title: {
      text: `${areaName}人员数量监测`,
      left: 'center',
      top: 0,
      textStyle: {
        color: '#e3f2fd',
        fontSize: 16
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        const dataPoint = timeSeriesData.value[params[0].dataIndex];
        let tooltipText = `日期: ${dataPoint.date}<br/>`;
        tooltipText += `人数: ${dataPoint.value}人<br/>`;
        if (dataPoint.isAnomaly) {
          tooltipText += `<span style="color:#F56C6C">⚠️ 异常波动 (偏差: ${dataPoint.deviation.toFixed(2)})</span><br/>`;
          tooltipText += `预期人数: ${Math.round(dataPoint.expectedValue || 0)}人`;
        }
        return tooltipText;
      },
      backgroundColor: 'rgba(19, 47, 76, 0.9)',
      borderColor: '#4fc3f7',
      borderWidth: 1,
      textStyle: { color: '#fff' }
    },
    grid: {
      top: '50',
      left: '3%',
      right: '4%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: timeSeriesData.value.map(item => item.date),
      axisLabel: {
        color: '#90caf9',
        formatter: (value: string) => {
          // 显示短日期格式
          return value.split('-').slice(1).join('/');
        }
      },
      axisLine: {
        lineStyle: { color: '#1e3a5f' }
      }
    },
    yAxis: {
      type: 'value',
      name: '人数',
      nameTextStyle: {
        color: '#90caf9'
      },
      axisLabel: { color: '#90caf9' },
      splitLine: {
        lineStyle: { color: '#1e3a5f', type: 'dashed' }
      }
    },
    series: [
      {
        name: '人员数量',
        type: 'line',
        smooth: true,
        data: timeSeriesData.value.map((item, index) => {
          return {
            value: item.value,
            itemStyle: item.isAnomaly ? {
              color: '#F56C6C',
              borderColor: '#F56C6C',
              borderWidth: 4,
              borderType: 'solid',
              shadowBlur: 10,
              shadowColor: 'rgba(245, 108, 108, 0.5)'
            } : null
          };
        }),
        markPoint: {
          symbol: 'pin',
          symbolSize: 60,
          itemStyle: {
            color: '#F56C6C'
          },
          data: timeSeriesData.value.filter(item => item.isAnomaly).map(item => {
            const index = timeSeriesData.value.findIndex(d => d.date === item.date);
            return {
              name: '异常点',
              value: '异常',
              xAxis: index,
              yAxis: item.value
            };
          })
        },
        lineStyle: {
          width: 3,
          color: '#409EFF'
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64,158,255,0.2)' },
              { offset: 1, color: 'rgba(64,158,255,0)' }
            ]
          }
        }
      }
    ]
  };
  
  timeSeriesChart.setOption(option);
};

// 导出异常数据
const exportAnomalyData = () => {
  if (anomalies.value.length === 0) {
    ElMessage({
      message: '没有检测到异常数据，无法导出',
      type: 'warning'
    });
    return;
  }
  
  const jsonData = JSON.stringify(anomalies.value, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `无人机监测_${areaNameMap[props.dataType]}_异常数据_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  ElMessage({
    message: '异常数据导出成功',
    type: 'success'
  });
  
  emit('export-data', anomalies.value);
};

// 更新检测设置
const updateDetectionSettings = () => {
  // 应用新设置
  AnomalyDetectionService.configure({
    threshold: detectionSettings.threshold,
    enableLocalDetection: detectionSettings.enableLocalDetection,
    enableCloudDetection: detectionSettings.enableCloudDetection
  });
  
  showSettings.value = false;
  
  // 重新检测异常
  detectAnomalies();
  
  ElMessage({
    message: '异常检测设置已更新',
    type: 'success'
  });
};

// 返回上一级
const goBack = () => {
  emit('back');
};

// 组件挂载时初始化
onMounted(() => {
  // 初始化图表
  initTimeSeriesChart();
  
  // 加载异常检测配置
  const config = AnomalyDetectionService.getConfig();
  detectionSettings.threshold = config.threshold;
  detectionSettings.enableLocalDetection = config.enableLocalDetection;
  detectionSettings.enableCloudDetection = config.enableCloudDetection;
  
  // 初始检测
  detectAnomalies();
});

// 监听数据类型变化
watch(() => props.dataType, () => {
  // 重新生成数据
  timeSeriesData.value = generateTimeSeriesData();
  anomalies.value = [];
  analysisResult.value = '';
  
  // 重新检测
  detectAnomalies();
});
</script>

<template>
  <div class="anomaly-detection-component">
    <!-- 页头 -->
    <div class="component-header">
      <div class="header-left">
        <el-button size="small" plain @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
        <h2>无人机{{ areaNameMap[props.dataType] || '区域' }}人员监测</h2>
      </div>
      <div class="header-actions">
        <el-button-group>
          <el-button size="small" @click="detectAnomalies">
            <el-icon><RefreshRight /></el-icon>
            重新检测
          </el-button>
          <el-button size="small" @click="showSettings = true">
            <el-icon><Setting /></el-icon>
            检测设置
          </el-button>
          <el-button size="small" @click="exportAnomalyData" :disabled="anomalies.length === 0">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </el-button-group>
      </div>
    </div>
    
    <!-- 时间序列图表 -->
    <div class="chart-section">
      <h3>{{ areaNameMap[props.dataType] || '区域' }}人员数量监测</h3>
      <div id="anomaly-timeseries-chart" class="chart-container"></div>
      <div v-if="loading" class="chart-loading">加载中...</div>
    </div>
    
    <!-- 异常列表 -->
    <div class="anomalies-section">
      <div class="section-header">
        <h3>检测到的人员异常 ({{ anomalies.length }})</h3>
        <el-button 
          v-if="anomalies.length > 0" 
          size="small" 
          type="primary" 
          @click="analyzeWithDeepSeek"
          :loading="analyzing"
        >
          <el-icon><Histogram /></el-icon>
          智能分析
        </el-button>
      </div>
      
      <div v-if="anomalies.length === 0" class="empty-state">
        <p>未检测到人员数量异常</p>
      </div>
      
      <div v-else class="anomaly-list">
        <div 
          v-for="anomaly in anomalies" 
          :key="anomaly.id"
          class="anomaly-item"
          :class="{ 
            'severity-low': anomaly.severity === 'low',
            'severity-medium': anomaly.severity === 'medium',
            'severity-high': anomaly.severity === 'high'
          }"
        >
          <div class="anomaly-header">
            <span class="anomaly-date">{{ anomaly.date }}</span>
            <span class="anomaly-severity">
              {{ anomaly.severity === 'high' ? '高风险' : 
                 anomaly.severity === 'medium' ? '中风险' : '低风险' }}
            </span>
          </div>
          <div class="anomaly-content">
            <div class="anomaly-values">
              <div class="value-group">
                <span class="value-label">实际人数</span>
                <span class="value-number">{{ anomaly.value }}</span>
              </div>
              <div class="value-group">
                <span class="value-label">预期人数</span>
                <span class="value-number">{{ anomaly.expectedValue }}</span>
              </div>
              <div class="value-group">
                <span class="value-label">偏差</span>
                <span class="value-number">{{ anomaly.deviation }}</span>
              </div>
            </div>
            <div class="anomaly-details">
              {{ anomaly.details }}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分析结果显示部分 -->
    <div v-if="analysisResult" class="analysis-result">
      <h3>DeepSeek 智能异常分析</h3>
      
      <!-- 替换为使用Markdown渲染器 -->
      <div class="markdown-container">
        <MarkdownRenderer :content="analysisResult" />
      </div>
    </div>
    
    <!-- 设置对话框 -->
    <el-dialog
      v-model="showSettings"
      title="人员异常检测设置"
      width="500px"
      append-to-body
    >
      <div class="settings-content">
        <div class="settings-group">
          <span class="settings-label">检测阈值</span>
          <div class="settings-control">
            <el-slider 
              v-model="detectionSettings.threshold" 
              :min="1" 
              :max="5" 
              :step="0.1" 
              :marks="{
                1: '敏感',
                3: '标准',
                5: '宽松'
              }"
            />
          </div>
          <div class="settings-help">
            阈值越低，检测的异常点越多；阈值越高，只有显著人员波动才会被视为异常
          </div>
        </div>
        
        <div class="settings-group">
          <span class="settings-label">检测模式</span>
          <div class="settings-control">
            <el-checkbox v-model="detectionSettings.enableLocalDetection">本地检测</el-checkbox>
            <el-checkbox v-model="detectionSettings.enableCloudDetection">云端检测</el-checkbox>
          </div>
        </div>
        
        <div class="settings-group">
          <span class="settings-label">分析深度</span>
          <div class="settings-control">
            <el-radio-group v-model="detectionSettings.analysisDepth">
              <el-radio label="basic">基础</el-radio>
              <el-radio label="standard">标准</el-radio>
              <el-radio label="deep">深入</el-radio>
            </el-radio-group>
          </div>
        </div>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showSettings = false">取消</el-button>
          <el-button type="primary" @click="updateDetectionSettings">应用</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.anomaly-detection-component {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.component-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-left h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: #e3f2fd;
}

.chart-section {
  position: relative;
  background-color: #132f4c;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.chart-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 500;
  color: #e3f2fd;
}

.chart-container {
  height: 300px;
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
  background-color: rgba(19, 47, 76, 0.7);
  color: #90caf9;
  border-radius: 8px;
  z-index: 10;
}

.anomalies-section, .analysis-section {
  background-color: #132f4c;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #e3f2fd;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
  color: #90caf9;
  font-size: 14px;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.anomaly-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 10px;
}

.anomaly-item {
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  padding: 12px;
  border-left: 4px solid #67C23A;
}

.anomaly-item.severity-medium {
  border-left-color: #E6A23C;
}

.anomaly-item.severity-high {
  border-left-color: #F56C6C;
}

.anomaly-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.anomaly-date {
  color: #90caf9;
}

.anomaly-severity {
  font-weight: 500;
}

.severity-low .anomaly-severity {
  color: #67C23A;
}

.severity-medium .anomaly-severity {
  color: #E6A23C;
}

.severity-high .anomaly-severity {
  color: #F56C6C;
}

.anomaly-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.anomaly-values {
  display: flex;
  justify-content: space-between;
}

.value-group {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.value-label {
  font-size: 12px;
  color: #90caf9;
}

.value-number {
  font-size: 16px;
  font-weight: 500;
  color: #e3f2fd;
}

.anomaly-details {
  font-size: 13px;
  color: #90caf9;
  line-height: 1.4;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.analysis-section h3 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 500;
  color: #e3f2fd;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.analysis-content {
  max-height: 300px;
  overflow-y: auto;
  font-size: 14px;
  color: #e3f2fd;
  line-height: 1.6;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.settings-label {
  font-weight: 500;
  font-size: 14px;
}

.settings-help {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .component-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .anomaly-list {
    grid-template-columns: 1fr;
  }
}

.analysis-result {
  background-color: #132f4c;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.analysis-result h3 {
  color: #90caf9;
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.markdown-container {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
}

/* 添加Markdown内容的样式 */
:deep(.markdown-content) {
  color: #e3f2fd;
  line-height: 1.6;
}

:deep(.markdown-content h1),
:deep(.markdown-content h2),
:deep(.markdown-content h3),
:deep(.markdown-content h4) {
  color: #90caf9;
  margin-top: 16px;
  margin-bottom: 8px;
}

:deep(.markdown-content p) {
  margin: 8px 0;
}

:deep(.markdown-content ul),
:deep(.markdown-content ol) {
  padding-left: 24px;
}

:deep(.markdown-content li) {
  margin: 4px 0;
}

:deep(.markdown-content code) {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

:deep(.markdown-content pre) {
  background-color: rgba(0, 0, 0, 0.3);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
}

:deep(.markdown-content blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 16px;
  margin-left: 0;
  color: #90caf9;
}

:deep(.markdown-content table) {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

:deep(.markdown-content th),
:deep(.markdown-content td) {
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px;
  text-align: left;
}

:deep(.markdown-content th) {
  background-color: rgba(255, 255, 255, 0.05);
}
</style> 