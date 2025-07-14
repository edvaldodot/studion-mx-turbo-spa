<script>
import { defineComponent } from 'vue'
import { mapActions, mapState } from 'vuex'
import { required, requiredIf } from 'vuelidate/lib/validators'

import Action from '@/components/general/Action'
import InputField from '@/components/general/InputField'
import Modal from '@/components/general/Modal'
import Radio from '@/components/general/Radio'
import FormSection from '@/components/general/FormSection'
import Upload from '@/components/general/Upload'
import TextEditor from '@/components/general/TextEditor'

export default defineComponent({
  name: 'ModalEditAccessMessage',

  components: {
    Action,
    InputField,
    Modal,
    Radio,
    FormSection,
    Upload,
    TextEditor,
  },

  data() {
    return {
      showModal: true,
      formData: {
        id: null,
        title: null,
        type: 'message',
        message: null,
        file: null,
      },
      types: [
        {
          value: 'message',
          label: this.$t('accessMessage:form.radio.text'),
        },
        {
          value: 'image',
          label: this.$t('accessMessage:form.radio.image'),
        },
      ],
    }
  },

  validations: {
    formData: {
      title: { required },
      message: {
        required: requiredIf(function () {
          return this.formData.type === 'message'
        }),
      },
      file: {
        required: requiredIf(function () {
          return this.formData.type === 'image'
        }),
      },
      type: { required },
    },
  },

  computed: {
    ...mapState(['accessibility']),
    isEditing() {
      return !!this.$route.params.id
    },
    titleLabel() {
      return this.formData.type === 'message'
        ? this.$t(`global:form.title`)
        : this.$t(`global:form.title.image`)
    },
  },

  mounted() {
    let accessMessageId = parseInt(this.$route.params.id)

    if (accessMessageId > 0) {
      this.formData.id = accessMessageId
      this.getAccessMessage(accessMessageId).then(({ data }) => {
        this.$set(this, 'formData', { ...this.formData, ...data })
      })
    }
  },

  methods: {
    ...mapActions(['saveAccessMessage', 'getAccessMessage', 'setFeedback']),

    handleSubmit() {
      if (this.formData.type === 'message') {
        this.formData.file = null

        if (this.formData.message) {
          this.formData.message = this.formData.message.trimEnd()
        }
      }

      this.$v.$touch()

      if (!this.$v.$invalid) {
        this.saveAccessMessage(this.formData).then(() => {
          this.$router.push({ name: 'settings.dashboard' })
          let typeAction = this.isEditing ? 'edited' : 'created'
          this.setFeedback({ message: this.$t(`accessMessage:feedback.${typeAction}.success`) })
        })
      }
    },
  },
})
</script>

<template>
  <Modal
    :data-testid="$testId('modal-edit-access-message')"
    :active="showModal"
    is-page
  >
    <div class="modal-form">
      <span class="modal-subtitle">{{ $t(`accessMessage:context.name`) }}</span>

      <h2 class="modal-title text-color">{{ $t('accessMessage:' + (isEditing ? 'edit' : 'create')) }}</h2>

      <form @submit.prevent="handleSubmit">
        <FormSection>
          <Radio
            v-model="formData.type"
            :description="$t('accessMessage:form.radio.type')"
            :validation="$v.formData.type"
            :items="types"
            horizontal
            dark
          />
        </FormSection>

        <InputField
          v-if="formData.type === 'message'"
          v-model.trim="formData.title"
          :label="titleLabel"
          :dark="true"
          :validation="$v.formData.title"
          :counter="120"
          type="text"
        />

        <TextEditor
          v-show="formData.type === 'message'"
          v-model="formData.message"
          :rows="1"
          :max-rows="20"
          :label="$t(`accessMessage:create.description`)"
          :validation="$v.formData.message"
        />

        <FormSection v-show="formData.type === 'image'">
          <Upload
            v-model="formData.file"
            :icon="'image-multiple'"
            :label="$t('global:upload.add.image')"
            :cropper="true"
            :free-crop="true"
            :validation="$v.formData.file"
            dark
          />
        </FormSection>

        <InputField
          v-if="formData.type === 'image'"
          v-model.trim="formData.title"
          :validation="$v.formData.title"
          :label="titleLabel"
          :dark="true"
          :counter="120"
          type="text"
        />

        <div class="form-submit text-center">
          <Action
            :text="isEditing ? $t('global:form.save') : $t('global:register')"
            type="button"
            fixed-width
            secondary
            large
            submit
          />
        </div>
      </form>
    </div>
  </Modal>
</template>
