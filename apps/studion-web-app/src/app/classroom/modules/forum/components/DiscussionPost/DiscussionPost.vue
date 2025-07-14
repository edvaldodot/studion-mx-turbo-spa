<script>
import DiscussionComment from './DiscussionComment'
export default {
  name: 'DiscussionPost',
  components: { DiscussionComment },
}
</script>

<template>
  <div
    v-if="discussion.discussionsPosts.length"
    class="forum-discussion-posts"
  >
    <h3 class="forum-discussion-posts-title">{{ $t('classroom.forum:posts.title') }}</h3>
    <div
      v-for="(post, postIndex) in discussion.discussionsPosts"
      :key="`post-${postIndex}`"
      class="forum-discussion-card"
    >
      <div
        class="forum-discussion-item"
        :class="{ 'is-excluded': post.excluded }"
      >
        <div class="forum-discussion-options">
          <span class="forum-discussion-datetime">{{
            format(post.createdAt, "dd/MM/yyyy 'às' HH:mm")
          }}</span>
          <dropdown
            v-if="
              !post.excluded &&
              ((notEqualsProfile('student') && canWrite('classroom:forum')) ||
                (Account.user.id === post.applicationUser.id && !disableComments))
            "
            icon="dots-vertical"
            right
          >
            <dropdown-link
              v-if="!disableComments && Account.user.id === post.applicationUser.id"
              :text="$t('global:edit')"
              @click="editPost(post)"
            />
            <dropdown-link
              v-if="!disableComments || notEqualsProfile('student')"
              :text="$t('global:remove')"
              @click="openDeleteModalConfirm('post', post)"
            />
          </dropdown>
        </div>
        <div class="forum-discussion-content">
          <div
            v-if="post.applicationUser"
            class="forum-discussion-user"
          >
            <div class="forum-discussion-user-image-wrapper">
              <img
                v-if="post.applicationUser.userData.image"
                :src="post.applicationUser.userData.image"
                :alt="post.applicationUser.userData.name"
                class="forum-discussion-user-image"
              />
              <icon
                v-else
                name="account_circle"
                class="forum-discussion-user-image-icon"
              />
            </div>
            <span class="forum-discussion-user-name">{{ post.applicationUser.userData.name }}</span>
            <span class="forum-discussion-user-position">{{
              getProfileName(post.auditInsert.profile)
            }}</span>
          </div>
          <div class="forum-discussion-content-message">
            <template v-if="post.excluded">
              <icon name="alert-circle" />
              <p class="text-color">{{ $t('classroom.forum:message.excluded') }}</p>
            </template>
            <div
              v-if="!post.editing && !post.excluded"
              v-html="post.content"
            ></div>
          </div>
          <form
            v-if="post.editing && !disableComments"
            class="forum-discussion-form-edit"
            @submit.prevent="updatePost(post)"
          >
            <TextEditor
              v-model="formDataEditPost.comment"
              :label="$t('classroom.forum:leave.comment')"
              :floating-label="false"
              :validation="$v.formDataEditPost.comment"
              :disabled="formDataEditPost.loading"
            >
              <action
                v-if="!formDataEditPost.loading"
                slot="button"
                type="button"
                icon="send"
                submit
                :dark="accessibility"
              />
              <loading
                v-else
                slot="button"
              />
            </TextEditor>
          </form>
          <div
            v-if="!post.excluded"
            class="forum-discussion-actions"
          >
            <like
              :dislike-active="false"
              :stats="post.likeStatistics"
              :entity-alias="'discussions-posts'"
              :entity-id="post.id"
              :disabled="disableComments"
            ></like>
          </div>
        </div>
      </div>
      <div
        v-if="post.comments && post.comments.length"
        class="forum-discussion-comment-list"
      >
        <discussion-comment
          v-for="(comment, commentIndex) in post.comments"
          :key="`post-comment-${commentIndex}`"
        />
      </div>
      <form
        v-if="!disableComments"
        class="forum-discussion-form"
        @submit.prevent="addComment(post, postIndex)"
      >
        <div class="forum-discussion-form-image-wrapper">
          <img
            v-if="profileImage"
            :src="profileImage"
            :alt="Account.user.data.name"
            class="forum-discussion-form-image"
          />
          <icon
            v-else
            name="account_circle"
            class="forum-discussion-form-image-icon"
          />
        </div>
        <TextEditor
          v-model="formData.posts[postIndex].comment"
          :floating-label="false"
          :label="$t('classroom.forum:answer.comment')"
          :validation="$v.formData.posts.$each[postIndex].comment"
          :disabled="formData.posts[postIndex].loading"
        >
          <action
            v-if="!formData.posts[postIndex].loading"
            slot="button"
            type="button"
            icon="send"
            submit
          />
          <loading
            v-else
            slot="button"
          />
        </TextEditor>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
