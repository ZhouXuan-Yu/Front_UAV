// 声明Vue组件的类型
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 声明全局AMap对象（高德地图）
declare interface Window {
  AMap: any;
}

// 第三方库声明
declare module 'three';
declare module 'three/examples/jsm/controls/OrbitControls';
declare module 'three/examples/jsm/loaders/GLTFLoader';
declare module 'echarts';
declare module 'gsap'; 