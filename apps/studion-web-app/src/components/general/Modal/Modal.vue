<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'
import Action from '../Action'

export default defineComponent({
  name: 'ModalBase',

  components: {
    Action,
  },

  props: {
    active: {
      type: Boolean,
      default: false,
    },
    cancel: {
      type: Boolean,
      default: true,
    },
    back: {
      type: Boolean,
      default: false,
    },
    withoutLabel: {
      type: Boolean,
      default: false,
    },
    isPage: {
      type: Boolean,
      default: false,
    },
    onlyCloseOneModal: {
      type: Boolean,
      default: false,
    },
    fillInnerModal: {
      type: Boolean,
      default: false,
    },
    outerClasses: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      zIndex: null,
      modalLength: 0,
      alreadyInBody: false,
    }
  },

  computed: {
    ...mapState(['accessibilityFontSize', 'Classroom']),
  },

  watch: {
    active() {
      this.appendModal()
      this.$nextTick(() => this.checkClass())
    },
  },

  mounted() {
    if (this.isPage) {
      this.appendModal()
      this.$nextTick(() => this.checkClass())
    }
  },

  destroyed() {
    if (this.$el.parentNode) {
      this.$el.parentNode.removeChild(this.$el)
    }
    this.checkClass()
  },

  methods: {
    appendModal() {
      if (!this.alreadyInBody) {
        this.alreadyInBody = true
        this.$nextTick(() => {
          document.body.appendChild(this.$el)
          this.modalLength = document.body.querySelectorAll('.modal-blocker').length
          this.zIndex = 100 + this.modalLength
        })
      }
    },

    closeModal() {
      if (this.onlyCloseOneModal) {
        return this.$emit('close')
      }
      if (this.$route.meta.modalCloseLink) {
        this.$emit('close')
        this.$router.push(this.$route.meta.modalCloseLink)
      } else {
        if (typeof this.$listeners.close === 'function') {
          this.$emit('close')
        } else {
          this.$emit('update:active', false)
        }
      }
    },

    checkEscape(event) {
      if (event.keyCode === 27) {
        this.closeModal()
      }
    },

    checkClass() {
      this.modalLength = document.body.querySelectorAll('.modal-blocker').length

      if (this.modalLength && !this.Classroom.onTutorial) {
        document.body.classList.add('modal-open')
        window.addEventListener('keydown', this.checkEscape)
      } else {
        document.body.classList.remove('modal-open')
        window.removeEventListener('keydown', this.checkEscape)
      }
    },
  },
})
</script>

<template>
  <div
    v-if="active"
    ref="modalContent"
    class="modal-blocker bg-black-50"
    :data-testid="$testId('modal-base')"
    :class="[
      outerClasses,
      {
        'font-size-1': accessibilityFontSize === 1,
        'font-size-2': accessibilityFontSize === 2,
      },
    ]"
    :style="{ 'z-index': zIndex }"
    tabindex="-1"
  >
    <div
      class="modal"
      :class="{ 'fill-inner-modal': fillInnerModal }"
    >
      <Action
        v-if="cancel"
        :text="withoutLabel ? '' : back ? $t('global:back') : $t('global:cancel')"
        icon="keyboard_backspace"
        class="btn-back text-color"
        icon-size="medium"
        type="button"
        @click="closeModal"
      />
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
@import 'Modal.scss';
</style>
