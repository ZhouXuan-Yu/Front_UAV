/**
 * 文件名: AutoInsightService.ts
 * 描述: 自动见解生成服务
 * 功能: 
 * - 自动识别数据异常模式
 * - 提供数据洞察和解释
 * - 为关键指标提供自动化见解
 */

import DeepSeekService from './DeepSeekService';
import type { ProgressCallback } from './DeepSeekService';
import AnomalyDetectionService from './AnomalyDetectionService';

// 洞察类型枚举
export enum InsightType {
  TREND = 'trend',              // 趋势洞察
  ANOMALY = 'anomaly',          // 异常洞察
  CORRELATION = 'correlation',  // 相关性洞察
  COMPARISON = 'comparison',    // 比较洞察
  PATTERN = 'pattern',          // 模式洞察
  SUMMARY = 'summary'           // 总结性洞察
}

// 洞察严重程度
export enum InsightSeverity {
  INFO = 'info',       // 信息
  WARNING = 'warning', // 警告
  CRITICAL = 'critical' // 严重
}

// 数据洞察接口
export interface DataInsight {
  id: string;                 // 唯一标识符
  type: InsightType;          // 洞察类型
  title: string;              // 标题
  description: string;        // 描述
  metrics: string[];          // 相关指标
  severity: InsightSeverity;  // 严重程度
  timestamp: Date;            // 生成时间
  confidence: number;         // 置信度
  relatedData?: any;          // 相关数据
  recommendations?: string[]; // 建议
}

// 见解请求接口
export interface InsightRequest {
  dataType: string;           // 数据类型
  metrics: string[];          // 指标
  timeRange: [Date, Date];    // 时间范围
  data: any[];                // 数据
  anomalies?: any[];          // 异常数据
  maxInsights?: number;       // 最大洞察数量
}

/**
 * 自动见解服务
 */
class AutoInsightService {
  /**
   * 为数据生成洞察
   * @param request 见解请求
   * @param onProgress 进度回调
   * @returns 数据洞察列表
   */
  static async generateInsights(
    request: InsightRequest,
    onProgress?: ProgressCallback
  ): Promise<DataInsight[]> {
    // 首先检测异常(如果未提供)
    let anomalies = request.anomalies;
    if (!anomalies) {
      const metricData = request.metrics.map(metric => ({
        metric,
        data: request.data.map(item => ({
          timestamp: item.timestamp || item.date,
          value: item[metric]
        }))
      }));
      
      anomalies = await Promise.all(
        metricData.map(async ({ metric, data }) => {
          const results = AnomalyDetectionService.detectAnomaliesLocally(
            data,
            'value',
            2.5
          );
          return {
            metric,
            anomalies: results.filter(item => item.isAnomaly).map(item => ({
              timestamp: item.timestamp,
              value: item.value,
              expected: item.value / (1 + item.deviation),
              deviation: item.deviation
            }))
          };
        })
      );
    }
    
    // 生成基本洞察
    const basicInsights = this.generateBasicInsights(request, anomalies);
    
    // 使用DeepSeek API生成高级洞察
    let advancedInsights: DataInsight[] = [];
    try {
      advancedInsights = await this.generateAdvancedInsights(request, anomalies, onProgress);
    } catch (error) {
      console.error('生成高级洞察失败:', error);
    }
    
    // 合并洞察并去重
    const allInsights = [...basicInsights, ...advancedInsights];
    const uniqueInsights = this.deduplicateInsights(allInsights);
    
    // 限制洞察数量
    const maxInsights = request.maxInsights || 10;
    return uniqueInsights.slice(0, maxInsights);
  }

