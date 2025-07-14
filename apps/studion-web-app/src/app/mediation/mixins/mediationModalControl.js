const mediationModalControl = {
  data () {
    return {
      modalAddAction: {
        active: false
      },
      modalDeleteAction: {
        active: false,
        item: {}
      }
    }
  },
  methods: {
    closeAddActionModal () {
      this.modalAddAction.active = false
    },
    openAddActionModal () {
      this.modalAddAction.active = true
    },

    /**
     * @param {Boolean} active
     * @param {Object} item
     */
    setDeleteConfirmModalState (active, item = {}) {
      this.modalDeleteAction.item = { ...item }
      this.modalDeleteAction.active = active
    }

  }
}

export default mediationModalControl
