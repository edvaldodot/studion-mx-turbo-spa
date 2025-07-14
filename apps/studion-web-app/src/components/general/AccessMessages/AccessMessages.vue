<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'

import Icon from '../Icon'
import Action from '../Action'
import Modal from '../Modal'

export default defineComponent({
  components: {
    Icon,
    Action,
    Modal,
  },
  data() {
    return {
      showAccessMessagesModal: false,
      accessMessages: {
        id: null,
        title: null,
        message: null,
      },
    }
  },
  computed: {
    ...mapState({
      user: (state) => state.Account.user,
    }),
  },
  created() {
    this.showAccessMessagesModal = false

    if (this.user.metaStatus !== 'completed') return

    if (this.equalsProfile('student') && this.user.accessMessages.length > 0) {
      this.accessMessages = this.user.accessMessages[0]
      this.showAccessMessagesModal = true
    }
  },
  methods: {
    ...mapActions(['bindUserToAccessMessage']),
    confirm() {
      if (this.$isUserImpersonated()) {
        this.showAccessMessagesModal = false
        return
      }

      this.bindUserToAccessMessage(this.accessMessages.id)
        .then(() => {
          this.showAccessMessagesModal = false
        })
        .catch((err) => {
          if (err.response && err.response.data.message === 'already_confirmed') {
            this.showAccessMessagesModal = false
          }
        })
    },
  },
})
</script>

<template>
  <Modal
    v-if="showAccessMessagesModal"
    active
    class="access-messages"
    :cancel="false"
  >
    <div class="access-messages-content">
      <div
        v-if="accessMessages.type !== 'image' && accessMessages.title"
        class="access-messages-header text-color"
      >
        <Icon
          name="celebration"
          class="text-color text-5xl icon-fill-1"
          pack="material"
        />
        <h3>{{ accessMessages.title }}</h3>
      </div>

      <div class="access-message text-color">
        <template v-if="user.data && accessMessages.type === 'message'">
          <h1>{{ $t('dashboard:header.title', { name: user.data.name }) }}</h1>
          <div v-html="accessMessages.message"></div>
        </template>

        <img
          v-else
          class="access-message__image"
          :src="accessMessages.file"
          :alt="accessMessages.title"
          :title="accessMessages.title"
        />

        <Action
          type="button"
          large
          secondary
          :text="$t('global:continue')"
          @click="confirm"
        />
      </div>
    </div>
  </Modal>
</template>

<style lang="scss">
@import 'AccessMessages.scss';
</style>
