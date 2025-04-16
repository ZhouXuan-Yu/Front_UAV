import { createApp } from "vue";
import "./assets/main.css";
import App from "./App.vue";
import router from './router';
import AOS from 'aos';
import 'aos/dist/aos.css';

// 导入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 导入Element Plus图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// Initialize AOS
AOS.init({
  duration: 800,
  easing: 'ease-out',
  once: true
});

const app = createApp(App);

// 注册Element Plus
app.use(ElementPlus);

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(router);

app.mount("#app");
