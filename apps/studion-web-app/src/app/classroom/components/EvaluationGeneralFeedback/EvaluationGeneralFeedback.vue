<template>
  <form
    :data-testid="$testId('evaluation-general-feedback')"
    class="general-feedback__form"
    @submit.prevent="submitFeedback"
  >
    <div v-if="!equalsProfile('student') && (editing || !hasFeedback)">
      <Checkbox
        v-if="!editing"
        v-model="showFeedback"
        :items="[
          {
            value: true,
            label: $t('classroom.assessments.evaluation:evaluation.feedback.comment.checkbox'),
          },
        ]"
        switch-type
      />

      <div v-if="showFeedback">
        <div class="evaluation-question-comment general-feedback">
          <CommentForm
            v-model="feedbackComment"
            :validation="$v.feedbackComment"
            :label="$t('classroom.assessments.evaluation:question.comment.label')"
            :counter="2000"
          />
        </div>

        <div class="evaluation-edit-feedback mt-4 text-center w-12">
          <Action
            :disabled="isSubmitDisabled"
            :text="$t('global:save')"
            type="button"
            secondary
            submit
          />
        </div>
      </div>
    </div>

    <div
      v-else-if="hasFeedback"
      class="evaluation-question-feedback general-feedback"
    >
      <p class="general-feedback__title">
        {{ $t('classroom.assessments.evaluation:select.comment') }}
      </p>
      <div class="evaluation-question-feedback-option">
        <Dropdown
          v-if="notEqualsProfile('student')"
          icon="dots-vertical"
          icon-size="medium"
          right
        >
          <DropdownLink
            :text="$t('global:edit')"
            @click="editFeedback()"
          />
          <DropdownLink
            :text="$t('global:remove')"
            @click="removeFeedback()"
          />
        </Dropdown>
      </div>
      <div class="general-feedback__body">
        <div
          class="evaluation-question-feedback-user"
          :class="{ 'feedback-user-mobile': $media.mobile }"
        >
          <div class="evaluation-question-feedback-user-image-wrapper">
            <img
              v-if="metadata && metadata.user.image"
              :src="metadata.user.image"
              alt=""
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
              date: formatDate(metadata.createdAt),
              hour: formatDate(metadata.createdAt, 'shortTime'),
            })
          }}</span>

          <span class="evaluation-question-feedback-user-name">{{ metadata.user.name }}</span>
        </div>

        <p class="text-color" v-html="feedback.comment"></p>
      </div>
    </div>
  </form>
</template>

<script>
import { mapActions } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import CommentForm from '@/components/general/CommentForm'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Icon from '@/components/general/Icon'

export default {
  components: {
    Action,
    Checkbox,
    CommentForm,
    Dropdown,
    DropdownLink,
    Icon,
  },
  props: {
    examinationId: {
      type: [Number, String],
      default: null,
    },
    feedback: {
      type: [Object],
      default: null,
    },
  },
  data() {
    return {
      showFeedback: false,
      editing: false,
      feedbackComment: '',
    }
  },
  validations() {
    return {
      feedbackComment: {
        required: required,
      },
    }
  },
  computed: {
    hasFeedback() {
      return this.feedback
    },
    metadata() {
      if (!this.feedback && !this.feedback.auditUpdate) return null
      return {
        user: this.feedback.auditUpdate.user,
        createdAt: this.feedback.auditUpdate.dh,
      }
    },
    commentId() {
      return this.feedback.id || null
    },
    isSubmitDisabled() {
      return this.$v.feedbackComment.$anyError
    },
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptAddGeneralFeedback',
      'attemptEditGeneralFeedback',
      'attemptDeleteGeneralFeedback',
    ]),

    payloadFactory(id, comment = '') {
      return { id, comment }
    },

    async submitFeedback() {
      this.$v.$touch()
      if (this.$v.$invalid) return

      this.setFetching(true)

      const feedbackClient = this.editing
        ? this.attemptEditGeneralFeedback
        : this.attemptAddGeneralFeedback

      const id = this.editing ? this.commentId : this.examinationId

      await feedbackClient(this.payloadFactory(id, this.feedbackComment))
      this.$emit('reload-feedback')

      this.setFetching(false)
      this.editing = false
    },
    editFeedback() {
      this.feedbackComment = this.feedback.comment
      this.showFeedback = true
      this.editing = true
    },
    async removeFeedback() {
      this.setFetching(true)

      await this.attemptDeleteGeneralFeedback(this.payloadFactory(this.commentId))
      this.$emit('reload-feedback')

      this.setFetching(false)
      this.feedbackComment = ''
      this.showFeedback = false
      this.editing = false
      this.$v.$reset()
    },
  },
}
</script>

<style lang="scss">
@import '~@/app/classroom/modules/assessments/styles.scss';
@import './EvaluationGeneralFeedback.scss';
</style>
