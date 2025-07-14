<script>
import mimeTypeValidator from '@/support/customValidators/mimeTypeValidator'
import filesizeValidator from '@/support/customValidators/filesizeValidator'
import { mapActions, mapState } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import debounce from 'lodash/debounce'

import commonMixin from './mixins/commonMixin'
import ControlModalVideo from '../../../../classroom/modules/forum/mixins/controlModalVideo'

import Checkbox from '@/components/general/Checkbox'
import FileField from '@/components/general/FileField'
import Icon from '@/components/general/Icon'
import InputField from '@/components/general/InputField'
import SelectField from '@/components/general/SelectField'
import FormSection from '@/components/general/FormSection'
import Upload from '@/components/general/Upload'
import TextEditorMedia from '@/components/shared/TextEditorMedia/TextEditorMedia'
import TagSelector from '@/components/general/TagSelector'
import Modal from '@/components/general/Modal'
import ModalAddVideo from '../../../../classroom/modules/forum/components/ModalAddVideo'
import ForumOptionsForm from '@/app/classroom/modules/forum/components/ForumOptionsForm'

import CustomDatePicker from '../components/CustomDatePicker'
import EvaluationForumMandatory from '../components/EvaluationForumMandatory'
import slugValidator from '@/support/customValidators/slugValidator'

const ALLOWED_IMAGE_TYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']

export default {
  name: 'ForumForm',

  components: {
    Checkbox,
    CustomDatePicker,
    FileField,
    InputField,
    Icon,
    SelectField,
    FormSection,
    TextEditorMedia,
    TagSelector,
    Upload,
    Modal,
    ModalAddVideo,
    ForumOptionsForm,
    EvaluationForumMandatory,
  },

  mixins: [commonMixin, ControlModalVideo],

  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
  },

  data() {
    return {
      tempAssets: null,
      maxLength: 200,
      tempMediaFile: null,
      allowedImageTypes: ALLOWED_IMAGE_TYPES,
      importImage: true,
      evaluationForm: {
        activateForum: false,
        maxGrade: 0,
        feedbackRequired: false,
        activeRemove: false,
        activeEdit: false,
      },
    }
  },
  validations: {
    tempAssets: {
      mimeType: mimeTypeValidator(['application/pdf']),
    },
    tempMediaFile: {
      filesize: filesizeValidator(5242880),
      mimeType: mimeTypeValidator(ALLOWED_IMAGE_TYPES),
    },
    maxGrade: {
      required,
      minGrade: function (nestedModel) {
        return nestedModel <= this.value.meta.remainingNote
      },
    },
    slug: {
      slugValidation: slugValidator,
    },
  },

  computed: {
    ...mapState({
      tagsDiscussion: (state) => {
        return state.Mediation.tags.discussion
      },
      mediationApplicability: (state) => {
        return state.Mediation.current.mediationPlan.applicability
      },
    }),
    hasZeroPosts() {
      return this.value.meta.numPosts === 0
    },

    hasZeroComments() {
      return this.value.meta.numComments === 0
    },

    disableOperatorInteraction() {
      return this.hasZeroPosts || this.hasZeroComments
    },
  },

  watch: {
    'value.meta.mandatory': {
      handler(newValue) {
        this.setDefaultInteractionValues(newValue)
      },
    },
  },

  methods: {
    ...mapActions(['setFeedback', 'setFetching', 'attemptUploadMediaFile']),
    updateHasImage() {
      this.formData.hasImage = true
    },
    openMediaFile() {
      this.$refs.mediaFile.$refs.label.click()
    },
    hideImportImage() {
      this.importImage = false
      this.showImportImage(this)
    },
    showImportImage: debounce((context) => {
      context.importImage = true
    }, 1000),
    addMediaFile() {
      if (!this.$v.tempMediaFile.$invalid) {
        this.setFetching(true)
        this.attemptUploadMediaFile({ file: this.tempMediaFile })
          .then(({ data }) => {
            let imgAttrs = { width: '100%' }
            if (this.tempMediaFile[0].type === 'image/gif') {
              imgAttrs = { 'max-width': '100%' }
            }
            this.$refs.textField.addImageUrl(data.url, imgAttrs)
            this.tempMediaFile = null
            this.$refs.mediaFile.clear()
          })
          .finally(() => {
            this.setFetching(false)
          })
      } else if (!this.$v.tempMediaFile.mimeType) {
        this.setFeedback({
          message: this.$t('classroom.panel.announcements.card.error:invalid.file.type'),
          type: 'error',
        })
      } else {
        this.setFeedback({
          message: this.$t('classroom.panel.announcements.card.error:invalid.file.size'),
          type: 'error',
        })
      }
    },

    setDefaultInteractionValues(isMandatory) {
      this.value.meta.operator = isMandatory ? 'and' : null
      this.value.meta.numPosts = isMandatory ? 1 : null
      this.value.meta.numComments = isMandatory ? 1 : null
    },
  },
}
</script>

