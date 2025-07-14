<script>
import regexCreator from 'emoji-regex'
import ValidationMessage from '../ValidationMessage'

export default {
  name: 'TextareaField',
  components: {
    ValidationMessage,
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
    value: {
      type: String,
      default: () => null,
    },
    rows: {
      type: Number,
      default: 1,
    },
    autoGrow: {
      type: Boolean,
      default: false,
    },
    validation: {
      type: Object,
      default: function () {
        return {}
      },
    },
    counter: {
      type: Number,
      default: null,
    },
    hint: {
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
    hideDetails: {
      type: Boolean,
      default: false,
    },
    hideErrorDetails: {
      type: Boolean,
      default: false,
    },
    isFormUnique: {
      type: Boolean,
      default: true,
    },
    showOptional: {
      type: Boolean,
      default: true,
    },
    required: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      isMounted: false,
      emojiRegex: null,
      isFocused: false,
      objectStyle: {
        minHeight: 'auto',
        maxHeight: 'auto',
      },
      maxHeight: 0,
      minHeight: 0,
      valueInside: false,
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
    length() {
      return this.counter && this.value ? this.value.length : 0
    },
    isRequired() {
      return this.validation.$params && typeof this.validation.$params.required === 'object'
    },
    isUniqueInsideForm() {
      return this.isMounted && this.$refs.textarea.form == null && this.isFormUnique
    },
  },
  watch: {
    value() {
      this.$nextTick(() => {
        this.autoGrow && this.calculateInputHeight()
      })
    },
  },
  mounted() {
    this.isMounted = true
    this.emojiRegex = regexCreator()
    this.autoGrow && this.calculateInputHeight()
    if (this.rows > 1) {
      this.minHeight = 36 + (this.rows - 1) * 19
      this.objectStyle.minHeight = this.minHeight + 'px'
    }
  },
  methods: {
    updateValue(value) {
      typeof this.validation.$touch === 'function' && this.validation.$touch()
      value = this.removeEmoji(value)
      this.autoGrow && this.calculateInputHeight()
      this.$emit('input', value)
    },
    updateFocus() {
      this.isFocused = true
    },
    updateBlur() {
      this.isFocused = false
    },
    removeEmoji(value) {
      return value.replace(this.emojiRegex, '')
    },
    calculateInputHeight() {
      this.$refs.textarea.style.height = ''
      const height = this.$refs.textarea.scrollHeight + 2
      if (height > 40) {
        this.$refs.textarea.style.height = height + 'px'
      }
    },
  },
}
</script>

<template>
  <div
    class="textarea-field"
    :class="{
      '--error': validation.$error,
      'has-value': hasValue,
      'has-focus': isFocused,
      '--disabled': disabled,
      'is-valid': isValid,
      'has-floating-label': floatingLabel,
      'theme-dark': dark,
      'hide-details': hideDetails,
    }"
  >
    <label
      v-if="label"
      class="textarea-field__label"
      :for="'input' + _uid"
      >{{ label }}
      <span
        v-show="required"
        class="label__required"
      >
        *
      </span>
      <span v-if="!isRequired && !disabled && !isUniqueInsideForm && showOptional">{{
        $t('global:form.optional')
      }}</span></label
    >
    <div class="textarea-field__wrapper">
      <textarea
        :id="'input' + _uid"
        ref="textarea"
        class="wrapper__textarea"
        spellcheck="false"
        :class="{ 'has-slot': $slots.button }"
        :style="objectStyle"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :value="value"
        :maxLength="counter"
        @input="updateValue($event.target.value)"
        @focus="updateFocus()"
        @blur="updateBlur()"
      >
      </textarea>
      <div
        v-if="$slots.button"
        ref="append"
        class="textarea-field__append"
      >
        <slot name="button"></slot>
      </div>
    </div>
    <div
      v-if="!hideErrorDetails"
      class="textarea-field__details"
    >
      <span
        v-if="hint && !validation.$error"
        class="details__hint"
        >{{ hint }}</span
      >
      <validation-message :validation="validation"></validation-message>
      <span
        v-if="counter"
        class="details__counter"
        >{{ length }} / {{ counter }}</span
      >
    </div>
  </div>
</template>

<style lang="scss">
@import 'TextareaField.scss';
</style>
