<script>
import { mapState, mapActions } from 'vuex'
import Button from '../Button'
import Icon from '../Icon'

export default {
  name: 'Toast',
  components: {
    Button,
    Icon,
  },
  data() {
    return {
      isActive: false,
      timer: null,
      elapsedTime: 0,
      oldFeedbackRandom: null,
      barSize: 0,
    }
  },
  computed: {
    ...mapState(['feedback']),
    random() {
      return this.feedback.random
    },
    feedbackTypeClass() {
      const toastTypesForClass = {
        error: '--error',
        warn: '--warn',
      }

      return toastTypesForClass[this.feedback.type]
    },
  },
  watch: {
    isActive() {
      this.showToast()
    },
    random() {
      this.isActive = false
      this.$nextTick(() => {
        this.isActive = true
      })
    },
  },
  methods: {
    ...mapActions(['setFeedback']),
    showToast() {
      this.checkToastId()
      if (this.isActive) {
        this.timer = setInterval(() => {
          this.setBarSize()
          this.elapsedTime += 100

          if (this.feedback.abortToastRule) {
            this.feedback.abortToastRule() && this.close()
          }

          if (this.elapsedTime > this.feedback.duration) {
            if (this.feedback.postAction) {
              this.feedback.postAction()
            }
            this.close()
          }
        }, 100)
      }
    },
    checkToastId() {
      if (this.feedback.random !== this.oldFeedbackRandom) this.elapsedTime = 0
      clearInterval(this.timer)
      this.oldFeedbackRandom = this.feedback.random
    },
    setBarSize() {
      this.barSize = (100 * this.elapsedTime) / this.feedback.duration
    },
    close() {
      this.isActive = false
      this.elapsedTime = 0
    },
    pauseTimer() {
      return clearInterval(this.timer)
    },
    resumeTimer() {
      return this.showToast()
    },
  },
}
</script>

<template>
  <Transition name="toast">
    <div
      v-if="isActive"
      :class="[
        'alert-toast',
        {
          '--top': $isEnabledFeature('chatbot'),
        },
        feedbackTypeClass,
      ]"
      @mouseenter="pauseTimer"
      @mouseleave="resumeTimer"
    >
      <div class="alert-toast__wrapper flex-1">
        <div class="alert-toast__body">
          <span
            v-if="feedback.title"
            class="alert-toast__title"
          >
            <Icon
              v-if="feedback.icon"
              :name="feedback.icon"
              pack="material"
            />
            {{ feedback.title }}
          </span>
          <div
            v-if="feedback.message"
            class="alert-toast__message"
            v-html="feedback.message"
          />
        </div>
        <div
          v-if="feedback.detail"
          class="alert-toast__action"
        >
          <Button @click="feedback.detail()">
            {{ feedback.detailText || $t('global:details') }}
          </Button>
        </div>
      </div>
      <div class="alert-toast__close">
        <Button
          variant="icon"
          icon="close"
          class="alert-toast__btn-close"
          @click="close()"
        />
        <svg
          width="250"
          height="250"
          viewBox="0 0 250 250"
          class="alert-toast__progress"
          :style="`--progress: ${barSize}`"
        >
          <circle class="fg"></circle>
        </svg>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss">
@import 'Toast.scss';
</style>
