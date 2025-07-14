<script>
import i18n from '@/support/i18n'

import { mapActions, mapGetters } from 'vuex'

import filesizeValidator from '@/support/customValidators/filesizeValidator'
import mimeTypeValidator from '@/support/customValidators/mimeTypeValidator'

import Checkbox from '@/components/general/Checkbox'
import EmptyMessage from '@/components/general/EmptyMessage'
import FileField from '@/components/general/FileField'
import FormSection from '@/components/general/FormSection'
import ValidationMessage from '@/components/general/ValidationMessage'

import DataTableFiles from './components/DataTableFiles'

export default {
  name: 'FilesForm',

  components: {
    Checkbox,
    DataTableFiles,
    EmptyMessage,
    FileField,
    FormSection,
    ValidationMessage,
  },

  props: {
    allowFileLabel: {
      type: String,
      default: 'solutions.create.classes:modal.question.send_file.allow_model',
    },

    dark: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    value: {
      type: Object,
      default: () => ({}),
    },

    validation: {
      type: Object,
      default: () => ({}),
    },

    review: {
      type: Boolean,
      default: false,
    },

    studentMode: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      tempFile: null,
    }
  },

  validations() {
    const FILE_SIZE_LIMIT = this.validation.files
      ? this.validation.files.$params.maxSizeAllowed.sizeLimit
      : 104857600

    let ALLOWED_MIME_TYPES = []

    if (this.filesQuotaAllowedMimeTypes && this.filesQuotaAllowedMimeTypes.length) {
      ALLOWED_MIME_TYPES = this.filesQuotaAllowedMimeTypes
    }

    return {
      tempFile: {
        fileSize: filesizeValidator(FILE_SIZE_LIMIT),
        mimeType: mimeTypeValidator(ALLOWED_MIME_TYPES),
      },
    }
  },

  computed: {
    ...mapGetters(['filesQuotaAllowedMimeTypes']),

    disabledAttachButton() {
      const { maxFilesLength } = this.validation.files.$params
      const onLengthLimit = this.value.files && this.value.files.length >= maxFilesLength.max

      return onLengthLimit || this.review
    },
  },

  created() {
    if (!this.value.files) {
      this.value.files = []
    }
  },

  methods: {
    ...mapActions(['setFeedback']),

    /**
     * Check if file is already added.
     * @param {string}
     */
    checkFile(fileName) {
      const file = this.value.files.find(
        (file) => file.name === fileName || file.originalName === fileName
      )

      if (file) {
        this.setFeedback({
          message: i18n.t('solutions.create.classes:feedback.create.error:asset.already.exists'),
          type: 'error',
        })
      }

      return Boolean(file)
    },

    resetTempFile() {
      this.tempFile = null
      const fileInput = this.$refs.file
      if (!fileInput) return
      fileInput.clear()
    },

    addFile(assets) {
      this.validation.files.$touch()
      if (!this.validation.files.maxFilesLength || !this.validation.files.maxSizeAllowed)
        return this.resetTempFile()

      const [selectedFile] = Array.from(assets)

      if (this.checkFile(selectedFile.name)) return this.resetTempFile()

      this.$v.tempFile.$touch()
      if (this.$v.tempFile.$invalid) return

      this.resetTempFile()
      this.value.files.push(selectedFile)

      this.$emit('add-file')
    },

    async removeFile(index) {
      this.value.files.splice(index, 1)
      this.$emit('remove-file')
    },

    checkAllowFile(isAllowed) {
      if (isAllowed) return
      this.value.files = []
    },
  },
}
</script>
<template>
  <form-section
    class="files-form"
    :class="{ 'theme-dark': dark }"
  >
    <checkbox
      v-if="!studentMode"
      v-model="value.allowFile"
      :items="[{ value: true, label: $t(allowFileLabel) }]"
      :disabled="disabled"
      switch-type
      :dark="dark"
      @input="checkAllowFile"
    />

    <template v-if="value.allowFile || studentMode">
      <file-field
        ref="file"
        v-model="tempFile"
        :validation="$v.tempFile"
        :label="$t('global:form.attach.file')"
        :disabled="disabled || disabledAttachButton"
        :apply-margin="false"
        class="mt-8"
        :dark="dark"
        :accept="filesQuotaAllowedMimeTypes.join(',')"
        @input="addFile"
      />

      <data-table-files
        v-if="value.files && value.files.length"
        :items="value.files"
        :disabled="disabled || review"
        :dark="dark"
        @remove-file="removeFile"
      />

      <empty-message v-else>
        <p class="text-color">
          {{ $t('solutions.create.classes:modal.question.send_file.empty.message') }}
        </p>
      </empty-message>
    </template>

    <validation-message
      v-if="!disabled"
      :validation="validation.files"
    />
  </form-section>
</template>

<style lang="scss">
@import './FilesForm.scss';
</style>
