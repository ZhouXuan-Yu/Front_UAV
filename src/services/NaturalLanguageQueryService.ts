/**
 * 文件名: NaturalLanguageQueryService.ts
 * 描述: 自然语言查询服务
 * 功能: 
 * - 集成DeepSeek API提供自然语言数据查询功能
 * - 支持将自然语言问题转化为数据查询
 * - 提供查询结果的智能解释
 */

import DeepSeekService from './DeepSeekService';
import type { ProgressCallback } from './DeepSeekService';

// 查询类型枚举
export enum QueryType {
  TREND = 'trend',         // 趋势分析
  COMPARISON = 'comparison', // 比较分析
  ANOMALY = 'anomaly',      // 异常分析
  PREDICTION = 'prediction', // 预测分析
  RECOMMENDATION = 'recommendation', // 推荐分析
  GENERAL = 'general'      // 一般查询
}

// 查询上下文接口
export interface QueryContext {
  timeRange?: [Date, Date]; // 时间范围
  dataTypes?: string[];     // 数据类型
  metrics?: string[];       // 指标
  filters?: Record<string, any>; // 过滤条件
  location?: string;        // 地理位置
  previousQueries?: string[]; // 之前的查询
}

// 查询结果接口
export interface QueryResult {
  type: QueryType;          // 查询类型
  answer: string;           // 回答文本
  dataQuery?: string;       // 生成的数据查询
  visualizationType?: string; // 推荐可视化类型
  relatedMetrics?: string[]; // 相关指标
  confidence: number;       // 置信度
  sources?: string[];       // 数据来源
}

/**
 * 自然语言查询服务
 */
class NaturalLanguageQueryService {
  /**
   * 处理自然语言查询
   * @param query 用户查询文本
   * @param context 查询上下文
   * @param onProgress 进度回调
   * @returns 查询结果
   */
  static async processQuery(
    query: string, 
    context: QueryContext = {}, 
    onProgress?: ProgressCallback
  ): Promise<QueryResult> {
    // 分析查询类型
    const queryType = this.analyzeQueryType(query);
    
    // 构建提示信息
    const prompt = this.buildPrompt(query, context, queryType);
    
    try {
      // 调用DeepSeek API获取回答
      const response = await DeepSeekService.getAnalysisWithProgress(
        prompt,
        undefined, // 使用默认模型
        onProgress
      );
      
      // 解析响应
      return this.parseResponse(response, queryType);
    } catch (error) {
      console.error('自然语言查询失败:', error);
      
      // 生成错误结果
      return {
        type: queryType,
        answer: `抱歉，我无法处理您的查询。错误: ${error instanceof Error ? error.message : String(error)}`,
        confidence: 0,
      };
    }
  }

  /**
   * 分析查询类型
   * @param query 查询文本
   * @returns 查询类型
   */
  private static analyzeQueryType(query: string): QueryType {
    const lowerQuery = query.toLowerCase();
    
    // 趋势分析关键词
    if (lowerQuery.includes('趋势') || 
        lowerQuery.includes('变化') || 
        lowerQuery.includes('走势') ||
        lowerQuery.includes('发展') ||
        lowerQuery.includes('如何随着时间')) {
      return QueryType.TREND;
    }
    
    // 比较分析关键词
    if (lowerQuery.includes('比较') || 
        lowerQuery.includes('对比') || 
        lowerQuery.includes('差异') ||
        lowerQuery.includes('区别')) {
      return QueryType.COMPARISON;
    }
    
    // 异常分析关键词
    if (lowerQuery.includes('异常') || 
        lowerQuery.includes('不正常') || 
        lowerQuery.includes('问题') ||
        lowerQuery.includes('特殊') ||
        lowerQuery.includes('偏离')) {
      return QueryType.ANOMALY;
    }
    
    // 预测分析关键词
    if (lowerQuery.includes('预测') || 
        lowerQuery.includes('将来') || 
        lowerQuery.includes('未来') ||
        lowerQuery.includes('预估')) {
      return QueryType.PREDICTION;
    }
    
    // 推荐分析关键词
    if (lowerQuery.includes('推荐') || 
        lowerQuery.includes('建议') || 
        lowerQuery.includes('应该')) {
      return QueryType.RECOMMENDATION;
    }
    
    // 默认为一般查询
    return QueryType.GENERAL;
  }

