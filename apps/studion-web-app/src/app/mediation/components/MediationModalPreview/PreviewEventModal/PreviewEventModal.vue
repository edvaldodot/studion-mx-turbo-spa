<script>
import { defineComponent } from 'vue'
import { previewMixin } from '../mixins/previewMixin'

import Modal from '@/components/general/Modal'
import Icon from '@/components/general/Icon'
import ModalHeaderPreview from '../components/ModalHeaderPreview'

export default defineComponent({
  name: 'PreviewEventModal',

  components: { Modal, Icon, ModalHeaderPreview },

  mixins: [previewMixin],

  methods: {
    getEventColor(event) {
      if (!event) return '#fff'
      else return event.color
    },

    addDaysToDate(dateString, daysToAdd) {
      const date = new Date(dateString)

      date.setDate(date.getDate() + daysToAdd)

      const endDate = date.toISOString()
      return this.formatDate(endDate)
    },
  },
})
</script>

<template>
  <Modal
    :active="true"
    class="modal-event"
    is-page
    back
    @close="isBack()"
  >
    <div
      v-if="item"
      class="modal-event-body"
    >
      <ModalHeaderPreview :title="title" />

      <div
        class="calendar-event-modal"
        :style="{ borderColor: getEventColor(item.meta) }"
      >
        <div class="calendar-event-modal-content">
          <div class="calendar-event-modal-title-content">
            <h4 class="calendar-event-modal-title">{{ item.title }}</h4>
          </div>

          <div class="calendar-event-modal-infos">
            <div class="calendar-event-modal-author">
              <div class="calendar-event-modal-author-image">
                <img
                  v-if="item.userData.image"
                  :src="item.userData.image"
                  :alt="item.userData.name"
                />
                <Icon
                  v-else
                  class="calendar-event-modal-author-image-icon"
                  name="account_circle"
                />
              </div>
              <div class="calendar-event-modal-author-profile">
                <div class="calendar-event-modal-author-profile-type">
                  {{ item.userData.name }}
                </div>
                <div class="calendar-event-modal-author-profile-name">
                  {{ item.profile.name }}
                </div>
              </div>
            </div>

            <div class="calendar-event-modal-date">
              <div>{{ formatDate(startTime) }}</div>
              <div>{{ addDaysToDate(endTime, item.meta.duration) }}</div>
            </div>
          </div>

          <div
            v-if="item.message"
            class="calendar-event-modal-description"
            v-html="item.message"
          ></div>
        </div>
      </div>
    </div>
  </Modal>
</template>

<style lang="scss">
@import '@/components/general/Calendar/CalendarEventDetail/CalendarEventDetail.scss';

.modal-event {
  .btn-back {
    position: fixed;
    top: 30px;
    left: 40px;
  }
  .modal-event-body {
    display: flex;
    align-items: center;
    flex-direction: column;

    .calendar-event-modal {
      position: relative;
      border-radius: 2px 2px 8px 8px;
      width: 50%;
    }
  }
}
</style>
