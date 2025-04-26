/**
 * 文件名: TheHeader.vue
 * 描述: 应用程序全局头部导航组件
 * 在项目中的作用: 
 * - 提供全站通用的顶部导航栏
 * - 包含Logo、导航菜单和用户操作区
 * - 响应式设计适配不同屏幕尺寸
 * - 实现站内导航和用户交互入口
 */

<!-- 导航栏页面，do you konw ，look my eyes -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { RouteLocationRaw } from 'vue-router';
import Logo from '../common/Logo.vue';
// 如果项目未安装naive-ui和@vicons/ionicons5，移除相关导入
// import { NDropdown, NIcon } from 'naive-ui';
// import { PersonCircle, LogOut } from '@vicons/ionicons5';

// 路由和导航状态
const route = useRoute();
const router = useRouter();
const isMenuOpen = ref(false);
const isScrolled = ref(false);
const isHeaderVisible = ref(true);
const activeDropdown = ref<string | null>(null);
let lastScrollTop = 0; // 记录上次滚动位置

// 用户状态
const currentUser = ref<{username: string, isLoggedIn: boolean} | null>(null);

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
  { id: 'dfr', label: '智程导航', route: '/path-planning', dropdown: false },
  { id: 'utilities', label: '智眸千析', route: '/person-recognition', dropdown: false },
  { id: 'national-security', label: '智慧知库', route: '/knowledge-graph', dropdown: false },
  { id: 'data-dashboard', label: '数据大屏', route: '/data-dashboard', dropdown: false },
  { id: 'more-solutions', label: '夜间识别专项', dropdown: true,
    items: [
    {
      label: '夜间增强识别',
      description: '采用特殊的图像增强算法，对夜间或低光照条件下的视频和图像进行处理，提升图像的清晰度和对比度，从而更准确地识别目标，确保夜间安防监控的有效性。',
      route: '/software-security/night-enhanced-recognition'
    },
    {
      label: '超远距离识别',
      description: '借助先进的图像处理算法和深度学习技术，对远距离拍摄的图像进行智能分析和识别，突破距离限制，提升安防监控的覆盖范围和精准度。',
      route: '/software-security/long-range-identification'
    },
    {
      label: '夜间保卫者',
      description: '整合多种软件技术，包括智能巡逻算法、目标检测和识别模型以及实时警报系统，专门针对夜间场景优化，提供全面的软件解决方案，守护区域安全。',
      route: '/software-security/night-guardian'
    }   //{ label: '场地安全', description: '通过自主无人机巡逻自动化周边安全', route: '/knowledge-graph' },
    ]
  },
  { id: 'products', label: '灾害预警', route: '/disaster-detection', dropdown: false },
  { id: 'resources', label: '车辆监控与报警', route: '/vehicle-monitoring', dropdown: false },
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

// 处理登出
const handleLogout = () => {
  localStorage.removeItem('currentUser');
  currentUser.value = null;
  
  // 触发用户状态更新事件
  window.dispatchEvent(new Event('user-state-changed'));
  
  // 如果在需要登录的页面，跳转到首页
  if (route.meta.requiresAuth) {
    router.push('/');
  }
  // 关闭下拉菜单
  closeDropdowns();
};

// 处理滚动事件
const handleScroll = () => {
  const currentScrollTop = window.scrollY;
  
  // 检测滚动方向并控制导航栏的显示/隐藏
  if (currentScrollTop > lastScrollTop && currentScrollTop > 50) {
    // 向下滚动，隐藏导航栏
    isHeaderVisible.value = false;
  } else {
    // 向上滚动，显示导航栏
    isHeaderVisible.value = true;
  }
  
  // 检测是否滚动超过临界值，用于样式变化
  isScrolled.value = currentScrollTop > 50;
  
  // 更新上次滚动位置
  lastScrollTop = currentScrollTop;
};

// 更新用户状态
const updateUserStatus = () => {
  console.log('更新用户状态被调用');
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      currentUser.value = JSON.parse(userStr);
      console.log('用户状态已更新:', currentUser.value);
    } catch (e) {
      currentUser.value = null;
      localStorage.removeItem('currentUser');
      console.error('解析用户数据出错:', e);
    }
  } else {
    currentUser.value = null;
    console.log('未找到用户数据');
  }
};

// 创建一个手动触发检查登录状态的方法
const checkLoginStatus = () => {
  console.log('检查登录状态...');
  updateUserStatus();
};

// 监听路由变化，每次路由变化时更新用户状态
watch(() => route.path, () => {
  updateUserStatus();
  console.log('路由变化，更新用户状态');
});

