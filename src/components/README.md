# Skydio地理API可视化系统 - 功能使用指南

## 1. 组件间数据通信和状态同步

系统通过Pinia状态管理实现了全局状态共享和组件间通信，主要功能包括：

### 使用方法

```javascript
// 在需要状态共享的组件中导入
import { useVisualizationStore } from '@/store/visualization';

// 在组件setup中使用
const visualizationStore = useVisualizationStore();

// 添加筛选条件
visualizationStore.addFilter({
  id: 'filter-1',
  field: 'city',
  operator: 'equal',
  value: '北京'
});

// 选择数据点
visualizationStore.selectDataPoint(dataPoint);

// 获取筛选后的数据
const filteredData = visualizationStore.filteredData(rawData);
```

## 2. 3D可视化类型

系统支持多种3D可视化类型，包括：

- 3D散点图 (scatter3D): 用于展示多维度数据关系
- 3D柱状图 (bar3D): 用于比较不同类别的数值
- 热力表面图 (heatmapSurface): 用于展示连续变化的热力数据
- 3D地理图 (geoMap3D): 用于地理空间数据可视化
- 3D时间序列 (timeSeries3D): 用于展示数据随时间变化的趋势

### 使用方法

```vue
<ThreeDVisualizationComponent
  :data="dataArray"
  :config="{
    xField: 'latitude',
    yField: 'longitude', 
    zField: 'value',
    colorField: 'temperature',
    timeField: 'timestamp' // 仅时间序列可视化需要
  }"
  visualization-type="heatmapSurface"
  @error="handleError"
/>
```

## 3. 时间轴动画功能

支持对时间序列数据进行动态播放，控制速度及帧跳转：

### 使用方法

1. 选择"3D时间序列"可视化类型
2. 确保数据中包含时间字段，并在config中设置timeField
3. 使用界面底部的时间控制器：
   - 播放/暂停: 开始或暂停动画
   - 上一帧/下一帧: 控制帧移动
   - 速度控制: 0.5x~4x之间切换
   - 时间滑块: 拖动到特定时间点

## 4. 性能优化

针对大数据量场景，系统实现了以下性能优化：

- 实例化渲染 (Instanced Rendering): 对于超过1000个点的数据集自动启用
- 自适应LOD (Level of Detail): 根据设备性能动态调整渲染质量
- 数据抽样: 对超大数据集进行智能抽样，保留数据特征
- WebGL优化: 优化材质和光照计算

### 使用方法

性能优化会自动应用，无需额外设置。如需手动控制，可以：

```vue
<ThreeDVisualizationComponent
  :data="largeDataArray"
  :performance-mode="true" // 启用极致性能模式
  :sampling-rate="0.5" // 设置采样率
/>
```

## 5. 移动设备支持

系统针对移动设备做了全面适配：

- 响应式界面: 自动调整布局适应不同屏幕尺寸
- 触摸控制: 优化的触摸交互和手势操作
- 渲染优化: 在移动设备上自动降低渲染复杂度

### 使用方法

移动设备支持自动启用，特殊手势操作包括：

- 双指缩放: 放大/缩小场景
- 单指拖动: 旋转视角
- 双击: 重置视角
- 长按: 显示数据详情

## 6. DeepSeek AI集成

系统与DeepSeek AI深度集成，提供智能推荐可视化方式：

- 数据特征自动分析
- 智能推荐最适合的可视化类型
- 自动配置最优参数

### 使用方法

在交互式筛选组件中：

1. 启用DeepSeek功能: `deepSeekEnabled="true"`
2. 点击"AI推荐可视化"按钮
3. 从推荐列表中选择合适的可视化方式
4. 系统会自动应用推荐的配置

```vue
<InteractiveFilteringComponent
  :charts="chartConfigs"
  :data="dataArray"
  :deepSeek-enabled="true"
  @visualization-recommend="applyRecommendation"
/>
```

## 常见问题解决

**问题1: 3D可视化显示空白**
- 检查数据格式是否正确
- 确认WebGL支持是否开启
- 降低数据量或使用性能模式

**问题2: 移动设备操作卡顿**
- 减少同时显示的数据点数量
- 启用性能模式
- 关闭高级光照效果

**问题3: 组件间数据同步失效**
- 确保store已正确安装
- 检查数据字段名称是否匹配
- 在mounted生命周期后使用

## 下一步功能规划

- 支持更多数据源连接
- 提供更多3D可视化类型
- 增强AI分析能力
- 添加导出和分享功能
- 实现更深度的协同筛选 