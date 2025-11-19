import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../pages/Dashboard';
import RealTimeData from '../pages/RealTimeData';
import Settings from '../pages/Settings';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: Dashboard,
    },
    {
      path: '/realtime',
      name: 'RealTimeData',
      component: RealTimeData,
    },
    {
      path: '/settings',
      name: 'Settings',
      component: Settings,
    },
  ],
});

export default router;
