<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
import { useAuthStore } from './stores/auth';
const auth = useAuthStore();
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 font-sans">
    <nav class="bg-indigo-600 text-white shadow-lg sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center space-x-4">
            <RouterLink to="/" class="flex items-center gap-2">
              <span class="text-2xl font-bold tracking-tight">SysHub</span>
            </RouterLink>
            <div class="hidden md:flex space-x-4 ml-6">
              <RouterLink to="/projects" class="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition">The Hub (Proyectos)</RouterLink>
              <RouterLink to="/blogs" class="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition">Artículos</RouterLink>
              <RouterLink to="/forums" class="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition">Sys-Reddit (Foros)</RouterLink>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <template v-if="auth.token">
              <span class="text-sm text-indigo-200 mr-2">Hola, <strong class="text-white">{{ auth.user?.name }}</strong> ({{ typeof auth.user?.role === 'object' ? auth.user?.role?.name : auth.user?.role }})</span>
              <RouterLink :to="`/users/${auth.user?.id}`" class="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition">Mi Perfil</RouterLink>
              <RouterLink v-if="auth.user?.role === 'ADMIN' || auth.user?.role?.name === 'ADMIN'" to="/admin" class="hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium transition">Admin</RouterLink>
              <button @click="auth.logout(); $router.push('/')" class="bg-indigo-700 hover:bg-indigo-800 px-4 py-2 rounded-md text-sm font-medium transition shadow">Salir</button>
            </template>
            <template v-else>
              <RouterLink to="/login" class="hover:text-indigo-200 px-3 py-2 text-sm font-medium transition">Iniciar Sesión</RouterLink>
              <RouterLink to="/register" class="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md text-sm font-medium transition shadow">Registrarse</RouterLink>
            </template>
          </div>
        </div>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
      <RouterView />
    </main>
  </div>
</template>
