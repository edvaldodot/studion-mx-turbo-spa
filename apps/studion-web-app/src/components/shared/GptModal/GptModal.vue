<script>
import Action from '@/components/general/Action'
import Icon from '@/components/general/Icon'
import Modal from '@/components/general/Modal'

import { defineComponent } from 'vue'
import { mapActions, mapState, mapGetters } from 'vuex'

export default defineComponent({
  name: 'GptModal',
  components: {
    Action,
    Icon,
    Modal,
  },
  data() {
    return {
      isOpen: false,
    }
  },
  computed: {
    ...mapState({
      user: (state) => state.Account.user,
    }),
    ...mapGetters(['getChatbotWindow']),
  },

  created() {
    const userId = this.Account.user.id
    this.localStorageState = this.getFromLocalStorage(`user-${userId}-chatbotModalNeedsToBeShown`)

    if (this.localStorageState !== null) {
      this.isOpen = this.localStorageState
    } else {
      this.isOpen = true
    }
      // Força a não exibição do modal do chatbot independentemente do estado anterior salvo no localStorage
    this.isOpen = false
  },
  methods: {
    ...mapActions(['toggleChatbotWindow']),
    closeModal(openChatbotWindow = false) {
      this.isOpen = false
      const userId = this.Account.user.id

      if (openChatbotWindow) {
        this.toggleChatbotWindow([false, openChatbotWindow])
      }
      this.saveToLocalStorage(`user-${userId}-chatbotModalNeedsToBeShown`, false)
    },
  },
})
</script>

<template>
  <Modal
    :data-testid="$testId('gpt-modal')"
    :active="isOpen"
    :cancel="false"
    outer-classes="gpt-modal"
    @close="closeModal(false)"
  >
    <div class="gpt-modal__container">
      <button
        class="gpt-modal__close-button"
        @click="closeModal(false)"
      >
        <Icon
          name="close"
          title="Close"
          wrapper
        />
      </button>
      <div class="gpt-modal__content">
        <div class="gpt-modal__icon-container">
          <img
            src="/assets/images/themes/default/bkg/dot-ia-person-modal.svg"
            width="182px"
            height="180px"
          />
        </div>
        <p class="gpt-modal__heading">{{ $t('chatbot.title') }}</p>
        <p class="gpt-modal__description">
          {{ $t('chatbot.description') }}
        </p>

        <div class="gpt-modal__button-container">
          <Action
            class="gpt-modal__button"
            :text="$t('chatbot.button')"
            accent
            medium
            secondary
            type="button"
            @click="closeModal(true)"
          />
        </div>
      </div>
    </div>
  </Modal>
</template>

<style lang="scss">
@import 'GptModal.scss';
</style>
