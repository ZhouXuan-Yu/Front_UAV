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
      component: () => import('../views/PathPlanningView.vue')
    },
    {
      path: '/person-recognition',
      name: 'person-recognition',
      component: () => import('../views/PersonRecognitionView.vue')
    },
    {
      path: '/vehicle-monitoring',
      name: 'vehicle-monitoring',
      component: () => import('../views/VehicleMonitoringView.vue')
    },
    {
      path: '/disaster-detection',
      name: 'disaster-detection',
      component: () => import('../views/DisasterDetectionView.vue')
    },
    {
      path: '/license-plate-recognition',
      name: 'license-plate-recognition',
      component: () => import('../views/LicensePlateRecognitionView.vue')
    },
    {
      path: '/data-dashboard',
      name: 'data-dashboard',
      component: () => import('../views/DataDashboardView.vue')
    },
    {
      path: '/data-dashboard-detail',
      name: 'data-dashboard-detail',
      component: () => import('../views/DataDashboardDetailView.vue')
    },
    {
      path: '/knowledge-graph',
      name: 'knowledge-graph',
      component: () => import('../views/KnowledgeGraphView.vue')
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
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
