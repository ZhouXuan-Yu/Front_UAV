<script setup lang="ts">
import { ref } from 'vue';
import Logo from '../common/Logo.vue';
import { RouterLink } from 'vue-router';

const partners = ref([
  { id: 1, image: 'https://ext.same-assets.com/913537297/1124492884.jpeg', alt: '华北区域合作伙伴' },
  { id: 2, image: 'https://ext.same-assets.com/913537297/2962017561.jpeg', alt: '华东区域合作伙伴' },
  { id: 3, image: 'https://ext.same-assets.com/913537297/2419577417.png', alt: '华南区域合作伙伴' },
  { id: 4, image: 'https://ext.same-assets.com/913537297/145035404.jpeg', alt: '西部区域合作伙伴' }
]);

const footerLinks = ref({
  products: [
    { name: 'X10系列', url: '#' },
    { name: 'X10D系列', url: '#' }, 
    { name: '智能监控站', url: '#' },
    { name: '软件服务', url: '#' }
  ],
  solutions: [
    { name: '路径规划', url: '/path-planning' },
    { name: '人员识别', url: '/person-recognition' },
    { name: '车辆监控', url: '/vehicle-monitoring' },
    { name: '全部解决方案', url: '#' }
  ],
  resources: [
    { name: '技术资源', url: '#' },
    { name: '数据仪表盘', url: '/data-dashboard' },
    { name: '知识图谱', url: '/knowledge-graph' },
    { name: '合作伙伴', url: '#' }
  ],
  company: [
    { name: '关于我们', url: '#' },
    { name: '技术博客', url: '#' },
    { name: '招贤纳士', url: '#' },
    { name: '安全中心', url: '#' }
  ]
});

const supportLinks = ref([
  { name: '支持中心', url: '#' },
  { name: '培训课程', url: '#' }
]);

const shopLinks = ref([
  { name: '品牌商城', url: '#' },
  { name: 'S2+配件', url: '#' }
]);

const socialLinks = ref([
  { name: '领英', icon: 'linkedin', url: '#' },
  { name: '微信', icon: 'wechat', url: '#' },
  { name: '微博', icon: 'weibo', url: '#' },
  { name: '哔哩哔哩', icon: 'bilibili', url: '#' },
  { name: '抖音', icon: 'douyin', url: '#' }
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
              <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <!-- 领英图标 -->
                <path v-if="social.icon === 'linkedin'" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                <!-- 微信图标 -->
                <path v-if="social.icon === 'wechat'" fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
                <!-- 微博图标 -->
                <path v-if="social.icon === 'weibo'" d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.03 10.03 0 01-3.127 1.184A4.92 4.92 0 0012.64 7.37a14 14 0 01-10.19-5.16c-.427.73-.666 1.577-.666 2.475 0 1.71.87 3.213 2.188 4.096a4.936 4.936 0 01-2.228-.616c-.054 1.281.63 2.468 1.67 3.32 1.07.853 2.487 1.282 3.908 1.196a4.907 4.907 0 01-2.228.084 4.951 4.951 0 004.632 3.432A9.91 9.91 0 010 19.54a14.1 14.1 0 007.591 2.213c9.142 0 14.143-7.54 14.143-14.077 0-.214 0-.428-.015-.64A10.063 10.063 0 0024 4.59z" />
                <!-- 哔哩哔哩图标 -->
                <path v-if="social.icon === 'bilibili'" fill-rule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clip-rule="evenodd" />
                <!-- 抖音图标 -->
                <path v-if="social.icon === 'douyin'" fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" />
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
</style>
