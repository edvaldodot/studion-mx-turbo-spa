<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'

export default {
  name: 'ModalAddConferenceFolder',
  components: {
    Action,
    InputField,
    Modal,
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
    isEditing: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      formData: {
        id: null,
        name: null,
        description: null,
      },
    }
  },

  computed: {
    ...mapState(['Classroom']),
  },

  created() {
    if (this.isEditing) {
      const payload = {
        sessionId: this.Classroom.data.id,
        folderId: this.$route.params.id,
      }
      this.setFetching(true)
      this.attemptGetConferenceFolderById(payload)
        .then(({ data }) => {
          this.formData = data
        })
        .finally(() => {
          this.setFetching(false)
        })
    }
  },

  validations: {
    formData: {
      name: {
        required,
      },
    },
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptConferenceFolderAdd',
      'attemptGetConferenceFolderById',
      'attemptConferenceFolderUpdate',
    ]),
    closeModalAddConference() {
      this.$emit('conference-saved')
      this.$router.push({
        name: 'classroom.conference',
        params: { folderId: this.$route.params.folderId },
      })
    },
    addNewConferenceFolder(payload) {
      this.setFetching(true)
      this.attemptConferenceFolderAdd(payload)
        .then(() => {
          this.setFeedback({
            type: 'success',
            message: this.$t('classroom.library:modal.add.folder.success'),
          })
        })
        .finally(() => {
          this.setFetching(false)
          this.closeModalAddConference()
        })
    },
    editConferenceFolder(payload) {
      this.setFetching(true)
      this.attemptConferenceFolderUpdate(payload)
        .then(() => {
          this.setFeedback({
            type: 'success',
            message: this.$t('classroom.library:modal.update.folder.success'),
          })
        })
        .finally(() => {
          this.setFetching(false)
          this.closeModalAddConference()
        })
    },
    submit() {
      const payload = {
        id: this.formData.id,
        name: this.formData.name,
        description: this.formData.description,
        sessionId: this.Classroom.data.id,
        parent: this.folderId,
      }
      this.isEditing ? this.editConferenceFolder(payload) : this.addNewConferenceFolder(payload)
    },
  },
}
</script>

<template>
  <div>
    <Modal
      :active="true"
      class="conference-room-modal"
      is-page
      @close="closeModalAddConference()"
    >
      <div class="modal-form">
        <span class="modal-subtitle">{{ $t('classroom.library:modal.add.folder.subtitle') }}</span>
        <h2 class="modal-title is-capitalize">{{ $t('classroom.library:modal.add.folder.title.add') }}</h2>
        <form @submit.prevent="submit">
          <InputField
            v-model="formData.name"
            :label="$t('global:form.title')"
            :counter="100"
            :validation="$v.formData.name"
            dark
          />

          <InputField
            v-model="formData.description"
            :label="$t('global:form.description')"
            :counter="280"
            dark
          />

          <div class="form-submit text-center">
            <Action
              :text="formData.id ? $t('global:save') : $t('global:create')"
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
  </div>
</template>
<style lang="scss">

</style>
