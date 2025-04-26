<script setup lang="ts">
import { ref } from 'vue';
import Logo from '../common/Logo.vue';
import { RouterLink } from 'vue-router';

// 导入SVG图标
import WechatIcon from '@/assets/svg/微信.svg';
import WeiboIcon from '@/assets/svg/微博.svg';
import BilibiliIcon from '@/assets/svg/哔哩哔哩.svg';
import DouyinIcon from '@/assets/svg/抖音.svg';


const socialLinks = ref([
  { name: '微信', icon: 'wechat', url: '#', svg: WechatIcon },
  { name: '微博', icon: 'weibo', url: '#', svg: WeiboIcon },
  { name: '哔哩哔哩', icon: 'bilibili', url: '#', svg: BilibiliIcon },
  { name: '抖音', icon: 'douyin', url: '#', svg: DouyinIcon }
]);

const currentYear = new Date().getFullYear();
</script>

<template>
  <section class="bg-gray-100 text-gray-800">
    <!-- 合作伙伴展示区 -->
    
    <!-- 页脚区域 -->
    <footer class="py-12">
      <div class="container mx-auto px-4"> 
          <!-- 额外链接区域 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        </div>
        
        <!-- 版权和社交链接区域 -->
        <div class="pt-6 border-t border-gray-200">
          <p class="text-center text-gray-600 mb-4 flex items-center justify-center">
            <span class="mr-2">本项目构思到项目落地技术支持均由中国团队完成</span>
            <span class="flag-icon">🇨🇳</span>
          </p>
          
          <!-- 社交媒体图标 -->
          <div class="flex justify-center space-x-6 mb-6">
            <a 
              v-for="social in socialLinks" 
              :key="social.name"
              :href="social.url"
              :aria-label="social.name"
              class="text-gray-500 hover:text-sky-600 transition-colors duration-300"
            >
              <span class="sr-only">{{ social.name }}</span>
              
              <!-- 使用导入的SVG文件代替内联SVG -->
              <img v-if="social.svg" :src="social.svg" class="h-6 w-6 social-icon" :alt="social.name">
              
              <!-- 保留默认的LinkedIn图标 -->
              <svg v-else class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
          
          <!-- 地址和版权信息 -->
          <div class="text-center text-gray-500 text-sm">
            <p class="mb-2">总部地址：中国河南省郑州市惠济区英才街18号</p>
            <p>© {{ currentYear }} 空融智链 中国. 保留所有权利</p>
          </div>

          <!-- 法律链接 -->
          <div class="flex justify-center space-x-6 mt-6 text-sm text-gray-500">
            <RouterLink to="/" class="hover:text-sky-600 transition-colors">法律声明</RouterLink>
            <RouterLink to="/" class="hover:text-sky-600 transition-colors">隐私政策</RouterLink>
            <RouterLink to="/" class="hover:text-sky-600 transition-colors">Cookie政策</RouterLink>
            <button class="hover:text-sky-600 transition-colors">管理Cookie</button>
          </div>
        </div>
      </div>
    </footer>
  </section>
</template>

<style scoped>
.partner-logo-container {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.partner-logo-container:hover {
  background-color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.flag-icon {
  font-size: 1.25rem;
  margin-left: 0.5rem;
}

.btn-primary {
  background-color: #0284c7;
  color: white;
  border-radius: 0.375rem;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: #0369a1;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(2, 132, 199, 0.25);
}

/* 添加SVG图标样式 */
.social-icon {
  filter: grayscale(100%);
  opacity: 0.7;
  transition: all 0.3s ease;
}

a:hover .social-icon {
  filter: grayscale(0%);
  opacity: 1;
}
</style>