// 组件挂载与卸载时的事件监听
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // 初始检查滚动状态
  
  // 获取用户登录状态
  updateUserStatus();
  console.log('组件挂载，初始化用户状态');
  
  // 监听存储变化，更新用户状态
  window.addEventListener('storage', updateUserStatus);
  
  // 监听自定义用户状态变更事件
  window.addEventListener('user-state-changed', () => {
    updateUserStatus();
    console.log('接收到用户状态变更事件');
  });
  
  // 点击外部关闭下拉菜单
  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (activeDropdown.value && !target.closest('.nav-item')) {
      closeDropdowns();
    }
  });
  
  // 添加页面可见性变化事件监听，在用户切换回页面时检查登录状态
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      updateUserStatus();
      console.log('页面可见性变化，更新用户状态');
    }
  });
  
  // 在初始化后短暂延时再次检查登录状态，解决页面加载顺序问题
  setTimeout(updateUserStatus, 500);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('storage', updateUserStatus);
  window.removeEventListener('user-state-changed', updateUserStatus);
  document.removeEventListener('click', closeDropdowns);
  document.removeEventListener('visibilitychange', updateUserStatus);
});
</script>

<template>
  <div class="header-wrapper">
    <header :class="['header', { 'scrolled': isScrolled, 'hidden': !isHeaderVisible }]">
      <div class="container">
        <div class="left-section">
          <!-- Logo 部分 -->
          <div class="logo">
            <a href="/" @click.prevent="router.push('/')">
              <Logo :variant="'dark'" size="small" />
            </a>
          </div>

          <!-- 桌面导航 - 移到Logo旁边 -->
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
        </div>
        
        <!-- 右侧操作区 -->
        <div class="action-buttons">
          <a href="/contact" @click.prevent="router.push('/contact')" class="contact-button">联系我们</a>
          
          <!-- 未登录状态：显示登录/注册按钮 -->
          <a v-if="!currentUser" href="/auth" @click.prevent="router.push('/auth')" class="nav-link-plain">登录/注册</a>
          
          <!-- 已登录状态：显示用户名和下拉菜单 -->
          <div v-else class="user-dropdown nav-item">
            <button class="user-button" @click="toggleDropdown('user')">
              <svg class="user-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" stroke-width="1.5"/>
                <path d="M20 19C20 16.7909 16.4183 15 12 15C7.58172 15 4 16.7909 4 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>{{ currentUser.username }}</span>
              <svg class="dropdown-icon" :class="{ 'open': activeDropdown === 'user' }" viewBox="0 0 24 24">
                <path d="M7 10l5 5 5-5z" />
              </svg>
            </button>
            
            <!-- 用户下拉菜单 -->
            <div class="dropdown user-menu" :class="{ 'show': activeDropdown === 'user' }">
              <div class="dropdown-content">
                <div class="dropdown-item" @click="router.push('/profile')">
                  <h3>我的账号</h3>
                </div>
                <div class="dropdown-item" @click="handleLogout">
                  <h3>退出登录</h3>
                </div>
              </div>
            </div>
          </div>
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
              
              <!-- 移动端用户菜单项 -->
              <li v-if="currentUser" class="mobile-nav-item">
                <div class="mobile-user-info">
                  <svg class="user-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" stroke-width="1.5"/>
                    <path d="M20 19C20 16.7909 16.4183 15 12 15C7.58172 15 4 16.7909 4 19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  </svg>
                  <span>{{ currentUser.username }}</span>
                </div>
                <button class="mobile-nav-link" @click="router.push('/profile')">
                  我的账号
                </button>
                <button class="mobile-nav-link logout" @click="handleLogout">
                  退出登录
                </button>
              </li>
            </ul>
            
            <div class="mobile-cta">
              <a href="/contact" @click.prevent="router.push('/contact')" class="cta-button">联系我们</a>
              <!-- 未登录时显示登录/注册按钮 -->
              <a v-if="!currentUser" href="/auth" @click.prevent="router.push('/auth')" class="cta-button secondary">登录/注册</a>
            </div>
          </div>
        </div>
      </div>
    </header>
  </div>
  
  <!-- 页面标题区域 (仅在公共安全页面显示) -->
  <div v-if="route.path.includes('public-safety')" class="page-title-area">
    <div class="container">
      <h1>{{ pageTitle }}</h1>
      <p class="subtitle">通过为执法部门设计的自主无人机解决方案，改善响应时间和人员安全。</p>
    </div>
  </div>
</template>