  /**
   * 构建API提示
   * @param query 查询文本
   * @param context 查询上下文
   * @param queryType 查询类型
   * @returns 构建的提示文本
   */
  private static buildPrompt(query: string, context: QueryContext, queryType: QueryType): string {
    // 基础提示
    let prompt = `你是一个专业的数据分析师，擅长分析地理信息数据并提供有价值的见解。
请分析以下自然语言查询，提供专业的回答：

查询: ${query}
`;

    // 添加上下文信息
    if (context.timeRange) {
      prompt += `\n时间范围: ${context.timeRange[0].toLocaleDateString()} 至 ${context.timeRange[1].toLocaleDateString()}`;
    }
    
    if (context.dataTypes && context.dataTypes.length > 0) {
      prompt += `\n数据类型: ${context.dataTypes.join(', ')}`;
    }
    
    if (context.metrics && context.metrics.length > 0) {
      prompt += `\n相关指标: ${context.metrics.join(', ')}`;
    }
    
    if (context.location) {
      prompt += `\n地理位置: ${context.location}`;
    }
    
    // 根据查询类型添加特定指导
    switch (queryType) {
      case QueryType.TREND:
        prompt += `\n\n请分析数据趋势，包括变化模式、增长率或下降率、关键时间点，并给出可能的原因解释。`;
        break;
      case QueryType.COMPARISON:
        prompt += `\n\n请进行数据比较分析，找出关键差异、相似点，并解释可能的原因。`;
        break;
      case QueryType.ANOMALY:
        prompt += `\n\n请分析数据中的异常情况，指出异常点、偏离程度，并提供可能的原因和处理建议。`;
        break;
      case QueryType.PREDICTION:
        prompt += `\n\n请基于现有数据和趋势进行预测分析，给出未来可能的发展方向和关键影响因素。`;
        break;
      case QueryType.RECOMMENDATION:
        prompt += `\n\n请基于数据分析提供具体的建议和行动方案，包括优先级和预期效果。`;
        break;
    }
    
    // 添加输出指导
    prompt += `\n\n请以JSON格式输出你的回答，包括以下字段：
{
  "answer": "详细的回答文本，使用Markdown格式",
  "dataQuery": "可选，生成的数据查询语句或API调用示例",
  "visualizationType": "可选，推荐的数据可视化类型",
  "relatedMetrics": ["可选，相关的指标列表"],
  "confidence": 0.95 // 置信度，0-1之间的小数
}

确保你的回答专业、客观、有深度，并且适合在数据分析仪表盘中展示。`;

    return prompt;
  }

  /**
   * 解析API响应
   * @param response API响应文本
   * @param queryType 查询类型
   * @returns 解析后的查询结果
   */
  private static parseResponse(response: string, queryType: QueryType): QueryResult {
    try {
      // 尝试从文本中提取JSON
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                        response.match(/\{[\s\S]*"answer"[\s\S]*\}/);
      
      let resultJson = '';
      if (jsonMatch && jsonMatch[1]) {
        resultJson = jsonMatch[1];
      } else if (jsonMatch) {
        resultJson = jsonMatch[0];
      } else {
        // 如果没有找到JSON，尝试构建一个合理的结构
        return {
          type: queryType,
          answer: response,
          confidence: 0.7
        };
      }
      
      // 解析JSON
      const parsedResult = JSON.parse(resultJson);
      
      // 构建查询结果
      return {
        type: queryType,
        answer: parsedResult.answer || response,
        dataQuery: parsedResult.dataQuery,
        visualizationType: parsedResult.visualizationType,
        relatedMetrics: parsedResult.relatedMetrics,
        confidence: parsedResult.confidence || 0.7,
        sources: parsedResult.sources
      };
    } catch (error) {
      console.error('解析查询响应失败:', error);
      
      // 返回原始响应
      return {
        type: queryType,
        answer: response,
        confidence: 0.5
      };
    }
  }
}

// 导出服务类
export default NaturalLanguageQueryService; 