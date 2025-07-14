<script setup lang="ts">
import { computed, onUnmounted, reactive, ref, watch } from "vue";
import { PDFViewer } from "@/components/general";
import { useConfigStore, useJourneyStore } from "@/stores";
import { useRoute } from "vue-router";

interface PDFContentProps {
  contentPDFloading?: boolean;
}

interface payloadPage {
  page: number;
  timestamp?: number;
}

// routing
const route = useRoute();

// props
const props = withDefaults(defineProps<PDFContentProps>(), {
  contentPDFloading: false,
});

// stores
const journeyStore = useJourneyStore();
const configStore = useConfigStore();

// computed
const journeyUuid = computed<any>(() => route.params.journeyUuid);
const sessionUuid = computed<any>(() => route.params.sessionUuid);
const contentUuid = computed<any>(() => route.query.currentContentUuid);
const consumeUuid = computed(
  () => journeyStore.getCurrentContent.consumption.uuid
);
const PDFUrl = computed(() => journeyStore.getCurrentContent.metadata.url);
const PDFloading = computed(() => docLoading.value || props.contentPDFloading);
const PDFConsumeRule = computed(
  () => configStore.getConfig.env?.PDF_CONSUME_RULE || 2
);
const PDFConsumeOpeningRule = computed(() => PDFConsumeRule.value === 1);
const PDFConsumePerPageRule = computed(() => PDFConsumeRule.value === 2);
const onePageOrFullConsumePDF = computed(
  () => PDFPageCount.value === PDFPage.value
);
const isDownloadable = computed(
  () => journeyStore.getCurrentContent.metadata.is_downloadable
);

// data
const docLoading = ref(false);
const PDFPage = ref(1);
const PDFPageCount = ref(0);
const consumedPages = ref<payloadPage[]>([]);

// methods
async function setConsumeContent() {
  const consumeData = {
    consume_uuid: consumeUuid.value,
    metadata: {
      pages: consumedPages.value,
    },
  };

  await journeyStore.setConsumeContent(
    journeyUuid.value,
    sessionUuid.value,
    consumeUuid.value,
    consumeData
  );
}

async function consumedDocument() {
  const consumptionRules = {
    1: () => consumePDFOnOpening(),
    2: () => consumePDFPerPage(),
  } as Record<number, any>;

  await consumptionRules[PDFConsumeRule.value]();
}

function page(page: payloadPage) {
  consumedPages.value.push(page);
}

function timestamp() {
  return new Date().getTime();
}

function setPDFPages() {
  resetPDFPages();
  if (PDFConsumeOpeningRule.value) {
    if (onePageOrFullConsumePDF.value) {
      page({
        page: 1,
        timestamp: timestamp(),
      });

      return;
    }

    for (let i = 1; i <= PDFPageCount.value; i++) {
      page({
        page: i,
        timestamp: timestamp(),
      });
    }

    return;
  }

  if (PDFConsumePerPageRule.value) {
    page({
      page: PDFPage.value,
      timestamp: timestamp(),
    });

    return;
  }
}

function setPDFPageOne() {
  PDFPage.value = 1;
}

function resetPDFPages() {
  consumedPages.value = [];
}

function nextAndAddPage() {
  consumedPages.value = consumedPages.value.filter(
    (item) => item.page !== PDFPage.value
  );

  page({
    page: PDFPage.value,
    timestamp: timestamp(),
  });
}

async function setComponents() {
  await journeyStore.setComponents(journeyUuid.value, sessionUuid.value);
}

async function consumePDFOnOpening() {
  setPDFPages();
  await setConsumeContent();
  await setComponents();
}

async function consumePDFPerPage() {
  if (onePageOrFullConsumePDF.value) {
    await setConsumeContent();
    await setComponents();
  }
}

// watch
watch(contentUuid, () => {
  resetPDFPages();
  setPDFPageOne();
  setPDFPages();
});

watch(PDFPageCount, () => {
  setPDFPages();
  consumedDocument();
});

watch(PDFPage, () => {
  nextAndAddPage();
});

// hooks
onUnmounted(() => {
  consumedDocument().catch((error) => {
    console.error('[PDFContent] Erro ao consumir documento no unmount:', error)
  })
})

</script>

<template>
  <div
    class="flex align-items-center justify-content-center h-full text-base"
    v-if="PDFloading"
  >
    {{ $t("classroom.lessons:podcast.loading") }}
  </div>
  <PDFViewer
    v-else
    v-model:page="PDFPage"
    v-model:page-count="PDFPageCount"
    :source="PDFUrl"
    :enableDownload="isDownloadable"
    @finish="consumedDocument"
  />
</template>