<template>
  <div>
    <div
      class="forum-form"
      :class="{ 'modal-add-video-open': modalAddVideo }"
    >
      <FileField
        ref="mediaFile"
        v-model="tempMediaFile"
        :label="$t('global:form.attach.file')"
        :validation="$v.tempMediaFile"
        :dark="accessibility"
        :accept="allowedImageTypes.join()"
        class="hidden"
        @input="addMediaFile"
      />

      <InputField
        v-if="$isEnabledFeature('slug_identity')"
        v-model="value.meta.slug"
        :validation="$v.slug"
        :label="$t('global:slug.identity')"
        :counter="100"
        :dark="accessibility"
        @input="(val) => (value.meta.slug = value.meta.slug.toUpperCase())"
      />

      <CustomDatePicker
        :accessibility="accessibility"
        :value="value"
        :validation="validation"
      />

      <InputField
        v-model.trim="value.title"
        :label="$t('global:form.title')"
        :counter="maxLength"
        :validation="validation.title"
        :dark="accessibility"
        :hint="!value.isHidden ? $t('mediation.actions:hint.title') : ''"
        :disabled="!canWrite('mediation_plan') || value.isHidden"
      />

      <slot
        v-if="$mediationAiEnabled() && !value.isHidden"
        name="action-template"
      />

      <div v-if="!value.isHidden">
        <TextEditorMedia
          ref="textForum"
          v-model="value"
          class="input-editor-forum-form"
          :floating-label="false"
          :item="'message'"
          :counter="8000"
          :label="$t('global:form.description')"
          :validation="validation.message"
          :rows="{ min: 12, max: 20 }"
          :writable="canWrite('mediation_plan')"
          :ai-prompt="templateAction ? templateAction.promptAi : null"
          embed-image
          embed-video
          image-manipulation
          image-enabled
          no-fixed
          enable-ai
          @change="hideImportImage()"
          @prompt="$emit('prompt', $event)"
          @settings="$emit('settings', true)"
          @modalEmbedVideo="openModalAddVideo(true)"
        >
          <template #before-tools>
            <TagSelector
              v-if="tagsDiscussion && tagsDiscussion.length > 0"
              tag-label="Tags"
              :title="$t('text.editor:tag.selector.title')"
              :tags="tagsDiscussion.map((tag) => tag.value)"
              :tag-values="tagsDiscussion.map((tag) => tag.text)"
              @tag="$refs.textForum.$refs.textField.addTag($event)"
            />
          </template>
        </TextEditorMedia>

        <FileField
          v-model="value.meta.asset"
          :dark="accessibility"
          :validation="$v.tempAssets"
          can-remove
          class="mt-8"
          :accept="'.pdf'"
          :label="$t('global:form.attach.file.pdf')"
          :disabled="!canWrite('mediation_plan')"
          @input="(assets) => (tempAssets = assets)"
        />

        <Upload
          v-model="value.meta.image"
          :dark="accessibility"
          :icon="'image-multiple'"
          :label="$t('global:upload.add.image')"
          :description="$t('global:upload.title')"
          :cropper="true"
          :width="1001"
          :height="546"
          :preview="0.4"
          :disabled="!canWrite('mediation_plan')"
        />

        <Checkbox
          v-model="value.meta.mandatory"
          :dark="accessibility"
          switch-type
          :items="[
            {
              label: $t('classroom.forum:mandatory'),
              description: $t('classroom.forum:mandatory:description'),
              value: true,
            },
          ]"
          :disabled="!canWrite('mediation_plan')"
        />

        <template v-if="value.meta.mandatory">
          <FormSection
            :title="$t('classroom.forum:interaction:title')"
            class="interaction-form"
            :dark="accessibility"
          >
            <div class="interaction-form__container">
              <InputField
                v-model="value.meta.numPosts"
                :validation="validation.meta.numPosts"
                :max="10"
                :min="0"
                :dark="accessibility"
                type="number"
                hide-error-details
                @input="validation.meta.numPosts.$touch"
              />

              <p class="form-group-description text-color">
                {{ $t('classroom.forum:interaction:post') }}
              </p>

              <SelectField
                v-model="value.meta.operator"
                :validation="validation.meta.operator"
                :items="[
                  {
                    value: 'and',
                    text: $t('classroom.forum:interaction:operator:and'),
                  },
                  {
                    value: 'or',
                    text: $t('classroom.forum:interaction:operator:or'),
                  },
                ]"
                :allow-clear="false"
                :disabled="disableOperatorInteraction"
                :dark="accessibility"
                hide-error-details
              />

              <InputField
                v-model="value.meta.numComments"
                :validation="validation.meta.numComments"
                :max="10"
                :min="0"
                :dark="accessibility"
                type="number"
                hide-error-details
                @input="validation.meta.numComments.$touch"
              />

              <p class="form-group-description text-color">
                {{ $t('classroom.forum:interaction:comment') }}
              </p>
            </div>

            <div
              v-if="validation.meta.numComments.$error"
              class="form-input-messages-container"
              :class="{ dark: accessibility }"
            >
              <Icon
                name="error"
                wrapper
                size="small"
              />
              <span class="form-input-message">{{
                $t('classroom.forum:interaction:error:message')
              }}</span>
            </div>
          </FormSection>
        </template>

        <div v-if="value.meta.mandatory && $isEnabledFeature('forum_evaluation')">
          <EvaluationForumMandatory
            v-model="value.meta"
            :validation="validation.meta"
            :dark="accessibility"
          />
        </div>

        <ForumOptionsForm
          v-model="value.meta"
          :dark="accessibility"
        />

        <template v-if="mediationApplicability === 'session'">
          <h3>{{ $t('classroom.forum:multiple.sessions') }}</h3>

          <Checkbox
            v-model="value.meta.multipleSessions"
            :items="[
              {
                label: $t('classroom.forum:multiple.checkbox'),
                description: $t('classroom.forum:multiple.checkbox.description'),
                value: true,
              },
            ]"
            :dark="accessibility"
            switch-type
          />
        </template>
      </div>
    </div>

    <Modal
      :active="modalAddVideo"
      only-close-one-modal
      @close="closeModalAddVideo"
    >
      <ModalAddVideo @addIFrame="addIFrame" />
    </Modal>
  </div>
</template>
