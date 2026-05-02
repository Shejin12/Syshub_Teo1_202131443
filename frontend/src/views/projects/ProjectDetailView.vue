<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute, RouterLink } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import ReportModal from '../../components/ReportModal.vue';

const route = useRoute();
const authStore = useAuthStore();
const project = ref<any>(null);
const loading = ref(true);

const commentContent = ref('');
const replyingTo = ref<number | null>(null);

const showReportModal = ref(false);
const reportTargetType = ref('');
const reportTargetId = ref(0);

const openReport = (type: string, id: number) => {
  reportTargetType.value = type;
  reportTargetId.value = id;
  showReportModal.value = true;
};

const handleReported = () => {
  alert('Reporte enviado correctamente. Gracias por ayudar a mantener la comunidad segura.');
};

const fetchProject = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/projects/${route.params.id}`);
    project.value = res.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const submitComment = async () => {
  try {
    const url = replyingTo.value
      ? `http://localhost:3000/projects/${project.value.id}/comments/${replyingTo.value}/reply`
      : `http://localhost:3000/projects/${project.value.id}/comments`;
    
    await axios.post(url, { content: commentContent.value }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    commentContent.value = '';
    replyingTo.value = null;
    fetchProject(); // Refresh project to show new comments
  } catch (error) {
    console.error(error);
  }
};

const getFileName = (url: string) => {
  if (!url) return '';
  const parts = url.split('/');
  return parts[parts.length - 1];
};

onMounted(fetchProject);
</script>

