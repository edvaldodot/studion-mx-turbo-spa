<script>
import Action from '../Action'
import Modal from '../Modal'

export default {
  name: 'ModalDialog',
  components: {
    Action,
    Modal,
  },
  props: {
    active: {
      type: Boolean,
      default: false,
    },
    closable: {
      type: Boolean,
      default: true,
    },
    isPage: {
      type: Boolean,
      default: false,
    },
    disableFooter: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: 'unset',
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
}
</script>

<template>
  <Modal
    :active="active"
    :is-page="isPage"
    :cancel="false"
  >
    <div
      class="modal-confirm"
      :style="{ 'max-width': width }"
    >
      <Action
        v-if="closable"
        :text="back ? textBackValue() : null"
        :icon="back ? 'keyboard_backspace' : 'close'"
        :icon-size="back ? 'small' : 'medium'"
        :class="{ back }"
        type="button"
        class="btn-close"
        @click="$emit('close')"
      />
      <slot name="pre-content"></slot>
      <div class="modal-confirm-content">
        <h3 class="modal-confirm-title">
          <slot name="title"></slot>
        </h3>
        <div class="modal-confirm-description">
          <slot name="description"></slot>
        </div>
      </div>
      <div
        v-if="!disableFooter"
        class="modal-confirm-footer"
      >
        <slot name="footer"></slot>
      </div>
      <div
        v-if="$slots.actions"
        class="modal-confirm-actions"
      >
        <slot name="actions"></slot>
      </div>
    </div>
  </Modal>
</template>
