<script>
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import filesizeValidator from '@/support/customValidators/filesizeValidator'

import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import TextareaField from '@/components/general/TextareaField'
import Modal from '@/components/general/Modal'
import Upload from '@/components/general/Upload'

const imageSize = 5 * 1024 * 1024

export default {
  name: 'modalEditFeaturedContent',
  components: {
    Action,
    InputField,
    TextareaField,
    Modal,
    Upload
  },
  data () {
    return {
      showModal: true,
      uploadWidth: 520,
      uploadHeight: 130,
      formData: {
        id: null,
        file: null,
        url: null,
        title: null,
        description: null,
        active: true
      }
    }
  },
  validations: {
    formData: {
      file: {
        required,
        fileSize: filesizeValidator(imageSize)
      },
      url: { required },
      title: { required },
      description: { required }
    }
  },
  created () {
    if (this.isCardsBannersLayout()) {
      this.uploadWidth = 273
      this.uploadHeight = 240
    }
  },
  mounted () {
    let featuredContentId = parseInt(this.$route.params.id)

    if (featuredContentId > 0) {
      this.formData.id = featuredContentId
      this.getFeaturedContent(featuredContentId).then(({ data }) => {
        this.$set(this, 'formData', { ...data })
      })
    }
  },
  computed: {
    ...mapState(['accessibility']),
    isEditing () {
      return !!this.$route.params.id
    }
  },
  methods: {
    ...mapActions([
      'saveFeaturedContent',
      'getFeaturedContent',
      'setFeedback'
    ]),
    handleSubmit () {
      this.formData.description = this.formData.description ? this.formData.description.trimEnd() : ''
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.saveFeaturedContent(this.formData).then(() => {
          this.$router.push({ name: 'settings.dashboard' })
          let typeAction = this.isEditing ? 'edited' : 'created'
          this.setFeedback({ message: this.$t(`featuredContent:feedback.${typeAction}.success`) })
        })
      }
    }
  }
}
</script>

<template>
  <modal :active="showModal" is-page>
    <div class="modal-form">
      <span class="modal-subtitle">{{ $t(`featuredContent:context.name`) }}</span>
      <h2 class="modal-title text-color">{{ $t('featuredContent:' + (isEditing ? 'edit' : 'create')) }}</h2>
      <form @submit.prevent="handleSubmit">
        <upload
          :icon="'image-multiple'"
          :label="$t('global:upload.add.image')"
          cropper
          :width="uploadWidth"
          :height="uploadHeight"
          v-model="formData.file"
          :validation="$v.formData.file"
          dark
        >
        </upload>
        <input-field
          type="text"
          :label="$t(`featuredContent:form.url`)"
          v-model.trim="formData.url"
          :dark="true"
          :validation="$v.formData.url"
        />
        <input-field
          type="text"
          :label="$t(`global:form.title`)"
          v-model.trim="formData.title"
          :dark="true"
          :validation="$v.formData.title"
          :counter="40"
        />
        <TextareaField
          :label="$t(`featuredContent:create.description`)"
          v-model="formData.description"
          :dark="true"
          :validation="$v.formData.description"
          :rows="3"
          :counter="225"
        />
        <div class="form-submit text-center">
          <action
            type="button"
            secondary
            large
            submit
            fixed-width
            :text="isEditing ? $t('global:form.save') : $t('global:register')"
          ></action>
        </div>
      </form>
    </div>
  </modal>
</template>
