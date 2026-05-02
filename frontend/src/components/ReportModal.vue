<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const props = defineProps<{
  show: boolean;
  targetType: string;
  targetId: number;
}>();

const emit = defineEmits(['close', 'reported']);
const authStore = useAuthStore();
const reason = ref('');
const loading = ref(false);

const submitReport = async () => {
  if (!reason.value.trim()) return;
  loading.value = true;
  try {
    await axios.post('http://localhost:3000/reports', {
      targetType: props.targetType,
      targetId: props.targetId,
      reason: reason.value
    }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    reason.value = '';
    emit('reported');
    emit('close');
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-[200]">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>
      <div class="absolute inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md my-8">
            <button @click="$emit('close')" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition text-2xl leading-none z-10">&times;</button>
            <div class="p-6">
              <h2 class="text-xl font-bold mb-4 text-red-600 flex items-center gap-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Reportar Contenido
              </h2>
              <p class="text-sm text-slate-600 mb-4">Ayúdanos a entender el problema. Por favor proporciona un comentario detallando por qué estás reportando este contenido.</p>
              <textarea v-model="reason" rows="4" required class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition resize-none text-sm mb-4" placeholder="Describe el problema aquí..."></textarea>
              <div class="flex justify-end gap-3">
                <button @click="$emit('close')" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition text-sm">Cancelar</button>
                <button @click="submitReport" :disabled="!reason.trim() || loading" class="bg-red-600 text-white px-5 py-2 rounded-xl font-bold shadow-md hover:bg-red-700 transition disabled:opacity-50 text-sm">
                  {{ loading ? 'Enviando...' : 'Enviar Reporte' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
