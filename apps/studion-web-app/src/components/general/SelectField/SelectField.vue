<script>
import Icon from '../Icon'
import Loading from '../Loading'
import ValidationMessage from '../ValidationMessage'

export default {
  name: 'SelectField',

  components: {
    Icon,
    Loading,
    ValidationMessage,
  },

  props: {
    value: {
      default: null,
    },
    validation: {
      type: Object,
      default: function () {
        return {}
      },
    },
    label: {
      type: String,
      default: '',
    },
    floatingLabel: {
      type: Boolean,
      default: true,
    },
    showMessageWarning: {
      type: Boolean,
      default: false,
    },
    messageWarning: {
      type: String,
      default: '',
    },
    hint: {
      type: String,
      default: null,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    selectAllOption: {
      type: Boolean,
      default: true,
    },
    maxItemsVisible: {
      type: Number,
      default: 3,
    },
    items: {
      type: Array,
      default: () => {
        return []
      },
    },
    showCheck: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    isFormUnique: {
      type: Boolean,
      default: true,
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
    showOptional: {
      type: Boolean,
      default: true,
    },
    helper: {
      type: Boolean,
      default: false,
    },
    dynamicValues: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: null,
    },

    hideErrorDetails: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: () => '',
    },
    required: {
      type: Boolean,
      default: () => false,
    },
  },

  data() {
    return {
      isMounted: false,
      dropdownOpen: false,
      focus: false,
      mutableValue: null,
      keyIndex: -1,
      insideChange: false,
    }
  },

  computed: {
    hasValue() {
      return (
        (this.multiple && this.mutableValue !== null && this.mutableValue.length > 0) ||
        (!this.multiple && this.mutableValue !== null && this.mutableValue !== null)
      )
    },
    hasValidation() {
      return Object.keys(this.validation).length
    },
    isValid() {
      return this.validation.$error === false && this.validation.$dirty && this.showCheck
    },
    isUniqueInsideForm() {
      return this.isMounted && this.$refs.input.form == null && this.isFormUnique
    },
    isAllOptionSelected() {
      return (
        this.multiple &&
        this.mutableValue !== null &&
        this.mutableValue.length === this.items.length
      )
    },
    isRequired() {
      return this.validation.$params != null && typeof this.validation.$params.required === 'object'
    },
    getValues() {
      if (
        this.multiple &&
        this.mutableValue !== null &&
        this.mutableValue.length >= this.maxItemsVisible
      ) {
        return this.$t('global:select.multiple.values', { num: this.mutableValue.length })
      } else if (this.mutableValue !== null) {
        var tempMutableValue = this.multiple ? this.mutableValue : [this.mutableValue]
        return this.items
          .filter((item) => {
            return tempMutableValue.indexOf(item.value) >= 0
          })
          .map(function (item) {
            return item.text
          })
          .toString()
          .replace(/,/g, ', ')
      } else {
        return null
      }
    },
    showClear() {
      if (!this.allowClear) return false

      if (this.multiple) {
        return false
      }

      return this.mutableValue !== null && !this.disabled
    },
  },

  watch: {
    items() {
      if (this.multiple) {
        this.mutableValue = []
        return
      }
    },
    multiple() {
      this.mutableValue = []
    },
    value(value) {
      this.insideChange = false
      this.mutableValue = value
    },
    mutableValue(value) {
      if (value === null && this.value !== null) {
        this.mutableValue = this.value
      } else if (this.dynamicValues) this.mutableValue = this.value
    },
  },

  created() {
    this.mutableValue = this.value !== null ? this.value : this.multiple ? [] : null
  },

  mounted() {
    this.isMounted = true
  },

  methods: {
    openDropdown() {
      if (!this.disabled) {
        this.$emit('focus', this.mutableValue)
        this.dropdownOpen = true
        if (!this.hasValue) {
          this.keyIndex = -1
        }
      }
    },
    clickLabel() {
      this.$refs.selectWrapper.click()
    },
    closeDropdown() {
      this.dropdownOpen = false
    },
    selectOption(item, index) {
      this.keyIndex = index
      if (this.multiple) {
        var indexArray = this.mutableValue.indexOf(item.value)
        indexArray >= 0
          ? this.mutableValue.splice(indexArray, 1)
          : this.mutableValue.push(item.value)
      } else {
        this.mutableValue = item.value
        this.closeDropdown()
      }
      this.$emit('input', this.mutableValue)
    },
    selectAll() {
      this.insideChange = true
      if (this.isAllOptionSelected) {
        this.mutableValue = []
      } else {
        this.mutableValue = this.items.map((item) => {
          return item.value
        })
      }
      this.$emit('input', this.mutableValue)
    },
    isOptionSelected(item) {
      return (
        (this.multiple &&
          this.mutableValue !== null &&
          this.mutableValue.indexOf(item.value) >= 0) ||
        this.mutableValue === item.value
      )
    },
    keyUp() {
      if (this.dropdownOpen && this.keyIndex > 0) {
        this.keyIndex--
      }
    },
    keyDown() {
      if (this.dropdownOpen && this.keyIndex < this.items.length) {
        this.keyIndex++
      } else {
        this.dropdownOpen = true
        this.keyIndex = this.multiple ? 0 : 1
      }
    },
    keyEnter() {
      if (!this.dropdownOpen) {
        this.dropdownOpen = true
        if (this.keyIndex < 0) {
          this.keyIndex = 0
        }
      } else {
        if (this.keyIndex > 0) {
          this.selectOption(this.items[this.keyIndex - 1], this.keyIndex)
        } else if (this.keyIndex === 0) {
          this.selectAll()
        } else {
          this.closeDropdown()
        }
      }
    },
    highlight(index) {
      this.keyIndex = index
    },
    removeHighlight() {
      this.keyIndex = -1
    },
    addFocus() {
      if (!this.disabled) {
        this.focus = true
        typeof this.validation.$reset === 'function' && this.validation.$reset()
      }
    },
    removeFocus() {
      if (this.focus) {
        this.focus = false
        typeof this.validation.$touch === 'function' && this.validation.$touch()
      }
    },
    outside() {
      this.closeDropdown()
      this.removeFocus()
    },
    clear() {
      this.mutableValue = null
      this.$emit('input', null)
      this.$emit('clear')
    },
  },
}
</script>

