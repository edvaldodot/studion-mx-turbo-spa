<script>
import Action from '../Action'

export default {
  name: 'NavHeader',

  components: {
    Action,
  },

  props: {
    title: {
      type: String,
      default: '',
    },
  },
}
</script>

<template>
  <div class="nav-header">
    <Action
      type="button"
      icon="keyboard_backspace"
      @click="$emit('back')"
    />

    <h2
      class="nav-header__title"
      :title="title"
    >
      {{ title }}
    </h2>

    <slot name="controls" />
  </div>
</template>

<style lang="scss">
@import './NavHeader.scss';
</style>
