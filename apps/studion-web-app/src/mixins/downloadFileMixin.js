import { mapActions } from 'vuex'
import { isMacOS, isSafariIOS, isChromeIOS } from '@/support/utils/browserIdentifiers'

import config from '@/config'

const { AVOID_EXTERNAL } = config

export const downloadFileMixin = {
  methods: {
    ...mapActions(['setFeedback', 'setFetching']),

    $downloadFile(downloadFileMethod, data, endCallback = () => {}) {
      if (this.$media.mobile)
        this.setFeedback({ message: this.$t('library:feedback.download.file.toast') })
      downloadFileMethod(data)
        .then((response) => this._downloadManager(response, data.fileName, data.type))
        .catch(() => {
          this.setFeedback({
            message: this.$t('library:feedback.download.file.error'),
            type: 'error',
          })
          this.$impersonateFeedbackError()
        })
        .finally(() => {
          this.setFetching(false)

          endCallback()
        })
    },

    /**
     * Manage download handlers to different devices.
     * @param {Blob} blob
     */
    _downloadManager(blob, fileName, mimeType) {
      if ((isSafariIOS() && !isChromeIOS()) || isMacOS()) {
        this._iosDownloadHandler(blob, fileName)
        return
      }
      if (['image', 'video'].includes(mimeType) && !AVOID_EXTERNAL) {
        this._defaultDownloadImage(blob, fileName)
        return
      }

      this._defaultDownloadHandler(blob, fileName)
    },

    /**
     * Allow Apple devices to download files inside of same page (instead of opening new tab).
     * @param {Blob} blob
     */
    _iosDownloadHandler(blob, fileName) {
      const reader = new FileReader()

      reader.onloadend = function () {
        const link = document.createElement('a')
        link.href = (reader.result || '').replace(/^data:[^;]*;/, 'data:attachment/file;')
        link.download = fileName

        link.click()
      }

      reader.readAsDataURL(blob)
    },

    /**
     * Default handler to all devices.
     *
     * Caution: Some customers need this implementation.
     * @param {Blob} blob
     */
    _defaultDownloadHandler(blob, fileName) {
      let reader = new FileReader()
      reader.onload = (e) => {
        let url = e.target.result
        let link = document.createElement('a')
        link.href = url
        link.setAttribute('download', fileName)
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
      }

      reader.readAsDataURL(blob)
    },
    async _defaultDownloadImage(response, fileName) {
      const image = await fetch(response.data.url)

      const blob = await image.blob()

      const objectUrl = URL.createObjectURL(blob)

      let a = document.createElement('a')

      a.href = objectUrl
      a.setAttribute('download', fileName)
      document.body.appendChild(a)
      a.click()

      document.body.removeChild(a)
    },
  },
}
