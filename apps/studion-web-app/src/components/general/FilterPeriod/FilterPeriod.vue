<script>
import { defineComponent } from 'vue'

import Icon from '../Icon'
import FilterPeriodForm from './components/FilterPeriodForm.vue'

export default defineComponent({
  name: 'FilterPeriod',

  components: {
    Icon,
    FilterPeriodForm,
  },

  props: {
    dark: {
      type: Boolean,
      default: false,
    },

    initialValue: {
      type: [String, Object],
      default: null,
    },
  },

  data() {
    return {
      showFilter: false,
    }
  },

  methods: {
    toggleView() {
      this.showFilter = !this.showFilter
    },

    closeView() {
      this.showFilter = false
    },

    apply(value) {
      this.$emit('search', value)
      this.closeView()
    },
  },
})
</script>

<template>
  <div
    v-click-outside="closeView"
    :data-testid="$testId('filter-period')"
    :class="{ '--dark': dark }"
    class="filter-item period"
  >
    <div
      class="period__button"
      @click.stop="toggleView"
    >
      <Icon
        name="calendar-range"
        wrapper
      />

      <span>{{ $t('global:period') }}</span>
    </div>

    <div
      v-if="showFilter"
      class="period-form__wrapper"
    >
      <FilterPeriodForm
        :initial-value="initialValue"
        @submit="apply"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import './FilterPeriod.scss';
</style>
