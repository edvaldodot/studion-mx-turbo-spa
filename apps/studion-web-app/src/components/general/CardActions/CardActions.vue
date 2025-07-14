<script>
export default {
  props: {
    centered: Boolean,
    width: {
      type: [String, Number],
      default: 'auto',
    },
    height: {
      type: [String, Number],
      default: 'auto',
    },
    noPadding: Boolean,
  },
  computed: {
    classes() {
      return {
        '--centered': this.centered,
        '--no-padding': this.noPadding,
      }
    },
    styles() {
      return {
        width: typeof this.width === 'string' ? this.width : `${this.width}px`,
        height: typeof this.height === 'string' ? this.height : `${this.height}px`,
      }
    },
  },
}
</script>

<template>
  <div
    class="generic-card__actions"
    :class="classes"
    :style="styles"
  >
    <slot></slot>
  </div>
</template>

<style lang="scss">
@import 'CardActions.scss';
</style>
