/**
 * 文件名: shims-vue.d.ts
 * 描述: TypeScript声明文件，用于定义Vue组件和第三方库的类型
 * 在项目中的作用: 
 * - 提供Vue文件和组件的类型定义
 * - 声明全局接口和对象类型
 * - 增强IDE的代码提示和类型检查功能
 * - 确保TypeScript能正确识别和处理Vue组件和外部库
 */

// 声明Vue组件的类型
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 声明全局AMap对象（高德地图）
declare interface Window {
  AMap: any;
  initAMap: () => void;
}

// 第三方库声明
declare module 'three' {
  export * from 'three/src/Three';
  export class Scene {}
  export class PerspectiveCamera {}
  export class WebGLRenderer {}
  export class Object3D {}
  export class AnimationMixer {}
  export class Line {}
}

declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, Object3D } from 'three';
  export class OrbitControls {
    constructor(camera: Camera, domElement?: HTMLElement);
    update(): void;
    dispose(): void;
  }
}

declare module 'three/examples/jsm/loaders/GLTFLoader' {
  export class GLTFLoader {
    load(url: string, onLoad: Function, onProgress?: Function, onError?: Function): void;
  }
}

declare module 'gsap' {
  export default gsap;
  export const gsap: any;
  export namespace core {
    export class Timeline {
      to(target: any, config: any): this;
      from(target: any, config: any): this;
      fromTo(target: any, fromConfig: any, toConfig: any): this;
      play(): this;
      pause(): this;
      restart(): this;
      progress(value: number): this;
    }
  }
}
declare module 'echarts'; 