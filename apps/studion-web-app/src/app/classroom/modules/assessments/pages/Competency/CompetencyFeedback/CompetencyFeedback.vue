<script>
import { defineComponent } from 'vue'
import { required } from 'vuelidate/lib/validators'
import { mapActions } from 'vuex'

import Action from '@/components/general/Action'
import CommentForm from '@/components/general/CommentForm'
import CompetencyForm from '../../CompetencyForm'
import Icon from '@/components/general/Icon'

export default defineComponent({
  name: 'CompetencyFeedback',

  components: {
    Action,
    CommentForm,
    CompetencyForm,
    Icon,
  },

  data() {
    return {
      data: {},
      feedbackComment: null,
      submitted: null,
    }
  },

  async created() {
    this.attemptGetStudentCompetency(this.$route.params.id).then((res) => {
      if (typeof res.competency.competencyComment === 'object') this.submitted = true

      this.data = res

      if (!this.$isEnabledFeature('classroom_notification')) return

      this.attemptReadCompetencyClassroomNotifications({
        competencyId: res.competency.id,
        enrollmentCompetencyId: res.id,
      })
    })
  },

  methods: {
    ...mapActions([
      'attemptGetStudentCompetency',
      'attemptSaveCompetencyFeedback',
      'setFetching',
      'attemptReadCompetencyClassroomNotifications',
    ]),

    submitFeedback() {
      this.$v.$touch()
      if (this.$v.$invalid) return

      this.setFetching(true)
      this.attemptSaveCompetencyFeedback({
        comment: this.feedbackComment,
        session_application_user_competency_id: this.$route.params.id,
      })
        .then(({ data }) => {
          this.data.competency.competencyComment = data
          this.submitted = true
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    mapQuestions(questions) {
      return questions.map((question) => {
        return {
          type: question.type,
          question_id: question.id,
          question: question.question,
          topics: question.competenciesQuestionsItems,
          answerOptions: question.competenciesQuestionsChoices,
        }
      })
    },
  },

  validations: {
    feedbackComment: { required },
  },
})
</script>

<template>
  <div
    v-if="data.competency.id"
    :data-testid="$testId('competency-feedback')"
    class="center mt-5"
  >
    <Action
      :text="$t('global:back')"
      icon="keyboard_backspace"
      class="btn-back mb-5"
      icon-size="medium"
      type="button"
      @click="$router.push({ name: 'classroom.assessments.competency' })"
    />

    <CompetencyForm
      :id="data.id"
      :title="data.competency.title"
      :description="data.competency.description"
      :answers="data.competency.enrollmentCompetencyAnswers"
      :questions="mapQuestions(data.competency.competenciesQuestions)"
      is-answered
    />

    <div
      v-if="!submitted"
      class="evaluation-question-comment general-feedback"
    >
      <CommentForm
        v-model="feedbackComment"
        :validation="$v.feedbackComment"
        :label="$t('classroom.assessments.evaluation:question.comment.label')"
        :counter="2000"
      />

      <div class="evaluation-edit-feedback">
        <Action
          :disabled="false"
          :text="$t('global:save')"
          type="button"
          secondary
          @click="submitFeedback"
        />
      </div>
    </div>

    <div
      v-else
      class="evaluation-question-feedback is-default general-feedback"
    >
      <p class="general-feedback__title">
        {{ $t('classroom.assessments.evaluation:select.comment') }}
      </p>
      <div class="general-feedback__body">
        <div
          class="evaluation-question-feedback-user ml-5 mt-3"
          :class="{ 'feedback-user-mobile': $media.mobile }"
        >
          <div class="evaluation-question-feedback-user-image-wrapper">
            <img
              v-if="
                data.competency.competencyComment &&
                data.competency.competencyComment.auditUpdate.user.image
              "
              :src="data.competency.competencyComment.auditUpdate.user.image"
              class="comment-form-user-image"
            />

            <Icon
              v-else
              name="account_circle"
              class="evaluation-question-feedback-user-icon"
            />
          </div>

          <span class="evaluation-question-feedback-user-date">
            {{
              $t('global:date.hours', {
                date: formatDate(
                  data.competency.competencyComment &&
                    data.competency.competencyComment.auditUpdate.dh
                ),
                hour: formatDate(
                  data.competency.competencyComment &&
                    data.competency.competencyComment.auditUpdate.dh,
                  'shortTime'
                ),
              })
            }}
          </span>

          <span class="evaluation-question-feedback-user-name">
            {{ data.competency.competencyComment.auditUpdate.user.name }}
          </span>
        </div>

        <p
          class="mt-3 ml-3"
          v-html="data.competency.competencyComment.comment"
        ></p>
      </div>
    </div>
  </div>
</template>
