/**
 * 文件名: router/index.ts
 * 描述: 应用程序路由配置
 * 在项目中的作用: 
 * - 定义应用的路由结构和导航规则
 * - 配置路由与组件的映射关系
 * - 实现页面之间的切换和导航
 * - 管理路由懒加载和导航行为
 */

import { createRouter, createWebHistory } from 'vue-router'
import DataDashboardDetailView from '../views/DataDashboardDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/path-planning',
      name: 'path-planning',
      component: () => import('../views/PathPlanningView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/person-recognition',
      name: 'person-recognition',
      component: () => import('../views/PersonRecognitionView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/vehicle-monitoring',
      name: 'vehicle-monitoring',
      component: () => import('../views/VehicleMonitoringView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/disaster-detection',
      name: 'disaster-detection',
      component: () => import('../views/DisasterDetectionView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/license-plate-recognition',
      name: 'license-plate-recognition',
      component: () => import('../views/LicensePlateRecognitionView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/data-dashboard',
      name: 'data-dashboard',
      component: () => import('../views/DataDashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/data-dashboard-detail',
      name: 'data-dashboard-detail',
      component: DataDashboardDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/drone-task',
      name: 'drone-task',
      component: () => import('../views/DroneTaskDetailView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/knowledge-graph',
      name: 'knowledge-graph',
      component: () => import('../views/KnowledgeGraphView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/software-security/night-enhanced-recognition',
      name: 'night-enhanced-recognition',
      component: () => import('../views/NightEnhancedRecognitionView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/software-security/long-range-identification',
      name: 'long-range-identification',
      component: () => import('../views/LongRangeIdentificationView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/software-security/night-guardian',
      name: 'night-guardian',
      component: () => import('../views/NightGuardianView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('../views/ContactView.vue')
    },
    {
      path: '/element-demo',
      name: 'element-demo',
      component: () => import('../components/ElementDemo.vue')
    },
    {
      path: '/auth',
      name: 'auth',
      component: () => import('../views/AuthView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isLoggedIn = localStorage.getItem('currentUser')
  
  if (requiresAuth && !isLoggedIn) {
    // 设置需要登录的标记和原始目标路由信息，用于登录页面回跳
    localStorage.setItem('redirectAfterLogin', to.fullPath)
    // 设置需要显示登录提示弹窗的标记
    localStorage.setItem('showLoginPrompt', 'true')
    next('/auth')
  } else {
    next()
  }
})

export default router
