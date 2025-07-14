<script>
import Icon from '../Icon'

export default {
  name: 'Chip',
  components: {
    Icon,
  },
  props: {
    text: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    iconClass: {
      type: String,
      default: '',
    },
    packIcon: {
      type: String,
      default: 'default',
    },
    color: {
      type: String,
      default: 'default',
    },
    small: Boolean,
    inverted: Boolean,
    strong: Boolean,
    hoverable: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    classes() {
      return {
        [`--${this.color}`]: true,
        '--hoverable': this.hoverable,
        '--small': this.small,
        [`--inverted-${this.color}`]: this.inverted,
        '--strong': this.strong,
      }
    },
  },
}
</script>
<template>
  <div :class="['chip', classes]">
    <span
      v-if="text"
      class="chip__text"
    >
      {{ text }}
    </span>

    <Icon
      v-if="icon"
      :class="[{ 'has-text': text }, iconClass]"
      :name="icon"
      :pack="packIcon"
    />

    <slot></slot>
  </div>
</template>

<style lang="scss">
@import 'Chip.scss';
</style>
