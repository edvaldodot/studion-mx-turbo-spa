<script lang="ts" setup>
import { ref, watch, useTemplateRef } from "vue";
import VuePdfEmbed from "vue-pdf-embed";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import PdfViewerToolbar from "./PDFViewerToolbar.vue";
import { ProgressCircle } from "@/components/general";

// styles
import "vue-pdf-embed/dist/styles/annotationLayer.css";
import "vue-pdf-embed/dist/styles/textLayer.css";

defineOptions({
  inheritAttrs: false,
});

interface PDFViewerProps {
  page: number;
  pageCount?: number;
  enableDownload?: boolean
}

interface PDFViewerMethods {
  download: () => void;
  print: () => void;
}

// refs
const pdfEmbed = useTemplateRef<PDFViewerMethods>('pdfEmbed')

// props
const props = withDefaults(defineProps<PDFViewerProps>(), {
  page: 1,
  pageCount: 0,
  enableDownload: false
});

// model
const page = defineModel<number>("page", { default: 1 });

// emits
const emit = defineEmits(["update:page", "update:pageCount", "finish"]);

// data
const pageCount = ref(0);

// watch
watch(page, (newPage) => {
  isFinish(newPage);
});

// methods
function onLoaded(e: PDFDocumentProxy) {
  pageCount.value = e._pdfInfo?.numPages || 0;
  emit("update:pageCount", e._pdfInfo?.numPages);
}

function onPreviousPage() {
  if (props.page > 1) {
    emit("update:page", props.page - 1);
  }
}

function onNextPage() {
  if (props.page < pageCount.value) {
    emit("update:page", props.page + 1);
  }
}

function isFinish(newPage: number) {
  if (newPage === pageCount.value) {
    emit("finish");
  }
}

function downloadPDF(){
  if(pdfEmbed.value){
    pdfEmbed.value.download()
  }
}

function printPDF(){
  if(pdfEmbed.value){
    pdfEmbed.value.print()
  }
}

// expose
defineExpose({
  downloadPDF,
  printPDF
})
</script>
<template>
  <div>
    <PdfViewerToolbar
      :current-page="page"
      :page-count="pageCount"
      :enableDownload="enableDownload"
      @previouspage="onPreviousPage"
      @nextpage="onNextPage"
      @download="downloadPDF"
    />
    <div class="pdf-viwer">
      <VuePdfEmbed
        ref="pdfEmbed"
        source=""
        @loaded="onLoaded"
        v-bind="$attrs"
        :page="props.page"
      />
    </div>
  </div>
</template>
<style lang="scss">
@use "./PDFViewer.scss" as *;
</style>
