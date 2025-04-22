/**
 * 文件名: DroneService.ts
 * 描述: 无人机服务管理模块
 * 在项目中的作用: 
 * - 管理无人机的遥测数据和状态信息
 * - 提供无人机任务调度和路径规划功能
 * - 实现无人机模拟飞行和数据更新
 * - 支持无人机实时监控和控制操作
 */

import { ref, reactive, computed } from 'vue';
import type { GeoCoordinate, DroneInfo } from './GeoApiService';

// 无人机遥测数据接口
export interface DroneTelemetry {
  timestamp: number;
  position: GeoCoordinate;
  altitude: number;
  speed: number;
  heading: number;
  batteryLevel: number;
  signalStrength: number;
  temperature: {
    battery: number;
    motors: number;
    cpu: number;
  };
  gimbalAngle: number;
  cameraZoom: number;
  accelerometer: { x: number, y: number, z: number };
  gyroscope: { x: number, y: number, z: number };
}

// 无人机任务接口
export interface DroneTask {
  id: string;
  name: string;
  type: 'mapping' | 'inspection' | 'patrol' | 'delivery' | 'custom';
  status: 'queued' | 'active' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  waypoints: GeoCoordinate[];
  startTime: number;
  endTime?: number;
  createdBy: string;
}

// 无人机状态存储
const droneStore = reactive<{
  drones: Map<string, DroneInfo>;
  telemetry: Map<string, DroneTelemetry>;
  tasks: Map<string, DroneTask>;
  flightPaths: Map<string, GeoCoordinate[]>;
  activeDroneId: string | null;
  isSimulationActive: boolean;
  simulationTimerId: number | null;
}>({
  drones: new Map(),
  telemetry: new Map(),
  tasks: new Map(),
  flightPaths: new Map(),
  activeDroneId: null,
  isSimulationActive: false,
  simulationTimerId: null,
});

// 示例无人机配置
const demoConfig = {
  droneCount: 5,
  updateInterval: 1000,
  simulationSpeed: 1,
  failureRate: 0.02, // 2% 故障几率
  batteryDrainRate: 0.05, // 电池每分钟下降百分比
  baseCoordinates: { lng: 116.397428, lat: 39.90923 }, // 北京市中心
};

/**
 * 初始化无人机数据
 */
const initializeDrones = () => {
  // 清除现有数据
  droneStore.drones.clear();
  droneStore.telemetry.clear();
  droneStore.tasks.clear();
  droneStore.flightPaths.clear();
  
  // 创建示例无人机
  for (let i = 1; i <= demoConfig.droneCount; i++) {
    const droneId = `drone-${i.toString().padStart(2, '0')}`;
    const droneName = `Skydio ${i === 1 ? 'X10' : i === 2 ? 'R1' : 'S2'}`;
    
    // 随机位置（在基准点附近）
    const position = {
      lng: demoConfig.baseCoordinates.lng + (Math.random() - 0.5) * 0.05,
      lat: demoConfig.baseCoordinates.lat + (Math.random() - 0.5) * 0.05,
    };
    
    // 无人机基本信息
    const drone: DroneInfo = {
      id: droneId,
      name: droneName,
      position,
      altitude: 50 + Math.random() * 50, // 50-100米
      batteryLevel: 70 + Math.random() * 30, // 70-100%
      signalStrength: 80 + Math.random() * 20, // 80-100%
      speed: Math.random() * 10, // 0-10米/秒
      heading: Math.random() * 360, // 0-360度
      status: Math.random() > 0.2 ? 'mission' : 'idle',
    };
    
    // 详细遥测数据
    const telemetry: DroneTelemetry = {
      timestamp: Date.now(),
      position,
      altitude: drone.altitude,
      speed: drone.speed,
      heading: drone.heading,
      batteryLevel: drone.batteryLevel,
      signalStrength: drone.signalStrength,
      temperature: {
        battery: 25 + Math.random() * 10, // 25-35℃
        motors: 30 + Math.random() * 15, // 30-45℃
        cpu: 35 + Math.random() * 15, // 35-50℃
      },
      gimbalAngle: -30 + Math.random() * 60, // -30 - +30度
      cameraZoom: 1 + Math.random() * 4, // 1-5倍
      accelerometer: { 
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        z: 9.8 + (Math.random() - 0.5) * 0.2, // 重力加速度附近波动
      },
      gyroscope: { 
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
        z: (Math.random() - 0.5) * 0.5,
      },
    };
    
    // 创建随机任务（只有部分无人机有任务）
    if (Math.random() > 0.3) {
      const taskTypes = ['mapping', 'inspection', 'patrol', 'delivery', 'custom'] as const;
      const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
      
      // 创建随机路径点（2-5个点）
      const waypointCount = 2 + Math.floor(Math.random() * 4);
      const waypoints: GeoCoordinate[] = [{...position}]; // 起点是当前位置
      
      for (let j = 1; j < waypointCount; j++) {
        waypoints.push({
          lng: position.lng + (Math.random() - 0.5) * 0.02,
          lat: position.lat + (Math.random() - 0.5) * 0.02,
        });
      }
      
      const task: DroneTask = {
        id: `task-${droneId}-${Date.now()}`,
        name: `${taskType[0].toUpperCase() + taskType.slice(1)} Mission`,
        type: taskType,
        status: 'active',
        progress: Math.random() * 100,
        waypoints,
        startTime: Date.now() - Math.random() * 3600000, // 开始于1小时内的随机时间
        createdBy: 'admin',
      };
      
      droneStore.tasks.set(droneId, task);
      droneStore.flightPaths.set(droneId, [...waypoints]); // 复制路径点
    } else {
      // 没有任务的无人机也创建一个简单的飞行路径（历史轨迹）
      const pathPoints: GeoCoordinate[] = [{...position}];
      for (let j = 0; j < 5; j++) {
        pathPoints.push({
          lng: position.lng + (Math.random() - 0.5) * 0.01 * (j + 1),
          lat: position.lat + (Math.random() - 0.5) * 0.01 * (j + 1),
        });
      }
      droneStore.flightPaths.set(droneId, pathPoints);
    }
    
    // 保存无人机数据
    droneStore.drones.set(droneId, drone);
    droneStore.telemetry.set(droneId, telemetry);
  }
  
  // 设置第一个无人机为激活状态
  if (droneStore.drones.size > 0) {
    droneStore.activeDroneId = 'drone-01';
  }
};

