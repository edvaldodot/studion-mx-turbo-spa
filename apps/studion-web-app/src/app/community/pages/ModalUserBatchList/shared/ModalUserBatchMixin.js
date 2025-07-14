export default {
  methods: {
    $lmx_getStatus (item) {
      return item.status === 'processing' ? 'pending' : item.status
    },
    $lmx_isCompleted (item) {
      return this.$lmx_getStatus(item) === 'completed'
    },
    $lmx_isProcessing (item) {
      return this.$lmx_getStatus(item) === 'pending'
    },
    $lmx_isCanceled (item) {
      return this.$lmx_getStatus(item) === 'canceled'
    },
    $lmx_isCanceledOrError (item) {
      return ['canceled', 'error'].includes(this.$lmx_getStatus(item))
    },
    $lmx_isError (item) {
      return this.$lmx_getStatus(item) === 'error'
    },
    $lmx_showProgress (item) {
      this.$router.push({
        name: 'community.users.batch.status',
        params: { id: item.id }
      })
    },
    $lmx_getStatusLabel (item) {
      return this.$t(
        `community.users.batch:status.${this.$lmx_getStatus(item)}`
      )
    }
  }
}
