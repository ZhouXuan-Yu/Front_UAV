<!-- 导航栏页面，do you konw ，look my eyes -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';
import Logo from '../common/Logo.vue';

// 路由和导航状态
const route = useRoute();
const router = useRouter();
const isMenuOpen = ref(false);
const isScrolled = ref(false);
const activeDropdown = ref<string | null>(null);

// 页面标题
const pageTitle = ref('Skydio 公共安全无人机解决方案');

// 导航菜单结构
interface NavSubItem {
  label: string;
  description: string;
  route: RouteLocationRaw;
}

interface NavItem {
  id: string;
  label: string;
  dropdown: boolean;
  items?: NavSubItem[];
  route?: RouteLocationRaw;
}

const navItems: NavItem[] = [
  { id: 'dfr', label: '无人机先遣系统', route: '/path-planning', dropdown: false },
  { id: 'utilities', label: '公共设施', route: '/person-recognition', dropdown: false },
  { id: 'national-security', label: '国家安全', route: '/vehicle-monitoring', dropdown: false },
  { id: 'more-solutions', label: '更多解决方案', dropdown: true,
    items: [
      { label: '资产检查', description: '对关键基础设施进行自动化检查', route: '/license-plate-recognition' },
      { label: '公共安全', description: '通过为执法部门设计的自主无人机解决方案', route: '/disaster-detection' },
      { label: '测量与绘图', description: '创建任何区域的详细、准确的3D地图', route: '/data-dashboard' },
      { label: '场地安全', description: '通过自主无人机巡逻自动化周边安全', route: '/knowledge-graph' },
    ]
  },
  { id: 'products', label: '产品', route: '/products', dropdown: false },
  { id: 'resources', label: '资源', route: '/resources', dropdown: false },
];

// 处理导航
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  document.body.style.overflow = isMenuOpen.value ? 'hidden' : '';
};

const toggleDropdown = (id: string) => {
  if (activeDropdown.value === id) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = id;
  }
};

const closeDropdowns = () => {
  activeDropdown.value = null;
};

const closeMenu = () => {
  isMenuOpen.value = false;
  document.body.style.overflow = '';
};

// 处理导航跳转
const handleNavigation = (item: NavItem) => {
  if (!item.dropdown && item.route) {
    router.push(item.route);
    closeMenu();
  } else if (item.dropdown) {
    toggleDropdown(item.id);
  }
};

const navigateToSubItem = (route: RouteLocationRaw) => {
  router.push(route);
  closeMenu();
  closeDropdowns();
};

// 处理滚动事件
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

// 组件挂载与卸载时的事件监听
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // 初始检查滚动状态
  
  // 点击外部关闭下拉菜单
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (activeDropdown.value && !target.closest('.nav-item')) {
      closeDropdowns();
    }
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', closeDropdowns);
});
</script>

