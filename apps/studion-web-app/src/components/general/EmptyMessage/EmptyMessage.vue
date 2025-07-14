<script>
import { mapState } from 'vuex'
import InlineSvg from 'vue-inline-svg'
export default {
  name: 'EmptyMessage',
  components: {
    InlineSvg,
  },
  props: {
    emptyState: {
      type: Number,
      default: () => 1,
    },
    noBg: {
      type: Boolean,
      default: () => false,
    },
    showIcon: {
      type: Boolean,
      default: () => false,
    },
    title: {
      type: String,
      default: () => '',
    },
    text: {
      type: String,
      default: () => '',
    },
  },
  computed: {
    ...mapState(['fetching']),
    classes() {
      return {
        '--no-bg': this.noBg,
      }
    },
    iconSource() {
      return `/assets/images/svg/emptyStates/empty_state_${this.emptyState}.svg`
    },
  },
}
</script>

<template>
  <div
    v-if="!fetching"
    :class="['empty-msg', classes]"
  >
    <div class="empty-msg__content">
      <div
        v-show="showIcon"
        class="empty-msg__icon"
      >
        <InlineSvg
          width="100px"
          height="100%"
          :src="iconSource"
        />
      </div>
      <div class="empty-msg__message">
        <slot>
          <div class="empty-msg__title">
            <slot name="title"> {{ title }} </slot>
          </div>
          <div class="empty-msg__text">
            <slot name="text"> {{ text }} </slot>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'EmptyMessage.scss';
</style>
