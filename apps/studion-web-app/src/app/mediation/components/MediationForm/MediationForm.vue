<template>
  <form
    class="flex flex-column gap-4 w-12 xl:w-4 mx-auto"
    @submit.prevent="submit"
  >
    <!-- Field for: name -->
    <input-field
      v-model.trim="formData.name"
      :label="$t('global:form.name')"
      :counter="75"
      :validation="validations.formData.name"
      :hint="$t('mediation.creation:name.hint')"
      :disabled="!canWrite('mediation_plan')"
    />

    <!-- Field for: Description -->
    <input-field
      v-model.trim="formData.description"
      :label="$t('global:form.description')"
      :counter="200"
      :validation="validations.formData.description"
      :hint="$t('mediation.creation:description.hint')"
      :disabled="!canWrite('mediation_plan')"
    />

    <!-- Select for: Applicability -->
    <select-field
      v-model="formData.applicability"
      :label="$t('global:form.type')"
      :items="applicabilityOptions"
      :validation="validations.formData.applicability"
      :disabled="$route.name === 'mediation.edit' || !canWrite('mediation_plan')"
    />

    <span
      class="form-input-hint"
      v-html="$t('mediation.creation:type.hint')"
    ></span>
  </form>
</template>

<script>
import InputField from '@/components/general/InputField'
import SelectField from '@/components/general/SelectField'

export default {
  name: 'MediationForm',
  components: {
    InputField,
    SelectField,
  },
  props: {
    value: {
      type: Object,
      default: () => {},
    },
    validations: {
      type: Object,
      required: true,
    },
  },
  watch: {
    formData: {
      deep: true,
      handler() {
        this.$emit('input', this.formData)
      },
    },
    value: {
      deep: true,
      handler(val) {
        this.formData = val
      },
    },
  },
  data() {
    return {
      formData: {
        name: null,
        description: null,
        applicability: null,
      },
      applicabilityOptions: [
        {
          value: 'solution',
          text: this.$t(`global:form.solutions`),
        },
        {
          value: 'session',
          text: this.$t(`global:form.sessions`),
        },
      ],
    }
  },
}
</script>
