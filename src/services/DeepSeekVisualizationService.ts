import NaturalLanguageQueryService, { QueryType, QueryContext } from './NaturalLanguageQueryService';

export interface DataFeatures {
  count: number;
  fields: Record<string, string>;
  metrics: Record<string, boolean>;
  dimensions: Record<string, boolean>;
  temporalData: boolean;
  spatialData: boolean;
  distribution?: {
    skewness?: number;
    outliers?: number;
    clusters?: number;
  };
}

export interface VisualizationRecommendation {
  type: string;
  label: string;
  confidence: number;
  description: string;
  config?: Record<string, any>;
}

export class DeepSeekVisualizationService {
  /**
   * 智能推荐可视化类型
   */
  static async recommendVisualization(
    data: any[],
    metadata: Record<string, any> = {},
    onProgress?: (progress: number, message?: string) => void
  ): Promise<VisualizationRecommendation[]> {
    try {
      // 分析数据特征
      const dataFeatures = this.analyzeDataFeatures(data);
      
      if (onProgress) onProgress(20, '分析数据特征完成');
      
      // 构建提示
      const prompt = this.buildRecommendationPrompt(dataFeatures, metadata);
      
      if (onProgress) onProgress(30, '构建AI提示完成');
      
      // 构建查询上下文
      const queryContext: QueryContext = {
        dataTypes: ['visualization'],
        metrics: Object.keys(dataFeatures.metrics),
        filters: metadata as Record<string, any>
      };
      
      // 调用DeepSeek API
      const response = await NaturalLanguageQueryService.processQuery(
        prompt,
        queryContext,
        onProgress ? (progress, message) => {
          // 映射进度范围从30-90%
          const mappedProgress = 30 + Math.floor(progress * 0.6);
          onProgress(mappedProgress, message);
        } : undefined
      );
      
      if (onProgress) onProgress(90, '解析推荐结果');
      
      // 解析建议
      const recommendations = this.parseRecommendations(response);
      
      if (onProgress) onProgress(100, '推荐生成完成');
      
      return recommendations;
    } catch (error) {
      console.error('AI可视化推荐失败:', error);
      // 返回默认建议
      return this.getDefaultRecommendations(data);
    }
  }
  
  /**
   * 分析数据特征
   */
  static analyzeDataFeatures(data: any[]): DataFeatures {
    // 提取数据特征，如数据类型、数值分布等
    const features: DataFeatures = {
      count: data.length,
      fields: {},
      metrics: {},
      dimensions: {},
      temporalData: false,
      spatialData: false,
      distribution: {
        skewness: 0,
        outliers: 0,
        clusters: 1
      }
    };
    
    // 如果数据为空，返回默认值
    if (data.length === 0) return features;
    
    // 分析第一条记录确定字段类型
    const sample = data[0];
    
    for (const [key, value] of Object.entries(sample)) {
      // 判断字段类型
      const type = typeof value;
      
      features.fields[key] = type;
      
      // 检测是否为数值型字段（指标）
      if (type === 'number') {
        features.metrics[key] = true;
      } else {
        features.dimensions[key] = true;
      }
      
      // 检测是否包含时间数据
      if (key.toLowerCase().includes('time') || 
          key.toLowerCase().includes('date') || 
          key.toLowerCase().includes('timestamp') ||
          (typeof value === 'string' && 
           (value.match(/^\d{4}-\d{2}-\d{2}/) || 
            value.match(/^\d{4}\/\d{2}\/\d{2}/)))) {
        features.temporalData = true;
      }
      
      // 检测是否包含地理数据
      if (key.toLowerCase().includes('lat') || 
          key.toLowerCase().includes('lon') || 
          key.toLowerCase().includes('location') ||
          key.toLowerCase().includes('geo') ||
          key.toLowerCase().includes('coordinate')) {
        features.spatialData = true;
      }
    }
    
    // 更高级的分析：检测数据分布情况
    if (data.length > 5) {
      // 尝试检测是否有聚类
      try {
        const clusters = this.detectClusters(data);
        if (features.distribution) {
          features.distribution.clusters = clusters;
        }
      } catch (error) {
        console.warn('聚类检测失败:', error);
      }
      
      // 检测异常值
      try {
        const numericFields = Object.keys(features.metrics);
        let totalOutliers = 0;
        
        for (const field of numericFields) {
          const values = data.map(item => Number(item[field])).filter(v => !isNaN(v));
          const outliers = this.detectOutliers(values);
          totalOutliers += outliers.length;
        }
        
        if (features.distribution) {
          features.distribution.outliers = totalOutliers;
        }
      } catch (error) {
        console.warn('异常值检测失败:', error);
      }
    }
    
    return features;
  }
  
