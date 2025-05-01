/**
 * 设备类型定义
 */

// 设备类型枚举
export type DeviceType = 
  | 'camera'            // 标准摄像头
  | 'license-plate'     // 车牌识别
  | 'person-detection'  // 人物识别
  | 'wildfire'          // 火灾监测
  | 'night-street'      // 夜间街道巡视
  | 'night-vehicle'     // 夜间车辆检测
  | 'long-distance'     // 远距离监控
  | null;               // 所有设备

// 设备状态类型
export type DeviceStatus = 
  | 'normal'    // 正常
  | 'warning'   // 警告
  | 'critical'  // 危险
  | 'offline'   // 离线
  | 'alert';    // 告警（UI组件专用）

// 监控设备接口定义
export interface MonitoringDevice {
  id: string;
  name: string;
  type: DeviceType;
  health: number;
  temperature?: number;
  batteryLevel?: number;
  signalStrength?: number;
  location: string;
  status: DeviceStatus;
  lastMaintenance?: string;
  details?: string;
} 