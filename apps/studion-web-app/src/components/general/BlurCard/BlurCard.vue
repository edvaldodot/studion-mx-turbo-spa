<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'BlurCard',

  props: {
    hideScrollbar: {
      type: Boolean,
      default: false,
    },
    maxHeight: {
      type: String,
      default: '660px',
    },
    blurMobile: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      showBlur: false,
    }
  },

  mounted() {
    this.setBlur()
  },

  methods: {
    setBlur() {
      const scrollContainer = this.$refs.blurCard
      if (
        scrollContainer.scrollHeight < parseInt(this.maxHeight.slice(0, -2)) ||
        this.$media.mobile
      )
        return

      const shouldShowBlur = scrollContainer.scrollTop > 0

      this.showBlur = !shouldShowBlur
    },

    getMaxHeight() {
      if (this.$media.mobile && !this.blurMobile) return 'max-content'
      return this.maxHeight
    },
  },
})
</script>

<template>
  <div
    ref="blurCard"
    :data-testid="$testId('classroom-announcements')"
    :style="{ 'max-height': getMaxHeight() }"
    :class="{
      '--hide-scrollbar': hideScrollbar,
    }"
    class="blur-card"
    @scroll="setBlur"
  >
    <slot />
    <div
      class="blur__wrapper"
      :class="{
        '--blur': showBlur,
      }"
    ></div>
  </div>
</template>

<style lang="scss">
@import 'BlurCard.scss';
</style>
