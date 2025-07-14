<script>
import Icon from '../Icon'
import ValidationMessage from '../ValidationMessage'

export default {
  name: 'radioItem',
  components: {
    Icon,
    ValidationMessage,
  },
  props: {
    switchType: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: null,
    },
    checked: {
      type: Boolean,
      default: false,
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
    index: {
      type: Number,
      default: null,
    },
    name: {
      type: Number,
      default: null,
    },
    custom: {
      type: Boolean,
      default: false,
    },
    labelAsClass: {
      type: Boolean,
      default: false,
    },
    hint: {
      type: String,
      default: null,
    },
    validation: {
      type: Object,
      default: function () {
        return {}
      },
    },
  },
  data() {
    return {
      isFocused: false,
    }
  },
  methods: {
    updateValue() {
      if (this.disabled) return
      this.$emit('change', this.value)
    },
    updateFocus() {
      this.isFocused = true
    },
    updateBlur() {
      this.isFocused = false
    },
  },
}
</script>

<template>
  <div
    class="radio-item"
    :class="{
      '--disabled': disabled,
      'is-checked': checked,
      'has-focus': isFocused,
      'is-custom': custom,
      ['c-' + (label || '').replace('#', '')]: labelAsClass,
    }"
  >
    <div class="radio-item__wrapper">
      <slot name="precontent"></slot>
      <div class="radio-item__wrapper-body">
        <input
          :id="'radio-' + _uid + '-' + index"
          class="wrapper__input"
          type="radio"
          :name="'radio-' + name"
          :disabled="disabled"
          :readonly="readonly"
          :checked="checked"
          :value="value"
          hidden
          @focus="updateFocus()"
          @blur="updateBlur()"
          @change="updateValue()"
        />
        <div
          class="wrapper__icon"
          @click="updateValue()"
        >
          <icon
            v-if="!custom"
            v-show="checked"
            name="radio_button_checked"
          ></icon>
          <icon
            v-if="!custom"
            v-show="!checked"
            name="radio_button_unchecked"
          ></icon>
        </div>

        <label
          class="radio-item__label"
          :for="'radio-' + _uid + '-' + index"
          :data-label="label"
          @click="updateValue()"
          v-html="label"
        >
        </label>
        <slot name="actions"></slot>
      </div>
    </div>
    <div
      v-if="hint && !validation.$error"
      class="radio-item__hint"
    >
      {{ hint }}
    </div>
    <ValidationMessage :validation="validation" />
  </div>
</template>
<style lang="scss">
@import 'RadioItem.scss';
</style>
