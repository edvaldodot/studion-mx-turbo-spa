import { mapActions, mapState, mapGetters } from 'vuex'
import { required, requiredIf } from 'vuelidate/lib/validators'
import { format, isBefore, parseISO } from 'date-fns'
import { paginateMixin } from '@/mixins/paginatorMixin'

export default {
  mixins: [paginateMixin],

  data() {
    return {
      modalConfirmDelete: false,
      modalParticipants: false,
      modalChatActive: false,
      currentStatus: null,
      formData: {
        name: null,
        description: '',
        file: null,
        start_time: null,
        end_time: null,
        showTimeLeft: false,
        sessions_ids: [],
      },
      initDate: null,
      selectChat: {
        title: null,
      },
      participants: [],
      items: [],
      nicknameData: {
        suggestion: null,
        username: null,
      },
      sessionUuid: this.$route.params.session_uuid,
      chat_id: null,
      isManagement: null,
      isPreview: false,
      modalSession: false,
      isManagementCreate: false,
    }
  },

  validations: {
    formData: {
      name: {
        required,
      },
      start_time: {
        required,
      },
      end_time: {
        required,
        afterStart() {
          return (
            !this.formData.end_time ||
            isBefore(parseISO(this.formData.start_time), parseISO(this.formData.end_time))
          )
        },
      },
      sessions_ids: {
        required: requiredIf(function () {
          return this.isManagementCreate
        }),
      },
    },
  },

  computed: {
    ...mapGetters(['alreadyHasNickname']),
    ...mapState(['Classroom', 'Account', 'accessibility']),
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptChatRoomUpdate',
      'attemptChatroomToggle',
      'attemptChatroomRemove',
      'attemptChatroomNicknameRetrieval',
      'saveUserNickname',
    ]),

    setNicknameData() {
      if (this.alreadyHasNickname) return

      this.attemptChatroomNicknameRetrieval().then(({ data, uuid }) => {
        this.nicknameData = data
        if (!uuid) this.saveUserNickname(data.username)
      })
    },

    accessChatroom(item) {
      this.$router.push({
        name: 'classroom.chat.chatroom',
        params: {
          chatroom_id: this.isManagement ? item.i_chatrooms : item,
          session_uuid: this.isManagement ? item.session_uuid : this.sessionUuid,
          management: this.isManagement ? this.$route.name : null,
        },
      })
    },

    seeMore(item) {
      this.editChat(item)
      this.isPreview = true
    },

    editChat(item) {
      this.isPreview = false
      if (!this.isManagement && this.currentStatus === 'active') {
        this.setFeedback({
          message: this.$t('classroom.chat:feedback.edit.error.1'),
          type: 'error',
        })
        return
      }
      this.formData.title = this.isManagement ? item.course_name : this.Classroom.data.course.name
      this.formData.id = this.isManagement ? item.i_chatrooms : item.id
      this.formData.chat_id = this.isManagement ? item.i_chats : this.$route.params.chat_id
      this.formData.name = this.isManagement ? item.title : item.name
      this.formData.description = item.meta.description || null
      this.formData.start_time = this.isManagement ? item.start_time : item.schedulePeriod.start
      this.formData.end_time = this.isManagement ? item.end_time : item.schedulePeriod.end
      this.formData.showTimeLeft = this.isManagement ? item.meta.showTimeLeft : item.showTimeLeft
      this.formData.file = item.image || null
      this.modalChatActive = true
    },

    remove(id) {
      let chatroomData = {
        id: id,
      }
      this.modalConfirmDelete = false
      this.setFetching(true)
      this.attemptChatroomRemove(chatroomData)
        .then(() => {
          this.formData = {}
          this.isManagement ? this.refreshData() : this.loadChatrooms()
          this.resetForm()
        })
        .catch(({ response }) => {
          this.setFeedback({
            message: this.$t('classroom.chat:feedback.remove.error.' + response.data.message),
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    activateToggle(item) {
      const params = {
        id: this.isManagement ? item.i_chatrooms : item.id,
        active: this.isManagement ? !item.chatroom_active : !item.active,
      }
      this.setFetching(true)
      this.attemptChatroomToggle(params)

        .then(() => {
          const status = this.isManagement ? item.chatroom_active : item.active
          this.setFeedback({
            message: !status
              ? this.$t('global:management.activated')
              : this.$t('global:management.deactivated'),
          })
          this.isManagement ? this.refreshData() : this.loadChatrooms()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    removeConfirmationModal(chatroom) {
      this.modalConfirmDelete = true
      this.chat_id = this.isManagement ? chatroom.i_chatrooms : chatroom.id
    },

    resetForm() {
      this.formData = {
        id: null,
        chat_id: null,
        name: null,
        file: null,
        start_time: null,
        end_time: null,
      }

      this.$v.$reset()
    },
    closeModalAddChat() {
      this.modalChatActive = false
      this.resetForm()
    },

    submitUpdate() {
      let data = this.parseFormData()
      data.chatroomId = this.formData.id
      this.setFetching(true)
      this.attemptChatRoomUpdate(data)
        .then(() => {
          this.isManagement ? this.refreshData() : this.pgtrRefresh()
          this.closeModalAddChat()
          this.setFeedback({ message: this.$t('global:edit.success') })
        })
        .catch(({ response }) => {
          let message = this.$t('classroom.chat:feedback.edit.error')
          if (response.data.message === 'start_should_not_be_greater_than_end') {
            message = this.$t(
              'classroom.chat:feedback.create.error.start_should_not_be_greater_than_end'
            )
          }
          if (response.data.message === 'chat_already_started') {
            message = this.$t('classroom.chat:feedback.edit.error.chat_has_started')
          }
          this.setFeedback({ message: message })
          this.modalChatActive = true
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    parseFormData() {
      return {
        chat_id: this.formData.chat_id,
        end_time: this.formData.end_time
          ? format(parseISO(this.formData.end_time), 'yyyy-MM-dd HH:mm')
          : null,
        image: this.formData.file,
        name: this.formData.name,
        description: this.formData.description,
        start_time: this.formData.start_time
          ? format(parseISO(this.formData.start_time), 'yyyy-MM-dd HH:mm')
          : null,
        show_time_left: this.formData.showTimeLeft,
        sessions_ids: this.formData.sessions_ids,
      }
    },
  },
}
