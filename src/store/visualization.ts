import { defineStore } from 'pinia';

export interface DataPoint {
  [key: string]: any;
}

export interface FilterCondition {
  field: string;
  operator: 'equal' | 'contains' | 'greaterThan' | 'lessThan' | 'between';
  value: any;
  id: string;
}

export interface VisualizationState {
  selectedDataPoints: DataPoint[];
  filterConditions: FilterCondition[];
  activeVisualizations: string[];
  sharedColorSchemes: Record<string, string[]>;
  lastUpdated: number;
}

export const useVisualizationStore = defineStore('visualization', {
  state: (): VisualizationState => ({
    selectedDataPoints: [],
    filterConditions: [],
    activeVisualizations: [],
    sharedColorSchemes: {
      blue: ['#e6f7ff', '#bae7ff', '#91d5ff', '#69c0ff', '#40a9ff', '#1890ff', '#096dd9', '#0050b3', '#003a8c', '#002766'],
      green: ['#f6ffed', '#d9f7be', '#b7eb8f', '#95de64', '#73d13d', '#52c41a', '#389e0d', '#237804', '#135200', '#092b00'],
      red: ['#fff1f0', '#ffccc7', '#ffa39e', '#ff7875', '#ff4d4f', '#f5222d', '#cf1322', '#a8071a', '#820014', '#5c0011'],
      purple: ['#f9f0ff', '#efdbff', '#d3adf7', '#b37feb', '#9254de', '#722ed1', '#531dab', '#391085', '#22075e', '#120338'],
      yellow: ['#fffbe6', '#fff1b8', '#ffe58f', '#ffd666', '#ffc53d', '#faad14', '#d48806', '#ad6800', '#874d00', '#613400']
    },
    lastUpdated: Date.now()
  }),
  
  getters: {
    hasActiveFilters: (state) => state.filterConditions.length > 0,
    
    filteredData: (state) => (data: DataPoint[]) => {
      if (!state.filterConditions.length) return data;
      
      return data.filter(item => {
        return state.filterConditions.every(filter => {
          const value = item[filter.field];
          
          switch(filter.operator) {
            case 'equal':
              return value === filter.value;
            case 'contains':
              return String(value).includes(String(filter.value));
            case 'greaterThan':
              return Number(value) > Number(filter.value);
            case 'lessThan':
              return Number(value) < Number(filter.value);
            case 'between':
              return Number(value) >= filter.value[0] && Number(value) <= filter.value[1];
            default:
              return true;
          }
        });
      });
    },
    
    getColorScheme: (state) => (name: string) => {
      return state.sharedColorSchemes[name] || state.sharedColorSchemes.blue;
    }
  },
  
  actions: {
    selectDataPoint(point: DataPoint) {
      // 检查是否已选中该点
      const pointIndex = this.selectedDataPoints.findIndex(p => {
        // 尝试使用id字段匹配
        if (p.id && point.id) {
          return p.id === point.id;
        }
        // 否则使用JSON.stringify比较
        return JSON.stringify(p) === JSON.stringify(point);
      });
      
      if (pointIndex === -1) {
        // 未选中，添加到选中列表
        this.selectedDataPoints.push(point);
      } else {
        // 已选中，从列表中移除
        this.selectedDataPoints.splice(pointIndex, 1);
      }
      
      // 更新时间戳触发响应式更新
      this.lastUpdated = Date.now();
    },
    
    clearSelectedPoints() {
      this.selectedDataPoints = [];
      this.lastUpdated = Date.now();
    },
    
    addFilter(condition: FilterCondition) {
      // 检查是否已存在相同字段的过滤条件
      const existingIndex = this.filterConditions.findIndex(f => f.field === condition.field);
      
      if (existingIndex !== -1) {
        // 更新现有过滤条件
        this.filterConditions[existingIndex] = condition;
      } else {
        // 添加新的过滤条件
        this.filterConditions.push(condition);
      }
      
      this.lastUpdated = Date.now();
    },
    
    removeFilter(id: string) {
      const index = this.filterConditions.findIndex(f => f.id === id);
      if (index !== -1) {
        this.filterConditions.splice(index, 1);
        this.lastUpdated = Date.now();
      }
    },
    
    clearFilters() {
      this.filterConditions = [];
      this.lastUpdated = Date.now();
    },
    
    registerVisualization(id: string) {
      if (!this.activeVisualizations.includes(id)) {
        this.activeVisualizations.push(id);
      }
    },
    
    unregisterVisualization(id: string) {
      const index = this.activeVisualizations.indexOf(id);
      if (index !== -1) {
        this.activeVisualizations.splice(index, 1);
      }
    }
  }
}); 