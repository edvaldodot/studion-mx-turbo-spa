<script>
import { defineComponent } from 'vue'
import Action from '@/components/general/Action'
import HelperCloudQuestions from '../../../ExaminationQuestions/components/HelperCloudQuestions'
import SelectField from '@/components/general/SelectField'

const FormMatrix = () => import('../../../FormMatrix')
const CompetencyFormDiscursive = () => import('../CompetencyFormDiscursive')

export default defineComponent({
  name: 'CompetencyQuestionWrapper',

  components: {
    Action,
    FormMatrix,
    CompetencyFormDiscursive,
    HelperCloudQuestions,
    SelectField,
  },

  props: {
    index: {
      type: Number,
      required: true,
    },
    canDelete: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Object,
      default: () => ({}),
    },
    validation: {
      type: Object,
      required: true,
    },
    canEdit: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      componentNames: {
        matrix: 'FormMatrix',
        discursive: 'CompetencyFormDiscursive',
      },
      question: this.value,
      selectOptions: [
        {
          text: this.$t('global:form.matrix'),
          value: 'matrix',
        },
        {
          text: this.$t('global:form.discursive'),
          value: 'discursive',
        },
      ],
    }
  },

  watch: {
    /**
     * Every time question type change emit a event to feed validation rules
     */
    'question.type': {
      immediate: true,
      handler(newValue) {
        this.$emit('question:type', newValue, this.index)
      },
    },
  },
})
</script>

<template>
  <div
    class="modal-form-box"
    :data-testid="$testId('competency-form-box')"
  >
    <h3 class="modal-form-box-title text-color">
      {{ $t('solutions.create.classes:modal.question') }} {{ index + 1 }}
    </h3>

    <div class="bg-black-100 border-round-xl p-4">
      <Action
        v-if="canWrite('courses') && canDelete"
        :title="$t('global:exclude')"
        type="button"
        icon="close"
        class="modal-form-box-close"
        @click="$emit('question:delete', index)"
      />

      <SelectField
        v-model="question.type"
        :disabled="!canWrite('courses') || !canEdit"
        :items="selectOptions"
        :validation="validation.type"
        :label="$t('global:form.content.type')"
        class="mt-3"
        helper
        dark
      >
        <template #button>
          <HelperCloudQuestions
            v-if="question.type"
            :type="question.type"
          />
        </template>
      </SelectField>

      <component
        :is="componentNames[question.type]"
        v-model="question"
        :validation="validation"
        :can-edit="canEdit"
      />
    </div>
  </div>
</template>