/**
 * 更新无人机模拟数据
 */
const updateDroneSimulation = () => {
  droneStore.drones.forEach((drone, droneId) => {
    // 获取现有遥测数据和路径
    const telemetry = droneStore.telemetry.get(droneId);
    const flightPath = droneStore.flightPaths.get(droneId);
    const task = droneStore.tasks.get(droneId);
    
    if (!telemetry || !flightPath) return;
    
    // 更新时间戳
    telemetry.timestamp = Date.now();
    
    // 随机波动信号强度 (±2%)
    telemetry.signalStrength = Math.max(0, Math.min(100, 
      telemetry.signalStrength + (Math.random() - 0.5) * 4
    ));
    drone.signalStrength = telemetry.signalStrength;
    
    // 更新电池电量（电池消耗）
    const batteryDrain = demoConfig.batteryDrainRate * (demoConfig.updateInterval / 60000) * demoConfig.simulationSpeed;
    telemetry.batteryLevel = Math.max(0, telemetry.batteryLevel - batteryDrain);
    drone.batteryLevel = telemetry.batteryLevel;
    
    // 更新任务进度
    if (task && task.status === 'active') {
      task.progress = Math.min(100, task.progress + Math.random() * 2 * demoConfig.simulationSpeed);
      if (task.progress >= 100) {
        task.status = 'completed';
        task.endTime = Date.now();
      }
    }
    
    // 模拟故障（随机出现）
    if (drone.status !== 'warning' && Math.random() < demoConfig.failureRate * demoConfig.simulationSpeed / 10) {
      drone.status = 'warning';
      // 随机选择故障类型（温度上升、信号下降等）
      const failureType = Math.floor(Math.random() * 3);
      switch (failureType) {
        case 0: // 温度上升
          telemetry.temperature.battery += 15;
          telemetry.temperature.motors += 20;
          break;
        case 1: // 信号下降
          telemetry.signalStrength *= 0.5;
          drone.signalStrength = telemetry.signalStrength;
          break;
        case 2: // 电池急速放电
          telemetry.batteryLevel *= 0.8;
          drone.batteryLevel = telemetry.batteryLevel;
          break;
      }
    }
    
    // 低电量状态检查
    if (telemetry.batteryLevel < 20 && drone.status !== 'warning') {
      drone.status = 'returning';
    }
    
    // 电量耗尽检查
    if (telemetry.batteryLevel < 5) {
      drone.status = 'offline';
      if (droneStore.simulationTimerId && Math.random() > 0.5) {
        // 模拟随机恢复
        setTimeout(() => {
          if (drone && droneStore.drones.has(droneId)) {
            drone.status = 'idle';
            telemetry.batteryLevel = 100;
            drone.batteryLevel = 100;
          }
        }, 30000 + Math.random() * 60000); // 30-90秒后恢复
      }
      return;
    }
    
    // 如果无人机处于活动状态，更新位置
    if (drone.status === 'mission' || drone.status === 'returning') {
      // 找到下一个航点
      const currentPath = [...flightPath]; // 复制路径防止修改原始数据
      const currentPoint = { ...telemetry.position };
      
      if (drone.status === 'returning' && currentPath.length > 0) {
        // 返回时使用起点
        const home = currentPath[0];
        // 如果接近起点，则完成返回
        const distance = calculateDistance(currentPoint, home);
        if (distance < 0.0001) { // 非常接近起点
          drone.status = 'idle';
          drone.speed = 0;
          telemetry.speed = 0;
        } else {
          // 朝向起点移动
          moveTowardsPoint(telemetry, drone, home);
        }
      } else if (currentPath.length > 1) {
        // 正常任务模式，向下一个点移动
        let targetIndex = 1; // 默认目标是第二个点（第一个点是起点）
        
        // 寻找尚未到达的最近点
        for (let i = 1; i < currentPath.length; i++) {
          const pointDistance = calculateDistance(currentPoint, currentPath[i]);
          // 如果已经接近此点，则目标变为下一点
          if (pointDistance < 0.0001) {
            targetIndex = Math.min(i + 1, currentPath.length - 1);
          }
        }
        
        // 移动朝向目标点
        moveTowardsPoint(telemetry, drone, currentPath[targetIndex]);
        
        // 如果到达最后一个点，完成任务
        if (targetIndex === currentPath.length - 1 && 
            calculateDistance(currentPoint, currentPath[targetIndex]) < 0.0001) {
          // 开始返回
          drone.status = 'returning';
        }
      }
    } else {
      // 非飞行状态，速度为0
      drone.speed = 0;
      telemetry.speed = 0;
    }
    
    // 更新其他传感器数据的随机波动
    telemetry.temperature.battery += (Math.random() - 0.5) * 0.5;
    telemetry.temperature.motors += (Math.random() - 0.5) * 0.7;
    telemetry.temperature.cpu += (Math.random() - 0.5) * 0.6;
    
    telemetry.gimbalAngle += (Math.random() - 0.5) * 2;
    telemetry.gimbalAngle = Math.max(-90, Math.min(30, telemetry.gimbalAngle));
    
    telemetry.accelerometer.x += (Math.random() - 0.5) * 0.1;
    telemetry.accelerometer.y += (Math.random() - 0.5) * 0.1;
    telemetry.accelerometer.z = 9.8 + (Math.random() - 0.5) * 0.1; // 重力加速度附近
    
    telemetry.gyroscope.x += (Math.random() - 0.5) * 0.1;
    telemetry.gyroscope.y += (Math.random() - 0.5) * 0.1;
    telemetry.gyroscope.z += (Math.random() - 0.5) * 0.1;
  });
};

