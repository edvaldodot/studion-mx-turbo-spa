<script>
import Icon from '../Icon'

export default {
  components: {
    Icon,
  },
  props: {
    icon: {
      type: String,
      default: 'help',
    },
    width: {
      type: String,
      default: '350px',
    },
    textDark: {
      type: Boolean,
      default: false,
    },
    dark: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showCloud: false,
    }
  },
}
</script>

<template>
  <div
    class="helper"
    :class="{ '--dark': dark }"
  >
    <icon
      name="help"
      size="small"
      wrapper
      @mouseenter.native="showCloud = true"
      @mouseleave.native="showCloud = false"
    />
    <div
      v-show="showCloud"
      class="cloud__connector"
    ></div>
    <div
      v-show="showCloud"
      class="helper__cloud"
      :class="{ '--text-dark': textDark }"
      :style="{ width: width, rigth: width }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
@import 'HelperCloud.scss';
</style>
