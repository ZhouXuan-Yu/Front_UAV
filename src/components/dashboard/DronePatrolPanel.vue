/**
 * 文件名: DronePatrolPanel.vue
 * 描述: 无人机巡逻面板组件
 * 在项目中的作用: 
 * - 提供无人机巡逻任务的创建和管理界面
 * - 支持地点选择、天气查询和无人机智能推荐
 * - 实现任务目标设定和区域选择功能
 * - 模拟多架无人机的巡逻行为和状态展示
 */

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import MapComponent from './MapComponent.vue';

// 定义坐标点接口
interface GeoCoordinate {
  lng: number;
  lat: number;
}

// 定义无人机信息接口
interface DroneInfo {
  id: string;
  name: string;
  type: string;
  model: string;
  batteryLevel: number;
  signalStrength: number;
  maxSpeed: number;
  maxAltitude: number;
  operationRadius: number;
  payload: string;
  available: boolean;
  status: 'idle' | 'active' | 'returning' | 'charging' | 'maintenance';
  position?: GeoCoordinate;
  suitable: string[];
}

// 定义任务类型
type TaskType = '交通监控' | '火灾检测' | '夜间检测' | '人群监控' | '区域巡检' | '定点监控';

// 定义天气信息接口
interface WeatherInfo {
  city: string;
  temperature: string;
  weather: string;
  humidity: string;
  windDirection: string;
  windPower: string;
  updateTime: string;
}

// 定义任务状态
const taskStatus = ref<'setup' | 'location' | 'weather' | 'drone' | 'mission' | 'area' | 'running'>('setup');

// 当前位置信息
const locationInfo = ref({
  name: '',
  address: '',
  position: { lng: 116.397428, lat: 39.90923 }
});

// 任务信息
const missionInfo = ref({
  id: '',
  name: '',
  type: '区域巡检' as TaskType,
  startTime: '',
  duration: 60, // 分钟
  created: false,
  area: [] as GeoCoordinate[],
  selectedDrones: [] as string[]
});

// 天气信息
const weatherInfo = ref<WeatherInfo>({
  city: '',
  temperature: '',
  weather: '',
  humidity: '',
  windDirection: '',
  windPower: '',
  updateTime: ''
});

// AI智能推荐
const aiRecommendation = ref({
  content: '',
  loading: false,
  droneIds: [] as string[]
});

// 初始化无人机列表
const droneList = ref<DroneInfo[]>([
  {
    id: 'DRN-X10-001',
    name: '侦察无人机 X10',
    type: '侦察型',
    model: 'X10-Pro',
    batteryLevel: 92,
    signalStrength: 95,
    maxSpeed: 65,
    maxAltitude: 5000,
    operationRadius: 8,
    payload: '4K摄像头,热成像仪',
    available: true,
    status: 'idle',
    suitable: ['交通监控', '火灾检测', '区域巡检']
  },
  {
    id: 'DRN-S20-002',
    name: '监控无人机 S20',
    type: '监控型',
    model: 'S20-Ultra',
    batteryLevel: 85,
    signalStrength: 89,
    maxSpeed: 45,
    maxAltitude: 3000,
    operationRadius: 5,
    payload: '高清摄像头,信号增强器',
    available: true,
    status: 'idle',
    suitable: ['交通监控', '人群监控', '定点监控']
  },
  {
    id: 'DRN-N15-003',
    name: '夜视无人机 N15',
    type: '夜视型',
    model: 'N15-Night',
    batteryLevel: 78,
    signalStrength: 82,
    maxSpeed: 50,
    maxAltitude: 4000,
    operationRadius: 6,
    payload: '红外摄像头,夜视设备',
    available: true,
    status: 'idle',
    suitable: ['夜间检测', '区域巡检', '定点监控']
  },
  {
    id: 'DRN-F30-004',
    name: '消防无人机 F30',
    type: '消防型',
    model: 'F30-Fire',
    batteryLevel: 95,
    signalStrength: 92,
    maxSpeed: 55,
    maxAltitude: 4500,
    operationRadius: 7,
    payload: '热感应器,防火材料',
    available: true,
    status: 'idle',
    suitable: ['火灾检测', '区域巡检']
  },
  {
    id: 'DRN-W25-005',
    name: '水域无人机 W25',
    type: '水域型',
    model: 'W25-Aqua',
    batteryLevel: 88,
    signalStrength: 86,
    maxSpeed: 40,
    maxAltitude: 2500,
    operationRadius: 8,
    payload: '防水摄像机,水位传感器',
    available: true,
    status: 'idle',
    suitable: ['夜间检测', '区域巡检']
  }
]);

// 生成剩余的15架无人机数据
for (let i = 6; i <= 20; i++) {
  const id = i.toString().padStart(3, '0');
  const type = ['侦察型', '监控型', '夜视型', '消防型', '水域型'][Math.floor(Math.random() * 5)];
  let name, model, payload, suitable;
  
  switch (type) {
    case '侦察型':
      name = `侦察无人机 X${i}`;
      model = `X${i}-Pro`;
      payload = '4K摄像头,热成像仪';
      suitable = ['交通监控', '火灾检测', '区域巡检'];
      break;
    case '监控型':
      name = `监控无人机 S${i}`;
      model = `S${i}-Ultra`;
      payload = '高清摄像头,信号增强器';
      suitable = ['交通监控', '人群监控', '定点监控'];
      break;
    case '夜视型':
      name = `夜视无人机 N${i}`;
      model = `N${i}-Night`;
      payload = '红外摄像头,夜视设备';
      suitable = ['夜间检测', '区域巡检', '定点监控'];
      break;
    case '消防型':
      name = `消防无人机 F${i}`;
      model = `F${i}-Fire`;
      payload = '热感应器,防火材料';
      suitable = ['火灾检测', '区域巡检'];
      break;
    case '水域型':
      name = `水域无人机 W${i}`;
      model = `W${i}-Aqua`;
      payload = '防水摄像机,水位传感器';
      suitable = ['夜间检测', '区域巡检'];
      break;
    default:
      name = `多用途无人机 M${i}`;
      model = `M${i}`;
      payload = '通用摄像头,多功能设备';
      suitable = ['区域巡检', '定点监控'];
  }
  
  droneList.value.push({
    id: `DRN-${model}-${id}`,
    name,
    type,
    model,
    batteryLevel: 60 + Math.floor(Math.random() * 40),
    signalStrength: 70 + Math.floor(Math.random() * 30),
    maxSpeed: 35 + Math.floor(Math.random() * 35),
    maxAltitude: 2000 + Math.floor(Math.random() * 3000),
    operationRadius: 4 + Math.floor(Math.random() * 6),
    payload,
    available: Math.random() > 0.2, // 80% 的概率为可用
    status: Math.random() > 0.3 ? 'idle' : ['charging', 'maintenance'][Math.floor(Math.random() * 2)] as 'idle' | 'charging' | 'maintenance',
    suitable
  });
}

// 地图相关状态
const mapInstance = ref<InstanceType<typeof MapComponent> | null>(null);
const isDrawing = ref(false);
const drawingPolygon = ref<GeoCoordinate[]>([]);

// 视频监控相关状态
const showVideoMonitoring = ref(false);
const monitoringDroneId = ref<string | null>(null);

// 模拟无人机视频数据
const droneVideoStreams = computed(() => {
  return droneList.value
    .filter(drone => drone.status === 'active' && missionInfo.value.selectedDrones.includes(drone.id))
    .map(drone => {
      // 根据无人机类型选择适合的视频类型
      let videoType: string = 'normal';
      
      if (drone.type === '消防型') {
        videoType = 'wildfire';
      } else if (drone.type === '水域型') {
        videoType = 'night-street';
      } else if (drone.type === '侦察型') {
        videoType = 'night-vehicle';
      } else if (drone.type === '监控型') {
        videoType = 'long-distance';
      }
      
      return {
        id: drone.id,
        name: drone.name,
        videoType,
        location: locationInfo.value.name,
        status: 'online',
        alertLevel: Math.random() < 0.2 ? 'warning' : (Math.random() < 0.1 ? 'critical' : 'normal'),
        imageUrl: getVideoImageUrl(videoType)
      };
    });
});

