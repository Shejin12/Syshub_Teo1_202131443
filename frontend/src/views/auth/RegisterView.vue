<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const name = ref('');
const email = ref('');
const password = ref('');
const role = ref('ESTUDIANTE');
const error = ref('');
const loading = ref(false);

const register = async () => {
  error.value = '';
  loading.value = true;
  try {
    const res = await axios.post('http://localhost:3000/auth/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value,
    });
    authStore.setAuth(res.data.user, res.data.access_token);
    router.push('/dashboard');
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Error al registrarse';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-extrabold text-slate-900">Crear Cuenta</h2>
      <p class="text-slate-500 mt-2">Únete a SysHub</p>
    </div>

    <form @submit.prevent="register" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
        <input v-model="name" type="text" required class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors" placeholder="Juan Pérez" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
        <input v-model="email" type="email" required class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors" placeholder="tu@correo.com" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
        <input v-model="password" type="password" required minlength="6" class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors" placeholder="••••••••" />
      </div>

      <div v-if="error" class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{{ error }}</div>

      <button type="submit" :disabled="loading" class="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 shadow-md">
        {{ loading ? 'Registrando...' : 'Registrarse' }}
      </button>
    </form>

    <div class="mt-8 text-center text-sm text-slate-500">
      ¿Ya tienes cuenta? <RouterLink to="/login" class="font-medium text-indigo-600 hover:text-indigo-500">Inicia sesión</RouterLink>
    </div>
  </div>
</template>
