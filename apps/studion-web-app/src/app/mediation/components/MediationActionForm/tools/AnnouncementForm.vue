<script>
import { mapActions } from 'vuex'

import commonMixin from './mixins/commonMixin'

import filesizeValidator from '@/support/customValidators/filesizeValidator'
import mimeTypeValidator from '@/support/customValidators/mimeTypeValidator'
import _ from 'lodash'

import TagSelector from '@/components/general/TagSelector'
import Action from '@/components/general/Action'
import Datepicker from '@/components/general/Datepicker'
import InputField from '@/components/general/InputField'
import TextEditor from '@/components/general/TextEditor'
import FileField from '@/components/general/FileField'
import Checkbox from '@/components/general/Checkbox'
import TagsAnnouncement from '@/components/shared/TagsAnnouncement'
import { tagsAnnouncementMixin } from '@/mixins/tagsAnnouncementMixin'

import CustomDatePickerVue from '../components/CustomDatePicker'

const ALLOWED_IMAGE_TYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']

export default {
  name: 'AnnouncementForm',

  components: {
    Action,
    Checkbox,
    CustomDatePickerVue,
    Datepicker,
    InputField,
    TextEditor,
    FileField,
    TagsAnnouncement,
    TagSelector,
  },

  mixins: [commonMixin, tagsAnnouncementMixin],

  data() {
    return {
      tempMediaFile: null,
      allowedImageTypes: ALLOWED_IMAGE_TYPES,
      importImage: true,
      maxLength: 100,
    }
  },

  watch: {
    'value.message': {
      handler(newValue) {
        if (this.$refs.textField) {
          const newText = this.clampSessionStartDate(newValue)
          this.value.message = newText
        }
      },
      immediate: true,
    },
  },

  created() {
    this.getTagsAnnouncement()
  },

  methods: {
    ...mapActions(['setFetching', 'attemptUploadMediaFile', 'attemptGetAnnouncementTags']),

    tags: [],

    hideImportImage() {
      this.importImage = false
      this.showImportImage(this)
    },

    showImportImage: _.debounce((context) => {
      context.importImage = true
    }, 1000),

    openMediaFile() {
      this.$refs.mediaFile.$refs.label.click()
    },

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
  },

  validations: {
    tempMediaFile: {
      filesize: filesizeValidator(5242880),
      mimeType: mimeTypeValidator(ALLOWED_IMAGE_TYPES),
    },
  },
}
</script>

<template>
  <div class="announcement-form flex flex-column gap-2">
    <custom-date-picker-vue
      :accessibility="accessibility"
      :value="value"
      :validation="validation"
    />

    <file-field
      :label="$t('global:form.attach.file')"
      v-model="tempMediaFile"
      :validation="$v.tempMediaFile"
      @input="addMediaFile"
      ref="mediaFile"
      class="hidden"
      :dark="accessibility"
      :accept="allowedImageTypes.join()"
    />

    <input-field
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

    <div
      :class="{ 'theme-dark': accessibility }"
      v-show="!value.isHidden"
    >
      <p class="form-item-description">
        {{ $t('global:form.section.content') }}
      </p>

      <TextEditor
        ref="textField"
        v-model="value.message"
        :validation="validation.message"
        :disabled="!canWrite('mediation_plan')"
        :ai-prompt="templateAction ? templateAction.promptAi : null"
        image-enabled
        embed-image
        hide-details
        enable-ai
        @change="hideImportImage()"
        @prompt="$emit('prompt', $event)"
        @settings="$emit('settings', true)"
      >
        <template #before-tools>
          <TagSelector
            :tags="tags"
            :title="$t('text.editor:tag.selector.title')"
            tag-label="management:announcement.actions:tag.item:"
            @tag="$refs.textField.addTag($event)"
          />
        </template>
      </TextEditor>

      <TagsAnnouncement
        :text="$t('management:announcement.actions:tag.discussion')"
        :tags="tags"
        :dark="accessibility"
        @add:tag="addTagToTextEditor"
      />

      <div class="announcements-toggle-fixed">
        <Checkbox
          v-model="value.meta.fixed"
          :items="[{ value: true, label: $t('global:announcements.message.toggle') }]"
          switch-type
          :dark="accessibility"
        />
      </div>
    </div>
  </div>
</template>