  /**
   * 生成基本洞察
   * @param request 见解请求
   * @param anomalies 异常数据
   * @returns 数据洞察
   */
  private static generateBasicInsights(
    request: InsightRequest,
    anomalies: any[]
  ): DataInsight[] {
    const insights: DataInsight[] = [];
    const { data, metrics, dataType, timeRange } = request;
    
    // 检查数据量
    if (data.length === 0) {
      return insights;
    }
    
    // 为每个指标生成趋势洞察
    for (const metric of metrics) {
      // 提取指标数据
      const metricData = data.map(item => ({
        timestamp: new Date(item.timestamp || item.date),
        value: typeof item[metric] === 'number' ? item[metric] : parseFloat(item[metric])
      })).filter(item => !isNaN(item.value));
      
      if (metricData.length < 2) continue;
      
      // 计算基本统计量
      metricData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const firstValue = metricData[0].value;
      const lastValue = metricData[metricData.length - 1].value;
      const change = lastValue - firstValue;
      const percentChange = (change / Math.abs(firstValue)) * 100;
      
      // 计算趋势(简单线性回归)
      const n = metricData.length;
      const xMean = (n - 1) / 2; // 假设x是均匀分布的索引
      const yMean = metricData.reduce((sum, d) => sum + d.value, 0) / n;
      
      let numerator = 0;
      let denominator = 0;
      
      for (let i = 0; i < n; i++) {
        numerator += (i - xMean) * (metricData[i].value - yMean);
        denominator += Math.pow(i - xMean, 2);
      }
      
      const slope = numerator / denominator;
      const trendStrength = Math.abs(slope) * n / Math.abs(yMean);
      
      // 添加趋势洞察
      if (Math.abs(percentChange) > 5) {
        insights.push({
          id: `trend-${dataType}-${metric}-${Date.now()}`,
          type: InsightType.TREND,
          title: `${metric} ${change > 0 ? '增加' : '减少'}了 ${Math.abs(percentChange).toFixed(2)}%`,
          description: `在${timeRange[0].toLocaleDateString()}至${timeRange[1].toLocaleDateString()}期间，${metric}从${firstValue.toFixed(2)}${change > 0 ? '增加' : '减少'}到${lastValue.toFixed(2)}`,
          metrics: [metric],
          severity: Math.abs(percentChange) > 20 ? InsightSeverity.WARNING : InsightSeverity.INFO,
          timestamp: new Date(),
          confidence: Math.min(0.5 + trendStrength, 0.95),
          relatedData: {
            firstValue,
            lastValue,
            change,
            percentChange,
            slope
          }
        });
      }
      
      // 检查数据极值
      const values = metricData.map(d => d.value);
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      const maxIndex = values.indexOf(maxValue);
      const minIndex = values.indexOf(minValue);
      const range = maxValue - minValue;
      const meanValue = values.reduce((a, b) => a + b, 0) / values.length;
      const rangePercentOfMean = (range / Math.abs(meanValue)) * 100;
      
      // 添加极值洞察
      if (rangePercentOfMean > 30) {
        insights.push({
          id: `pattern-${dataType}-${metric}-range-${Date.now()}`,
          type: InsightType.PATTERN,
          title: `${metric} 存在显著波动`,
          description: `在观察期内，${metric}最大值(${maxValue.toFixed(2)})与最小值(${minValue.toFixed(2)})之间的差异达到${rangePercentOfMean.toFixed(2)}%`,
          metrics: [metric],
          severity: InsightSeverity.INFO,
          timestamp: new Date(),
          confidence: 0.8,
          relatedData: {
            maxValue,
            maxDate: metricData[maxIndex].timestamp,
            minValue,
            minDate: metricData[minIndex].timestamp,
            range,
            rangePercentOfMean
          }
        });
      }
    }
    
    // 添加异常洞察
    for (const anomalyResult of anomalies) {
      const { metric, anomalies: metricAnomalies } = anomalyResult;
      
      if (metricAnomalies && metricAnomalies.length > 0) {
        // 计算异常的平均偏离度
        const deviations = metricAnomalies.map(a => Math.abs(a.deviation || 0));
        const avgDeviation = deviations.reduce((a, b) => a + b, 0) / deviations.length;
        
        insights.push({
          id: `anomaly-${dataType}-${metric}-${Date.now()}`,
          type: InsightType.ANOMALY,
          title: `${metric} 检测到 ${metricAnomalies.length} 个异常点`,
          description: `在观察期内，${metric}数据中发现${metricAnomalies.length}个异常值，平均偏离度为${avgDeviation.toFixed(2)}`,
          metrics: [metric],
          severity: metricAnomalies.length > 3 ? InsightSeverity.WARNING : InsightSeverity.INFO,
          timestamp: new Date(),
          confidence: 0.7 + Math.min(avgDeviation / 10, 0.2),
          relatedData: {
            anomalyCount: metricAnomalies.length,
            anomalies: metricAnomalies,
            avgDeviation
          }
        });
      }
    }
    
    // 如果有多个指标，尝试查找相关性
    if (metrics.length > 1) {
      // 简单的指标对比较
      for (let i = 0; i < metrics.length; i++) {
        for (let j = i + 1; j < metrics.length; j++) {
          const metric1 = metrics[i];
          const metric2 = metrics[j];
          
          // 提取指标数据
          const values1 = data.map(item => typeof item[metric1] === 'number' ? item[metric1] : parseFloat(item[metric1])).filter(v => !isNaN(v));
          const values2 = data.map(item => typeof item[metric2] === 'number' ? item[metric2] : parseFloat(item[metric2])).filter(v => !isNaN(v));
          
          // 确保有足够的数据点
          const minLength = Math.min(values1.length, values2.length);
          if (minLength < 3) continue;
          
          // 计算相关系数(皮尔逊相关系数)
          const correlation = this.calculateCorrelation(values1.slice(0, minLength), values2.slice(0, minLength));
          
          // 只关注强相关或强负相关
          if (Math.abs(correlation) > 0.7) {
            insights.push({
              id: `correlation-${dataType}-${metric1}-${metric2}-${Date.now()}`,
              type: InsightType.CORRELATION,
              title: `${metric1} 与 ${metric2} 存在${correlation > 0 ? '正' : '负'}相关`,
              description: `这两个指标之间检测到强${correlation > 0 ? '正' : '负'}相关(系数: ${correlation.toFixed(2)})`,
              metrics: [metric1, metric2],
              severity: InsightSeverity.INFO,
              timestamp: new Date(),
              confidence: Math.abs(correlation),
              relatedData: {
                correlation,
                metric1,
                metric2
              }
            });
          }
        }
      }
    }
    
    return insights;
  }

