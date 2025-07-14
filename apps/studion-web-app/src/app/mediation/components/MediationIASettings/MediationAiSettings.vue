<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import ModalDialog from '@/components/general/ModalDialog'
import CustomInstructionsForm from '../../../settings/pages/SettingsCustomInstructions/components/CustomInstructionsForm'

export default defineComponent({
  name: 'MediationAiSettings',

  components: {
    ModalDialog,
    Action,
    Checkbox,
    CustomInstructionsForm,
  },

  data() {
    return {
      formData: {
        isEnabledCustomInstructions: true,
        customInstructions: [],
      },
    }
  },

  computed: {
    ...mapState({
      Mediation: (state) => state.Mediation.current.mediationPlan,
      CustomInstructions: (state) => {
        const current = state.Mediation.current
        if (
          current &&
          current.mediationPlan &&
          current.mediationPlan.meta &&
          current.mediationPlan.meta.customInstructions
        )
          return current.mediationPlan.meta.customInstructions
        return {}
      },
    }),
  },

  created() {
    if (this.Mediation.meta && this.Mediation.meta.customInstructions) {
      const formattedCi = Object.entries(this.Mediation.meta.customInstructions)

      this.formData = {
        ...this.formData,
        customInstructions: formattedCi,
      }
    }
  },

  methods: {
    ...mapActions(['setFetching', 'setFeedback', 'attemptMediationEdit', 'setMediationPlan']),

    mountPayload() {
      const payload = {
        ...this.Mediation,
        meta: {
          ...this.formData,
          customInstructions: Object.fromEntries(this.formData.customInstructions),
        },
      }

      if (this.Mediation.meta && this.Mediation.meta.data) {
        payload.meta = { ...this.Mediation.meta.data, ...payload.meta }
      }

      return payload
    },

    submit() {
      const payload = this.mountPayload()

      this.setFetching(true)
      this.attemptMediationEdit(payload, false)
        .then(({ data }) => {
          this.setMediationPlan(data)
          this.setFeedback({ message: this.$t('mediation.actions:ia.custom.instructions.success') })
          this.$emit('close')
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
})
</script>

<template>
  <ModalDialog
    class="mediation-ia-settings"
    :style="{ 'z-index': 1000 }"
    v-bind="$attrs"
    is-page
    @close="$emit('close')"
  >
    <template #title>
      {{ $t('mediation.actions:ia.custom.instructions') }}
    </template>

    <template #description>
      <div>
        <p class="text-color">{{ $t('mediation.actions:ia.custom.instructions.description') }}</p>

        <div class="mediation-ia-settings__data mb-5 mt-5">
          <CustomInstructionsForm
            v-model="formData"
            :state="CustomInstructions"
          />
        </div>

        <Checkbox
          v-model="formData.isEnabledCustomInstructions"
          :items="[{ value: true, label: $t('mediation.actions:ia.custom.instructions.checkbox') }]"
          :hint="$t('mediation.actions:ia.custom.instructions.checkbox.hint')"
          switch-type
        />
      </div>
    </template>

    <template #actions>
      <Action
        :text="$t('global:save')"
        large
        secondary
        fixed-width
        type="button"
        @click="submit"
      />
    </template>
  </ModalDialog>
</template>

<style lang="scss">
@import './MediationAiSettings.scss';
</style>
