<script>
import { defineComponent } from 'vue'
import { getActionInfo } from '@/domains/mediation/utils'

import InputField from '@/components/general/InputField'
import TimeField from '@/components/general/TimeField'

export default defineComponent({
  name: 'CustomDatePicker',

  components: {
    InputField,
    TimeField,
  },

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
  },

  data() {
    return {
      availabilityLabel: '',
    }
  },

  created() {
    if (!this.value.transmissionType) return
    this.setAvailabilityLabel()
  },

  methods: {
    /**
     * Set label based on selected tool.
     */
    setAvailabilityLabel() {
      const selectedTool = getActionInfo(this.value.transmissionType)
      this.availabilityLabel = this.$t('mediation.actions:form.tools.availability', {
        tool: selectedTool.shortText,
      })
    },
  },
})
</script>

<template>
  <div
    v-show="!value.isHidden"
    class="custom-date-picker flex flex-column gap-2"
  >
    <div class="select-group">
      <div class="select-group__item">
        <p class="form-item-description">
          {{ availabilityLabel }}
        </p>

        <div class="input-message">
          <input-field
            type="number"
            v-model="value.meta.duration"
            :validation="validation.meta.duration"
            :min="0"
            :max="999"
            :dark="accessibility"
            :disabled="!canWrite('mediation_plan')"
          />

          <p class="text-base text-color">
            {{ $t('mediation.actions:form.tools.availability.days') }}
          </p>
        </div>
      </div>
    </div>

    <div class="select-group flex gap-2">
      <div class="select-group__item">
        <p class="form-item-description">
          {{ $t('mediation.actions:form.tools.start_time') }}
        </p>

        <TimeField
          v-model.trim="value.meta.startTime"
          :validation="validation.meta.startTime"
          :dark="accessibility"
          :disabled="!canWrite('mediation_plan')"
        />
      </div>

      <div class="select-group__item">
        <p class="form-item-description">
          {{ $t('mediation.actions:form.tools.end_time') }}
        </p>

        <TimeField
          v-model.trim="value.meta.endTime"
          :validation="validation.meta.endTime"
          :dark="accessibility"
          :disabled="!canWrite('mediation_plan')"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import './CustomDatePicker.scss';
</style>