  /**
   * 使用DeepSeek API生成高级数据洞察
   * @param request 见解请求
   * @param anomalies 异常数据
   * @param onProgress 进度回调
   * @returns 数据洞察
   */
  private static async generateAdvancedInsights(
    request: InsightRequest,
    anomalies: any[],
    onProgress?: ProgressCallback
  ): Promise<DataInsight[]> {
    // 准备数据样本
    const dataLength = request.data.length;
    const sampleSize = Math.min(dataLength, 50); // 最多取50个数据点作为样本
    const step = Math.max(1, Math.floor(dataLength / sampleSize));
    const dataSample = [];
    
    for (let i = 0; i < dataLength; i += step) {
      if (dataSample.length < sampleSize) {
        dataSample.push(request.data[i]);
      }
    }
    
    // 准备异常数据
    const anomalySummary = anomalies.map(a => ({
      metric: a.metric,
      count: a.anomalies ? a.anomalies.length : 0,
      examples: a.anomalies && a.anomalies.length > 0 
        ? a.anomalies.slice(0, 3).map((anomaly: any) => ({
            timestamp: anomaly.timestamp,
            value: anomaly.value,
            expected: anomaly.expected || null,
            deviation: anomaly.deviation || null
          }))
        : []
    }));
    
    // 构建查询提示
    const prompt = `你是一名资深数据分析师，擅长从数据中发现有价值的洞察。请分析以下数据并提供重要发现：

数据类型: ${request.dataType}
指标: ${request.metrics.join(', ')}
时间范围: ${request.timeRange[0].toLocaleDateString()} 至 ${request.timeRange[1].toLocaleDateString()}

数据样本(共${request.data.length}条):
${JSON.stringify(dataSample, null, 2)}

异常数据摘要:
${JSON.stringify(anomalySummary, null, 2)}

请提供3-5个关键洞察，包括:
1. 主要趋势和模式
2. 异常情况的深度分析
3. 可能的相关性和因果关系
4. 关键指标的表现分析
5. 总体评估和建议

对于每个洞察，请提供以下信息:
- 洞察类型(趋势、异常、相关性、比较、模式、总结)
- 标题(简短描述)
- 详细描述
- 相关指标
- 严重程度(信息、警告、严重)
- 置信度(0-1的小数)
- 建议(如适用)

请以JSON格式返回，格式如下:
{
  "insights": [
    {
      "type": "trend|anomaly|correlation|comparison|pattern|summary",
      "title": "简短的洞察标题",
      "description": "详细描述",
      "metrics": ["相关指标1", "相关指标2"],
      "severity": "info|warning|critical",
      "confidence": 0.9, // 0-1之间的值
      "recommendations": [
        "建议1",
        "建议2"
      ]
    },
    // 更多洞察...
  ]
}`;
    
    try {
      // 调用DeepSeek API
      const response = await DeepSeekService.getAnalysisWithProgress(
        prompt,
        undefined, // 使用默认模型
        onProgress
      );
      
      // 解析JSON
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                        response.match(/\{[\s\S]*"insights"[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('无法解析AI生成的洞察');
      }
      
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const result = JSON.parse(jsonStr);
      
      // 转换为DataInsight格式
      return result.insights.map((insight: any, index: number) => ({
        id: `ai-${insight.type}-${request.dataType}-${index}-${Date.now()}`,
        type: this.parseInsightType(insight.type),
        title: insight.title,
        description: insight.description,
        metrics: insight.metrics || request.metrics,
        severity: this.parseInsightSeverity(insight.severity),
        timestamp: new Date(),
        confidence: insight.confidence || 0.7,
        recommendations: insight.recommendations
      }));
    } catch (error) {
      console.error('生成高级洞察失败:', error);
      return [];
    }
  }

  /**
   * 去除重复洞察
   * @param insights 洞察列表
   * @returns 去重后的洞察列表
   */
  private static deduplicateInsights(insights: DataInsight[]): DataInsight[] {
    const uniqueInsights: DataInsight[] = [];
    const titles = new Set<string>();
    
    // 按置信度排序
    insights.sort((a, b) => b.confidence - a.confidence);
    
    for (const insight of insights) {
      // 检查标题或描述是否过于相似
      let isDuplicate = false;
      
      // 检查标题
      if (titles.has(insight.title)) {
        isDuplicate = true;
      } else {
        titles.add(insight.title);
      }
      
      // 如果不是重复的，添加到结果列表
      if (!isDuplicate) {
        uniqueInsights.push(insight);
      }
    }
    
    return uniqueInsights;
  }

  /**
   * 计算相关系数
   * @param valuesX X变量值数组
   * @param valuesY Y变量值数组
   * @returns 相关系数
   */
  private static calculateCorrelation(valuesX: number[], valuesY: number[]): number {
    const n = Math.min(valuesX.length, valuesY.length);
    
    if (n === 0) return 0;
    
    // 计算平均值
    const meanX = valuesX.reduce((a, b) => a + b, 0) / n;
    const meanY = valuesY.reduce((a, b) => a + b, 0) / n;
    
    // 计算协方差和标准差
    let covXY = 0;
    let varX = 0;
    let varY = 0;
    
    for (let i = 0; i < n; i++) {
      const diffX = valuesX[i] - meanX;
      const diffY = valuesY[i] - meanY;
      
      covXY += diffX * diffY;
      varX += diffX * diffX;
      varY += diffY * diffY;
    }
    
    // 处理边缘情况
    if (varX === 0 || varY === 0) return 0;
    
    // 返回相关系数
    return covXY / (Math.sqrt(varX) * Math.sqrt(varY));
  }

  /**
   * 解析洞察类型
   * @param typeStr 类型字符串
   * @returns 洞察类型
   */
  private static parseInsightType(typeStr: string): InsightType {
    const typeMap: Record<string, InsightType> = {
      'trend': InsightType.TREND,
      'anomaly': InsightType.ANOMALY,
      'correlation': InsightType.CORRELATION,
      'comparison': InsightType.COMPARISON,
      'pattern': InsightType.PATTERN,
      'summary': InsightType.SUMMARY
    };
    
    return typeMap[typeStr.toLowerCase()] || InsightType.SUMMARY;
  }

  /**
   * 解析洞察严重程度
   * @param severityStr 严重程度字符串
   * @returns 洞察严重程度
   */
  private static parseInsightSeverity(severityStr: string): InsightSeverity {
    const severityMap: Record<string, InsightSeverity> = {
      'info': InsightSeverity.INFO,
      'warning': InsightSeverity.WARNING,
      'critical': InsightSeverity.CRITICAL
    };
    
    return severityMap[severityStr.toLowerCase()] || InsightSeverity.INFO;
  }
}

export default AutoInsightService; 