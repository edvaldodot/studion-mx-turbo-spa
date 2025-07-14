import { mapActions } from 'vuex'
import { isMacOS, isSafariIOS, isChromeIOS } from '@/support/utils/browserIdentifiers'

export const certificateMixin = {
  methods: {
    ...mapActions(['setFeedback', 'setFetching']),

    $downloadCertificate(downloadCertificateMethod, hash, endCallback = () => {}, isHistory = false) {
      if (this.$media.mobile)
        this.setFeedback({ message: this.$t('global:solution.certificate.toast') })
      this.setFetching(true)

      downloadCertificateMethod({ hash, isHistory })
        .then(this._downloadManager)
        .catch(() => {
          this.setFeedback({
            message: this.$t('classroom.list:feedback.download.error'),
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
    _downloadManager(blob) {
      if ((isSafariIOS() && !isChromeIOS()) || isMacOS()) {
        this._iosDownloadHandler(blob)
        return
      }

      this._defaultDownloadHandler(blob)
    },

    /**
     * Allow Apple devices to download files inside of same page (instead of opening new tab).
     * @param {Blob} blob
     */
    _iosDownloadHandler(blob) {
      const reader = new FileReader()

      reader.onloadend = function () {
        const link = document.createElement('a')
        link.href = (reader.result || '').replace(/^data:[^;]*;/, 'data:attachment/file;')
        link.download = 'certificate.pdf'

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
    _defaultDownloadHandler(blob) {
      let reader = new FileReader()
      reader.onload = (e) => {
        let url = e.target.result
        let link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'certificate.pdf')
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(link)
      }
      reader.readAsDataURL(blob)
    },
  },
}
