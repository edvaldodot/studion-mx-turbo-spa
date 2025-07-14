<script>
import { defineComponent } from 'vue'

import CalendarFlat from '../../CalenderFlat'
import Icon from '../../Icon'
import InputField from '../../InputField'

export default defineComponent({
  name: 'FilterPeriodCalendar',

  components: {
    CalendarFlat,
    Icon,
    InputField,
  },

  props: {
    value: {
      type: [String, Date],
      default: null,
    },

    label: {
      type: String,
      default: '',
    },

    min: {
      type: [String, Date],
      default: null,
    },

    max: {
      type: [String, Date],
      default: null,
    },
  },

  data() {
    return {
      internalValue: null,
    }
  },

  methods: {
    updateInternalValue(value) {
      this.internalValue = value ? this.formatDate(value) : null
      this.triggerInput(value)
    },

    clear() {
      this.updateInternalValue(null)
    },

    triggerInput(value) {
      this.$emit('input', value)
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('filter-period-calendar-' + label)"
    class="filter-period-calendar"
  >
    <InputField
      v-model.trim="internalValue"
      :label="label"
      :show-optional="false"
      class="view-date"
      append-icon="calendar-range"
      readonly
      prevent-focus
    >
      <template
        v-if="internalValue"
        #button
      >
        <div
          class="clear-btn"
          @click.stop="clear"
        >
          <Icon
            name="close"
            size="small"
          />
        </div>
      </template>
    </InputField>

    <CalendarFlat
      :value="value"
      :min="min"
      :max="max"
      @input="updateInternalValue"
    />
  </div>
</template>