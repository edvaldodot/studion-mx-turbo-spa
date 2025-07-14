export const genericModalConfirmMixin = {
  data () {
    return {
      modalConfirmContext: 'global',
      alwaysShowConfirmModal: true,
      genericConfirmModalData: {
        isActiveModal: false,
        formDatakey: null,
        formDataOldValue: null,
        alreadyConfirmed: []
      }
    }
  },
  computed: {
    translateKey () {
      return this.genericConfirmModalData.formDatakey && this.genericConfirmModalData.formDatakey.replace(/formData\./g, '')
    },
    genericConfirmModalTitle () {
      if (!this.genericConfirmModalData.formDatakey) return ''
      return this.$t(`${this.modalConfirmContext}:modal.confirm.${this.translateKey}.title`)
    },
    genericConfirmModalDescription () {
      if (!this.genericConfirmModalData.formDatakey) return ''
      return this.$t(`${this.modalConfirmContext}:modal.confirm.${this.translateKey}.description`)
    }
  },
  methods: {
    cleanDirtyData () {
      this.genericConfirmModalData.formDataOldValue = null
      this.genericConfirmModalData.formDatakey = null
    },
    showGenericConfirmModal (newVal, oldVal, formDataKey) {
      if (this.isAlreadyConfirmed(formDataKey) && !this.alwaysShowConfirmModal) return

      this.genericConfirmModalData.formDatakey = formDataKey

      if (Array.isArray(newVal) || Array.isArray(oldVal)) {
        if (JSON.stringify(oldVal) === JSON.stringify(newVal)) return

        if (JSON.stringify(this.genericConfirmModalData.formDataOldValue) === JSON.stringify(newVal)) {
          this.cleanDirtyData()
          return
        }
      } else {
        if (newVal !== null && this.genericConfirmModalData.formDataOldValue === newVal) {
          this.cleanDirtyData()
          return
        }
      }

      if (oldVal !== null) {
        this.genericConfirmModalData.formDataOldValue = oldVal
        this.genericConfirmModalData.isActiveModal = true
      }
    },
    cancelDataChange () {
      this.rollbackPropertyValue(this.genericConfirmModalData.formDatakey, this.genericConfirmModalData.formDataOldValue)
      this.genericConfirmModalData.isActiveModal = false
    },
    confirmDataChange () {
      this.genericConfirmModalData.isActiveModal = false
      this.addAlreadyConfirmed(this.genericConfirmModalData.formDatakey)
      this.cleanDirtyData()
    },
    rollbackPropertyValue (propertyToRollback, data) {
      let object = this
      propertyToRollback.split('.').forEach((token, index, arr) => {
        if (arr.length === index + 1) {
          object[token] = data
          return
        }
        object = object[token]
      })
    },
    isAlreadyConfirmed (property) {
      return this.genericConfirmModalData.alreadyConfirmed.includes(property)
    },
    addAlreadyConfirmed (property) {
      if (!this.isAlreadyConfirmed(property)) {
        this.genericConfirmModalData.alreadyConfirmed.push(property)
      }
    }
  }
}
