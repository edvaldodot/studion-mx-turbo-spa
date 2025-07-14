import { META_KEYS, POLL_KEYS } from '../../../../shared'
import { isEmailOrSms } from '../../../../utils'

export default {
  props: {
    accessibility: {
      type: Boolean,
      default: false,
    },

    validation: {
      type: Object,
      required: true,
    },

    value: {
      type: Object,
      default: () => ({}),
    },

    templateAction: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      maxLength: 75,
    }
  },

  methods: {
    /**
     * Private method to modify value object based on selected transmission type.
     */
    _executeMetaToolRules() {
      if (this.value.filterId) delete this.value.filterId

      if (!this.value.meta || !this.value.meta.endTime) {
        this.value.meta = {
          ...META_KEYS,
          duration: 0,
          startTime: '06:00',
          endTime: '21:00',
          transmissionType: this.value.transmissionType,
        }
      }

      if (
        this.value.transmissionType === 'poll' &&
        (!this.value.meta.choices || !this.value.meta.choices.length)
      ) {
        this.value.meta = {
          ...this.value.meta,
          ...POLL_KEYS,
        }
      }

      if (this.value.transmissionType !== 'poll' && this.value.meta.choices) {
        this.value.meta.multiplesChoices = null
        this.value.meta.choices = []
      }
    },

    _executeResetMeta() {
      if (!this.value.meta.triggerTime) {
        this.value.meta = {
          triggerTime: null,
          transmissionType: this.value.transmissionType,
          responsible: this.value.meta.responsible,
          referenceDate: this.value.referenceDate,
        }
      }
    },
  },

  created() {
    if (this.value.title) {
      this.value.title = this.value.title.substring(0, this.maxLength)
    }

    if (isEmailOrSms(this.value)) return this._executeResetMeta()
    this._executeMetaToolRules()
  },
}
