<script>
import { required, requiredIf } from 'vuelidate/lib/validators'
import { defineComponent } from 'vue'
import { withParams } from 'vuelidate/lib/validators/common'
import { mapState, mapActions } from 'vuex'
import formScrollValidationMixin from '@/mixins/formScrollValidationMixin'
import { MANDATORY_OPTION, DOWNLOADABLE_OPTION, BLOCK_ADVANCE } from '../../shared.js'

import Action from '@/components/general/Action'
import Checkbox from '@/components/general/Checkbox'
import FileField from '@/components/general/FileField'
import FormSection from '@/components/general/FormSection'
import Icon from '@/components/general/Icon'
import InputField from '@/components/general/InputField'
import SelectField from '@/components/general/SelectField'
import TextareaField from '@/components/general/TextareaField'
import Tooltip from '@/components/general/Tooltip'
import WorkloadLimitTooltip from '../../components/WorkloadLimitTooltip'

import LTIForm from './components/LTIForm'

const url = (value) => {
  if (!value) return true
  const regex =
    /^(?!.*\[[^\]]*\])(?:(?:https?|ftp):\/\/)?(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?$/
  return regex.test(value)
}

export default defineComponent({
  name: 'ClassForm',
  components: {
    Action,
    Checkbox,
    FileField,
    FormSection,
    Icon,
    InputField,
    SelectField,
    TextareaField,
    Tooltip,
    LTIForm,
    WorkloadLimitTooltip,
  },
  mixins: [formScrollValidationMixin],
  props: {
    topic: {
      type: Object,
      default: () => ({
        id: null,
        name: null,
        description: null,
        mandatory: false,
        isBlockAdvancementButton: false,
      }),
    },
    isTopicTemplate: {
      type: Boolean,
      default: false,
    },
    courseId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      assetStatus: '',
      initClassDate: null,
      formData: {
        id: null,
        type: 'class',
        name: null,
        description: '',
        mandatory: null,
        isBlockAdvancementButton: false,
        workloadValue: null,
        classLibrary: null,
        assets: [
          {
            type_id: null,
            asset_file: null,
            asset_url: null,
            active: true,
            mandatory: null,
            name: '',
            minimum_consumption_percentage: 90,
            is_seekable: true,
            is_downloadable: false,
            urlSupplier: null,
            newTab: false,
            key: null,
            secret: null,
            contentId: null,
            disciplineName: null,
            is_examination: false,
          },
        ],
      },
      asset_url: null,
      allowedTypes: ['scorm', 'pptx', 'video'],
      externalTypes: ['external_link', 'vimeo_external_link'],
      videoPlayer: null,
    }
  },
  validations: {
    formData: {
      type: {
        required,
      },
      name: {
        required,
      },
      workloadValue: {
        required: requiredIf(function () {
          return this.hasWorkloadLimit && this.$isEnabledFeature('workload_limit')
        }),
      },
      assets: {
        $each: {
          type_id: {
            required: requiredIf(function () {
              return (
                !this.formData.id &&
                this.formData.type === 'class' &&
                this.currentAssetTypeId === null
              )
            }),
          },
          asset_file: {
            required: requiredIf(function () {
              return (
                !this.formData.id &&
                this.formData.type === 'class' &&
                this.formData.assets[0].asset_file === null &&
                !this.isAssetType(this.currentAssetTypeId, this.externalTypes) &&
                !this.isAssetType(this.currentAssetTypeId, 'lti')
              )
            }),
          },
          minimum_consumption_percentage: {
            required: requiredIf(function () {
              const minConsump = this.formData.assets[0].minimum_consumption_percentage
              return (
                this.isAssetType(this.currentAssetTypeId, ['video', 'vimeo_external_link']) &&
                (minConsump === null || minConsump === undefined || minConsump === '')
              )
            }),
          },
          urlSupplier: {
            required: requiredIf(function () {
              return this.isLTI
            }),
            url,
          },
          key: {
            required: requiredIf(function () {
              return this.isLTI
            }),
          },
          secret: {
            required: requiredIf(function () {
              return this.isLTI
            }),
          },
        },
      },
    },
    asset_url: {
      required: requiredIf(function () {
        return this.isAssetType(this.currentAssetTypeId, this.externalTypes) && !this.asset_url
      }),
      url,
      urlVimeo: withParams({ type: 'urlVimeo' }, function (value) {
        if (this.isVimeoLink && value && url(value)) {
          const url = new URL(value)
          return ['vimeo.com', 'player.vimeo.com'].includes(url.host)
        }
        return true
      }),
    },
  },
  computed: {
    ...mapState({
      allAssetTypeOptions: ({ Courses }) => Courses.assetTypeOptions,
      hasWorkloadLimit: ({ Courses }) => Courses.current.workloadLimit,
      user: (state) => state.Account.user,
    }),

    workloadLimit() {
      return this.user && this.user.workload_limit
    },

    currentAssetTypeId() {
      return this.formData.assets[0].type_id
    },
    fileType() {
      const ALLOWED_SCORM_TYPES = ['.zip']
      const ALLOWED_PPTX_TYPES = ['.pptx']
      const ALLOWED_VIDEO_TYPES = ['.MP4', '.MOV', '.WMV', '.AVI', '.FLV']
      const ALLOWED_PDF_TYPES = ['.pdf']
      const ALLOWED_AUDIO_TYPES = ['.mp3']

      let fileType = this.findAssetType(this.currentAssetTypeId)

      switch (fileType) {
        case 'scorm':
          return ALLOWED_SCORM_TYPES.join()
        case 'pptx':
          return ALLOWED_PPTX_TYPES.join()
        case 'video':
          return ALLOWED_VIDEO_TYPES.join()
        case 'pdf':
          return ALLOWED_PDF_TYPES.join()
        case 'audio':
          return ALLOWED_AUDIO_TYPES.join()
      }
      return '*'
    },
    assetTypeOptions() {
      return this.allAssetTypeOptions.filter(({ slug }) => this.allowedTypes.includes(slug))
    },
    isEditing() {
      return !!this.formData.id
    },
    isFileContentType() {
      return this.currentAssetTypeId && !this.isExternalContentType && !this.isLTI
    },
    isExternalContentType() {
      return (
        this.currentAssetTypeId && this.isAssetType(this.currentAssetTypeId, this.externalTypes)
      )
    },
    isLTI() {
      return this.currentAssetTypeId && this.isAssetType(this.currentAssetTypeId, 'lti')
    },
    isLargeFileType() {
      return this.isAssetType(this.currentAssetTypeId, ['scorm', 'video', 'audio'])
    },
    maxFileSize() {
      if (this.isFileContentType && this.isLargeFileType) {
        return this.$filesMaxSize('large')
      }
      return this.$filesMaxSize('small')
    },
    maxFileSizeMB() {
      return this.maxFileSize / (1024 * 1024)
    },
    isVideo() {
      return this.isAssetType(this.currentAssetTypeId, 'video')
    },
    isVimeoLink() {
      return this.isAssetType(this.currentAssetTypeId, 'vimeo_external_link')
    },
    externalLinkLabel() {
      if (this.isVimeoLink)
        return this.$t('solutions.create.classes:modal.label.video.external.link')
      return this.$t('global:link')
    },
    externalLinkHelp() {
      if (this.isVimeoLink)
        return this.$t('solutions.create.classes:modal.help.vimeo.external.link')
      return this.$t('solutions.create.classes:tooltip.help.external.link')
    },
    urlExternalVideo() {
      if (this.asset_url && this.isVimeoLink && !this.$v.asset_url.$invalid) {
        const url = new URL(this.asset_url)
        if (url.host === 'player.vimeo.com') return url
        return 'https://player.vimeo.com/video' + url.pathname
      }
      return ''
    },
    disableEditUrlVimeo() {
      return this.isEditing && this.isVimeoLink && !this.formData.allow_edit_url
    },
    disableAssetUrl() {
      return !this.canWrite('courses') || this.disableEditUrlVimeo
    },
  },
  watch: {
    topic: {
      immediate: true,
      handler() {
        if (this.topic.id) {
          this.setupFormData()
        }
      },
    },
  },
  created() {
    this.formData.courseId = this.courseId
    this.setup()
  },
  methods: {
    ...mapActions([
      'setFeedback',
      'setFetching',
      'attemptTopicCreation',
      'attemptTopicUpdate',
      'attemptCheckAvailableSpace',
    ]),
    setup() {
      this.MANDATORY_OPTION = MANDATORY_OPTION
      this.DOWNLOADABLE_OPTION = DOWNLOADABLE_OPTION
      this.BLOCK_ADVANCE = BLOCK_ADVANCE
      this.HELP_LINK =
        'https://atendimento.dotgroup.com.br/kb/article/103164/aulas-em-pptx?preview=true&revisionId=299213'
      this.setupAllowedClassTypesByFeatureFlag()
    },
    setupAllowedClassTypesByFeatureFlag() {
      this.$isEnabledFeature('pdf_classroom') && this.allowedTypes.push('pdf')
      this.$isEnabledFeature('upload_audio') && this.allowedTypes.push('audio')
      this.$isEnabledFeature('external_link') && this.allowedTypes.push('external_link')
      this.$isEnabledFeature('allow_vimeo_external_link_lessons') &&
        this.allowedTypes.push('vimeo_external_link')
      this.$isEnabledFeature('lti_classroom') && this.allowedTypes.push('lti')
    },
    setupFormData() {
      this.formData = { ...this.topic }
      this.topic.assets = this.topic.assets || []

      if (this.topic.assets.length === 0) {
        this.formData.assets = [
          {
            type_id: null,
            asset_file: null,
            asset_url: null,
            active: true,
            mandatory: null,
            name: null,
            minimum_consumption_percentage: 90,
            is_seekable: true,
            urlSupplier: null,
            newTab: false,
            key: null,
            secret: null,
            contentId: null,
            disciplineName: null,
            is_examination: false,
          },
        ]
      } else {
        const [currentAsset] = this.formData.assets
        const asset = {
          ...currentAsset,
          type_id: currentAsset.type ? currentAsset.type.id : null,
          asset_file: currentAsset.name,
          asset_url: currentAsset.name,
          is_seekable: currentAsset.meta ? currentAsset.meta.is_seekable : true,
          is_downloadable: currentAsset.meta && currentAsset.meta.is_downloadable,
          minimum_consumption_percentage: currentAsset.meta
            ? currentAsset.meta.minimum_consumption_percentage
            : 90,
          urlSupplier: currentAsset.meta ? currentAsset.meta.url : null,
          newTab: !!(currentAsset.meta && currentAsset.meta['new_tab']),
          key: currentAsset.meta ? currentAsset.meta.key : null,
          secret: currentAsset.meta ? currentAsset.meta.secret : null,
          contentId: currentAsset.meta ? currentAsset.meta['content_id'] : null,
          disciplineName: currentAsset.meta ? currentAsset.meta['discipline_name'] : null,
          is_examination: currentAsset.meta ? currentAsset.meta.is_examination : false,
        }
        this.asset_url = currentAsset.meta.url
        this.$set(this.formData.assets, 0, asset)
      }
    },
    submit() {
      this.$v.$touch()
      if (
        !this.$v.formData.$invalid &&
        (!this.isExternalContentType || !this.$v.asset_url.$invalid)
      ) {
        this.formData.id ? this.updateClass() : this.addNewClass()
      }

      this.$nextTick(() => this.scrollToInputError())
    },
    addNewClass() {
      this.setFetching(true)

      this.verifyClassCreationAvailability()
        .then((response) => {
          if (response.result !== true) {
            let message = this.$t('solutions.create.classes:feedback.create.error')
            if (response.error === 'file_too_large') {
              message = this.$t('solutions.create.classes:feedback.create.error:file_too_large', {
                size: response.size,
              })
            }
            this.setFeedback({ message: message })
            return false
          }

          const params = { ...this.formData }
          params.assets = this.mountAsset()
          params.mandatory = Number(this.formData.mandatory)
          params.is_block_advancement_button = this.formData.isBlockAdvancementButton

          this.createTopic(params)
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    mountAsset() {
      const [currentAsset] = this.formData.assets

      const asset = {
        type_id: this.currentAssetTypeId,
        active: this.isEditing ? currentAsset.active : 1,
        associated_mandatory: Number(this.formData.mandatory),
      }

      if (this.isFileContentType) {
        asset.asset_file = this.isEditing ? currentAsset.name : currentAsset.asset_file[0]
        asset.description = this.isEditing ? currentAsset.name : currentAsset.asset_file[0].name
        asset.asset_url = null
      }

      if (this.isExternalContentType) {
        asset.asset_url = this.asset_url
        asset.description = this.asset_url
      }

      if (this.isVideo || this.isVimeoLink) {
        asset.minimum_consumption_percentage = currentAsset.minimum_consumption_percentage
        asset.is_seekable = currentAsset.is_seekable
      }

      if (this.isVideo) {
        asset.description = this.formData.name
      }

      if (this.isLTI) {
        asset.description = currentAsset.urlSupplier
        asset['asset_url'] = currentAsset.urlSupplier
        asset['new_tab'] = currentAsset.newTab
        asset.key = currentAsset.key
        asset.secret = currentAsset.secret
        asset.is_examination = currentAsset.is_examination

        if (currentAsset.contentId) {
          asset['content_id'] = currentAsset.contentId
        }

        if (currentAsset.disciplineName) {
          asset['discipline_name'] = currentAsset.disciplineName
        }
      }

      if (this.isEditing) {
        asset.id = currentAsset.id
      }

      if (this.isAssetType(asset.type_id, 'pdf')) {
        asset.is_downloadable = currentAsset.is_downloadable
      }

      if (!asset['asset_url']) {
        delete asset['asset_url']
      }

      return asset
    },
    createTopic(params) {
      this.setFetching(true)
      this.attemptTopicCreation({ formData: params, isTopicTemplate: this.isTopicTemplate })
        .then(({ data }) => {
          data.assetStatus = 'waiting'

          this.$emit('update', { topic: data, operation: 'create' })
          this.$router.push({ name: this.$route.meta.modalCloseLink.name })
        })
        .catch(({ response }) => {
          let errorMessage = response.data.message
            .toLowerCase()
            .replace(/_/g, '.')
            .replace(/ /g, '.')
          let message = this.$t('solutions.create.classes:feedback.create.error')
          if (
            errorMessage === 'invalid.file.size' &&
            this.isAssetType(params.assets.type_id, 'scorm')
          ) {
            message = this.$t('solutions.create.classes:feedback.create.error:file_too_large', {
              size: this.maxFileSizeMB,
            })
          } else if (
            errorMessage === 'internal.server.error' ||
            errorMessage === 'invalid.mime.type' ||
            errorMessage === 'asset.already.exists' ||
            errorMessage === 'invalid.dot.add.in' ||
            errorMessage === 'file_too_large'
          ) {
            message = this.$t(`solutions.create.classes:feedback.create.error:${errorMessage}`)
          }

          if (
            this.isAssetType(params.assets.type_id, 'scorm') &&
            response.data.message === 'invalid_mime_type'
          ) {
            message = this.$t('solutions.create.classes:feedback.create.error.invalid_scorm_file')
            this.formData.assets = [
              {
                type_id: null,
                asset_file: null,
                active: true,
                mandatory: null,
                name: '',
              },
            ]
          }
          if (
            this.isAssetType(params.assets.type_id, 'scorm') &&
            response.data.message === 'invalid_file_size'
          ) {
            message = this.$t('solutions.create.classes:feedback.create.error:file_too_large', {
              size: this.maxFileSizeMB,
            })
          }

          if (errorMessage === 'invalid.link.vimeo') {
            message = this.$t('solutions.create.classes:feedback.create.erro:invalid.link.vimeo')
          }

          this.setFeedback({ message: message })
          this.$v.$reset()
          this.modalClassActive = true
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    verifyClassCreationAvailability() {
      return new Promise((resolve) => {
        if (this.isAssetType(this.currentAssetTypeId, [...this.externalTypes, 'lti'])) {
          return resolve({ result: true })
        }

        if (
          this.formData.assets &&
          this.formData.assets[0] &&
          parseFloat(this.formData.assets[0].asset_file[0].size) >= this.maxFileSize
        ) {
          return resolve({ result: false, error: 'file_too_large', size: this.maxFileSizeMB })
        }

        let assetsFile = this.formData.assets.filter((asset) => {
          if (asset.asset_file !== null) {
            return (
              asset.asset_file[0].type.includes('video') ||
              this.isAssetType(this.currentAssetTypeId, 'scorm')
            )
          }
        })
        if (assetsFile.length > 0) {
          this.attemptCheckAvailableSpace().then(({ data }) => {
            assetsFile.map((asset) => {
              let fileSpace = parseFloat(asset.asset_file[0].size) < parseFloat(data.available_size)
              let fileSize = parseFloat(asset.asset_file[0].size) <= this.maxFileSize
              if (fileSpace && fileSize) {
                return resolve({ result: true })
              }

              return resolve({
                result: false,
                error: !fileSize ? 'file_too_large' : 'server_disk_full',
                size: this.maxFileSizeMB,
              })
            })
          })
        } else {
          resolve({ result: true })
        }
      })
    },
    updateClass() {
      this.modalClassActive = false
      const { formData, isTopicTemplate } = this

      formData.assets[0] = this.mountAsset()

      this.setFetching(true)
      this.attemptTopicUpdate({ formData, isTopicTemplate })
        .then(({ data }) => {
          data.assetStatus = 'waiting'

          this.$emit('update', { topic: data, operation: 'update' })
          this.$router.push({ name: this.$route.meta.modalCloseLink.name })
        })
        .catch(({ response }) => {
          this.modalClassActive = true
          let errorMessage = 'solutions.create.classes:feedback.create.error.generic'

          if (response.data && response.data.message === 'invalid_link_vimeo') {
            errorMessage = 'solutions.create.classes:feedback.create.erro:invalid.link.vimeo'
          }

          this.setFeedback({ message: this.$t(errorMessage) })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
    resetFileField(value) {
      if (this.lastFileType !== value) {
        this.formData.assets[0].asset_file = null
        this.lastFileType = value
        this.$v.$reset()
      }
    },
    findAssetType(id) {
      for (let key in this.assetTypeOptions) {
        if (this.assetTypeOptions[key].value === id) {
          return this.assetTypeOptions[key].slug
        }
      }
    },
    isAssetType(id, slug) {
      for (let key in this.assetTypeOptions) {
        if (
          Array.isArray(slug) &&
          this.assetTypeOptions[key].value === id &&
          slug.includes(this.assetTypeOptions[key].slug)
        ) {
          return true
        } else if (
          this.assetTypeOptions[key].value === id &&
          this.assetTypeOptions[key].slug === slug
        ) {
          return true
        }
      }
      return false
    },
    showWarningPPTX(value) {
      return (
        this.assetTypeOptions.filter((option) => option.value === value && option.slug === 'pptx')
          .length > 0
      )
    },
  },
})
</script>

<template>
  <div>
    <form
      novalidate
      class="flex flex-column gap-2"
      @submit.prevent="submit"
    >
      <div>
        <InputField
          v-model.trim="formData.name"
          dark
          :label="$t('global:form.title')"
          :validation="$v.formData.name"
          :counter="100"
          :disabled="!canWrite('courses')"
        />
        <TextareaField
          v-model="formData.description"
          auto-grow
          dark
          :label="$t('global:form.description')"
          :validation="$v.formData.description"
          :disabled="!canWrite('courses')"
        />
      </div>

      <template>
        <SelectField
          v-model="formData.assets[0].type_id"
          dark
          :disabled="formData.id !== null || !canWrite('courses')"
          :items="assetTypeOptions"
          :label="$t('global:form.content.type')"
          :validation="$v.formData.assets.$each[0].type_id"
          @input="resetFileField"
        />
        <div
          v-if="showWarningPPTX(formData.assets[0].type_id)"
          class="text-color text-base my-2"
        >
          <span v-html="$t('solutions.create.classes:modal.warning.pptx')"></span>
        </div>

        <InputField
          v-if="isExternalContentType"
          v-model.trim="asset_url"
          dark
          :is-horizontal="$media.mobile"
          :label="externalLinkLabel"
          :floating-label="false"
          :validation="$v.asset_url"
          :disabled="disableAssetUrl"
        >
          <template #button>
            <Tooltip
              :width="330"
              :uppercase="false"
              align="left"
              dark
              medium-font
              arrow
            >
              <template #activator="{ on }">
                <Icon
                  name="help"
                  size="small"
                  wrapper
                  @mouseenter.native="on.mouseenter"
                  @mouseleave.native="on.mouseleave"
                />
              </template>
              <span v-html="externalLinkHelp"></span>
            </Tooltip>
          </template>
        </InputField>

        <iframe
          v-show="isVimeoLink && urlExternalVideo"
          ref="iframe_video"
          frameborder="0"
          class="iframe-external-video"
          width="100%"
          :src="urlExternalVideo"
          :height="270"
        ></iframe>

        <FormSection
          v-if="isVideo || isVimeoLink"
          :title="$t('solutions.create.classes:video.consume.title')"
        >
          <InputField
            v-model="formData.assets[0].minimum_consumption_percentage"
            dark
            has-percent
            type="number"
            :min="1"
            :max="100"
            :validation="$v.formData.assets.$each[0].minimum_consumption_percentage"
            :label="$t('solutions.create.classes:video.consume.percentage')"
            :disabled="!canWrite('courses')"
          />
          <Checkbox
            v-model="formData.assets[0].is_seekable"
            dark
            :items="[{ label: $t('solutions.create.classes:video.consume.seekable'), value: true }]"
            :disabled="!canWrite('courses')"
          />
        </FormSection>

        <FileField
          v-if="isFileContentType"
          v-model="formData.assets[0].asset_file"
          :accept="fileType"
          :disabled="
            formData.id !== null || !canWrite('courses') || formData.assets[0].type_id === null
          "
          :label="$t('global:form.attach.file')"
          :validation="$v.formData.assets.$each[0].asset_file"
        />

        <LTIForm
          v-if="isLTI"
          :asset="formData.assets[0]"
          :asset-validation="$v.formData.assets.$each[0]"
        />
      </template>

      <FormSection
        v-if="$isEnabledFeature('workload_limit') && hasWorkloadLimit"
        :title="$t('solutions.create:form.class.time.title')"
        class="class-form__class-time"
      >
        <p class="mt-2">
          {{ $t('solutions.create:form.class.time.description.2') }}
        </p>
        <div>
          <p class="mt-3">
            {{ $t('solutions.create:form.class.time.config') }}
          </p>
          <InputField
            v-model="formData.workloadValue"
            :validation="$v.formData.workloadValue"
            :min="1"
            :max="workloadLimit && workloadLimit.uninterrupted_minutes"
            type="number"
            dark
          />
        </div>

        <WorkloadLimitTooltip />
      </FormSection>

      <Checkbox
        v-model="formData.mandatory"
        dark
        :validation="$v.formData.mandatory"
        :items="MANDATORY_OPTION"
        :disabled="!canWrite('courses')"
        switch-type
      />

      <template
        v-if="
          $isEnabledFeature('block_advancement_button') &&
          isAssetType(formData.assets[0].type_id, 'scorm')
        "
      >
        <Checkbox
          v-model="formData.isBlockAdvancementButton"
          :items="BLOCK_ADVANCE"
          :disabled="!canWrite('courses')"
          switch-type
          dark
        />
      </template>

      <Checkbox
        v-if="isAssetType(formData.assets[0].type_id, 'pdf')"
        v-model="formData.assets[0].is_downloadable"
        dark
        :validation="$v.formData.mandatory"
        :items="DOWNLOADABLE_OPTION"
        :disabled="!canWrite('courses')"
      />

      <div
        v-if="canWrite('courses')"
        class="form-submit text-center"
      >
        <Action
          secondary
          large
          fixed-width
          submit
          type="button"
          :text="
            $t(
              formData.id > 0
                ? 'solutions.create.classes:modal.submit.edit'
                : 'solutions.create.classes:modal.submit.add'
            )
          "
        />
      </div>
    </form>
  </div>
</template>
