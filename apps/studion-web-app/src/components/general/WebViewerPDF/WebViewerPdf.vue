<script>
import WebViewer from '@pdftron/webviewer'
import config from '@/config'

const { WEB_VIEWER_PDF_LICENSE_KEY } = config

export default {
  name: 'WebViewerPdf',
  props: {
    src: {
      required: true,
      default: '',
    },
  },
  data() {
    return {
      disableElements: [
        'searchButton',
        'toggleNotesButton',
        'ribbons',
        'settingsButton',
        'printButton',
        'leftPanelButton',
        'viewControlsButton',
        'panToolButton',
        'selectToolButton',
        'toolsHeader',
        'menuButton',
      ],
      instance: null,
    }
  },
  mounted() {
    this.webViewerInstance()
  },
  methods: {
    pageNumberUpdated(page) {
      this.$emit('pageLoaded', page)
    },
    downloadPDF(filename) {
      if (this.instance) {
        this.instance.UI.downloadPdf({
          filename: filename,
        })
      }
    },
    handlerPageLoadedForPDFOnePage(pages) {
      const isOnePage = pages === 1

      if (isOnePage) this.pageNumberUpdated(pages)
    },
    webViewerInstance() {
      const path = '/webviewer'

      WebViewer(
        {
          path: `${path}/public`,
          uiPath: './ui/index.aspx',
          initialDoc: this.src,
          licenseKey: WEB_VIEWER_PDF_LICENSE_KEY,
          css: `${path}/pdf_viewer.css`,
        },
        this.$refs.viewer
      )
        .then((instance) => {
          const { Core, UI } = instance

          const { documentViewer } = Core

          documentViewer.addEventListener('pageNumberUpdated', (currentPage) => {
            this.pageNumberUpdated(currentPage)
          })

          documentViewer.addEventListener('documentLoaded', () => {
            this.handlerPageLoadedForPDFOnePage(documentViewer.getPageCount())
          })

          UI.setZoomLevel(1.5)
          UI.disableElements(this.disableElements)
          UI.disableTools()
          this.instance = instance
        })
        .catch((error) => {
          console.error('Error loading WebViewer:', error)
        })
    },
  },
}
</script>
<template>
  <div
    id="webviewer"
    ref="viewer"
    class="web-viewer-pdf"
  ></div>
</template>

<style lang="scss">
@import 'WebViewerPdf.scss';
</style>
