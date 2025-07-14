<template>
  <modal :active="true" @close="goToLibrary" is-page cancel onlyCloseOneModal>
    <div class="modal-form">
      <span class="modal-subtitle">{{ $t('classroom.library:modal.add.subtitle') }}</span>

      <h2 class="modal-title text-color is-capitalize">{{ Classroom.data.course.name }}</h2>

      <div class="modal-description text-color">
        <p class="text-color">{{ $t('classroom.library:modal.add.description') }}</p>
      </div>

      <form @submit.prevent="submit">
        <select-field
          v-model="formData.type"
          :label="$t('global:form.type')"
          :show-optional="false"
          :items="fileTypeOptions"
          :validation="$v.formData.type"
          :disabled="isEditing"
          @input="resetMediaForm"
        />

        <input-field
          v-model="formData.title"
          :label="$t('global:form.title')"
          :disabled="isEditing"
          :counter="100"
          :validation="$v.formData.title"
          dark
        />

        <textarea-field
          v-model="formData.description"
          :label="$t('global:form.description')"
          :disabled="isEditing"
          :counter="500"
          :rows="1"
          :max-rows="5"
          :validation="$v.formData.description"
          auto-grow
          dark
        />

        <folder-selector
          v-model="formData.folderId"
          :validation="$v.formData.folderId"
          dark
        />
        <div v-if="formData.type === 'file'">
          <file-field
            v-model="formData.file"
            :disabled="isEditing"
            :label="$t('global:form.attach.file')"
            :validation="$v.formData.file"
            dark
          />
        </div>
        <div v-if="formData.type === 'external_link'">
          <input-field
            v-model="formData.url"
            :disabled="isEditing"
            :label="$t('global:external.media.url')"
            :validation="$v.formData.url"
            dark
          />
        </div>
        <div class="form-submit text-center">
          <action
            :text="isEditing ? $t('global:edit') : $t('global:add')"
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
import { mapState, mapActions, mapGetters } from 'vuex'
import { required, requiredIf, url } from 'vuelidate/lib/validators'
import fileSize from '@/support/customValidators/filesizeValidator'

import Modal from '@/components/general/Modal'
import SelectField from '@/components/general/SelectField'
import InputField from '@/components/general/InputField'
import TextareaField from '@/components/general/TextareaField'
import FileField from '@/components/general/FileField'
import Action from '@/components/general/Action'
import FolderSelector from '../../components/FolderSelector'

const FILE_LIMIT_SIZE_IN_BYTES = 500 * 1024 * 1024

export default {
  name: 'ModalAddMedia',
  components: {
    Modal,
    SelectField,
    InputField,
    TextareaField,
    FileField,
    Action,
    FolderSelector
  },
  props: {
    media: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      formData: {
        type: 'file',
        title: '',
        description: '',
        file: null,
        url: '',
        folderId: null,
        mediaId: null
      }
    }
  },
  computed: {
    ...mapState(['Classroom']),
    ...mapGetters(['classroomBranchIds']),
    fileTypeOptions () {
      return [
        {
          text: this.$tc('global:attachment', 1),
          value: 'file'
        },
        {
          text: this.$t('global:external.media'),
          value: 'external_link'
        }
      ]
    },
    isEditing () {
      return !!(this.media && this.media.id)
    }
  },
  validations: {
    formData: {
      title: {
        required
      },
      description: {
        required
      },
      url: {
        url,
        required: requiredIf(function () {
          return this.formData.type === 'external_link'
        })
      },
      file: {
        required: requiredIf(function () {
          return this.formData.id === undefined && this.formData.type === 'file'
        }),
        fileSize: function () {
          return this.formData && this.formData.type === 'file'
            ? fileSize(FILE_LIMIT_SIZE_IN_BYTES)
            : true
        },
      },
      folderId: {
        required
      }
    }
  },
  created () {
    if (this.media) {
      this.formData.mediaId = this.media.id
      this.formData.title = this.media.title
      this.formData.description = this.media.description
      this.formData.type = this.media.metaType
      this.formData.folderId = this.media.folderId
      this.formData.file = this.media.fileName
      this.formData.url = this.media.url
    }
  },
  methods: {
    ...mapActions([
      'attemptLibraryFileCreationOnResource',
      'attemptMoveLibraryFile',
      'attemptQuotaRetrieval',
      'setFetching',
      'setFeedback'
    ]),
    resetMediaForm () {
      this.$v.$reset()
    },
    async submit () {
      if (!this.isEditing) {
        this.addNewMedia()
        return
      }
      await this.editMedia()
    },
    addNewMedia () {
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.setFetching(true)
        const resource = {
          resourceName: 'sessions',
          resourceId: this.$route.params.session_uuid
        }
        if (this.$isEnabledFeature('branching')) this.formData.branchIds = this.classroomBranchIds
        this.attemptLibraryFileCreationOnResource({ data: this.formData, resource })
          .then(() => {
            this.setFeedback({ message: this.$t('library:feedback.upload.file') })
            this.$emit('update')
            this.goToLibrary()
          }).catch(() => {
            this.setFeedback({ message: this.$t('library:feedback.upload.file.error'), type: 'error' })
          }).finally(() => {
            this.setFetching(false)
          })
      }
    },
    async editMedia () {
      try {
        const data = {
          fileId: this.formData.mediaId,
          parentId: this.formData.folderId,
          sessionUuid: this.$route.params.session_uuid
        }
        this.setFetching(true)
        await this.attemptMoveLibraryFile(data)
        this.setFeedback({ message: this.$t('library:feedback.edit.file') })
        this.$emit('update')
        this.goToLibrary()
      } catch (error) {
        this.setFeedback({ message: this.$t('library:feedback.edit.file.error'), type: 'error' })
      } finally {
        this.setFetching(false)
      }
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
