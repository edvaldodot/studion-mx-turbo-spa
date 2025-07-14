<script>
import Action from '../Action'
import ModalDialog from '../ModalDialog'

export default {
  name: 'ModalConfirm',
  components: {
    Action,
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
    accessibility: {
      type: Boolean,
      default: false,
    },
    confirmBtnText: {
      type: String,
      default() {
        return this.$t('global:confirm')
      },
    },
    cancelBtnText: {
      type: String,
      default() {
        return this.$t('global:cancel')
      },
    },
    disableConfirm: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<template>
  <modal-dialog
    :active="active"
    @close="$emit('close')"
  >
    <template v-slot:title>{{ title }}</template>
    <template v-slot:description>
      <slot></slot>
    </template>
    <template v-slot:footer>
      <action
        flat
        type="button"
        :text="cancelBtnText"
        :dark="accessibility"
        @click="$emit('close')"
      />
      <action
        flat
        type="button"
        class="--right"
        :text="confirmBtnText"
        :dark="accessibility"
        :disabled="disableConfirm"
        @click="$emit('confirm')"
      />
    </template>
  </modal-dialog>
</template>

<style lang="scss">
@import 'ModalConfirm.scss';
</style>