  /**
   * 检测数据中的聚类数量 (简化版)
   */
  private static detectClusters(data: any[]): number {
    // 这里使用一个非常简化的聚类检测
    // 在实际应用中应该使用更复杂的算法如K-means
    // 仅用于演示：尝试从数据中猜测可能的聚类数
    
    if (data.length < 10) return 1;
    
    const numericFields = Object.keys(data[0]).filter(key => typeof data[0][key] === 'number');
    if (numericFields.length === 0) return 1;
    
    // 使用第一个数值字段进行简单聚类
    const field = numericFields[0];
    const values = data.map(item => item[field]).sort((a, b) => a - b);
    
    // 计算相邻值的差值
    const diffs = [];
    for (let i = 1; i < values.length; i++) {
      diffs.push(values[i] - values[i-1]);
    }
    
    // 计算差值的平均值和标准差
    const avgDiff = diffs.reduce((sum, diff) => sum + diff, 0) / diffs.length;
    const stdDiff = Math.sqrt(
      diffs.reduce((sum, diff) => sum + Math.pow(diff - avgDiff, 2), 0) / diffs.length
    );
    
    // 找出明显大于平均值的差异，这可能表示聚类边界
    const clusters = 1 + diffs.filter(diff => diff > avgDiff + 2 * stdDiff).length;
    
    return Math.min(clusters, 5); // 限制最大聚类数为5
  }
  
  /**
   * 检测异常值
   */
  private static detectOutliers(values: number[]): number[] {
    if (values.length < 5) return [];
    
    // 计算四分位数
    values.sort((a, b) => a - b);
    const q1Index = Math.floor(values.length * 0.25);
    const q3Index = Math.floor(values.length * 0.75);
    
    const q1 = values[q1Index];
    const q3 = values[q3Index];
    
    // 计算四分位距
    const iqr = q3 - q1;
    
    // 定义异常值边界
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    // 找出异常值
    return values.filter(value => value < lowerBound || value > upperBound);
  }
  
  /**
   * 构建推荐提示
   */
  static buildRecommendationPrompt(dataFeatures: DataFeatures, metadata: Record<string, any>): string {
    return `分析以下数据特征，推荐最适合的3D可视化类型和配置:
数据量: ${dataFeatures.count}条
指标字段: ${Object.keys(dataFeatures.metrics).join(', ')}
维度字段: ${Object.keys(dataFeatures.dimensions).join(', ')}
是否包含时间数据: ${dataFeatures.temporalData ? '是' : '否'}
是否包含地理数据: ${dataFeatures.spatialData ? '是' : '否'}
用户目标: ${metadata.goal || '探索数据关系'}

请推荐最适合的3种3D可视化类型，并给出配置建议。回答格式如下:
1. [可视化类型名称]: [简短理由]
配置建议: xField=[字段名], yField=[字段名], zField=[字段名], colorField=[字段名]

2. [可视化类型名称]: [简短理由]
配置建议: xField=[字段名], yField=[字段名], zField=[字段名], colorField=[字段名]

3. [可视化类型名称]: [简短理由]
配置建议: xField=[字段名], yField=[字段名], zField=[字段名], colorField=[字段名]

可用的可视化类型有: scatter3D(3D散点图), bar3D(3D柱状图), heatmapSurface(热力表面图), geoMap3D(3D地理图), timeSeries3D(3D时间序列)`;
  }
  
