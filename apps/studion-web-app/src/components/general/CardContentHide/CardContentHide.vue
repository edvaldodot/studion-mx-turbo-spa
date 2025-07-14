<script>
export default {
  name: 'CardContentHide',

  props: {
    keepOpen: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isOpen: false,
      height: 0,
    }
  },
  mounted() {
    this.$nextTick(() => {
      if (this.keepOpen) return
      this.height = this.$refs.content.clientHeight
      this.$refs.content.style.height = 0
    })
  },
  methods: {
    openContent() {
      if (this.keepOpen) return
      this.isOpen = !this.isOpen
      this.$refs.content.style.height = this.isOpen ? this.height + 'px' : 0
    },
  },
}
</script>

<template>
  <div
    ref="content"
    class="generic-card__content"
  >
    <div class="generic-card__content-block">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
@import './CardContentHide.scss';
</style>
