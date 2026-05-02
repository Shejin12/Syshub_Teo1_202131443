<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import axios from 'axios';

const route = useRoute();
const authStore = useAuthStore();
const profile = ref<any>(null);
const loading = ref(true);
const editingBio = ref(false);
const bioEdit = ref('');

const fetchProfile = async () => {
  try {
    const res = await axios.get(`http://localhost:3000/users/profile/${route.params.id}`);
    profile.value = res.data;
    bioEdit.value = profile.value.bio || '';
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const saveBio = async () => {
  try {
    await axios.put(`http://localhost:3000/users/profile`, { bio: bioEdit.value }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    profile.value.bio = bioEdit.value;
    editingBio.value = false;
  } catch (error) {
    console.error(error);
  }
};

onMounted(fetchProfile);
</script>

<template>
  <div v-if="loading" class="flex justify-center py-20"><div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div></div>
  <div v-else-if="profile" class="space-y-8 animate-fade-in max-w-5xl mx-auto">
    <div class="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-start md:items-center relative">
      <div class="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center text-4xl font-bold text-slate-500 shrink-0">
        {{ profile.name?.charAt(0) }}
      </div>
      <div class="flex-1 w-full">
        <h1 class="text-3xl font-extrabold text-slate-900 mb-1">{{ profile.name }}</h1>
        <p class="text-slate-500 mb-4">{{ profile.email }} • Rol: <span class="font-bold text-indigo-600">{{ typeof profile.role === 'object' ? profile.role?.name : profile.role }}</span></p>
        
        <div v-if="authStore.user?.id === profile.id" class="absolute top-8 right-8">
           <button v-if="!editingBio" @click="editingBio = true" class="text-sm text-indigo-600 font-medium hover:underline">Editar Biografía</button>
        </div>

        <div v-if="editingBio" class="mt-2 w-full">
          <textarea v-model="bioEdit" rows="3" placeholder="Escribe algo sobre ti..." class="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition resize-y text-sm"></textarea>
          <div class="flex gap-2 mt-2">
            <button @click="saveBio" class="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium shadow-sm hover:bg-indigo-700">Guardar</button>
            <button @click="editingBio = false" class="text-slate-500 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-100">Cancelar</button>
          </div>
        </div>
        <div v-else>
          <p v-if="profile.bio" class="text-slate-700 text-sm whitespace-pre-wrap">{{ profile.bio }}</p>
          <p v-else class="text-slate-400 text-sm italic">Sin biografía.</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Proyectos Compartidos</h2>
        <div v-if="profile.projects?.length" class="space-y-4">
          <RouterLink :to="`/projects/${p.id}`" v-for="p in profile.projects" :key="p.id" class="block p-4 border border-slate-100 rounded-xl hover:border-indigo-300 hover:shadow-sm transition">
            <h3 class="font-bold text-slate-900">{{ p.title }}</h3>
            <p class="text-sm text-slate-500 truncate">{{ p.description }}</p>
          </RouterLink>
        </div>
        <p v-else class="text-slate-500 italic text-sm">Aún no ha subido proyectos.</p>

        <div v-if="profile.highlightedProjects?.length" class="mt-8">
          <h2 class="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">⭐ Proyectos Destacados por {{ profile.name.split(' ')[0] }}</h2>
          <div class="space-y-4">
            <RouterLink :to="`/projects/${p.id}`" v-for="p in profile.highlightedProjects" :key="p.id" class="block p-4 border border-yellow-200 bg-yellow-50/30 rounded-xl hover:border-yellow-400 hover:shadow-sm transition relative overflow-hidden">
              <h3 class="font-bold text-slate-900">{{ p.title }}</h3>
              <p class="text-xs text-slate-500 mb-2">Por: <span class="font-bold">{{ p.author?.name }}</span></p>
              <p class="text-sm text-slate-600 truncate">{{ p.description }}</p>
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Actividad en Foros</h2>
        <div v-if="profile.threads?.length" class="space-y-4">
          <RouterLink :to="`/forums`" v-for="t in profile.threads" :key="t.id" class="block p-4 border border-slate-100 rounded-xl hover:border-indigo-300 hover:shadow-sm transition">
            <h3 class="font-bold text-slate-900">{{ t.title }}</h3>
            <p class="text-sm text-slate-500 truncate">{{ t.content }}</p>
          </RouterLink>
        </div>
        <p v-else class="text-slate-500 italic text-sm">Aún no ha participado en foros.</p>
      </div>

      <div v-if="profile.blogs?.length" class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 md:col-span-2">
        <h2 class="text-xl font-bold text-slate-800 mb-4">Artículos Publicados</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RouterLink :to="`/blogs/${b.id}`" v-for="b in profile.blogs" :key="b.id" class="block p-4 border border-slate-100 rounded-xl hover:border-indigo-300 hover:shadow-sm transition">
            <h3 class="font-bold text-slate-900">{{ b.title }}</h3>
            <p class="text-sm text-slate-500 truncate mt-1">{{ b.content.replace(/[#*`_]/g, '') }}</p>
          </RouterLink>
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
