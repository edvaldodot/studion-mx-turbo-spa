<script>
import { defineComponent } from 'vue'

import Datepicker from '@/components/general/Datepicker'
import FormSection from '@/components/general/FormSection'
import Radio from '@/components/general/Radio'

export default defineComponent({
  name: 'PeriodSelector',

  components: {
    Datepicker,
    FormSection,
    Radio,
  },

  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
    dark: {
      type: Boolean,
      default: false,
    },
    validation: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      mutableValue: this.value,
      enrollmentPeriods: [
        {
          value: 'continuous',
          label: this.$t('global:form.continuous'),
        },
        {
          value: 'predefined',
          label: this.$t('global:form.temporary'),
        },
      ],
    }
  },

  watch: {
    'mutableValue.enrollmentType': {
      handler(value) {
        if (value === 'continuous') this.mutableValue.enrollmentEndDate = null
      },
    },
  },
})
</script>

<template>
  <FormSection class="session-period-selector">
    <h3 class="form-item-description text-color">
      {{ $t('offerings.create:form.section.period.title') }}
    </h3>
    <Radio
      v-model="mutableValue.enrollmentType"
      :items="enrollmentPeriods"
      :validation="validation.enrollmentType"
      :dark="dark"
      :disabled="!canWrite('offerings')"
      horizontal
    />

    <div
      class="form-group clearfix"
      data-cols="2"
      data-gap="40"
    >
      <Datepicker
        v-model="mutableValue.enrollmentStartDate"
        :disabled="!canWrite('offerings') || mutableValue.enrollmentType === null"
        :label="$t('global:form.opening')"
        :validation="validation.enrollmentStartDate"
        :max="mutableValue.enrollmentEndDate"
        :dark="dark"
      />
      <Datepicker
        v-model="mutableValue.enrollmentEndDate"
        :disabled="mutableValue.enrollmentType !== 'predefined' || !canWrite('offerings')"
        :label="$t('global:form.closing')"
        :min="mutableValue.enrollmentStartDate"
        :validation="validation.enrollmentEndDate"
        :dark="dark"
      />
    </div>
  </FormSection>
</template>

<style lang="scss">
@import './PeriodSelector.scss';
</style>
