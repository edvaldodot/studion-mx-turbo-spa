<script>
import FormSection from '@/components/general/FormSection'
import TextareaField from '@/components/general/TextareaField'
import FilesForm from '@/app/solutions/components/FilesForm'

export default {
  name: 'EvaluationFileQuestion',

  components: {
    FilesForm,
    FormSection,
    TextareaField,
  },

  props: {
    dynamicProperty: {
      type: String,
      default: 'answer',
    },

    correctionMode: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    review: {
      type: Boolean,
      default: false,
    },

    value: {
      type: Object,
      default: () => ({}),
    },

    validation: {
      type: Object,
      default: () => ({}),
    },
  },
}
</script>

<template>
  <div class="evaluation-file-question">
    <slot name="modelFiles" />

    <FormSection :title="$t(`classroom.assessments.evaluation:question.answer.label`)">
      <TextareaField
        v-model="value[dynamicProperty].answer"
        :label="$t(`global:form.description`)"
        :disabled="disabled || review"
        auto-grow
        @input="$emit('touch', value)"
      />

      <slot name="answerFiles" />

      <FilesForm
        v-if="!correctionMode && !disabled"
        :value="value"
        :validation="validation"
        :disabled="disabled"
        :review="review"
        student-mode
        @add-file="$emit('touch', value)"
        @remove-file="$emit('touch', value)"
      />
    </FormSection>
  </div>
</template>

<style lang="scss">
@import './EvaluationFileQuestion.scss';
</style>