<template>
  <header :class="['header', { 'scrolled': isScrolled }]">
    <div class="container">
      <!-- Logo 部分 -->
      <div class="logo">
        <a href="/" @click.prevent="router.push('/')">
          <Logo :variant="'dark'" size="small" />
        </a>
      </div>

      <!-- 桌面导航 -->
      <nav class="desktop-nav">
        <ul class="nav-list">
          <li v-for="item in navItems" :key="item.id" class="nav-item">
            <button
              @click="handleNavigation(item)"
              class="nav-link"
              :class="{ 'active': route.path.includes(String(item.route)) || activeDropdown === item.id }"
            >
              {{ item.label }}
              <svg v-if="item.dropdown" class="dropdown-icon" :class="{ 'open': activeDropdown === item.id }" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>

            <!-- 下拉菜单 -->
            <div v-if="item.dropdown && item.items" class="dropdown" :class="{ 'show': activeDropdown === item.id }">
              <div class="dropdown-content">
                <div
                  v-for="subItem in item.items"
                  :key="subItem.label"
                  class="dropdown-item"
                  @click="navigateToSubItem(subItem.route)"
                >
                  <h3>{{ subItem.label }}</h3>
                  <p>{{ subItem.description }}</p>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>
      
      <!-- 右侧操作区 -->
      <div class="action-buttons">
        <a href="/contact" @click.prevent="router.push('/contact')" class="contact-button">联系我们</a>
        <a href="/careers" @click.prevent="router.push('/careers')" class="nav-link-plain">招聘</a>
        <button class="locale-selector">
          <span>中文</span>
          <svg class="locale-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M2 12H22" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22" stroke="currentColor" stroke-width="1.5"/>
            <path d="M12 2C9.49872 4.73835 8.07725 8.29203 8 12C8.07725 15.708 9.49872 19.2616 12 22" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </button>
      </div>

      <!-- 移动菜单按钮 -->
      <button class="mobile-menu-button" @click="toggleMenu" aria-label="菜单">
        <span :class="['menu-icon', { 'open': isMenuOpen }]"></span>
      </button>

      <!-- 移动导航菜单 -->
      <div class="mobile-nav" :class="{ 'open': isMenuOpen }">
        <div class="mobile-nav-container">
          <ul class="mobile-nav-list">
            <li v-for="item in navItems" :key="item.id" class="mobile-nav-item">
              <button
                @click="handleNavigation(item)"
                class="mobile-nav-link"
                :class="{ 'active': route.path.includes(String(item.route)) || activeDropdown === item.id }"
              >
                {{ item.label }}
                <svg v-if="item.dropdown" class="dropdown-icon" :class="{ 'open': activeDropdown === item.id }" viewBox="0 0 24 24">
                  <path d="M7 10l5 5 5-5z" />
                </svg>
              </button>

              <!-- 移动下拉菜单 -->
              <div v-if="item.dropdown && item.items && activeDropdown === item.id" class="mobile-dropdown">
                <div
                  v-for="subItem in item.items"
                  :key="subItem.label"
                  class="mobile-dropdown-item"
                  @click="navigateToSubItem(subItem.route)"
                >
                  <h3>{{ subItem.label }}</h3>
                  <p>{{ subItem.description }}</p>
                </div>
              </div>
            </li>
          </ul>
          
          <div class="mobile-cta">
            <a href="/contact" @click.prevent="router.push('/contact')" class="cta-button">联系我们</a>
            <a href="/careers" @click.prevent="router.push('/careers')" class="cta-button secondary">招聘</a>
            <button class="locale-selector mobile">
              <span>中文</span>
              <svg class="locale-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M2 12H22" stroke="currentColor" stroke-width="1.5"/>
                <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22" stroke="currentColor" stroke-width="1.5"/>
                <path d="M12 2C9.49872 4.73835 8.07725 8.29203 8 12C8.07725 15.708 9.49872 19.2616 12 22" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
  
  <!-- 页面标题区域 (仅在公共安全页面显示) -->
  <div v-if="route.path.includes('public-safety')" class="page-title-area">
    <div class="container">
      <h1>{{ pageTitle }}</h1>
      <p class="subtitle">通过为执法部门设计的自主无人机解决方案，改善响应时间和人员安全。</p>
    </div>
  </div>
</template>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: rgba(40, 40, 50, 0.85); /* 半透明灰色背景 */
  backdrop-filter: blur(5px); /* 增加背景模糊效果 */
  z-index: 1000;
  padding: 12px 0;
  transition: all 0.3s ease;
}

