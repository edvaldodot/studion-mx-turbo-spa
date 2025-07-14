<script>
export default {
  name: 'ActionSubmenu',
  props: {
    show: {
      type: Boolean,
      default: false,
    },
    position: {
      type: String,
      default: 'right',
    },
  },
  methods: {
    closeMenu() {
      this.$emit('update:show', false)
    },
  },
}
</script>
<template>
  <div
    v-click-outside="closeMenu"
    class="action-submenu"
  >
    <slot name="button"></slot>
    <div
      v-if="show"
      :class="`align-${position}`"
      class="action-submenu-list"
    >
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<style lang="scss">
@import 'ActionSubmenu.scss';
</style>
