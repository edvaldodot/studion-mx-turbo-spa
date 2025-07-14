<script>
import { defineComponent } from 'vue'
import flatpickr from 'flatpickr'
import Languages from 'flatpickr/dist/l10n'
import { isAfter, parseISO } from 'date-fns'

import { nextArrow, prevArrow } from './util'

export default defineComponent({
  name: 'CalendarFlat',

  props: {
    value: {
      type: [String, Date],
      default: null,
    },

    disabled: {
      type: Boolean,
      default: true,
    },

    min: {
      type: [String, Date],
      default: null,
    },

    max: {
      type: [String, Date],
      default: null,
    },

    options: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },

  data() {
    return {
      datepicker: null,
      valueInside: false,
    }
  },

  watch: {
    value(value) {
      if (!this.valueInside) {
        this.datepicker.setDate(value, true)
      }
      this.valueInside = false
    },

    min(value) {
      if (!value) {
        this.datepicker.set('minDate', null)
        return
      }

      let minDate =
        value.constructor.toString().indexOf('Date') > -1
          ? value
          : new Date(value.replace(/-/g, '/').replace(/T.+/, ''))

      minDate.setDate(minDate.getDate())

      if (isAfter(parseISO(minDate), parseISO(this.value))) {
        this.datepicker.clear()
      }

      this.datepicker.set('minDate', minDate)
    },

    max(value) {
      this.datepicker.set('maxDate', value)
    },

    disabled() {
      this.disabled
        ? this.datepicker._input.setAttribute('disabled', 'disabled')
        : this.datepicker._input.removeAttribute('disabled')
    },
  },

  mounted() {
    const altFormat = this.$i18n.locale === 'en' ? 'm/d/Y' : 'd/m/Y'

    const options = Object.assign(
      {
        defaultDate: this.value,
        time_24hr: true,
        monthSelectorType: 'static',
        altInput: true,
        altInputClass: 'd-none',
        altFormat: altFormat,
        maxDate: this.max,
        minDate: this.min,
        disableMobile: true,
        appendTo: this.$refs.calendar,
        locale: Languages[this.$i18n.locale.match(/\w+/)[0]],
        shorthandCurrentMonth: true,
        nextArrow,
        prevArrow,
        onChange: (selectedDates) => {
          if (selectedDates.length) {
            this.$emit('input', selectedDates[0])
          }
        },
      },
      this.options
    )

    this.datepicker = flatpickr(this.$refs.input, options)

    if (this.value) {
      this.datepicker.setDate(this.value, true)
      return
    }
  },

  beforeDestroy() {
    this.datepicker.destroy()
  },

  methods: {
    updateValue() {
      this.valueInside = true
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('calendar-flat')"
    class="form-item"
  >
    <input
      ref="input"
      :disabled="disabled"
      :value="value"
      type="hidden"
      @input="updateValue"
    />

    <div class="calendar-flat">
      <div class="calendar-flat__inner">
        <div class="calendar-flat__container">
          <div
            ref="calendar"
            class="calendar-flat__calendar"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'CalendarFlat.scss';
</style>
