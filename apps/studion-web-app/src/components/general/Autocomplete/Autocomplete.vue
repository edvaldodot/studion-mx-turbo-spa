<script>
import debounce from 'lodash/debounce'

import Icon from '../Icon'
import Tips from '../Tips'
import TooltipSlot from '../TooltipSlot'
import ValidationMessage from '../ValidationMessage'

export default {
  name: 'Autocomplete',

  components: {
    Icon,
    Loading: () => import('../Loading'),
    Tips,
    TooltipSlot,
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
    appendIcon: {
      type: String,
      default: null,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      default: () => {
        return []
      },
    },
    optionProperty: {
      type: String,
      default: null,
    },
    isCustomProperty: {
      type: Boolean,
      default: false,
    },
    hideDetails: {
      type: Boolean,
      default: false,
    },
    maxValue: {
      type: Number,
      default: 1,
    },
    async: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabledHint: {
      type: String,
      default: '',
    },
    defaultInputText: {
      type: String,
      default: '',
    },
    nullable: {
      type: Boolean,
      default: true,
    },
    tip: {
      type: Boolean,
      default: false,
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
    clearOnDelete: {
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
      isActive: false,
      isFocused: false,
      appendSize: 0,
      searchValue: '',
      options: [],
      hoveredIndex: 0,
      mutableValue: [],
    }
  },

  computed: {
    showEmptyResult() {
      return (
        !this.loading &&
        (this.options.length === 0 ||
          (this.mutableValue.length > 0 &&
            this.options.filter((item) => item.selected === false).length === 0))
      )
    },
  },

  watch: {
    loading() {
      if (this.loading) {
        this.options = []
        this.isActive = this.loading
      }
    },

    items() {
      this.hoveredIndex = 0
      this.setOptionsFilteredByValues()
    },

    value: {
      immediate: true,
      handler() {
        this.checkValue()
      },
    },

    mutableValue() {
      this.$emit(
        'input',
        this.nullable && this.mutableValue.length === 0 ? null : this.mutableValue
      )
    },
  },

  created() {
    this.searchValue = this.defaultInputText
    this.setInitialItem()
  },

  mounted() {
    this.checkValue()
  },

  methods: {
    toggleFocus(should = null) {
      if (should !== null) {
        this.isFocused = should === 'focus'
        if (this.isFocused) {
          if (!this.async) {
            this.search(this.searchValue, '')
          }
          this.$refs.input.focus()
        } else if (!this.isActive) {
          this.$refs.input.blur()
        }
      }
    },

    search(value, event) {
      if (this.clearOnDelete && event.inputType === 'insertText' && this.mutableValue.length) {
        this.$emit('input', this.nullable ? null : [])
      }

      this.searchValue = value
      if (this.async) {
        this.emitSearch()
        this.hoveredIndex = null
      } else {
        this.$emit('internalSearch', this.searchValue)
        this.isActive = true
        this.options = this.items
          .filter(
            (option) =>
              this.clearAccent(this.getValue(option))
                .toString()
                .toLowerCase()
                .indexOf(this.clearAccent(this.searchValue).toLowerCase()) >= 0
          )
          .filter((option) => !this.mutableValue.includes(option))
          .filter((option) => !option.hide)
      }
    },

    emitSearch: debounce(function () {
      this.$emit('search', this.searchValue)
    }, 500),

    setSelected(option) {
      if (!option) return
      this.isActive = false
      this.hoveredIndex = null
      option.selected = true
      this.mutableValue.push(option)
      this.searchValue = this.maxValue !== 1 ? '' : this.getValue(option)
      if (this.async) {
        this.options = []
      } else if (this.maxValue > 1 || this.maxValue === -1) {
        this.$refs.input.focus()
      }
    },

    keyArrows(direction) {
      const sum = direction === 'down' ? 1 : -1
      if (this.isActive && this.options.length) {
        let index = this.hoveredIndex + sum
        index = index > this.options.length - 1 ? 0 : index
        index = index < 0 ? this.options.length - 1 : index
        this.hoveredIndex = index
        if (
          this.options[this.hoveredIndex].selected &&
          this.options.filter((item) => item.selected === false).length
        ) {
          this.keyArrows(direction)
        }
      } else if (this.options.length) {
        this.isActive = true
        this.hoveredIndex = 0
        if (
          this.options[this.hoveredIndex].selected &&
          this.options.filter((item) => item.selected === false).length
        ) {
          this.keyArrows('down')
        }
      }
      if (this.hoveredIndex > 0) {
        let target = this.$refs[`item-${this.hoveredIndex}`][0]
        this.$refs.scrollingContainer.scrollTop = target.offsetTop
      }
    },

    enterPressed() {
      if (this.hoveredIndex === null) return
      this.setSelected(this.options[this.hoveredIndex])
    },

    deletePressed() {
      if (this.mutableValue.length) {
        if ((this.maxValue !== 1 && this.searchValue.length === 0) || this.maxValue === 1) {
          this.mutableValue[this.mutableValue.length - 1].selected = false
          this.mutableValue.splice(this.mutableValue.length - 1, 1)
        }
      }

      if (this.clearOnDelete) {
        this.$emit('input', this.nullable ? null : [])
      }
    },

    outside() {
      if (!this.isFocused) {
        this.isActive = false
      }
    },

    removeTag(option, index) {
      if (!this.disabled) {
        option.selected = false
        this.mutableValue.splice(index, 1)
      }
    },

    setOptionsFilteredByValues() {
      this.options = this.items
        .map((item) => {
          item.selected = Boolean(
            this.value && this.value.find((itemVal) => itemVal.id === item.id)
          )
          item.onlySearchable = item.onlySearchable || false
          return item
        })
        .filter((option) => !option.hide)
    },

    checkValue() {
      if (!this.async) {
        this.setOptionsFilteredByValues()
      }
      this.mutableValue = this.value === null ? [] : this.value

      if (this.value === null) {
        this.searchValue = ''
      }
    },

    getValue(option, highlight = false) {
      let value = typeof option === 'object' ? option[this.optionProperty] : option

      if (this.isCustomProperty) {
        value = this.optionProperty
        for (const prop in option) {
          value = value.replace(`:${prop}`, option[prop])
        }
      }

      const matchRegex = new RegExp(
        `(${this.clearAccent(this.escapeString(this.searchValue))})`,
        'i'
      ).exec(this.clearAccent(value))

      if (matchRegex && matchRegex.index >= 0 && highlight)
        return this.boldHighlight(value, matchRegex.index)

      return value
    },

    boldHighlight(value, position) {
      value = value.split('')
      value.splice(position, 0, '<b>')
      value.splice(position + this.searchValue.length + 1, 0, '</b>')
      return value.join('')
    },

    escapeString(value) {
      if (value) {
        return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      }
      return ''
    },

    clearAccent(value) {
      if (value) {
        return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      }
      return ''
    },

    /**
     * Check if has a item with attribute "selected" and select it
     */
    setInitialItem() {
      const initialItem = this.items.find((item) => typeof item === 'object' && item.selected)
      if (!initialItem) return
      this.setSelected(initialItem)
    },

    showClear() {
      if (!this.allowClear) return false

      return this.mutableValue !== null && !this.disabled
    },

    clear() {
      const defaultValue = this.nullable ? null : []
      this.searchValue = this.defaultInputText
      this.$emit('input', defaultValue)
    },
  },
}
</script>

<template>
  <div
    ref="auto-complete"
    :data-testid="$testId('auto-complete')"
    class="auto-complete"
    :class="{
      'has-error': validation.$error,
      'has-value': mutableValue.length || searchValue || placeholder,
      'has-focus': isFocused || isActive,
      '--disabled': disabled,
      'has-floating-label': floatingLabel,
      'theme-dark': dark,
      'hide-details': hideDetails,
      'is-multiple': maxValue !== 1,
    }"
  >
    <label
      v-if="label"
      class="auto-complete__label"
      :for="'input' + _uid"
      >{{ label }}
      <span
        v-show="required"
        class="label__required"
      >
        *
      </span>
    </label>
    <div class="auto-complete__wrapper">
      <template v-if="maxValue !== 1">
        <div class="auto-complete__items">
          <a
            v-for="(tag, index) in mutableValue"
            :key="index"
            href="#"
            class="auto-complete__item"
            @click.prevent="removeTag(tag, index)"
          >
            <TooltipSlot
              v-if="tag.description"
              :width="330"
              :uppercase="false"
              shadow
              dark
            >
              <template #activator>
                <span class="text">{{ optionProperty ? tag[optionProperty] : tag }}</span>
                <Icon name="close" />
              </template>
              <template #content>
                <div class="auto-complete__content">
                  <strong class="text-base">{{ tag.name }}</strong>
                  <p class="text-color text-base">{{ tag.description }}</p>
                </div>
              </template>
            </TooltipSlot>
            <template v-else>
              <span class="text">{{ optionProperty ? tag[optionProperty] : tag }}</span>
              <Icon name="close" />
            </template>
          </a>
        </div>
      </template>
      <input
        :id="'input' + _uid"
        ref="input"
        class="auto-complete__input"
        spellcheck="false"
        type="text"
        autocomplete="off"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :value="searchValue"
        @input="search($event.target.value, $event)"
        @blur.stop="toggleFocus('blur')"
        @focus="toggleFocus('focus')"
        @keydown.up.prevent="keyArrows('up')"
        @keydown.down.prevent="keyArrows('down')"
        @keydown.enter.prevent="enterPressed()"
        @keydown.delete="deletePressed()"
      />
      <div
        ref="append"
        class="auto-complete__append"
        @click="toggleFocus('blur')"
      >
        <div
          v-if="showClear"
          @click="clear"
        >
          <Icon name="close" />
        </div>
        <Icon
          v-if="appendIcon"
          :name="appendIcon"
          wrapper
        />
        <template v-if="!appendIcon && !async">
          <div @click="toggleFocus('focus')">
            <Icon :name="isActive ? 'arrow_drop_up' : 'arrow_drop_down'" />
          </div>
        </template>
      </div>
      <div
        v-show="isActive && maxValue !== mutableValue.length"
        class="wrapper__dropdown"
      >
        <ul
          ref="scrollingContainer"
          v-click-outside="outside"
          class="auto-complete__options"
        >
          <template v-for="(option, index) in options">
            <li
              v-if="
                !option.selected &&
                ((option.onlySearchable === true && searchValue && searchValue.length > 0) ||
                  option.onlySearchable === false)
              "
              :ref="`item-${index}`"
              :key="`autocomplete-item-${index}`"
              class="auto-complete__options-item"
              @mouseenter="hoveredIndex = index"
              @click.stop="setSelected(option)"
            >
              <slot
                :option="option"
                :index="index"
              >
                <span v-html="getValue(option, true)"></span>
              </slot>
            </li>
          </template>
          <li
            v-if="showEmptyResult"
            class="auto-complete__options-item--empty-message"
          >
            {{ $t('global:autocomplete.empty.search') }}
          </li>
          <li
            v-if="loading"
            class="auto-complete__options-item--loading"
          >
            <Loading v-if="loading" />
          </li>
        </ul>
      </div>
    </div>
    <div class="auto-complete__details">
      <span
        v-if="disabled && disabledHint"
        class="auto-complete__hint"
      >
        {{ disabledHint }}
      </span>
      <span
        v-if="hint && !validation.$error"
        class="auto-complete__hint"
      >
        {{ hint }}
      </span>

      <ValidationMessage :validation="validation" />
    </div>
  </div>
</template>

<style lang="scss">
@import 'Autocomplete.scss';
</style>
