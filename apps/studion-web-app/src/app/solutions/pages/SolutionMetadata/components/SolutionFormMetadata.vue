<script>
import { mapState } from 'vuex'

import Datepicker from '@/components/general/Datepicker'
import FormSection from '@/components/general/FormSection'
import InputField from '@/components/general/InputField'
import SelectField from '@/components/general/SelectField'
import TextareaField from '@/components/general/TextareaField'

export default {
  name: 'SolutionFormMetadata',

  props: {
    disabled: {
      type: Boolean,
      default: false
    },

    metadataList: {
      type: Array,
      default: () => []
    },

    metaFormData: {
      type: Object,
      default: () => {}
    },

    metaValidation: {
      type: Object,
      required: true
    }
  },

  components: {
    Datepicker,
    FormSection,
    InputField,
    SelectField,
    TextareaField
  },

  computed: {
    ...mapState(['accessibility'])
  }
}
</script>

<template>
  <form
    v-if="metadataList.length"
    @submit.prevent="$emit('submit')"
    class="form mt-10 mb-10"
  >
    <div v-for="metadata in metadataList" :key="metadata.alias">
      <datepicker
        :label="metadata.name"
        v-model="metaFormData[metadata.alias]"
        :validation="metaValidation[metadata.alias]"
        allow-input
        :disabled="disabled"
        v-if="metadata.type === 'date'"
        :dark="accessibility"
      />

      <textarea-field
        :label="metadata.name"
        v-model="metaFormData[metadata.alias]"
        :validation="metaValidation[metadata.alias]"
        :disabled="disabled"
        auto-grow
        v-if="metadata.type === 'text'"
        :dark="accessibility"
      />

      <select-field
        :label="metadata.name"
        v-model="metaFormData[metadata.alias]"
        :validation="metaValidation[metadata.alias]"
        :items="metadata.options"
        :disabled="disabled"
        v-if="metadata.type === 'select'"
        :dark="accessibility"
      />

      <select-field
        :label="metadata.name"
        v-model="metaFormData[metadata.alias]"
        :validation="metaValidation[metadata.alias]"
        :items="metadata.options"
        multiple
        :disabled="disabled"
        v-if="metadata.type === 'multiple_select'"
        :dark="accessibility"
      />
    </div>
  </form>
</template>
