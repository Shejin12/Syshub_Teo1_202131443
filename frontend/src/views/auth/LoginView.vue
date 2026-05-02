<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const role = ref('ESTUDIANTE');
const error = ref('');
const loading = ref(false);

const login = async () => {
  error.value = '';
  loading.value = true;
  try {
    const res = await axios.post('http://localhost:3000/auth/login', {
      email: email.value,
      password: password.value,
      role: role.value,
    });
    authStore.setAuth(res.data.user, res.data.access_token);
    router.push('/dashboard');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al iniciar sesión';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-extrabold text-slate-900">Iniciar Sesión</h2>
      <p class="text-slate-500 mt-2">Accede a tu cuenta de SysHub</p>
    </div>

    <form @submit.prevent="login" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
        <input v-model="email" type="email" required class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors" placeholder="tu@correo.com" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
        <input v-model="password" type="password" required class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors" placeholder="••••••••" />
      </div>

      <div class="flex items-center justify-between">
        <RouterLink to="/forgot-password" class="text-sm font-medium text-indigo-600 hover:text-indigo-500">¿Olvidaste tu contraseña?</RouterLink>
      </div>

      <div v-if="error" class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{{ error }}</div>

      <button type="submit" :disabled="loading" class="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 shadow-md">
        {{ loading ? 'Iniciando...' : 'Entrar' }}
      </button>
    </form>

    <div class="mt-8 text-center text-sm text-slate-500">
      ¿No tienes cuenta? <RouterLink to="/register" class="font-medium text-indigo-600 hover:text-indigo-500">Regístrate</RouterLink>
    </div>
  </div>
</template>
