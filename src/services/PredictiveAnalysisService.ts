/**
 * 文件名: PredictiveAnalysisService.ts
 * 描述: 预测性分析服务
 * 功能: 
 * - 基于历史数据预测未来趋势
 * - 提供多种预测算法
 * - 生成预测结果和置信区间
 */

import DeepSeekService from './DeepSeekService';
import type { ProgressCallback } from './DeepSeekService';

// 预测算法类型
export enum PredictionMethod {
  LINEAR = 'linear',         // 线性回归
  EXPONENTIAL = 'exponential', // 指数平滑
  MOVING_AVERAGE = 'moving_average', // 移动平均
  ARIMA = 'arima',           // ARIMA模型
  AI_BASED = 'ai_based'      // AI辅助预测
}

// 数据点接口
export interface DataPoint {
  timestamp: Date | string;  // 时间戳
  value: number;             // 值
  [key: string]: any;        // 其他字段
}

// 预测配置接口
export interface PredictionConfig {
  method: PredictionMethod;  // 预测方法
  horizon: number;           // 预测时间范围(未来多少个时间单位)
  confidenceLevel?: number;  // 置信水平(0-1)
  seasonality?: number;      // 季节性周期(如果适用)
  includeConfidenceIntervals?: boolean; // 是否包含置信区间
}

// 预测结果接口
export interface PredictionResult {
  predictions: DataPoint[];  // 预测点
  confidenceIntervals?: {    // 置信区间
    upper: DataPoint[];
    lower: DataPoint[];
  };
  method: PredictionMethod;  // 使用的预测方法
  accuracy: number;          // 准确度评分(0-1)
  warnings?: string[];       // 预测警告
  insights?: string[];       // 预测洞察
}

/**
 * 预测性分析服务
 */
class PredictiveAnalysisService {
  /**
   * 生成时间序列预测
   * @param historicalData 历史数据
   * @param config 预测配置
   * @param onProgress 进度回调
   * @returns 预测结果
   */
  static async predictTimeSeries(
    historicalData: DataPoint[],
    config: PredictionConfig,
    onProgress?: ProgressCallback
  ): Promise<PredictionResult> {
    // 验证输入数据
    if (!historicalData || historicalData.length < 5) {
      throw new Error('历史数据点不足，无法进行预测分析');
    }
    
    // 根据方法选择预测算法
    switch (config.method) {
      case PredictionMethod.LINEAR:
        return this.linearPrediction(historicalData, config);
      case PredictionMethod.EXPONENTIAL:
        return this.exponentialSmoothingPrediction(historicalData, config);
      case PredictionMethod.MOVING_AVERAGE:
        return this.movingAveragePrediction(historicalData, config);
      case PredictionMethod.AI_BASED:
        return this.aiBasedPrediction(historicalData, config, onProgress);
      default:
        // 默认使用移动平均
        return this.movingAveragePrediction(historicalData, config);
    }
  }

