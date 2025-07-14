<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { Button, Icon } from "@/components/general";
import { PDFContent, ExternalLinkContent, ScormContent } from "./partials";
import { useJourneyStore } from "@/stores";
import { useRoute } from "vue-router";

// routing
const route = useRoute();

// stores
const journeyStore = useJourneyStore();

// data
const contentLoading = ref(false);
const expandContent = ref(false);

// computed
const journeyUuid = computed<any>(() => route.params.journeyUuid);
const sessionUuid = computed<any>(() => route.params.sessionUuid);
const contentUuid = computed<any>(() => route.query.currentContentUuid);
const contentDefaultUuid = computed<any>(
  () =>
    contentUuid.value ||
    journeyStore.getComponents.components[0].children[0].uuid
);
const typeContent = computed(() => journeyStore.getCurrentContent.strategy);
const currentContent = computed(() => {
  const content = {
    pdf: PDFContent,
    external_link: ExternalLinkContent,
    scorm: ScormContent,
  } as Record<string, any>;

  return content[typeContent.value];
});
const componentName = computed(
  () => journeyStore.getCurrentContent.component?.name
);
const expandContentStatusLabel = computed(() =>
  expandContent.value ? "Encolher conteúdo" : "Expandir conteúdo"
);
const expandContentStatusIcon = computed(() =>
  expandContent.value ? "close_fullscreen" : "open_in_full"
);

// watch
watch(contentUuid, () => {
  setCurrentContent();
});

// methods
async function setCurrentContent() {
  contentLoading.value = true;
  await journeyStore
    .setCurrentOpenContent(
      journeyUuid.value,
      sessionUuid.value,
      contentDefaultUuid.value
    )
    .finally(() => {
      contentLoading.value = false;
    });
}

function setExpandContent() {
  simulatedLoadingPDF();
  expandContent.value = !expandContent.value;
}

// TODO: o processo ocorre por causa do comportamento do componente de view do PDF.
function simulatedLoadingPDF() {
  contentLoading.value = true;
  setTimeout(() => {
    contentLoading.value = false;
  }, 500);
}

onMounted(async () => {
  await setCurrentContent();
});
</script>
<template>
  <div
    :class="[
      'flex flex-column',
      { ' w-full absolute top-0 left-0 p-4 bg-black-50': expandContent },
      { ' h-full': contentLoading },
    ]"
  >
    <div
      class="flex align-items-center justify-content-between bg-black-100 border-round-top h-3rem px-3"
    >
      <div class="text-base font-bold text-black-700">{{ componentName }}</div>
      <div class="flex gap-2 align-items-center">
        <Button
          class="text-black-700"
          variant="text"
          :innerPrependIcon="expandContentStatusIcon"
          @click="setExpandContent()"
        >
          {{ expandContentStatusLabel }}
        </Button>
      </div>
    </div>
    <div class="flex-1 p-3f h-10rem overflow-auto">
      <component
        v-if="typeContent"
        :is="currentContent"
        :contentPDFloading="contentLoading"
      />
    </div>
    <div
      class="flex align-items-center justify-content-between bg-secondary h-3rem p-3 border-round-bottom"
    >
      <div class="flex gap-2 align-items-center text-white text-base">
        <Icon pack="material" name="arrow_left_alt" class="text-white" />
        Conteúdo anterior
      </div>
      <div class="flex gap-2 align-items-center text-black-500 text-base">
        Próximo conteúdo
        <Icon pack="material" name="arrow_right_alt" class="text-black-500" />
      </div>
    </div>
  </div>
</template>
