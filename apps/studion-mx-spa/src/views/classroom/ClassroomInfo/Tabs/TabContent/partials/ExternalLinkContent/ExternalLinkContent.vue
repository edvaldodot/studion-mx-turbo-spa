<script setup lang="ts">
import { useJourneyStore } from "@/stores";
import { computed, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { Button } from "@/components/general";
import { toastError } from "@/utils/toast";

// stores
const journeyStore = useJourneyStore();

// routing
const route = useRoute();

// computed
const journeyUuid = computed<any>(() => route.params.journeyUuid);
const sessionUuid = computed<any>(() => route.params.sessionUuid);
const consumeUuid = computed(
  () => journeyStore.getCurrentContent.consumption.uuid
);
const contentUrl = computed(() => journeyStore.getCurrentContent.metadata.url)

// data
const contentLoading = ref(false);

// methods
async function setComponents() {
  await journeyStore.setComponents(journeyUuid.value, sessionUuid.value);
}

async function consumeContent() {
  try {
    contentLoading.value = true;

    await journeyStore.setConsumeContent(
      journeyUuid.value,
      sessionUuid.value,
      consumeUuid.value,
      {
        consume_uuid: consumeUuid.value,
        metadata: {
          consumed: true,
        },
      }
    );

    window.open(contentUrl.value, "_blank");
  } catch (error) {
    toastError("Erro ao consumir conteúdo externo.");
  } finally {
    contentLoading.value = false;
    setComponents();
  }
}



</script>
<template>
  <div
    class="flex align-items-center justify-content-center h-full text-base"
    v-if="contentLoading"
  >
    {{ $t("classroom.lessons:podcast.loading") }}
  </div>
  <div v-else class="flex flex-column gap-8 align-items-center justify-content-center h-full text-base">
    <p>{{ contentUrl }}</p>

    <Button @click="consumeContent">
      {{ $t("classroom.lessons:external.content") }}
    </Button>
  </div>
</template>
