<script>
import { mapState } from 'vuex'
import { defineComponent } from 'vue'
import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'

const Loading = () => import('@/components/general/Loading')
const TextEditor = () => import('@/components/general/TextEditor')

export default defineComponent({
  name: 'PostingArea',
  components: {
    Action,
    Icon,
    Loading,
    TextEditor,
  },
  props: {
    formData: {
      type: Object,
      required: true,
    },
    post: {
      type: Object,
      default: () => ({}),
    },
    postIndex: {
      type: Number,
      default: null,
    },
    comment: {
      type: Boolean,
      default: false,
    },
    validation: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState(['Account', 'accessibility']),
    profileImage() {
      return this.Account.user.profile_image ? this.Account.user.profile_image : null
    },
  },
  methods: {
    handleClickPost() {
      this.$emit('handle-click-post')
    },

    handleClickCommit() {
      this.$emit('handle-click-commit')
    },
  },
})
</script>

<template>
  <div
    class="modal-add-post-forum"
    :data-testid="$testId('posting-area')"
  >
    <form
      v-if="!comment"
      class="forum-discussion-form"
      @submit.prevent="handleClickPost"
    >
      <div class="forum-discussion-form-image-wrapper">
        <img
          v-if="profileImage"
          :src="profileImage"
          :alt="Account.user.data.name"
          class="forum-discussion-form-image"
        />
        <Icon
          v-else
          name="account_circle"
          class="forum-discussion-form-image-icon"
        />
      </div>
      <TextEditor
        v-model="formData.comment"
        :label="$t('classroom.forum:leave.posts')"
        :floating-label="false"
        :validation="validation.formData.comment"
        :disabled="formData.loading"
      />
      <div class="forum-discussion-form__button-mobile">
        <Action
          v-if="!formData.loading"
          slot="button"
          type="button"
          primary
          medium
          :text="$t('forum:modal.post.submit')"
          submit
          :dark="accessibility"
        />
        <Loading
          v-else
          slot="button"
        />
      </div>
    </form>

    <form
      v-else
      class="forum-discussion-form"
      @submit.prevent="handleClickCommit(post, postIndex)"
    >
      <div class="forum-discussion-form-image-wrapper">
        <img
          v-if="profileImage"
          :src="profileImage"
          :alt="Account.user.data.name"
          class="forum-discussion-form-image"
        />
        <Icon
          v-else
          name="account_circle"
          class="forum-discussion-form-image-icon"
        />
      </div>
      <TextEditor
        v-model="formData.posts[postIndex].comment"
        :label="$t('classroom.forum:leave.comment')"
        :floating-label="false"
        :validation="validation.formData.posts.$each[postIndex].comment"
        :disabled="formData.posts[postIndex].loading"
      />
      <div class="forum-discussion-form__button-mobile-commit">
        <div>
          <Action
            v-if="!formData.posts[postIndex].loading"
            slot="button"
            type="button"
            primary
            medium
            :text="$t('forum:modal.commit.submit')"
            submit
          />
          <Loading
            v-else
            slot="button"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<style lang="scss">
@import 'PostingArea.scss';
</style>
