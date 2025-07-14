<script>
import { mapActions, mapState } from 'vuex'
import { required, requiredIf } from 'vuelidate/lib/validators'
import { format } from 'date-fns'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import InputField from '@/components/general/InputField'
import SelectField from '@/components/general/SelectField'
import Modal from '@/components/general/Modal'
import Upload from '@/components/general/Upload'

const ModalConfirm = () => import('@/components/general/ModalConfirm')
const TextEditor = () => import('@/components/general/TextEditor')
const TagSelector = () => import('@/components/general/TagSelector')

export default {
  name: 'ModalAddCertificate',
  components: {
    Action,
    Checkbox,
    InputField,
    SelectField,
    Modal,
    ModalConfirm,
    Upload,
    TextEditor,
    TagSelector,
  },
  mixins: [formScrollValidationMixin],
  data() {
    return {
      formData: {
        id: null,
        style: null,
        description: null,
        content: null,
        backgroundFront: null,
        hasBack: false,
        templateId: null,
        contentBack: null,
        backgroundBack: null,
      },
      modalCustom: false,
      backgroundImageSrc: '/assets/images/themes/default/fto/certificado1_frente_fundo.png',
      backBackgroundImageSrc: '/assets/images/themes/default/fto/certificado1_frente_fundo.png',
      availableTags: {
        path: '',
        solution: '',
      },
      availableTemplates: [],
      modalConfirmEdit: false,
      editingSide: 'front',
    }
  },
  validations: {
    formData: {
      style: {
        required,
      },
      templateId: {
        required,
      },
      description: {
        required,
      },
      content: {
        required,
      },
      backgroundFront: {},
      backgroundBack: {},
      contentBack: {
        required: requiredIf(function () {
          return this.formData.hasBack
        }),
      },
      hasBack: {},
    },
  },
  computed: {
    ...mapState(['fetching']),
    today() {
      return format(new Date(), 'yyyy-MM-dd')
    },
    isEditing() {
      return this.$route.meta.editing
    },
    hasWriteAccess() {
      return this.notEqualsProfile('student') && this.canWrite('settings')
    },
    hasReadAccess() {
      return this.notEqualsProfile('student') && this.canRead('settings')
    },
    tagsToShow() {
      let finalResult = ''
      if (this.formData.style) {
        finalResult =
          this.formData.style === 'solution' ? this.availableTags.solution : this.availableTags.path
      }
      return finalResult
    },
    stylesOptions() {
      const styles = [{ text: this.$t('global:solution'), value: 'solution' }]
      if (this.$isEnabledFeature('certificate_paths')) {
        styles.push({ text: this.$t('global:trail'), value: 'path' })
      }
      return styles
    },
    templatesOptions() {
      return this.availableTemplates.map((template) => {
        const translateTitleKeyPart = 'settings.certificate:modal.form.template.options.'
        let translatedTitle = template.title

        if (this.$te(`${translateTitleKeyPart}${template.title.toLowerCase()}`)) {
          translatedTitle = this.$t(`${translateTitleKeyPart}${template.title.toLowerCase()}`)

          if (template.alias === 'deprecated' || template.alias === 'default') {
            translatedTitle = `${translatedTitle} (${this.$t(
              `settings.certificate:modal.form.template.alias.${template.alias}`
            )})`
          }
        }

        return {
          text: translatedTitle,
          value: template.id,
        }
      })
    },
    hasCertificateHashOnContent() {
      if (!this.formData.content && !this.formData.contentBack) return false
      const hashInFront =
        this.formData.content && this.formData.content.includes('certificate_hash')
      const hashInBack =
        this.formData.contentBack && this.formData.contentBack.includes('certificate_hash')
      return hashInFront || hashInBack
    },
    templateClass() {
      const selectedTemplate = this.availableTemplates.find((template) => {
        return template.id === this.formData.templateId
      })
      return selectedTemplate ? selectedTemplate.alias : 'default'
    },
    modalTitle() {
      if (this.editingSide === 'front') return this.$t('settings.certificate:modal.front')
      else return this.$t('settings.certificate:modal.back')
    },
  },
  created() {
    this.showTags()
    this.loadTemplates()

    if (this.isEditing) {
      this.setFetching(true)
      this.formData.id = this.$route.params.id
      this.attemptCertificateRetrieval(this.formData.id)
        .then(({ data }) => {
          this.setCertificateBackgrounds(data)
          this.formData.style = data.style.alias
          this.formData.description = data.description
          this.formData.content = this.formatContentTags(data.meta.content)
          this.formData.hasBack = data.hasBack
          this.formData.contentBack = data.meta.content_back
          this.formData.templateId = data.template.id

          this.$v.$reset()
        })
        .finally(() => {
          this.setFetching(false)
        })
    }
  },
  methods: {
    ...mapActions([
      'setFetching',
      'setFeedback',
      'attemptAvailableTagsRetrieval',
      'attemptCertificateCreation',
      'attemptCertificateRetrieval',
      'attemptCertificateUpdate',
      'attemptCertificateTemplateRetrieval',
    ]),
    formatContentTags(content) {
      const regex = /\{\{\s*([^{}]*?)\s*\}\}/g

      function replaceTag(_, group) {
        return `<span class="span-tag"><span contenteditable="false">{{ ${group} }}</span></span>`
      }

      return content.replace(regex, replaceTag)
    },
    openModalCustom(side) {
      this.editingSide = side
      this.modalCustom = true
      if (side === 'front') {
        this.formData.backgroundFront = null
      } else {
        this.formData.backgroundBack = null
      }
    },
    closeModalCustom() {
      this.modalCustom = false
    },
    uploadCertificateModel() {
      this.modalCustom = false
      if (this.editingSide === 'front') {
        this.$v.formData.backgroundFront.$touch()
        this.backgroundImageSrc = this.$refs.upload.getImageCropper({ width: 620, height: 440 })
      } else {
        this.$v.formData.backgroundBack.$touch()
        this.backBackgroundImageSrc = this.$refs.uploadBack.getImageCropper({
          width: 620,
          height: 440,
        })
      }
    },
    async evaluateSubmition() {
      const isFrontDirty =
        this.$v.formData.backgroundFront.$dirty || this.$v.formData.content.$dirty
      const isBackDirty =
        this.formData.hasBack &&
        (this.$v.formData.backgroundBack.$dirty || this.$v.formData.contentBack.$dirty)
      const isHasBackDirty =
        this.$isEnabledFeature('certificate_back') && this.$v.formData.hasBack.$dirty
      if (this.isEditing && !this.$v.$invalid && (isFrontDirty || isHasBackDirty || isBackDirty)) {
        this.modalConfirmEdit = true
        return
      }

      await this.submitCertificate()
    },

    async submitCertificate() {
      this.modalConfirmEdit = false
      this.$v.$touch()
      if (!this.$v.$invalid) {
        this.isEditing ? await this.submit('update') : await this.submit('create')
      }

      this.$nextTick(() => this.scrollToInputError(this.$refs.form))
    },

    handleCertificateAttemptThen(action = 'create') {
      const status = action === 'create' ? 'created' : 'updated'
      this.$router.push({ name: 'settings.certificate', params: { certificateChanged: true } })
      this.setFeedback({ message: this.$t(`settings.certificate:feedback.${status}.success`) })
      this.$emit('certificate-changed')
    },

    handleCertificateAttemptCatch(response) {
      const message = response.data.message
      let toastMessage = ''

      switch (message) {
        case 'invalid_certificate_description':
        case 'can_not_be_edit_default_certificate':
          toastMessage = 'settings.certificate:feedback.description.error'
          break
        default:
          toastMessage = 'settings.certificate:feedback.created.error'
      }

      this.setFeedback({ message: this.$t(toastMessage) })
    },

    /**
     * @description Setup data on formData
     */
    setupFormdata() {
      this.formData.content = this.clearNonPrintableChars(this.formData.content)
      if (this.formData.contentBack) {
        this.formData.contentBack = this.clearNonPrintableChars(this.formData.contentBack)
      }
    },

    /**
     * @description Clear non printable chars created by quill embed
     *
     * @param {String} str
     * @returns {String}
     */
    clearNonPrintableChars(str) {
      return str.replace(/[^\x20-\x7E\xC0-\xFF]/g, '')
    },

    async submit(action = 'create') {
      this.setFetching(true)
      this.setupFormdata()

      try {
        action === 'create'
          ? await this.attemptCertificateCreation(this.formData)
          : await this.attemptCertificateUpdate(this.formData)

        this.handleCertificateAttemptThen(action)
      } catch (err) {
        this.handleCertificateAttemptCatch(err.response)
      } finally {
        this.setFetching(false)
      }
    },

    showTags() {
      this.setFetching(true)

      let tempAvailableTags = {
        solution: {},
        path: {},
      }
      Promise.all([
        this.attemptAvailableTagsRetrieval({ filter: { style: 'solution' } }),
        this.attemptAvailableTagsRetrieval({ filter: { style: 'path' } }),
      ])
        .then((results) => {
          results.forEach((result) => {
            result.data.map((tag) => {
              tag.tagStyle.forEach((style) => {
                tempAvailableTags[style.style.alias][tag.alias] = tag.name
              })
            })
          })
          this.availableTags.path = Object.values(tempAvailableTags.path)
          this.availableTags.solution = Object.values(tempAvailableTags.solution)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    loadTemplates() {
      this.setFetching(true)
      this.attemptCertificateTemplateRetrieval()
        .then(({ data }) => {
          this.availableTemplates = data
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    /**
     * receives request data, verify if background exists and set instance backgrounds variables
     * @param {Object} data - certificate data from request
     */
    setCertificateBackgrounds(data) {
      const { meta, template } = data
      const defaultCertificateSrc =
        '/assets/images/themes/default/fto/certificado1_frente_fundo.png'
      if (meta.options.background) {
        this.backgroundImageSrc = meta.options.background.front
          ? meta.options.background.front
          : defaultCertificateSrc
        this.backBackgroundImageSrc = meta.options.background.back
          ? meta.options.background.back
          : defaultCertificateSrc
      } else {
        const templateBackground = template.meta.options.images.background_front
          ? template.meta.options.images.background_front
          : defaultCertificateSrc
        this.backBackgroundImageSrc = templateBackground
        this.backBackgroundImageSrc = templateBackground
      }
    },
  },
}
</script>

<template>
  <div>
    <Modal
      :active="!fetching && !modalCustom"
      class="modal-add-certificate"
      is-page
    >
      <div class="modal-form">
        <span class="modal-subtitle">{{ $t('settings:header.title') }}</span>
        <h2 class="modal-title text-color">
          {{
            isEditing
              ? $t('settings.certificate:modal.title.edit')
              : $t('settings.certificate:modal.title.add')
          }}
        </h2>
        <div class="modal-description text-color">
          <p class="text-color">{{ $t('settings.certificate:modal.description') }}</p>
        </div>
        <form
          ref="form"
          @submit.prevent="evaluateSubmition()"
        >
          <p class="form-item-description text-color mb-3">
            {{ $t('settings.certificate:modal.text.1') }}
          </p>
          <SelectField
            v-model="formData.style"
            :disabled="isEditing"
            :label="$t('settings.certificate:modal.form.type')"
            :items="stylesOptions"
            :validation="$v.formData.style"
            dark
          />
          <SelectField
            v-model="formData.templateId"
            :label="$t('settings.certificate:modal.form.template')"
            :items="templatesOptions"
            :validation="$v.formData.templateId"
            dark
          />
          <InputField
            v-model="formData.description"
            :label="$t('settings.certificate:modal.form.name')"
            :validation="$v.formData.description"
            :counter="120"
            dark
          />
          <div class="certificate-text-tags text-color">
            <h4>{{ $t('settings.certificate:modal.text.2.front') }}</h4>
            <p class="text-color">{{ $t('settings.certificate:modal.text.3', { TagsToShow: tagsToShow }) }}</p>
          </div>
          <TextEditor
            ref="frontText"
            class="certificate__text-editor"
            v-model="formData.content"
            :rows="5"
            :max-rows="20"
            :validation="$v.formData.content"
            enable-text-color
          >
            <template #before-tools>
              <TagSelector
                :tags="availableTags[formData.style] || []"
                :title="$t('text.editor:tag.selector.title')"
                tag-label="settings.certificate:modal.tags."
                @tag="$refs.frontText.addTag($event)"
              />
            </template>
          </TextEditor>
          <div
            :class="[templateClass]"
            class="certificate-preview-edit"
          >
            <img
              :src="backgroundImageSrc"
              class="certificate-preview-edit-image"
            />
            <div class="certificate-preview-edit-content">
              <div
                class="certificate-preview-edit-body"
                v-html="formData.content"
              ></div>
              <p
                v-if="!hasCertificateHashOnContent"
                class="hash"
              >
                {{ $t('settings.certificate:modal.validation.code') }} { certificate_hash }
              </p>
            </div>
            <button
              type="button"
              class="certificate-preview-edit-button"
              @click="openModalCustom('front')"
            >
              {{ $t('global:alter.image') }}
            </button>
          </div>

          <p class="certificate-preview-text-warning text-color">
            {{ $t('settings.certificate:modal.text.4', { TagsToShow: tagsToShow }) }}
          </p>

          <template v-if="$isEnabledFeature('certificate_back')">
            <div class="certificate-text-tags mt-3 text-color">
              <h4>{{ $t('settings.certificate:modal.text.2.back') }}</h4>
              <p class="text-color">{{ $t('settings.certificate:modal.text.3', { TagsToShow: tagsToShow }) }}</p>
            </div>

            <Checkbox
              v-model="formData.hasBack"
              :items="[{ value: true, label: $t('settings.certificate:modal.form.hasBack') }]"
              :validation="$v.formData.hasBack"
              class="mt-8"
              switch-type
              dark
            />
          </template>

          <template v-if="formData.hasBack">
            <TextEditor
              ref="backText"
              v-model="formData.contentBack"
              :rows="5"
              :max-rows="20"
              :validation="$v.formData.contentBack"
            >
              <template #before-tools>
                <TagSelector
                  :tags="availableTags[formData.style] || []"
                  :title="$t('text.editor:tag.selector.title')"
                  tag-label="settings.certificate:modal.tags."
                  @tag="$refs.backText.addTag($event)"
                />
              </template>
            </TextEditor>
            <div
              :class="[templateClass]"
              class="certificate-preview-edit"
            >
              <img
                :src="backBackgroundImageSrc"
                class="certificate-preview-edit-image"
              />
              <div class="certificate-preview-edit-content">
                <div
                  class="certificate-preview-edit-body"
                  v-html="formData.contentBack"
                ></div>
              </div>
              <button
                type="button"
                class="certificate-preview-edit-button"
                @click="openModalCustom('back')"
              >
                {{ $t('global:alter.image') }}
              </button>
            </div>
          </template>
          <div class="form-submit text-center">
            <Action
              :text="$t('global:save')"
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

    <Modal
      :active="!fetching && modalCustom"
      only-close-one-modal
      is-page
      @close="closeModalCustom"
    >
      <div class="modal-form is-expanded modal-certificate-form">
        <h2 class="modal-title text-color">
          {{ $t('settings.certificate:modal.custom.title') }} | {{ modalTitle }}
        </h2>
        <div class="modal-description text-color">
          <p class="text-color">{{ $t('settings.certificate:modal.custom.description') }}</p>
        </div>
        <form @submit.prevent="uploadCertificateModel">
          <Upload
            v-if="editingSide === 'front'"
            ref="upload"
            v-model="formData.backgroundFront"
            :width="1860"
            :height="1320"
            :preview="!$media.mobile ? 0.45 : 0.15"
            icon="image-multiple"
            cropper
            dark
          />
          <Upload
            v-else
            ref="uploadBack"
            v-model="formData.backgroundBack"
            :width="1860"
            :height="1320"
            :preview="!$media.mobile ? 0.45 : 0.15"
            icon="image-multiple"
            cropper
            dark
          />
          <div class="text-center">
            <Action
              v-if="hasWriteAccess"
              :text="$t('global:form.save')"
              type="button"
              secondary
              large
              submit
            />
          </div>
        </form>
      </div>
    </Modal>

    <ModalConfirm
      :active="modalConfirmEdit"
      :title="$t('settings.certificate:modal.confirm.edit.title')"
      :cancel-btn-text="$t('global:no')"
      :confirm-btn-text="$t('global:yes')"
      @confirm="submitCertificate"
      @close="modalConfirmEdit = false"
    >
      <slot name="description">
        <p class="text-color">{{ $t('settings.certificate:modal.confirm.edit.description') }}</p>
      </slot>
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
@import './ModalAddCertificate.scss';
</style>
