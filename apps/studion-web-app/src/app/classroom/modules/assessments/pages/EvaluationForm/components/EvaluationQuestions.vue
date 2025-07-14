<script>
import Icon from '@/components/general/Icon'
import Radio from '@/components/general/Radio'
import TextareaField from '@/components/general/TextareaField'
import Checkbox from '@/components/general/Checkbox'
import FillBlankField from '@/components/general/FillBlankField'
import SelectField from '@/components/general/SelectField'
import ValidationMessage from '@/components/general/ValidationMessage'

import EvaluationFileQuestion from '@/app/classroom/components/EvaluationFileQuestion'
import AnnulledFeedback from '@/app/classroom/components/AnnulledFeedback'
import FilesGrid from '@/app/classroom/components/FilesGrid'

export default {
  name: 'EvaluationQuestions',

  components: {
    Checkbox,
    EvaluationFileQuestion,
    FilesGrid,
    Icon,
    SelectField,
    Radio,
    TextareaField,
    FillBlankField,
    ValidationMessage,
    AnnulledFeedback,
  },

  props: {
    questions: {
      type: Array,
      default: () => [],
    },

    feedbackInclude: {
      type: Boolean,
      default: null,
    },

    accessibility: {
      type: Boolean,
      default: false,
    },

    submitted: {
      type: Boolean,
      default: false,
    },

    review: {
      type: Boolean,
      default: false,
    },

    isHybrid: {
      type: Boolean,
      default: false,
    },

    showFeedback: {
      type: Boolean,
      default: false,
    },

    gradeFormatIsHidden: {
      type: Boolean,
      default: false,
    },

    validations: {
      type: Object,
      required: true,
    },
  },

  methods: {
    filterFilesByType(answers, type) {
      const files = answers && answers.files && answers.files.filter((file) => file.type === type)
      return files || []
    },
    touchQuestion(question, validation) {
      this.$emit('touch-question', { question, validation })
    },
  },
}
</script>

