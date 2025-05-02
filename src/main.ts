/**
 * 文件名: main.ts
 * 描述: 应用程序的主入口文件
 * 在项目中的作用: 
 * - 创建和挂载Vue应用实例
 * - 注册全局插件和组件
 * - 配置路由、状态管理和其他全局依赖
 * - 将应用挂载到DOM中
 */

import { createApp } from "vue";
import { createPinia } from "pinia";
import "./assets/main.css";
import App from "./App.vue";
import router from './router';
import AOS from 'aos';
import 'aos/dist/aos.css';

// 导入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 直接导入Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Initialize AOS
AOS.init({
  duration: 800,
  easing: 'ease-out',
  once: true
});

const app = createApp(App);

// 创建和使用Pinia
const pinia = createPinia();
app.use(pinia);

// 注册Element Plus
app.use(ElementPlus);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router);

app.mount("#app");
