<script>
import { mapState, mapActions } from 'vuex'
import { requiredIf } from 'vuelidate/lib/validators'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import Matrix from '@/components/general/Matrix'
import Radio from '@/components/general/Radio'
import TextareaField from '@/components/general/TextareaField'
import ValidationMessage from '@/components/general/ValidationMessage'

const LinearScaleQuestion = () => import('./components/LinearScaleQuestion')

export default {
  name: 'ResearchForm',
  components: {
    Action,
    Checkbox,
    Matrix,
    Radio,
    TextareaField,
    LinearScaleQuestion,
    ValidationMessage,
  },
  mixins: [formScrollValidationMixin],
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
      default: true,
    },
    questions: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data() {
    return {
      submitted: false,
      mutableQuestions: this.questions,
    }
  },
  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),
    sessionUuid() {
      return this.$route.params.session_uuid
    },
  },
  validations: {
    questions: {
      $each: {
        answer: {
          questionFilled: requiredIf(function (nestedModel) {
            return nestedModel.mandatory
          }),
          answerAll: function (_, item) {
            if (item.type !== 'matrix') return true

            if (!item.mandatory) {
              return item.answer.length === 0 || item.answer.length === item.items.length
            }

            return item.items.length === item.answer.length
          },
        },
      },
    },
  },
  methods: {
    ...mapActions(['setFetching', 'setFeedback', 'attemptSaveResearch']),

    send() {
      this.$v.$touch()

      if (this.$v.$invalid) {
        this.$nextTick(() => this.scrollToInputError())
        return
      }

      this.setFetching(true)

      let formData = {
        uuid: this.Account.user.uuid,
        session_uuid: this.sessionUuid,
        topic_id: this.id,
        answers: [],
      }

      this.questions.forEach((question) => {
        let answerItem = { question_id: question.question_id, answer: question.answer }

        if (['multiple_choices', 'linear_scale'].includes(question.type)) {
          answerItem = { question_id: question.question_id, choice_id: question.answer }
          return formData.answers.push(answerItem)
        }

        if (question.type === 'multiple_choices_multi_answers') {
          const multipleAnswers = Array.isArray(question.answer) ? question.answer : []

          const items = multipleAnswers.map((choiceId) => ({
            question_id: question.question_id,
            choice_id: choiceId,
          }))

          return formData.answers.push(...items)
        }

        if (question.type === 'matrix') {
          const items = question.answer.map((a) => ({
            question_id: question.question_id,
            choice_id: a.answer.id,
            item_id: a.question,
          }))

          return formData.answers.push(...items)
        }

        formData.answers.push(answerItem)
      })


      formData.answers = formData.answers.filter((a) => a.answer || a.choice_id)

      if (formData.answers.length === 0) {
        this.setFetching(false)
        return this.setFeedback({
          message: this.$t('classroom.assessments.research:answer.empty'),
        })
      }

      this.attemptSaveResearch({ data: formData, sessionUuid: this.sessionUuid })
        .then(() => {
          this.setFetching(false)
          this.$emit('completed')
          this.$emit('update:isAnswered', true)
        })
        .finally(() => {
          this.setFetching(false)
        })

      this.submitted = true
    },

    mapToTitleAndId(arr, titleKey, idKey = 'value') {
      return arr.map((item) => ({
        title: item[titleKey],
        id: item[idKey],
      }))
    },

    getMatrixQuestionChoices(choices) {
      return this.mapToTitleAndId(choices, 'label')
    },

    getMatrixQuestionItems(items) {
      return this.mapToTitleAndId(items, 'description', 'id')
    },
  },
}
</script>

<template>
  <div
    class="research-student"
    :class="{ 'theme-dark': accessibility }"
  >
    <h2 class="research-subtitle">{{ $t('classroom.assessments.research:title') }}</h2>
    <template v-if="!isAnswered">
      <h3 class="research-title">{{ title }}</h3>
      <p class="research-question-description-statement">{{ description }}</p>
      <form
        v-if="!submitted"
        @submit.prevent="send"
      >
        <div
          v-for="(question, index) in mutableQuestions"
          :key="index"
        >
          <div
            :class="{ '--error': $v.questions.$each[index].answer.$error }"
            class="research-question"
          >
            <div class="research-question-header">
              <h4 class="research-question-number">
                {{
                  $tc('classroom.assessments.research:question.number', question, {
                    num: index + 1,
                  })
                }}
              </h4>
              <span
                v-if="question.mandatory"
                class="research-question-header__tag"
              >
                {{ $t('global:required.f') }}
              </span>
            </div>
            <div class="research-question-description">
              <p class="text-color">{{ question.question }}</p>
            </div>
            <div class="research-question-answer">
              <template v-if="question.type === 'discursive'">
                <TextareaField
                  v-model="question.answer"
                  :label="$t(`classroom.assessments.research:question.answer.label`)"
                  :disabled="submitted"
                  :validation="$v.questions.$each[index].answer"
                  :dark="accessibility"
                  :show-optional="false"
                  auto-grow
                  hide-error-details
                />
              </template>
              <template v-if="question.type === 'multiple_choices'">
                <Radio
                  v-model="question.answer"
                  :items="question.choices"
                  :disabled="submitted"
                  :validation="$v.questions.$each[index].answer"
                  :dark="accessibility"
                  :details="false"
                />
              </template>
              <template v-if="question.type === 'multiple_choices_multi_answers'">
                <Checkbox
                  v-model="question.answer"
                  :items="question.choices"
                  :disabled="submitted"
                  :validation="$v.questions.$each[index].answer"
                  :dark="accessibility"
                />
              </template>

              <Matrix
                v-if="question.type === 'matrix'"
                v-model="question.answer"
                :answer-options="getMatrixQuestionChoices(question.choices)"
                :questions="getMatrixQuestionItems(question.items)"
                :validation="$v.questions.$each[index].answer"
                hide-error-details
              />

              <LinearScaleQuestion
                v-if="question.type === 'linear_scale'"
                v-model="mutableQuestions[index]"
                :items="question.choices"
                :disabled="submitted"
                :validation="$v.questions.$each[index].answer"
              />
            </div>
          </div>

          <ValidationMessage
            :validation="$v.questions.$each[index].answer"
            class="mt-2"
          />
        </div>

        <div
          v-if="showSaveButton"
          class="text-center form-submit"
        >
          <Action
            v-if="!submitted"
            :text="$t('classroom.assessments.research:question.submit.student')"
            :dark="accessibility"
            type="button"
            submit
            primary
            large
          />
        </div>
      </form>
    </template>

    <template v-else>
      <div class="research-answered">
        <h3 class="research-answered__title">
          {{ $t('classroom.assessments.research:feedback') }}
        </h3>
        <p class="research-answered__description">
          {{ $t('classroom.assessments.research:feedback.description') }}
        </p>
      </div>
    </template>
  </div>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/assessments/styles.scss';
</style>
