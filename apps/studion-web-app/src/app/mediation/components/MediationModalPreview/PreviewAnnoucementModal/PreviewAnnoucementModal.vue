<script>
import { defineComponent } from 'vue'
import { previewMixin } from '../mixins/previewMixin'

import Modal from '@/components/general/Modal'
import ModalCardAnnouncement from '@/app/classroom/modules/panel/components/ModalCardAnnouncement/ModalCardAnnouncement.vue'
import ModalHeaderPreview from '../components/ModalHeaderPreview'

export default defineComponent({
  name: 'PreviewAnnoucementModal',

  components: {
    Modal,
    ModalCardAnnouncement,
    ModalHeaderPreview,
  },

  mixins: [previewMixin],

  computed: {
    user() {
      const userData = this.item.userData
      const position = this.item.profile.alias
      userData.position = position === 'admin' ? this.$t('global:admin') : position

      return userData
    },
  },
})
</script>

<template>
  <Modal
    :active="true"
    class="modal-announcement"
    back
    is-page
    @close="isBack()"
  >
    <div
      v-if="item"
      class="modal-announcement-body"
    >
      <ModalHeaderPreview :title="title" />

      <ModalCardAnnouncement
        :user="user"
        :title="item.title"
        :description="item.message"
        :start-date="startTime"
        :end-date="endTime"
      />
    </div>
  </Modal>
</template>

<style lang="scss">
.modal-announcement {
  .modal-announcement-body {
    display: flex;
    align-items: center;
    flex-direction: column;
  }
}
</style>
