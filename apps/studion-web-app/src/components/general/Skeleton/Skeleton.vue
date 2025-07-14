<template>
  <div
    class="skeleton"
    :class="{ '--no-colored': !colored }"
    :style="style"
  >
    <div v-if="grid" class="grid" :style="gridStyle">
      <slot></slot>
    </div>
    <slot v-else></slot>
  </div>
</template>

<script>
export default {
  name: 'Skeleton',
  props: {
    width: {
      type: [Number, String],
      default: '100%'
    },
    align: {
      type: String,
      default: 'left'
    },
    grid: Boolean,
    columns: {
      type: Number,
      default: 3
    },
    colored: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    style () {
      return {
        'max-width': typeof this.width === 'string' ? this.width : `${this.width}px`,
        'align-items': this.align
      }
    },
    gridStyle () {
      return {
        'grid-template-columns': `repeat(${this.columns}, auto)`
      }
    }
  }
}
</script>

<style lang="scss">@import "Skeleton.scss";</style>
