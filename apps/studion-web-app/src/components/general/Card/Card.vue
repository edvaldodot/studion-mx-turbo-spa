<script>
export default {
  props: {
    rounded: Boolean,
    height: {
      type: [Number, String],
      default: 'auto',
    },
    horizontal: Boolean,
    dark: Boolean,
    transparent: Boolean,
    target: String,
    disabled: Boolean,
    to: {
      type: [Object, String],
      default: null,
    },
  },
  computed: {
    style() {
      return { 'min-height': typeof this.height === 'number' ? `${this.height}px` : this.height }
    },
    classes() {
      return {
        'generic-card': true,
        '--horizontal': this.horizontal,
        '--dark': this.dark,
        '--disabled': this.disabled,
        '--hoverable': this.to,
        '--rounded': this.rounded,
        '--transparent': this.transparent,
      }
    },
  },
  methods: {
    handleClick() {
      if (this.disabled) return
      this.$emit('click')

      if (
        this.to &&
        (typeof this.to === 'object' || (typeof this.to === 'string' && this.to.startsWith('/')))
      ) {
        this.$router.push(this.to)
        return
      }

      if (this.to) {
        window.open(this.to, this.target)
      }
    },
  },
}
</script>

<template>
  <div class="card-wrapper">
    <div
      :class="classes"
      :style="style"
      @click="handleClick"
    >
      <slot></slot>
    </div>
    <slot name="hidden"></slot>
  </div>
</template>

<style lang="scss">
@import './Card.scss';
</style>
