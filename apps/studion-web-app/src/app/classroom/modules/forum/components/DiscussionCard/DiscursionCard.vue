<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'

import Like from '@/components/general/Like'
import Dropdown from '@/components/general/Dropdown'
import TextEditor from '@/components/general/TextEditor'
import Action from '@/components/general/Action'
import Loading from '@/components/general/Loading'
import Icon from '@/components/general/Icon'
import DropdownLinkTooltip from '@/components/shared/DropdownLinkTooltip'
import DropdownLink from '@/components/general/DropdownLink'
import TextReduce from '@/components/general/TextReduce'

export default defineComponent({
  name: 'DiscussionCard',
  components: {
    Like,
    Dropdown,
    TextEditor,
    Action,
    Loading,
    Icon,
    DropdownLinkTooltip,
    DropdownLink,
    TextReduce,
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
    formDataEditPost: {
      type: Object,
      default: () => ({}),
    },
    validationEditPost: {
      type: Object,
      default: () => ({}),
    },
    disableComments: {
      type: Boolean,
      required: true,
    },
    hideOptions: {
      type: Boolean,
      default: false,
    },
    disableLike: {
      type: Boolean,
      default: false,
    },
    getProfileName: {
      type: Function,
      required: true,
    },
    allowEditPost: {
      type: Boolean,
      default: false,
    },
    allowDeletePost: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(['accessibility']),
  },
  methods: {
    canEditOrRemove(type) {
      if (type === 'edit') {
        return this.allowEditPost || this.post.comments.length === 0
      }
      return this.allowDeletePost || this.post.comments.length === 0
    },

    handleClickCommit() {
      this.$emit('handle-click-commit')
    },

    canRemovePost() {
      if (this.equalsProfile('student')) {
        return !this.disableComments
      }

      return this.isUserAllowedInContext('classroom:forum', 'remove')
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('forum-discussion-card')"
    class="forum-discussion-card"
  >
    <div
      class="forum-discussion-item"
      :class="{ 'is-excluded': post.excluded }"
    >
      <div class="forum-discussion-options">
        <span class="forum-discussion-datetime">{{ formatDate(post.auditInsert.dh, 'long') }}</span>
        <template v-if="!hideOptions">
          <Dropdown
            v-if="
              !post.excluded &&
              ((notEqualsProfile('student') && canWrite('classroom:forum')) ||
                (Account.user.id === post.applicationUser.id && !disableComments))
            "
            icon="dots-vertical"
            right
          >
            <DropdownLinkTooltip
              v-if="!disableComments && Account.user.id === post.applicationUser.id"
              :dropdown-props="{
                text: $t('global:edit'),
                disabled: !canEditOrRemove('edit'),
              }"
              :tooltip="{
                condition: !canEditOrRemove('edit'),
                text:
                  post.comments.length === 0
                    ? $t('classroom.forum.options:action_not_allowed')
                    : $t('classroom.forum.options:action_not_edit.comments'),
                props: { uppercase: false },
              }"
              @click="$emit('edit', post)"
            />
            <DropdownLinkTooltip
              v-if="canRemovePost()"
              :dropdown-props="{
                text: $t('global:remove'),
                disabled: !canEditOrRemove(),
              }"
              :tooltip="{
                condition: !canEditOrRemove(),
                text:
                  post.comments.length === 0
                    ? $t('classroom.forum.options:action_not_allowed')
                    : $t('classroom.forum.options:action_not_remove.comments'),
                props: { uppercase: false },
              }"
              @click="$emit('remove', post)"
            />
            <DropdownLink
              v-if="notEqualsProfile('student')"
              :text="$t('global:move')"
              @click="$emit('move', post)"
            />
          </Dropdown>
        </template>
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
            <Icon
              v-else
              name="account_circle"
              class="forum-discussion-user-image-icon"
            />
          </div>
          <TextReduce
            text-type
            :lenght-text="30"
            :text="post.applicationUser.userData.name"
            class-style="forum-discussion-user-name"
          />
          <span class="forum-discussion-user-position">{{
            getProfileName(post.auditInsert.profile)
          }}</span>
        </div>
        <div class="forum-discussion-content-message">
          <template v-if="post.excluded">
            <icon name="alert-circle"></icon>
            <p class="text-color">{{ $t('classroom.forum:message.excluded') }}</p>
          </template>
          <div
            v-if="!post.editing && !post.excluded"
            v-html="post.content"
          ></div>
        </div>
        <Form
          v-if="post.editing && !disableComments"
          @submit.prevent="$emit('update', post)"
        >
          <div class="forum-discussion-post-form-edit">
            <TextEditor
              v-model="formDataEditPost.comment"
              :label="$t('classroom.forum:leave.comment')"
              :floating-label="false"
              :validation="validationEditPost.formDataEditPost.comment"
              :disabled="formDataEditPost.loading"
            />
          </div>
          <div class="forum-discussion-form__button-mobile">
            <action
              v-if="!formDataEditPost.loading"
              slot="button"
              type="button"
              primary
              medium
              :text="$t('forum:modal.post.submit')"
              submit
              :dark="accessibility"
            />
            <loading
              v-else
              slot="button"
            ></loading>
          </div>
        </Form>
        <div
          v-if="!post.excluded"
          class="forum-discussion-actions-classroom"
        >
          <div class="forum-discussion-actions-classroom__actions">
            <like
              :is-show-label="true"
              :dislike-active="false"
              :stats="post.likeStatistics"
              :entity-alias="'discussions-posts'"
              :entity-id="post.id"
              :disabled="disableComments || disableLike"
            />
            <Action
              class="flex gap-1"
              flat
              type="button"
              icon="forum"
              :text="$t('forum:modal.commit.submit')"
              :disabled="disableComments"
              @click="handleClickCommit"
            />
          </div>
          <div class="forum-discussion-actions-classroom__information">
            <p class="forum-discussion-actions-classroom__highlights">
              {{ post.comments.length }}
            </p>
            <p class="forum-discussion-actions-classroom__highlights">
              {{ $tc('forum:modal.post.text.commit', post.comments.length) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <slot></slot>
  </div>
</template>