/**
 * 辅助函数：计算两点之间的距离
 */
const calculateDistance = (point1: GeoCoordinate, point2: GeoCoordinate): number => {
  const dx = point2.lng - point1.lng;
  const dy = point2.lat - point1.lat;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * 辅助函数：将无人机向指定点移动
 */
const moveTowardsPoint = (telemetry: DroneTelemetry, drone: DroneInfo, target: GeoCoordinate) => {
  const start = telemetry.position;
  const distance = calculateDistance(start, target);
  
  // 计算方向角度
  const angle = Math.atan2(target.lat - start.lat, target.lng - start.lng);
  drone.heading = angle * (180 / Math.PI);
  telemetry.heading = drone.heading;
  
  // 设置速度（根据距离调整，接近目标时减速）
  const baseSpeed = 5 + Math.random() * 3; // 基础速度5-8米/秒
  drone.speed = Math.min(baseSpeed, baseSpeed * distance * 1000); // 距离越近，速度越低
  telemetry.speed = drone.speed;
  
  // 移动距离（根据速度、更新间隔和模拟速度）
  const moveDistance = (drone.speed / 100000) * (demoConfig.updateInterval / 1000) * demoConfig.simulationSpeed;
  const moveRatio = distance === 0 ? 0 : Math.min(1, moveDistance / distance);
  
  // 计算新位置
  telemetry.position = {
    lng: start.lng + (target.lng - start.lng) * moveRatio,
    lat: start.lat + (target.lat - start.lat) * moveRatio
  };
  drone.position = { ...telemetry.position };
  
  // 随机调整高度
  telemetry.altitude += (Math.random() - 0.5) * 2;
  telemetry.altitude = Math.max(10, Math.min(120, telemetry.altitude)); // 保持在10-120米范围
  drone.altitude = telemetry.altitude;
};

// 公开的服务方法
const DroneService = {
  /**
   * 初始化服务
   */
  init() {
    initializeDrones();
    return this;
  },
  
  /**
   * 开始数据模拟
   */
  startSimulation() {
    if (droneStore.isSimulationActive) return;
    
    droneStore.isSimulationActive = true;
    droneStore.simulationTimerId = window.setInterval(() => {
      updateDroneSimulation();
    }, demoConfig.updateInterval);
    
    return this;
  },
  
  /**
   * 停止数据模拟
   */
  stopSimulation() {
    if (droneStore.simulationTimerId !== null) {
      window.clearInterval(droneStore.simulationTimerId);
      droneStore.simulationTimerId = null;
    }
    droneStore.isSimulationActive = false;
    
    return this;
  },
  
  /**
   * 获取所有无人机
   */
  getDrones() {
    return Array.from(droneStore.drones.values());
  },
  
  /**
   * 获取特定无人机信息
   */
  getDrone(droneId: string) {
    return droneStore.drones.get(droneId);
  },
  
  /**
   * 获取特定无人机遥测数据
   */
  getTelemetry(droneId: string) {
    return droneStore.telemetry.get(droneId);
  },
  
  /**
   * 获取特定无人机任务
   */
  getTask(droneId: string) {
    return droneStore.tasks.get(droneId);
  },
  
  /**
   * 获取特定无人机飞行路径
   */
  getFlightPath(droneId: string) {
    return droneStore.flightPaths.get(droneId) || [];
  },
  
  /**
   * 设置活动无人机
   */
  setActiveDrone(droneId: string) {
    if (droneStore.drones.has(droneId)) {
      droneStore.activeDroneId = droneId;
      return true;
    }
    return false;
  },
  
  /**
   * 获取活动无人机ID
   */
  getActiveDroneId() {
    return droneStore.activeDroneId;
  },
  
  /**
   * 获取活动无人机数据
   */
  getActiveDrone() {
    return droneStore.activeDroneId ? 
      droneStore.drones.get(droneStore.activeDroneId) : null;
  },
  
  /**
   * 获取活动无人机遥测数据
   */
  getActiveTelemetry() {
    return droneStore.activeDroneId ? 
      droneStore.telemetry.get(droneStore.activeDroneId) : null;
  },
  
  /**
   * 设置模拟速度
   */
  setSimulationSpeed(speed: number) {
    demoConfig.simulationSpeed = Math.max(0.1, Math.min(5, speed));
    return demoConfig.simulationSpeed;
  },
  
  /**
   * 设置模拟故障率
   */
  setFailureRate(rate: number) {
    demoConfig.failureRate = Math.max(0, Math.min(0.5, rate));
    return demoConfig.failureRate;
  },
  
  /**
   * 重置所有无人机
   */
  resetAllDrones() {
    this.stopSimulation();
    initializeDrones();
    this.startSimulation();
    return this;
  },
  
  /**
   * 派遣无人机执行任务
   */
  dispatchDrone(droneId: string, taskType: DroneTask['type'], waypoints: GeoCoordinate[]) {
    const drone = droneStore.drones.get(droneId);
    if (!drone) return false;
    
    // 设置无人机为任务状态
    drone.status = 'mission';
    
    // 创建新任务
    const newTask: DroneTask = {
      id: `task-${droneId}-${Date.now()}`,
      name: `${taskType[0].toUpperCase() + taskType.slice(1)} Mission`,
      type: taskType,
      status: 'active',
      progress: 0,
      waypoints: [drone.position, ...waypoints], // 添加当前位置作为起点
      startTime: Date.now(),
      createdBy: 'user',
    };
    
    // 更新任务和路径
    droneStore.tasks.set(droneId, newTask);
    droneStore.flightPaths.set(droneId, [...newTask.waypoints]);
    
    return true;
  },
  
  /**
   * 召回无人机
   */
  recallDrone(droneId: string) {
    const drone = droneStore.drones.get(droneId);
    if (!drone || drone.status === 'offline') return false;
    
    drone.status = 'returning';
    const task = droneStore.tasks.get(droneId);
    if (task && task.status === 'active') {
      task.status = 'cancelled';
    }
    
    return true;
  }
};

// 导出服务单例
export default DroneService; 