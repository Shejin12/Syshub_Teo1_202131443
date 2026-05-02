<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth';
import ReportModal from '../../components/ReportModal.vue';

const authStore = useAuthStore();
const threads = ref<any[]>([]);
const loading = ref(true);
const showModal = ref(false);
const activeThread = ref<any>(null);
const commentContent = ref('');
const newThread = ref({ title: '', content: '', category: '' });
const replyingTo = ref<any>(null);
const searchQuery = ref('');

const showReportModal = ref(false);
const reportTargetType = ref('');
const reportTargetId = ref(0);

const openReport = (type: string, id: number) => {
  reportTargetType.value = type;
  reportTargetId.value = id;
  showReportModal.value = true;
};

const handleReported = () => {
  alert('Reporte enviado correctamente.');
};

const fetchThreads = async () => {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:3000/threads');
    threads.value = res.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const createThread = async () => {
  try {
    await axios.post('http://localhost:3000/threads', newThread.value);
    showModal.value = false;
    newThread.value = { title: '', content: '', category: '' };
    fetchThreads();
  } catch (error) {
    console.error(error);
  }
};

const openThread = async (id: number) => {
  try {
    const res = await axios.get(`http://localhost:3000/threads/${id}`);
    activeThread.value = res.data;
    replyingTo.value = null;
  } catch (error) {
    console.error(error);
  }
};

const postComment = async () => {
  if (!commentContent.value) return;
  try {
    if (replyingTo.value) {
      await axios.post(`http://localhost:3000/threads/${activeThread.value.id}/comments/${replyingTo.value.id}/reply`, { content: commentContent.value });
    } else {
      await axios.post(`http://localhost:3000/threads/${activeThread.value.id}/comments`, { content: commentContent.value });
    }
    commentContent.value = '';
    replyingTo.value = null;
    openThread(activeThread.value.id);
  } catch (error) {
    console.error(error);
  }
};

const deleteComment = async (commentId: number) => {
  if (!confirm('¿Eliminar este comentario?')) return;
  try {
    await axios.delete(`http://localhost:3000/threads/comments/${commentId}`);
    openThread(activeThread.value.id);
  } catch (error) {
    console.error(error);
  }
};

const vote = async (threadId: number, value: number) => {
  try {
    await axios.post(`http://localhost:3000/threads/${threadId}/vote`, { value });
    if (activeThread.value && activeThread.value.id === threadId) {
      openThread(threadId);
    }
    fetchThreads();
  } catch (error) {
    console.error(error);
  }
};

const getScore = (votes: any[]) => {
  if (!votes) return 0;
  return votes.reduce((acc, v) => acc + v.value, 0);
};

onMounted(fetchThreads);
</script>

<template>
  <div class="flex gap-6 animate-fade-in">
    <!-- Main Feed -->
    <div class="flex-1 space-y-6" :class="{ 'hidden md:block': activeThread }">
      <div class="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h1 class="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span class="text-orange-500">🔥</span> Sys-Reddit
        </h1>
        <button v-if="authStore.token" @click="showModal = true" class="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition shadow">Nuevo Hilo</button>
      </div>

      <div v-if="loading" class="flex justify-center py-10"><div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-900"></div></div>
      
      <div v-else class="space-y-4">
        <div v-for="thread in threads" :key="thread.id" @click="openThread(thread.id)" class="bg-white rounded-xl shadow-sm border border-slate-200 flex overflow-hidden hover:border-slate-300 transition cursor-pointer group">
          <div class="w-12 bg-slate-50 flex flex-col items-center py-3 border-r border-slate-100 gap-1">
            <button @click.stop="authStore.token ? vote(thread.id, 1) : null" class="text-slate-400 hover:text-orange-500 transition"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"></path></svg></button>
            <span class="text-sm font-bold text-slate-700">{{ getScore(thread.votes) }}</span>
            <button @click.stop="authStore.token ? vote(thread.id, -1) : null" class="text-slate-400 hover:text-indigo-500 transition"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button>
          </div>
          <div class="p-4 flex-1">
            <div class="flex items-center gap-2 text-xs text-slate-500 mb-2">
              <span v-if="thread.category" class="bg-slate-100 px-2 py-0.5 rounded-full font-medium">{{ thread.category }}</span>
              <span>Posteado por <span class="font-medium text-slate-700">{{ thread.author?.name }}</span></span>
            </div>
            <h3 class="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">{{ thread.title }}</h3>
            <p class="text-sm text-slate-600 mt-1 line-clamp-2">{{ thread.content }}</p>
            <div class="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500">
              <div class="flex items-center gap-1 hover:bg-slate-100 p-1.5 rounded transition"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>{{ thread._count?.comments }} Comentarios</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Thread View -->
    <div v-if="activeThread" class="flex-[2] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden sticky top-20 h-[calc(100vh-6rem)] flex flex-col">
      <div class="p-6 border-b border-slate-100 overflow-y-auto">
        <button @click="activeThread = null" class="md:hidden text-sm text-indigo-600 mb-4 flex items-center gap-1">← Volver</button>
        <div class="flex items-center gap-2 text-xs text-slate-500 mb-3 justify-between w-full">
          <div class="flex items-center gap-2">
            <span v-if="activeThread.category" class="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{{ activeThread.category }}</span>
            <span class="font-bold text-slate-700">Por {{ activeThread.author?.name }}</span>
            <span>• {{ new Date(activeThread.createdAt).toLocaleDateString() }}</span>
          </div>
          <button v-if="authStore.token" @click="openReport('THREAD', activeThread.id)" class="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 bg-red-50 rounded hover:bg-red-100 transition">
            Reportar Hilo
          </button>
        </div>
        <h2 class="text-2xl font-bold text-slate-900 mb-4">{{ activeThread.title }}</h2>
        <div class="prose prose-slate max-w-none text-sm md:text-base text-slate-700 whitespace-pre-wrap">{{ activeThread.content }}</div>
      </div>
      
      <div class="flex-1 overflow-y-auto p-6 bg-slate-50">
        <h4 class="font-bold text-slate-800 mb-4">{{ activeThread.comments?.length || 0 }} Comentarios principales</h4>
        <div v-if="authStore.token" class="mb-8">
          <div v-if="replyingTo" class="mb-2 text-sm text-indigo-600 font-medium flex justify-between items-center bg-indigo-50 px-3 py-2 rounded-md">
            <span>Respondiendo a: {{ replyingTo.author?.name }}</span>
            <button @click="replyingTo = null" class="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <textarea v-model="commentContent" rows="3" placeholder="¿Qué opinas?" class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 mb-2 bg-white"></textarea>
          <div class="flex justify-end"><button @click="postComment" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow">{{ replyingTo ? 'Responder' : 'Comentar' }}</button></div>
        </div>
        <div v-else class="mb-8 p-4 border border-slate-200 rounded-xl bg-slate-100 text-center text-sm text-slate-600">
          Debes <RouterLink to="/login" class="text-indigo-600 font-bold hover:underline">iniciar sesión</RouterLink> para comentar.
        </div>

        <div class="space-y-6">
          <div v-for="comment in activeThread.comments" :key="comment.id" class="flex flex-col gap-2">
            <div class="flex gap-4">
              <div class="w-8 h-8 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-slate-500 text-xs">{{ comment.author?.name?.charAt(0) }}</div>
              <div class="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                <button v-if="authStore.user?.role === 'ADMIN'" @click="deleteComment(comment.id)" class="absolute top-3 right-3 text-red-400 hover:text-red-600 hidden group-hover:block"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                <div class="flex items-center gap-2 mb-2">
                  <RouterLink :to="`/users/${comment.author?.id}`" class="text-sm font-bold text-slate-800 hover:underline">{{ comment.author?.name }}</RouterLink>
                  <span class="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{{ comment.author?.role?.name || comment.author?.role }}</span>
                  <button v-if="authStore.token" @click="replyingTo = comment; document.querySelector('textarea')?.focus()" class="ml-2 text-xs text-indigo-500 font-medium hover:underline">Responder</button>
                  <button v-if="authStore.token" @click="openReport('COMMENT', comment.id)" class="text-xs text-red-500 hover:underline">Reportar</button>
                </div>
                <p class="text-sm text-slate-700 whitespace-pre-wrap">{{ comment.content }}</p>
              </div>
            </div>
            
            <div v-if="comment.replies && comment.replies.length > 0" class="ml-12 space-y-3 mt-2 border-l-2 border-indigo-100 pl-4">
              <div v-for="reply in comment.replies" :key="reply.id" class="flex gap-3">
                <div class="w-6 h-6 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center font-bold text-slate-500 text-[10px]">{{ reply.author?.name?.charAt(0) }}</div>
                <div class="flex-1 bg-white p-3 rounded-lg border border-slate-100 shadow-sm relative group">
                  <button v-if="authStore.user?.role === 'ADMIN'" @click="deleteComment(reply.id)" class="absolute top-2 right-2 text-red-400 hover:text-red-600 hidden group-hover:block"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                  <div class="flex items-center gap-2 mb-1">
                    <RouterLink :to="`/users/${reply.author?.id}`" class="text-xs font-bold text-slate-800 hover:underline">{{ reply.author?.name }}</RouterLink>
                    <span class="text-[10px] text-slate-400">{{ reply.author?.role?.name || reply.author?.role }}</span>
                    <button v-if="authStore.token" @click="openReport('COMMENT', reply.id)" class="text-[10px] text-red-500 hover:underline">Reportar</button>
                  </div>
                  <p class="text-sm text-slate-600 whitespace-pre-wrap">{{ reply.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal completamente rediseñado para verse bien en cualquier pantalla -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[100]">
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showModal = false"></div>
        
        <!-- Contenedor del modal con scroll -->
        <div class="absolute inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <!-- Card del modal -->
            <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
              <!-- Botón cerrar -->
              <button 
                @click="showModal = false"
                class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition text-3xl leading-none z-10"
              >
                &times;
              </button>
              
              <!-- Contenido -->
              <div class="p-6 md:p-8">
                <h2 class="text-2xl font-bold text-slate-800 mb-6 pr-8">Crear Publicación</h2>
                
                <form @submit.prevent="createThread" class="space-y-5">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Título *</label>
                    <input 
                      v-model="newThread.title" 
                      required 
                      class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none" 
                      placeholder="Un título descriptivo..."
                      autocomplete="off"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
                    <input 
                      v-model="newThread.category" 
                      placeholder="Ej. Dudas Técnicas, Arquitectura..." 
                      class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none"
                      autocomplete="off"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Contenido *</label>
                    <textarea 
                      v-model="newThread.content" 
                      required 
                      rows="8" 
                      class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition outline-none resize-y" 
                      placeholder="Desarrolla tu idea aquí..."
                    ></textarea>
                  </div>
                  
                  <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
                    <button 
                      type="button" 
                      @click="showModal = false" 
                      class="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      class="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-md hover:bg-indigo-700 transition"
                    >
                      Publicar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
    
    <ReportModal :show="showReportModal" :targetType="reportTargetType" :targetId="reportTargetId" @close="showReportModal = false" @reported="handleReported" />
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>