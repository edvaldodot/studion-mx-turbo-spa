<template>
  <modal :active="true" @close="goToLibrary()" is-page onlyCloseOneModal>
    <div class="modal-form">
      <span class="modal-subtitle">
        {{$t('classroom.library:modal.add.folder.subtitle')}}
      </span>

      <h2 class="modal-title text-color">
        {{ formData.id ? $t('classroom.library:modal.add.folder.title.edit') : $t('classroom.library:modal.add.folder.title.add') }}
      </h2>

      <form @submit.prevent="submitFolder">
        <input-field
          v-model="formData.name"
          :label="$t('global:form.title')"
          :counter="100"
          :validation="$v.formData.name"
          dark
        />

        <textarea-field
          v-model="formData.description"
          :label="$t('global:form.description')"
          :counter="280"
          :rows="1"
          :max-rows="5"
          :validation="$v.formData.description"
          auto-grow
          dark
        />

        <folder-selector
          v-if="isEditing"
          v-model="formData.parent"
          :validation="$v.formData.parent"
          dark
        />

        <div class="form-submit text-center">
          <action
            :text="formData.id ? $t('global:save') : $t('global:create')"
            type="button"
            secondary
            large
            submit
            fixed-width
          />
        </div>
      </form>
    </div>
  </modal>
</template>

<script>
import { mapActions } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import Modal from '@/components/general/Modal'
import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import TextareaField from '@/components/general/TextareaField'
import FolderSelector from '../../components/FolderSelector'
export default {
  components: {
    Modal,
    Action,
    FolderSelector,
    InputField,
    TextareaField
  },
  props: {
    folder: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      formData: {
        name: '',
        description: '',
        parent: this.$route.params.parentId,
        id: null
      }
    }
  },
  computed: {
    isEditing () {
      return !!this.folder.id
    }
  },
  validations () {
    return {
      formData: {
        name: {
          required
        },
        parent: {
          required
        }
      }
    }
  },
  created () {
    if (!this.folder.id) return
    this.formData = {
      name: this.folder.title,
      description: this.folder.description,
      parent: this.$route.params.parentId,
      id: this.folder.id
    }
  },
  methods: {
    ...mapActions([
      'attemptAddSessionLibraryFolder',
      'attemptUpdateSessionLibraryFolder',
      'setFetching',
      'setFeedback'
    ]),
    async submitFolder () {
      try {
        if (this.$v.formData.$invalid) return
        const payload = {
          formData: this.formData,
          sessionUuid: this.$route.params.session_uuid
        }
        this.setFetching(true)
        this.formData.id ? await this.attemptUpdateSessionLibraryFolder(payload) : await this.attemptAddSessionLibraryFolder(payload)
        this.setFeedback({
          message: this.getSuccessMessage(),
          type: 'success'
        })
        this.$emit('update')
        this.goToLibrary()
      } catch ({ response }) {
        this.setFeedback({
          message: this.getErrorMessage(response),
          type: 'error'
        })
      } finally {
        this.setFetching(false)
      }
    },
    /**
     * get backend error responses and returns the correct
     * translated message
     * @param {Object} errorResponse
     */
    getErrorMessage (errorResponse) {
      let message = this.$t('global:error')

      if (!errorResponse.data || !errorResponse.data.message) return message

      const responseMessage = errorResponse.data.message

      if (
        responseMessage === 'parent_can_not_be_same_folder' ||
        responseMessage === 'parent_can_not_be_its_child'
      ) {
        message = this.$t('library:feedback.edit.folder.same.place.error')
      }
      if (responseMessage === 'folder_already_exists') {
        message = this.$t('library:feedback.upload.file.error.folder.duplicate')
      }

      return message
    },
    getSuccessMessage () {
      return this.isEditing
        ? this.$t('classroom.library:modal.add.folder.feedback.edit.success')
        : this.$t('classroom.library:modal.add.folder.feedback.create.success')
    },
    goToLibrary () {
      this.$router.push({
        name: 'classroom.sessionLibrary',
        params: {
          session_uuid: this.$route.params.session_uuid
        }
      })
    }
  }
}
</script>
