<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const message = ref('');
const error = ref('');
const loading = ref(false);

const requestReset = async () => {
  error.value = '';
  message.value = '';
  loading.value = true;
  try {
    await axios.post('http://localhost:3000/auth/forgot-password', { email: email.value });
    message.value = 'Si el correo existe, se ha enviado un código de recuperación.';
    setTimeout(() => {
      router.push(`/reset-password?email=${encodeURIComponent(email.value)}`);
    }, 2000);
  } catch (err: any) {
    error.value = 'Ocurrió un error al procesar la solicitud.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="max-w-md mx-auto mt-16 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
    <div class="text-center mb-8">
      <h2 class="text-3xl font-extrabold text-slate-900">Recuperar Contraseña</h2>
      <p class="text-slate-500 mt-2">Ingresa tu correo para recibir un código</p>
    </div>

    <form @submit.prevent="requestReset" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
        <input v-model="email" type="email" required class="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors" placeholder="tu@correo.com" />
      </div>

      <div v-if="error" class="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{{ error }}</div>
      <div v-if="message" class="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{{ message }}</div>

      <button type="submit" :disabled="loading" class="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-70 shadow-md">
        {{ loading ? 'Enviando...' : 'Enviar Código' }}
      </button>
    </form>

    <div class="mt-6 text-center text-sm">
      <RouterLink to="/login" class="font-medium text-slate-500 hover:text-indigo-600 transition">Volver al login</RouterLink>
    </div>
  </div>
</template>