.header.scrolled {
  background-color: rgba(40, 40, 50, 0.95); /* 滚动时增加不透明度 */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  padding: 8px 0; /* 滚动时减小高度 */
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* 桌面导航 */
.desktop-nav {
  margin-left: auto;
  margin-right: 20px;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;
}

.nav-item {
  position: relative;
  margin: 0 12px;
}

.nav-link, .nav-link-plain {
  font-size: 14px;
  font-weight: 500;
  color: white;
  text-decoration: none;
  padding: 8px 12px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover, .nav-link.active, .nav-link-plain:hover {
  color: #f0f0f0;
}

.nav-link:after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 50%;
  background-color: white;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-link:hover:after, .nav-link.active:after {
  width: 70%;
}

.dropdown-icon {
  width: 16px;
  height: 16px;
  margin-left: 4px;
  transition: transform 0.3s ease;
  fill: currentColor;
}

.dropdown-icon.open {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.dropdown {
  position: absolute;
  top: 100%;
  left: -20px;
  background-color: rgba(45, 45, 55, 0.95);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 10;
  min-width: 280px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

.dropdown.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(8px);
}

.dropdown-content {
  padding: 15px;
}

.dropdown-item {
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 4px;
}

.dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(3px);
}

.dropdown-item h3 {
  margin: 0 0 5px;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.dropdown-item p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

/* 右侧操作区 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 20px;
}

.contact-button {
  background-color: rgba(0, 120, 212, 0.9);
  color: white;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
}

.contact-button:hover {
  background-color: rgba(0, 120, 212, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.nav-link-plain {
  position: relative;
  padding: 4px 0;
}

.nav-link-plain:after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: 0;
  left: 0;
  background-color: white;
  transition: width 0.3s ease;
}

.nav-link-plain:hover:after {
  width: 100%;
}

.locale-selector {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.locale-selector:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.locale-icon {
  width: 20px;
  height: 20px;
}

/* 移动菜单按钮 */
.mobile-menu-button {
  display: none;
  background: none;
  border: none;
  width: 30px;
  height: 30px;
  position: relative;
  cursor: pointer;
  z-index: 1001;
  padding: 0;
}

.menu-icon {
  display: block;
  position: relative;
  width: 100%;
  height: 2px;
  background-color: white;
  transition: all 0.3s ease;
}

.menu-icon:before,
.menu-icon:after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: white;
  transition: all 0.3s ease;
}

.menu-icon:before {
  top: -8px;
}

.menu-icon:after {
  bottom: -8px;
}

.menu-icon.open {
  background-color: transparent;
}

.menu-icon.open:before {
  transform: rotate(45deg);
  top: 0;
}

.menu-icon.open:after {
  transform: rotate(-45deg);
  bottom: 0;
}

/* 移动导航 */
.mobile-nav {
  position: fixed;
  top: 0;
  right: -100%;
  width: 100%;
  height: 100vh;
  background-color: rgba(35, 35, 45, 0.98);
  z-index: 1000;
  transition: right 0.3s ease;
  overflow-y: auto;
  backdrop-filter: blur(8px);
}

.mobile-nav.open {
  right: 0;
}

.mobile-nav-container {
  padding: 80px 24px 30px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.mobile-nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-nav-item {
  margin-bottom: 12px;
}

.mobile-nav-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: white;
  padding: 14px 0;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-nav-link:hover, .mobile-nav-link.active {
  color: #3B82F6;
  border-bottom-color: #3B82F6;
}

.mobile-dropdown {
  margin: 5px 0 15px;
  padding-left: 10px;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.mobile-dropdown-item {
  padding: 15px;
  margin-bottom: 8px;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-dropdown-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(3px);
}

.mobile-dropdown-item h3 {
  margin: 0 0 5px;
  font-size: 16px;
  color: white;
}

.mobile-dropdown-item p {
  margin: 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.mobile-cta {
  margin-top: auto;
  padding-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cta-button {
  display: block;
  width: 100%;
  background-color: rgba(0, 120, 212, 0.9);
  color: white;
  padding: 14px 20px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 16px;
  text-align: center;
  text-decoration: none;
  transition: all 0.2s ease;
}

.cta-button:hover {
  background-color: rgba(0, 120, 212, 1);
  transform: translateY(-2px);
}

.cta-button.secondary {
  background-color: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.cta-button.secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.locale-selector.mobile {
  margin-top: 12px;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .desktop-nav, .action-buttons {
    display: none;
  }
  
  .mobile-menu-button {
    display: block;
  }
  
  .mobile-nav {
    display: block;
  }
  
  .page-title-area {
    padding: 90px 0 30px;
  }
  
  .page-title-area h1 {
    font-size: 2rem;
  }
  
  .container {
    padding: 0 16px;
  }
}

@media (min-width: 993px) {
  .mobile-menu-button {
    display: none;
  }
  
  .mobile-nav {
    display: none;
  }
}

/* 页面标题区域 */
.page-title-area {
  background-color: rgba(59, 130, 246, 0.05);
  background-image: linear-gradient(to bottom, rgba(59, 130, 246, 0.1), transparent);
  padding: 120px 0 40px;
  margin-top: 0;
}

.page-title-area h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #222;
}

.page-title-area .subtitle {
  font-size: 1.2rem;
  color: #555;
  max-width: 800px;
  line-height: 1.6;
}
</style>
