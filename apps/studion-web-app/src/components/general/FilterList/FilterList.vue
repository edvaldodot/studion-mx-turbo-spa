<script>
import { defineComponent } from 'vue'
import FilterToggle from '../FilterToggle'

export default defineComponent({
  name: 'FilterList',

  components: {
    FilterToggle,
  },

  props: {
    toggle: {
      type: Boolean,
      default: false,
    },

    darkToggle: {
      type: Boolean,
      default: false,
    },

    openToggle: {
      type: Boolean,
      default: false,
    },

    hasFilter: {
      type: Boolean,
      default: false,
    },

    numberFiltersSelect: {
      type: Number,
      default: 0,
    },

    classCustom: {
      type: String,
      default: '',
    },
  },

  methods: {
    filterOptions() {
      return (
        this.$slots.tag ||
        this.$slots.order ||
        this.$slots.type ||
        this.$slots.search ||
        this.$slots.tabs
      )
    },

    manualSelectionHandler(isClear) {
      this.$emit(isClear ? 'manual:clearFilters' : 'manual:applyFilters')
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('filter-list')"
    class="filter-list"
    :class="{ outside: $slots.searchOutside }"
  >
    <div
      v-if="!$media.mobile"
      :class="[{ 'has-tabs': $slots.tabs, 'has-categories': $slots.categories }, classCustom]"
    >
      <slot name="button"></slot>
      <slot name="other"></slot>
      <slot name="calendar"></slot>
      <slot name="filterTab"></slot>
      <slot
        v-if="$slots.categories"
        name="tabs"
      ></slot>

      <div
        v-if="filterOptions()"
        class="filter-list__options"
      >
        <slot
          v-if="!$slots.categories"
          name="tabs"
        ></slot>

        <FilterToggle
          :open="openToggle"
          :toggle="toggle"
          :has-filter="hasFilter"
        >
          <div class="filter-list__spacer"></div>

          <slot name="search"></slot>
          <slot name="tag"></slot>
          <slot name="extra-button"></slot>
          <slot name="categories"></slot>
          <slot name="order"></slot>
          <slot name="type"></slot>
          <slot name="preferences"></slot>
        </FilterToggle>
      </div>
    </div>

    <div
      v-else-if="filterOptions() || $slots.other || $slots.filterTab || $slots.tabs"
      class="center"
    >
      <slot name="tabs"></slot>

      <div
        v-if="filterOptions()"
        class="filter-list__options"
      >
        <slot name="searchOutside"></slot>
        <FilterToggle
          :open="openToggle"
          :toggle="toggle"
          :has-filter="hasFilter"
          :number-filters-select="numberFiltersSelect"
          :is-modal="Boolean($slots.searchOutside)"
          :dark="darkToggle"
          @trigger:manual="manualSelectionHandler"
        >
          <slot name="search"></slot>
          <slot name="tag"></slot>
          <slot name="categories"></slot>
          <slot name="order"></slot>
          <div class="filter-list__spacer"></div>
          <slot name="preferences"></slot>
          <slot name="type"></slot>
        </FilterToggle>
      </div>
      <slot name="other"></slot>
      <slot name="filterTab"></slot>
    </div>

    <div
      v-if="$media.mobile && $slots.button"
      :class="{ 'space-margin-top': $media.mobile && filterOptions() }"
      class="filter-list__button"
    >
      <slot name="button"></slot>
      <slot name="extra-button"></slot>
    </div>

    <slot
      v-if="$media.mobile"
      name="calendar"
    ></slot>
  </div>
</template>

<style lang="scss">
@import 'FilterList.scss';
</style>
