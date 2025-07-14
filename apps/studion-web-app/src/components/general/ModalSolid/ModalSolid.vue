<script>
import { defineComponent } from 'vue'
import Modal from '../Modal'

export default defineComponent({
  name: 'ModalSolid',

  components: {
    Modal,
  },
})
</script>

<template>
  <Modal
    v-bind="$attrs"
    class="solid-modal"
    @close="$emit('close')"
  >
    <slot name="content" />
  </Modal>
</template>

<style lang="scss">
.solid-modal {
  .modal {
    color: var(--text-color);
    background: var(--surface-overlay);
    border-radius: 8px;
    border-top: 6px solid var(--secondary-color);
    padding: 32px;

    .modal-subtitle {
      color: var(--secondary-color);
    }
    .modal-title {
      color: var(--text-color);
    }

    .btn-back {
      color: var(--black-500);
    }
  }
}
</style>
