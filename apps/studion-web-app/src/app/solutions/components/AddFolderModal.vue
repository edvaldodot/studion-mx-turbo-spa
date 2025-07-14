<script>
import { defineComponent } from 'vue'
import { required } from 'vuelidate/lib/validators'

import InputField from '@/components/general/InputField'
import TextareaField from '@/components/general/TextareaField'
import Modal from '@/components/general/Modal'
import Action from '@/components/general/Action'
import { mapActions } from 'vuex'

export default defineComponent({
  name: 'AddFolderModal',

  components: {
    Modal,
    InputField,
    TextareaField,
    Action,
  },

  props: {
    parentId: {
      type: Number || String,
      default: null,
    },
  },

  data() {
    return {
      formData: {
        type: 'folder',
        id: null,
        name: '',
        description: '',
        parent_folder_id: null,
      },
    }
  },

  validations: {
    formData: {
      type: { required },
      name: {
        required,
      },
    },
  },

  mounted() {
    this.formData.parent_folder_id = this.parentId
  },

  methods: {
    ...mapActions(['setFeedback', 'setFetching', 'attemptCreateCourseFolder']),
    submit() {
      this.$v.$touch()
      if (this.$v.$invalid) return

      this.add()
    },

    add() {
      this.setFetching(true)
      const courseId = this.$route.params.id
      this.attemptCreateCourseFolder({ courseId: courseId, formData: this.formData })
        .then(({ data }) => {
          this.setFeedback({
            message: this.$t('library:feedback.upload.folder'),
          })

          this.$emit('close')
          this.$emit('refresh', data)
        })
        .catch((error) => {
          if (error.response.data.message === 'folder_already_exist') {
            this.setFeedback({
              message: this.$t('library:feedback.upload.file.error.folder.duplicate'),
              type: 'error',
            })
          } else {
            this.setFeedback({
              message: this.$t('library:feedback.upload.file.error'),
              type: 'error',
            })
          }
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
})
</script>

<template>
  <Modal
    :active="true"
    is-page
    @close="$emit('close')"
  >
    <div class="modal-form">
      <span class="modal-subtitle">{{ $t('library:modal.subtitle') }}</span>

      <h2 class="modal-title">
        {{ $t(`library:modal.title.${formData.id ? 'edit' : 'add'}.folder`) }}
      </h2>

      <form
        class="center"
        @submit.prevent="submit"
      >
        <InputField
          v-model="formData.name"
          :label="$t('global:form.title')"
          :counter="100"
          :validation="$v.formData.name"
          dark
        />

        <TextareaField
          v-model="formData.description"
          :label="$t('global:form.description')"
          :counter="280"
          :rows="1"
          :max-rows="5"
          auto-grow
          dark
        />

        <div class="form-submit text-center">
          <Action
            :text="$t(`global:${formData.id ? 'save' : 'create'}`)"
            type="button"
            dark
            primary
            large
            submit
            fixed-width
          />
        </div>
      </form>
    </div>
  </Modal>
</template>
