<script>
import { defineComponent } from 'vue'
import { mapState, mapActions } from 'vuex'

import Action from '@/components/general/Action'
import Modal from '@/components/general/Modal'

export default defineComponent({
  name: 'ModalRemoveAttendanceList',

  components: {
    Action,
    Modal,
  },

  computed: {
    ...mapState(['accessibility', 'Attendance']),
  },

  methods: {
    ...mapActions(['setFetching', 'setFeedback', 'attemptRemoveAttendanceList']),

    closeModal() {
      this.$router.push(this.$route.meta.modalCloseLink)
    },

    confirmRemoveAttendance() {
      this.setFetching(true)

      this.attemptRemoveAttendanceList(this.$route.params.id)
        .then(() => {
          this.$emit('refresh-attendance-list')
          this.setFeedback({ message: this.$t('classroom.attendance.manage:removed.attendance') })
        })
        .finally(() => {
          this.closeModal()
          this.setFetching(false)
        })
    },
  },
})
</script>

<template>
  <Modal
    :data-testid="$testId('modal-remove-attendance-list')"
    :active="true"
    :cancel="false"
    is-page
  >
    <div class="attendance-list modal-confirm">
      <Action
        class="btn-close"
        icon="close"
        icon-size="medium"
        type="button"
        @click="closeModal()"
      />

      <div class="modal-confirm-content">
        <h3 class="modal-confirm-title">
          {{ $t('classroom.attendance.list:remove.modal.confirm.title') }}
        </h3>
        <div class="modal-confirm-description">
          <p class="text-color">{{ $t('classroom.attendance.list:remove.modal.confirm.description') }}</p>
        </div>
      </div>

      <div class="modal-confirm-footer">
        <Action
          :dark="accessibility"
          :text="$t('global:cancel')"
          flat
          type="button"
          @click="closeModal"
        />

        <Action
          :dark="accessibility"
          :text="$t('global:remove')"
          class="btn-right"
          type="button"
          flat
          @click="confirmRemoveAttendance"
        />
      </div>
    </div>
  </Modal>
</template>
<style lang="scss">
@import '~@/app/classroom/modules/attendance_list/styles.scss';
</style>