<template>
  <div v-if="loading" class="flex justify-center py-20">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
  </div>
  
  <div v-else-if="project" class="max-w-4xl mx-auto space-y-8 animate-fade-in">
    <div class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 relative" :class="{'ring-2 ring-yellow-400 bg-yellow-50/10': project.highlightedBy}">
      <div v-if="project.highlightedBy" class="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
        ⭐ Destacado por {{ project.highlightedBy.name }} (Auxiliar)
      </div>

      <div class="flex items-center gap-2 mb-4">
        <span class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold">{{ project.category || 'Sin categoría' }}</span>
      </div>

      <h1 class="text-4xl font-extrabold text-slate-900 mb-4">{{ project.title }}</h1>
      
      <div class="flex items-center gap-3 text-slate-500 text-sm mb-8 pb-8 border-b border-slate-100 justify-between">
        <div class="flex items-center gap-3">
          <RouterLink :to="`/users/${project.author.id}`" class="flex items-center gap-2 hover:text-indigo-600 transition group">
            <div class="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition">
              {{ project.author?.name?.charAt(0) }}
            </div>
            <span class="font-medium text-slate-700 group-hover:text-indigo-600">{{ project.author?.name }}</span>
          </RouterLink>
          <span>•</span>
          <span>{{ new Date(project.createdAt).toLocaleDateString() }}</span>
        </div>
        <button v-if="authStore.token" @click="openReport('PROJECT', project.id)" class="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition">
          Reportar Proyecto
        </button>
      </div>

      <div class="prose max-w-none text-slate-700 mb-8 whitespace-pre-wrap">{{ project.description }}</div>

      <div class="space-y-6">
        <div>
          <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Stack Tecnológico</h3>
          <div class="text-slate-800 font-medium">{{ project.techStack }}</div>
        </div>
        
        <div v-if="project.tags && project.tags.length">
          <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Etiquetas</h3>
          <div class="flex flex-wrap gap-2">
            <span v-for="t in project.tags" :key="t.tag.id" class="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
              {{ t.tag.name }}
            </span>
          </div>
        </div>

        <div v-if="project.fileUrl">
          <h3 class="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Archivos Adjuntos</h3>
          <a :href="`http://localhost:3000${project.fileUrl}`" target="_blank" download class="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-indigo-700 rounded-xl font-medium transition shadow-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Descargar {{ getFileName(project.fileUrl) }}
          </a>
        </div>
      </div>
    </div>

    <!-- Seccion de Comentarios -->
    <div class="bg-slate-50 rounded-2xl p-8 border border-slate-200">
      <h3 class="text-xl font-bold text-slate-800 mb-6">Comentarios ({{ project.comments?.length || 0 }})</h3>
      
      <!-- Lista de comentarios -->
      <div class="space-y-6 mb-8">
        <div v-for="comment in project.comments" :key="comment.id" class="flex gap-4 group">
          <div class="w-10 h-10 rounded-full bg-slate-300 flex-shrink-0 flex items-center justify-center font-bold text-slate-600 shadow-sm">{{ comment.author?.name?.charAt(0) }}</div>
          <div class="flex-1">
            <div class="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm relative">
              <div class="flex justify-between items-start mb-1">
                <span class="font-bold text-slate-800 text-sm">{{ comment.author?.name }}</span>
                <span class="text-xs text-slate-400">{{ new Date(comment.createdAt).toLocaleDateString() }}</span>
              </div>
              <p class="text-slate-700 text-sm whitespace-pre-wrap">{{ comment.content }}</p>
              <div v-if="authStore.token" class="mt-2 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="replyingTo = comment.id" class="text-xs font-semibold text-indigo-500 hover:text-indigo-700">Responder</button>
                <button @click="openReport('COMMENT', comment.id)" class="text-xs font-semibold text-red-500 hover:text-red-700">Reportar</button>
              </div>
            </div>
            
            <!-- Respuestas -->
            <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 ml-4 space-y-3 border-l-2 border-indigo-100 pl-4">
              <div v-for="reply in comment.replies" :key="reply.id" class="flex gap-3">
                <div class="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-slate-500 text-xs shadow-sm">{{ reply.author?.name?.charAt(0) }}</div>
                <div class="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex-1">
                  <div class="flex justify-between items-start mb-1">
                    <span class="font-bold text-slate-700 text-xs">{{ reply.author?.name }}</span>
                    <span class="text-[10px] text-slate-400">{{ new Date(reply.createdAt).toLocaleDateString() }}</span>
                  </div>
                  <p class="text-slate-600 text-sm">{{ reply.content }}</p>
                  <div v-if="authStore.token" class="mt-1 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="openReport('COMMENT', reply.id)" class="text-[10px] font-semibold text-red-500 hover:text-red-700">Reportar</button>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Input de respuesta -->
            <div v-if="replyingTo === comment.id" class="mt-3 ml-4 flex gap-3">
              <textarea v-model="commentContent" rows="2" class="flex-1 px-3 py-2 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none" placeholder="Escribe tu respuesta..."></textarea>
              <div class="flex flex-col gap-1 justify-end">
                <button @click="submitComment" :disabled="!commentContent.trim()" class="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50">Enviar</button>
                <button @click="replyingTo = null" class="text-slate-500 text-xs px-3 py-1 hover:bg-slate-100 rounded-lg">Cancelar</button>
              </div>
            </div>
          </div>
        </div>
        <div v-if="!project.comments?.length" class="text-center text-slate-500 py-6">Aún no hay comentarios.</div>
      </div>

      <!-- Escribir nuevo comentario -->
      <div v-if="authStore.token && replyingTo === null" class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex gap-4">
        <div class="w-10 h-10 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center font-bold text-indigo-700">{{ authStore.user?.name?.charAt(0) }}</div>
        <div class="flex-1">
          <textarea v-model="commentContent" rows="3" class="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm resize-none bg-slate-50 focus:bg-white transition" placeholder="Agrega un comentario a este proyecto..."></textarea>
          <div class="flex justify-end mt-2">
            <button @click="submitComment" :disabled="!commentContent.trim()" class="bg-indigo-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50">Comentar</button>
          </div>
        </div>
      </div>
      <div v-else-if="!authStore.token" class="text-center bg-white p-6 rounded-2xl border border-slate-200">
        <p class="text-slate-600 mb-2">Debes iniciar sesión para comentar.</p>
        <RouterLink to="/login" class="text-indigo-600 font-bold hover:underline">Iniciar Sesión</RouterLink>
      </div>
    </div>
  </div>
  
  <div v-else class="text-center py-20 text-slate-500">
    Proyecto no encontrado.
  </div>

  <ReportModal :show="showReportModal" :targetType="reportTargetType" :targetId="reportTargetId" @close="showReportModal = false" @reported="handleReported" />
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
