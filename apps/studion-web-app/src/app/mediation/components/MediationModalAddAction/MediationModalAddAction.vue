<script>
import { mapState } from 'vuex'

import Modal from '@/components/general/Modal'
import Action from '@/components/general/Action'
import MediationActionForm from '../MediationActionForm'

import { ACTION_FORM_VALIDATION, CARD_KEYS } from '../../shared'

export default {
  components: {
    Action,
    Modal,
    MediationActionForm
  },
  props: {
    /**
     * Set DaysSinceReferenceDate on action form and lock field if not null
    */
    refDate: {
      type: [ String, Number ],
      default: null
    }
  },
  data () {
    return {
      mediations: {}
    }
  },
  computed: {
    ...mapState(['Mediation'])
  },
  methods: {
    close () {
      this.$emit('close')
    },
    submit (value) {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.$emit('submit', value)
        this.close()
      }
    }
  },
  validations: {
    mediations: ACTION_FORM_VALIDATION
  },
  created () {
    this.mediations = this.deepClone(CARD_KEYS)
  }
}
</script>

<template>
  <modal class="add-mediation-action-modal" @close="close" :active="true" is-page>
    <div class="modal-form">
      <span class="modal-subtitle">{{ $t('mediation.modal:add.action.header.1') }}</span>
      <h2 class="modal-title text-color">{{ $t('mediation.modal:add.action.header.2') }}</h2>
      <div class="modal-description text-color">
        <p class="text-color">{{ $t('mediation.modal:add.action.header.3') }}</p>
      </div>
      <div class="modal-description text-color modal-description__tip">
        <p class="text-color">{{ $t('mediation.modal:add.action.header.4') }}</p>
      </div>
    </div>
    <div>
      <MediationActionForm
        v-model="mediations"
        :validation="$v.mediations"
        :refDate="refDate"
        dark
        @settings="$emit('settings', true)"
      />
    </div>
    <div class="flex justify-content-center">
      <action
        large
        primary
        fixed-width
        type="button"
        class="mt-5 mb-5"
        @click="submit(mediations)"
        :text="$t('global:save')"
      />
    </div>
  </modal>
</template>
