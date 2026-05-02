import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('../views/HomeView.vue') },
    { path: '/login', component: () => import('../views/auth/LoginView.vue') },
    { path: '/register', component: () => import('../views/auth/RegisterView.vue') },
    { path: '/forgot-password', component: () => import('../views/auth/ForgotView.vue') },
    { path: '/reset-password', component: () => import('../views/auth/ResetView.vue') },
    { 
      path: '/dashboard', 
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    { 
      path: '/projects', 
      component: () => import('../views/projects/ProjectsView.vue')
    },
    {
      path: '/forums',
      name: 'forums',
      component: () => import('../views/forums/ForumsView.vue')
    },
    {
      path: '/blogs',
      name: 'blogs',
      component: () => import('../views/blogs/BlogsView.vue')
    },
    {
      path: '/blogs/:id',
      name: 'blog-detail',
      component: () => import('../views/blogs/BlogDetailView.vue')
    },
    {
      path: '/projects/:id',
      name: 'project-detail',
      component: () => import('../views/projects/ProjectDetailView.vue')
    },
    {
      path: '/users/:id',
      name: 'user-profile',
      component: () => import('../views/users/UserProfileView.vue')
    },
    { 
      path: '/admin', 
      component: () => import('../views/admin/AdminView.vue'),
      meta: { requiresAuth: true, role: 'ADMIN' }
    },
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.token) {
    next('/login');
  } else if (to.meta.role && authStore.user?.role !== to.meta.role) {
    next('/');
  } else {
    next();
  }
});

export default router;
