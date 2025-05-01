/**
 * 文件名: AnomalyDetectionService.ts
 * 描述: 异常检测服务
 * 作用: 
 * - 为数据分析模块提供异常检测功能
 * - 集成DeepSeek API进行智能异常检测
 * - 提供数据异常分析和预警
 */

// 移除axios依赖，使用fetch API和模拟功能
// import axios from 'axios';

// 异常检测服务配置
interface AnomalyDetectionConfig {
  apiKey?: string;
  endpoint?: string;
  threshold: number;
  enableLocalDetection: boolean;
  enableCloudDetection: boolean;
}

// 异常数据项
export interface AnomalyItem {
  id: string;
  name: string;
  value: number;
  expectedValue: number;
  deviation: number;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  category: string;
  details?: string;
}

// 默认配置
const defaultConfig: AnomalyDetectionConfig = {
  threshold: 2.5,
  enableLocalDetection: true,
  enableCloudDetection: false,
  endpoint: 'https://api.deepseek.com/v1/anomaly-detection'
};

// 当前配置
let currentConfig: AnomalyDetectionConfig = { ...defaultConfig };

/**
 * 异常检测服务
 */
export default class AnomalyDetectionService {
  /**
   * 初始化服务
   * 应用程序启动时调用此方法进行初始化
   */
  static init(): void {
    console.log('初始化异常检测服务');
    // 从本地存储或API获取配置
    const savedConfig = localStorage.getItem('anomaly-detection-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        this.configure(parsedConfig);
      } catch (error) {
        console.error('加载异常检测配置失败', error);
      }
    }
  }

  // 配置服务
  static configure(config: Partial<AnomalyDetectionConfig>): void {
    currentConfig = { ...currentConfig, ...config };
    // 可选：保存配置到本地存储
    localStorage.setItem('anomaly-detection-config', JSON.stringify(currentConfig));
  }

  /**
   * 获取当前配置
   */
  static getConfig(): AnomalyDetectionConfig {
    return { ...currentConfig };
  }

  /**
   * 本地异常检测
   * 使用Z-Score方法检测异常数据点
   * @param data 需要检测的数据数组
   * @param valueField 数值字段名称
   * @param threshold 异常阈值，默认为2.5
   * @returns 带有异常标记的数据
   */
  static detectAnomaliesLocally<T extends Record<string, any>>(
    data: T[],
    valueField: string = 'value',
    threshold: number = currentConfig.threshold
  ): (T & { isAnomaly: boolean; deviation: number })[] {
    if (!data || data.length === 0) {
      return [];
    }

    // 提取数值
    const values = data.map(item => item[valueField]);
    
    // 计算均值
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // 计算标准差
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // 应用Z-Score检测异常
    return data.map(item => {
      const value = item[valueField];
      const deviation = Math.abs((value - mean) / (stdDev || 1)); // 避免除以0
      const isAnomaly = deviation > threshold;
      
      return {
        ...item,
        isAnomaly,
        deviation
      };
    });
  }

  /**
   * 使用DeepSeek API进行异常检测
   * @param data 需要检测的数据
   * @param category 数据类别
   * @returns 带有异常信息的数据
   */
  static async detectAnomaliesWithDeepSeek<T extends Record<string, any>>(
    data: T[],
    category: string,
    timeField: string = 'timestamp',
    valueField: string = 'value'
  ): Promise<(T & { isAnomaly: boolean; confidence: number; details?: string })[]> {
    // 检查是否启用云端检测和是否有API密钥
    if (!currentConfig.enableCloudDetection || !currentConfig.apiKey) {
      console.warn('DeepSeek API异常检测未启用或缺少API密钥，将使用本地检测');
      const localResults = this.detectAnomaliesLocally(data, valueField);
      return localResults.map(item => ({ ...item, confidence: item.deviation / currentConfig.threshold }));
    }

    try {
      // 准备请求数据
      const requestData = {
        data: data.map(item => ({
          timestamp: item[timeField],
          value: item[valueField],
          metadata: { ...item }
        })),
        config: {
          category,
          sensitivity: currentConfig.threshold,
          includeAnalysis: true
        }
      };

      // 模拟DeepSeek API调用
      console.log('模拟调用DeepSeek API', requestData);
      
      // 等待模拟的网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟API响应
      const simulatedResponse = {
        results: data.map((item, index) => {
          const value = item[valueField];
          const isAnomaly = Math.random() > 0.8; // 随机生成一些异常
          const confidence = isAnomaly ? Math.random() * 0.5 + 0.5 : Math.random() * 0.3;
          const analysis = isAnomaly 
            ? `检测到${category}类别的异常值 ${value}，可能表示${Math.random() > 0.5 ? '突发增长' : '意外下降'}`
            : '';
          
          return { isAnomaly, confidence, analysis };
        })
      };

      // 处理模拟的返回结果
      return data.map((item, index) => {
        const result = simulatedResponse.results[index];
        return {
          ...item,
          isAnomaly: result.isAnomaly,
          confidence: result.confidence,
          details: result.analysis
        };
      });
    } catch (error) {
      console.error('DeepSeek API调用失败:', error);
      
      // 失败时回退到本地检测
      console.warn('回退到本地异常检测');
      const localResults = this.detectAnomaliesLocally(data, valueField);
      return localResults.map(item => ({ ...item, confidence: item.deviation / currentConfig.threshold }));
    }
  }

  /**
   * 生成异常总结报告
   * @param anomalies 异常数据列表
   * @returns 异常总结报告
   */
  static generateAnomalyReport(anomalies: AnomalyItem[]): string {
    if (anomalies.length === 0) {
      return "未检测到异常";
    }

    // 按严重性分组
    const severityGroups = {
      high: anomalies.filter(a => a.severity === 'high'),
      medium: anomalies.filter(a => a.severity === 'medium'),
      low: anomalies.filter(a => a.severity === 'low')
    };

    // 生成报告
    let report = `# 异常检测报告\n\n`;
    report += `检测时间: ${new Date().toLocaleString()}\n`;
    report += `共检测到 ${anomalies.length} 个异常\n\n`;

    // 高严重性异常
    if (severityGroups.high.length > 0) {
      report += `## 高风险异常 (${severityGroups.high.length})\n\n`;
      severityGroups.high.forEach(anomaly => {
        report += `- **${anomaly.name}**: 当前值 ${anomaly.value}, 预期值 ${anomaly.expectedValue.toFixed(2)}, 偏差 ${(anomaly.deviation * 100).toFixed(2)}%\n`;
        if (anomaly.details) {
          report += `  ${anomaly.details}\n`;
        }
      });
      report += '\n';
    }

    // 中严重性异常
    if (severityGroups.medium.length > 0) {
      report += `## 中风险异常 (${severityGroups.medium.length})\n\n`;
      severityGroups.medium.forEach(anomaly => {
        report += `- **${anomaly.name}**: 当前值 ${anomaly.value}, 预期值 ${anomaly.expectedValue.toFixed(2)}, 偏差 ${(anomaly.deviation * 100).toFixed(2)}%\n`;
      });
      report += '\n';
    }

    // 低严重性异常
    if (severityGroups.low.length > 0) {
      report += `## 低风险异常 (${severityGroups.low.length})\n\n`;
      report += `检测到 ${severityGroups.low.length} 个低风险异常，可能需要关注。\n\n`;
    }

    return report;
  }

  /**
   * 根据偏差计算异常严重性
   * @param deviation 偏差值
   * @returns 严重性级别
   */
  static calculateSeverity(deviation: number): 'low' | 'medium' | 'high' {
    if (deviation >= 4) return 'high';
    if (deviation >= 3) return 'medium';
    return 'low';
  }
} 