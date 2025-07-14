<script>
import flatpickr from 'flatpickr'
import Languages from 'flatpickr/dist/l10n'
import { isAfter, parseISO } from 'date-fns'

import ValidationMessage from '../ValidationMessage'
import Action from '../Action'
import Icon from '../Icon'

import { nextArrow, prevArrow } from './util'

const DATE_REG =
  /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}|(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/\d{4}$/

export default {
  name: 'DatePicker',

  components: {
    Action,
    Icon,
    ValidationMessage,
  },

  props: {
    value: {
      type: String,
      default: null,
    },

    hint: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      default: null,
    },
    floatingLabel: {
      type: Boolean,
      default: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    min: {
      type: [String, Date],
      default: null,
    },
    max: {
      type: [String, Date],
      default: null,
    },
    time: {
      type: Boolean,
      default: false,
    },
    range: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
      default: () => {
        return {}
      },
    },
    validation: {
      type: Object,
      default: () => {
        return {}
      },
    },
    dark: {
      type: Boolean,
      default: false,
    },
    allowInput: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: () => 'DD/MM/AAAA',
    },
    required: {
      type: Boolean,
      default: () => false,
    },
  },

  data() {
    return {
      datepicker: null,
      isFocused: false,
      dateFormatted: null,
      elemInViewport: true,
      valueInside: false,
    }
  },

  computed: {
    hasValue() {
      return this.value !== null && this.value.toString().length > 0
    },
    isRequired() {
      return this.validation.$params && typeof this.validation.$params.required === 'object'
    },
    formItemClasses() {
      return {
        '--error': this.validation.$error,
        'has-value': this.hasValue,
        'has-focus': this.isFocused,
        '--disabled': this.disabled,
        'has-floating-label': this.floatingLabel,
        'theme-dark': this.dark,
        'allow-input': this.allowInput,
      }
    },
  },
  watch: {
    value(value) {
      if (!this.valueInside) {
        this.datepicker.setDate(value, true)
      }
      this.valueInside = false
    },
    min(value) {
      let minDate =
        value.constructor.toString().indexOf('Date') > -1
          ? value
          : new Date(value.replace(/-/g, '/').replace(/T.+/, ''))
      minDate.setDate(minDate.getDate())
      if (isAfter(parseISO(minDate), parseISO(this.value))) {
        this.datepicker.clear()
      }
      this.datepicker.set('minDate', minDate)
      if (typeof this.validation.$reset === 'function') {
        this.validation.$reset()
      }
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
    const altFormat = this.time
      ? this.$i18n.locale === 'en'
        ? 'm/d/Y H:i'
        : 'd/m/Y H:i'
      : this.$i18n.locale === 'en'
      ? 'm/d/Y'
      : 'd/m/Y'
    const options = Object.assign(
      {
        defaultDate: this.value,
        mode: this.range ? 'range' : this.multiple ? 'multiple' : 'single',
        time_24hr: true,
        enableTime: this.time,
        enableSeconds: false,
        minuteIncrement: 1,
        monthSelectorType: 'static',
        allowInput: this.allowInput,
        altInput: true,
        altFormat: altFormat,
        maxDate: this.max,
        minDate: this.min,
        disableMobile: true,
        appendTo: this.$refs.calendar,
        locale: Languages[this.$i18n.locale.match(/\w+/)[0]],
        nextArrow,
        prevArrow,
        onChange: (selectedDates, dateStr, instance) => {
          if (selectedDates.length) {
            this.dateFormatted = instance.formatDate(selectedDates[0], 'l, d \\de F, Y')
          }
        },
        onOpen: (selectedDates, dateStr, instance) => {
          setTimeout(() => {
            instance.open()
            this.isFocused = true
            this.elemInViewport = this.inViewport(this.$el)
          }, 200)
        },
        onClose: () => {
          this.isFocused = false
          this.$emit('close')
        },
      },
      this.options
    )

    this.datepicker = flatpickr(this.$refs.input, options)
    this.elemInViewport = this.inViewport(this.$el)

    if (this.value) {
      this.datepicker.setDate(this.value, true)
    } else {
      this.dateFormatted = this.datepicker.formatDate(new Date(), 'l, d \\de F, Y')
    }
    this.checkAllowInput(altFormat)
  },

  beforeDestroy() {
    this.datepicker.destroy()
  },

  methods: {
    updateValue(value) {
      typeof this.validation.$touch === 'function' && this.validation.$touch()
      this.valueInside = true
      this.$emit('input', value)
    },
    inViewport(elem) {
      return window.innerHeight - elem.getBoundingClientRect().bottom > 430
    },
    openDatepicker() {
      this.datepicker.altInput.focus()
    },
    closeDatepicker() {
      this.isFocused = false
    },
    checkAllowInput(altFormat) {
      if (!this.allowInput) return

      const altInput = this.$el.querySelector('.form-input:nth-child(2)')
      if (altInput) {
        altInput.addEventListener('keyup', (event) => {
          let v = event.target.value.replace(/\D/g, '').slice(0, 10)

          if (v.length >= 5) v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`
          else if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`

          event.target.value = v

          if (DATE_REG.test(event.target.value)) {
            this.datepicker.setDate(event.target.value, true, altFormat)
          }
        })

        altInput.addEventListener('blur', (event) => {
          if (!DATE_REG.test(event.target.value)) {
            this.datepicker.setDate(null, true)
          }
        })
      }
    },
  },
}
</script>

<template>
  <div
    class="date-picker"
    :class="formItemClasses"
  >
    <label
      v-if="label"
      class="date-picker__label"
      @click.prevent="openDatepicker"
    >
      {{ label }}
      <span
        v-show="required"
        class="label__required"
      >
        *
      </span>
      <span v-if="!isRequired && !disabled"> {{ $t('global:form.optional') }}</span>
    </label>

    <div class="date-picker__wrapper">
      <input
        ref="input"
        class="wrapper__input"
        :disabled="disabled"
        :readonly="readonly"
        :value="value"
        spellcheck="false"
        type="text"
        :placeholder="placeholder"
        @input="updateValue($event.target.value)"
      />

      <div class="date-picker__right-float">
        <slot name="right-float" />
      </div>

      <div
        class="wrapper__append"
        @click="openDatepicker"
      >
        <Icon
          name="calendar-range"
          wrapper
        />
      </div>
    </div>

    <div class="date-picker__details">
      <span
        v-if="hint && !validation.$error && !isFocused"
        class="details__hint"
      >
        {{ hint }}
      </span>

      <ValidationMessage :validation="validation" />
    </div>

    <div
      v-show="isFocused"
      class="date-picker__calendar"
      :class="{ 'open-up': !elemInViewport, 'has-time': time }"
      tabindex="0"
    >
      <div class="calendar__inner">
        <div class="inner__header"></div>

        <div class="inner__container">
          <div
            ref="calendar"
            class="container__calendar"
          ></div>

          <Action
            v-if="time"
            :text="$t('global:select')"
            :disabled="!hasValue"
            class="container__close"
            type="button"
            flat
            dark
            @click="closeDatepicker"
          />
        </div>
      </div>
      <span
        v-if="hint && !validation.$error && isFocused"
        class="calendar__hint"
      >
        {{ hint }}
      </span>
    </div>
  </div>
</template>

<style lang="scss">
@import 'Datepicker.scss';
</style>
