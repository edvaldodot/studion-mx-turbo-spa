<script>
import { defineComponent } from 'vue'
import { previewMixin } from '../mixins/previewMixin'

import Modal from '@/components/general/Modal'
import CardPoll from '@/app/classroom/modules/polls/components/CardPoll/CardPoll.vue'
import ModalHeaderPreview from '../components/ModalHeaderPreview'

export default defineComponent({
  name: 'PreviewPollModal',

  components: {
    Modal,
    CardPoll,
    ModalHeaderPreview,
  },

  mixins: [previewMixin],

  computed: {
    parseDate() {
      return {
        start: this.startTime,
        end: this.endTime,
        scheduled: true,
        hasStarted: true,
        isActive: true,
        hasEnded: false,
      }
    },
  },

  methods: {
    parseAuthor(item) {
      return {
        name: item.userData.name,
        position: item.profile.name,
        userData: {
          image: item.userData.image,
        },
      }
    },

    transformChoices(item) {
      return item.choices.map((choice, index) => ({
        id: index + 1,
        description: choice,
        position: index + 1,
        voted: false,
        total: 0,
      }))
    },
  },
})
</script>

<template>
  <Modal
    :active="true"
    class="modal-chat"
    is-page
    back
    @close="isBack()"
  >
    <div
      v-if="item"
      class="modal-poll-body"
    >
      <ModalHeaderPreview :title="title" />

      <CardPoll
        :id="item.id"
        ref="cardPoll"
        :key="item.id"
        :author="parseAuthor(item)"
        :multiples-choices="item.meta.multiplesChoices === 0 ? false : true"
        :description="item.message"
        :date="parseDate"
        :choices="transformChoices(item.meta)"
        :total-votes="0"
        is-mediation-plan
      />
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
  .modal-poll-body {
    display: flex;
    align-items: center;
    flex-direction: column;

    .modal-discussion-schedule-title {
      font-size: 20px;
      font-weight: bold;
      color: var(--alert-900);
      margin-bottom: 10px;
    }

    .modal-discussion-title {
      font-size: 40px;
      font-weight: bold;
      color: #ffffff;
      margin-bottom: 58px;
    }

    .modal-discussion-header {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .card-chat__status {
      margin-bottom: 30px;
    }
  }
}
</style>
