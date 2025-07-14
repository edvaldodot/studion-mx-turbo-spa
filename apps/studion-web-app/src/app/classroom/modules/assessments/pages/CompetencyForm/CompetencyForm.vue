<script>
import { mapState, mapActions } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import Action from '@/components/general/Action'
import TextareaField from '@/components/general/TextareaField'
import Matrix from '@/components/general/Matrix'

export default {
  name: 'CompetencyForm',
  components: {
    Action,
    TextareaField,
    Matrix,
  },
  props: {
    id: {
      type: Number,
      default: null,
    },
    title: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    isAnswered: {
      type: Boolean,
      default: false,
    },
    showSaveButton: {
      type: Boolean,
      default: false,
    },
    questions: {
      type: Array,
      default: () => [],
    },
    answers: {
      type: Array,
      default: () => [],
    },
    showFeedback: {
      type: Boolean,
      default: false,
    },
    feedback: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      submitted: false,
      mutableQuestions: [],
    }
  },
  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),
    sessionUuid() {
      return this.$route.params.session_uuid
    },
  },
  validations: {
    mutableQuestions: {
      $each: {
        answer: {
          required,
          answerAll: function (_, item) {
            if (item.type !== 'matrix') return true
            return item.topics.length === item.answer.length
          }
        },
      },
    },
  },
  created() {
    this.mutableQuestions = this.questions
    this.submitted = this.isAnswered

    this.mutableQuestions.forEach((question) => {
      if (question.type === 'matrix' && typeof this.answers[0] === 'object') {
        question.answer = this.answers.map((answer) => {
          return {
            answer: {
              id: (answer.competencyQuestionChoice && answer.competencyQuestionChoice.id) || -1,
            },
            question: (answer.competencyQuestionItem && answer.competencyQuestionItem.id) || -1,
          }
        })
      }

      if (question.type === 'discursive' && typeof this.answers[0] === 'object') {
        question.answer = this.answers.find(
          (answer) => answer.questionId === question.question_id
        ).answer
      }
    })
  },
  methods: {
    ...mapActions(['setFetching', 'setFeedback', 'attemptSaveCompetency']),
    send() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.setFetching(true)
        let formData = {
          session_application_user_id: this.Classroom.data.enrollment.id,
          competency_id: this.id,
          answers: [],
        }

        this.questions.map((question) => {
          if (question.type === 'matrix') {
            question.answer.forEach((item) => {
              let answerItem = {
                competency_question_id: question.question_id,
              }
              answerItem.competency_question_item_id = item.question
              answerItem.competency_question_choice_id = item.answer.id
              formData.answers.push(answerItem)
            })
          }

          if (question.type === 'discursive') {
            let answerItem = {
              competency_question_id: question.question_id,
            }
            answerItem.answer = question.answer
            formData.answers.push(answerItem)
          }
        })

        this.attemptSaveCompetency(formData)
          .then(() => {
            this.submitted = true
            this.setFeedback({ message: this.$t('classroom.assessments.competency:send.feedback') })
            this.$emit('completed', true)
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
  },
}
</script>

<template>
  <div
    class="research-student"
    :data-testid="$testId('competency-form')"
  >
    <h2 class="research-subtitle">{{ $t('classroom.assessments.competency:title') }}</h2>
    <h3 class="research-title">{{ title }}</h3>
    <p class="research-question-description-statement">{{ description }}</p>
    <form @submit.prevent="send">
      <div
        v-for="(question, index) in mutableQuestions"
        :key="index"
        class="research-question"
      >
        <div class="research-question-header">
          <h4 class="research-question-number">
            {{
              $tc('classroom.assessments.research:question.number', question, { num: index + 1 })
            }}
          </h4>
        </div>
        <div
          v-if="question.question && question.question !== 'null'"
          class="research-question-description"
        >
          <div v-html="question.question"></div>
        </div>
        <div class="research-question-answer">
          <template v-if="question.type === 'discursive'">
            <TextareaField
              v-model="question.answer"
              :label="$t(`classroom.assessments.research:question.answer.label`)"
              :disabled="submitted"
              :validation="$v.mutableQuestions.$each[index].answer"
              auto-grow
              :counter="500"
              :dark="accessibility"
            />
          </template>
          <template v-if="question.type === 'matrix'">
            <Matrix
              v-model="question.answer"
              :questions="question.topics"
              :answer-options="question.answerOptions"
              :read-only="submitted"
              :validation="$v.mutableQuestions.$each[index].answer"
            />
          </template>
        </div>
      </div>
      <div class="text-center form-submit">
        <Action
          v-if="!submitted && equalsProfile('student')"
          type="button"
          :text="$t('classroom.assessments.research:question.submit.student')"
          submit
          primary
          large
          :dark="accessibility"
        />
      </div>
    </form>

    <div
      v-if="equalsProfile('student') && showFeedback && feedback.comment"
      class="evaluation-question-feedback is-default general-feedback"
    >
      <p class="general-feedback__title">
        {{ $t('classroom.assessments.evaluation:select.comment') }}
      </p>
      <div class="general-feedback__body">
        <div
          class="evaluation-question-feedback-user"
          :class="{ 'feedback-user-mobile': $media.mobile }"
        >
          <div class="evaluation-question-feedback-user-image-wrapper">
            <img
              v-if="feedback.auditUpdate.user.image"
              :src="feedback.auditUpdate.user.image"
              class="evaluation-question-general-feedback-user-image"
            />

            <Icon
              v-else
              name="account_circle"
              class="evaluation-question-feedback-user-icon"
            />
          </div>

          <span class="evaluation-question-feedback-user-date">{{
            $t('global:date.hours', {
              date: formatDate(feedback.auditUpdate.dh),
              hour: formatDate(feedback.auditUpdate.dh, 'shortTime'),
            })
          }}</span>

          <span class="evaluation-question-feedback-user-name">{{
            feedback.auditUpdate.user.name
          }}</span>
        </div>

        <p v-html="feedback.comment"></p>
      </div>
    </div>
  </div>
</template>
<style lang="scss">
@import '~@/app/classroom/modules/assessments/styles.scss';
</style>
