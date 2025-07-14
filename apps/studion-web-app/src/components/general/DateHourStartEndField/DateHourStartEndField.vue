<script>
import { defineComponent } from 'vue'

import Datepicker from '../Datepicker'
import HourField from '../HourField'

export default defineComponent({
  name: 'DateHourStartEndField',

  components: {
    Datepicker,
    HourField,
  },

  validations: {
    date: {},
  },

  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
    validations: {
      type: Object,
      required: true,
    },
  },

  computed: {
    computedTime() {
      const time = { date: null, start: '00:00', end: '00:00' }

      if (this.value) {
        const { date, start, end } = this.value

        if (date) time.date = date
        if (start) time.start = start
        if (end) time.end = end
      }

      return time
    },
  },

  methods: {
    updateValue(value, prop) {
      const time = { ...this.computedTime }
      time[prop] = value
      this.$emit('input', time)
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('date-hour-start-end-field')"
    class="date-hour__time"
  >
    <div class="date-hour__date">
      <Datepicker
        :value="computedTime.date"
        :label="$t('global:form.date')"
        :validation="validations.date ? validations.date : $v.date"
        dark
        @input="updateValue($event, 'date')"
      />
    </div>

    <div class="date-hour__start-end">
      <HourField
        :value="computedTime.start"
        @input="updateValue($event, 'start')"
      />

      <div class="divisor">{{ '-' }}</div>

      <HourField
        :value="computedTime.end"
        :min="computedTime.start"
        @input="updateValue($event, 'end')"
      />
    </div>
  </div>
</template>
<style lang="scss">
@import 'DateHourStartEndField.scss';
</style>
