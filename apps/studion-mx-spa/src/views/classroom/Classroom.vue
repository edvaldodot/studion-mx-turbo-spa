<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useJourneyStore } from "@/stores";
import { toastSuccess } from "@/utils/toast"; // Adjust the import path as necessary

import NavBar from "@/components/general/NavBar";
import ClassroomSideBar from "./ClassroomSideBar";
import ClassroomInfo from "./ClassroomInfo";

const route = useRoute();
const router = useRouter();

const journeyStore = useJourneyStore();

const journeyUuid = computed<any>(() => route.params.journeyUuid || undefined);
const sessionUuid = computed<any>(() => route.params.sessionUuid || undefined);
const classroomData = computed(() => journeyStore.getClassroom || {});
const journeyData = computed(() => journeyStore.getComponents || []);

const loading = ref<boolean>(true);
const erro = ref<string | null>(null);

const classroomStatus = "Em andamento";

async function fetchClassroom() {
  await journeyStore
    .setClassroom(journeyUuid.value, sessionUuid.value)
    .finally(async () => {
      toastSuccess("Bem-vindo à Sala de Aula!");
      await journeyStore.setComponents(journeyUuid.value, sessionUuid.value);
      loading.value = false;
    });
}

onMounted(async () => {
  if (!journeyUuid.value || !sessionUuid.value) {
    erro.value = "Parâmetros inválidos na rota";
    router.replace("/");
    return;
  }

  await fetchClassroom();
});
</script>

<template>
  <div class="flex">
    <div
      v-if="loading"
      class="p-6"
    >
      <div class="text-3xl text-gray-700">Carregando sala de aula...</div>
    </div>
    <template v-else>
      <ClassroomSideBar
        :journeyData="journeyData"
        :classroomData="classroomData"
      />

      <main class="flex-1">
        <NavBar
          :status="classroomStatus"
          :classroomData="classroomData" 
        />

        <ClassroomInfo
          :status="classroomStatus"
          :classroomData="classroomData"
          :journeyData="journeyData"
        />
      </main>
    </template>
  </div>
</template>
