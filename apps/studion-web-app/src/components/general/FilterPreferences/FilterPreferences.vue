<script>
import { defineComponent } from 'vue'

import Button from '../Button'
import FilterPreferencesForm from './FilterPreferencesForm'

export default defineComponent({
  name: 'FilterPreferences',

  components: {
    Button,
    FilterPreferencesForm,
  },
  props: {
    columns: {
      type: Array,
      required: true,
    },
    defaultPreferences: {
      type: Array,
      default: () => [],
    },
    field: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      showPreferencesForm: false,
    }
  },
  computed: {
    buttonVariant() {
      return this.$media.mobile ? 'icon' : 'default'
    },
  },
  methods: {
    togglePreferencesForm() {
      this.showPreferencesForm = !this.showPreferencesForm
    },

    closePreferencesForm() {
      this.showPreferencesForm = false
    },
  },
})
</script>

<template>
  <div
    v-click-outside="closePreferencesForm"
    :data-testid="$testId('filter-preferences')"
    class="preferences__wrapper"
  >
    <Button
      class="preferences__button"
      inner-prepend-icon="view_column"
      icon="view_column"
      :variant="buttonVariant"
      @click="togglePreferencesForm"
    >
      {{ $t('preferences:hide') }}
    </Button>

    <div
      v-if="showPreferencesForm"
      class="preferences__form-wrapper"
    >
      <FilterPreferencesForm
        :field="field"
        :columns="columns"
        :default-preferences="defaultPreferences"
        @close="closePreferencesForm"
      />
    </div>
  </div>
</template>

<style lang="scss">
@import './FilterPreferences.scss';
</style>
