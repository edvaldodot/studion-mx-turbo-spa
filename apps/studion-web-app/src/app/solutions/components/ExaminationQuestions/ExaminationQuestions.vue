<script>
import { mapActions, mapState } from 'vuex'

import TextareaField from '@/components/general/TextareaField'
import SelectField from '@/components/general/SelectField'
import Checkbox from '@/components/general/Checkbox'
import InputField from '@/components/general/InputField'
import Action from '@/components/general/Action'

import TextEditor from '@/components/general/TextEditor'
import TextEditorMedia from '@/components/shared/TextEditorMedia'
import ItemsForm from '../ItemsForm'
import FilesForm from '../FilesForm'
import HelperCloudQuestions from './components/HelperCloudQuestions'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Icon from '@/components/general/Icon'
import Tooltip from '@/components/general/Tooltip'

import QuestionFormObs from './components/QuestionFormObs.vue'
import { QUESTION_TYPE_OPTIONS } from '../../shared.js'

export default {
  name: 'ExaminationQuestions',
  components: {
    TextareaField,
    SelectField,
    InputField,
    FilesForm,
    HelperCloudQuestions,
    Action,
    ItemsForm,
    TextEditor,
    TextEditorMedia,
    Checkbox,
    Dropdown,
    DropdownLink,
    Icon,
    Tooltip,
    QuestionFormObs,
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
    hasFeedback: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      default: 'examination',
    },
    isTopicTemplate: {
      type: Boolean,
      default: false,
    },
    unique: {
      type: Boolean,
      default: false,
    },
    allowedTypes: {
      type: [String, Array],
      default: '*',
    },
    disableChangeType: {
      type: Boolean,
      default: false,
    },
    isQuestionTemplate: {
      type: Boolean,
      default: false,
    },
    isPreProject: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      qttChoices: {
        multiple_choices: {
          min: 2,
        },
        multiple_choices_multi_answers: {
          min: 2,
        },
        true_or_false: {
          min: 1,
        },
        association: {
          min: 2,
        },
        fill_gap: {
          min: 1,
        },
      },
    }
  },
  computed: {
    ...mapState(['Courses']),

    alternativeOptions() {
      return this.value.map((question) => {
        if (
          question.type === 'multiple_choices_multi_answers' ||
          question.type === 'multiple_choices'
        ) {
          return question.choices.map((choice, index) => {
            const altNumber = index + 1
            return {
              text: this.$t('solutions.create.classes:modal.alternative') + ' ' + altNumber,
              value: index,
            }
          })
        } else if (question.type === 'association') {
          return question.items.map((i, index) => {
            const altNumber = index + 1
            return {
              text: this.$t('global:form.answer') + ' ' + altNumber,
              value: index,
            }
          })
        }
      })
    },

    questionTypeOptions() {
      if (this.allowedTypes === '*') return QUESTION_TYPE_OPTIONS

      return QUESTION_TYPE_OPTIONS.filter((type) => this.allowedTypes.includes(type.value))
    },

    courseIsHybrid() {
      const currentCourse = this.Courses.current
      const type = currentCourse && currentCourse.type
      return type && type.alias === 'hybrid'
    },
  },

  created() {
    if (this.value.length) return
    this.addExaminationQuestion()
  },

  methods: {
    ...mapActions(['setFeedback', 'setFetching']),

    removeExaminationQuestion(question, index) {
      const questions = [...this.value]
      if (question.id > 0) {
        this.$emit('deletedExaminationQuestion', question.id)
      }
      questions.splice(index, 1)
      this.$emit('input', questions)
      this.$emit('trigger:changed')
    },

    checkTypeExaminationQuestion(index) {
      const questions = [...this.value]

      if (questions[index].type !== 'send_file') {
        questions[index].files = []
        questions[index].allowFile = false
      }

      if (['discursive', 'send_file'].includes(questions[index].type)) {
        this.alternativeOptions[index] = []
        questions[index].choices = []
        questions[index].manualCorrection = true
        this.$emit('input', questions)
        return
      } else if (questions[index].type === 'multiple_choices_multi_answers') {
        this.$set(questions[index], 'answer', [])
      }
      this.$set(questions[index], 'manualCorrection', false)
      this.alternativeOptions[index] = []
      questions[index].choices = []
      if (questions[index].type !== 'true_or_false') {
        this.addExaminationQuestionAlternative(index)
      }

      if (
        questions[index].type === 'multiple_choices_multi_answers' ||
        questions[index].type === 'multiple_choices' ||
        questions[index].type === 'association'
      ) {
        this.addExaminationQuestionAlternative(index)
      }

      if (questions[index].type === 'multiple_choices') {
        questions[index].answer = null
        questions[index].items = []
      }

      this.$emit('input', questions)
    },

    removeExaminationQuestionAlternative(index, choiceIndex) {
      const questions = [...this.value]
      questions[index].choices.splice(choiceIndex, 1)

      if (this.value[index].type === 'multiple_choices') {
        this.alternativeOptions[index].splice(-1, 1)
        questions[index].answer = null
        this.$emit('input', questions)
        if (this.validation.$each[index].choices.$each[choiceIndex]) {
          this.validation.$each[index].choices.$each[choiceIndex].$reset()
        }
        this.validation.$each[index].answer.$reset()
      }

      this.$emit('trigger:changed')
    },

    addExaminationQuestionAlternative(index) {
      const questions = [...this.value]

      questions[index].choices.push({
        questionId: questions[index].id || questions[index].temporaryId,
        description: null,
        text: null,
        right:
          questions[index].type === 'association' || questions[index].type === 'true_or_false'
            ? null
            : false,
        type: questions[index].type,
      })

      this.addExaminationQuestionAlternativeOption(index)
      this.$emit('input', questions)
    },
    addExaminationQuestionAlternativeOption(index) {
      if (
        this.value[index].type === 'multiple_choices' ||
        this.value[index].type === 'multiple_choices_multi_answers' ||
        this.value[index].type === 'association'
      ) {
        this.alternativeOptions[index].push({
          text:
            this.$t('solutions.create.classes:modal.alternative') +
            ' ' +
            this.value[index].choices.length,
          value: this.value[index].choices.length - 1,
        })
      }
    },
    checkExaminationQuestionCorrectAlternative(index) {
      const questions = [...this.value]
      questions[index].choices.map((choice) => {
        choice.right = false
      })
      let idx = questions[index].answer
      if (!(idx instanceof Array)) {
        questions[index].choices[idx].right = true
        this.$emit('input', questions)
      } else {
        idx.forEach((answer) => {
          questions[index].choices[answer].right = true
        })
        this.$emit('input', questions)
      }
    },

    addExaminationQuestion() {
      const questions = [...this.value]
      const question = {
        temporaryId: this.$uuid(),
        statement: null,
        points: null,
        description: null,
        type: this.isQuestionTemplate ? 'multiple_choices' : 'discursive',
        choices: [],
        files: [],
        allowFile: false,
        answer: null,
        rightFeedback: '',
        wrongFeedback: '',
        question_id: 0,
        items: [],
        isTemplate: this.isQuestionTemplate,
        manualCorrection: false,
      }

      if (!this.isTopicTemplate) {
        question.annulled = false
        question.rightChoiceEdited = false
      }

      questions.push(question)
      this.$emit('input', questions)

      if (this.isQuestionTemplate) {
        this.$nextTick(() => {
          this.checkTypeExaminationQuestion(0)
        })
      }
    },
    alternativeOrResponse(type) {
      return type === 'association'
        ? this.$t('global:form.answer')
        : this.$t('solutions.create.classes:modal.alternative')
    },
    annulQuestion(id, annulled = true) {
      this.$emit('annul-question', { id, annulled })
    },

    allowRecalculateExaminationOnHybrid() {
      return this.$isEnabledFeature('allow_recalculate_examination') && this.courseIsHybrid
    },

    isAnnulled(question) {
      return this.allowRecalculateExaminationOnHybrid() && question.annulled
    },

    isRecalculated(question) {
      return this.allowRecalculateExaminationOnHybrid() && question.rightChoiceEdited
    },

    isAggregate(question) {
      return Boolean(question.aggregateQuestionId || question.aggregateQuestion)
    },

    recalculateMessageLabel(question) {
      if (question.rightChoiceEdited && question.annulled) {
        return 'solutions.create.classes:question.recalculated.annulled'
      }

      if (question.rightChoiceEdited) return 'solutions.create.classes:question.recalculated'
      return 'solutions.create.classes:question.annulled'
    },
  },
}
</script>
<template>
  <div>
    <div
      v-for="(question, index) in value"
      :key="index"
      class="modal-form-box examination-questions"
    >
      <h3
        v-if="!unique"
        class="modal-form-box-title text-color"
      >
        {{ $t('solutions.create.classes:modal.question') }} {{ index + 1 }}
      </h3>

      <div
        class="p-4 border-round-xl bg-black-100"
        :class="{
          'is-recalculate': isAnnulled(question) || isRecalculated(question),
        }"
      >
        <Dropdown
          v-if="canWrite('courses') && !isAnnulled(question) && !unique"
          icon="dots-vertical"
          icon-size="medium"
          class="modal-form-box-dots"
          :disabled="isAggregate(question)"
          right
        >
          <DropdownLink
            v-if="value.length > 1 && !question.id"
            :text="$t('global:remove')"
            @click="removeExaminationQuestion(question, index)"
          />

          <template v-if="$isEnabledFeature('allow_recalculate_examination') && !isTopicTemplate">
            <Tooltip
              v-if="!courseIsHybrid"
              :uppercase="false"
              :width="192"
              :bold-font="false"
            >
              <template #activator="{ on }">
                <DropdownLink
                  :text="$t('global:annul.question')"
                  :disabled="true"
                  @mouseenter.native="on.mouseenter"
                  @mouseleave.native="on.mouseleave"
                />
              </template>

              <span>{{
                $t('solutions.create.classes:question.recalculated.annulled:tooltip:disabled')
              }}</span>
            </Tooltip>

            <DropdownLink
              v-else-if="!!question.id"
              :text="$t('global:annul.question')"
              @click="annulQuestion(question.id)"
            />
          </template>
        </Dropdown>

        <div
          v-if="isAggregate(question)"
          class="question-disable-by-aggregate"
        >
          <Tooltip
            :uppercase="false"
            :width="$media.mobile ? 200 : 360"
            vertical-align="center-y"
            shadow
            text-center
          >
            <template #activator="{ on }">
              <section
                class="block-aggregate-area"
                @mouseenter="on.mouseenter"
                @mouseleave="on.mouseleave"
              ></section>
            </template>

            <span>
              {{ $t('pre.project.form.aggregate.examination.disable.question.message') }}
            </span>
          </Tooltip>
        </div>

        <SelectField
          v-if="!isPreProject"
          v-model="question.type"
          :disabled="
            question.question_id > 0 ||
            !canWrite('courses') ||
            isAnnulled(question) ||
            disableChangeType ||
            isAggregate(question)
          "
          :items="questionTypeOptions"
          :validation="validation.$each[index].type"
          :allow-clear="false"
          helper
          dark
          @input="checkTypeExaminationQuestion(index)"
        >
          <template #button>
            <HelperCloudQuestions
              :type="question.type"
              :validation="validation.$each[index]"
            />
          </template>
        </SelectField>

        <slot name="additional-fields" />

        <TextEditorMedia
          v-model="value[index]"
          :validation="validation.$each[index].statement"
          :item="'statement'"
          :disabled="!canWrite('courses') || isAnnulled(question) || isAggregate(question)"
          :label="
            !isPreProject
              ? $t('solutions.create.classes:modal.statement')
              : $t('solutions.create.classes:modal.statement.discursive')
          "
          :show-attached-files="false"
          image-enabled
          embed-image
          libras
        />

        <template v-if="!['discursive', 'send_file'].includes(value[index].type)">
          <Checkbox
            v-model="value[index].manualCorrection"
            :items="[{ value: true, label: $t('global:form.manual.correction') }]"
            :disabled="!canWrite('courses') || isAnnulled(question) || isAggregate(question)"
            switch-type
            dark
          />

          <QuestionFormObs
            v-if="value[index].manualCorrection"
            :label="$t('solutions.create.classes:modal.form.toggle.manual.obs')"
          />
        </template>

        <template
          v-if="
            question.type === 'multiple_choices_multi_answers' ||
            question.type === 'multiple_choices'
          "
        >
          <TextareaField
            v-for="(choice, choiceIndex) in question.choices"
            :key="choiceIndex"
            v-model="choice.description"
            :disabled="!canWrite('courses') || isAnnulled(question) || isAggregate(question)"
            :validation="validation.$each[index].choices.$each[choiceIndex].description"
            :counter="500"
            :label="alternativeOrResponse(question.type) + ' ' + (choiceIndex + 1)"
            dark
            auto-grow
          >
            <Action
              v-if="
                canWrite('courses') &&
                value[index].choices.length > qttChoices[value[index].type].min
              "
              :disabled="isAggregate(question)"
              slot="button"
              type="button"
              icon="close"
              @click="removeExaminationQuestionAlternative(index, choiceIndex)"
            />
          </TextareaField>
        </template>

        <ItemsForm
          v-if="
            question.type === 'association' ||
            question.type === 'true_or_false' ||
            question.type === 'fill_gap'
          "
          v-model="question.items"
          :disabled="!canWrite('courses') || isAnnulled(question) || isAggregate(question)"
          :question-type="question.type"
          :min-items="qttChoices[question.type].min"
          :validation="validation"
          :question-index="index"
          :question="question"
        />

        <template v-if="question.type === 'association'">
          <h3
            class="modal-form-box-title text-color mt-5"
            :class="{ disabled: isAnnulled(question) }"
          >
            {{ $tc('global:topic', 2) }}
          </h3>

          <div
            v-for="(choice, choiceIndex) in question.choices"
            :key="'Assoc' + choiceIndex"
          >
            <TextareaField
              v-model="choice.description"
              :disabled="!canWrite('courses') || isAnnulled(question) || isAggregate(question)"
              :validation="validation.$each[index].choices.$each[choiceIndex].description"
              :counter="500"
              :label="$tc('global:topic', 1) + ' ' + (choiceIndex + 1)"
              auto-grow
              dark
            >
              <Action
                v-if="
                  canWrite('courses') &&
                  value[index].choices.length > qttChoices[value[index].type].min
                "
                slot="button"
                :disabled="isAnnulled(question) || isAggregate(question)"
                type="button"
                icon="close"
                @click="removeExaminationQuestionAlternative(index, choiceIndex)"
              />
            </TextareaField>

            <SelectField
              v-model="choice.itemIndex"
              :label="$tc('global:form.answer.associated', 1)"
              :items="alternativeOptions[index]"
              :validation="validation.$each[index].choices.$each[choiceIndex].right"
              :disabled="!canWrite('courses') || isAnnulled(question) || isAggregate(question)"
              :show-optional="false"
              dark
            />
          </div>

          <Action
            v-if="canWrite('courses')"
            :text="$t('global:form.question.add')"
            :disabled="isAnnulled(question) || isAggregate(question)"
            type="button"
            class="mb-3"
            flat
            dark
            @click="addExaminationQuestionAlternative(index)"
          />
        </template>

        <Action
          v-if="
            canWrite('courses') &&
            ['multiple_choices', 'multiple_choices_multi_answers'].includes(question.type)
          "
          :text="$t('global:form.alternative.add')"
          :disabled="isAnnulled(question) || isAggregate(question)"
          type="button"
          class="btn-add-alternative mb-4"
          flat
          @click="addExaminationQuestionAlternative(index)"
        />

        <select-field
          v-if="
            question.type === 'multiple_choices' ||
            question.type === 'multiple_choices_multi_answers'
          "
          v-model="question.answer"
          :multiple="question.type == 'multiple_choices_multi_answers'"
          :label="$t('solutions.create.classes:modal.correct.alternative')"
          :items="alternativeOptions[index]"
          :disabled="!canWrite('courses') || isAnnulled(question) || isAggregate(question)"
          :validation="validation.$each[index].answer"
          :dynamic-values="question.type == 'multiple_choices_multi_answers'"
          dark
          @input="checkExaminationQuestionCorrectAlternative(index)"
        />

        <FilesForm
          v-if="question.type === 'send_file'"
          :value="question"
          :validation="validation.$each[index]"
          :disabled="!canWrite('courses') || isAnnulled(question) || isAggregate(question)"
          dark
        />

        <template v-if="hasFeedback">
          <h4
            class="modal-form-box-title text-color"
            :class="{
              'mt-5': ['true_or_false', 'send_file'].includes(question.type),
              'z-index-feedback': isAggregate(question),
            }"
          >
            {{ $t('solutions.create.classes:modal.feedback.title') }}
          </h4>

          <TextEditor
            v-if="['discursive', 'send_file'].includes(question.type)"
            v-model="question.rightFeedback"
            :class="{ 'z-index-feedback': isAggregate(question) }"
            :label="$t('solutions.create.classes:modal.neutral.feedback.message')"
            :validation="validation.$each[index].rightFeedback"
            :disabled="!canWrite('courses') || isAnnulled(question)"
            :counter="500"
            :formats="['libras']"
            libras
            bubble
            hide-tools
            auto-grow
          />

          <template v-else>
            <TextEditor
              v-model="question.rightFeedback"
              :class="{ 'z-index-feedback': isAggregate(question) }"
              :label="
                $t(
                  `solutions.create.classes:modal.${
                    value[index].manualCorrection ? 'neutral' : 'positive'
                  }.feedback.message`
                )
              "
              :validation="validation.$each[index].rightFeedback"
              :disabled="!canWrite('courses') || isAnnulled(question)"
              :counter="500"
              :formats="['libras']"
              bubble
              hide-tools
              libras
              auto-grow
            />

            <TextEditor
              v-if="!value[index].manualCorrection"
              v-model="question.wrongFeedback"
              :class="{ 'z-index-feedback': isAggregate(question) }"
              :label="$t('solutions.create.classes:modal.negative.feedback.message')"
              :validation="validation.$each[index].wrongFeedback"
              :disabled="!canWrite('courses') || isAnnulled(question)"
              :counter="500"
              :formats="['libras']"
              bubble
              hide-tools
              libras
              auto-grow
            />
          </template>
        </template>

        <div
          v-if="!isQuestionTemplate"
          class="flex flex-column"
          :class="{ 'z-index-points': isAggregate(question) }"
        >
          <p class="form-group-description text-color">
            {{ $t('solutions.create.classes:modal.question.points') }}:
          </p>
          <input-field
            v-model="question.points"
            :label="$t('solutions.create.classes:modal.points')"
            :validation="validation.$each[index].points"
            :disabled="!canWrite('courses') || isAnnulled(question)"
            :min="0.01"
            :step="0.5"
            :max="10"
            type="number"
            dark
          />
        </div>

        <QuestionFormObs
          v-if="['discursive', 'send_file'].includes(value[index].type)"
          :label="$t('solutions.create.classes:modal.manual.obs')"
        />

        <div
          v-if="isAnnulled(question) || isRecalculated(question)"
          class="undo-action"
        >
          <p class="undo-message">
            <Icon name="error" />
            <span>{{
              !question.annulledByForm
                ? $t(recalculateMessageLabel(question))
                : $t('solutions.create.classes:annul.after.save')
            }}</span>
          </p>

          <Action
            v-if="question.annulledByForm"
            :text="$t('global:undo')"
            type="button"
            flat
            dark
            @click="annulQuestion(question.id, false)"
          />
        </div>
      </div>
    </div>

    <Action
      v-if="canWrite('courses') && !unique"
      :text="$t('solutions.create.classes:modal.add.question')"
      class="btn-add-question text-primary"
      type="button"
      flat
      dark
      @click="addExaminationQuestion()"
    />
  </div>
</template>

<style lang="scss">
@import './ExaminationQuestions.scss';
</style>