  /**
   * 线性回归预测
   * @param historicalData 历史数据
   * @param config 预测配置
   * @returns 预测结果
   */
  private static linearPrediction(
    historicalData: DataPoint[],
    config: PredictionConfig
  ): Promise<PredictionResult> {
    return new Promise((resolve) => {
      // 提取数据点
      const dataPoints = historicalData.map((point, index) => ({
        x: index,
        y: typeof point.value === 'number' ? point.value : parseFloat(point.value.toString())
      }));
      
      // 计算线性回归参数 (y = mx + b)
      const n = dataPoints.length;
      const sumX = dataPoints.reduce((sum, point) => sum + point.x, 0);
      const sumY = dataPoints.reduce((sum, point) => sum + point.y, 0);
      const sumXY = dataPoints.reduce((sum, point) => sum + (point.x * point.y), 0);
      const sumXX = dataPoints.reduce((sum, point) => sum + (point.x * point.x), 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      // 计算R方值(确定系数)
      const meanY = sumY / n;
      const totalVariation = dataPoints.reduce((sum, point) => sum + Math.pow(point.y - meanY, 2), 0);
      const unexplainedVariation = dataPoints.reduce((sum, point) => {
        const prediction = slope * point.x + intercept;
        return sum + Math.pow(point.y - prediction, 2);
      }, 0);
      const rSquared = 1 - (unexplainedVariation / totalVariation);
      
      // 生成预测数据点
      const predictions: DataPoint[] = [];
      const lastTimestamp = new Date(String(historicalData[historicalData.length - 1].timestamp));
      const timeStep = this.calculateAverageTimeStep(historicalData);
      
      const upperCI: DataPoint[] = [];
      const lowerCI: DataPoint[] = [];
      
      // 预测标准误差
      const predictionsError = Math.sqrt(unexplainedVariation / n);
      // t值对应95%置信水平(大约是1.96)
      const tValue = 1.96;
      
      for (let i = 1; i <= config.horizon; i++) {
        const x = n + i - 1;
        const predictedValue = slope * x + intercept;
        
        // 计算预测的时间戳
        const nextTimestamp = new Date(lastTimestamp.getTime());
        nextTimestamp.setTime(nextTimestamp.getTime() + timeStep * i);
        
        predictions.push({
          timestamp: nextTimestamp,
          value: predictedValue
        });
        
        if (config.includeConfidenceIntervals) {
          // 计算预测的标准误差
          const seOfPrediction = predictionsError * Math.sqrt(1 + 1/n + (Math.pow(x - sumX/n, 2) / (sumXX - Math.pow(sumX, 2)/n)));
          const ciMargin = tValue * seOfPrediction;
          
          upperCI.push({
            timestamp: nextTimestamp,
            value: predictedValue + ciMargin
          });
          
          lowerCI.push({
            timestamp: nextTimestamp,
            value: predictedValue - ciMargin
          });
        }
      }
      
      // 生成结果洞察
      const insights = this.generateInsights(historicalData, predictions, slope);
      
      // 返回预测结果
      resolve({
        predictions,
        confidenceIntervals: config.includeConfidenceIntervals ? {
          upper: upperCI,
          lower: lowerCI
        } : undefined,
        method: PredictionMethod.LINEAR,
        accuracy: rSquared,
        insights
      });
    });
  }

  /**
   * 指数平滑预测
   * @param historicalData 历史数据
   * @param config 预测配置
   * @returns 预测结果
   */
  private static exponentialSmoothingPrediction(
    historicalData: DataPoint[],
    config: PredictionConfig
  ): Promise<PredictionResult> {
    return new Promise((resolve) => {
      // 提取数值
      const values = historicalData.map(point => 
        typeof point.value === 'number' ? point.value : parseFloat(point.value.toString())
      );
      
      // 平滑因子(alpha) - 可以根据数据特性进行调整
      const alpha = 0.3;
      
      // 计算初始平滑值
      let smoothed = values[0];
      const smoothedValues = [smoothed];
      
      // 计算所有历史数据的平滑值
      for (let i = 1; i < values.length; i++) {
        smoothed = alpha * values[i] + (1 - alpha) * smoothed;
        smoothedValues.push(smoothed);
      }
      
      // 计算预测准确度
      let sumSquaredError = 0;
      let sumSquaredTotal = 0;
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      
      for (let i = 1; i < values.length; i++) {
        sumSquaredError += Math.pow(values[i] - smoothedValues[i-1], 2);
        sumSquaredTotal += Math.pow(values[i] - mean, 2);
      }
      
      const accuracy = 1 - (sumSquaredError / sumSquaredTotal);
      
      // 生成预测数据点
      const predictions: DataPoint[] = [];
      const lastTimestamp = new Date(String(historicalData[historicalData.length - 1].timestamp));
      const timeStep = this.calculateAverageTimeStep(historicalData);
      
      // 最后的平滑值用于所有预测点
      const lastSmoothedValue = smoothedValues[smoothedValues.length - 1];
      
      for (let i = 1; i <= config.horizon; i++) {
        // 计算预测的时间戳
        const nextTimestamp = new Date(lastTimestamp.getTime());
        nextTimestamp.setTime(nextTimestamp.getTime() + timeStep * i);
        
        predictions.push({
          timestamp: nextTimestamp,
          value: lastSmoothedValue
        });
      }
      
      // 生成置信区间
      let upperCI: DataPoint[] = [];
      let lowerCI: DataPoint[] = [];
      
      if (config.includeConfidenceIntervals) {
        // 计算标准误差
        const standardError = Math.sqrt(sumSquaredError / (values.length - 1));
        
        // 对应95%置信水平的Z值
        const zValue = 1.96;
        const margin = zValue * standardError;
        
        upperCI = predictions.map(point => ({
          timestamp: point.timestamp,
          value: point.value + margin
        }));
        
        lowerCI = predictions.map(point => ({
          timestamp: point.timestamp,
          value: point.value - margin
        }));
      }
      
      // 生成结果洞察
      const insights = [
        `使用指数平滑法(α=${alpha})预测，预测值将趋于稳定在${lastSmoothedValue.toFixed(2)}附近`,
        `模型准确度为${(accuracy * 100).toFixed(2)}%`,
        `该预测方法适合于无明显趋势和季节性的数据`
      ];
      
      // 返回预测结果
      resolve({
        predictions,
        confidenceIntervals: config.includeConfidenceIntervals ? {
          upper: upperCI,
          lower: lowerCI
        } : undefined,
        method: PredictionMethod.EXPONENTIAL,
        accuracy: Math.max(0, Math.min(accuracy, 1)), // 确保精度在0-1范围内
        insights
      });
    });
  }

  /**
   * 移动平均预测
   * @param historicalData 历史数据
   * @param config 预测配置
   * @returns 预测结果
   */
  private static movingAveragePrediction(
    historicalData: DataPoint[],
    config: PredictionConfig
  ): Promise<PredictionResult> {
    return new Promise((resolve) => {
      // 提取数值
      const values = historicalData.map(point => 
        typeof point.value === 'number' ? point.value : parseFloat(point.value.toString())
      );
      
      // 移动平均窗口大小
      const windowSize = Math.min(5, Math.floor(values.length / 2));
      
      // 最后的移动平均值
      const lastValues = values.slice(-windowSize);
      const predictedValue = lastValues.reduce((sum, val) => sum + val, 0) / windowSize;
      
      // 计算预测准确度
      let sumSquaredError = 0;
      let sumSquaredTotal = 0;
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      
      for (let i = windowSize; i < values.length; i++) {
        const maWindow = values.slice(i - windowSize, i);
        const ma = maWindow.reduce((a, b) => a + b, 0) / windowSize;
        sumSquaredError += Math.pow(values[i] - ma, 2);
        sumSquaredTotal += Math.pow(values[i] - mean, 2);
      }
      
      const accuracy = 1 - (sumSquaredError / sumSquaredTotal);
      
      // 生成预测数据点
      const predictions: DataPoint[] = [];
      const lastTimestamp = new Date(String(historicalData[historicalData.length - 1].timestamp));
      const timeStep = this.calculateAverageTimeStep(historicalData);
      
      for (let i = 1; i <= config.horizon; i++) {
        // 计算预测的时间戳
        const nextTimestamp = new Date(lastTimestamp.getTime());
        nextTimestamp.setTime(nextTimestamp.getTime() + timeStep * i);
        
        predictions.push({
          timestamp: nextTimestamp,
          value: predictedValue
        });
      }
      
      // 生成置信区间
      let upperCI: DataPoint[] = [];
      let lowerCI: DataPoint[] = [];
      
      if (config.includeConfidenceIntervals) {
        // 计算样本标准差
        const sampleStd = Math.sqrt(
          lastValues.reduce((sum, val) => sum + Math.pow(val - predictedValue, 2), 0) / (windowSize - 1)
        );
        
        // 标准误差
        const standardError = sampleStd / Math.sqrt(windowSize);
        
        // 对应95%置信水平的t值
        const tValue = 2.776; // 对于自由度为4(窗口大小为5)的t值
        const margin = tValue * standardError;
        
        upperCI = predictions.map(point => ({
          timestamp: point.timestamp,
          value: point.value + margin
        }));
        
        lowerCI = predictions.map(point => ({
          timestamp: point.timestamp,
          value: point.value - margin
        }));
      }
      
      // 生成结果洞察
      const insights = [
        `使用${windowSize}点移动平均法预测，未来值预计将保持在${predictedValue.toFixed(2)}附近`,
        `移动平均模型准确度为${(accuracy * 100).toFixed(2)}%`,
        `该预测方法适合于数据波动不大且无明显趋势的情况`
      ];
      
      // 返回预测结果
      resolve({
        predictions,
        confidenceIntervals: config.includeConfidenceIntervals ? {
          upper: upperCI,
          lower: lowerCI
        } : undefined,
        method: PredictionMethod.MOVING_AVERAGE,
        accuracy: Math.max(0, Math.min(accuracy, 1)), // 确保精度在0-1范围内
        insights
      });
    });
  }

  /**
   * AI辅助预测
   * @param historicalData 历史数据
   * @param config 预测配置
   * @param onProgress 进度回调
   * @returns 预测结果
   */
  private static async aiBasedPrediction(
    historicalData: DataPoint[],
    config: PredictionConfig,
    onProgress?: ProgressCallback
  ): Promise<PredictionResult> {
    try {
      // 准备数据
      const dataStr = historicalData
        .map(point => `${new Date(String(point.timestamp)).toISOString().split('T')[0]}: ${point.value}`)
        .join('\n');
      
      // 构建提示
      const prompt = `请作为一个专业的时间序列预测专家，分析以下历史数据并预测未来${config.horizon}个时间点的值。

历史数据:
${dataStr}

请根据这些数据，分析其中的趋势、季节性和其他模式，并给出:
1. 未来${config.horizon}个时间点的预测值
2. 每个预测的95%置信区间(上限和下限)
3. 预测准确度评分(0-1之间)
4. 对预测结果的解释和洞察

请以JSON格式返回结果，格式如下:
{
  "predictions": [
    {"date": "YYYY-MM-DD", "value": number},
    ...
  ],
  "confidenceIntervals": {
    "upper": [
      {"date": "YYYY-MM-DD", "value": number},
      ...
    ],
    "lower": [
      {"date": "YYYY-MM-DD", "value": number},
      ...
    ]
  },
  "accuracy": number, // 0-1之间
  "insights": [
    "洞察1",
    "洞察2",
    ...
  ]
}`;
      
      // 调用DeepSeek API
      const response = await DeepSeekService.getAnalysisWithProgress(
        prompt,
        undefined, // 使用默认模型
        onProgress
      );
      
      // 解析JSON
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                        response.match(/\{[\s\S]*"predictions"[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('无法解析AI预测结果');
      }
      
      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const result = JSON.parse(jsonStr);
      
      // 转换结果格式
      const predictions = result.predictions.map((p: any) => ({
        timestamp: new Date(p.date),
        value: p.value
      }));
      
      let confidenceIntervals;
      if (result.confidenceIntervals) {
        confidenceIntervals = {
          upper: result.confidenceIntervals.upper.map((p: any) => ({
            timestamp: new Date(p.date),
            value: p.value
          })),
          lower: result.confidenceIntervals.lower.map((p: any) => ({
            timestamp: new Date(p.date),
            value: p.value
          }))
        };
      }
      
      return {
        predictions,
        confidenceIntervals,
        method: PredictionMethod.AI_BASED,
        accuracy: result.accuracy,
        insights: result.insights
      };
    } catch (error) {
      console.error('AI辅助预测失败:', error);
      
      // 回退到移动平均方法
      return this.movingAveragePrediction(historicalData, config);
    }
  }

  /**
   * 计算平均时间步长
   * @param data 数据点
   * @returns 平均时间步长(毫秒)
   */
  private static calculateAverageTimeStep(data: DataPoint[]): number {
    if (data.length < 2) return 86400000; // 默认为一天
    
    let totalDiff = 0;
    
    for (let i = 1; i < data.length; i++) {
      const t1 = new Date(String(data[i-1].timestamp)).getTime();
      const t2 = new Date(String(data[i].timestamp)).getTime();
      totalDiff += (t2 - t1);
    }
    
    return totalDiff / (data.length - 1);
  }

  /**
   * 生成预测洞察
   * @param historicalData 历史数据
   * @param predictions 预测数据
   * @param slope 趋势斜率
   * @returns 洞察列表
   */
  private static generateInsights(
    historicalData: DataPoint[],
    predictions: DataPoint[],
    slope: number
  ): string[] {
    const insights: string[] = [];
    
    // 提取最近和最早的值
    const latestValue = historicalData[historicalData.length - 1].value;
    const earliestValue = historicalData[0].value;
    
    // 提取最高和最低的预测值
    const predictedValues = predictions.map(p => p.value);
    const maxPredicted = Math.max(...predictedValues);
    const minPredicted = Math.min(...predictedValues);
    
    // 判断趋势
    if (slope > 0.01) {
      insights.push(`数据显示上升趋势，预计将继续增长`);
    } else if (slope < -0.01) {
      insights.push(`数据显示下降趋势，预计将继续减少`);
    } else {
      insights.push(`数据相对稳定，预计将保持在当前水平`);
    }
    
    // 整体变化
    const changeRate = ((predictions[predictions.length - 1].value - latestValue) / latestValue) * 100;
    if (Math.abs(changeRate) > 5) {
      insights.push(`预测期末值相比当前值${changeRate > 0 ? '增加' : '减少'}了${Math.abs(changeRate).toFixed(2)}%`);
    }
    
    // 波动性分析
    const range = maxPredicted - minPredicted;
    const avgValue = predictedValues.reduce((sum, val) => sum + val, 0) / predictedValues.length;
    const volatility = range / avgValue;
    
    if (volatility > 0.2) {
      insights.push(`预测期内数据波动较大，最大波幅达${(volatility * 100).toFixed(2)}%`);
    } else if (volatility < 0.05) {
      insights.push(`预测期内数据波动较小，保持相对稳定`);
    }
    
    return insights;
  }
}

export default PredictiveAnalysisService; 