<script>
import { mapState } from 'vuex'

import Icon from '@/components/general/Icon'
import TextEditor from '@/components/general/TextEditor'

export default {
  name: 'CommentForm',
  components: {
    Icon,
    TextEditor,
  },

  props: {
    label: {
      type: String,
      default: null,
    },
    counter: {
      type: Number,
      default: null,
    },
    value: {
      type: String,
      default: null,
    },
    validation: {
      type: Object,
      default: () => ({}),
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      comment: this.value,
    }
  },

  computed: {
    ...mapState(['Account']),
  },

  watch: {
    value() {
      this.comment = this.value
    },
    comment() {
      this.$emit('input', this.comment)
    },
  },
}
</script>

<template>
  <div class="comment-form">
    <div class="comment-form-user">
      <img
        v-if="Account.user.profile_image"
        :src="Account.user.profile_image"
        :alt="Account.user.name"
        class="comment-form-user-image"
      />

      <Icon
        v-else
        name="account_circle"
        class="comment-form-user-icon"
      />
    </div>

    <TextEditor
      v-model="comment"
      :label="label"
      :validation="validation"
      :disabled="disabled"
      :counter="counter"
      :formats="['libras']"
      auto-grow
      bubble
      libras
      hide-tools
    />

    <slot />
  </div>
</template>

<style lang="scss">
@import 'CommentForm.scss';
</style>
