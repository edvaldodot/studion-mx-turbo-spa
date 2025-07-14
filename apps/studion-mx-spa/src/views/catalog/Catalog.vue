<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useJourneyStore } from '@/stores'
import { journeysService } from '@/services'
import { Journey, Session } from '@/types'

interface JourneyWithSessions extends Journey {
  sessions?: Session[]
}

const journeyStore = useJourneyStore()

const journeys = ref<JourneyWithSessions[]>([])
const error = ref<string | null>(null)
const isLoaded = ref(false)

const baseJourneys = computed(() => journeyStore.getJourneys.data || [])

async function fetchJourneysWithDetails() {
  error.value = null
  isLoaded.value = false

  try {
    const detailedJourneys = await Promise.all(
      baseJourneys.value.map(async (journey: Journey) => {
        try {
          const [details, sessions] = await Promise.all([
            journeysService.fetchJourneyById(journey.id),
            journeysService.fetchSessionsByJourney(journey.id)
          ])

          return {
            ...journey,
            image: details?.data.image,
            sessions: sessions?.data.data
          }
        } catch (err) {
          console.warn(`Erro ao carregar detalhes da jornada ${journey.id}:`, err)
          return journey
        }
      })
    )

    journeys.value = detailedJourneys
  } catch (err) {
    error.value = (err as any).message || 'Erro inesperado'
  } finally {
    isLoaded.value = true
  }
}

onMounted(() => {
  journeyStore.setJourneys().then(() => {
    fetchJourneysWithDetails()
  })
})

// Exposição para testes
if (import.meta.vitest) {
  (globalThis as any).__catalogError = error
}
</script>

<template>
  <nav class="bg-gray-300 p-4">
    <router-link class="text-base text-primary text-gray-800" to="/">Initial |</router-link>&nbsp;
    <router-link class="text-base text-primary text-gray-800" to="/home">Testes de API |</router-link>&nbsp;
    <router-link class="text-base text-primary text-gray-800" to="/theme">Tema</router-link>
  </nav>

  <div class="p-4">
    <h1 class="text-4xl text-gray-900">CATÁLOGO DE JORNADAS<hr></h1>

    <template v-if="error">
      <div data-testid="error-message" class="bg-red-100 text-red-700 p-4 rounded shadow">
        Failed to load: {{ error }}
      </div>
    </template>

    <template v-else-if="!isLoaded">
      <div data-testid="loading-message" class="text-gray-800 mt-4 lato-bold text-2xl">
        Loading journeys...
      </div>
    </template>

    <template v-else>
      <div data-testid="journey-list" class="grid mt-4">
        <div v-for="journey in journeys" :key="journey.id" class="col-4">
          <div class="bg-white shadow rounded overflow-hidden transition hover:shadow-lg p-4 h-full">
            <h2 class="text-xl lato-bold text-gray-900 mb-2">{{ journey.name }}</h2>
            <p class="text-sm text-gray-600 mb-3">{{ journey.description.slice(0, 100) }}...</p>
            <div class="text-sm text-gray-500 mb-3">
              Workload: {{ journey.workloadValue }} {{ journey.workloadType }}
            </div>
            <div class="grid">
              <div v-for="session in journey.sessions" :key="session.uuid" class="col-6">
                <router-link
                  :to="{ name: 'Classroom', params: { journeyUuid: journey.uuid, sessionUuid: session.uuid } }"
                  class="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded transition text-base block text-center mt-2"
                >
                  {{ session.name || 'Acessar Sala de Aula' }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
