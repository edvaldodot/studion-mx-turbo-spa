<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    min: {
      type: String,
      default: '00:00',
    },
    max: {
      type: String,
      default: '23:59',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      required: true,
    },
  },
})
</script>

<template>
  <div class="hour-field">
    <input
      :disabled="disabled"
      :value="value"
      :min="min"
      :max="max"
      type="time"
      step="60"
      @input="$emit('input', $event.target.value)"
    />
  </div>
</template>

<style lang="scss">
@import 'HourField.scss';
</style>
