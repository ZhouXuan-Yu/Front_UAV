/**
 * 文件名: DeepSeekService.ts
 * 描述: DeepSeek API服务
 * 功能: 封装DeepSeek API调用，提供智能分析功能
 */

// DeepSeek API的配置
const DEEPSEEK_API_KEY = 'sk-e120c0aae8074a368d26fff5136a83fd';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 可选模型
enum DeepSeekModel {
  // DeepSeek V3通用模型
  V3 = 'deepseek-chat',
  // DeepSeek R1推理模型，专注于复杂推理任务
  R1 = 'deepseek-reasoner',
}

// 事件回调类型
export type ProgressCallback = (progress: number, message?: string) => void;
export type CompletionCallback = (result: string) => void;

// 请求状态
export enum RequestStatus {
  Pending = 'pending',
  InProgress = 'inProgress',
  Completed = 'completed',
  Failed = 'failed'
}

// 请求进度事件
interface ProgressEvent {
  status: RequestStatus;
  progress: number;
  message?: string;
}

/**
 * DeepSeek服务类，用于调用DeepSeek API获取智能分析
 */
class DeepSeekService {
  // 当前活跃请求的状态
  private static activeRequests: Map<string, ProgressEvent> = new Map();

  /**
   * 生成请求ID
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 模拟请求进度更新（真实场景应使用流式API或WebSocket）
   */
  private static simulateProgress(
    requestId: string,
    onProgress: ProgressCallback,
    totalTime: number = 5000
  ): NodeJS.Timeout {
    const steps = 10; // 进度步数
    const interval = totalTime / steps;
    let progress = 0;
    
    // 更新状态为进行中
    this.activeRequests.set(requestId, {
      status: RequestStatus.InProgress,
      progress: 0,
      message: '正在初始化请求...'
    });
    
    // 回调通知进度
    onProgress(0, '正在初始化请求...');
    
    // 创建定时器定期更新进度
    const timer = setInterval(() => {
      progress += (100 / steps);
      
      if (progress >= 100) {
        clearInterval(timer);
        progress = 99; // 保留最后一步给实际完成
        
        // 更新状态为即将完成
        this.activeRequests.set(requestId, {
          status: RequestStatus.InProgress,
          progress,
          message: '正在生成最终结果...'
        });
      } else {
        // 生成阶段性消息
        let message = '';
        if (progress < 30) {
          message = '正在分析数据...';
        } else if (progress < 60) {
          message = '正在生成见解...';
        } else if (progress < 90) {
          message = '正在优化结果...';
        } else {
          message = '即将完成...';
        }
        
        // 更新状态
        this.activeRequests.set(requestId, {
          status: RequestStatus.InProgress,
          progress,
          message
        });
      }
      
      // 调用进度回调
      onProgress(progress, this.activeRequests.get(requestId)?.message);
      
    }, interval);
    
    return timer;
  }

  /**
   * 获取请求状态
   * @param requestId 请求ID
   */
  static getRequestStatus(requestId: string): ProgressEvent | undefined {
    return this.activeRequests.get(requestId);
  }

