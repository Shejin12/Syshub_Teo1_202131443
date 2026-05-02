<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const email = ref('');
const code = ref('');
const newPassword = ref('');
const message = ref('');
const error = ref('');
const loading = ref(false);

onMounted(() => {
  if (route.query.email) {
    email.value = route.query.email as string;
  }
});

const resetPassword = async () => {
  error.value = '';
  message.value = '';
  loading.value = true;
  try {
    await axios.post('http://localhost:3000/auth/reset-password', {
      email: email.value,
      code: code.value,
      newPassword: newPassword.value
    });
    message.value = 'Contraseña actualizada con éxito.';
    setTimeout(() => router.push('/login'), 2000);
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Código inválido o expirado.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-extrabold text-slate-900">Nueva Contraseña</h2>
      <p class="text-slate-500 mt-2">Ingresa el código que recibiste en tu correo</p>
    </div>

    <form @submit.prevent="resetPassword" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
        <input v-model="email" type="email" required class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors" readonly />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Código de Recuperación</label>
        <input v-model="code" type="text" required class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors" placeholder="12345" />
      </div>
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
        <input v-model="newPassword" type="password" required minlength="6" class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors" placeholder="••••••••" />
      </div>

      <div v-if="error" class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{{ error }}</div>
      <div v-if="message" class="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{{ message }}</div>

      <button type="submit" :disabled="loading" class="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 shadow-md">
        {{ loading ? 'Actualizando...' : 'Actualizar Contraseña' }}
      </button>
    </form>
  </div>
</template>
