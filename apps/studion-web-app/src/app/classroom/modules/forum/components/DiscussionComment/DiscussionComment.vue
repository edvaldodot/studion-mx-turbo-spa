<script>
import { mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import { format } from 'date-fns'

export default {
  name: 'DiscussionComment',
  components: {
    Action: () => import('@/components/general/Action'),
    Dropdown: () => import('@/components/general/Dropdown'),
    DropdownLink: () => import('@/components/general/DropdownLink'),
    Icon: () => import('@/components/general/Icon'),
    Like: () => import('@/components/general/Like'),
    Loading: () => import('@/components/general/Loading'),
    TextEditor: () => import('@/components/general/TextEditor'),
    TextReduce: () => import('@/components/general/TextReduce'),
  },
  props: {
    id: Number,
    applicationUser: Object,
    auditInsert: Object,
    content: String,
    likeStatistics: Object,
    excluded: {
      type: Boolean,
      default: false,
    },
    editing: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    hideOptions: {
      type: Boolean,
      default: false,
    },
    disableLike: {
      type: Boolean,
      default: false,
    },
  },
  validations: {
    formDataEditComment: {
      comment: {
        required,
      },
    },
  },
  data() {
    return {
      formDataEditComment: {
        comment: null,
      },
      formIsVisible: false,
      format: format,
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility']),
    imOwner() {
      return this.Account.user.id === this.applicationUser.id
    },
  },
  watch: {
    editing(val) {
      if (val === false) {
        this.formDataEditComment.comment = null
        this.$v.formDataEditComment.comment.$reset()
      }
    },
  },
  methods: {
    update() {
      this.$v.formDataEditComment.comment.$touch()
      if (this.$v.formDataEditComment.comment.$invalid) return

      let commentEdited = { ...this.$props }
      commentEdited.content = this.formDataEditComment.comment
      this.$emit('update', commentEdited)
    },
    edit() {
      this.formDataEditComment.comment = this.content
      this.$emit('editing')
    },
    remove() {
      this.$emit('remove')
    },
    getProfileName(profile) {
      return profile.alias === 'agent' ? profile.name : this.$t(`global:${profile.alias}`)
    },
  },
}
</script>

<template>
  <div
    class="forum-discussion-item forum-discussion-comment"
    :class="{ 'is-excluded': excluded }"
  >
    <div class="forum-discussion-options">
      <span class="forum-discussion-datetime">{{ formatDate(auditInsert.dh, 'long') }}</span>
      <Dropdown
        v-if="
          !excluded && ((notEqualsProfile('student') && canWrite('classroom:forum')) || imOwner)
        "
        icon="dots-vertical"
        right
      >
        <DropdownLink
          v-if="imOwner"
          :text="$t('global:edit')"
          @click="edit"
        />
        <DropdownLink
          :text="$t('global:remove')"
          @click="remove"
        />
      </Dropdown>
    </div>

    <div class="forum-discussion-content">
      <div
        v-if="applicationUser"
        class="forum-discussion-user"
      >
        <div class="forum-discussion-user-image-wrapper">
          <img
            v-if="applicationUser.userData.image"
            :src="applicationUser.userData.image"
            :alt="applicationUser.userData.name"
            class="forum-discussion-user-image"
          />
          <Icon
            v-else
            name="account_circle"
            class="forum-discussion-user-image-icon"
          ></Icon>
        </div>
        <TextReduce
          text-type
          :lenght-text="30"
          :text="applicationUser.userData.name"
          class-style="forum-discussion-user-name"
        />
        <span class="forum-discussion-user-position">{{
          getProfileName(auditInsert.profile)
        }}</span>
      </div>
      <div class="forum-discussion-content-message">
        <template v-if="excluded">
          <Icon name="alert-circle"></Icon>
          <p class="text-color">{{ $t('classroom.forum:message.excluded') }}</p>
        </template>
        <div
          v-if="!editing && !excluded"
          v-html="content"
        ></div>
      </div>

      <form
        v-if="editing"
        @submit.prevent="update"
      >
        <div class="forum-discussion-post-form-edit">
          <TextEditor
            v-model="formDataEditComment.comment"
            :label="$t('classroom.forum:leave.comment')"
            :floating-label="false"
            :validation="$v.formDataEditComment.comment"
            :disabled="loading"
          />
        </div>
        <div class="forum-discussion-form-edit__button-mobile">
          <Action
            v-if="!loading"
            slot="button"
            type="button"
            primary
            medium
            :text="$t('forum:modal.commit.submit')"
            submit
          ></Action>
          <Loading
            v-else
            slot="button"
          ></Loading>
        </div>
      </form>

      <div
        v-if="!excluded"
        class="forum-discussion-actions"
      >
        <Like
          :is-show-label="true"
          :dislike-active="false"
          :stats="likeStatistics"
          :entity-alias="'discussions-posts-comments'"
          :entity-id="id"
          :disabled="disableLike"
        />
      </div>
    </div>
  </div>
</template>
