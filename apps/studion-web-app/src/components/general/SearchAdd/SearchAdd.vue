<script>
import Icon from '../Icon'
import Search from '../Search'

export default {
  name: 'SearchAdd',
  components: {
    Icon,
    Search,
  },
  props: {
    disabled: {
      type: Boolean,
      default: () => false,
    },
    searchAsync: {
      type: Boolean,
      default: () => false,
    },
    searchLoading: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      selectedMenuItemAdd: null,
    }
  },
  methods: {
    selectedMenuItem(item) {
      this.selectedMenuItemAdd = item
    },
    add() {
      if (this.selectedMenuItemAdd) {
        this.$emit('add', this.selectedMenuItemAdd)
      }
    },
    classes() {
      return {
        '--disabled': this.disabled,
      }
    },
  },
}
</script>

<template>
  <div
    :data-testid="$testId('search-add')"
    :class="['search-add', classes]"
  >
    <Search
      v-bind="$attrs"
      :show-append-inner="false"
      :disabled="disabled"
      :async="searchAsync"
      :loading="searchLoading"
      v-on="$listeners"
      @selected-menu-item="selectedMenuItem"
    >
      <template #prepend-inner>
        <Icon name="search" />
      </template>
      <template #append>
        <button
          class="search-add__add"
          :disabled="disabled"
          @click="add"
        >
          {{ $t('global:add') }}
        </button>
      </template>
    </Search>
  </div>
</template>

<style lang="scss">
@import 'SearchAdd.scss';
</style>
