<script>
import { SESSION_METADATA_OPTIONS } from '@/support/constants'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import InputField from '@/components/general/InputField'
import SelectField from '@/components/general/SelectField'

import MetaList from './MetaList'

export default {
  name: 'FormSolutionMetadata',

  components: {
    Action,
    Checkbox,
    InputField,
    MetaList,
    SelectField,
  },

  props: {
    disabled: {
      type: Boolean,
      default: false,
    },

    value: {
      type: Object,
      default: () => {},
    },

    validation: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      typeOptions: SESSION_METADATA_OPTIONS,
    }
  },

  computed: {
    showMetaList() {
      return ['select', 'multiple_select'].includes(this.value.meta.meta_type_alias)
    },
  },

  methods: {
    submit() {
      this.validation.$touch()
      if (this.validation.$invalid) return
      this.$emit('submit', this.deepClone(this.value))
    },
  },
}
</script>
<template>
  <form
    class="flex flex-column gap-2"
    @submit.prevent="submit"
  >
    <div class="flex flex-column gap-2">
      <input-field
        v-model="value.meta.name"
        dark
        :validation="validation.meta.name"
        :label="$t('solutions.metadata:form:field.name')"
        :disabled="disabled"
      />

      <select-field
        v-model="value.meta.meta_type_alias"
        dark
        :validation="validation.meta.meta_type_alias"
        :label="$t('global:form.type')"
        :items="typeOptions"
        :disabled="disabled"
      />
    </div>

    <meta-list
      v-if="showMetaList"
      :value="value"
      :validation="validation"
      :disabled="disabled"
    />

    <checkbox
      switch-type
      dark
      :items="[
        {
          value: true,
          label: $t('solutions.metadata:form:allow.student'),
        },
      ]"
      v-model="value.meta_entity.extra_parameters.studentShow"
      :disabled="disabled"
    />

    <checkbox
      switch-type
      dark
      :items="[
        {
          value: true,
          label: $t('solutions.metadata:form:required.field'),
        },
      ]"
      v-model="value.parameters.required"
      :disabled="disabled"
    />

    <div class="flex justify-content-center">
      <Action
        large
        primary
        fixed-width
        submit
        type="button"
        class="mt-5 mb-5"
        :text="$t('global:save')"
        :disabled="disabled"
      />
    </div>
  </form>
</template>