  /**
   * 调用DeepSeek API获取智能分析，支持进度跟踪
   * @param prompt 用户提示
   * @param model 使用的模型（默认使用V3）
   * @param onProgress 进度回调函数
   * @param onCompletion 完成回调函数
   * @returns 请求ID，可用于跟踪请求状态
   */
  static async getAnalysisWithProgress(
    prompt: string, 
    model: DeepSeekModel = DeepSeekModel.V3,
    onProgress?: ProgressCallback,
    onCompletion?: CompletionCallback
  ): Promise<string> {
    // 生成请求ID
    const requestId = this.generateRequestId();
    
    // 设置初始状态
    this.activeRequests.set(requestId, {
      status: RequestStatus.Pending,
      progress: 0,
      message: '准备请求中...'
    });
    
    // 如果有进度回调，开始进度模拟
    let progressTimer: NodeJS.Timeout | null = null;
    if (onProgress) {
      progressTimer = this.simulateProgress(requestId, onProgress);
    }
    
    try {
      console.log(`调用DeepSeek API(${model})进行智能分析...`);
      
      // 发送实际请求
      const response = await fetch(DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的数据分析师，擅长分析各类数据并提供有价值的见解和建议。请使用Markdown格式组织回复。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      });

      // 处理响应
      const data = await response.json();
      
      // 清除进度模拟计时器
      if (progressTimer) {
        clearInterval(progressTimer);
      }
      
      let result = '';
      if (data.choices && data.choices.length > 0) {
        result = data.choices[0].message.content;
        
        // 更新状态为完成
        this.activeRequests.set(requestId, {
          status: RequestStatus.Completed,
          progress: 100,
          message: '分析已完成'
        });
        
        // 触发进度更新
        if (onProgress) {
          onProgress(100, '分析已完成');
        }
        
        // 触发完成回调
        if (onCompletion) {
          onCompletion(result);
        }
        
        return result;
      } else {
        console.error('DeepSeek API返回格式不正确:', data);
        result = '无法获取智能分析结果，请稍后再试';
        
        // 更新状态为失败
        this.activeRequests.set(requestId, {
          status: RequestStatus.Failed,
          progress: 0,
          message: '请求失败'
        });
        
        // 触发进度更新通知错误
        if (onProgress) {
          onProgress(0, '请求失败');
        }
        
        // 触发完成回调
        if (onCompletion) {
          onCompletion(result);
        }
        
        return result;
      }
    } catch (error) {
      console.error('调用DeepSeek API出错:', error);
      const errorMessage = `智能分析暂时不可用。错误: ${error instanceof Error ? error.message : String(error)}`;
      
      // 清除进度模拟计时器
      if (progressTimer) {
        clearInterval(progressTimer);
      }
      
      // 更新状态为失败
      this.activeRequests.set(requestId, {
        status: RequestStatus.Failed,
        progress: 0,
        message: errorMessage
      });
      
      // 触发进度更新通知错误
      if (onProgress) {
        onProgress(0, errorMessage);
      }
      
      // 触发完成回调
      if (onCompletion) {
        onCompletion(errorMessage);
      }
      
      return errorMessage;
    }
  }

  /**
   * 调用DeepSeek API获取智能分析（不带进度跟踪的旧版本方法）
   * @param prompt 用户提示
   * @param model 使用的模型（默认使用V3）
   * @returns 智能分析结果
   */
  static async getAnalysis(prompt: string, model: DeepSeekModel = DeepSeekModel.V3): Promise<string> {
    return this.getAnalysisWithProgress(prompt, model);
  }

  /**
   * 生成天气分析（使用V3模型）
   * @param weatherData 天气数据
   * @param onProgress 进度回调函数
   * @param onCompletion 完成回调函数
   * @returns 天气分析结果
   */
  static async generateWeatherAnalysis(
    weatherData: any,
    onProgress?: ProgressCallback,
    onCompletion?: CompletionCallback
  ): Promise<string> {
    if (!weatherData) {
      return '无法分析，天气数据不完整';
    }

    const prompt = `请分析以下天气数据并提供专业的天气分析和建议：
城市: ${weatherData.city}
天气: ${weatherData.weather}
温度: ${weatherData.temperature}°C
风向: ${weatherData.winddirection}
风力: ${weatherData.windpower}
湿度: ${weatherData.humidity}%
报告时间: ${weatherData.reporttime}

请提供:
1. 当前天气状况的简要分析
2. 适合的户外活动建议
3. 出行穿着建议
4. 对身体健康的影响和注意事项
5. 如果有恶劣天气，请提供安全预警

请使用Markdown格式组织回复。
`;

    return await this.getAnalysisWithProgress(prompt, DeepSeekModel.V3, onProgress, onCompletion);
  }

  /**
   * 生成天气预报分析（使用V3模型）
   * @param forecastData 天气预报数据
   * @param onProgress 进度回调函数
   * @param onCompletion 完成回调函数
   * @returns 天气预报分析结果
   */
  static async generateForecastAnalysis(
    forecastData: any,
    onProgress?: ProgressCallback,
    onCompletion?: CompletionCallback
  ): Promise<string> {
    if (!forecastData || !forecastData.casts || forecastData.casts.length === 0) {
      return '无法分析，天气预报数据不完整';
    }

    const castsData = forecastData.casts.map((cast: any, index: number) => {
      return `日期${index+1}: ${cast.date}
白天天气: ${cast.dayweather}, 温度: ${cast.daytemp}°C, 风向: ${cast.daywind}, 风力: ${cast.daypower}
夜间天气: ${cast.nightweather}, 温度: ${cast.nighttemp}°C, 风向: ${cast.nightwind}, 风力: ${cast.nightpower}`;
    }).join('\n\n');
    
    const prompt = `请分析以下天气预报数据并提供专业的分析和建议：
城市: ${forecastData.city}

${castsData}

请提供:
1. 未来天气趋势分析
2. 温度变化趋势分析
3. 适宜的户外活动安排建议
4. 是否有极端天气预警
5. 对旅行和出行的建议

请使用Markdown格式组织回复。
`;

    return await this.getAnalysisWithProgress(prompt, DeepSeekModel.V3, onProgress, onCompletion);
  }

  /**
   * 生成POI搜索智能分析（使用R1模型，更适合复杂推理）
   * @param poiData POI数据
   * @param onProgress 进度回调函数
   * @param onCompletion 完成回调函数
   * @returns POI智能分析结果
   */
  static async generatePOIAnalysis(
    poiData: any[],
    onProgress?: ProgressCallback,
    onCompletion?: CompletionCallback
  ): Promise<string> {
    if (!poiData || poiData.length === 0) {
      return '无法分析，POI数据不完整';
    }

    // 提取POI信息
    const poiSummary = poiData.slice(0, 5).map((poi, index) => {
      return `${index+1}. 名称: ${poi.name}
   地址: ${poi.address || '无地址信息'}
   类型: ${poi.type || '未知类型'}
   区域: ${poi.adname || '未知区域'}`;
    }).join('\n\n');

    const prompt = `请作为地理信息分析专家，分析以下兴趣点(POI)数据，并提供专业的见解和建议：

搜索关键词: ${poiData[0].type.split(';')[0]}
找到结果数量: ${poiData.length}
城市: ${poiData[0].cityname || '未知城市'}

部分POI数据示例:
${poiSummary}

请提供:
1. 对这类POI的整体分布特点分析
2. 该区域内此类POI的特点和品质分析
3. 最佳访问建议(时段、交通方式等)
4. 对周边配套设施的分析
5. 如果是商业场所，提供消费水平估计和人流量分析

请使用Markdown格式组织回复。
`;

    return await this.getAnalysisWithProgress(prompt, DeepSeekModel.R1, onProgress, onCompletion);
  }

  /**
   * 生成交通态势分析（使用V3模型）
   * @param trafficData 交通数据
   * @param rectangle 矩形区域
   * @param onProgress 进度回调函数
   * @param onCompletion 完成回调函数
   * @returns 交通态势分析结果
   */
  static async generateTrafficAnalysis(
    trafficData: any, 
    rectangle: string,
    onProgress?: ProgressCallback,
    onCompletion?: CompletionCallback
  ): Promise<string> {
    if (!trafficData) {
      return '无法分析，交通数据不完整';
    }

    const prompt = `请作为交通分析专家，分析以下交通态势数据，并提供专业的见解和建议：

查询区域: ${rectangle}
路况状态: ${trafficData.status === '0' ? '拥堵' : (trafficData.status === '1' ? '缓行' : '畅通')}
描述: ${trafficData.description || '无描述'}
评估时间: ${trafficData.evaluation_time || new Date().toISOString()}

请提供:
1. 当前路况的整体评估
2. 出行建议和最佳出行时间
3. 可能的拥堵原因分析
4. 预计未来几小时路况走势
5. 对不同交通方式的建议(私家车、公共交通等)

请使用Markdown格式组织回复。
`;

    return await this.getAnalysisWithProgress(prompt, DeepSeekModel.V3, onProgress, onCompletion);
  }
}

export default DeepSeekService; 