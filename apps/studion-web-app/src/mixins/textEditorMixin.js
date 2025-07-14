import { mapActions } from 'vuex'
import { fileTypes } from '@/domains/library/support/fileTypes'

const textEditorMixin = {
  methods: {
    ...mapActions(['attemptUploadMediaFile', 'setFetching', 'setFeedback']),

    addText(tag) {
      this.$nextTick(() => {
        this.$refs.textField.addText(tag)
      })
    },

    getFileTypeIcon(mimeType) {
      let alias = this.getAliasFileTypes(mimeType)
      return alias ? 'file-' + alias : 'file'
    },

    getAliasFileTypes(mimeType) {
      const currentFileType = fileTypes.find((fileType) => {
        return fileType.mime.indexOf(mimeType) > -1
      })
      return currentFileType ? currentFileType.alias : null
    },

    openFile() {
      this.$nextTick(() => {
        this.$refs.file.$refs.input.click()
      })
    },

    openMediaFile() {
      this.$nextTick(() => {
        this.$refs.mediaFile.$refs.input.click()
      })
    },

    addFile() {
      if (!this.$v.value.tempFile.$invalid) {
        let fileArray = Array.from(this.value.tempFile)
        this.value.files.push(...fileArray)
        this.value.tempFile = null
      } else if (!this.$v.value.tempFile.mimeType) {
        this.setFeedback({
          message: this.$t('classroom.message:feedback.message.attachment.error:invalid.file.type'),
          type: 'error',
        })
      } else {
        this.setFeedback({
          message: this.$t('classroom.message:feedback.message.attachment.error:invalid.file.size'),
          type: 'error',
        })
      }
      this.$refs.file.$refs.input.value = null
    },

    handlerTypeFile(addImageAtFifty = false) {
      const file = new File([this.tempFile], this.tempFile.name, {
        type: this.tempFile.type,
      })
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      this.value.tempMediaFile = dataTransfer.files
      this.addMediaFile(addImageAtFifty)
    },

    addMediaFile(addImageAtFifty = false) {
      if (!this.$v.value.tempMediaFile.$invalid) {
        this.setFetching(true)

        this.attemptUploadMediaFile({ file: this.value.tempMediaFile })
          .then(({ data }) => {
            let imgAttrs = { 'max-width': 'max-width: 97%' }
            if (addImageAtFifty) imgAttrs.width = '97%'

            this.$refs.textField.addImageUrl(data.url, imgAttrs)
            this.value.tempMediaFile = null
          })
          .finally(() => {
            this.$refs.mediaFile.$refs.input.value = null
            this.setFetching(false)
          })
      } else if (!this.$v.value.tempMediaFile.mimeType) {
        this.setFeedback({
          message: this.$t('classroom.message:feedback.message.attachment.error:invalid.file.type'),
          type: 'error',
        })
      } else {
        this.setFeedback({
          message: this.$t('classroom.message:feedback.message.attachment.error:invalid.file.size'),
          type: 'error',
        })
      }
    },

    removeFile(fileIndex) {
      this.value.files.splice(fileIndex, 1)
    },
  },
}

export default textEditorMixin
