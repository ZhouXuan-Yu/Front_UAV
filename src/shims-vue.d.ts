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