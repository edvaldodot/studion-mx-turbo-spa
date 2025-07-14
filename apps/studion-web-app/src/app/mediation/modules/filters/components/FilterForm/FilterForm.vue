<script>
import { mapActions, mapState } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'

import filterFormMixin from '../../mixins/filterFormMixin'

import Action from '@/components/general/Action'
import Autocomplete from '@/components/general/Autocomplete'
import InputField from '@/components/general/InputField'
import FormSection from '@/components/general/FormSection'
import Loading from '@/components/general/Loading'
import Modal from '@/components/general/Modal'
import SelectField from '@/components/general/SelectField'

import AsyncAutocomplete from './components/AsyncAutocomplete'
import CustomTopicAutocomplete from './components/CustomTopicAutocomplete'

export default {
  name: 'FilterForm',

  components: {
    Action,
    AsyncAutocomplete,
    Autocomplete,
    CustomTopicAutocomplete,
    InputField,
    FormSection,
    Loading,
    Modal,
    SelectField
  },

  mixins: [filterFormMixin],

  props: {
    validation: {
      type: Object,
      default: () => {}
    },

    value: {
      type: Object,
      default: () => {}
    },

    isEditing: {
      type: Boolean,
      default: false
    },

    isProcessing: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      localFilterTypes: []
    }
  },

  computed: {
    ...mapState({
      filterTypes: (state) => state.Filters.filterTypes
    })
  },

  methods: {
    ...mapActions([
      'attemptSolutionsWithScormRetrieval',
      'attemptScormBySolutionRetrieval'
    ]),

    handleSubmit () {
      if (this.isEditing) return
      this.$v.formData.$touch()
      if (this.$v.formData.$invalid) return
      this.$emit('onSubmit', this.formData)
    }
  },

  created () {
    if (!(this.value && this.value.name)) return
    this.formData = cloneDeep(this.value)

    if (this.value.filterType === 'sql') {
      this.localFilterTypes = [{
        value: 'sql',
        text: this.$t(`mediation.filter:form.filter_type:sql`),
        id: 2
      }]
    }
  }
}
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    class="form-filter"
    :class="{
      'view': isEditing
    }"
  >
    <form-section>
      <input-field
        v-model.trim="formData.name"
        :validation="$v.formData.name"
        :label="$t('global:form.name')"
        :counter="50"
        dark
        :hint="$t('mediation.filter:form.name.hint')"
        :disabled="isEditing"
      />
    </form-section>

    <form-section>
      <input-field
        v-model.trim="formData.description"
        :validation="$v.formData.description"
        :label="$t('global:form.description')"
        :counter="200"
        dark
        :hint="$t('mediation.filter:form.description.hint')"
        :disabled="isEditing"
      />
    </form-section>

    <form-section>
      <select-field
        v-model="formData.filterType"
        :validation="$v.formData.filterType"
        :items="isEditing && (formData.filterType === 'sql') ? localFilterTypes : filterTypes"
        :label="$t('mediation.filter:form.filter_type')"
        dark
        :hint="$t(`mediation.filter:form.filter_type.hint${formData.filterType === 'scorm' ? ':scorm': ''}`)"
        :disabled="isEditing"
      />
    </form-section>

    <div
      v-if="formData.filterType && status.isLoading  && !isEditing"
      class="form-submit text-center"
    >
      <loading dark />
    </div>

    <template v-else-if="status.items && status.items.length">
      <form-section>
        <async-autocomplete
          :value="formData"
          valueKey="solution"
          :validation="$v.formData"
          :asyncRequest="attemptSolutionsWithScormRetrieval"
          :label="$t('mediation.filter:form.solution')"
          optionProperty="course_name"
          :disabled="isEditing"
        />
      </form-section>

      <form-section>
        <async-autocomplete
          :value="formData"
          valueKey="scorm"
          :validation="$v.formData"
          :asyncRequest="attemptScormBySolutionRetrieval"
          :label="$t('mediation.filter:form.scorm')"
          optionProperty="name"
          :optionalParams="params"
          :disabled="!formData.solution || isEditing"
        />
      </form-section>

      <form-section>
        <select-field
          v-model="formData.status"
          :validation="$v.formData.status"
          :items="status.items"
          :label="$t('mediation.filter:form.status')"
          :disabled="!formData.scorm || isEditing"
          dark
        />
      </form-section>

      <custom-topic-autocomplete
        :value="formData"
        :validation="$v.formData"
        :optionalParams="params"
        :disabled="!formData.scorm || isEditing"
        :isEditing="isEditing"
      />

      <div v-if="!isEditing" class="form-submit text-center">
        <div
          v-if="isProcessing"
          class="mt-5"
        >
          <loading dark />
        </div>

        <action
          v-else
          large
          flat
          primary
          fixed-width
          submit
          type="button"
          class="mt-5 mb-5"
          :text="$t('global:save')"
        />
      </div>
    </template>
  </form>
</template>

<style lang="scss">
  @import "./FilterForm.scss";
</style>