<template>
  <div class="evaluation-student">
    <template v-for="(question, index) in questions">
      <div
        v-if="!submitted || question.answered || (submitted && !question.answered)"
        :id="`qid_${question.id}`"
        :key="index"
        ref="question"
        class="evaluation-question"
        :class="{ annulled: question.annulled }"
      >
        <div class="evaluation-question-header">
          <h4 class="evaluation-question-number">
            {{
              $tc('classroom.assessments.evaluation:question.number', question.points, {
                num: index + 1,
              })
            }}
          </h4>

          <span
            v-if="!gradeFormatIsHidden"
            class="evaluation-question-points"
          >
            {{
              $t(
                `classroom.assessments.evaluation:question.point${question.points >= 2 ? 's' : ''}`,
                { num: question.points.toString().replace('.', ',') }
              )
            }}
          </span>
        </div>

        <div class="evaluation-question-description">
          <p v-html="question.statement"></p>
        </div>

        <div class="evaluation-question-answer">
          <template v-if="question.type === 'discursive'">
            <TextareaField
              v-model="question.answer.answer"
              :label="$t(`classroom.assessments.evaluation:question.answer.label`)"
              :disabled="submitted || question.annulled || review"
              :validation="validations.questions.$each[index].answer"
              :dark="accessibility"
              auto-grow
              @input="touchQuestion(question, validations.questions.$each[index].answer)"
            />
          </template>

          <EvaluationFileQuestion
            v-if="question.type === 'send_file'"
            :validation="validations.questions.$each[index]"
            :value="question"
            :disabled="submitted || question.annulled"
            :review="review"
            @touch="touchQuestion(question, validations.questions.$each[index].files)"
          >
            <template #modelFiles>
              <FilesGrid :files="question.modelFiles" />
            </template>

            <template
              v-if="submitted && question.answer"
              #answerFiles
            >
              <FilesGrid
                :files="filterFilesByType(question.answer, 'answer')"
                :label="$t('global:file')"
              />
            </template>
          </EvaluationFileQuestion>

          <template v-if="question.type === 'multiple_choices'">
            <Radio
              :key="submitted"
              v-model="question.answer.choice.choice_id"
              :validation="validations.questions.$each[index].answer"
              :items="question.choices"
              :disabled="submitted || question.annulled || review"
              :dark="accessibility"
              dynamic
              @input="touchQuestion(question, validations.questions.$each[index].answer)"
            />
          </template>

          <template v-if="question.type === 'multiple_choices_multi_answers'">
            <Checkbox
              v-model="question.answer.choice.choice_id"
              :items="question.choices"
              :disabled="submitted || question.annulled || review"
              :validation="validations.questions.$each[index].answer"
              :dark="accessibility"
              @input="touchQuestion(question, validations.questions.$each[index].answer)"
            />
          </template>

          <template v-if="question.type === 'association'">
            <div class="evaluation-question-flex">
              <div class="evaluation-question-choices">
                <p
                  v-for="(choice, cIndex) in question.choices"
                  :key="cIndex"
                  class="mt-2 mb-4"
                >
                  <b>{{ cIndex + 1 }}</b> {{ choice.description }}
                </p>
              </div>
              <div class="evaluation-question-items">
                <p
                  v-for="(item, iIndex) in question.items"
                  :key="iIndex"
                  class="mb-2"
                >
                  <select-field
                    v-model="question.itemsAnswer[iIndex]"
                    :items="question.itemOptions"
                    :label="$t('global:form.answer')"
                    :show-optional="false"
                    :disabled="submitted || question.annulled || review"
                    :validation="validations.questions.$each[index].itemsAnswer"
                    @input="touchQuestion(question, question.itemsAnswer)"
                  />
                  {{ item.description }}
                </p>
              </div>
            </div>
            <div class="form-input-details">
              <div
                v-if="
                  (!validations.questions.$each[index].items.isUnique &&
                    validations.questions.$each[index].items.$error) ||
                  validations.questions.$each[index].items.$error
                "
                class="form-input-messages-container"
              >
                <icon
                  name="error"
                  wrapper
                  size="small"
                ></icon>
                <span class="form-input-message">{{
                  $t('classroom.assessments.evaluation:association.error')
                }}</span>
              </div>
            </div>
          </template>
          <template v-if="question.type === 'true_or_false'">
            <div
              v-for="(item, iIndex) in question.items"
              :key="item.id"
            >
              <p v-html="item.description"></p>
              <radio
                :key="submitted"
                v-model="question.answer.choice.choice_id[iIndex]"
                :items="item.options"
                :disabled="submitted || question.annulled || review"
                :dark="accessibility"
                horizontal
                class="mb-5"
                @input="touchQuestion(question, question.answer.choice.choice_id[iIndex])"
              />
            </div>
            <div class="form-input-details">
              <validation-message :validation="validations.questions.$each[index].answer" />
            </div>
          </template>
          <template v-if="question.type === 'fill_gap'">
            <div
              v-for="(item, iIndex) in question.items"
              :key="item.id"
            >
              <fill-blank-field
                v-model="question.answer[iIndex]"
                :placeholder="$t('global:form.answer')"
                :disabled="submitted || question.annulled || review"
                :text="question.items[iIndex].description"
                :right-items="question.rightItems ? question.rightItems[iIndex] : []"
                @input="touchQuestion(question, validations.questions.$each[index].answer)"
              />
            </div>
            <div class="form-input-details">
              <validation-message :validation="validations.questions.$each[index].answer" />
            </div>
          </template>
        </div>

        <template v-if="showFeedback && !question.annulled">
          <template
            v-if="
              (question.type === 'multiple_choices' ||
                question.type === 'multiple_choices_multi_answers' ||
                question.type === 'true_or_false' ||
                question.type === 'association') &&
              !question.manualCorrection
            "
          >
            <div
              v-if="question.feedbackType"
              class="evaluation-question-feedback"
              :class="{
                'is-correct': question.feedbackType === 'correct',
                'is-partial': question.feedbackType === 'partial-multi',
                'is-wrong': question.feedbackType === 'wrong',
                'question-feedback-mobile': $media.mobile,
              }"
            >
              <icon
                v-if="!['partial', 'partial-multi'].includes(question.feedbackType)"
                :name="
                  question.feedbackType && question.feedbackType === 'wrong'
                    ? 'close-circle'
                    : 'check-circle'
                "
                wrapper
                class="evaluation-question-feedback-icon"
              ></icon>
              <h5
                v-if="question.feedbackType"
                class="evaluation-question-feedback-title text-color"
              >
                {{ $t(`classroom.assessments.evaluation:alternative.${question.feedbackType}`) }}
              </h5>
              <p
                v-if="feedbackInclude"
                v-html="
                  question.feedbackType === 'correct'
                    ? question.rightFeedback
                    : question.wrongFeedback
                "
              ></p>
            </div>
          </template>
          <template v-if="question.type === 'fill_gap' && !question.manualCorrection">
            <div
              v-if="question.feedbackType"
              class="evaluation-question-feedback"
              :class="{
                'is-correct': question.feedbackType === 'correct',
                'is-partial': question.feedbackType === 'partial',
                'is-wrong': question.feedbackType === 'wrong',
                'question-feedback-mobile': $media.mobile,
              }"
            >
              <Icon
                v-if="!['partial', 'neutral'].includes(question.feedbackType)"
                :name="
                  question.feedbackType && question.feedbackType === 'wrong'
                    ? 'close-circle'
                    : 'check-circle'
                "
                wrapper
                class="evaluation-question-feedback-icon"
              />
              <h5
                v-if="question.feedbackType"
                class="evaluation-question-feedback-title text-color"
              >
                {{
                  $t(
                    `classroom.assessments.evaluation:answer${
                      question.feedbackType === 'partial' ? '.correct' : ''
                    }.${question.feedbackType}`
                  )
                }}
              </h5>
              <p
                v-if="feedbackInclude"
                v-html="
                  question.feedbackType === 'correct'
                    ? question.rightFeedback
                    : question.wrongFeedback
                "
              ></p>
            </div>
          </template>
          <template
            v-if="
              ['discursive', 'send_file'].includes(question.type) ||
              (question.manualCorrection && question.correction)
            "
          >
            <div
              v-if="feedbackInclude && question.rightFeedback !== null"
              class="evaluation-question-feedback"
            >
              <p class="text-color">{{ question.rightFeedback }}</p>
            </div>
            <div
              v-if="question.feedbackType"
              class="evaluation-question-feedback"
              :class="{
                'is-default': true,
                'is-correct': question.feedbackType === 'correct',
                'is-wrong': question.feedbackType === 'wrong',
                'is-partial': question.feedbackType === 'partial',
                'question-feedback-mobile': $media.mobile,
              }"
            >
              <icon
                v-if="
                  question.feedbackType && !['partial', 'neutral'].includes(question.feedbackType)
                "
                :name="
                  question.feedbackType && question.feedbackType === 'wrong'
                    ? 'close-circle'
                    : 'check-circle'
                "
                wrapper
                class="evaluation-question-feedback-icon"
              />
              <h5
                v-if="question.feedbackType"
                class="evaluation-question-feedback-title text-color"
              >
                {{
                  $t(
                    `classroom.assessments.evaluation:answer.${
                      question.feedbackType === 'partial'
                        ? 'correct.partial'
                        : question.feedbackType
                    }`
                  )
                }}
              </h5>
              <h5
                v-else
                class="evaluation-question-feedback-title text-color"
              ></h5>

              <div
                class="evaluation-question-feedback-option"
                :class="{ 'feedback-option-mobile': $media.mobile }"
              >
                <span
                  v-if="question.answer.grade && !gradeFormatIsHidden"
                  class="evaluation-question-feedback-points text-color"
                >
                  {{
                    $t(
                      `classroom.assessments.evaluation:question.point${
                        question.answer.grade >= 2 ? 's' : ''
                      }`,
                      { num: question.answer.grade.toString().replace('.', ',') }
                    )
                  }}
                </span>
              </div>

              <div
                v-for="(item, index) in question.answer.history"
                :key="`evaluation-question-feedback-${index}`"
              >
                <template v-if="index === question.answer.history.length - 1">
                  <div
                    v-if="
                      (question.answer &&
                        filterFilesByType(question.answer, 'correction').length) ||
                      (item.afterRevision.comment &&
                        !['', 'null', 'undefined'].includes(item.afterRevision.comment))
                    "
                    class="evaluation-question-feedback-user"
                    :class="{ 'feedback-user-mobile': $media.mobile }"
                  >
                    <div class="evaluation-question-feedback-user-image-wrapper">
                      <img
                        v-if="item.auditInsert.user.image"
                        :src="item.auditInsert.user.image"
                        alt=""
                        class="evaluation-question-feedback-user-image"
                      />
                      <icon
                        v-else
                        name="account_circle"
                        class="evaluation-question-feedback-user-icon"
                      ></icon>
                    </div>
                    <span class="evaluation-question-feedback-user-date">{{
                      $t('global:date.hours', {
                        date: formatDate(item.auditInsert.dh),
                        hour: formatDate(item.auditInsert.dh, 'shortTime'),
                      })
                    }}</span>
                    <span class="evaluation-question-feedback-user-name">{{
                      item.auditInsert.user.name
                    }}</span>
                  </div>
                  <p
                    v-if="
                      item.afterRevision.comment &&
                      !['', 'null', 'undefined'].includes(item.afterRevision.comment)
                    "
                    v-html="item.afterRevision.comment"
                  ></p>
                </template>
              </div>
              <FilesGrid
                v-if="
                  question.type === 'send_file' &&
                  question.answer &&
                  filterFilesByType(question.answer, 'correction').length
                "
                :files="filterFilesByType(question.answer, 'correction')"
              />
            </div>
          </template>
        </template>

        <AnnulledFeedback v-if="Boolean(question.annulled)" />
      </div>
    </template>
  </div>
</template>
