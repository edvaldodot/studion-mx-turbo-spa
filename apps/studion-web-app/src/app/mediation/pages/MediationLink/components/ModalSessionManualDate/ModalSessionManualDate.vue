<script>
import Action from '@/components/general/Action'
import Datepicker from '@/components/general/Datepicker'
import Modal from '@/components/general/Modal'

export default {
  name: 'ModalSessionManualDate',

  components: {
    Action,
    Datepicker,
    Modal
  },

  props: {
    sessionLink: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      referenceDate: null
    }
  },

  methods: {
    submit () {
      if (!this.canWrite('mediation_plan')) return

      if (this.referenceDate) {
        this.$set(this.sessionLink, 'referenceDate', this.referenceDate)
      } else {
        this.sessionLink.referenceDate = ''
      }

      this.$emit('close')
    }
  },

  created () {
    if (!this.sessionLink.referenceDate) return
    this.referenceDate = this.sessionLink.referenceDate
  }
}
</script>

<template>
  <modal class="modal-manual-add-session-date" @close="$emit('close')" :active="true" is-page>
    <div class="modal-form">
      <span class="modal-subtitle">{{ $t('mediation.modal:add.action.header.1') }}</span>
      <h2 class="modal-title text-color">{{ $t('mediation.links:modal.session.manual.date:header.1') }}</h2>
      <div class="modal-description text-color">
        <p v-html="$t('mediation.links:modal.session.manual.date:header.2')"></p>
      </div>

      <form @submit.prevent="submit">
        <Datepicker
          v-model="referenceDate"
          :label="$t('mediation.links:modal.session.manual.date:label')"
          :disabled="!canWrite('mediation_plan')"
          dark
        />

        <div class="form-submit text-center">
          <action
            type="button"
            class="mt-5 mb-5 hover:text-white"
            :text="$t('global:save')"
            :disabled="!canWrite('mediation_plan')"
            large
            flat
            primary
            fixed-width
            submit
          />
        </div>
      </form>
    </div>
  </modal>
</template>
