<script>
import ModalDialog from '../ModalDialog'

export default {
  name: 'ModalWarning',
  components: {
    ModalDialog,
  },
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
  },
}
</script>

<template>
  <modal-dialog
    disable-footer
    :active="active"
    @close="$emit('close')"
  >
    <template v-slot:title>{{ title }}</template>
    <template v-slot:description>
      <slot></slot>
    </template>
  </modal-dialog>
</template>

<style lang="scss">
@import 'ModalWarning.scss';
</style>
