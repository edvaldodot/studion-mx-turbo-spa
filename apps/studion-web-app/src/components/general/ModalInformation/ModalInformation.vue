<script>
import { defineComponent } from 'vue'

import ModalDialog from '../ModalDialog'

export default defineComponent({
  name: 'ModalInformation',

  components: {
    ModalDialog,
  },

  props: {
    active: {
      type: Boolean,
      default: true,
    },
    width: {
      type: String,
      default: '840px',
    },
    closable: {
      type: Boolean,
      default: false,
    },
    smallPadding: {
      type: Boolean,
      default: false,
    },
    isPage: {
      type: Boolean,
      default: false,
    },
    back: {
      type: Boolean,
      default: false,
    },
    textBack: {
      type: String,
      default: null,
    },
  },

  methods: {
    textBackValue() {
      if (!this.textBack) {
        return this.$t('global:back')
      }
      return this.textBack
    },
  },
})
</script>

<template>
  <ModalDialog
    class="modal-information"
    :class="{ 'small-padding': smallPadding }"
    :active="active"
    :closable="closable"
    :is-page="isPage"
    :width="width"
    :back="back"
    :text-back="textBackValue()"
    @close="$emit('close')"
  >
    <template #pre-content>
      <div class="pre-content">
        <slot name="pre-content" />
      </div>
    </template>

    <template #title>
      <slot name="title" />
    </template>

    <template #description>
      <slot name="description" />
    </template>

    <template #footer>
      <slot name="content" />
    </template>

    <template #actions>
      <slot name="actions" />
    </template>
  </ModalDialog>
</template>

<style lang="scss">
@import './ModalInformation.scss';
</style>
