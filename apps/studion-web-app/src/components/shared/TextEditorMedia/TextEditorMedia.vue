<script>
import Action from '@/components/general/Action'
import ControlModalVideo from '@/app/classroom/modules/forum/mixins/controlModalVideo.js'
import FileField from '@/components/general/FileField'
import Icon from '@/components/general/Icon'
import Upload from '@/components/general/Upload'

import filesizeValidator from '@/support/customValidators/filesizeValidator'
import mimeTypeValidator from '@/support/customValidators/mimeTypeValidator'
import textEditorMixin from '@/mixins/textEditorMixin'

import { formatFileSize } from '@/support/utils/storageUnit'

const TextEditor = () => import('@/components/general/TextEditor')

export default {
  name: 'TextEditorMedia',

  components: {
    Action,
    FileField,
    Icon,
    TextEditor,
    Upload,
  },

  mixins: [textEditorMixin, ControlModalVideo],

  props: {
    value: {
      type: Object,
      default: () => {},
    },

    item: {
      type: String,
      required: true,
    },

    validation: {
      type: Object,
      default: () => {},
    },

    embedImage: {
      type: Boolean,
      default: false,
    },

    attachFile: {
      type: Boolean,
      default: false,
    },

    writable: {
      type: Boolean,
      default: true,
    },

    noResize: {
      type: Boolean,
      default: false,
    },

    rows: {
      type: Object,
      default: () => ({
        min: 5,
        max: 20,
      }),
    },

    freeCrop: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      value: false,
    },

    addImageAtFifty: {
      type: Boolean,
      value: false,
    },

    allowedAttachmentsTypes: {
      type: Array,
      default: () => [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'docx',
        '.docx',
      ],
    },

    allowedImageTypes: {
      type: Array,
      default: () => ['image/jpg', 'image/jpeg', 'image/png', 'image/gif'],
    },

    maxFileSize: {
      type: Number,
      default: 5242880,
    },

    label: {
      type: String,
      default: null,
    },

    floatingLabel: {
      type: Boolean,
      default: true,
    },

    hideDetails: {
      type: Boolean,
      default: false,
    },

    imageEnabled: {
      type: Boolean,
      default: false,
    },

    bubble: {
      type: Boolean,
      default: false,
    },

    lightBgFull: {
      type: Boolean,
      default: false,
    },

    dark: {
      type: Boolean,
      default: false,
    },

    showAttachedFiles: {
      type: Boolean,
      default: true,
    },

    enableAi: {
      type: Boolean,
      default: false,
    },

    aiPrompt: {
      type: String,
      default: null,
    },

    counter: {
      type: Number,
      default: null,
    },

    embedVideo: {
      type: Boolean,
      default: false,
    },

    imageManipulation: {
      type: Boolean,
      default: false,
    },

    libras: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      tempFile: null,
    }
  },

  watch: {
    value: {
      deep: true,
      handler() {
        this.$emit('input', this.value)
      },
    },
  },

  validations() {
    return {
      value: {
        tempMediaFile: {
          filesize: this.embedImage && filesizeValidator(this.maxFileSize),
          mimeType: this.embedImage && mimeTypeValidator(this.allowedImageTypes),
        },

        tempFile: {
          filesize: this.attachFile && filesizeValidator(this.maxFileSize),
          mimeType: this.attachFile && mimeTypeValidator(this.allowedAttachmentsTypes),
        },
      },
    }
  },

  methods: {
    formatFileSize,

    modalEmbedVideo() {
      this.$emit('modalEmbedVideo', true)
    },
  },
}
</script>

<template>
  <div class="text-editor__media">
    <TextEditor
      ref="textField"
      v-model="value[item]"
      class="body-editor"
      :label="label"
      :validation="validation"
      :max-rows="rows.max ? rows.max : null"
      :rows="rows.min"
      :disabled="disabled && writable"
      :dark="dark"
      :bubble="bubble"
      :hide-details="hideDetails"
      :image-enabled="imageEnabled"
      :enable-ai="enableAi"
      :ai-prompt="aiPrompt"
      :light-bg-full="lightBgFull"
      :floating-label="floatingLabel"
      :counter="counter"
      :embed-video="embedVideo"
      :libras="libras"
      @prompt="$emit('prompt', $event)"
      @settings="$emit('settings', true)"
      @modalEmbedVideo="modalEmbedVideo"
    >
      <Action
        v-if="embedImage && writable && !disabled"
        slot="embed-image"
        type="button"
        class="form-image-import"
        icon="file-image"
        @click="openMediaFile"
      />

      <template #before-tools>
        <slot name="before-tools" />
      </template>

      <Action
        v-if="attachFile && writable && !disabled"
        slot="attach"
        type="button"
        icon="attach_file"
        :dark="dark"
        @click="openFile"
      />

      <slot name="additional-buttons" />

      <template
        v-if="showAttachedFiles"
        slot="attachment"
      >
        <div class="message-card-attachment">
          <div
            class="message-card-attachment-item"
            v-for="(file, fileIndex) in value.files"
            :key="fileIndex"
          >
            <div class="message-card-attachment-inner">
              <div class="message-card-attachment-inner__icon">
                <icon
                  :name="
                    file.mimetype ? getFileTypeIcon(file.mimetype) : getFileTypeIcon(file.type)
                  "
                  class="message-card-attachment-type"
                  wrapper
                >
                </icon>
                <span class="message-card-attachment-name">{{ file.filename || file.name }}</span>
              </div>
              <div class="message-card-attachment-inner__size">
                <span class="message-card-attachment-size">{{
                  file.filesize ? formatFileSize(file.filesize) : formatFileSize(file.size)
                }}</span>

                <Action
                  v-if="writable"
                  type="button"
                  icon="delete"
                  class="message-card-attachment-btn"
                  @click="removeFile(fileIndex)"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </TextEditor>

    <FileField
      v-if="embedImage && writable && !imageManipulation"
      ref="mediaFile"
      v-model="value.tempMediaFile"
      class="hidden"
      :label="$t('global:form.attach.file')"
      :accept="allowedImageTypes.join()"
      @input="addMediaFile"
    />

    <Upload
      v-if="imageManipulation && writable"
      ref="mediaFile"
      v-model="tempFile"
      class="hidden"
      :label="$t('global:form.attach.file')"
      :cropper="true"
      :width="1001"
      :height="546"
      :preview="0.4"
      :free-crop="freeCrop"
      @input="handlerTypeFile(addImageAtFifty)"
    />

    <FileField
      v-if="attachFile && writable"
      ref="file"
      v-model="value.tempFile"
      :label="$t('global:form.attach.file')"
      class="hidden"
      :accept="allowedAttachmentsTypes.join()"
      @input="addFile"
    />
  </div>
</template>
