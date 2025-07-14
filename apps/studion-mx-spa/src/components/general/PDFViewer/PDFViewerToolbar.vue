<script lang="ts" setup>
import { Button } from "@/components/general";

interface PDFViewerToolbarProps {
  currentPage: number;
  pageCount: number | null;
  disabled?: boolean;
  enableDownload?: boolean;
}
const props = defineProps<PDFViewerToolbarProps>();

const emit = defineEmits(["previouspage", "nextpage", "download"]);

function previousPage() {
  emit("previouspage");
}

function nextPage() {
  emit("nextpage");
}

function download() {
  emit("download");
}
</script>

<template>
  <div class="pdf-viewer__toolbar p-2">
    <Button
      class="mx-3"
      v-if="props.enableDownload"
      variant="icon"
      icon="download"
      @click="download"
    />
    <div class="pdf-viewer__navigation">
      <Button
        variant="text"
        :disabled="props.currentPage === 1 || props.disabled"
        innerPrependIcon="keyboard_arrow_left"
        @click="previousPage"
      >
        {{ $t("global:prev") }}
      </Button>
      <div>
        {{ props.currentPage }} {{ $t("global:of") }} {{ props.pageCount }}
      </div>
      <Button
        variant="text"
        innerAppendIcon="keyboard_arrow_right"
        :disabled="props.currentPage === props.pageCount || props.disabled"
        @click="nextPage"
      >
        {{ $t("global:next") }}
      </Button>
    </div>
  </div>
</template>
