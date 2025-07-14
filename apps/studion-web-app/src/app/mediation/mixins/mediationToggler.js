import { mapActions } from 'vuex'

const mediationToggler = {
  data () {
    return {
      openConfirmModal: false,
      selectedItem: null,
      selectedAction: ''
    }
  },
  methods: {
    ...mapActions(['attemptToggleMediationStatus', 'setFetching', 'setFeedback']),
    /**
         * Change status of active or published for Mediation Plan
         * @param {number} id - Mediation ID
         * @param {string} action - Define action to call for toggle status or publish
         */
    toggler (item, action) {
      this.openConfirmModal = false
      this.setFetching(true)
      const {id, name, active, published} = item
      this.attemptToggleMediationStatus({ id, action })
        .then(() => {
          if (action === 'active') {
            this.openConfirmModal = false
            this.setFeedback({
              message: !active ? this.$t('mediation.list:feedback.activated', {mediationName: name}) : this.$t('mediation.list:feedback.deactivated', {mediationName: name})
            })
          } else {
            this.setFeedback({
              message: !published ? this.$t('mediation.list:feedback.published', {mediationName: name}) : this.$t('mediation.list:feedback.unpublished', {mediationName: name})
            })
          }
          this.pgtrRefresh()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    controlModalConfirm (item, action) {
      this.selectedItem = item
      this.selectedAction = action
      this.openConfirmModal = true
    }
  }
}

export default mediationToggler