  /**
   * 解析推荐结果
   */
  static parseRecommendations(response: any): VisualizationRecommendation[] {
    // 解析API返回的推荐结果
    const recommendations: VisualizationRecommendation[] = [];
    
    try {
      if (response && response.answer) {
        // 提取推荐的可视化类型
        const visualizationTypes = response.answer.match(/\d+\.\s+([^:]+):\s+([^\n]+)/g) || [];
        
        visualizationTypes.forEach((typeDesc, index) => {
          const match = typeDesc.match(/\d+\.\s+([^:]+):\s+(.+)/);
          if (match && match[1] && match[2]) {
            const visType = match[1].trim();
            const reason = match[2].trim();
            
            // 提取配置建议
            const configMatch = response.answer.split(typeDesc)[1]?.match(/配置建议:\s+([^\n]+)/);
            const configStr = configMatch ? configMatch[1] : '';
            
            // 解析配置
            const config: Record<string, any> = {};
            const configParts = configStr.split(',').map(part => part.trim());
            
            configParts.forEach(part => {
              const [key, value] = part.split('=').map(item => item.trim());
              if (key && value) {
                config[key] = value;
              }
            });
            
            // 映射到我们支持的类型
            const mappedType = this.mapToSupportedType(visType);
            if (mappedType) {
              recommendations.push({
                type: mappedType.type,
                label: mappedType.label,
                confidence: 0.9 - index * 0.1, // 第一个推荐最高置信度
                description: reason,
                config
              });
            }
          }
        });
      }
    } catch (e) {
      console.error('解析可视化推荐失败:', e);
    }
    
    // 确保至少有一个推荐
    if (recommendations.length === 0) {
      return this.getDefaultRecommendations([]);
    }
    
    return recommendations;
  }
  
  /**
   * 映射到支持的可视化类型
   */
  static mapToSupportedType(visType: string): { type: string; label: string } | null {
    const typeMap: Record<string, { type: string; label: string }> = {
      'scatter3D': { type: 'scatter3D', label: '3D散点图' },
      '3D散点图': { type: 'scatter3D', label: '3D散点图' },
      'bar3D': { type: 'bar3D', label: '3D柱状图' },
      '3D柱状图': { type: 'bar3D', label: '3D柱状图' },
      'heatmapSurface': { type: 'heatmapSurface', label: '热力表面图' },
      '热力表面图': { type: 'heatmapSurface', label: '热力表面图' },
      'geoMap3D': { type: 'geoMap3D', label: '3D地理图' },
      '3D地理图': { type: 'geoMap3D', label: '3D地理图' },
      'timeSeries3D': { type: 'timeSeries3D', label: '3D时间序列' },
      '3D时间序列': { type: 'timeSeries3D', label: '3D时间序列' }
    };
    
    // 直接匹配
    if (typeMap[visType]) {
      return typeMap[visType];
    }
    
    // 模糊匹配
    for (const [key, value] of Object.entries(typeMap)) {
      if (visType.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }
    
    return null;
  }
  
  /**
   * 获取默认推荐
   */
  static getDefaultRecommendations(data: any[]): VisualizationRecommendation[] {
    const hasGeoData = data.length > 0 && Object.keys(data[0] || {}).some(key => 
      key.toLowerCase().includes('lat') || key.toLowerCase().includes('lon')
    );
    
    const hasTimeData = data.length > 0 && Object.keys(data[0] || {}).some(key => 
      key.toLowerCase().includes('time') || key.toLowerCase().includes('date')
    );
    
    const recommendations: VisualizationRecommendation[] = [
      {
        type: 'scatter3D',
        label: '3D散点图',
        confidence: 0.8,
        description: '3D散点图适合展示多维数据关系',
        config: {
          xField: '默认X字段',
          yField: '默认Y字段',
          zField: '默认Z字段'
        }
      },
      {
        type: 'bar3D',
        label: '3D柱状图',
        confidence: 0.7,
        description: '3D柱状图适合比较不同类别的数值',
        config: {
          xField: '默认X字段',
          yField: '默认Y字段',
          zField: '默认Z字段'
        }
      }
    ];
    
    // 根据数据特征添加推荐
    if (hasGeoData) {
      recommendations.push({
        type: 'geoMap3D',
        label: '3D地理图',
        confidence: 0.9,
        description: '数据包含地理信息，适合使用3D地理图展示',
        config: {
          latField: '纬度字段',
          lonField: '经度字段',
          valueField: '值字段'
        }
      });
    }
    
    if (hasTimeData) {
      recommendations.push({
        type: 'timeSeries3D',
        label: '3D时间序列',
        confidence: 0.85,
        description: '数据包含时间信息，适合使用3D时间序列展示',
        config: {
          xField: '默认X字段',
          yField: '默认Y字段',
          zField: '默认Z字段',
          timeField: '时间字段'
        }
      });
    }
    
    // 只返回前3个推荐
    return recommendations.slice(0, 3);
  }
} 