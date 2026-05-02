<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const blogs = ref<any[]>([]);
const loading = ref(true);
const showEditor = ref(false);
const newBlog = ref({ title: '', content: '' });

const fetchBlogs = async () => {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:3000/blogs');
    blogs.value = res.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const createBlog = async () => {
  try {
    await axios.post('http://localhost:3000/blogs', newBlog.value);
    showEditor.value = false;
    newBlog.value = { title: '', content: '' };
    fetchBlogs();
  } catch (error) {
    console.error(error);
  }
};

onMounted(fetchBlogs);
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900">Artículos y Tutoriales</h1>
        <p class="text-slate-500">Material redactado por auxiliares y administradores</p>
      </div>
      <button v-if="authStore.user?.role === 'AUXILIAR' || authStore.user?.role === 'ADMIN'" @click="showEditor = true" class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow hover:bg-indigo-700 transition">
        Escribir Artículo
      </button>
    </div>

    <!-- Feed de artículos -->
    <div v-if="loading" class="flex justify-center py-20"><div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div></div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="blog in blogs" :key="blog.id" class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-lg transition-all relative flex flex-col">
        <RouterLink :to="`/blogs/${blog.id}`" class="block group">
          <h3 class="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition">{{ blog.title }}</h3>
          <p class="text-sm text-slate-500 mb-4 flex-1 line-clamp-3">{{ blog.content.replace(/[#*`_]/g, '') }}</p>
        </RouterLink>
        
        <div class="space-y-3 mt-auto pt-4 border-t border-slate-50">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs">{{ blog.author?.name?.charAt(0) }}</div>
            <span class="text-sm font-medium text-slate-700">{{ blog.author?.name }}</span>
            <span class="text-xs text-slate-400 ml-auto">{{ new Date(blog.createdAt).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Editor Modal -->
    <Teleport to="body">
      <div v-if="showEditor" class="fixed inset-0 z-[100]">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showEditor = false"></div>
        <div class="absolute inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
              <button @click="showEditor = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition text-3xl leading-none z-10">&times;</button>
              
              <div class="p-6 md:p-8">
                <h2 class="text-2xl font-bold mb-6 text-slate-800">Redactar Artículo</h2>
                <form @submit.prevent="createBlog" class="space-y-5">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Título *</label>
                    <input v-model="newBlog.title" required class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold outline-none transition" placeholder="Escribe un título atrapante..." />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Contenido (Soporta Markdown) *</label>
                    <textarea v-model="newBlog.content" required rows="12" class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono text-sm bg-slate-50 outline-none transition resize-y" placeholder="# Mi primer artículo..."></textarea>
                  </div>
                  <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                    <button type="button" @click="showEditor = false" class="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition">Cancelar</button>
                    <button type="submit" class="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-indigo-700 transition">Publicar</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
