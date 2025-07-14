export default {
  data() {
    return {
      modalPublishingError: false,
      publishingErrors: [],
      showFeedback: true,
    }
  },

  methods: {
    /**
     * Handles publishing error responses by displaying feedback to the user.
     *
     * @param {Object} response - The error response from the server.
     * @return The feedback message and type
     */
    $commons_handlePublishError(response) {
      if (!this.showFeedback) return

      const errorI18nString = 'offerings.publishing:error'

      const responseData = response && response.data
      const errorMessage = responseData && responseData.message
      const hasHintErrors = responseData && responseData.hint && responseData.hint.errors

      if (hasHintErrors) {
        this.modalPublishingError = true
        this.publishingErrors = hasHintErrors
        return
      }

      const knownErrors = [
        'offering_already_published',
        'can_not_published_offering_without_session',
        'can_not_published_without_course',
      ]

      if (knownErrors.includes(errorMessage)) {
        return this.setFeedback({
          message: this.$t(`${errorI18nString}.${errorMessage}`),
          type: 'error',
        })
      }

      return this.setFeedback({
        message: this.$t('offerings.publishing:error'),
        type: 'error',
      })
    },
  },
}
