<script>
import { required, requiredIf } from 'vuelidate/lib/validators'
import { mapState, mapActions, mapGetters } from 'vuex'

import DiscussionComment from '../../components/DiscussionComment'
import DiscussionCard from '../../components/DiscussionCard'
import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'
import InputField from '@/components/general/InputField'
import TextEditor from '@/components/general/TextEditor'
import ModalConfirm from '@/components/general/ModalConfirm'
import ValidationMessage from '@/components/general/ValidationMessage'

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ForumEvaluationStudent',

  components: {
    DiscussionComment,
    DiscussionCard,
    Action,
    Icon,
    InputField,
    TextEditor,
    ModalConfirm,
    ValidationMessage,
  },

  data() {
    return {
      hasFeedback: false,
      posts: [],
      openModalExit: false,
      formData: {
        feedback: '',
        grade: null,
      },
      initialGrade: null,
      applicationUser: null,
    }
  },

  validations: {
    formData: {
      feedback: {
        required: requiredIf(function () {
          return this.currentForum.feedbackMandatory
        }),
      },
      grade: {
        required,
        minGrade: function (nestedModel) {
          return nestedModel <= this.currentForum.maxGrade
        },
      },
    },
  },

  computed: {
    ...mapGetters(['isFetching']),
    ...mapState({
      currentUser: ({ Account }) => Account.user,
      currentForum: ({ forums }) => forums.current || {},
    }),
  },

  created() {
    const { session_uuid, applicationUserId, id } = this.$route.params

    this.setFetching(true)
    Promise.all([
      this.attemptDiscussionRetrieval({
        sessionUuid: session_uuid,
        discussionId: id,
      }),
      this.attemptDiscussionPostUser({ id, applicationUserId }),
    ])
      .then(([, { data }]) => {
        this.posts = data.posts
        const item = this.posts.find((i) => i.applicationUser.id === Number(applicationUserId))
        this.applicationUser = item.applicationUser.userData.name
        this.initialGrade = data.graded
        this.formData.grade = data.graded
        this.formData.feedback = data.feedback

        if (data.feedback || data.graded || data.graded === 0) {
          this.hasFeedback = true
        }
      })
      .finally(() => {
        this.setFetching(false)
      })
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptEvaluationStudentPost',
      'attemptDiscussionPostUser',
      'attemptDiscussionRetrieval',
      'attemptEditEvaluationStudentPost',
    ]),

    getProfileName(profile) {
      return profile.alias === 'agent' ? profile.name : this.$t(`global:${profile.alias}`)
    },

    exitPage() {
      this.$router.push(this.$route.meta.modalCloseLink)
    },

    handleExitPage() {
      if (this.$v.formData.$anyDirty || this.initialGrade !== this.formData.grade) {
        this.openModalExit = true
        return
      }

      this.exitPage()
    },

    submit() {
      this.$v.$touch()
      if (this.$v.$invalid) return

      if (this.hasFeedback) {
        return this.updateEvaluation()
      }

      this.submitEvaluation()
    },

    submitEvaluation() {
      const { applicationUserId, id } = this.$route.params

      this.setFetching(true)
      this.attemptEvaluationStudentPost({
        id,
        applicationUserId,
        data: this.formData,
      })
        .then(({ data }) => {
          this.$emit('discussion-saved', data)
          this.setFeedback({
            message: this.$t('forum:feedback:updated.success'),
          })
          this.$router.push(this.$route.meta.modalCloseLink)
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('classroom.forum:feedback.update.comment.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    updateEvaluation() {
      this.setFetching(true)
      const { applicationUserId, id } = this.$route.params

      this.attemptEditEvaluationStudentPost({
        id,
        applicationUserId,
        data: this.formData,
      })
        .then(() => {
          this.setFeedback({ message: this.$t('forum:feedback:updated.success') })
          this.$router.push(this.$route.meta.modalCloseLink)
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('classroom.forum:feedback.update.comment.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
})
</script>

<template>
  <div
    v-if="!isFetching"
    class="center forum-evaluation__component"
    :data-testid="$testId('forum-evaluation-student')"
  >
    <Action
      type="button"
      icon="keyboard_backspace"
      icon-size="small"
      :text="$t('global:back')"
      class="btn-back text-color"
      @click="handleExitPage"
    />

    <div class="forum-evaluation__header">
      <h2 class="header__title">{{ $t('classroom.forum:evaluate.student.title') }}</h2>
      <p class="header__student">{{ applicationUser }}</p>
    </div>

    <DiscussionCard
      v-for="post in posts"
      :key="post.id"
      :post="post"
      :get-profile-name="getProfileName"
      disable-comments
      hide-options
      disable-like
    >
      <div
        v-if="post.comments && post.comments.length"
        class="forum-discussion-comment-list"
      >
        <DiscussionComment
          v-for="(comment, commentIndex) in post.comments"
          :id="comment.id"
          ref="comments"
          :key="`post-comment-${commentIndex}`"
          :content="comment.content"
          :audit-insert="comment.auditInsert"
          :application-user="comment.applicationUser"
          :like-statistics="comment.likeStatistics"
          :excluded="comment.excluded"
          :editing="comment.editing"
          :loading="comment.loading"
          hide-options
          disable-like
        />
      </div>
    </DiscussionCard>

    <div class="forum-evaluation__correction">
      <h3 class="correction__title">{{ $t('classroom.assessments.evaluation:title') }}</h3>

      <form
        class="correction__form"
        @submit.prevent="submit"
      >
        <div class="correction__grade">
          <InputField
            v-model="formData.grade"
            :validation="$v.formData.grade"
            :label="$t('global:grade')"
            :min="0"
            :max="currentForum.maxGrade"
            :step="0.1"
            any-step
            type="number"
            hide-error-details
          />

          <p class="remaining__grade">
            {{ $t('classroom.forum:evaluate.student.remaining.grade') }}
            <span class="remaining__number">
              {{ parseFloat(currentForum.maxGrade).toFixed(2).replace('.', ',') }}
            </span>
          </p>
        </div>
        <div class="form-item-details">
          <ValidationMessage :validation="$v.formData.grade" />
        </div>

        <div class="correction__feedback">
          <div class="correction__author">
            <img
              v-if="currentUser && currentUser.profile_image"
              :src="currentUser.profile_image"
              :alt="currentUser.data.name"
            />
            <Icon
              v-else
              name="account_circle"
              class="forum-discussion-user-image-icon"
            />
          </div>

          <TextEditor
            v-model="formData.feedback"
            :label="$t('classroom.forum:evaluate.student.feedback')"
            :validation="$v.formData.feedback"
            :floating-label="false"
          />
        </div>

        <div class="correction__actions">
          <Action
            :text="!hasFeedback ? $t('rating:button.evaluate') : $t('global:save')"
            type="button"
            secondary
            submit
          />
        </div>
      </form>
    </div>

    <ModalConfirm
      :title="$t('classroom.forum:evaluate.students.exit.title')"
      :active="openModalExit"
      @close="openModalExit = false"
      @confirm="exitPage"
    >
      <p class="text-color">{{ $t('classroom.forum:evaluate.students.exit.description') }}</p>
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
@import './ForumEvaluationStudent.scss';
</style>