// 根据视频类型获取模拟图片URL
const getVideoImageUrl = (type: string): string => {
  switch (type) {
    case 'wildfire':
      return 'https://ext.same-assets.com/913537297/145035404.jpeg';
    case 'night-street':
      return 'https://ext.same-assets.com/913537297/145035404.jpeg';
    case 'night-vehicle':
      return 'https://ext.same-assets.com/913537297/1121177740.png';
    case 'long-distance':
      return 'https://ext.same-assets.com/913537297/1124492884.jpeg';
    default:
      return 'https://ext.same-assets.com/913537297/1124492884.jpeg';
  }
};

// 切换视频监控显示
const toggleVideoMonitoring = () => {
  showVideoMonitoring.value = !showVideoMonitoring.value;
};

// 选择要监控的无人机
const selectDroneForMonitoring = (droneId: string) => {
  monitoringDroneId.value = droneId;
  showVideoMonitoring.value = true;
};

// 获取视频类型标题
const getVideoTypeTitle = (type: string): string => {
  switch (type) {
    case 'normal':
      return '标准监控';
    case 'license-plate':
      return '车牌识别';
    case 'person-detection':
      return '人物识别';
    case 'wildfire':
      return '森林火灾监测';
    case 'night-street':
      return '夜间街道巡视';
    case 'night-vehicle':
      return '夜间车辆检测';
    case 'long-distance':
      return '远距离监控';
    default:
      return '标准监控';
  }
};

// 获取告警级别颜色
const getAlertLevelColor = (level: string): string => {
  switch (level) {
    case 'normal':
      return '#4CAF50';
    case 'warning':
      return '#FF9800';
    case 'critical':
      return '#F44336';
    default:
      return '#4CAF50';
  }
};

// 获取任务编号
const generateTaskId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `DP-${year}${month}${day}-${hours}${minutes}-${random}`;
};

// 开始任务设置
const startTaskSetup = () => {
  missionInfo.value.id = generateTaskId();
  missionInfo.value.name = `巡逻任务 ${new Date().toLocaleDateString()}`;
  missionInfo.value.startTime = new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().split(' ')[0].substring(0, 5);
  taskStatus.value = 'location';
};

// 选择地点
const selectLocation = () => {
  if (mapInstance.value) {
    try {
      // 获取当前地图中心点作为选择的位置
      const mapInst = mapInstance.value;
      const center = mapInst.$el.querySelector('#amap-container');
      
      if ((window as any).AMap) {
        // 设置默认位置
        locationInfo.value = {
          name: '北京市',
          address: '北京市朝阳区',
          position: { lng: 116.397428, lat: 39.90923 }
        };
        
        try {
          // 尝试获取地图中心点
          const mapDiv = document.getElementById('amap-container');
          if (mapDiv && (window as any).AMap && typeof (window as any).AMap.Map === 'function') {
            const map = new (window as any).AMap.Map('amap-container', {
              zoom: 12,
              center: [116.397428, 39.90923]
            });
            
            if (map && typeof map.getCenter === 'function') {
              const centerPosition = map.getCenter();
              if (centerPosition) {
                locationInfo.value.position = {
                  lng: centerPosition.getLng(),
                  lat: centerPosition.getLat()
                };
              }
            }
            
            // 使用地理编码服务获取位置名称和地址
            if ((window as any).AMap.Geocoder && typeof (window as any).AMap.Geocoder === 'function') {
              try {
                const geocoder = new (window as any).AMap.Geocoder({
                  radius: 1000,
                  extensions: "all"
                });
                
                geocoder.getAddress([locationInfo.value.position.lng, locationInfo.value.position.lat], (status: string, result: any) => {
                  if (status === 'complete' && result.info === 'OK' && result.regeocode) {
                    const address = result.regeocode;
                    locationInfo.value.name = address.addressComponent.district || '未知区域';
                    locationInfo.value.address = address.formattedAddress || '未知地址';
                  } else {
                    console.warn('地理编码查询失败，使用默认地址');
                  }
                  // 无论如何都进入下一步
                  getWeatherInfo();
                });
              } catch (error) {
                console.error('地理编码器创建失败:', error);
                // 地理编码失败，继续使用默认位置
                getWeatherInfo();
              }
            } else {
              console.warn('AMap.Geocoder不可用，使用备用方法');
              // 如果地理编码服务不可用，直接进入下一步
              getWeatherInfo();
            }
            
            // 销毁临时地图实例
            if (typeof map.destroy === 'function') {
              map.destroy();
            }
          } else {
            console.warn('地图容器或AMap不可用，使用默认位置');
            getWeatherInfo();
          }
        } catch (error) {
          console.error('地图操作错误:', error);
          getWeatherInfo();
        }
      } else {
        console.warn('AMap未加载，使用默认位置');
        // 如果AMap不可用，使用默认位置
        locationInfo.value = {
          name: '北京市',
          address: '北京市朝阳区',
          position: { lng: 116.397428, lat: 39.90923 }
        };
        getWeatherInfo();
      }
    } catch (error) {
      console.error('选择地点过程中出错:', error);
      // 发生错误时使用默认位置
      locationInfo.value = {
        name: '北京市',
        address: '北京市朝阳区',
        position: { lng: 116.397428, lat: 39.90923 }
      };
      getWeatherInfo();
    }
  } else {
    // 没有地图实例，使用默认位置
    locationInfo.value = {
      name: '北京市',
      address: '北京市朝阳区',
      position: { lng: 116.397428, lat: 39.90923 }
    };
    getWeatherInfo();
  }
};

// 获取天气信息
const getWeatherInfo = () => {
  // 更新任务状态为正在查询天气
  taskStatus.value = 'weather';
  
  // 使用高德天气API获取天气信息
  if (window.AMap && window.AMap.Weather) {
    const weather = new window.AMap.Weather();
    weather.getLive(locationInfo.value.name, (err: any, data: any) => {
      if (!err && data) {
        weatherInfo.value = {
          city: data.city || locationInfo.value.name,
          temperature: data.temperature + '°C',
          weather: data.weather,
          humidity: data.humidity + '%',
          windDirection: data.windDirection,
          windPower: data.windPower + '级',
          updateTime: new Date().toLocaleTimeString()
        };
        
        // 获取天气后自动获取AI推荐
        getAIRecommendation();
      } else {
        // 使用模拟数据
        weatherInfo.value = {
          city: locationInfo.value.name,
          temperature: Math.floor(15 + Math.random() * 15) + '°C',
          weather: ['晴', '多云', '阴', '小雨', '雾'][Math.floor(Math.random() * 5)],
          humidity: Math.floor(30 + Math.random() * 50) + '%',
          windDirection: ['东', '南', '西', '北', '东南', '西南', '东北', '西北'][Math.floor(Math.random() * 8)],
          windPower: Math.floor(1 + Math.random() * 6) + '级',
          updateTime: new Date().toLocaleTimeString()
        };
        
        getAIRecommendation();
      }
    });
  } else {
    // 如果API不可用，使用模拟数据
    weatherInfo.value = {
      city: locationInfo.value.name,
      temperature: Math.floor(15 + Math.random() * 15) + '°C',
      weather: ['晴', '多云', '阴', '小雨', '雾'][Math.floor(Math.random() * 5)],
      humidity: Math.floor(30 + Math.random() * 50) + '%',
      windDirection: ['东', '南', '西', '北', '东南', '西南', '东北', '西北'][Math.floor(Math.random() * 8)],
      windPower: Math.floor(1 + Math.random() * 6) + '级',
      updateTime: new Date().toLocaleTimeString()
    };
    
    getAIRecommendation();
  }
};

