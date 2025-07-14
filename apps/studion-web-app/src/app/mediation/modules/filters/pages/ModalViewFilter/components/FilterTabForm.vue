
<script>
import Action from '@/components/general/Action'

import AsyncAutocomplete from '../../../components/FilterForm/components/AsyncAutocomplete'

import { mapActions } from 'vuex'

export default {
  name: 'FilterTabForm',

  components: {
    Action,
    AsyncAutocomplete
  },

  props: {
    value: {
      type: Object,
      default: () => {}
    },
    validation: {
      type: Object,
      default: () => {}
    },
    data: {
      type: Object,
      default: () => {}
    }
  },

  created () {
    if (this.data.solution) this.value.solution = this.data.solution
  },

  methods: {
    ...mapActions([
      'attemptSessionBySolutionRetrieval',
      'attemptSolutionsRetrieval'
    ])
  }
}
</script>

<template>
  <form class="form-filter">
    <async-autocomplete
      :value="value"
      :validation="validation"
      :asyncRequest="attemptSolutionsRetrieval"
      :label="$t('mediation.filter:form.solution')"
      :disabled="data.solution !== undefined"
      valueKey="solution"
      optionProperty="course_name"
    />

    <async-autocomplete
      :value="value"
      :validation="validation"
      :asyncRequest="attemptSessionBySolutionRetrieval"
      :label="$t('mediation.filter:form.session')"
      :disabled="!value.solution"
      :optionalParams="value"
      valueKey="session"
      optionProperty="name"
    />

    <action
      large
      flatten
      secondary
      fixed-width
      type="button"
      @click="$emit('submit')"
      :text="$t('global:menu.search')"
    />
  </form>
</template>
