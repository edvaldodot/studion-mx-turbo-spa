<script>
import TextareaField from '@/components/general/TextareaField'
import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import SelectField from '@/components/general/SelectField'
import HelperCloudQuestions from '../ExaminationQuestions/components/HelperCloudQuestions'
import FormMatrix from '../FormMatrix/FormMatrix.vue'
import ResearchQuestionsLinearScale from './components/ResearchQuestionsLinearScale'

import { RESEARCH_TYPE_OPTIONS } from '@/app/solutions/shared'

export default {
  components: {
    TextareaField,
    Action,
    Checkbox,
    SelectField,
    HelperCloudQuestions,
    FormMatrix,
    ResearchQuestionsLinearScale,
  },

  props: {
    value: {
      type: Array,
      default: () => [],
    },
    validation: {
      type: Object,
      default: () => {},
    },
    type: {
      type: String,
      default: 'examination',
    },
  },

  data() {
    return {
      mutableValue: this.value,
    }
  },

  watch: {
    value: {
      handler() {
        this.mutableValue = this.value
      },
    },
  },

  created() {
    this.setUp()
  },

  methods: {
    setUp() {
      this.RESEARCH_TYPE_OPTIONS = RESEARCH_TYPE_OPTIONS
    },
    removeResearchQuestion(question, index) {
      const questions = [...this.mutableValue]
      questions.splice(index, 1)
      if (question.id > 0) {
        this.$emit('deletedResearchQuestion', question.id)
      }
      this.$emit('input', questions)
    },
    checkTypeResearchQuestion(index) {
      const { choices } = this.mutableValue[index]
      const questions = [...this.mutableValue]

      questions[index].items = []

      if (this.mutableValue[index].type === 'matrix') {
        questions[index].items.push({ description: null, type: 'matrix' })
        questions[index].choices = [{ type: 'matrix' }, { type: 'matrix' }]
        this.$emit('input', questions)
        return
      }

      if (!['multiple_choices', 'multiple_choices_multi_answers'].includes(this.mutableValue[index].type)) {
        questions[index].choices = []
        this.$emit('input', questions)
        return
      }

      if (choices && choices.length > 0) {
        return
      }

      questions[index].choices = []

      this.addResearchQuestionAlternative(index)
      this.addResearchQuestionAlternative(index)
      this.$emit('input', questions)
    },
    addResearchQuestionAlternative(index) {
      const questions = [...this.mutableValue]

      questions[index].choices.push({
        description: null,
        text: null,
        right: false,
        type: 'multiple_choices',
      })
      this.$emit('input', questions)
    },
    removeResearchQuestionAlternative(index, choiceIndex) {
      const questions = [...this.mutableValue]

      questions[index].choices.splice(choiceIndex, 1)
      questions[index].answer = null
      this.$emit('input', questions)
      if (this.validation.$each[index].choices.$each[choiceIndex]) {
        this.validation.$each[index].choices.$each[choiceIndex].$reset()
      }
    },
    addResearchQuestion() {
      const questions = [...this.mutableValue]
      questions.push({
        statement: null,
        description: null,
        type: 'discursive',
        choices: [],
        items: [],
        answer: null,
        initial_scale: 1,
        final_scale: 5,
        initial_label: '',
        final_label: '',
        does_not_apply: null,
        mandatory: true,
      })
      this.$emit('input', questions)
    },
  },
}
</script>

<template>
  <div>
    <div
      v-for="(question, index) in mutableValue"
      :key="index"
      class="modal-form-box modal-form-box--research"
    >
      <h3 class="modal-form-box-title text-color">
        {{ $t('solutions.create.classes:modal.question') }} {{ index + 1 }}
      </h3>
      <div class="p-4 border-round-xl bg-black-100">
        <Action
          v-if="mutableValue.length > 1 && !question.id"
          type="button"
          icon="close"
          class="modal-form-box-close"
          @click="removeResearchQuestion(question, index)"
        />
        <SelectField
          v-model="question.type"
          :disabled="question.id > 0"
          :items="RESEARCH_TYPE_OPTIONS"
          :validation="validation.$each[index].type"
          :allow-clear="false"
          helper
          dark
          @input="checkTypeResearchQuestion(index)"
        >
          <template #button>
            <HelperCloudQuestions
              class="text-color"
              :type="'research_' + question.type"
              :validation="validation.$each[index]"
            />
          </template>
        </SelectField>

        <TextareaField
          v-model="question.question"
          :label="$t('solutions.create.classes:modal.statement')"
          :validation="validation.$each[index].question"
          :counter="question.type === 'matrix' ? 500 : null"
          auto-grow
          dark
        />

        <!-- MULTIPLE CHOICES -->
        <template v-if="question.type === 'multiple_choices'">
          <div
            v-for="(choice, choiceIndex) in question.choices"
            :key="choiceIndex"
          >
            <TextareaField
              v-model="choice.description"
              :label="$t('solutions.create.classes:modal.alternative') + ' ' + (choiceIndex + 1)"
              :validation="validation.$each[index].choices.$each[choiceIndex].description"
              :counter="255"
              auto-grow
              dark
            >
              <Action
                v-if="mutableValue[index].choices.length > 2"
                slot="button"
                type="button"
                icon="close"
                @click="removeResearchQuestionAlternative(index, choiceIndex)"
              />
            </TextareaField>
          </div>
        </template>

        <!-- MULTIPLE CHOICES MULTI ANSWERS -->
        <template v-if="question.type === 'multiple_choices_multi_answers'">
          <div
            v-for="(choice, choiceIndex) in question.choices"
            :key="choiceIndex"
          >
            <TextareaField
              v-model="choice.description"
              :label="$t('solutions.create.classes:modal.alternative') + ' ' + (choiceIndex + 1)"
              :validation="validation.$each[index].choices.$each[choiceIndex].description"
              :counter="255"
              auto-grow
              dark
            >
              <Action
                v-if="mutableValue[index].choices.length > 2"
                slot="button"
                type="button"
                icon="close"
                @click="removeResearchQuestionAlternative(index, choiceIndex)"
              />
            </TextareaField>
          </div>
        </template>

        <ResearchQuestionsLinearScale
          v-if="question.type === 'linear_scale'"
          v-model="mutableValue[index]"
        />

        <FormMatrix
          v-if="question.type === 'matrix'"
          v-model="mutableValue[index]"
          :can-edit="true"
          :validation="validation.$each[index]"
          :choices-limit="13"
          :items-limit="10"
          item-property="description"
        />

        <Action
          v-if="question.type === 'multiple_choices'"
          :text="$t('global:form.alternative.add')"
          class="btn-add-alternative"
          type="button"
          flat
          @click="addResearchQuestionAlternative(index)"
        />

        <Action
          v-if="question.type === 'multiple_choices_multi_answers'"
          :text="$t('global:form.alternative.add')"
          class="btn-add-alternative"
          type="button"
          flat
          @click="addResearchQuestionAlternative(index)"
        />

        <Checkbox
          v-model="question.mandatory"
          :items="[{ value: true, label: $t('global:required.f') }]"
          :disabled="!canWrite('courses')"
          class="mt-6"
          dark
        />
      </div>
    </div>

    <Action
      :text="$t('solutions.create.classes:modal.add.question')"
      type="button"
      flat
      dark
      class="text-primary"
      @click="addResearchQuestion()"
    />
  </div>
</template>

<style lang="scss">
@import './ResearchQuestions.scss';
</style>
