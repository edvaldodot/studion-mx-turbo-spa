<script>
import Teleport from 'vue2-teleport'

export default {
  name: 'TooltipSlot',

  components: {
    Teleport,
  },

  props: {
    width: {
      type: Number,
      default: null,
    },

    uppercase: {
      type: Boolean,
      default: false,
    },

    dark: {
      type: Boolean,
      default: false,
    },

    mediumFont: {
      type: Boolean,
      default: false,
    },
    boldFont: {
      type: Boolean,
      default: false,
    },

    arrow: {
      type: Boolean,
      default: false,
    },

    horizontalAlign: {
      type: String,
      default: '',
    },

    verticalAlign: {
      type: String,
      default: 'bottom',
    },

    shadow: {
      type: Boolean,
      default: false,
    },

    disableContent: {
      type: Boolean,
      default: false,
    },
    marginTop: {
      type: String,
      default: '0px',
    },
  },

  data() {
    return {
      showTooltip: false,
    }
  },

  computed: {
    classes() {
      return {
        '--uppercase': this.uppercase,
        '--dark': this.dark,
        '--medium-font': this.mediumFont,
        '--bold-font': this.boldFont,
        '--has-arrow': this.arrow,
        '--left': this.horizontalAlign === 'left',
        '--right': this.horizontalAlign === 'right',
        '--shadow': this.shadow,
        '--top': this.verticalAlign === 'top',
      }
    },
  },

  destroyed() {
    if (this.$refs.tooltip) {
      this.$refs.tooltip.remove()
    }
  },

  methods: {
    mouseleave() {
      if (this.$refs.tooltip) {
        this.showTooltip = false
      }
    },

    mouseenter() {
      const parent = this.$el.getBoundingClientRect()
      const tooltip = this.$refs.tooltip

      tooltip.style.width = this.width ? `${this.width}px` : 'auto'
      tooltip.style.top = `${parent.height + parent.y + 10}px`

      this.setVerticalAlign(tooltip, parent)
      this.setHorizontalAlign(tooltip, parent)
      this.adjustPositionBaseViewPortWidth(tooltip)

      this.showTooltip = true
    },

    setVerticalAlign(tooltip, parent) {
      if (this.verticalAlign !== 'top') return
      tooltip.style.top = `${parent.y - tooltip.offsetHeight - 10}px`
    },

    setHorizontalAlign(tooltip, parent) {
      if (this.horizontalAlign === 'left') {
        tooltip.style.left = `${parent.x - (tooltip.offsetWidth - parent.width / 2 - 17)}px`
        return
      }

      if (this.horizontalAlign === 'right') {
        tooltip.style.left = `${parent.x + parent.width / 2 - 17}px`
        return
      }

      tooltip.style.left = `${parent.x + (parent.width / 2 - tooltip.offsetWidth / 2)}px`
    },

    adjustPositionBaseViewPortWidth(tooltip) {
      const viewportWidth = window.innerWidth

      if (tooltip.getBoundingClientRect().right > viewportWidth) {
        tooltip.style.left = `auto`
        tooltip.style.right = `20px`
      }

      if (tooltip.getBoundingClientRect().x < 0) {
        tooltip.style.left = `10px`
      }

      if (tooltip.getBoundingClientRect().width > viewportWidth) {
        tooltip.style.width = `${viewportWidth - 20}px`
      }
    },
  },
}
</script>

<template>
  <span
    class="tooltip"
    @mouseenter="mouseenter"
    @mouseleave="mouseleave"
  >
    <slot name="activator" />

    <Teleport to="body">
      <div
        v-show="!disableContent"
        ref="tooltip"
        :class="classes"
        :style="{
          opacity: showTooltip ? '1' : '0',
          'margin-top': marginTop,
        }"
        class="generic-tooltip"
      >
        <slot
          v-if="$slots.content"
          name="content"
        />
      </div>
    </Teleport>
  </span>
</template>

<style lang="scss">
@import 'TooltipSlot.scss';
</style>
