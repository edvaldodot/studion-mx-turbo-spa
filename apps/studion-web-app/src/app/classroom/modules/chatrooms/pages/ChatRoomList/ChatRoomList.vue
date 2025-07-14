<script>
import { mapActions } from 'vuex'

import { isBefore, isAfter, parseISO } from 'date-fns'

import Action from '@/components/general/Action'
import ChatCard from '../../components/ChatCard'
import EmptyMessage from '@/components/general/EmptyMessage'
import FilterList from '@/components/general/FilterList'
import Pagination from '@/components/general/Pagination'
import mixinChat from '@/app/management/pages/ManagementChat/mixins/chatmixin.js'

const Modal = () => import('@/components/general/Modal')
const Icon = () => import('@/components/general/Icon')

export default {
  name: 'ChatRoomList',

  components: {
    Action,
    ChatCard,
    EmptyMessage,
    FilterList,
    Icon,
    Modal,
    ModalConfirm: () => import('@/components/general/ModalConfirm'),
    ModalEditChat: () => import('@/components/shared/ModalEditChat'),
    Pagination,
  },

  mixins: [mixinChat],

  beforeRouteLeave(to, from, next) {
    this.$emit('change-header', {})
    next()
  },

  computed: {
    hasWriteAccess() {
      return !this.isStudent() && this.canWrite('classroom:chat')
    },
  },

  watch: {
    pgtrIsFetching: {
      immediate: true,
      handler(loading) {
        this.setFetching(loading)
      },
    },
  },

  created() {
    this.$emit('change-header', {
      customClasses: { chatrooms: true },
    })
    this.setNicknameData()
    this.loadChatrooms()
  },

  methods: {
    ...mapActions(['attemptChatRoomRetrievalBySession', 'attemptChatRoomCreation']),

    checkUserNickname({ id, schedulePeriod }) {
      const isEnded = isAfter(new Date(), parseISO(schedulePeriod.end))

      const data = this.nicknameData
      const nickname = data.username

      if (nickname) {
        return this.accessChatroom(id)
      }

      this.$router.replace({
        name: 'classroom.chat.nickname',
        query: {
          suggestion: data.suggestion,
          chat: id,
          forceSubmit: isEnded,
        },
      })
    },

    loadChatrooms() {
      const params = {
        sessionUuid: this.sessionUuid,
      }
      this.pgtrInitializePagination('attemptChatRoomRetrievalBySession', null, params)
      this.chat = this.Classroom.data.chat
    },

    getRandomColor() {
      return 'color: #' + Math.floor(Math.random() * 16777215).toString(16)
    },

    openModalParticipants(item) {
      this.selectChat.title = item.title
      this.modalParticipants = true
    },

    openModalAddChat() {
      this.modalChatActive = true
    },

    addNewChat() {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.formData.chat_id = this.chat.id || null
        this.modalChatActive = false

        this.formData.id ? this.submitUpdate() : this.submitCreate()
      }
    },

    submitCreate() {
      this.setFetching(true)
      let data = this.parseFormData()
      this.attemptChatRoomCreation(data)
        .then(({ data }) => {
          this.pgtrCurrentData.push(data)
          this.closeModalAddChat()
        })
        .catch(({ response }) => {
          let message = ''
          if (response.data.message === 'start_should_not_be_greater_than_end') {
            message = this.$t(
              'classroom.chat:feedback.create.error.start_should_not_be_greater_than_end'
            )
            this.setFeedback({ message: message })
          }
          this.modalChatActive = true
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    canAccessChatroom(item) {
      return (
        isBefore(parseISO(item.schedulePeriod.start), new Date()) &&
        isBefore(new Date(), parseISO(item.schedulePeriod.end)) &&
        item.active
      )
    },
  },
}
</script>

<template>
  <div class="inner-content p-4">
    <div class="py-4">
      <FilterList>
        <Action
          v-if="hasWriteAccess"
          slot="button"
          type="button"
          :text="$t('classroom.chat:btn.add')"
          primary
          large
          fixed-width
          :dark="accessibility"
          @click="openModalAddChat()"
        />
      </FilterList>
    </div>

    <template v-if="pgtrCurrentData.length === 0">
      <EmptyMessage v-if="!isStudent()">
        <h2>{{ $t('classroom.chat:empty.title:admin') }}</h2>
        <p class="text-color">{{ $t('classroom.chat:empty.message:admin') }}</p>
      </EmptyMessage>

      <EmptyMessage v-if="isStudent()">
        <h2>{{ $t('classroom.chat:empty.title:student') }}</h2>
        <p class="text-color">{{ $t('classroom.chat:empty.message:student') }}</p>
      </EmptyMessage>
    </template>

    <div
      v-if="pgtrCurrentData.length > 0"
      class="center"
    >
      <div class="chat-list clearfix">
        <ChatCard
          v-for="(item, index) in pgtrCurrentData"
          :id="item.id"
          :key="item.id"
          :show-action="item.schedulePeriod.hasStarted"
          :active="item.active"
          :name="item.name"
          :start-time="item.schedulePeriod.start"
          :end-time="item.schedulePeriod.end"
          :total-participants="item.totalParticipants"
          :thumbnail="item.image"
          :url="item.url"
          :action-join-visible="canAccessChatroom(item)"
          @remove="removeConfirmationModal(item)"
          @edit="editChat(item)"
          @activate="activateToggle(item)"
          @deactivate="activateToggle(item)"
          @bookmark="bookmarkItem(index)"
          @access="checkUserNickname(item)"
          @status="currentStatus = $event"
          @openParticipants="openModalParticipants(item)"
          @seemore="seeMore(item)"
        />
      </div>
      <Pagination
        :active-page="pgtrParams.page"
        :page-count="pgtrLastPage"
        @next-page="pgtrParams.page++"
        @previous-page="pgtrParams.page--"
        @first-page="pgtrParams.page = 1"
        @last-page="pgtrParams.page = pgtrLastPage"
        @go-to-page="pgtrParams.page = $event"
        @change-items-per-page="pgtrParams.limit = $event"
      />
    </div>

    <Modal
      :active.sync="modalChatActive"
      @close="closeModalAddChat()"
    >
      <ModalEditChat
        :chat="formData"
        :validations="$v"
        :is-preview="isPreview"
        @submit="addNewChat"
      />
    </Modal>

    <Modal :active.sync="modalParticipants">
      <div class="modal-content">
        <span class="modal-subtitle">{{ selectChat.title }}</span>

        <h2 class="modal-title text-color">{{ $t('classroom.chat:modal.participants.title') }}</h2>

        <div class="modal-chat-participants">
          <div
            v-for="(user, index) in participants"
            :key="index"
            class="modal-chat-user"
          >
            <div class="modal-chat-user-image-wrapper">
              <img
                v-if="user.image"
                :src="user.image"
                :alt="user.name"
              />

              <Icon
                v-else
                name="account_circle"
                :style="getRandomColor()"
              />
            </div>

            <span class="modal-chat-user-name">{{ user.name }}</span>
            <span class="modal-chat-user-status">{{ user.status }}</span>
          </div>
        </div>
      </div>
    </Modal>

    <ModalConfirm
      :title="$t('chatroom.list:modal.delete.title')"
      :active="modalConfirmDelete"
      @close="modalConfirmDelete = false"
      @confirm="remove(chat_id)"
    >
      <p class="text-color">{{ $t('chatroom.list:modal.delete.description') }}</p>
    </ModalConfirm>

    <RouterView @access="accessChatroom" />
  </div>
</template>

<style lang="scss">
@import '~@/app/classroom/modules/chatrooms/styles.scss';
</style>
