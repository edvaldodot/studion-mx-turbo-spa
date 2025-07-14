<script>
import { defineComponent } from 'vue'
import { previewMixin } from '../mixins/previewMixin'

import Modal from '@/components/general/Modal'
import { isBefore, isAfter, parseISO } from 'date-fns'
import ModalHeaderPreview from '../components/ModalHeaderPreview'

export default defineComponent({
  name: 'PreviewChatModal',

  components: {
    Modal,
    ModalHeaderPreview,
    Card: () => import('@/components/general/Card'),
    CardBody: () => import('@/components/general/CardBody'),
    CardImage: () => import('@/components/general/CardImage'),
  },

  mixins: [previewMixin],

  computed: {
    background() {
      return this.item.meta.image
        ? this.item.meta.image
        : '/assets/images/themes/default/bkg/chat-default.jpg'
    },

    status() {
      return !this.active
        ? 'inactive'
        : isBefore(new Date(), parseISO(this.startTime))
        ? 'waiting'
        : isAfter(new Date(), parseISO(this.endTime))
        ? 'closed'
        : 'active'
    },
  },

  methods: {
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
    class="modal-chat"
    back
    is-page
    @close="isBack()"
  >
    <div
      v-if="item"
      class="modal-discussion-body"
    >
      <ModalHeaderPreview :title="title" />

      <Card
        rounded
        class="card-chat"
      >
        <CardImage
          class="card-chat__header"
          :height="120"
          :src="background"
          overlay
        />

        <CardBody class="card-chat__content">
          <h3
            v-shave="{ height: 18 }"
            class="card-chat__title compact-name"
            :title="item.title"
          >
            {{ item.title }}
          </h3>

          <div class="card-chat__dates">
            <span
              >{{ $t('global:form.start') }}:
              <strong>{{ `${formatDate(startTime) + ' ' + item.meta.startTime}` }}</strong></span
            >
            <span
              >{{ $t('global:form.end') }}:
              <strong>{{
                `${addDaysToDate(startTime, item.meta.duration) + ' ' + item.meta.endTime} `
              }}</strong></span
            >
          </div>

          <span
            class="card-chat__status"
            :class="[`is-${status}`]"
          >
            {{ $t(`classroom.chat:status.${status}`) }}
          </span>
        </CardBody>
      </Card>
    </div>
  </Modal>
</template>

<style lang="scss">
@import '@/app/classroom/modules/chatrooms/components/ChatCard/ChatCard.scss';

.modal-chat {
  .btn-back {
    position: fixed;
    top: 30px;
    left: 40px;
  }
  .modal-discussion-body {
    display: flex;
    align-items: center;
    flex-direction: column;

    .card-chat__status {
      margin-bottom: 30px;
    }
  }
}
</style>
