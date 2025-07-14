<script>
import Checkbox from '@/components/general/Checkbox'
import Icon from '@/components/general/Icon'
import Modal from '@/components/general/Modal'
import { defineComponent } from 'vue'
import { mapActions, mapGetters, mapState } from 'vuex'
import { repositionElement } from '@/support/utils/repositionOverlappingElements'
import InlineSvg from 'vue-inline-svg'

import gptButtonMixin from './gptButtonMixin'

const { VUE_APP_IFRAME_URL_CHATBASE, VUE_APP_IFRAME_URL_DOT_AI } = process.env

export default defineComponent({
  name: 'FloatGptButton',
  components: {
    Checkbox,
    Icon,
    Modal,
    InlineSvg,
  },
  mixins: [gptButtonMixin],
  data() {
    return {
      isExplanationModalOpen: false,
      showTip: false,
      dismissTip: false,
      defaultDistance: {
        right: 20,
        bottom: 15,
      },
      chatOffset: {
        right: 0,
        bottom: -53,
      },
      buttonPositionStyle: {},
      chatPositionStyle: {},
    }
  },
  computed: {
    ...mapGetters(['getChatbotWindow', 'isFetching']),
    ...mapState(['chatbot', 'menuOpen', 'Classroom']),
    getChatLink() {
      const url = this.isDotAIEnabled ? VUE_APP_IFRAME_URL_DOT_AI : VUE_APP_IFRAME_URL_CHATBASE

      return url + this.getChatbotEnv + '?origin=' + encodeURIComponent(window.location.origin)
    },
    isZendeskEnabled() {
      return this.$isEnabledFeature('chatbot')
    },
    isInAuthPages() {
      const currentLocation = this.$route.path
      const regex = /\/auth\/*/

      const isUserInAuthPages = regex.test(currentLocation)
      return isUserInAuthPages
    },
    getTipHeading() {
      return this.$t(this.getAITutorCode ? 'chatbot.tip.title' : 'chatbot.tip.ia.questions')
    },
    getTipDescription() {
      return this.$t(this.getAITutorCode ? 'chatbot.tip.description' : 'chatbot.tip.ia.description')
    },
    showTipHeading() {
      return (this.isUserInClassroom && this.getAITutorCode) || !this.getAITutorCode
    },
    showTipAIElements() {
      return this.isUserInClassroom && this.getAITutorCode && this.Classroom.onTutorial
    },
  },
  watch: {
    'chatbot.updatePosition': function (newValue) {
      if (newValue) {
        this.updateButtonPosition()
        this.updateChatbotPosition(false)
      }
    },
    menuOpen: function (newValue) {
      if (newValue) {
        this.updateButtonPosition()
      }
    },
  },
  mounted() {
    this.buttonPositionStyle = {
      right: `${this.defaultDistance.right}px`,
      bottom: `${this.defaultDistance.bottom}px`,
    }

    this.chatPositionStyle = {
      right: `${this.defaultDistance.right + this.chatOffset.right}px`,
      bottom: `${this.defaultDistance.bottom - this.chatOffset.bottom}px`,
    }

    window.addEventListener('scroll', this.updateButtonPosition)
    window.addEventListener('resize', this.updateButtonPosition)
    this.updateButtonPosition()
    this.openTutorialHandler()
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.updateButtonPosition)
    window.removeEventListener('resize', this.updateButtonPosition)
  },
  methods: {
    ...mapActions(['toggleChatbotWindow', 'updateChatbotPosition']),

    handleClickChatBotIcon() {
      if (this.showTip) this.handleCloseTip()

      if (this.isInAuthPages) {
        this.toggleExplanationModal()
      }

      this.toggleChatbotWindow([false, !this.getChatbotWindow.isOpen])
    },

    handleCloseChatBot() {
      this.toggleChatbotWindow([false, false])
    },

    handleCloseTip() {
      if (this.dismissTip) {
        this.saveToLocalStorage('prevent-chatbot-ia-alert', true)
      }
      this.showTip = false
      this.toggleChatbotWindow([false, false])
    },

    toggleExplanationModal() {
      this.isExplanationModalOpen = !this.isExplanationModalOpen
    },
    updateButtonPosition() {
      if (!this.$el.children.length) return
      const newPosition = repositionElement(this.$el.children[0])

      this.buttonPositionStyle = newPosition
      this.chatPositionStyle = {
        ...this.chatPositionStyle,
        ...(newPosition.right && {
          right: `${parseInt(newPosition.right) + this.chatOffset.right}px`,
        }),
        ...(newPosition.bottom && {
          bottom: `${parseInt(newPosition.bottom) - this.chatOffset.bottom}px`,
        }),
      }
    },
    openTutorialHandler() {
      const preventTip = this.getFromLocalStorage('prevent-chatbot-ia-alert')
      if (!preventTip) this.showTip = true
    },
  },
})
</script>

<template>
  <div
    v-show="!Classroom.floatingNotes.active"
    class="float-gpt-button"
    :data-testid="$testId('float-gpt-button')"
  >
    <!-- WIDGET DE TIP -->
    <div
      v-if="!($media.mobile && $route.name === 'classroom.lessons.course.type')"
      class="float-button__button cursor-pointer"
      :class="{ 'float-button__button-position': isZendeskEnabled }"
      :style="buttonPositionStyle"
      @click.self="handleClickChatBotIcon"
    >
      <div class="icon w-5rem h-5rem">
        <InlineSvg
          class="icon-gpt"
          width="100%"
          height="100%"
          src="/assets/images/svg/icons/icon_chatbot.svg"
        />
      </div>

      <div
        v-if="canShowTip"
        class="float-gpt-button-tip"
      >
        <template v-if="showTipHeading">
          <h3>{{ getTipHeading }}</h3>
          <p v-html="getTipDescription"></p>
        </template>
        <Checkbox
          v-if="showTipAIElements"
          v-model="dismissTip"
          :items="[{ value: true, label: $t('chatbot.tip.checkbox') }]"
        />
        <Icon
          name="close"
          wrapper
          @click="handleCloseTip"
        />
      </div>
    </div>

    <!-- MODAL EM FORMATO DE JANELA -->
    <Modal
      v-if="getChatbotWindow.isOpen && getChatbotWindow.insideModal"
      :data-testid="$testId('gpt-modal')"
      :active="getChatbotWindow.isOpen"
      :cancel="false"
      @close="handleCloseChatBot"
    >
      <button
        class="gpt-modal__close-button"
        @click="handleCloseChatBot"
      >
        <Icon
          name="close"
          title="Close"
          wrapper
        />
      </button>
      <iframe
        :src="getChatLink"
        class="float-button__chat-iframe"
        frameborder="0"
      ></iframe>
    </Modal>

    <!-- MODAL DE EXPLICAÇÃO DA AI -->
    <Modal
      :data-testid="$testId('gpt-login-modal')"
      :active="isExplanationModalOpen"
      :cancel="false"
      @close="toggleExplanationModal"
    >
      <div class="gpt-modal__container">
        <button
          class="gpt-modal__close-button"
          @click="toggleExplanationModal"
        >
          <Icon
            name="close"
            title="Close"
            wrapper
          />
        </button>
        <div class="gpt-modal__content">
          <div class="gpt-modal__icon-container">
            <Icon
              name="chatbot"
              title="Chatbot"
              class="gpt-modal__chatbot-icon"
              wrapper
            />
          </div>
          <p class="gpt-modal__heading">{{ $t('chatbot.title') }}</p>
          <p class="gpt-modal__description">
            {{ $t('chatbot.description') }}
          </p>
        </div>
      </div>
    </Modal>

    <!-- MODAL EM FORMATO DE WIDGET LATERAL -->
    <div
      v-if="getChatbotWindow.isOpen && !getChatbotWindow.insideModal && !isInAuthPages"
      class="float-button__chat-content"
      :style="chatPositionStyle"
      :class="{ 'float-button__chat-content-position': isZendeskEnabled }"
    >
      <button
        class="float-button__close-button"
        @click="handleClickChatBotIcon"
      >
        <Icon
          name="close"
          title="Close"
          wrapper
        />
      </button>
      <iframe
        :src="getChatLink"
        class="float-button__chat-iframe"
        frameborder="0"
      ></iframe>
    </div>
  </div>
</template>

<style lang="scss">
@import 'FloatGptButton.scss';
@import '~@/components/shared/GptModal/GptModal.scss';
</style>
