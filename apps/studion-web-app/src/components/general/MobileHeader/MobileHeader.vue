<script>
import Action from '../Action'
import Icon from '../Icon'
import Logo from '../Logo'

export default {
  name: 'MobileHeader',
  components: {
    Action,
    Icon,
    Logo,
  },
  data() {
    return {
      open: true,
    }
  },
  methods: {
    openMenu() {
      this.$emit('open', this.open)
    },
  },
}
</script>

<template>
  <header class="mobile-header">
    <action
      type="button"
      icon="menu"
      class="btn-menu"
      @click="openMenu()"
    ></action>
    <logo
      logo
      :theme="$theme"
    ></logo>
  </header>
</template>

<style lang="scss">
@import 'MobileHeader.scss';
</style>
