<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'

import InputField from '../../InputField'
import CheckboxField from '../../CheckboxField'
import Button from '../../Button'

export default defineComponent({
  name: 'FilterPreferencesForm',

  components: {
    InputField,
    CheckboxField,
    Button,
  },

  props: {
    field: {
      type: String,
      required: true,
    },
    columns: {
      type: Array,
      required: true,
    },
    defaultPreferences: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      search: '',
      checkboxItems: this.columns,
      checkboxData: [],
      allSelected: false,
    }
  },

  computed: {
    ...mapState(['accessibility', 'Settings']),
  },

  created() {
    this.updateFilterPreferences()
  },

  methods: {
    ...mapActions([
      'attemptSaveLocalDisplayPreferencesField',
      'attemptSaveDisplayPreferencesField',
      'setFetching',
      'setFeedback',
    ]),

    updateFilterPreferences() {
      let preferences = []
      const displayFeatures = this.Settings.displayFeatures

      for (let key in displayFeatures[this.field]) {
        if (displayFeatures[this.field][key]) preferences.push(key)
      }

      if (preferences.length === 0) preferences = [...this.defaultPreferences]
      this.checkboxData = preferences
    },

    parsePreferenceColumnsToData() {
      const data = {}

      this.columns.forEach((column) => {
        data[column.value] = this.checkboxData.includes(column.value)
      })

      return data
    },

    makePreferencesData() {
      return {
        field: this.field,
        preferences: this.parsePreferenceColumnsToData(),
      }
    },

    async submit() {
      try {
        const preferences = this.makePreferencesData()

        this.attemptSaveLocalDisplayPreferencesField(preferences)
        this.$emit('close')

        await this.attemptSaveDisplayPreferencesField(preferences)
      } catch (_) {
        this.setFeedback({ message: this.$t('preferences:save.error'), type: 'error' })
      }
    },
  },
})
</script>

<template>
  <form
    class="preferences-form"
    :data-testid="$testId('filter-preferences-form')"
    @submit.prevent="submit"
  >
    <span class="preferences-form__title">{{ $t('preferences:choose.columns') }}</span>

    <InputField
      v-model="search"
      :placeholder="$t('preferences:search.column')"
      append-icon="search"
    />

    <div class="preferences-form__columns">
      <CheckboxField
        v-model="checkboxData"
        :items="checkboxItems"
        :select-all-text="$t('preferences:select.all')"
        :filter-items="search"
        all-option
        hoverable
      />
    </div>

    <div class="preferences-form__save">
      <Button submit>
        {{ $t('global:save') }}
      </Button>
    </div>
  </form>
</template>

<style lang="scss">
@import './FilterPreferencesForm.scss';
</style>
