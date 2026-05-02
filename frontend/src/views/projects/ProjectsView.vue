<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const projects = ref<any[]>([]);
const loading = ref(true);
const searchQuery = ref('');
const showModal = ref(false);

const newProject = ref({ title: '', description: '', techStack: '', tags: '', category: '' });
const fileToUpload = ref<File | null>(null);

const handleFileUpload = (event: any) => {
  fileToUpload.value = event.target.files[0];
};

const fetchProjects = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`http://localhost:3000/projects?q=${searchQuery.value}`);
    projects.value = res.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const createProject = async () => {
  try {
    const formData = new FormData();
    formData.append('title', newProject.value.title);
    formData.append('description', newProject.value.description);
    formData.append('techStack', newProject.value.techStack);
    formData.append('tags', newProject.value.tags);
    formData.append('category', newProject.value.category);
    if (fileToUpload.value) {
      formData.append('file', fileToUpload.value);
    }

    await axios.post('http://localhost:3000/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    showModal.value = false;
    newProject.value = { title: '', description: '', techStack: '', tags: '', category: '' };
    fileToUpload.value = null;
    fetchProjects();
  } catch (error) {
    console.error(error);
  }
};

const highlightProject = async (id: number, currentHighlight: boolean) => {
  try {
    await axios.put(`http://localhost:3000/projects/${id}/highlight`, { isHighlighted: !currentHighlight });
    fetchProjects();
  } catch (error) {
    console.error(error);
  }
};

onMounted(fetchProjects);
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <div class="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900">The Hub</h1>
        <p class="text-slate-500">Repositorio de Proyectos y Tareas</p>
      </div>
      <div class="flex gap-4 w-full md:w-auto">
        <input v-model="searchQuery" @keyup.enter="fetchProjects" type="text" placeholder="Buscar por título, tag o tecnología..." class="flex-1 md:w-80 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-slate-50" />
        <button @click="fetchProjects" class="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-xl font-medium hover:bg-indigo-200">Buscar</button>
        <button v-if="authStore.token" @click="showModal = true" class="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium shadow-md hover:bg-indigo-700 hover:shadow-lg transition">Subir Proyecto</button>
      </div>
    </div>

    <!-- Modal for new project rediseñado -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-[100]">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showModal = false"></div>
        <div class="absolute inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
              <button @click="showModal = false" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition text-3xl leading-none z-10">&times;</button>
              
              <div class="p-6 md:p-8">
                <h2 class="text-2xl font-bold mb-6 text-slate-800">Nuevo Proyecto</h2>
                <form @submit.prevent="createProject" class="space-y-5">
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Título *</label>
                    <input v-model="newProject.title" required class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Descripción *</label>
                    <textarea v-model="newProject.description" required rows="4" class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition resize-y"></textarea>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-2">Stack Tecnológico</label>
                      <input v-model="newProject.techStack" placeholder="Vue, NestJS..." class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-slate-700 mb-2">Etiquetas (por coma)</label>
                      <input v-model="newProject.tags" placeholder="frontend, IA, db" class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                    </div>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Categoría</label>
                    <input v-model="newProject.category" placeholder="Desarrollo Web" class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-slate-700 mb-2">Archivo / Carpeta comprimida *</label>
                    <input type="file" @change="handleFileUpload" accept=".zip,.rar,.tar,.gz,.pdf" required class="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                  </div>
                  <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                    <button type="button" @click="showModal = false" class="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition">Cancelar</button>
                    <button type="submit" class="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-md hover:bg-indigo-700 transition">Guardar</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Project List -->
    <div v-if="loading" class="flex justify-center py-20"><div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div></div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="project in projects" :key="project.id" class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-lg transition-all relative flex flex-col" :class="{'ring-2 ring-yellow-400 bg-yellow-50/10': project.highlightedBy}">
        <div v-if="project.highlightedBy" class="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          ⭐ Destacado por Auxiliar
        </div>
        <RouterLink :to="`/projects/${project.id}`" class="block group">
          <h3 class="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition">{{ project.title }}</h3>
          <p class="text-sm text-slate-500 mb-4 flex-1 line-clamp-3">{{ project.description }}</p>
        </RouterLink>
        
        <div class="space-y-3 mt-auto">
          <div>
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stack</span>
            <div class="text-sm text-slate-700 font-medium mt-1">{{ project.techStack }}</div>
          </div>
          <div class="flex flex-wrap gap-2">
            <span v-for="t in project.tags" :key="t.tag.id" class="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">{{ t.tag.name }}</span>
          </div>
        </div>
        
        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">{{ project.author?.name?.charAt(0) }}</div>
            <span class="text-xs font-medium text-slate-600">{{ project.author?.name }}</span>
          </div>
          <button v-if="authStore.user?.role?.name === 'AUXILIAR' || authStore.user?.role?.name === 'ADMIN' || authStore.user?.role === 'AUXILIAR' || authStore.user?.role === 'ADMIN'" @click="highlightProject(project.id, !!project.highlightedBy)" class="text-xs font-medium px-3 py-1 rounded border hover:bg-slate-50 transition" :class="project.highlightedBy ? 'text-yellow-600 border-yellow-200' : 'text-slate-500 border-slate-200'">
            {{ project.highlightedBy ? 'Quitar Destacado' : 'Destacar' }}
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="!loading && projects.length === 0" class="text-center py-20 text-slate-500 bg-white rounded-2xl border border-dashed border-slate-300">
      <div class="text-4xl mb-4">🔍</div>
      <h3 class="text-lg font-medium text-slate-900 mb-1">No se encontraron proyectos</h3>
      <p>Intenta con otros términos de búsqueda o sé el primero en subir uno.</p>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
