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
