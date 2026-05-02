<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const profile = ref<any>(null);
const loading = ref(true);
const editMode = ref(false);
const newName = ref('');

const fetchProfile = async () => {
  try {
    const res = await axios.get('http://localhost:3000/users/profile');
    profile.value = res.data;
    newName.value = profile.value.name;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const saveProfile = async () => {
  try {
    const res = await axios.put('http://localhost:3000/users/profile', { name: newName.value });
    authStore.user.name = res.data.name; // Update local user state
    profile.value.name = res.data.name;
    editMode.value = false;
  } catch (error) {
    console.error(error);
  }
};

onMounted(fetchProfile);
</script>

<template>
  <div v-if="loading" class="flex justify-center py-20">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
  </div>
  
  <div v-else class="max-w-5xl mx-auto space-y-8 animate-fade-in">
    <!-- Header Profile -->
    <div class="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center md:items-start">
      <div class="w-24 h-24 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg">
        {{ profile?.name?.charAt(0).toUpperCase() }}
      </div>
      <div class="flex-1 text-center md:text-left">
        <div v-if="!editMode" class="flex items-center justify-center md:justify-start gap-4">
          <h2 class="text-3xl font-bold text-slate-900">{{ profile?.name }}</h2>
          <button @click="editMode = true" class="text-sm text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full">Editar</button>
        </div>
        <div v-else class="flex items-center justify-center md:justify-start gap-4">
          <input v-model="newName" type="text" class="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
          <button @click="saveProfile" class="bg-indigo-600 text-white px-4 py-2 rounded-lg">Guardar</button>
          <button @click="editMode = false" class="text-slate-500">Cancelar</button>
        </div>
        
        <div class="mt-2 text-slate-500">{{ profile?.email }}</div>
        <div class="mt-4 inline-block px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide"
          :class="{
            'bg-green-100 text-green-700': profile?.role === 'ESTUDIANTE',
            'bg-blue-100 text-blue-700': profile?.role === 'AUXILIAR',
            'bg-purple-100 text-purple-700': profile?.role === 'ADMIN'
          }">
          {{ profile?.role }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Mi Material / Proyectos -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 class="text-xl font-bold text-slate-800">Mi Material (Proyectos)</h3>
          <span class="text-sm text-slate-500">{{ profile?.projects?.length || 0 }} elementos</span>
        </div>
        <div class="p-6">
          <ul v-if="profile?.projects?.length" class="space-y-4">
            <li v-for="proj in profile.projects" :key="proj.id" class="p-4 rounded-xl border hover:border-indigo-300 transition group">
              <div class="font-semibold text-indigo-700 group-hover:text-indigo-900">{{ proj.title }}</div>
              <div class="text-sm text-slate-500 mt-1 line-clamp-2">{{ proj.description }}</div>
              <div class="mt-3 flex gap-2 flex-wrap">
                <span v-for="tag in proj.tags.split(',')" :key="tag" class="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-xs">{{ tag.trim() }}</span>
              </div>
            </li>
          </ul>
          <div v-else class="text-center text-slate-500 py-8">
            Aún no has subido ningún proyecto.
          </div>
        </div>
      </div>

      <!-- Historial en Foros -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div class="p-6 border-b border-slate-100">
          <h3 class="text-xl font-bold text-slate-800">Historial en Foros</h3>
        </div>
        <div class="p-6">
          <h4 class="font-semibold text-slate-700 mb-3 border-b pb-2">Hilos Creados</h4>
          <ul v-if="profile?.threads?.length" class="space-y-3 mb-6">
            <li v-for="thread in profile.threads" :key="thread.id" class="text-sm text-indigo-600 hover:underline cursor-pointer">
              {{ thread.title }}
            </li>
          </ul>
          <div v-else class="text-sm text-slate-500 mb-6">No has creado hilos.</div>

          <h4 class="font-semibold text-slate-700 mb-3 border-b pb-2">Comentarios</h4>
          <ul v-if="profile?.comments?.length" class="space-y-3">
            <li v-for="comment in profile.comments" :key="comment.id" class="text-sm">
              <span class="text-slate-500">En <span class="font-medium text-slate-700">{{ comment.thread?.title }}</span>:</span>
              <p class="text-slate-800 mt-1 bg-slate-50 p-2 rounded">{{ comment.content }}</p>
            </li>
          </ul>
          <div v-else class="text-sm text-slate-500">No has comentado.</div>
        </div>
      </div>
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
