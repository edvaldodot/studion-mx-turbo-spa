<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import { isBefore, isAfter, parseISO } from 'date-fns'
import debounce from 'lodash/debounce'
import dotAiMixin from '@/mixins/dotAiMixin'

import Action from '@/components/general/Action'
import AvatarLikeInPost from '../../components/AvatarLikeInPost'
import DiscussionComment from '../../components/DiscussionComment'
import DiscussionStatusTag from '../../components/DiscussionStatusTag'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import Icon from '@/components/general/Icon'
import Like from '@/components/general/Like'
import MandatoryContent from '@/components/shared/CardForum/component/MandatoryContent.vue'
import PostingArea from '../../components/PostingArea'
import TopBar from '@/components/general/TopBar'

import TextReduce from '@/components/general/TextReduce'

const Modal = () => import('@/components/general/Modal')
const DiscussionCard = () => import('../../components/DiscussionCard')

export default {
  name: 'ClassroomForumDiscussion',
  components: {
    Action,
    AvatarLikeInPost,
    DiscussionComment,
    DiscussionStatusTag,
    MandatoryContent,
    DiscussionCard,
    Dropdown,
    DropdownLink,
    Icon,
    Like,
    Modal,
    PostingArea,
    TopBar,
    TextReduce,
  },
  mixins: [dotAiMixin],

  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },

  beforeRouteUpdate(to, from, next) {
    if (to.name === from.name) {
      this.initialSetup(to.params.id)
    }
    next()
  },

  data() {
    return {
      discussion: {
        discussionsPosts: [],
        highlight: [],
      },
      formData: {
        comment: null,
        loading: false,
        posts: [],
      },
      formDataEditPost: {
        comment: null,
        loading: false,
      },
      deleteObj: {
        type: null,
        elem: null,
      },
      modalDeleteConfirmActive: false,
      formIsVisible: false,
      feedbackEvaluate: {},
      discussionPostLike: [],
    }
  },
  validations: {
    formData: {
      comment: {
        required,
      },
      posts: {
        $each: {
          comment: {
            required,
          },
        },
      },
    },
    formDataEditPost: {
      comment: {
        required,
      },
    },
    formDataEditComment: {
      comment: {
        required,
      },
    },
  },
  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),
    ...mapState({
      currentForum: ({ forums }) => forums.current || {},
    }),

    profileImage() {
      return this.Account.user.profile_image ? this.Account.user.profile_image : null
    },
    backgroundImage() {
      return this.discussion.image ? `url('${this.discussion.image}')` : null
    },
    sessionUuid() {
      return this.$route.params.session_uuid
    },
    discussionId() {
      return this.$route.params.id
    },
    status() {
      return !this.discussion.active
        ? 'inactive'
        : isBefore(new Date(), parseISO(this.discussion.startTime))
        ? 'waiting'
        : isAfter(new Date(), parseISO(this.discussion.endTime))
        ? 'closed'
        : 'active'
    },
    statusMessage() {
      return this.status === 'inactive'
        ? this.$t('classroom.forum:discussion.inactive')
        : this.status === 'closed'
        ? this.$t('classroom.forum:discussion.closed')
        : `${this.$t('classroom.forum:discussion.active.until')} ${this.formatDate(
            this.discussion.endTime,
            'long'
          )}.`
    },
    disableComments() {
      return this.status === 'closed' || this.status === 'inactive'
    },
    backButtonLabel() {
      return this.$route.params.management
        ? this.$t('management:back.to.management')
        : this.$t('global:back')
    },
  },

  created() {
    this.initialSetup()
    this.initializeDotAIAssistance()
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptDiscussionRetrieval',
      'attemptDiscussionRemoval',
      'attemptDiscussionPostCreation',
      'attemptDiscussionPostRemoval',
      'attemptDiscussionPostUpdate',
      'attemptDiscussionPostCommentCreation',
      'attemptDiscussionPostCommentRemoval',
      'attemptDiscussionPostCommentUpdate',
      'attemptDownloadForumAttachment',
      'attemptFeedbackResponsible',
      'fetchStudentProgress',
    ]),
    initialSetup(nextDiscussionId) {
      this.setFetching(true)
      this.$emit('change-header', {
        customClasses: { forum: true },
      })
      let promise = this.attemptDiscussionRetrieval({
        sessionUuid: this.sessionUuid,
        discussionId: nextDiscussionId || this.discussionId,
      })
      promise.then(({ data }) => {
        this.discussion = data
        this.getFeedback(data.id)
        this.discussion.highlight = data.likeStatistics.highlight
        this.discussion.discussionsPosts.map((post) => {
          this.formData.posts.push({
            comment: null,
            loading: false,
          })
          this.$set(post, 'editing', false)
          this.$set(post, 'openCommentTextField', false)
          post.comments.map((comment) => {
            this.$set(comment, 'editing', false)
            this.$set(comment, 'loading', false)
            return comment
          })
          return post
        })
      })
      promise.catch(({ response }) => {
        this.setFeedback({
          message: this.$t(
            `classroom.forum:feedback.access.error:${response.data.message.replace(/_/g, '.')}`
          ),
          type: 'error',
        })
        this.$router.push({
          name: 'classroom.forum',
          params: {
            session_uuid: this.sessionUuid,
          },
        })
      })
      promise.finally(() => {
        this.setFetching(false)
      })
    },
    editPost(post) {
      let lastPostEditing = this.discussion.discussionsPosts.find((post) => post.editing === true)
      if (lastPostEditing) {
        lastPostEditing.editing = false
      }
      post.editing = true
      this.formDataEditPost.comment = post.content
    },
    addPost() {
      this.$v.formData.comment.$touch()
      if (this.$v.formData.comment.$invalid) return
      this.formData.loading = true
      let promise = this.attemptDiscussionPostCreation({
        sessionUuid: this.sessionUuid,
        discussionId: this.discussionId,
        data: {
          content: this.formData.comment,
        },
      })
      promise
        .then(({ data }) => {
          data.editing = false
          this.discussion.discussionsPosts.push({ ...data, openCommentTextField: false })
          this.formData.posts.push({
            comment: null,
            loading: false,
          })
          this.$v.formData.comment.$reset()
          this.formData.comment = null
          this.formData.loading = false
          this.discussion.numPosts++
          this.$nextTick(() => {
            window.scroll({
              top: this.$refs.discussion.scrollHeight,
              behavior: 'smooth',
            })
          })
        })
        .catch(() => {
          this.formData.loading = false
          this.setFeedback({
            message: this.$t('classroom.forum:feedback.create.post.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.closeAllCommentTextFields()
          this.updateProgressBar()
        })
    },
    updatePost(post) {
      this.$v.formDataEditPost.comment.$touch()
      if (this.$v.formDataEditPost.comment.$invalid) return
      this.formDataEditPost.loading = true
      let promise = this.attemptDiscussionPostUpdate({
        sessionUuid: this.sessionUuid,
        discussionId: this.discussionId,
        discussionPostId: post.id,
        data: {
          content: this.formDataEditPost.comment,
        },
      })
      promise
        .then(({ data }) => {
          post.content = data.content
          post.editing = false
          this.$v.formDataEditPost.comment.$reset()
          this.formDataEditPost.comment = null
          this.formDataEditPost.loading = false
        })
        .catch(() => {
          this.formDataEditPost.loading = false
          this.setFeedback({
            message: this.$t('classroom.forum:feedback.update.post.error'),
            type: 'error',
          })
        })
    },
    scrollTopInputPost() {
      this.$refs.postArea.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    scrollTopInputCommit(index) {
      this.$refs[`postCommit${index}`][0].scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    handleClickCommit(index) {
      this.closeAllCommentTextFields()
      this.$set(this.discussion.discussionsPosts[index], 'openCommentTextField', true)
      this.$forceNextTick(() => {
        this.scrollTopInputCommit(index)
      })
    },
    closeAllCommentTextFields() {
      this.discussion.discussionsPosts.forEach((post) => {
        post.openCommentTextField = false
      })
    },
    addComment(post, postIndex) {
      this.$v.formData.posts.$each[postIndex].comment.$touch()
      if (this.$v.formData.posts.$each[postIndex].comment.$invalid) return
      this.formData.posts[postIndex].loading = true
      let promise = this.attemptDiscussionPostCommentCreation({
        sessionUuid: this.sessionUuid,
        discussionPostId: post.id,
        data: {
          content: this.formData.posts[postIndex].comment,
        },
      })
      promise
        .then(({ data }) => {
          data.editing = false
          post.comments.push(data)
          this.$v.formData.posts.$each[postIndex].comment.$reset()
          this.formData.posts[postIndex].comment = null
          this.formData.posts[postIndex].loading = false
          this.discussion.numComments++
        })
        .catch(() => {
          this.formData.posts[postIndex].loading = false
          this.setFeedback({
            message: this.$t('classroom.forum:feedback.create.comment.error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.updateProgressBar()
        })
    },
    updateComment(comment, newComment) {
      comment.loading = true
      let promise = this.attemptDiscussionPostCommentUpdate({
        sessionUuid: this.sessionUuid,
        commentId: comment.id,
        data: {
          content: newComment.content,
        },
      })

      promise
        .then(({ data }) => {
          comment.content = data.content
          comment.editing = false
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('classroom.forum:feedback.update.comment.error'),
            type: 'error',
          })
        })
        .finally(() => {
          comment.loading = false
        })
    },
    removePost(post) {
      let promise = this.attemptDiscussionPostRemoval({
        sessionUuid: this.sessionUuid,
        discussionId: this.discussionId,
        discussionPostId: post.id,
      })
      promise.then(() => {
        this.discussion.numPosts--
        post.excluded = true
      })
    },
    editComment(comment, postComments) {
      let lastCommentEditing = postComments.find((comment) => comment.editing === true)
      if (lastCommentEditing) {
        lastCommentEditing.editing = false
      }
      comment.editing = true
    },
    removeComment(comment) {
      let promise = this.attemptDiscussionPostCommentRemoval({
        sessionUuid: this.sessionUuid,
        commentId: comment.id,
      })
      promise.then(() => {
        this.discussion.numComments--
        comment.excluded = true
      })
    },
    editForum() {
      this.$router.push({
        name: 'classroom.forum.edit',
        params: {
          session_uuid: this.sessionUuid,
          id: this.discussionId,
        },
      })
    },
    removeForum() {
      this.setFetching(true)
      this.attemptDiscussionRemoval({
        sessionUuid: this.sessionUuid,
        discussionId: this.discussionId,
      })
        .then(() => {
          this.setFeedback({ message: this.$t('classroom.forum:feedback:removed') })
          this.back()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    back() {
      this.$router.push({
        name: 'classroom.forum',
        params: {
          session_uuid: this.sessionUuid,
        },
      })
    },
    openDeleteModalConfirm(type, elem) {
      this.modalDeleteConfirmActive = true
      this.deleteObj.type = type
      this.deleteObj.elem = elem
    },
    closeDeleteModalConfirm() {
      this.modalDeleteConfirmActive = false
    },
    confirmDelete() {
      this.closeDeleteModalConfirm()
      if (this.deleteObj.type === 'post') {
        this.removePost(this.deleteObj.elem)
      } else if (this.deleteObj.type === 'comment') {
        this.removeComment(this.deleteObj.elem)
      } else if (this.deleteObj.type === 'forum') {
        this.removeForum()
      }
    },
    visibilityFormChanged(isVisible) {
      this.formIsVisible = isVisible
    },
    getProfileName(profile) {
      return profile.alias === 'agent' ? profile.name : this.$t(`global:${profile.alias}`)
    },
    downloadAttachment() {
      const data = {
        discussionId: this.discussionId,
      }
      this.setFetching(true)
      this.attemptDownloadForumAttachment(data).finally(() => {
        this.setFetching(false)
      })
    },
    updateProgressBar: debounce(function () {
      if (this.isStudent()) {
        this.fetchStudentProgress(this.$route.params.session_uuid)
      }
    }, 1000),

    openMovePostModal(post) {
      this.$router.push({
        name: 'classroom.forum.discussion.move.post',
        params: {
          postId: post.id,
          forumId: this.discussion.forum.id,
          subTitle: this.discussion.title,
        },
      })
    },
    async getFeedback(id) {
      this.setFetching(true)
      await this.attemptFeedbackResponsible(id).then((response) => {
        if (response.data.feedback) {
          this.feedbackEvaluate = response.data
        }
      })
      this.setFetching(false)
    },

    openEvaluationForum() {
      const { session_uuid, id } = this.$route.params

      this.$router.push({
        name: 'classroom.forum.evaluation',
        params: { session_uuid: session_uuid, id: id },
      })
    },
    backAction() {
      if (this.$route.params.management) {
        this.$router.push({ name: this.$route.params.management })
        return
      }

      this.back()
    },
  },
}
</script>

<template>
  <div class="inner-content">
    <TopBar>
      <Action
        icon="keyboard_backspace"
        :text="backButtonLabel"
        icon-size="small"
        type="button"
        flat
        @click="backAction"
      />
    </TopBar>
    <div
      v-if="discussion.title"
      class="center forum-discussion-wrapper"
    >
      <div v-if="discussion.mandatory && isStudent()">
        <MandatoryContent
          :num-posts="discussion.meta.numPosts"
          :num-comments="discussion.meta.numComments"
          :check-post="discussion.meta.numPosts <= discussion.numPosts"
          :check-comments="discussion.meta.numComments <= discussion.numComments"
          :progress-posts="discussion.numPosts"
          :progress-comments="discussion.numComments"
          :feedback="feedbackEvaluate"
          :connective-or="discussion.meta.operator === 'or'"
          is-card
        />
      </div>

      <div
        ref="discussion"
        class="forum-discussion"
      >
        <div
          v-observe-visibility="visibilityFormChanged"
          class="forum-discussion-item"
        >
          <div class="forum-discussion-card">
            <div
              class="forum-discussion-header"
              :style="{ backgroundImage: backgroundImage }"
            >
              <div class="forum-discussion-options">
                <div class="forum-discussion-info">
                  <span class="forum-discussion-datetime">{{
                    formatDate(discussion.startTime, 'long')
                  }}</span>
                  <span
                    v-if="discussion.mandatory"
                    class="forum-discussion-label"
                    >{{ $t('classroom.forum:mandatory') }}</span
                  >
                </div>
                <Dropdown
                  v-if="notEqualsProfile('student') && canWrite('classroom:forum')"
                  icon="dots-vertical"
                  right
                >
                  <DropdownLink
                    :text="$t('global:edit')"
                    @click="editForum()"
                  />
                  <DropdownLink
                    v-if="isUserAllowedInContext('classroom:forum', 'remove')"
                    :text="$t('global:remove')"
                    @click="openDeleteModalConfirm('forum', null)"
                  />
                </Dropdown>
              </div>
              <div
                v-if="discussion.applicationUser"
                class="forum-discussion-user"
              >
                <div class="forum-discussion-user-image-wrapper">
                  <img
                    v-if="discussion.applicationUser.userData.image"
                    :src="discussion.applicationUser.userData.image"
                    :alt="discussion.applicationUser.userData.name"
                    class="forum-discussion-user-image"
                  />
                  <icon
                    v-else
                    name="account_circle"
                    class="forum-discussion-user-image-icon"
                  />
                </div>
                <TextReduce
                  :lenght-text="40"
                  :text="discussion.applicationUser.userData.name"
                  class-style="forum-discussion-user-name"
                />

                <span class="forum-discussion-user-position">{{
                  getProfileName(discussion.auditInsert.profile)
                }}</span>
              </div>
              <DiscussionStatusTag
                :status="status"
                :content="statusMessage"
              />
            </div>
            <div class="forum-discussion-content">
              <h2 class="forum-discussion-title">{{ discussion.title }}</h2>
              <div
                class="forum-discussion-text"
                v-html="discussion.content"
              ></div>
              <div
                v-if="discussion.likeStatistics.highlight.length"
                class="forum-likes-on-main-post"
              >
                <AvatarLikeInPost :users="currentForum.likeStatistics.highlight" />
                <p class="forum-likes-on-main-post__padding-left-first-label">
                  {{ $t('forum:modal.post.text.main.publication.1') }}
                </p>

                <TextReduce
                  text-type
                  :lenght-text="30"
                  :text="currentForum.likeStatistics.highlight[0].applicationUser.userData.name"
                  class-style="forum-likes-on-main-post__highlights forum-likes-on-main-post__padding-left-label"
                />

                <div
                  v-if="currentForum.likeStatistics.likes > 1"
                  class="forum-likes-on-main-post__likes-people forum-likes-on-main-post__padding-left-label"
                >
                  <p class="text-color">
                    {{
                      $tc(
                        'forum:modal.post.text.main.publication.2',
                        currentForum.likeStatistics.likes - 1
                      )
                    }}
                  </p>
                  <p class="forum-likes-on-main-post__highlights">
                    {{ currentForum.likeStatistics.likes - 1 }}
                  </p>
                  <p class="forum-likes-on-main-post__highlights">
                    {{
                      $tc(
                        'forum:modal.post.text.main.publication.3',
                        currentForum.likeStatistics.likes - 1
                      )
                    }}
                  </p>
                </div>
              </div>
              <div class="forum-discussion-actions-classroom">
                <div class="forum-discussion-actions-classroom__actions">
                  <Like
                    :is-show-label="true"
                    :disable-notify="true"
                    :dislike-active="false"
                    :stats="discussion.likeStatistics"
                    :entity-alias="'discussions'"
                    :entity-id="discussion.id"
                    :disabled="disableComments"
                    :post-main="true"
                  />
                  <Action
                    class="flex gap-1"
                    flat
                    type="button"
                    icon="forum"
                    :text="$t('forum:modal.post.submit')"
                    :disabled="disableComments"
                    @click="scrollTopInputPost()"
                  />
                  <Action
                    v-if="discussion.assets"
                    class="flex gap-1"
                    flat
                    type="button"
                    icon="download"
                    icon-size="medium"
                    :text="$t('global:download.attachment')"
                    @click="downloadAttachment()"
                  />
                </div>
                <div class="forum-discussion-actions-classroom__information">
                  <p class="forum-discussion-actions-classroom__highlights">
                    {{ currentForum.discussionsPosts.length }}
                  </p>
                  <p class="forum-discussion-actions-classroom__highlights">
                    {{
                      $tc('forum:modal.post.text.publication', currentForum.discussionsPosts.length)
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-if="discussion.discussionsPosts.length"
          class="forum-discussion-posts"
        >
          <h3 class="forum-discussion-posts-title">
            {{ $t('classroom.forum:posts.discussion.title') }}
          </h3>

          <DiscussionCard
            v-for="(post, postIndex) in discussion.discussionsPosts"
            :key="post.id"
            :post="post"
            :form-data-edit-post="formDataEditPost"
            :validation-edit-post="$v"
            :disable-comments="disableComments"
            :get-profile-name="getProfileName"
            :allow-delete-post="discussion.allowDeletePost"
            :allow-edit-post="discussion.allowEditPost"
            @edit="editPost($event)"
            @remove="openDeleteModalConfirm('post', $event)"
            @update="updatePost($event)"
            @move="openMovePostModal($event)"
            @handle-click-commit="handleClickCommit(postIndex)"
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
                @editing="editComment(comment, post.comments)"
                @update="updateComment(comment, $event)"
                @remove="openDeleteModalConfirm('comment', comment)"
              />
            </div>

            <div
              v-if="!disableComments"
              :ref="`postCommit${postIndex}`"
              class="forum-discussion-comment-title"
            >
              <div v-if="post.openCommentTextField">
                <h3 class="forum-discussion-posts-title">
                  {{ $t('forum:modal.title.commit') }}
                </h3>

                <PostingArea
                  :comment="true"
                  :validation="$v"
                  :form-data="formData"
                  :post="post"
                  :post-index="postIndex"
                  @handle-click-commit="addComment(post, postIndex)"
                />
              </div>
            </div>
          </DiscussionCard>
        </div>
        <div
          v-if="!disableComments"
          ref="postArea"
        >
          <h3 class="forum-discussion-posts-title">
            {{ $t('forum:modal.title.post') }}
          </h3>
        </div>
        <PostingArea
          v-if="!disableComments"
          :form-data="formData"
          :validation="$v"
          @handle-click-post="addPost()"
        />
      </div>
    </div>

    <modal
      :active.sync="modalDeleteConfirmActive"
      :cancel="false"
    >
      <div class="modal-confirm">
        <action
          type="button"
          icon="close"
          icon-size="medium"
          class="btn-close"
          @click="closeDeleteModalConfirm()"
        />
        <div class="modal-confirm-content">
          <h3 class="modal-confirm-title">
            {{ $t('classroom.forum:modal.confirm.delete.title') }}
          </h3>
          <div class="modal-confirm-description">
            <p v-if="deleteObj.type === 'forum'">
              {{ $t('classroom.forum:modal.confirm.delete.forum.description') }}
            </p>
            <p v-else>{{ $t('classroom.forum:modal.confirm.delete.comment.description') }}</p>
          </div>
        </div>
        <div class="modal-confirm-footer">
          <action
            type="button"
            :text="$t('global:confirm')"
            flat
            :dark="accessibility"
            @click="confirmDelete()"
          />
          <action
            type="button"
            :text="$t('global:cancel')"
            flat
            class="btn-cancel"
            :dark="accessibility"
            @click="closeDeleteModalConfirm()"
          />
        </div>
      </div>
    </modal>

    <RouterView @refresh-forum-discussion="initialSetup" />
  </div>
</template>
