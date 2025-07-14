<script>
import lodash from 'lodash'
import VuePdfEmbed from 'vue-pdf-embed/dist/vue2-pdf-embed'
import Spinner from '../SpinnerSvg'
import PdfViewerToolbar from './PdfViewerToolbar.vue'

import config from '@/config'

const { PDF_NAVIGATION_INTERVAL } = config

export default {
  name: 'PdfViewer',
  components: {
    VuePdfEmbed,
    PdfViewerToolbar,
    Spinner,
  },
  props: {
    src: {
      type: String,
      default: '',
    },
    value: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      pageCount: null,
      zoom: 60,
      zoomDebounce: () => {},
      rendering: true,
      loading: true,
      progress: null,
    }
  },
  computed: {
    getProgress() {
      if (!this.progress) return '0%'
      return Math.round((this.progress.loaded / this.progress.total) * 100) + '%'
    },
    hasIntervalConfig() {
      return typeof PDF_NAVIGATION_INTERVAL === 'number' && PDF_NAVIGATION_INTERVAL >= 0
    },
    pdfInterval() {
      if (!this.hasIntervalConfig) return 2000
      return PDF_NAVIGATION_INTERVAL * 1000
    },
  },
  watch: {
    zoom() {
      this.reRender()
    },
  },
  created() {
    this.zoomDebounce = lodash.debounce(this.reRender, 500)
    window.addEventListener('resize', this.zoomDebounce, false)
    if (!this.$media.desktop) this.zoom = 100
  },
  destroyed() {
    window.removeEventListener('resize', this.zoomDebounce, false)
  },
  methods: {
    setPage(page) {
      if (page > 0 && page <= this.pageCount) {
        this.$emit('input', page)
      }
    },
    nextPage() {
      this.rendering = true
      this.$emit('input', this.value + 1)
    },
    previousPage() {
      this.rendering = true
      this.$emit('input', this.value - 1)
    },
    setPageCount(pageCount) {
      this.pageCount = pageCount
    },
    changeZoom(zoomChange) {
      if (this.rendering) return
      if (this.zoom + zoomChange > 0 && this.zoom + zoomChange <= 100) {
        this.zoom += zoomChange
        this.rendering = true
      }
    },
    pageRendered() {
      this.$emit('pageLoaded', this.value)

      this.rendering = this.equalsProfile('student')

      if (this.rendering) {
        setTimeout(() => (this.rendering = false), this.pdfInterval)
      }
    },
    setConfig(e) {
      this.setPageCount(e._pdfInfo.numPages)
      this.loading = false
    },
    reRender() {
      if (this.$refs['pdfRef']) {
        this.$refs['pdfRef'].render()
      }
    },
    updateProgress(progress) {
      this.progress = progress
    },
  },
}
</script>

<template>
  <div class="pdf-viewer">
    <PdfViewerToolbar
      :current-page="value"
      :page-count="pageCount"
      :current-zoom="zoom"
      :disabled="rendering"
      @changezoom="changeZoom($event)"
      @nextpage="nextPage()"
      @previouspage="previousPage()"
    />

    <div class="pdf-viewer__reader">
      <div
        v-show="loading"
        class="pdf-viewer__loader"
      >
        <Spinner />
        <div class="pdf-viewer__percentage">
          {{ getProgress }}
        </div>
      </div>
      <div
        v-if="src"
        v-show="!loading"
        :style="{ width: `${zoom}%` }"
      >
        <VuePdfEmbed
          ref="pdfRef"
          :source="src"
          :page="value"
          @loaded="setConfig"
          @rendered="pageRendered"
          @internal-link-clicked="setPage"
          @progress="updateProgress"
        />
      </div>
    </div>

    <PdfViewerToolbar
      :current-page="value"
      :page-count="pageCount"
      :current-zoom="zoom"
      :disabled="rendering"
      @changezoom="changeZoom($event)"
      @nextpage="nextPage()"
      @previouspage="previousPage()"
    />
  </div>
</template>

<script>
import lodash from 'lodash'
import VuePdfEmbed from 'vue-pdf-embed/dist/vue2-pdf-embed'
import Spinner from '@/components/general/SpinnerSvg'
import PdfViewerToolbar from './PdfViewerToolbar.vue'
import config from '@/config'

const { PDF_NAVIGATION_INTERVAL } = config

export default {
  name: 'PdfViewer',

  components: {
    VuePdfEmbed,
    PdfViewerToolbar,
    Spinner,
  },

  props: {
    src: {
      type: String,
      default: '',
    },
    value: {
      type: Number,
      default: 1,
    },
  },

  data() {
    return {
      pageCount: null,
      zoom: 60,
      zoomDebounce: () => {},
      rendering: true,
      loading: true,
      progress: null,
    }
  },

  computed: {
    getProgress() {
      if (!this.progress) return '0%'
      return Math.round((this.progress.loaded / this.progress.total) * 100) + '%'
    },
    hasIntervalConfig() {
      return typeof PDF_NAVIGATION_INTERVAL === 'number' && PDF_NAVIGATION_INTERVAL >= 0
    },
    pdfInterval() {
      if (!this.hasIntervalConfig) return 2000
      return PDF_NAVIGATION_INTERVAL * 1000
    },
  },

  watch: {
    zoom() {
      this.reRender()
    },
  },

  created() {
    this.zoomDebounce = lodash.debounce(this.reRender, 500)
    window.addEventListener('resize', this.zoomDebounce, false)
    if (!this.$media.desktop) this.zoom = 100
  },

  destroyed() {
    window.removeEventListener('resize', this.zoomDebounce, false)
  },

  methods: {
    setPage(page) {
      if (page > 0 && page <= this.pageCount) {
        this.$emit('input', page)
      }
    },
    nextPage() {
      this.rendering = true
      this.$emit('input', this.value + 1)
    },
    previousPage() {
      this.rendering = true
      this.$emit('input', this.value - 1)
    },
    setPageCount(pageCount) {
      this.pageCount = pageCount
      this.$emit('pages', pageCount)
    },
    changeZoom(zoomChange) {
      if (this.rendering) return
      if (this.zoom + zoomChange > 0 && this.zoom + zoomChange <= 100) {
        this.zoom += zoomChange
        this.rendering = true
      }
    },
    pageRendered() {
      this.$emit('pageLoaded', this.value)
      this.$emit('consumed', { page: this.value, timestamp: Date.now() })

      this.rendering = this.equalsProfile('student')

      if (this.rendering) {
        setTimeout(() => (this.rendering = false), this.pdfInterval)
      }
    },
    setConfig(e) {
      this.setPageCount(e._pdfInfo.numPages)
      this.loading = false
    },
    reRender() {
      if (this.$refs['pdfRef']) {
        this.$refs['pdfRef'].render()
      }
    },
    updateProgress(progress) {
      this.progress = progress
    },
  },
}
</script>

<style lang="scss">
@import 'PdfViewer.scss';
</style>
