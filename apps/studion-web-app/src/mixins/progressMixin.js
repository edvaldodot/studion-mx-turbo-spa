export const progressMixin = {
  methods: {
    $mx_addZeroToLeft(numberValue, zeroLeft = 2) {
      return String(numberValue || 0).padStart(zeroLeft, 0)
    },

    $mx_formatProgressInfo(consumed, total) {
      return `${this.$mx_addZeroToLeft(consumed)}/${this.$mx_addZeroToLeft(total)}`
    },
    $mx_formatToProgressMenuContent(progress) {
      return {
        progress: (progress && progress.requiredContentCompleted) || 0,
        total: (progress && progress.requiredContent) || 0,
      }
    },
    $mx_formatToProgressMenuExtraContent(progress) {
      return {
        progress: (progress && progress.optionalContentCompleted) || 0,
        total: (progress && progress.optionalContent) || 0,
      }
    },
  },
}
