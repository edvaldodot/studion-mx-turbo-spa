<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import Modal from '@/components/general/Modal'

import ConferenceFolderSelector from '../../components/ConferenceFolderSelector'

export default {
  name: 'ModalMoveFolder',
  components: {
    Action,
    Modal,
    ConferenceFolderSelector,
  },

  props: {
    id: {
      type: Number,
      default: null,
    },
    folderId: {
      type: Number,
      default: 0,
    },
  },

  data() {
    return {
      selectedFolder: this.folderId,
      conferenceName: null,
    }
  },

  computed: {
    ...mapState(['Classroom']),
  },

  validations: {
    selectedFolder: {
      required,
    },
  },

  created() {
    const payload = {
      sessionId: this.Classroom.data.id,
      folderId: this.id,
    }
    this.setFetching(true)
    this.attemptGetConferenceFolderById(payload)
      .then(({ data }) => {
        this.conferenceName = data.name
        this.selectedFolder = (data.conferenceRoomFolder && data.conferenceRoomFolder.id) || this.folderId
      })
      .finally(() => {
        this.setFetching(false)
      })
  },

  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptMoveItemToFolder',
      'attemptGetConferenceFolderById',
    ]),
    closeModalAddConference() {
      this.$emit('conference-saved')
      this.$router.push({
        name: 'classroom.conference',
        params: { folderId: this.$route.params.folderId },
      })
    },
    submit() {
      const payload = {
        type: 'folder',
        id: this.id,
        folderId: this.selectedFolder,
      }

      this.setFetching(true)
      this.attemptMoveItemToFolder(payload)
        .then(() => {
          this.closeModalAddConference()
          this.setFeedback({
            type: 'success',
            message: this.$t('classroom.library:modal.move.folder.success'),
          })
        })
        .catch(({ response }) => {
          if (response.data.message === 'destination_folder_is_child') {
            this.setFeedback({
              type: 'error',
              message: this.$t('classroom.library:modal.move.folder.error.is.child'),
            })
            return
          }
          this.setFeedback({
            type: 'error',
            message: this.$t('classroom.library:modal.move.folder.error'),
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
}
</script>

<template>
  <Modal
    active
    class="conference-room-modal"
    is-page
    @close="closeModalAddConference()"
  >
    <div class="modal-form">
      <span class="modal-subtitle">{{ $t('classroom.library:modal.move.conference.subtitle') }}</span>
      <h2 class="modal-title is-capitalize">{{ conferenceName }}</h2>
      <div class="modal-description">
        <p>{{ $t('classroom.library:modal.move.conference.description') }}</p>
      </div>
      <form @submit.prevent="submit">

        <ConferenceFolderSelector
          v-model="selectedFolder"
          :validation="$v.selectedFolder"
          :filter="id"
          dark
        />

        <div class="form-submit text-center">
          <Action
            :text="$t('global:save')"
            :disabled="$v.$invalid"
            type="button"
            secondary
            large
            submit
            fixed-width
          />
        </div>
      </form>
    </div>
  </Modal>
</template>
