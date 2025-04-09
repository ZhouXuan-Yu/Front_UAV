import { createApp } from "vue";
import "./assets/main.css";
import App from "./App.vue";
import router from './router';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Initialize AOS
AOS.init({
  duration: 800,
  easing: 'ease-out',
  once: true
});

const app = createApp(App);

app.use(router);

app.mount("#app");
