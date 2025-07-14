<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import i18n from '@/support/i18n'

import Action from '../../Action'
import SelectField from '../../SelectField'

import FilterPeriodCalendar from './FilterPeriodCalendar.vue'

export default defineComponent({
  name: 'FilterPeriodForm',

  components: {
    Action,
    SelectField,
    FilterPeriodCalendar,
  },

  props: {
    initialValue: {
      type: [String, Object],
      default: null,
    },

    options: {
      type: Array,
      default: () => [
        {
          text: i18n.t('filter:period:option:last.days', { day: 30 }),
          value: '30',
        },
        {
          text: i18n.t('filter:period:option:last.days', { day: 60 }),
          value: '60',
        },
        {
          text: i18n.t('filter:period:option:last.days', { day: 90 }),
          value: '90',
        },
        {
          text: i18n.t('filter:period:option:last.semester'),
          value: 'semester',
        },
        {
          text: i18n.t('filter:period:custom'),
          value: 'custom',
        },
      ],
    },
  },

  data() {
    return {
      selectedOption: null,
      custom: {
        start: null,
        end: null,
      },
    }
  },

  computed: {
    ...mapState(['accessibility']),

    isCustom() {
      return this.selectedOption === 'custom'
    },
  },

  created() {
    if (!this.initialValue) return

    if (typeof this.initialValue === 'string') {
      this.selectedOption = this.initialValue
      return
    }

    for (let key in this.initialValue) {
      this.updateCustom(key, this.initialValue[key])
    }

    this.selectedOption = 'custom'
  },

  methods: {
    handleInput(value) {
      if (value !== 'custom') {
        this.clearCustom()
      }
    },

    clearCustom() {
      for (let key in this.custom) {
        this.updateCustom(key, null)
      }
    },

    updateCustom(key, value) {
      this.custom[key] = value
    },

    getFinalValue() {
      if (!this.isCustom) return this.selectedOption
      return this.deepClone(this.custom)
    },

    submit() {
      this.$emit('submit', this.getFinalValue())
    },
  },

})
</script>

<template>
  <form
    class="period-form"
    :data-testid="$testId('filter-period-form')"
    @submit.prevent="submit"
  >
    <div>
      <p class="period-form__title">{{ $t('filter:period:label') }}</p>

      <SelectField
        v-model="selectedOption"
        :label="$t('filter:period:interval')"
        :floating-label="false"
        :show-optional="false"
        :items="options"
        @input="handleInput"
      />
    </div>

    <div v-if="isCustom">
      <p class="period-form__title">{{ $t('filter:period:custom') }}</p>

      <div class="container-calendar">
        <FilterPeriodCalendar
          :label="$t('filter:period:start')"
          :value="custom.start"
          :min="custom.start"
          :max="custom.end"
          @input="updateCustom('start', $event)"
        />

        <div class="separator">—</div>

        <FilterPeriodCalendar
          :label="$t('filter:period:end')"
          :value="custom.end"
          :min="custom.start"
          :max="custom.end"
          @input="updateCustom('end', $event)"
        />
      </div>
    </div>

    <Action
      :dark="accessibility"
      class="btn--apply"
      :text="$t('global:apply')"
      type="button"
      submit
      flat
    />
  </form>
</template>
