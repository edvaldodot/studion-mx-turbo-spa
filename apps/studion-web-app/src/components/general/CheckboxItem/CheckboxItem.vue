<script>
import { defineComponent } from 'vue'
import Icon from '../Icon'
import ValidationMessage from '../ValidationMessage'

export default defineComponent({
  name: 'CheckboxItem',

  components: {
    Icon,
    ValidationMessage,
  },

  props: {
    switchType: {
      type: Boolean,
      default: false,
    },
    roundType: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      default: null,
    },
    alignRight: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: null,
    },
    labelWarning: {
      type: String,
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: null,
    },
    value: null,
    index: {
      type: Number,
      default: null,
    },
    checked: {
      type: Boolean,
      default: false,
    },
    unique: {
      type: Boolean,
      default: false,
    },
    indeterminate: {
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
    classWarn: {
      type: String,
      default: null,
    },
  },

  data() {
    return {
      isFocused: false,
      isChecked: this.checked,
    }
  },

  watch: {
    checked(value) {
      this.isChecked = value
    },
  },

  methods: {
    updateValue(item) {
      this.isChecked = item.checked
      this.$emit('change', { value: item.value, checked: item.checked, unique: this.unique })
    },
    updateFocus() {
      this.isFocused = true
    },
    updateBlur() {
      this.isFocused = false
    },
    checkLinkInside(event) {
      event.target.nodeName === 'A' && this.$emit('label-link')
    },
    checkOrUncheck() {
      this.$refs.inputCheckbox.click()
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('checkbox-item')"
    :class="[
      'checkbox-item',
      {
        '--disabled': disabled,
        'is-checked': isChecked,
        'has-focus': isFocused,
        'has-only-icon': !label,
        '--margin-title': switchType,
      },
    ]"
  >
    <div class="checkbox-item__wrapper">
      <div
        class="wrapper__icon"
        @click="checkOrUncheck"
      >
        <Icon
          v-if="isChecked && !switchType && !roundType && !indeterminate"
          name="check_box"
        />

        <Icon
          v-if="!isChecked && !switchType && !roundType && !indeterminate"
          name="check_box_outline_blank"
        />

        <Icon
          v-if="indeterminate"
          name="check_box_minus"
        />

        <Icon
          v-show="checked"
          v-if="roundType"
          name="radio_button_checked"
        />

        <Icon
          v-show="!checked"
          v-if="roundType"
          name="radio_button_unchecked"
        />

        <span
          v-if="switchType"
          class="icon__switch"
        ></span>
      </div>

      <input
        ref="inputCheckbox"
        :id="'checkbox-' + _uid + '-' + index"
        :name="'checkbox-' + _uid"
        :disabled="disabled"
        :readonly="readonly"
        :checked="isChecked"
        :value="value"
        class="wrapper__input"
        type="checkbox"
        hidden
        @change="updateValue($event.target)"
        @focus="updateFocus()"
        @blur="updateBlur()"
      />
      <label
        class="wrapper__label"
        :for="'checkbox-' + _uid + '-' + index"
        :class="{ 'align-right': alignRight, 'has-text': label }"
        @click="checkLinkInside($event)"
      >
        <span v-html="label"></span>

        <span
          v-if="description"
          class="label__description"
          v-html="description"
        ></span>
      </label>
    </div>

    <p
      v-if="labelWarning"
      :class="[{ 'text-orange-600': !classWarn }, 'checkbox-item__warning', classWarn]"
      v-html="labelWarning"
    ></p>
    <div
      v-if="hint && !validation.$error"
      class="checkbox-item__hint"
    >
      {{ hint }}
    </div>
    <ValidationMessage :validation="validation" />
  </div>
</template>
<style lang="scss">
@import 'CheckboxItem.scss';
</style>
