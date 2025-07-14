<script>
import Modal from '@/components/general/Modal'

export default {
  name: 'ModalClassesTimeline',
  components: {
    Modal,
  },
  methods: {
    closeModal() {
      this.$emit('close')
    }
  }
}
</script>
<template>
  <Modal
    :active="true"
    :back="true"
    :data-testid="$testId('modal-classes-timeline')"
    class="modal-classes-timeline"
    is-page
    @close="closeModal"
  >
  </Modal>
</template>
<style lang="scss">
</style>
