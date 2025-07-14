<script>
import { VMoney } from 'v-money'
import Icon from '../Icon'
import ValidationMessage from '../ValidationMessage'

export default {
  name: 'moneyField',
  components: {
    Icon,
    ValidationMessage,
  },
  directives: {
    money: VMoney,
  },
  props: {
    placeholder: {
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
    value: null,
    validation: {
      type: Object,
      default: function () {
        return {}
      },
    },
    hint: {
      type: String,
      default: null,
    },
    prependIcon: {
      type: String,
      default: null,
    },
    prependLabel: {
      type: String,
      default: null,
    },
    appendIcon: {
      type: String,
      default: null,
    },
    showCheck: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      directiveActive: false,
      isFocused: false,
      config: {
        decimal: ',',
        thousands: '.',
        prefix: '',
        suffix: '',
        precision: 2,
      },
      mutableConfig: null,
      mutableValue: null,
    }
  },
  computed: {
    hasValue() {
      return (this.value != null && this.value.toString().length > 0) || this.placeholder !== null
    },
    hasValidation() {
      return Object.keys(this.validation).length
    },
    isValid() {
      return this.validation.$error === false && this.validation.$dirty && this.showCheck
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(newValue) {
        this.directiveActive = !!this.value
        var formatted = newValue ? this.format(newValue) : null
        if (formatted !== this.mutableValue) {
          this.mutableValue = formatted
        }
      },
    },
    directiveActive() {
      this.mutableConfig = this.directiveActive ? this.config : null
      this.$refs.input.focus()
    },
  },
  methods: {
    updateValue(value) {
      typeof this.validation.$touch === 'function' && this.validation.$touch()
      this.$emit('input', this.unformat(value))
    },
    updateFocus() {
      this.isFocused = true
    },
    updateBlur() {
      this.isFocused = false
    },
    unformat(value) {
      var negative = value.indexOf('-') >= 0 ? -1 : 1
      var numbers = value.toString().replace(/\D+/g, '') || '0'
      var currency = this.numbersToCurrency(numbers)
      return parseFloat(currency) * negative
    },
    format(value) {
      if (typeof value === 'number') {
        value = value.toFixed(this.fixed(this.config.precision))
      }
      var negative = value.indexOf('-') >= 0 ? '-' : ''

      var numbers = this.onlyNumbers(value)
      var currency = this.numbersToCurrency(numbers, this.config.precision)
      var parts = this.toStr(currency).split('.')
      var integer = parts[0]
      var decimal = parts[1]
      integer = this.addThousandSeparator(integer, this.config.thousands)
      return (
        this.config.prefix +
        negative +
        this.joinIntegerAndDecimal(integer, decimal, this.config.decimal) +
        this.config.suffix
      )
    },
    onlyNumbers(input) {
      return this.toStr(input).replace(/\D+/g, '') || '0'
    },
    toStr(value) {
      return value ? value.toString() : ''
    },
    addThousandSeparator(integer, separator) {
      return integer.replace(/(\d)(?=(?:\d{3})+\b)/gm, `$1${separator}`)
    },
    joinIntegerAndDecimal(integer, decimal, separator) {
      return decimal ? integer + separator + decimal : integer
    },
    numbersToCurrency(numbers) {
      var exp = Math.pow(10, this.config.precision)
      var float = parseFloat(numbers) / exp
      return float.toFixed(this.fixed(this.config.precision))
    },
    fixed() {
      return this.between(0, this.config.precision, 20)
    },
    between(min, n, max) {
      return Math.max(min, Math.min(n, max))
    },
  },
  created() {
    let arrayNumberFormat = this.$n(9999.99, 'currency')
      .match(/\d+[.|,]+\d+[.|,]\d+/)[0]
      .match(/\D/g)
    this.config.thousands = arrayNumberFormat[0]
    this.config.decimal = arrayNumberFormat[1]
  },
}
</script>

<template>
  <div
    class="form-item"
    :class="{
      'has-error': validation.$error,
      'has-value': hasValue,
      'has-focus': isFocused,
      'is-disabled': disabled,
      'is-valid': isValid,
      'has-floating-label': floatingLabel,
      'has-prepend': prependIcon || prependLabel,
      'theme-dark': dark,
    }"
  >
    <label
      class="form-label"
      :for="'input' + _uid"
      v-if="label"
      >{{ label }}</label
    >
    <div
      class="form-input-prepend"
      v-if="prependIcon || prependLabel"
    >
      <span
        v-if="prependLabel"
        class="form-input-prepend-label"
        >{{ prependLabel }}</span
      >
      <icon
        :name="prependIcon"
        wrapper
        class="form-input-prepend-icon"
        v-if="prependIcon"
      ></icon>
    </div>
    <div class="form-input-wrapper">
      <input
        class="form-input"
        :id="'input' + _uid"
        spellcheck="false"
        type="tel"
        ref="input"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :value="mutableValue"
        @input="updateValue($event.target.value)"
        @focus="updateFocus()"
        @blur="updateBlur()"
        v-money="mutableConfig"
      />
      <div class="form-input-append">
        <icon
          :name="appendIcon"
          v-if="appendIcon"
          wrapper
        ></icon>
        <icon
          name="check"
          v-if="isValid"
          wrapper
        ></icon>
      </div>
    </div>
    <div
      class="form-input-details"
      v-if="hint || hasValidation"
    >
      <span
        class="form-input-hint"
        v-if="hint && !validation.$error"
        >{{ hint }}</span
      >
      <validation-message
        :validation="validation"
        currency
      ></validation-message>
    </div>
  </div>
</template>

<style lang="scss">
@import '~@/assets/styles/themes/default/tooltip.scss';
</style>
