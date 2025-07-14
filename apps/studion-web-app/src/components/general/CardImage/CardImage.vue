<script>
export default {
  props: {
    src: {
      type: String,
      required: true,
    },
    width: {
      type: [Number, String],
      default: '100%',
    },
    height: {
      type: [Number, String],
      default: 115,
    },
    overlay: {
      type: Boolean,
    },
    rounded: {
      type: Boolean,
      default: false,
    },
    clickable: {
      type: Boolean,
      default: false,
    },
    clickAction: {
      type: Function,
      default: () => null,
    },
    useImg: {
      type: Boolean,
      default: false,
    },
    enableSlotClick: {
      type: Boolean,
      default: false,
    },
    modern: Boolean,
  },
  computed: {
    style() {
      return {
        'background-image': `url('${this.src}')`,
        'max-width': typeof this.width === 'string' ? this.width : `${this.width}px`,
        'min-height': typeof this.height === 'string' ? this.height : `${this.height}px`,
        'border-radius': this.rounded ? '8px' : '0',
        overflow: this.rounded ? 'hidden' : 'visible',
        cursor: this.clickable ? 'pointer' : 'inherit',
      }
    },
    styleImg() {
      let styleImg = { ...this.style }
      delete styleImg['background-image']
      if (this.$media.desktop) {
        styleImg['max-height'] = styleImg['min-height']
      }
      return styleImg
    },
    classes() {
      return {
        '--overlayed': this.overlay,
        '--modern': this.modern,
        'enable-slot-click': this.enableSlotClick,
      }
    },
  },
}
</script>

<template>
  <div
    v-if="!useImg"
    class="generic-card__image"
    :class="classes"
    :style="style"
    @click.stop="clickable && clickAction()"
  >
    <slot></slot>
  </div>
  <div
    v-else
    class="generic-card__use-img"
    :style="styleImg"
    :class="classes"
    @click.stop="clickable && clickAction()"
  >
    <div class="image__area">
      <img
        :src="src"
        class="card__image"
        :class="{ clickable }"
        :style="styleImg"
      />
    </div>
    <div class="image__slot">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
@import './CardImage.scss';
</style>