<style scoped>
.header-wrapper {
  width: 100%;
  padding: 18px 23px; /* 添加内边距，让导航栏与页面边缘有距离 */
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.header {
  position: relative; /* 修改为相对定位 */
  width: 100%;
  background-color: rgba(255, 255, 255, 0.35); /* 【透明度参数】增加透明度，从0.5调整为0.35 */
  backdrop-filter: blur(12px); /* 【模糊参数】增强模糊效果，确保可读性 */
  padding: 25px 0; /* 【高度参数1】增加上下内边距，使导航栏更高 */
  transition: all 0.3s ease;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.06); /* 【阴影参数】调整阴影，增强悬浮感 */
  border-radius: 16px; /* 【圆角参数】增加圆角 */
  max-width: 1950px; /* 【宽度参数】增加最大宽度，让整体更大 */
  margin: 0 auto; /* 居中显示 */
}

.header.scrolled {
  background-color: rgba(255, 255, 255, 0.55); /* 【透明度参数】滚动时的透明度 */
  padding: 20px 0; /* 【高度参数2】滚动时的高度，仍保持较大 */
}

.header.hidden {
  transform: translateY(-100%);
}

.container {
  max-width: 1800px; /* 【内容宽度参数】增加容器最大宽度 */
  margin: 0 auto;
  padding: 0 30px; /* 【内容边距参数】增加内容区域内边距 */
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 新增左侧区域样式 */
.left-section {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding: 0 12px; /* 【Logo边距参数】增加内边距 */
  transform: scale(1.2); /* 【Logo大小参数】更大的缩放比例 */
  margin-right: 20px; /* 添加右侧间距，与导航菜单分开 */
}

/* 桌面导航 */
.desktop-nav {
  margin-left: 0; /* 移除左边距，与Logo紧邻 */
  margin-right: 0; /* 移除右边距 */
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
  font-size: 19px; /* 【字体参数1】再增大字体尺寸 */
  font-weight: 500;
  color: #333; /* 黑色文字 */
  text-decoration: none;
  padding: 12px 18px; /* 【按钮大小参数】增加按钮内边距，使按钮更大 */
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  position: relative;
}

.nav-link:hover, .nav-link.active, .nav-link-plain:hover {
  color: #000; /* 鼠标悬停时加深颜色 */
}

.nav-link:after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 50%;
  background-color: #333; /* 下划线颜色 */
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
  background-color: rgba(255, 255, 255, 0.95); /* 白色背景 */
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
  z-index: 10;
  min-width: 280px;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(0, 0, 0, 0.05);
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
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateX(3px);
}

.dropdown-item h3 {
  margin: 0 0 5px;
  font-size: 16px;
  font-weight: 600;
  color: #333; /* 黑色文字 */
}

.dropdown-item p {
  margin: 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.7);
}

/* 右侧操作区 */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 24px; /* 增加按钮间距 */
}

.contact-button {
  background-color: rgba(34, 33, 31, 0.9);
  color: white;
  padding: 12px 30px; /* 【联系按钮大小参数】增加按钮内边距 */
  border-radius: 8px; /* 【联系按钮圆角参数】增加圆角 */
  font-weight: 600;
  font-size: 17px; /* 【字体参数2】与导航链接字体大小保持一致 */
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
  color: #333; /* 黑色文字 */
}

.nav-link-plain:after {
  content: '';
  position: absolute;
  width: 0;
  height: 1px;
  bottom: 0;
  left: 0;
  background-color: #333; /* 黑色下划线 */
  transition: width 0.3s ease;
}

.nav-link-plain:hover:after {
  width: 100%;
}

/* 用户按钮和下拉菜单 */
.user-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.user-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.user-icon {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  stroke-width: 1.5;
}

.user-dropdown {
  margin-left: 0;
}

.user-menu {
  min-width: 180px;
  right: 0;
  left: auto;
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
  background-color: #333; /* 黑色图标 */
  transition: all 0.3s ease;
}

.menu-icon:before,
.menu-icon:after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  background-color: #333; /* 黑色图标 */
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
  background-color: rgba(255, 255, 255, 0.98);
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
  color: #333; /* 黑色文字 */
  padding: 14px 0;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-nav-link:hover, .mobile-nav-link.active {
  color: #3B82F6;
  border-bottom-color: #3B82F6;
}

.mobile-nav-link.logout {
  color: #e53935;
}

.mobile-user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.mobile-dropdown {
  margin: 5px 0 15px;
  padding-left: 10px;
  border-left: 2px solid rgba(0, 0, 0, 0.1);
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
  background-color: rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.mobile-dropdown-item:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transform: translateX(3px);
}

.mobile-dropdown-item h3 {
  margin: 0 0 5px;
  font-size: 16px;
  color: #333; /* 黑色文字 */
}

.mobile-dropdown-item p {
  margin: 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.7);
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
  border: 1px solid rgba(0, 0, 0, 0.3);
  color: #333; /* 黑色文字 */
}

.cta-button.secondary:hover {
  background-color: rgba(0, 0, 0, 0.05);
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
