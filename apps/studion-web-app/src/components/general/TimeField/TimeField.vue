<script>
import { defineComponent } from 'vue'
import { REGEX_HOUR_MINUTE } from '@/support/utils/constants'

import InputField from '../InputField'

export default defineComponent({
  name: 'TimeField',

  components: {
    InputField,
  },

  methods: {
    formatTime(event) {
      let time = event
      if (time && time.length === 5 && !REGEX_HOUR_MINUTE.test(time)) {
        time = this.correctTime(time)
      }

      this.$emit('input', time)
    },

    correctTime(time) {
      let [hours, minutes] = time.split(':')

      if (hours > 23) {
        hours = 23
      }

      if (minutes > 59) {
        minutes = 59
      }

      return hours + ':' + minutes
    },
  },
})
</script>

<template>
  <input-field
    v-bind="$attrs"
    :data-testid="$testId('time-field')"
    mask="##:##"
    @input="formatTime"
  />
</template>
