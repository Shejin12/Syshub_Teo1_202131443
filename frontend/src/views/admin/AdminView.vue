<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const users = ref<any[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);
const newUser = ref({ name: '', email: '', password: '', roleName: 'AUXILIAR' });

const fetchUsers = async () => {
  loading.value = true;
  try {
    const res = await axios.get('http://localhost:3000/admin/users');
    users.value = res.data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const createUser = async () => {
  try {
    await axios.post('http://localhost:3000/admin/users', newUser.value);
    showCreateModal.value = false;
    newUser.value = { name: '', email: '', password: '', roleName: 'AUXILIAR' };
    fetchUsers();
  } catch (error) {
    console.error(error);
  }
};

const updateRole = async (userId: number, newRole: string) => {
  try {
    await axios.put(`http://localhost:3000/admin/users/${userId}/role`, { role: newRole });
    fetchUsers();
  } catch (error) {
    console.error(error);
  }
};

const updateStatus = async (userId: number, newStatus: string) => {
  try {
    await axios.put(`http://localhost:3000/admin/users/${userId}/status`, { status: newStatus });
    fetchUsers();
  } catch (error) {
    console.error(error);
  }
};

const deleteUser = async (userId: number) => {
  if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
  try {
    await axios.delete(`http://localhost:3000/admin/users/${userId}`, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    fetchUsers();
  } catch (error) {
    console.error(error);
  }
};

const reports = ref<any[]>([]);
const fetchReports = async () => {
  try {
    const res = await axios.get('http://localhost:3000/reports', {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    reports.value = res.data;
  } catch (error) {
    console.error(error);
  }
};

const updateReportStatus = async (reportId: number, status: string) => {
  try {
    await axios.put(`http://localhost:3000/reports/${reportId}/status`, { status }, {
      headers: { Authorization: `Bearer ${authStore.token}` }
    });
    fetchReports();
  } catch (error) {
    console.error(error);
  }
};

onMounted(() => {
  fetchUsers();
  fetchReports();
});
</script>

<template>
  <div class="space-y-8 animate-fade-in">
    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-extrabold text-slate-900">Panel de Administración</h1>
        <p class="text-slate-500">Gestión de usuarios y moderación</p>
      </div>
      <div class="flex gap-4 items-center">
        <button @click="showCreateModal = true" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition">Crear Usuario</button>
        <div class="text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg font-bold">Modo Admin</div>
      </div>
    </div>

    <!-- Modal for new user -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div class="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h2 class="text-2xl font-bold mb-6">Nuevo Usuario</h2>
        <form @submit.prevent="createUser" class="space-y-4">
          <div><label class="block text-sm font-medium text-slate-700 mb-1">Nombre</label><input v-model="newUser.name" required class="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label class="block text-sm font-medium text-slate-700 mb-1">Correo</label><input v-model="newUser.email" type="email" required class="w-full px-4 py-2 border rounded-lg" /></div>
          <div><label class="block text-sm font-medium text-slate-700 mb-1">Contraseña</label><input v-model="newUser.password" type="password" required class="w-full px-4 py-2 border rounded-lg" /></div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Rol</label>
            <select v-model="newUser.roleName" class="w-full px-4 py-2 border rounded-lg">
              <option value="AUXILIAR">AUXILIAR</option>
              <option value="ADMIN">ADMIN</option>
              <option value="ESTUDIANTE">ESTUDIANTE</option>
            </select>
          </div>
          <div class="flex justify-end gap-4 mt-6">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
            <button type="submit" class="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium">Crear</button>
          </div>
        </form>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="p-6 border-b border-slate-100">
        <h2 class="text-xl font-bold text-slate-800">Usuarios Registrados</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-slate-500 text-sm border-b">
              <th class="p-4 font-semibold">ID</th>
              <th class="p-4 font-semibold">Nombre / Correo</th>
              <th class="p-4 font-semibold">Rol</th>
              <th class="p-4 font-semibold">Estado</th>
              <th class="p-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" class="border-b last:border-0 hover:bg-slate-50 transition">
              <td class="p-4 text-slate-500 text-sm">#{{ user.id }}</td>
              <td class="p-4 font-medium text-slate-800">
                <RouterLink :to="`/users/${user.id}`" class="hover:underline">{{ user.name }}</RouterLink>
                <div class="text-xs text-slate-500 font-normal">{{ user.email }}</div>
              </td>
              <td class="p-4">
                <select 
                  :value="user.role?.name || user.role" 
                  @change="e => updateRole(user.id, (e.target as HTMLSelectElement).value)"
                  class="bg-white border border-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 px-3 shadow-sm"
                  :disabled="user.id === authStore.user?.id"
                >
                  <option value="ESTUDIANTE">ESTUDIANTE</option>
                  <option value="AUXILIAR">AUXILIAR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </td>
              <td class="p-4">
                <select 
                  :value="user.status?.name || user.status" 
                  @change="e => updateStatus(user.id, (e.target as HTMLSelectElement).value)"
                  class="bg-white border border-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 px-3 shadow-sm"
                  :disabled="user.id === authStore.user?.id"
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="SUSPENDIDO">SUSPENDIDO</option>
                  <option value="ELIMINADO">ELIMINADO</option>
                </select>
              </td>
              <td class="p-4 text-right">
                <button 
                  v-if="user.id !== authStore.user?.id" 
                  @click="deleteUser(user.id)" 
                  class="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition"
                >Eliminar</button>
                <span v-else class="text-slate-400 text-sm italic">Tú</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="loading" class="p-8 text-center text-slate-500">Cargando usuarios...</div>
      </div>
    </div>

    <!-- Gestión de Reportes -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div class="p-6 border-b border-slate-100">
        <h2 class="text-xl font-bold text-slate-800">Reportes de Comunidad</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 text-slate-500 text-sm border-b">
              <th class="p-4 font-semibold">ID</th>
              <th class="p-4 font-semibold">Reportado Por</th>
              <th class="p-4 font-semibold">Tipo / ID Objetivo</th>
              <th class="p-4 font-semibold">Razón (Comentario)</th>
              <th class="p-4 font-semibold">Estado</th>
              <th class="p-4 font-semibold text-right">Acción Rápida</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in reports" :key="report.id" class="border-b last:border-0 hover:bg-slate-50 transition" :class="{'bg-red-50/50': report.status === 'PENDING'}">
              <td class="p-4 text-slate-500 text-sm">#{{ report.id }}</td>
              <td class="p-4 font-medium text-slate-800">
                <RouterLink :to="`/users/${report.reporter?.id}`" class="hover:underline">{{ report.reporter?.name }}</RouterLink>
              </td>
              <td class="p-4">
                <span class="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded-full font-bold mr-2">{{ report.targetType }}</span>
                <span class="text-slate-500 text-sm">#{{ report.targetId }}</span>
              </td>
              <td class="p-4 text-sm text-slate-700 max-w-xs truncate" :title="report.reason">{{ report.reason }}</td>
              <td class="p-4">
                <select 
                  :value="report.status" 
                  @change="e => updateReportStatus(report.id, (e.target as HTMLSelectElement).value)"
                  class="bg-white border border-slate-200 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 px-3 shadow-sm"
                  :class="{
                    'text-red-600 font-bold border-red-200': report.status === 'PENDING',
                    'text-green-600': report.status === 'RESOLVED',
                    'text-slate-500': report.status === 'DISMISSED'
                  }"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="RESOLVED">Resuelto</option>
                  <option value="DISMISSED">Descartado</option>
                </select>
              </td>
              <td class="p-4 text-right">
                <button v-if="report.status === 'PENDING'" @click="updateReportStatus(report.id, 'RESOLVED')" class="text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg text-xs font-bold transition mr-2">Resolver</button>
                <button v-if="report.status === 'PENDING'" @click="updateReportStatus(report.id, 'DISMISSED')" class="text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold transition">Descartar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="reports.length === 0" class="p-8 text-center text-slate-500">No hay reportes actualmente.</div>
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