// 获取AI推荐
const getAIRecommendation = async () => {
  aiRecommendation.value.loading = true;
  
  try {
    // 模拟DeepSeek API调用
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const weather = weatherInfo.value.weather;
    const temp = parseInt(weatherInfo.value.temperature);
    const wind = parseInt(weatherInfo.value.windPower);
    
    let recommendText = `基于当前天气条件（${weather}，温度${weatherInfo.value.temperature}，${weatherInfo.value.windDirection}${weatherInfo.value.windPower}），我推荐以下无人机类型：\n\n`;
    
    let recommendedDrones: string[] = [];
    
    if (weather.includes('雨') || weather.includes('雪')) {
      recommendText += '- 由于当前天气条件较差，建议使用防水型无人机(W系列)，它们具有优秀的防水性能。\n';
      recommendedDrones = droneList.value.filter(d => d.type === '水域型' && d.available).map(d => d.id);
    } else if (weather.includes('雾') || weather.includes('霾')) {
      recommendText += '- 当前能见度较低，建议使用带有高级传感器的侦察型无人机(X系列)，它们能在低能见度条件下保持良好的导航能力。\n';
      recommendedDrones = droneList.value.filter(d => d.type === '侦察型' && d.available).map(d => d.id);
    } else if (new Date().getHours() >= 18 || new Date().getHours() < 6) {
      recommendText += '- 当前为夜间时段，建议使用配备夜视设备的夜视型无人机(N系列)，它们在低光条件下有出色表现。\n';
      recommendedDrones = droneList.value.filter(d => d.type === '夜视型' && d.available).map(d => d.id);
    } else if (wind > 4) {
      recommendText += '- 由于当前风力较大，建议使用抗风能力强的侦察型无人机(X系列)，它们有更好的稳定性。\n';
      recommendedDrones = droneList.value.filter(d => d.type === '侦察型' && d.available).map(d => d.id);
    } else {
      recommendText += '- 当前天气条件良好，建议使用监控型无人机(S系列)进行常规巡逻任务，它们具有出色的稳定性和续航时间。\n';
      recommendedDrones = droneList.value.filter(d => d.type === '监控型' && d.available).map(d => d.id);
    }
    
    // 添加更多推荐细节
    recommendText += '\n根据您的任务需求，我还建议：\n';
    recommendText += '- 对于长时间任务，请选择电池电量在85%以上的无人机\n';
    recommendText += '- 对于需要实时视频传输的任务，请确保信号强度在80%以上\n';
    recommendText += '- 对于重要任务，建议同时派出多架不同类型的无人机以提高任务成功率\n';
    
    // 如果没有找到合适的无人机，推荐一些可用的无人机
    if (recommendedDrones.length === 0) {
      recommendedDrones = droneList.value.filter(d => d.available).slice(0, 3).map(d => d.id);
    } else if (recommendedDrones.length > 5) {
      // 限制推荐数量
      recommendedDrones = recommendedDrones.slice(0, 5);
    }
    
    aiRecommendation.value.content = recommendText;
    aiRecommendation.value.droneIds = recommendedDrones;
    
    // 自动选择推荐的无人机
    missionInfo.value.selectedDrones = recommendedDrones;
  } catch (error) {
    aiRecommendation.value.content = "AI推荐生成失败，请手动选择适合的无人机。";
    console.error('AI recommendation error:', error);
  } finally {
    aiRecommendation.value.loading = false;
  }
};

// 选择无人机
const selectDrone = (id: string) => {
  const index = missionInfo.value.selectedDrones.indexOf(id);
  if (index > -1) {
    missionInfo.value.selectedDrones.splice(index, 1);
  } else {
    missionInfo.value.selectedDrones.push(id);
  }
};

// 选择任务类型
const selectMissionType = (type: TaskType) => {
  missionInfo.value.type = type;
  taskStatus.value = 'area';
};

// 开始绘制区域
const startDrawArea = () => {
  isDrawing.value = true;
  drawingPolygon.value = [];
  ElMessage({
    message: '请在地图上点击以绘制巡逻区域，至少需要3个点。点击完成后，再次点击第一个点可闭合区域。',
    type: 'info',
    duration: 5000
  });
};

// 完成绘制
const finishDrawArea = () => {
  if (!mapInstance.value) {
    ElMessage.warning('地图组件未初始化');
    return;
  }
  
  // 手动创建多边形点数据
  if (drawingPolygon.value.length < 3) {
    ElMessage.warning('请至少绘制3个点以形成有效区域');
    return;
  }
  
  isDrawing.value = false;
  missionInfo.value.area = [...drawingPolygon.value];
  startMission();
};

// 取消绘制
const cancelDrawArea = () => {
  drawingPolygon.value = [];
  isDrawing.value = false;
  ElMessage.info('已取消绘制');
};

// 开始任务
const startMission = () => {
  missionInfo.value.created = true;
  taskStatus.value = 'running';
  
  // 更新选定的无人机状态
  for (const droneId of missionInfo.value.selectedDrones) {
    const drone = droneList.value.find(d => d.id === droneId);
    if (drone) {
      drone.status = 'active';
      // 设置初始位置 (模拟)
      drone.position = {
        lng: locationInfo.value.position.lng + (Math.random() * 0.01 - 0.005),
        lat: locationInfo.value.position.lat + (Math.random() * 0.01 - 0.005)
      };
    }
  }
  
  ElMessage.success(`任务 ${missionInfo.value.id} 已启动，${missionInfo.value.selectedDrones.length}架无人机开始巡逻`);
  
  // 开始模拟无人机移动
  startDroneSimulation();
};

// 模拟无人机移动
let simulationInterval: number | null = null;

const startDroneSimulation = () => {
  simulationInterval = window.setInterval(() => {
    // 为每个活动无人机更新位置
    for (const drone of droneList.value) {
      if (drone.status === 'active' && drone.position) {
        // 在区域内随机移动
        if (missionInfo.value.area.length > 0) {
          // 如果有定义区域，在区域内随机移动
          const randomPoint = getRandomPointInPolygon(missionInfo.value.area);
          
          // 平滑移动，不是直接跳跃
          drone.position = {
            lng: drone.position.lng + (randomPoint.lng - drone.position.lng) * 0.1,
            lat: drone.position.lat + (randomPoint.lat - drone.position.lat) * 0.1
          };
        } else {
          // 否则在选定位置周围随机移动
          drone.position = {
            lng: drone.position.lng + (Math.random() * 0.002 - 0.001),
            lat: drone.position.lat + (Math.random() * 0.002 - 0.001)
          };
        }
        
        // 随机降低电池电量
        drone.batteryLevel = Math.max(0, drone.batteryLevel - Math.random() * 0.2);
        
        // 如果电池电量太低，让无人机返回
        if (drone.batteryLevel < 10) {
          drone.status = 'returning';
        }
      } else if (drone.status === 'returning' && drone.position) {
        // 模拟返回基地
        const basePosition = locationInfo.value.position;
        drone.position = {
          lng: drone.position.lng + (basePosition.lng - drone.position.lng) * 0.2,
          lat: drone.position.lat + (basePosition.lat - drone.position.lat) * 0.2
        };
        
        // 检查是否已经足够接近基地
        const distance = Math.sqrt(
          Math.pow(drone.position.lng - basePosition.lng, 2) + 
          Math.pow(drone.position.lat - basePosition.lat, 2)
        );
        
        if (distance < 0.0005) {
          drone.status = 'charging';
          drone.position = undefined;
        }
      } else if (drone.status === 'charging') {
        // 充电中的无人机增加电池电量
        drone.batteryLevel = Math.min(100, drone.batteryLevel + 1);
        
        // 充满电后返回待命状态
        if (drone.batteryLevel >= 95) {
          drone.status = 'idle';
        }
      }
    }
  }, 1000);
};

// 在多边形区域内获取随机点
const getRandomPointInPolygon = (polygon: GeoCoordinate[]): GeoCoordinate => {
  // 计算边界框
  let minLng = polygon[0].lng;
  let maxLng = polygon[0].lng;
  let minLat = polygon[0].lat;
  let maxLat = polygon[0].lat;
  
  for (const point of polygon) {
    minLng = Math.min(minLng, point.lng);
    maxLng = Math.max(maxLng, point.lng);
    minLat = Math.min(minLat, point.lat);
    maxLat = Math.max(maxLat, point.lat);
  }
  
  // 在边界框内生成随机点
  let randomPoint: GeoCoordinate;
  do {
    randomPoint = {
      lng: minLng + Math.random() * (maxLng - minLng),
      lat: minLat + Math.random() * (maxLat - minLat)
    };
  } while (!isPointInPolygon(randomPoint, polygon));
  
  return randomPoint;
};

