<script>
import { defineComponent } from 'vue'
import { previewMixin } from '../mixins/previewMixin'

import Modal from '@/components/general/Modal'

import BodyEmailOrSms from '../components/BodyEmailOrSms'
import ModalHeaderPreview from '../components/ModalHeaderPreview'

export default defineComponent({
  name: 'PreviewEmailModal',

  components: {
    Modal,
    BodyEmailOrSms,
    ModalHeaderPreview,
  },

  mixins: [previewMixin],
})
</script>

<template>
  <Modal
    :active="true"
    class="modal-email"
    back
    is-page
    @close="isBack()"
  >
    <div
      v-if="item"
      class="modal-sms-body"
    >
      <ModalHeaderPreview :title="title" />
      <BodyEmailOrSms
        type="sms"
        :item="item"
      />
    </div>
  </Modal>
</template>

<style lang="scss">
.modal-email {
  display: flex;
  justify-content: center;
  padding-top: 100px;
  .btn-back {
    position: fixed;
    top: 30px;
    left: 40px;
  }
  .modal-sms-body {
    display: flex;
    align-items: center;
    flex-direction: column;
  }
}
</style>
