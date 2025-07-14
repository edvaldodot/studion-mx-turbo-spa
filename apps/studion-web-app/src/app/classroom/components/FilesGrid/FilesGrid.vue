<script>
import i18n from '@/support/i18n'
import { mapActions } from 'vuex'
import Action from '@/components/general/Action'

export default {
  name: 'FilesGrid',

  components: {
    Action
  },

  props: {
    disabled: {
      type: Boolean,
      default: false
    },

    label: {
      type: String,
      default: null
    },

    files: {
      type: Array,
      default: () => []
    }
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptDownloadExaminationFile'
    ]),

    download (data, name) {
      const DOWNLOAD_LINK = document.createElement('a')
      DOWNLOAD_LINK.href = window.URL.createObjectURL(data)
      DOWNLOAD_LINK.download = name

      document.body.appendChild(DOWNLOAD_LINK)
      DOWNLOAD_LINK.click()
      document.body.removeChild(DOWNLOAD_LINK)
    },

    async handleDownloadRequest (file) {
      this.setFetching(true)

      try {
        const response = await this.attemptDownloadExaminationFile(file.file)
        this.download(response.data, file.originalName)
      } catch (_) {
        this.setFeedback({ message: i18n.t('library:feedback.download.file.error'), type: 'error' })
      } finally {
        this.setFetching(false)
      }
    },

    clickHandler (file) {
      if (this.disabled) return
      this.handleDownloadRequest(file)
    }
  }
}
</script>

<template>
  <div class="files-grid" v-if="files && files.length">
    <span v-if="label">{{ label }}</span>

    <div>
      <Action
        v-for="file in files"
        :key="file.id"
        :text="file.originalName"
        :disabled="disabled"
        class="card-file-download"
        type="link"
        icon="download"
        iconRight
        iconSize="medium"
        @click="clickHandler(file)"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import "./FilesGrid.scss";
</style>