// 检查点是否在多边形内
const isPointInPolygon = (point: GeoCoordinate, polygon: GeoCoordinate[]): boolean => {
  // 实现点在多边形内算法 (射线法)
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng;
    const yi = polygon[i].lat;
    const xj = polygon[j].lng;
    const yj = polygon[j].lat;
    
    const intersect = ((yi > point.lat) !== (yj > point.lat)) && 
      (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
};

// 重置任务
const resetMission = () => {
  ElMessageBox.confirm('确定要重置当前任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    taskStatus.value = 'setup';
    missionInfo.value = {
      id: '',
      name: '',
      type: '区域巡检',
      startTime: '',
      duration: 60,
      created: false,
      area: [],
      selectedDrones: []
    };
    locationInfo.value = {
      name: '',
      address: '',
      position: { lng: 116.397428, lat: 39.90923 }
    };
    weatherInfo.value = {
      city: '',
      temperature: '',
      weather: '',
      humidity: '',
      windDirection: '',
      windPower: '',
      updateTime: ''
    };
    aiRecommendation.value = {
      content: '',
      loading: false,
      droneIds: []
    };
    isDrawing.value = false;
    drawingPolygon.value = [];
    
    // 重置无人机状态
    for (const drone of droneList.value) {
      if (drone.status === 'active' || drone.status === 'returning') {
        drone.status = 'idle';
        drone.position = undefined;
      }
    }
    
    // 清除模拟
    if (simulationInterval !== null) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
    
    ElMessage.success('任务已重置');
  }).catch(() => {});
};

// 计算可用无人机数量
const availableDronesCount = computed(() => {
  return droneList.value.filter(d => d.available).length;
});

// 获取当前活动无人机
const activeDrones = computed(() => {
  return droneList.value.filter(d => missionInfo.value.selectedDrones.includes(d.id));
});

// 获取推荐无人机
const recommendedDrones = computed(() => {
  return droneList.value.filter(d => aiRecommendation.value.droneIds.includes(d.id));
});

// 获取按类型分组的无人机
const dronesByType = computed(() => {
  const result: Record<string, DroneInfo[]> = {};
  
  for (const drone of droneList.value) {
    if (!result[drone.type]) {
      result[drone.type] = [];
    }
    result[drone.type].push(drone);
  }
  
  return result;
});

// 获取适合当前任务类型的无人机
const suitableDrones = computed(() => {
  return droneList.value.filter(d => 
    d.available && d.suitable.includes(missionInfo.value.type)
  );
});

// 在地图上选择位置的函数
const handleMapClick = (e: any) => {
  if (taskStatus.value === 'location') {
    // 更新选择的位置
    locationInfo.value.position = {
      lng: e.lnglat.getLng(),
      lat: e.lnglat.getLat()
    };
    
    // 显示提示
    ElMessage.success('已选择位置，请点击"确认选择"按钮继续');
  }
};

// 组件挂载
onMounted(() => {
  // 初始化，自动开始任务设置
  startTaskSetup();
  
  // 先生成任务ID
  missionInfo.value.id = generateTaskId();
  missionInfo.value.name = `巡逻任务 ${new Date().toLocaleDateString()}`;
  missionInfo.value.startTime = new Date().toISOString().split('T')[0] + 'T' + new Date().toTimeString().split(' ')[0].substring(0, 5);
  
  // 设置地图点击事件
  setTimeout(() => {
    if (window.AMap) {
      const mapContainer = document.getElementById('amap-container');
      if (mapContainer) {
        // 创建一个地图实例用于接收点击事件
        const map = new window.AMap.Map('amap-container');
        
        // 添加点击事件监听器
        map.on('click', handleMapClick);
        
        // 添加绘制多边形的点击事件
        map.on('click', (e: any) => {
          if (isDrawing.value) {
            const clickPosition = {
              lng: e.lnglat.getLng(),
              lat: e.lnglat.getLat()
            };
            
            // 添加点到绘制数组
            drawingPolygon.value.push(clickPosition);
            
            // 如果有3个以上的点，在地图上绘制多边形
            if (drawingPolygon.value.length >= 3) {
              // 创建多边形
              const path = drawingPolygon.value.map(point => [point.lng, point.lat]);
              
              // 清除之前的多边形
              map.clearMap();
              
              // 添加新的多边形
              const polygon = new window.AMap.Polygon({
                path: path,
                strokeColor: '#00eeff',
                strokeWeight: 2,
                strokeOpacity: 0.8,
                fillColor: '#00eeff',
                fillOpacity: 0.2,
                zIndex: 50
              });
              
              map.add(polygon);
              
              // 向用户显示多边形已创建
              ElMessage.success(`已添加${drawingPolygon.value.length}个点`);
            }
          }
        });
      }
    }
  }, 3000);
});

// 组件卸载前清理资源
onBeforeUnmount(() => {
  if (simulationInterval !== null) {
    clearInterval(simulationInterval);
  }
});
</script>

