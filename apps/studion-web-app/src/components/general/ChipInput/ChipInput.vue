<script>
import debounce from 'lodash/debounce'
import Chip from '../Chip'
import Icon from '../Icon'
import Loading from '../Loading'
export default {
  name: 'ChipInput',
  components: {
    Chip,
    Icon,
    Loading,
  },
  props: {
    set: {
      type: Boolean,
      default: true,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    autocomplete: {
      type: Boolean,
      default: false,
    },
    autocompleteOptions: {
      type: Array,
      default: () => [],
    },
    autocompleteLoading: {
      type: Boolean,
      default: false,
    },
    maxLength: {
      type: Number,
      default: 50,
    },
    value: null,
  },
  data() {
    return {
      chips: this.value, // @type: array['chip1','chip2']
      currentInput: '',
      isFocused: false,
      hoveredIndex: null,
      showEmptyResult: false,
      loading: false,
      isAutocompleteActive: false,
    }
  },
  computed: {
    classes() {
      return {
        'theme-dark': this.dark,
      }
    },
    filteredAutocompleteOptions() {
      return this.autocompleteOptions.filter(
        (option) => !this.value.find((value) => value.toLowerCase() === option.toLowerCase())
      )
    },
  },
  watch: {
    value(value) {
      this.chips = value
    },
  },
  methods: {
    saveChip() {
      if (this.hoveredIndex != null && this.isAutocompleteActive) {
        this.currentInput = this.filteredAutocompleteOptions[this.hoveredIndex]
        this.hoveredIndex = null
      }
      const { chips, currentInput, set } = this
      const noCaseChips = chips.map((chips) => chips.toLowerCase())
      ;((set && noCaseChips.indexOf(currentInput.toLowerCase()) === -1 && currentInput !== '') ||
        !set) &&
        currentInput.trim() &&
        chips.push(currentInput.trim())
      this.currentInput = ''
    },
    deleteChip(index) {
      this.chips.splice(index, 1)
    },
    backspaceDelete({ which }) {
      which === 8 && this.currentInput === '' && this.chips.splice(this.chips.length - 1)
    },
    outside() {
      if (!this.isFocused) {
        this.isAutocompleteActive = false
      }
    },
    toggleFocus(should = null) {
      if (should !== null) {
        this.isFocused = should === 'focus'
        if (this.isFocused) {
          this.$refs.input.focus()
          this.isAutocompleteActive = true
        } else if (!this.isAutocompleteActive) {
          this.$refs.input.blur()
        }
      }
    },
    keyArrows(arrow) {
      if (arrow === 'up') {
        if (this.hoveredIndex && this.hoveredIndex !== 0) {
          this.hoveredIndex--
        } else {
          this.hoveredIndex = null
        }
      } else {
        if (
          (this.hoveredIndex || this.hoveredIndex === 0) &&
          this.hoveredIndex !== this.filteredAutocompleteOptions.length - 1
        ) {
          this.hoveredIndex++
        } else if (this.hoveredIndex == null && this.filteredAutocompleteOptions.length !== 0) {
          this.hoveredIndex = 0
        } else {
          this.hoveredIndex = null
        }
      }
    },
    emitSearch: debounce(function () {
      this.$emit('search', this.currentInput.trim())
    }, 500),
    search() {
      if (this.currentInput.trim()) {
        this.emitSearch()
      }
    },
    setSelected(option) {
      this.currentInput = option
      const { chips, currentInput, set } = this
      const noCaseChips = chips.map((chips) => chips.toLowerCase())
      ;((set && noCaseChips.indexOf(currentInput.toLowerCase()) === -1 && currentInput !== '') ||
        !set) &&
        chips.push(currentInput.trim())
      this.currentInput = ''
    },
  },
}
</script>

<template>
  <div
    class="input-chip-container form-item"
    :class="classes"
  >
    <div
      v-for="(chip, i) of chips"
      :key="chip.label"
      class="chip-closeable"
    >
      <chip :text="chip" />
      <div
        class="chip-close-btn"
        @click="deleteChip(i)"
      >
        <icon name="close">clear</icon>
      </div>
    </div>
    <input
      ref="input"
      v-model="currentInput"
      class="form-input"
      :placeholder="label"
      :maxlength="maxLength"
      @input="search"
      @keypress.enter="saveChip"
      @keydown.delete="backspaceDelete"
      @keydown.up.prevent="keyArrows('up')"
      @keydown.down.prevent="keyArrows('down')"
      @blur.stop="toggleFocus('blur')"
      @focus="toggleFocus('focus')"
    />
    <div class="chip-input__counter">
      <span class="form-input-counter">{{ currentInput.length }} / {{ maxLength }}</span>
    </div>
    <div>
      <ul
        v-show="
          autocomplete && autocompleteOptions.lenght !== 0 && isAutocompleteActive && currentInput
        "
        ref="scrollingContainer"
        v-click-outside="outside"
        class="form-autocomplete-options"
      >
        <li
          v-for="(autocompleteOption, index) in filteredAutocompleteOptions"
          :ref="`item-${index}`"
          :key="`autocomplete-item-${index}`"
          class="form-autocomplete-options-item"
          :class="{ 'is-hovered': hoveredIndex == index }"
          @click.stop="setSelected(autocompleteOption)"
          @mouseenter="hoveredIndex = index"
        >
          <span>{{ autocompleteOption }}</span>
        </li>
        <li
          v-if="filteredAutocompleteOptions.length === 0"
          class="form-autocomplete-options-item is-disabled"
        >
          {{ $t('global:autocomplete.empty.search') }}
        </li>
        <li
          v-if="autocompleteLoading"
          class="form-autocomplete-options-item is-loading"
        >
          <loading v-if="autocompleteLoading" />
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss">
@import 'ChipInput.scss';
</style>
