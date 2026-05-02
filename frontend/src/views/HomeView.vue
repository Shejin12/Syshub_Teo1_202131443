<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 animate-fade-in">
    <div class="space-y-4">
      <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900">
        Bienvenido a <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">SysHub</span>
      </h1>
      <p class="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto">
        El ecosistema digital de aprendizaje continuo para Ingeniería en Ciencias y Sistemas.
        Comparte, descubre y construye conocimiento que perdura.
      </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 pt-8">
      <RouterLink to="/projects" class="group relative px-8 py-4 bg-indigo-600 text-white rounded-xl text-lg font-semibold overflow-hidden shadow-xl shadow-indigo-200 transition-all hover:-translate-y-1 hover:shadow-2xl">
        <div class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
        <span class="relative">Explorar Proyectos (The Hub)</span>
      </RouterLink>
      <RouterLink to="/forums" class="group relative px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-100 rounded-xl text-lg font-semibold overflow-hidden shadow-lg transition-all hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl">
        <span class="relative">Participar en Foros (Sys-Reddit)</span>
      </RouterLink>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-5xl text-left">
      <div class="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
        <div class="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 text-2xl font-bold">📚</div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">Persistencia Académica</h3>
        <p class="text-slate-600">Evita que el conocimiento se pierda al final del semestre. Guarda tus proyectos y hallazgos en un repositorio vivo.</p>
      </div>
      <div class="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
        <div class="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center mb-4 text-2xl font-bold">🤝</div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">Interacción Social</h3>
        <p class="text-slate-600">Resuelve dudas, crea hilos de discusión y colabora con otros estudiantes en nuestro entorno estilo Reddit.</p>
      </div>
      <div class="p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition">
        <div class="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 text-2xl font-bold">✨</div>
        <h3 class="text-xl font-bold text-slate-800 mb-2">Curaduría de Calidad</h3>
        <p class="text-slate-600">Material destacado por auxiliares y un sistema de valoraciones asegura que el mejor contenido esté siempre visible.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