<template>
  <div class="drone-patrol-panel">
    <!-- 初始任务设置界面 -->
    <div v-if="taskStatus === 'setup'" class="setup-screen">
      <div class="setup-header">
        <h2>无人机巡逻任务设置</h2>
        <p>创建一个新的无人机巡逻任务来监控指定区域</p>
      </div>
      
      <div class="setup-content">
        <div class="drone-summary">
          <div class="summary-item">
            <div class="summary-icon">🛸</div>
            <div class="summary-info">
              <h3>{{ availableDronesCount }} 架</h3>
              <p>可用无人机</p>
            </div>
          </div>
          
          <div class="summary-item">
            <div class="summary-icon">🔋</div>
            <div class="summary-info">
              <h3>{{ droneList.filter(d => d.batteryLevel > 80).length }} 架</h3>
              <p>电量充足</p>
            </div>
          </div>
          
          <div class="summary-item">
            <div class="summary-icon">📡</div>
            <div class="summary-info">
              <h3>{{ droneList.filter(d => d.signalStrength > 80).length }} 架</h3>
              <p>信号强度良好</p>
            </div>
          </div>
          
          <div class="summary-item">
            <div class="summary-icon">⚙️</div>
            <div class="summary-info">
              <h3>{{ droneList.filter(d => d.status === 'maintenance').length }} 架</h3>
              <p>维护中</p>
            </div>
          </div>
        </div>
        
        <div class="drone-types">
          <h3>无人机类型统计</h3>
          <div class="type-list">
            <div v-for="(drones, type) in dronesByType" :key="type" class="type-item">
              <div class="type-header">
                <span class="type-dot" :class="type"></span>
                <span class="type-name">{{ type }}</span>
              </div>
              <div class="type-count">{{ drones.length }}架</div>
            </div>
          </div>
        </div>
        
        <div class="action-container">
          <button @click="startTaskSetup" class="action-button start-btn">
            开始创建巡逻任务
          </button>
        </div>
      </div>
    </div>
    
    <!-- 选择地点界面 -->
    <div v-if="taskStatus === 'location'" class="location-screen">
      <div class="screen-header">
        <h2>选择巡逻地点</h2>
        <p>在地图上选择您想要巡逻的区域中心点</p>
      </div>
      
      <div class="location-content">
        <div class="map-container">
          <MapComponent 
            ref="mapInstance" 
            style="height: 100%; width: 100%;" 
            :showDroneInfo="false"
          />
          <div class="map-overlay">
            <p>请点击地图上的位置进行选择，然后点击下方按钮确认</p>
            <div class="location-feedback" v-if="locationInfo.position.lng !== 116.397428">
              <div class="selected-location">
                <p><strong>已选位置坐标:</strong></p>
                <p>经度: {{ locationInfo.position.lng.toFixed(6) }}</p>
                <p>纬度: {{ locationInfo.position.lat.toFixed(6) }}</p>
              </div>
            </div>
            <button @click="selectLocation" class="action-button">确认选择</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 天气信息界面 -->
    <div v-if="taskStatus === 'weather'" class="weather-screen">
      <div class="screen-header">
        <h2>天气信息</h2>
        <p>获取选定地点的实时天气信息</p>
      </div>
      
      <div class="weather-content">
        <div class="location-info">
          <h3>{{ locationInfo.name }}</h3>
          <p>{{ locationInfo.address }}</p>
        </div>
        
        <div class="weather-info-container">
          <div v-if="!weatherInfo.city" class="loading-weather">
            <div class="loading-spinner"></div>
            <p>正在获取天气信息...</p>
          </div>
          
          <div v-else class="weather-info">
            <div class="weather-main">
              <div class="weather-icon">
                <!-- 使用不同的图标来表示不同的天气状况 -->
                <span v-if="weatherInfo.weather.includes('晴')">☀️</span>
                <span v-else-if="weatherInfo.weather.includes('云')">⛅</span>
                <span v-else-if="weatherInfo.weather.includes('雨')">🌧️</span>
                <span v-else-if="weatherInfo.weather.includes('雪')">❄️</span>
                <span v-else-if="weatherInfo.weather.includes('雾')">🌫️</span>
                <span v-else>🌤️</span>
              </div>
              <div class="weather-temp">{{ weatherInfo.temperature }}</div>
              <div class="weather-desc">{{ weatherInfo.weather }}</div>
            </div>
            
            <div class="weather-details">
              <div class="weather-detail-item">
                <span class="detail-label">湿度</span>
                <span class="detail-value">{{ weatherInfo.humidity }}</span>
              </div>
              <div class="weather-detail-item">
                <span class="detail-label">风向</span>
                <span class="detail-value">{{ weatherInfo.windDirection }}</span>
              </div>
              <div class="weather-detail-item">
                <span class="detail-label">风力</span>
                <span class="detail-value">{{ weatherInfo.windPower }}</span>
              </div>
              <div class="weather-detail-item">
                <span class="detail-label">更新时间</span>
                <span class="detail-value">{{ weatherInfo.updateTime }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="action-container">
          <button v-if="weatherInfo.city" @click="taskStatus = 'drone'" class="action-button next-btn">
            下一步：选择无人机
          </button>
        </div>
      </div>
    </div>
    
    <!-- 无人机选择界面 -->
    <div v-if="taskStatus === 'drone'" class="drone-screen">
      <div class="screen-header">
        <h2>选择无人机</h2>
        <p>根据任务需求和当前天气条件，选择合适的无人机</p>
      </div>
      
      <div class="drone-content">
        <!-- AI推荐部分 -->
        <div class="ai-recommendation">
          <div class="rec-header">
            <h3>
              <span class="ai-icon">🤖</span>
              DeepSeek AI 智能推荐
            </h3>
          </div>
          
          <div v-if="aiRecommendation.loading" class="rec-loading">
            <div class="loading-spinner"></div>
            <p>正在根据天气条件生成智能推荐...</p>
          </div>
          
          <div v-else-if="aiRecommendation.content" class="rec-content">
            <pre class="rec-text">{{ aiRecommendation.content }}</pre>
            
            <div class="rec-drones">
              <h4>推荐无人机</h4>
              <div class="selected-drones-list">
                <div 
                  v-for="drone in recommendedDrones" 
                  :key="drone.id"
                  class="selected-drone-item"
                >
                  <div class="selected-drone-icon">🛸</div>
                  <div class="selected-drone-info">
                    <div class="selected-drone-name">{{ drone.name }}</div>
                    <div class="selected-drone-type">{{ drone.type }}</div>
                    <div class="selected-drone-stats">
                      <span class="drone-stat-item">
                        <span class="stat-icon">🔋</span>
                        {{ drone.batteryLevel }}%
                      </span>
                      <span class="drone-stat-item">
                        <span class="stat-icon">📡</span>
                        {{ drone.signalStrength }}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 无人机列表 -->
        <div class="drone-selection">
          <h3>可用无人机列表</h3>
          <div class="drone-filter">
            <button 
              @click="() => {}" 
              class="filter-btn"
            >
              全部 ({{ droneList.filter(d => d.available).length }})
            </button>
            <button 
              v-for="(drones, type) in dronesByType" 
              :key="type"
              @click="() => {}"
              class="filter-btn"
            >
              {{ type }} ({{ drones.filter(d => d.available).length }})
            </button>
          </div>
          
          <div class="drones-list">
            <div 
              v-for="drone in droneList.filter(d => d.available)" 
              :key="drone.id"
              class="drone-item"
              :class="{ 'selected': missionInfo.selectedDrones.includes(drone.id) }"
              @click="selectDrone(drone.id)"
            >
              <div class="drone-icon">🛸</div>
              <div class="drone-info">
                <div class="drone-name">{{ drone.name }}</div>
                <div class="drone-model">{{ drone.model }}</div>
                <div class="drone-type">{{ drone.type }}</div>
                
                <div class="drone-stats">
                  <div class="drone-stat">
                    <span class="stat-label">电量:</span>
                    <div class="battery-indicator">
                      <div 
                        class="battery-level" 
                        :class="{ 
                          'high': drone.batteryLevel > 70, 
                          'medium': drone.batteryLevel <= 70 && drone.batteryLevel > 30,
                          'low': drone.batteryLevel <= 30
                        }"
                        :style="{ width: `${drone.batteryLevel}%` }"
                      ></div>
                    </div>
                    <span class="stat-value">{{ drone.batteryLevel }}%</span>
                  </div>
                  
                  <div class="drone-stat">
                    <span class="stat-label">信号:</span>
                    <div class="signal-indicator">
                      <div 
                        class="signal-level"
                        :class="{ 
                          'high': drone.signalStrength > 70, 
                          'medium': drone.signalStrength <= 70 && drone.signalStrength > 30,
                          'low': drone.signalStrength <= 30
                        }"
                        :style="{ width: `${drone.signalStrength}%` }"
                      ></div>
                    </div>
                    <span class="stat-value">{{ drone.signalStrength }}%</span>
                  </div>
                </div>
                
                <div class="drone-capabilities">
                  <div class="capability-label">载荷:</div>
                  <div class="capability-value">{{ drone.payload }}</div>
                </div>
                
                <div class="drone-capabilities">
                  <div class="capability-label">适用任务:</div>
                  <div class="capability-value">
                    <span 
                      v-for="task in drone.suitable" 
                      :key="task"
                      class="task-tag"
                    >
                      {{ task }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="selection-mark">
                <svg v-if="missionInfo.selectedDrones.includes(drone.id)" viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 已选无人机 -->
        <div class="selected-drones">
          <h3>已选择 {{ missionInfo.selectedDrones.length }} 架无人机</h3>
          <div class="selected-drones-list">
            <div 
              v-for="drone in activeDrones" 
              :key="drone.id"
              class="selected-drone-item"
            >
              <div class="selected-drone-icon">🛸</div>
              <div class="selected-drone-info">
                <div class="selected-drone-name">{{ drone.name }}</div>
                <div class="selected-drone-type">{{ drone.type }}</div>
                <div class="selected-drone-stats">
                  <span class="drone-stat-item">
                    <span class="stat-icon">🔋</span>
                    {{ drone.batteryLevel }}%
                  </span>
                  <span class="drone-stat-item">
                    <span class="stat-icon">📡</span>
                    {{ drone.signalStrength }}%
                  </span>
                </div>
              </div>
              <button @click="selectDrone(drone.id)" class="remove-drone-btn">
                ×
              </button>
            </div>
          </div>
        </div>
        
        <div class="action-container">
          <button 
            @click="taskStatus = 'mission'" 
            :disabled="missionInfo.selectedDrones.length === 0"
            class="action-button next-btn"
          >
            下一步：设置任务目标
          </button>
        </div>
      </div>
    </div>
    
    <!-- 任务目标选择界面 -->
    <div v-if="taskStatus === 'mission'" class="mission-screen">
      <div class="screen-header">
        <h2>设置任务目标</h2>
        <p>选择此次巡逻任务的主要目标</p>
      </div>
      
      <div class="mission-content">
        <div class="mission-info">
          <div class="info-item">
            <div class="info-label">任务编号</div>
            <div class="info-value">{{ missionInfo.id }}</div>
          </div>
          
          <div class="info-item">
            <div class="info-label">任务名称</div>
            <div class="info-value">
              <input 
                v-model="missionInfo.name" 
                type="text" 
                class="info-input"
                placeholder="输入任务名称"
              />
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-label">开始时间</div>
            <div class="info-value">
              <input 
                v-model="missionInfo.startTime" 
                type="datetime-local" 
                class="info-input"
              />
            </div>
          </div>
          
          <div class="info-item">
            <div class="info-label">预计时长</div>
            <div class="info-value">
              <select v-model="missionInfo.duration" class="info-input">
                <option :value="30">30分钟</option>
                <option :value="60">1小时</option>
                <option :value="120">2小时</option>
                <option :value="180">3小时</option>
                <option :value="240">4小时</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="mission-types">
          <h3>选择任务类型</h3>
          <div class="types-grid">
            <div 
              v-for="type in ['交通监控', '火灾检测', '夜间检测', '人群监控', '区域巡检', '定点监控']" 
              :key="type"
              class="mission-type-item"
              :class="{ 'selected': missionInfo.type === type }"
              @click="selectMissionType(type as TaskType)"
            >
              <div class="mission-type-icon">
                <span v-if="type === '交通监控'">🚗</span>
                <span v-else-if="type === '火灾检测'">🔥</span>
                <span v-else-if="type === '夜间检测'">🌙</span>
                <span v-else-if="type === '人群监控'">👥</span>
                <span v-else-if="type === '区域巡检'">🔍</span>
                <span v-else-if="type === '定点监控'">📍</span>
              </div>
              <div class="mission-type-name">{{ type }}</div>
              <div class="mission-type-check">
                <svg v-if="missionInfo.type === type" viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div class="suitable-drones">
          <h3>适合该任务的无人机</h3>
          
          <div class="suitable-drones-list">
            <div 
              v-for="drone in suitableDrones" 
              :key="drone.id"
              class="suitable-drone-item"
              :class="{ 'selected': missionInfo.selectedDrones.includes(drone.id) }"
            >
              <div class="suitable-drone-icon">
                <span v-if="missionInfo.selectedDrones.includes(drone.id)">✓</span>
                <span v-else>🛸</span>
              </div>
              <div class="suitable-drone-info">
                <div class="suitable-drone-name">{{ drone.name }}</div>
                <div class="suitable-drone-type">{{ drone.type }}</div>
                <div class="suitable-drone-battery">
                  <span class="battery-icon">🔋</span>
                  {{ drone.batteryLevel }}%
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="action-container">
          <button @click="taskStatus = 'area'" class="action-button next-btn">
            下一步：选择巡逻区域
          </button>
        </div>
      </div>
    </div>
    
    <!-- 区域选择界面 -->
    <div v-if="taskStatus === 'area'" class="area-screen">
      <div class="screen-header">
        <h2>选择巡逻区域</h2>
        <p>请在地图上绘制您想要巡逻的区域</p>
      </div>
      
      <div class="area-content">
        <div class="map-container">
          <MapComponent 
            ref="mapInstance" 
            style="height: 100%; width: 100%;"
            :is-drawing="isDrawing"
            :task-area-points="missionInfo.area"
            :showDroneInfo="false"
          />
          <div class="map-overlay">
            <div v-if="!isDrawing">
              <p>点击下方按钮开始在地图上绘制巡逻区域</p>
              <button @click="startDrawArea" class="action-button">开始绘制</button>
            </div>
            <div v-else>
              <p>点击地图添加区域点，完成后点击下方按钮</p>
              <div class="button-group">
                <button @click="finishDrawArea" class="action-button finish-btn">完成绘制</button>
                <button @click="cancelDrawArea" class="action-button cancel-btn">取消</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 任务运行界面 -->
    <div v-if="taskStatus === 'running'" class="running-screen">
      <div class="screen-header">
        <h2>任务运行中</h2>
        <p>无人机正在执行巡逻任务</p>
      </div>
      
      <div class="running-content">
        <!-- 任务运行逻辑部分 -->
        <div class="running-mission">
          <div class="mission-header">
            <h3>任务执行中</h3>
            <div class="mission-id">ID: {{ missionInfo.id }}</div>
          </div>
          
          <div class="mission-details">
            <div class="detail-item">
              <div class="detail-label">任务名称:</div>
              <div class="detail-value">{{ missionInfo.name }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">任务类型:</div>
              <div class="detail-value">{{ missionInfo.type }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">开始时间:</div>
              <div class="detail-value">{{ new Date(missionInfo.startTime).toLocaleString() }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">预计时长:</div>
              <div class="detail-value">{{ missionInfo.duration }} 分钟</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">任务区域:</div>
              <div class="detail-value">{{ locationInfo.name }}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">部署无人机:</div>
              <div class="detail-value">{{ missionInfo.selectedDrones.length }} 架</div>
            </div>
          </div>
          
          <div class="mission-actions">
            <button class="action-button">暂停任务</button>
            <button class="action-button danger">终止任务</button>
            <button class="action-button info" @click="toggleVideoMonitoring">
              {{ showVideoMonitoring ? '隐藏视频监控' : '查看视频监控' }}
            </button>
          </div>
          
          <!-- 无人机状态列表 -->
          <div class="active-drones">
            <h4>活动无人机状态</h4>
            <div class="drone-status-list">
              <div 
                v-for="drone in droneList.filter(d => missionInfo.selectedDrones.includes(d.id))" 
                :key="drone.id"
                class="drone-status-item"
              >
                <div class="drone-status-header">
                  <div class="drone-name">{{ drone.name }}</div>
                  <div class="drone-status-badge" :class="drone.status">
                    {{ drone.status === 'active' ? '执行任务中' : 
                       drone.status === 'returning' ? '返航中' : 
                       drone.status === 'idle' ? '待命中' : 
                       drone.status === 'charging' ? '充电中' : '维护中' }}
                  </div>
                </div>
                <div class="drone-status-details">
                  <div class="status-detail">
                    <div class="detail-icon battery"></div>
                    <div class="progress-bar">
                      <div class="progress-fill battery" :style="{width: `${drone.batteryLevel}%`}"></div>
                    </div>
                    <div class="detail-value">{{ Math.round(drone.batteryLevel) }}%</div>
                  </div>
                  <div class="status-detail">
                    <div class="detail-icon signal"></div>
                    <div class="progress-bar">
                      <div class="progress-fill signal" :style="{width: `${drone.signalStrength}%`}"></div>
                    </div>
                    <div class="detail-value">{{ Math.round(drone.signalStrength) }}%</div>
                  </div>
                </div>
                <div class="drone-actions">
                  <button class="small-button" @click="selectDroneForMonitoring(drone.id)">
                    查看监控
                  </button>
                  <button class="small-button" :disabled="drone.status !== 'active'">
                    召回
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 视频监控面板 -->
          <div v-if="showVideoMonitoring" class="video-monitoring-panel">
            <div class="panel-header">
              <h4>无人机视频监控</h4>
              <button class="close-button" @click="toggleVideoMonitoring">&times;</button>
            </div>
            
            <div class="video-container">
              <div 
                v-for="video in droneVideoStreams" 
                :key="video.id"
                class="video-feed-container"
                :class="{ 
                  active: video.id === monitoringDroneId,
                  warning: video.alertLevel === 'warning',
                  critical: video.alertLevel === 'critical'
                }"
                @click="monitoringDroneId = video.id"
              >
                <div class="video-header">
                  <div class="video-title">
                    {{ video.name }} - {{ getVideoTypeTitle(video.videoType) }}
                  </div>
                  <div 
                    class="alert-indicator" 
                    :style="{ backgroundColor: getAlertLevelColor(video.alertLevel) }"
                  ></div>
                </div>
                
                <div class="video-content">
                  <!-- 模拟视频播放 -->
                  <div class="video-feed">
                    <img :src="video.imageUrl" alt="无人机视频流">
                    
                    <!-- 特效覆盖层: 根据视频类型显示不同特效 -->
                    <div 
                      v-if="video.videoType === 'license-plate'" 
                      class="effect-overlay license-plate-effect"
                    >
                      <!-- 模拟车牌识别框和识别结果 -->
                      <div class="detection-box">
                        <div class="detection-title">车牌识别中...</div>
                        <div class="detection-result">
                          <span class="detection-value">京A88888</span>
                          <span class="detection-confidence">置信度: 92%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      v-if="video.videoType === 'person-detection'" 
                      class="effect-overlay person-detection-effect"
                    >
                      <!-- 模拟人物识别框和识别结果 -->
                      <div class="detection-box person-box">
                        <div class="detection-title">人物识别中...</div>
                        <div class="detection-result">
                          <span class="detection-value">检测到 5 人</span>
                          <span class="detection-confidence">置信度: 89%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      v-if="video.videoType === 'wildfire'" 
                      class="effect-overlay wildfire-effect"
                    >
                      <!-- 模拟火灾检测结果 -->
                      <div class="detection-box warning-box">
                        <div class="detection-title">火灾风险检测</div>
                        <div class="detection-result">
                          <span class="detection-value warning-text">发现热点异常!</span>
                          <span class="detection-confidence">风险等级: 高</span>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      v-if="video.videoType === 'night-street'" 
                      class="effect-overlay night-street-effect"
                    >
                      <!-- 模拟夜间街道巡视结果 -->
                      <div class="detection-box warning-box">
                        <div class="detection-title">夜间街道巡视</div>
                        <div class="detection-result">
                          <span class="detection-value warning-text">发现异常情况!</span>
                          <span class="detection-confidence">风险等级: 中</span>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      v-if="video.videoType === 'night-vehicle'" 
                      class="effect-overlay night-vehicle-effect"
                    >
                      <!-- 模拟夜间车辆检测结果 -->
                      <div class="detection-box warning-box">
                        <div class="detection-title">夜间车辆检测</div>
                        <div class="detection-result">
                          <span class="detection-value warning-text">发现异常车辆!</span>
                          <span class="detection-confidence">风险等级: 中</span>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      v-if="video.videoType === 'long-distance'" 
                      class="effect-overlay long-distance-effect"
                    >
                      <!-- 模拟远距离监控结果 -->
                      <div class="detection-box warning-box">
                        <div class="detection-title">远距离监控</div>
                        <div class="detection-result">
                          <span class="detection-value warning-text">发现异常情况!</span>
                          <span class="detection-confidence">风险等级: 低</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 视频时间戳和坐标 -->
                    <div class="video-metadata">
                      <div class="video-timestamp">{{ new Date().toLocaleTimeString() }}</div>
                      <div class="video-location">{{ video.location }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 重置任务按钮 -->
    <button 
      v-if="taskStatus !== 'setup'"
      @click="resetMission" 
      class="reset-button"
    >
      重置任务
    </button>
  </div>
</template>

<style scoped>
.drone-patrol-panel {
  width: 100%;
  height: 100%;
  background-color: #132f4c;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 设置界面样式 */
.setup-screen,
.location-screen,
.weather-screen,
.drone-screen,
.mission-screen,
.area-screen,
.running-screen {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.screen-header,
.setup-header {
  margin-bottom: 20px;
  border-bottom: 1px solid #1e3a5f;
  padding-bottom: 15px;
}

.screen-header h2,
.setup-header h2 {
  color: #4fc3f7;
  margin: 0 0 10px;
  font-size: 1.5rem;
}

.screen-header p,
.setup-header p {
  color: #90caf9;
  margin: 0;
  font-size: 1rem;
}

.setup-content,
.location-content,
.weather-content,
.drone-content,
.mission-content,
.area-content,
.running-content {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* 无人机总结样式 */
.drone-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.summary-item {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
}

.summary-icon {
  font-size: 2rem;
  margin-right: 15px;
}

.summary-info h3 {
  margin: 0 0 5px;
  font-size: 1.2rem;
  color: #e3f2fd;
}

.summary-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #90caf9;
}

/* 无人机类型统计样式 */
.drone-types {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
}

.drone-types h3 {
  margin: 0 0 15px;
  color: #4fc3f7;
  font-size: 1.2rem;
}

.type-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.type-item {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 150px;
}

.type-header {
  display: flex;
  align-items: center;
}

.type-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.type-dot.侦察型 {
  background-color: #2196F3;
}

.type-dot.监控型 {
  background-color: #4CAF50;
}

.type-dot.夜视型 {
  background-color: #9C27B0;
}

.type-dot.消防型 {
  background-color: #F44336;
}

.type-dot.水域型 {
  background-color: #00BCD4;
}

.type-name {
  font-size: 0.9rem;
  color: #e3f2fd;
}

.type-count {
  font-size: 0.9rem;
  color: #90caf9;
}

/* 地图容器样式 */
.map-container {
  flex: 1;
  min-height: 400px;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.map-overlay {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background-color: rgba(19, 47, 76, 0.8);
  padding: 15px;
  border-radius: 8px;
  backdrop-filter: blur(5px);
  z-index: 10;
}

.map-overlay p {
  margin: 0 0 10px;
  color: #e3f2fd;
}

/* 天气信息样式 */
.location-info {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.location-info h3 {
  margin: 0 0 5px;
  color: #4fc3f7;
  font-size: 1.2rem;
}

.location-info p {
  margin: 0;
  color: #90caf9;
}

.weather-info-container {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  min-height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-weather {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: #4fc3f7;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-weather p {
  color: #90caf9;
}

.weather-info {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
}

.weather-main {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  margin-bottom: 20px;
}

.weather-icon {
  font-size: 4rem;
  margin-bottom: 10px;
}

.weather-temp {
  font-size: 2.5rem;
  font-weight: bold;
  color: #e3f2fd;
  margin-bottom: 5px;
}

.weather-desc {
  font-size: 1.2rem;
  color: #90caf9;
}

.weather-details {
  flex: 2;
  min-width: 300px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  padding: 10px;
}

.weather-detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  color: #90caf9;
  font-size: 0.85rem;
  margin-bottom: 5px;
}

.detail-value {
  color: #e3f2fd;
  font-size: 1.1rem;
}

/* 按钮样式 */
.action-container {
  display: flex;
  justify-content: center;
  margin-top: auto;
  padding-top: 20px;
}

.action-button {
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 12px 25px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: #1976D2;
  transform: translateY(-2px);
}

.start-btn {
  background-color: #4CAF50;
}

.start-btn:hover {
  background-color: #388E3C;
}

.next-btn {
  background-color: #2196F3;
}

.next-btn:hover {
  background-color: #1976D2;
}

.reset-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #F44336;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 8px 15px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 20;
}

.reset-button:hover {
  background-color: #D32F2F;
}

@media (max-width: 992px) {
  .drone-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .weather-main,
  .weather-details {
    flex: 100%;
    margin-right: 0;
  }
}

@media (max-width: 576px) {
  .drone-summary {
    grid-template-columns: 1fr;
  }
  
  .weather-details {
    grid-template-columns: 1fr;
  }
}

.rec-header h3 {
  margin: 0;
  color: #4fc3f7;
  display: flex;
  align-items: center;
  font-size: 1.2rem;
}

.ai-icon {
  margin-right: 10px;
  font-size: 1.4rem;
}

.rec-loading {
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.rec-content {
  padding: 15px;
}

.rec-text {
  margin: 0 0 20px;
  padding: 15px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
  color: #e3f2fd;
  font-family: monospace;
  white-space: pre-wrap;
  font-size: 0.9rem;
  line-height: 1.5;
}

.rec-drones h4 {
  margin: 0 0 10px;
  color: #4fc3f7;
  font-size: 1rem;
}

/* 无人机列表样式 */
.drone-selection {
  margin: 20px 0;
}

.drone-selection h3 {
  margin: 0 0 15px;
  color: #4fc3f7;
  font-size: 1.2rem;
}

.drone-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.filter-btn {
  background-color: rgba(255, 255, 255, 0.05);
  border: none;
  border-radius: 20px;
  padding: 8px 15px;
  color: #e3f2fd;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.filter-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.drones-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
}

.drone-item {
  display: flex;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.drone-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

.drone-item.selected {
  background-color: rgba(33, 150, 243, 0.15);
  border-left: 3px solid #2196F3;
}

.drone-icon {
  font-size: 2rem;
  margin-right: 15px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drone-info {
  flex: 1;
}

.drone-name {
  font-weight: bold;
  color: #e3f2fd;
  margin-bottom: 5px;
  font-size: 1.1rem;
}

.drone-model {
  color: #90caf9;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.drone-type {
  font-size: 0.8rem;
  color: #4fc3f7;
  background-color: rgba(79, 195, 247, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
  margin-bottom: 10px;
}

.drone-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.drone-stat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  width: 45px;
  font-size: 0.85rem;
  color: #90caf9;
}

.stat-value {
  font-size: 0.85rem;
  min-width: 40px;
  text-align: right;
}

.battery-indicator,
.signal-indicator {
  height: 8px;
  flex: 1;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.battery-level,
.signal-level {
  height: 100%;
  border-radius: 4px;
}

.battery-level.high,
.signal-level.high {
  background-color: #4CAF50;
}

.battery-level.medium,
.signal-level.medium {
  background-color: #FFC107;
}

.battery-level.low,
.signal-level.low {
  background-color: #F44336;
}

.drone-capabilities {
  display: flex;
  margin-bottom: 5px;
}

.capability-label {
  width: 60px;
  font-size: 0.85rem;
  color: #90caf9;
}

.capability-value {
  flex: 1;
  font-size: 0.85rem;
  color: #e3f2fd;
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.task-tag {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}

.selection-mark {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4CAF50;
}

/* 已选无人机样式 */
.selected-drones {
  margin: 20px 0;
}

.selected-drones h3 {
  margin: 0 0 15px;
  color: #4fc3f7;
  font-size: 1.2rem;
}

.selected-drones-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.selected-drone-item {
  background-color: rgba(33, 150, 243, 0.15);
  border-radius: 8px;
  padding: 12px;
  min-width: 180px;
  display: flex;
  position: relative;
}

.selected-drone-icon {
  font-size: 1.5rem;
  margin-right: 12px;
}

.selected-drone-info {
  flex: 1;
}

.selected-drone-name {
  font-weight: bold;
  color: #e3f2fd;
  margin-bottom: 2px;
  font-size: 0.9rem;
}

.selected-drone-type {
  color: #90caf9;
  font-size: 0.8rem;
  margin-bottom: 5px;
}

.selected-drone-stats {
  display: flex;
  gap: 10px;
}

.drone-stat-item {
  font-size: 0.8rem;
  color: #e3f2fd;
  display: flex;
  align-items: center;
}

.stat-icon {
  margin-right: 5px;
  font-size: 0.9rem;
}

.remove-drone-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  background-color: rgba(244, 67, 54, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  padding: 0;
  line-height: 1;
}

.remove-drone-btn:hover {
  background-color: rgba(244, 67, 54, 0.8);
}

/* 任务信息样式 */
.mission-info {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-item {
  display: flex;
  margin-bottom: 15px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  width: 100px;
  color: #90caf9;
  font-weight: bold;
}

.info-value {
  flex: 1;
  color: #e3f2fd;
}

.info-input {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 8px 12px;
  color: #e3f2fd;
  font-size: 0.95rem;
}

/* 任务类型样式 */
.mission-types {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.mission-types h3 {
  margin: 0 0 15px;
  color: #4fc3f7;
  font-size: 1.2rem;
}

.types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
}

.mission-type-item {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.mission-type-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.mission-type-item.selected {
  background-color: rgba(33, 150, 243, 0.15);
  border: 1px solid #2196F3;
}

.mission-type-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.mission-type-name {
  text-align: center;
  color: #e3f2fd;
  font-size: 0.9rem;
}

.mission-type-check {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #4CAF50;
}

/* 适合的无人机样式 */
.suitable-drones {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.suitable-drones h3 {
  margin: 0 0 15px;
  color: #4fc3f7;
  font-size: 1.2rem;
}

.suitable-drones-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.suitable-drone-item {
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 12px;
  min-width: 180px;
  display: flex;
  align-items: center;
}

.suitable-drone-item.selected {
  background-color: rgba(33, 150, 243, 0.15);
  border-left: 3px solid #2196F3;
}

.suitable-drone-icon {
  font-size: 1.5rem;
  margin-right: 12px;
  width: 30px;
  text-align: center;
}

.suitable-drone-info {
  flex: 1;
}

.suitable-drone-name {
  font-weight: bold;
  color: #e3f2fd;
  margin-bottom: 2px;
  font-size: 0.9rem;
}

.suitable-drone-type {
  color: #90caf9;
  font-size: 0.8rem;
  margin-bottom: 5px;
}

.suitable-drone-battery {
  font-size: 0.8rem;
  color: #e3f2fd;
  display: flex;
  align-items: center;
}

.battery-icon {
  margin-right: 5px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.finish-btn {
  background-color: #4CAF50;
}

.finish-btn:hover {
  background-color: #388E3C;
}

.cancel-btn {
  background-color: #F44336;
}

.cancel-btn:hover {
  background-color: #D32F2F;
}

.location-feedback {
  background-color: rgba(19, 47, 76, 0.8);
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border: 1px solid #1e3a5f;
}

.selected-location {
  color: #e3f2fd;
  font-size: 14px;
}

.selected-location p {
  margin: 5px 0;
}

/* 视频监控相关样式 */
.video-monitoring-panel {
  margin-top: 20px;
  background-color: #132f4c;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  background-color: #0a1929;
  border-bottom: 1px solid #1e3a5f;
}

.panel-header h4 {
  margin: 0;
  color: #4fc3f7;
  font-size: 1.1rem;
}

.close-button {
  background: none;
  border: none;
  color: #90caf9;
  font-size: 1.5rem;
  cursor: pointer;
}

.close-button:hover {
  color: #ffffff;
}

.video-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 15px;
  padding: 15px;
  max-height: 600px;
  overflow-y: auto;
}

.video-feed-container {
  background-color: #1e3a5f;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
}

.video-feed-container:hover {
  transform: translateY(-5px);
}

.video-feed-container.active {
  border-color: #2196F3;
}

.video-feed-container.warning {
  border-color: #FF9800;
}

.video-feed-container.critical {
  border-color: #F44336;
  animation: pulse 2s infinite;
}

.video-header {
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.3);
}

.video-title {
  font-weight: bold;
  font-size: 0.9rem;
  color: #ffffff;
}

.alert-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.video-content {
  position: relative;
}

.video-feed {
  width: 100%;
  aspect-ratio: 16/9;
  position: relative;
  overflow: hidden;
}

.video-feed img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.effect-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.detection-box {
  position: absolute;
  background-color: rgba(33, 150, 243, 0.7);
  border: 2px solid #2196F3;
  border-radius: 4px;
  padding: 8px;
  color: white;
  font-size: 0.8rem;
}

.license-plate-effect .detection-box {
  top: 60%;
  left: 50%;
  transform: translate(-50%, -50%);
  min-width: 150px;
}

.person-detection-effect .detection-box {
  top: 40%;
  left: 30%;
  border-color: #9C27B0;
  background-color: rgba(156, 39, 176, 0.7);
}

.warning-box {
  top: 20px;
  right: 20px;
  border-color: #F44336;
  background-color: rgba(244, 67, 54, 0.7);
}

.detection-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.detection-result {
  display: flex;
  flex-direction: column;
}

.detection-value {
  font-weight: bold;
}

.detection-confidence {
  font-size: 0.75rem;
  opacity: 0.9;
}

.warning-text {
  color: #ffeb3b;
}

.video-metadata {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: white;
}

.video-timestamp {
  font-weight: bold;
}

.video-location {
  font-size: 0.75rem;
  opacity: 0.8;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(244, 67, 54, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0);
  }
}

/* 无人机状态列表样式 */
.active-drones {
  margin-top: 20px;
}

.active-drones h4 {
  color: #4fc3f7;
  margin: 0 0 15px;
  font-size: 1.1rem;
}

.drone-status-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 15px;
}

.drone-status-item {
  background-color: #132f4c;
  border-radius: 8px;
  padding: 15px;
}

.drone-status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.drone-name {
  font-weight: bold;
  color: white;
}

.drone-status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  background-color: #304FFE;
}

.drone-status-badge.active {
  background-color: #4CAF50;
}

.drone-status-badge.returning {
  background-color: #FFC107;
}

.drone-status-badge.charging {
  background-color: #FF9800;
}

.drone-status-badge.maintenance {
  background-color: #F44336;
}

.drone-status-details {
  margin-bottom: 15px;
}

.status-detail {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.detail-icon {
  width: 16px;
  height: 16px;
  margin-right: 10px;
}

.detail-icon.battery {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%2367C23A' d='M17 5v2H7V5h10m0-2H7a2 2 0 00-2 2v2a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2V3a2 2 0 00-2-2zM7 11h10v9H7v-9z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: contain;
}

.detail-icon.signal {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23409EFF' d='M5 20h2v-7H5v7zm4 0h2V9H9v11zm4 0h2V6h-2v14zm4 0h2V3h-2v17z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: contain;
}

.progress-bar {
  height: 8px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  flex: 1;
  overflow: hidden;
  margin-right: 10px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
}

.progress-fill.battery {
  background: linear-gradient(to right, #f44336, #ffeb3b, #4caf50);
}

.progress-fill.signal {
  background: linear-gradient(to right, #f44336, #ffeb3b, #4caf50);
}

.detail-value {
  min-width: 40px;
  text-align: right;
  font-size: 0.9rem;
}

.drone-actions {
  display: flex;
  gap: 10px;
}

.small-button {
  flex: 1;
  padding: 6px 12px;
  background-color: #1976D2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: background-color 0.3s;
}

.small-button:hover {
  background-color: #1565C0;
}

.small-button:disabled {
  background-color: #455A64;
  cursor: not-allowed;
}
</style> 