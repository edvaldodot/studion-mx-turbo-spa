<script lang="ts">
import { computed, ref } from 'vue'
import { useConfigStore } from '@/stores'
import { useI18n } from 'vue-i18n'
import { journeysService } from '@/services'

interface Curso {
  id: number
  name: string
  status: string
}

export default {
  name: 'HomeView',
  setup() {
    const { locale, t } = useI18n()
    const configStore = useConfigStore()
    const cursos = ref<Curso[]>([])
    const erro = ref<string | null>(null)
    const carregado = ref(false)

    const configApp = computed(() => configStore.getConfig)
    const tabIndex = ref(1)
    const tabItems = ref([
      { icon: 'dashboard' },
      { icon: 'android' },
      { icon: 'edit' },
    ])

    function changeLanguage(lang: string) {
      locale.value = lang
    }

    async function carregarCursos() {
      erro.value = null
      try {
        const response = await journeysService.fetchJourneys()
        cursos.value = response?.data.data
        carregado.value = true
      } catch (err) {
        erro.value = (err as any).message
      }
    }

    async function carregarConfig() {
      configStore.setConfig()
    }

    return {
      t,
      locale,
      configApp,
      cursos,
      erro,
      carregado,
      tabIndex,
      tabItems,
      changeLanguage,
      carregarCursos,
      carregarConfig,
    }
  },
}
</script>

<template>
  <nav class="mb-4 bg-gray-300 p-4">
    <router-link class="text-base text-primary text-gray-800" to="/">Initial |</router-link>&nbsp;
    <router-link class="text-base text-primary text-gray-800" to="/home">Testes de API |</router-link>&nbsp;
    <router-link class="text-base text-primary text-gray-800" to="/theme">Tema</router-link>
  </nav>

  <div class="p-4">
    <div class="text-gray-700 text-4xl">
      <h1 class="text-4xl">{{ t('global:studion.headline') }}</h1>
    </div>

    <div class="space-x-2 mt-4">
      <button @click="changeLanguage('pt')" class="text-base bg-gray-200 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded">Português</button>
      <button @click="changeLanguage('en')" class="text-base bg-gray-200 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded">English</button>
      <button @click="changeLanguage('es')" class="text-base bg-gray-200 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded">Español</button>
    </div>

    <div class="flex items-center justify-between mt-6 mb-4">
      <h1 class="text-xl font-bold">A tal chamada em API</h1>
      <button
        data-testid="btn-carregar-cursos"
        @click="carregarCursos"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded text-sm ml-2"
      >
        Buscar Jornadas
      </button>
    </div>

    <div v-if="erro" class="bg-red-100 text-red-700 p-4 rounded shadow mb-4">
      Erro ao carregar: {{ erro }}
    </div>

    <table v-if="cursos.length" class="min-w-full bg-white rounded shadow overflow-hidden">
      <thead class="bg-gray-200">
        <tr>
          <th class="text-left px-4 py-2 border-b text-sm">Nome</th>
          <th class="text-left px-4 py-2 border-b text-sm">Status</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="curso in cursos"
          :key="curso.id"
          class="hover:bg-gray-50"
        >
          <td class="px-4 py-2 border-b text-sm">{{ curso.name }}</td>
          <td class="px-4 py-2 border-b capitalize">
            <span
              class="px-3 py-1 rounded text-white text-sm"
              :class="{
                'bg-green-600': curso.status === 'published',
                'bg-yellow-500': curso.status === 'draft',
                'bg-gray-500': curso.status === 'inactive',
              }"
            >
              {{ curso.status }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex items-center justify-between mt-6 mb-4">
      <h1 class="text-xl font-bold">O tal do Config</h1>
      <button
        data-testid="btn-carregar-config"
        @click="carregarConfig"
        class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded text-sm ml-2"
      >
        Buscar CONFIG
      </button>
    </div>

    <div v-if="configApp" class="bg-gray-100 p-4 rounded shadow mt-6">
      <h2 class="text-lg font-semibold mb-2">Configuração recebida:</h2>
      <pre class="text-sm text-gray-800">{{ JSON.stringify(configApp, null, 2) }}</pre>
    </div>
  </div>
</template>
