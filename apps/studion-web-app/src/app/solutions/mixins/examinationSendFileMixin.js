import { mapActions } from 'vuex'

export default {
  data () {
    return {
      /**
       * MB to Bytes = 2 * 1024 * 1024 = 2097152
       * Bytes to MB = 2097152 / 1024 / 1024 = 2MB
       */
      QUOTA_SIZE_LIMIT_IN_BYTES: 100 * 1024 * 1024,
      QUOTA_LIMIT_FILES_LENGTH: 5
    }
  },

  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptExaminationQuestionFileQuota'
    ]),

    /**
     * Object that comes from `examinations/files/quota` endpoint.
     * @typedef {Object} FilesQuota
     * @property {string[]} extensions
     * @property {number} maxFiles
     * @property {number} maxSize
     * @property {string[]} mimeTypes
     */

    /**
     *
     * @param {FilesQuota} filesQuota
     */
    _setupExaminationFilesQuota (filesQuota) {
      this.QUOTA_LIMIT_FILES_LENGTH = filesQuota.maxFiles
      this.QUOTA_SIZE_LIMIT_IN_BYTES = filesQuota.maxSize
    },

    /**
     *
     * @param {Object} answers
     * @param {String} type - 'correction'|'answer'
     * @returns {Array<Object>}
     */
    $filterFilesByType (answers, type) {
      const files = answers && answers.files && answers.files.filter(file => file.type === type)
      return files || []
    },

    /**
     * Get all files and split into: Files with ID and Files to upload.
     * @param {Object[]}
     */
    $splitFilesArray (files) {
      return {
        fileWithId: files.filter(file => file.hasOwnProperty('id')),
        filesToUpload: files.filter(file => !file.hasOwnProperty('id'))
      }
    }
  },

  async created () {
    this.setFetching(true)
    try {
      const response = await this.attemptExaminationQuestionFileQuota()
      this._setupExaminationFilesQuota(response)
    } catch (_) {
      this.setFeedback({ message: this.$t('global:error'), type: 'error' })
    } finally {
      this.setFetching(false)
    }
  }
}
