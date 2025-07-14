<script>
import { defineComponent } from 'vue'
import Icon from '../Icon'

export default defineComponent({
  name: 'AccordionItem',

  components: {
    Icon,
    Loading: () => import('../Loading'),
  },

  props: {
    title: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      default: null,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isOpen: false,
    }
  },

  watch: {
    disabled(_, newValue) {
      if (!newValue) {
        this.isOpen = newValue
      }
    },
  },

  updated() {
    if (this.$refs.content) {
      this.$refs.content.style.height = this.$refs.content.scrollHeight + 1 + 'px'
    }
  },

  methods: {
    open() {
      if (!this.disabled) {
        this.$emit('open', this)
        this.openContent()
      }
    },

    openContent() {
      this.$nextTick(function () {
        if (this.content || (this.$slots.content && this.$slots.content.length)) {
          this.isOpen = !this.isOpen
          this.$parent.$emit('open', this)
        }
      })
    },

    beforeEnter(el) {
      el.style.height = 0
      el.style.overflow = 'hidden'
    },

    enter(el) {
      el.style.height = el.scrollHeight + 1 + 'px'
      setTimeout(() => {
        el.style.overflow = 'visible'
      }, 400)
    },

    beforeLeave(el) {
      el.style.height = 0 + 'px'
    },

    leave(el) {
      this.$nextTick(function () {
        el.style.height = 0
        el.style.overflow = 'hidden'
      })
    },

    close() {
      this.isOpen = false
    },

    calcSize() {
      this.$refs.content.style.height = this.$refs.contentInner.scrollHeight + 1 + 'px'
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('accordion-item')"
    :class="{ 'is-open': isOpen && !disabled, 'is-loading': loading, 'is-disabled': disabled }"
    class="accordion-item"
  >
    <div
      class="accordion-item-header"
      @click="open"
    >
      <slot name="header">
        <span class="accordion-item-title">{{ title }}</span>
      </slot>

      <Loading v-if="loading" />

      <icon
        name="keyboard_arrow_down"
        class="accordion-item-header-icon"
      ></icon>
    </div>

    <transition
      @before-enter="beforeEnter"
      @before-leave="beforeLeave"
      @enter="enter"
      @leave="leave"
    >
      <div
        v-if="isOpen && !disabled"
        ref="content"
        class="accordion-item-content h-auto"
      >
        <div
          ref="contentInner"
          class="accordion-item-content-inner"
        >
          <slot name="content">
            <p class="text-color">{{ content }}</p>
          </slot>
        </div>
      </div>
    </transition>
  </div>
</template>

<style lang="scss">
@import 'AccordionItem.scss';
</style>
