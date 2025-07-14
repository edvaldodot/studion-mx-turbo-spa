<script>
import debounce from 'lodash/debounce'
import Icon from '../Icon'
import Menu from '../Menu'
import ValidationMessage from '../ValidationMessage'
import Loading from '../Loading'

export default {
  name: 'Search',
  components: {
    Icon,
    Menu,
    ValidationMessage,
    Loading,
  },
  props: {
    value: {
      type: String,
      default: () => '',
    },
    label: {
      type: String,
      default: () => null,
    },
    hint: {
      type: String,
      default: () => null,
    },
    showAppendInner: {
      type: Boolean,
      default: () => true,
    },
    menuItems: {
      type: Array,
      default: () => [],
    },
    itemLabel: {
      type: String,
      default: () => null,
    },
    async: {
      type: Boolean,
      default: () => false,
    },
    loading: {
      type: Boolean,
      default: () => false,
    },
    disabled: {
      type: Boolean,
      default: () => false,
    },
    validation: {
      type: Object,
      default: function () {
        return {}
      },
    },
    hideErrorDetails: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      menuItemSelected: null,
      tempSearchFilteringItems: [],
      showMenu: false,
    }
  },
  computed: {
    model: {
      get() {
        return this.value
      },
      set(newValue) {
        this.$emit('input', newValue)
      },
    },
    componentId() {
      return `search-${this._uid}`
    },
    classes() {
      return {
        '--disabled': this.disabled,
      }
    },
    asyncOrSyncSearchMenuItems() {
      return this.async ? this.menuItems : this.tempSearchFilteringItems
    },
  },
  watch: {
    menuItemSelected(selectedItem) {
      this.$emit('selected-menu-item', selectedItem)
      this.model = selectedItem[this.itemLabel]
    },
  },
  mounted() {
    this.filtering()
  },
  methods: {
    handlerInput(event) {
      const { value: textTerm } = event.target

      this.model = textTerm
      this.search(textTerm)
    },
    handlerSearch(textTerm) {
      this.$emit('search', textTerm)
    },
    async search(textTerm) {
      this.resetTempSearch()

      if (this.async) {
        await this.asyncSearch(textTerm)
        return textTerm
      }

      this.handlerSearch(textTerm)
      this.filtering(textTerm)
    },
    resetTempSearch() {
      this.tempSearchFilteringItems = []
    },
    asyncSearch: debounce(function (textTerm) {
      this.handlerSearch(textTerm)
    }, 600),
    filtering(textTerm) {
      if (textTerm) {
        this.tempSearchFilteringItems = this.menuItems.filter((menuItem) => {
          if (menuItem[this.itemLabel].toLowerCase().search(textTerm.toLowerCase()) > -1) {
            return menuItem
          }
        })
        return this.tempSearchFilteringItems
      }

      this.tempSearchFilteringItems = this.menuItems
    },
    openMenu() {
      this.showMenu = true
    },
    closeMenu: debounce(function () {
      this.showMenu = false
    }, 200),
  },
}
</script>

<template>
  <div
    :data-testid="$testId('search')"
    :class="['search', classes]"
  >
    <label
      :for="componentId"
      class="search__label"
    >
      {{ label }}
    </label>
    <div class="search__wrapper">
      <div class="search__prepend">
        <slot name="prepend" />
      </div>
      <div class="search__inner">
        <div class="search__prepend-inner">
          <slot name="prepend-inner" />
        </div>
        <input
          :id="componentId"
          v-model="model"
          class="search__input"
          :disabled="disabled"
          v-bind="$attrs"
          v-on="{ ...$listeners, input: (event) => handlerInput(event) }"
          @focus="openMenu()"
          @blur="closeMenu()"
        />
        <div class="search__menu">
          <Loading
            v-if="loading"
            class="search__loading"
          />
          <Menu
            v-else
            v-show="showMenu"
            v-model="menuItemSelected"
            :items="asyncOrSyncSearchMenuItems"
            :item-label="itemLabel"
          />
        </div>
        <div
          v-show="showAppendInner"
          class="search__append-inner"
        >
          <slot name="append-inner">
            <Icon name="search" />
          </slot>
        </div>
      </div>
      <div class="search__append">
        <slot name="append" />
      </div>
    </div>
    <div
      v-if="!hideErrorDetails"
      class="search__hint"
    >
      {{ hint }}
    </div>
    <ValidationMessage :validation="validation" />
  </div>
</template>

<style lang="scss">
@import 'Search.scss';
</style>
