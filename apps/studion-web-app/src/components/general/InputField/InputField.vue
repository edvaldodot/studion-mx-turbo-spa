<script>
import regexCreator from 'emoji-regex'
import { mask } from 'vue-the-mask'
import Action from '../Action'
import Icon from '../Icon'
import ValidationMessage from '../ValidationMessage'

export default {
  name: 'InputField',
  components: {
    Action,
    Icon,
    ValidationMessage,
  },
  directives: {
    mask,
  },

  props: {
    autocomplete: {
      type: String,
      default: null,
    },
    autocapitalize: {
      type: String,
      default: null,
    },
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
    type: {
      type: String,
      default: 'text',
    },
    counter: {
      type: Number,
      default: null,
    },
    hint: {
      type: String,
      default: null,
    },
    hintTooltip: {
      type: Boolean,
      default: false,
    },
    prependIcon: {
      type: String,
      default: null,
    },
    prependLabel: {
      type: String,
      default: null,
    },
    appendLabel: {
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
    customPrepend: {
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
    min: {
      type: Number,
      default: null,
    },
    max: {
      type: Number,
      default: null,
    },
    step: {
      type: Number,
      default: 1,
    },
    anyStep: {
      type: Boolean,
      default: false,
    },
    disabledVisibility: {
      type: Boolean,
      default: false,
    },
    mask: {
      type: String,
      default: null,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    hasPercent: {
      type: Boolean,
      default: false,
    },
    isFormUnique: {
      type: Boolean,
      default: true,
    },
    showCustomHint: {
      type: Boolean,
      default: false,
    },
    isHorizontal: {
      type: Boolean,
      default: false,
    },
    disablePaste: {
      type: Boolean,
      default: false,
    },
    small: {
      type: Boolean,
      default: false,
    },
    inputStyle: {
      type: Object,
      default: () => {},
    },
    hideControls: {
      type: Boolean,
      default: false,
    },
    showOptional: {
      type: Boolean,
      default: true,
    },
    preventFocus: {
      type: Boolean,
      default: false,
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
      passwordVisible: false,
      internalType: this.type,
      capslock: false,
      autofill: false,
      isDecimalNumber: false,
      invalidKeyCode: [107, 69, 187, 190, 109, 189, 110],
    }
  },

  computed: {
    hasValue() {
      return (
        (this.value != null && this.value.toString().length > 0) ||
        this.autofill ||
        this.placeholder !== null
      )
    },
    hasValidation() {
      return Object.keys(this.validation).length
    },
    isValid() {
      return this.validation.$error === false && this.validation.$dirty && this.showCheck
    },
    isPassword() {
      return this.type === 'password'
    },
    isNumber() {
      return this.internalType === 'number'
    },
    getStep() {
      if (this.anyStep) return 'any'
      return this.isNumber ? this.step : null
    },
    isRequired() {
      return this.validation.$params != null && typeof this.validation.$params.required === 'object'
    },
    isUniqueInsideForm() {
      return (
        this.isFormUnique &&
        this.isMounted &&
        (this.$refs.input.form == null ||
          Array.from(this.$refs.input.form.elements).filter((elem) => elem.nodeName !== 'BUTTON')
            .length === 1)
      )
    },
    visibilityIcon() {
      return this.passwordVisible ? 'visibility' : 'visibility_off'
    },
    length() {
      return this.counter && this.value ? this.value.length : 0
    },
    appendSize() {
      return this.isMounted ? (this.$refs.append ? this.$refs.append.offsetWidth : 0) : 0
    },
    classes() {
      return {
        '--error': this.validation.$error,
        'has-value': this.hasValue,
        'has-focus': this.isFocused,
        '--disabled': this.disabled,
        'is-valid': this.isValid,
        'has-floating-label': this.floatingLabel,
        'has-prepend': this.prependIcon || this.prependLabel || this.customPrepend,
        'hide-details': this.hideDetails,
        'theme-dark': this.dark,
        'has-append-icon': this.isNumber,
        'is-horizontal': this.isHorizontal,
        'is-small': this.small,
        ['type-' + this.type]: this.type,
      }
    },
  },
  watch: {
    appendSize() {
      if (this.$refs.input) {
        this.$refs.input.style.paddingRight = `${this.appendSize}px`
      }
    },
    label() {
      if (this.isHorizontal) this.setLabelOffset()
    },
  },

  mounted() {
    this.isMounted = true
    this.$nextTick(() => {
      this.isDecimalNumber = this.internalType === 'number' && this.step.toString().includes('.')
      this.isMounted = true
      this.emojiRegex = regexCreator()
      this.checkAutoFill()
    })

    if (this.isHorizontal) this.setLabelOffset()
  },

  methods: {
    updateValue(value) {
      if (!this.isNumber) {
        value = this.removeEmoji(value)
      }
      this.autofill = false
      this.$emit('input', value)
    },
    roundValueNumber() {
      if (this.isNumber && !isNaN(parseFloat(this.value))) {
        let newValue = this.isDecimalNumber
          ? parseFloat(this.value).toFixed(2).toString()
          : parseFloat(this.value).toFixed(0)
        newValue = this.max !== null && newValue > this.max ? this.max : newValue
        newValue = this.min !== null && newValue < this.min ? this.min : newValue
        this.$emit('input', newValue)
      }
    },
    updateFocus(event) {
      this.$emit('focus', event)
      if (this.preventFocus) return
      this.isFocused = true
      typeof this.validation.$reset === 'function' && this.validation.$reset()
    },
    updateBlur(event) {
      this.$emit('blur', event)
      this.isFocused = false
      this.roundValueNumber()
      typeof this.validation.$touch === 'function' && this.validation.$touch()
    },
    removeEmoji(value) {
      return value.replace(this.emojiRegex, '')
    },
    changeVisiblity() {
      if (!this.disabled) {
        this.passwordVisible = !this.passwordVisible
        this.internalType = this.passwordVisible ? 'text' : 'password'
        this.$refs.input.focus()
      }
    },
    checkCapslock(event) {
      this.capslock = event.getModifierState && event.getModifierState('CapsLock')
    },
    keyUp(event) {
      this.$emit('keyup', event)
      this.isPassword && this.checkCapslock(event)
    },
    keyDown(event) {
      if (
        this.type === 'number' &&
        (this.invalidKeyCode.includes(event.keyCode) ||
          (this.value != null && this.value.toString().indexOf('.') > -1 && event.keyCode === 188))
      ) {
        event.preventDefault()
      }
      this.isPassword && this.checkCapslock(event)
    },
    addNumber() {
      this.roundValueNumber()
      let newValue = (this.value ? parseFloat(this.value) : 0) + this.step
      newValue = this.max !== null && newValue > this.max ? this.max : newValue
      this.updateValue(this.isDecimalNumber ? newValue.toFixed(2) : newValue)
    },
    subtractNumber() {
      this.roundValueNumber()
      let newValue = (this.value ? parseFloat(this.value) : 0) - this.step
      newValue = this.min !== null && newValue < this.min ? this.min : newValue
      this.updateValue(this.isDecimalNumber ? newValue.toFixed(2) : newValue)
    },
    checkAutoFill() {
      const onAnimationStart = ({ animationName }) => {
        if (animationName === 'autofilldark' || animationName === 'autofill') {
          this.autofill = true
        }
      }
      if (this.$refs.input)
        this.$refs.input.addEventListener('animationstart', onAnimationStart, false)
    },
    setLabelOffset() {
      this.$forceNextTick(() => {
        const labelSize = this.$refs.label.offsetWidth + 20
        this.$refs.wrapper.style.marginLeft = labelSize + 'px'
        if (this.$refs.prepend) this.$refs.prepend.style.marginLeft = labelSize + 'px'
        if (this.$refs.details) this.$refs.details.style.marginLeft = labelSize + 'px'
      })
    },
    onPaste(event) {
      if (this.disablePaste) {
        event.preventDefault()
      }
    },
  },
}
</script>

<template>
  <div
    v-show="isMounted"
    :data-testid="$testId('input-field')"
    class="input-field"
    :class="[classes, 'is-valid']"
    @click="$emit('wrapperClick')"
  >
    <label
      v-if="label"
      ref="label"
      class="input-field__label"
      :for="'input' + _uid"
    >
      {{ label }}
      <span
        v-show="required"
        class="label__required"
      >
        *
      </span>
      <span v-if="!isRequired && !disabled && !isUniqueInsideForm && showOptional">{{
        $t('global:form.optional')
      }}</span>
    </label>
    <div
      ref="wrapper"
      class="input-field__wrapper"
    >
      <div
        v-if="prependIcon || prependLabel || customPrepend"
        ref="prepend"
        class="input-field__prepend"
      >
        <slot name="prepend"></slot>
        <span
          v-if="prependLabel"
          class="prepend__label"
          @click="$emit('prependAction')"
          >{{ prependLabel }}</span
        >
        <Icon
          v-if="prependIcon"
          :name="prependIcon"
          class="prepend__icon"
          wrapper
        />
      </div>
      <input
        v-if="mask"
        :id="'input' + _uid"
        ref="input"
        v-mask="mask"
        class="wrapper__input"
        spellcheck="false"
        :type="internalType"
        :autocomplete="autocomplete"
        :autocapitalize="autocapitalize"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :value="value"
        :maxLength="counter"
        :min="min"
        :max="max"
        :step="getStep"
        @keydown="keyDown($event)"
        @keyup="keyUp($event)"
        @input="updateValue($event.target.value)"
        @focus="updateFocus($event)"
        @blur="updateBlur($event)"
        @paste="onPaste"
      />
      <input
        v-if="!mask"
        :id="'input' + _uid"
        ref="input"
        class="wrapper__input"
        spellcheck="false"
        :autofocus="autofocus"
        :type="internalType"
        :autocomplete="autocomplete"
        :autocapitalize="autocapitalize"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :value="value"
        :maxLength="counter"
        :min="min"
        :max="max"
        :style="inputStyle"
        :step="getStep"
        @keydown="keyDown($event)"
        @keyup="keyUp($event)"
        @input="updateValue($event.target.value)"
        @focus="updateFocus()"
        @blur="updateBlur($event)"
        @paste="onPaste"
      />
      <div
        ref="append"
        class="input-field__append"
      >
        <span
          v-if="appendLabel && !disabled"
          class="append__label"
          >{{ appendLabel }}</span
        >
        <Icon
          v-if="appendIcon"
          :name="appendIcon"
          wrapper
        />
        <Icon
          v-if="capslock"
          name="keyboard_capslock"
          wrapper
        />
        <Action
          v-if="isPassword && !disabledVisibility"
          :data-testid="$testId('action-button--toggle-password-visibility')"
          :icon="visibilityIcon"
          class="input-field__btn-visibility"
          type="link"
          @click="changeVisiblity()"
        />
        <Icon
          v-if="isValid"
          name="check"
          wrapper
        />
        <div
          v-if="isNumber && !hideControls"
          class="input-field__controls"
        >
          <button
            :class="{ '--disabled': max != null && max == value }"
            type="button"
            :disabled="disabled"
            class="controls__add"
            @click="addNumber()"
          >
            <Icon
              name="arrow_drop_up"
              size="small"
              wrapper
            />
          </button>
          <button
            :class="{ '--disabled': min != null && min == value }"
            type="button"
            class="controls__remove"
            :disabled="disabled"
            @click="subtractNumber()"
          >
            <Icon
              name="arrow_drop_down"
              size="small"
              wrapper
            />
          </button>
        </div>
        <span
          v-if="isNumber && hasPercent"
          class="percent"
          >%</span
        >
        <slot name="button"></slot>
      </div>
    </div>
    <div
      v-if="!hideErrorDetails"
      ref="details"
      class="input-field__details"
    >
      <span
        v-if="(hint || showCustomHint) && !validation.$error && !$media.mobile"
        :class="[
          'details__hint',
          {
            'form-input-hint-tooltip': hintTooltip,
            'form-input-hint-tooltip-custom': showCustomHint,
          },
        ]"
      >
        <slot name="hint"></slot>
        {{ hint }}
      </span>
      <ValidationMessage :validation="validation" />
      <span
        v-if="counter"
        class="details__counter"
        >{{ length }} / {{ counter }}</span
      >
      <div
        v-if="$media.mobile && showCustomHint"
        class="details__password-mobile"
      >
        <p class="text-color">{{ $t('global:password.label.hint.custom') }}</p>
        <slot name="hint"></slot>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
@import 'InputField.scss';
</style>