<template>
  <div
    v-click-outside="outside"
    :data-testid="$testId('select-field')"
    class="select-field"
    :class="{
      'has-value': hasValue,
      'has-focus': focus,
      '--error': validation.$error,
      'has-floating-label': floatingLabel,
      '--disabled': disabled,
      'theme-dark': dark,
    }"
  >
    <label
      v-if="label"
      class="select-field__label"
      @click="clickLabel()"
    >
      {{ label }}
      <span
        v-show="required"
        class="label__required"
      >
        *
      </span>
      <span v-if="!isRequired && !disabled && !isUniqueInsideForm && showOptional">
        {{ $t('global:form.optional') }}
      </span>
    </label>

    <div
      ref="selectWrapper"
      :title="title"
      :tabindex="disabled ? -1 : 0"
      class="select-field__wrapper"
      :class="{ 'is-multiselect': multiple, 'is-opened': dropdownOpen, '--has-helper': helper }"
      @blur="closeDropdown(), removeFocus()"
    >
      <input
        ref="input"
        class="wrapper__input"
        readonly="readonly"
        :placeholder="placeholder"
        tabindex="-1"
        :value="getValues"
        :class="{ 'border-color-error': showMessageWarning }"
        :disabled="disabled"
        @click="openDropdown(), addFocus()"
        @focus="openDropdown(), addFocus()"
        @keydown.down.prevent="keyDown()"
        @keydown.enter.prevent="keyEnter()"
        @keydown.up.prevent="keyUp()"
        @keyup.27="closeDropdown()"
      />
      <div class="wrapper__right">
        <slot name="right-float" />
      </div>

      <div
        v-if="dropdownOpen"
        class="wrapper__dropdown"
      >
        <ul>
          <li
            v-if="items.length === 0 && !loading"
            class="dropdown__item"
            :class="{ 'is-highlight': keyIndex == 0 }"
            @click.stop="closeDropdown(), removeFocus()"
            @mouseover="highlight(0)"
            @mouseleave="removeHighlight()"
          >
            {{ $t('global:form.select.no.options') }}
          </li>

          <li
            v-if="multiple && selectAllOption && items.length"
            class="dropdown__item"
            :class="{ 'is-highlight': keyIndex == 0 }"
            @click.stop="selectAll()"
            @mouseover="highlight(0)"
            @mouseleave="removeHighlight()"
          >
            <Icon
              v-if="!isAllOptionSelected"
              name="check_box_outline_blank"
            />

            <Icon
              v-if="isAllOptionSelected"
              name="check_box"
            />
            {{ $t('global:form.select.all') }}
          </li>

          <template v-for="(item, index) in items">
            <li
              v-if="(!isOptionSelected(item) || multiple) && !item.hide"
              :key="index"
              :title="item.text"
              class="dropdown__item"
              :class="{ 'is-highlight': keyIndex == index + 1 }"
              @click.stop="selectOption(item, index + 1)"
              @mouseover="highlight(index + 1)"
              @mouseleave="removeHighlight()"
            >
              <Icon
                v-if="multiple && !isOptionSelected(item)"
                name="check_box_outline_blank"
              />

              <Icon
                v-if="multiple && isOptionSelected(item)"
                name="check_box"
              />

              {{ item.text }}
            </li>
          </template>


          <li
            v-if="loading"
            class="dropdown__item dropdown__item--loading"
          >
            <Loading />
          </li>
        </ul>
        <span
          v-if="hint && !validation.$error && !$slots.details && dropdownOpen"
          class="dropdown__hint"
        >
          {{ hint }}
        </span>
      </div>
      <div
        v-if="showClear"
        class="wrapper__append wrapper__append--clear"
        @click.stop="clear()"
      >
        <Icon name="close" />
      </div>

      <div
        class="wrapper__append wrapper__append--pointer"
        @click="[openDropdown(), addFocus()]"
      >
        <Icon :name="dropdownOpen ? 'arrow_drop_up' : 'arrow_drop_down'" />

        <Icon
          v-if="isValid"
          name="check"
          wrapper
        />
      </div>

      <div
        v-if="helper"
        class="wrapper__append wrapper__append--helper"
        @click="outside()"
      >
        <slot name="button"></slot>
      </div>
    </div>

    <div
      v-if="!hideErrorDetails"
      class="select-field__details"
    >
      <slot name="details"></slot>
      <span
        v-if="showMessageWarning"
        class="details__message-warning text-opacity-70"
      >
        {{ $t(`${messageWarning}`) }}
      </span>

      <span
        v-if="hint && !validation.$error && !$slots.details && !dropdownOpen"
        class="details__hint"
      >
        {{ hint }}
      </span>

      <ValidationMessage :validation="validation" />
    </div>
  </div>
</template>

<style lang="scss">
@import 'SelectField.scss';
</style>
