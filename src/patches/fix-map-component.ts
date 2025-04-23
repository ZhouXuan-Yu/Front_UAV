/**
 * 修复地图组件相关功能的补丁文件
 * 用于解决clearAllMapPoints函数引用问题，提供类型定义以及辅助函数
 */

// 点位坐标类型定义
export interface Point {
  lng: number;
  lat: number;
}

// 全局声明，为Window添加地图相关属性
declare global {
  interface Window {
    map: any; // 地图实例
    AMap: any; // 高德地图API对象
    droneMarker: any; // 无人机标记
    polygons: any[]; // 多边形集合
    markers: any[]; // 标记点集合
  }
}

/**
 * 清除地图上所有点位标记和多边形
 * 在组件销毁或重新初始化前调用，防止内存泄漏
 */
export function clearAllMapPoints(): void {
  try {
    // 检查地图实例是否存在
    if (!window.map) {
      console.warn('地图实例不存在，无法清除点位');
      return;
    }

    // 清除无人机标记
    if (window.droneMarker) {
      window.map.remove(window.droneMarker);
      window.droneMarker = null;
    }

    // 清除所有多边形
    if (window.polygons && window.polygons.length > 0) {
      window.map.remove(window.polygons);
      window.polygons = [];
    }

    // 清除所有标记点
    if (window.markers && window.markers.length > 0) {
      window.map.remove(window.markers);
      window.markers = [];
    }

    console.log('成功清除地图上所有点位和多边形');
  } catch (error) {
    console.error('清除地图点位时发生错误:', error);
  }
}

/**
 * 绘制测试点位
 * 用于调试地图功能，在地图上随机生成点位并连接成多边形
 * @param centerPoint 中心点坐标
 * @param count 生成点位的数量
 * @param radius 点位分布半径（米）
 */
export function drawTestPoints(centerPoint: Point, count: number = 5, radius: number = 1000): void {
  try {
    if (!window.map || !window.AMap) {
      console.error('地图或AMap API未加载，无法绘制测试点位');
      return;
    }

    // 生成随机点位
    const points: Point[] = [];
    for (let i = 0; i < count; i++) {
      // 随机角度和距离
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      
      // 根据角度和距离计算偏移量
      const deltaLng = distance * Math.cos(angle) / 111000 * Math.cos(centerPoint.lat * Math.PI / 180);
      const deltaLat = distance * Math.sin(angle) / 111000;
      
      // 添加到点位数组
      points.push({
        lng: centerPoint.lng + deltaLng,
        lat: centerPoint.lat + deltaLat
      });
    }

    // 清除现有点位
    if (!window.markers) window.markers = [];
    if (!window.polygons) window.polygons = [];
    
    // 清除现有点位和多边形
    clearAllMapPoints();

    // 创建标记点
    const markers = points.map(point => {
      return new window.AMap.Marker({
        position: [point.lng, point.lat],
        icon: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
        offset: new window.AMap.Pixel(-13, -30)
      });
    });
    
    // 添加标记点到地图
    window.map.add(markers);
    window.markers = markers;

    // 如果点位数量足够，创建并添加多边形
    if (points.length >= 3) {
      const path = points.map(point => [point.lng, point.lat]);
      const polygon = new window.AMap.Polygon({
        path: path,
        strokeColor: '#3366FF',
        strokeWeight: 3,
        strokeOpacity: 0.8,
        fillColor: '#99CCFF',
        fillOpacity: 0.5
      });
      
      window.map.add(polygon);
      window.polygons = [polygon];
    }
    
    console.log('成功绘制测试点位，共', points.length, '个点位');
  } catch (error) {
    console.error('绘制测试点位时发生错误:', error);
  }
} 