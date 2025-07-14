<script>
/// <reference path="./typedefs.js" />
import Icon from '@/components/general/Icon'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'QuestionFeedback',

  components: {
    Icon,
  },

  props: {
    question: {
      type: Object,
      default: null,
    },
    studentExamination: {
      type: Object,
      default: null,
    },
  },

  computed: {
    questionFeedbackClasses() {
      const result = this.getFeedbackType

      const classesObject = { 'question-feedback-mobile': this.$media.mobile }
      if (result) classesObject['is-' + result] = Boolean(result)

      return classesObject
    },

    getFeedbackType() {
      let result = ''

      if (this.question && this.question.feedbackType) {
        result = this.question.feedbackType
      } else if (this.question && this.question.answers && this.question.answers.result) {
        result = this.question.answers.result
      } else if (
        this.question &&
        this.question.answers &&
        !this.question.answers.result &&
        !this.question.feedbackType
      ) {
        result = 'wrong'
      }

      if (result === 'incorrect') result = 'wrong'
      if (result === 'partial-multi') result = 'partial'

      return result
    },

    /**
     * @returns {string} feedback title
     */
    getQuestionFeedbackTitle() {
      let result = this.getFeedbackType
      if (result === 'neutral') return
      return this.$t(`classroom.assessments.evaluation:alternative.${result}`)
    },
  },

  methods: {
    /**
     * Check if question answer result is include on listAccepted list
     * @param {FeedbackTypes[] | string} listAccepted
     * @param {Question} question
     * @returns {boolean}
     */
    isQuestionResults(listAccepted) {
      let results = []

      if (Array.isArray(listAccepted)) results = listAccepted
      else results.push(listAccepted)

      const wrongTerms = results.filter((result) => result == 'wrong' || result == 'incorrect')

      if (wrongTerms.length === 1) {
        if (wrongTerms[0] === 'wrong') results.push('incorrect')
        else results.push('wrong')
      }

      return results.includes(this.getFeedbackType)
    },

    /**
     * @returns {string} alternative feedback title
     */
    getQuestionAlternativeFeedbackTitle() {
      return this.getFeedbackType !== 'neutral'
        ? this.$t(`classroom.assessments.evaluation:alternative.${this.getFeedbackType}`)
        : null
    },
    /**
     * @param {FeedbackTypes[]} listAccepted
     * @param {Question} question
     * @returns {'check-circle' | 'close-circle'}
     */
    getQuestionFeedbackIcon(listAccepted, question) {
      const questionResults = this.isQuestionResults(listAccepted)
      const isCorrectType = question.feedbackType === 'correct'
      return questionResults || isCorrectType ? 'check-circle' : 'close-circle'
    },

    /**
     * @param {Question} question
     * @returns {string}
     */
    getFeedbackTextQuestion(question) {
      return question.feedbackType === 'correct' || question.answers.result === 'correct'
        ? question.rightFeedback
        : question.wrongFeedback
    },
  },
})
</script>

<template>
  <div
    v-if="question"
    :data-testid="$testId('question-feedback')"
    class="evaluation-question-feedback"
    :class="questionFeedbackClasses"
  >
    <Icon
      v-if="!isQuestionResults(['neutral', 'partial'])"
      :name="getQuestionFeedbackIcon(['correct'], question)"
      class="evaluation-question-feedback-icon"
      wrapper
    />

    <h5
      v-if="question.feedbackType"
      class="evaluation-question-feedback-title text-color"
    >
      {{ getQuestionAlternativeFeedbackTitle() }}
    </h5>

    <h5
      v-else-if="getQuestionFeedbackTitle"
      class="evaluation-question-feedback-title text-color"
      :class="{ 'feedback-title-mobile': $media.mobile }"
    >
      {{ getQuestionFeedbackTitle }}
    </h5>

    <p
      v-if="
        studentExamination &&
        studentExamination.examination &&
        studentExamination.examination.feedbackInclude
      "
      v-html="getFeedbackTextQuestion(question)"
    ></p>

    <slot></slot>
  </div>
</template>
