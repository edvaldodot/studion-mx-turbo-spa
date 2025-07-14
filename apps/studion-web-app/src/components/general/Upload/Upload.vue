<script>
import Cropper from 'cropperjs'

import Action from '../Action'
import Icon from '../Icon'
import ValidationMessage from '../ValidationMessage'
import Tooltip from '../Tooltip'

export default {
  name: 'TheUpload',

  components: {
    Action,
    Icon,
    ValidationMessage,
    Tooltip,
    Modal: () => import('../Modal'),
    ModalConfirm: () => import('../ModalConfirm'),
  },

  props: {
    label: {
      type: String,
      default: null,
    },
    labelChange: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    cropper: {
      type: Boolean,
      default: false,
    },
    freeCrop: Boolean,
    width: {
      type: Number,
      default: 480,
    },
    height: {
      type: Number,
      default: 160,
    },
    accept: {
      type: String,
      default: null,
    },
    preview: {
      type: Number,
      default: 1,
    },
    outerLabel: {
      type: Boolean,
      default: false,
    },
    validation: {
      type: Object,
      default: function () {
        return {}
      },
    },
    value: {
      type: [Object, String, Number, Boolean, Array, Blob],
      default: null,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    canRemove: {
      type: Boolean,
      default: false,
    },
    round: {
      type: Boolean,
      default: false,
    },
    timeStamp: {
      type: Boolean,
      default: false,
    },
    classIcon: {
      type: String,
      default: null,
    }
  },

  data() {
    return {
      modalActive: false,
      removeFileModal: false,
      cropperWrapper: null,
      cropperConfig: {
        scaleX: 1,
        scaleY: 1,
      },
      cropperImage: null,
      file: null,
      isFocused: false,
      aspectRatio: this.freeCrop ? NaN : this.width / this.height,
      style: {
        width: Math.round(this.width * this.preview) + 'px',
        height: Math.round(this.height * this.preview) + 'px',
      },
    }
  },

  computed: {
    hasValue() {
      return this.value !== null
    },
    hasValidation() {
      return Object.keys(this.validation).length
    },
    isRequired() {
      return this.validation.$params && typeof this.validation.$params.required === 'object'
    },
    imgCanvasContainer() {
      if (this.cropperImage) return this.cropperImage
      if (this.value) return this.addTimeStamp(this.value)
      return ''
    },
  },

  methods: {
    getLabel() {
      return this.label || this.cropper
        ? this.$t('global:upload.add.image')
        : this.$t('global:upload.add.file')
    },
    getLabelChange() {
      return this.labelChange || this.cropper
        ? this.$t('global:upload.change.image')
        : this.$t('global:upload.change.file')
    },
    getAccept() {
      return this.accept || this.cropper ? '.jpg,.jpeg,.png' : '*'
    },
    onChange(e) {
      this.file = e.target.files[0]
      e.target.type = ''
      e.target.type = 'file'
      this.openModal()
    },
    openModal() {
      this.$emit('open')
      this.modalActive = true
      this.$nextTick(() => {
        this.createImage()
      })
    },
    createImage() {
      const self = this
      var reader = new window.FileReader()
      reader.onload = function (event) {
        self.$refs.cropperImage.src = event.target.result
        self.createCropper()
      }
      reader.readAsDataURL(this.file)
    },
    createCropper() {
      this.cropperWrapper = new Cropper(this.$refs.cropperImage, {
        aspectRatio: this.aspectRatio,
        guides: false,
        center: true,
        highlight: false,
      })
    },
    swapHorizontal() {
      this.cropperConfig.scaleX = this.cropperConfig.scaleX * -1
      this.cropperWrapper.scale(this.cropperConfig.scaleX, this.cropperConfig.scaleY)
    },
    swapVertical() {
      this.cropperConfig.scaleY = this.cropperConfig.scaleY * -1
      this.cropperWrapper.scale(this.cropperConfig.scaleX, this.cropperConfig.scaleY)
    },
    rotateLeft() {
      this.cropperWrapper.rotate(-45)
    },
    rotateRight() {
      this.cropperWrapper.rotate(45)
    },
    restore() {
      this.cropperConfig.scaleX = 1
      this.cropperConfig.scaleY = 1
      this.cropperWrapper.reset()
    },
    save() {
      this.cropperImage = this.cropperWrapper
        .getCroppedCanvas({
          maxWidth: 3072,
          maxHeight: 3072,
        })
        .toDataURL()
      this.modalActive = false
      this.$refs.input.focus()
      var canvas = this.cropperWrapper.getCroppedCanvas({
        maxWidth: 3072,
        maxHeight: 3072,
      })
      if (HTMLCanvasElement.prototype.toBlob) {
        canvas.toBlob(this.updateValue, 'image/jpeg', 0.95)
      }
      if (HTMLCanvasElement.prototype.msToBlob) {
        this.updateValue(canvas.msToBlob())
      }
    },
    updateValue(value) {
      typeof this.validation.$touch === 'function' && this.validation.$touch()
      value.name = this.file.name
      this.$emit('input', value)
    },
    closeModal() {
      this.file = null
      // this.cropperWrapper = null
      this.modalActive = false
    },
    updateFocus() {
      this.isFocused = true
    },
    updateBlur() {
      this.isFocused = false
    },
    getImageCropper(obj) {
      return this.cropperWrapper
        .getCroppedCanvas({
          width: obj.width,
          height: obj.height,
        })
        .toDataURL()
    },
    removeFile() {
      this.file = null
      this.cropperImage = null
      this.$emit('removeFile')
      this.$emit('input', null)
      this.removeFileModal = false
    },

    addTimeStamp(image) {
      if (!this.timeStamp) return image

      const imageHasTimeStamp = image.includes('_t=')
      if (imageHasTimeStamp) return image

      const imageHasParams = new URL(image).search
      return image + `${imageHasParams ? '&' : '?'}_t=${new Date().getTime()}`
    },
  },
}
</script>

<template>
  <div
    class="form-item"
    :class="{
      'has-error': validation.$error,
      'has-focus': isFocused,
      'has-value': hasValue,
      'theme-dark': dark,
      'is-disabled': disabled,
    }"
  >
    <p
      v-if="description"
      class="form-item-description"
    >
      {{ description }} <span v-if="!isRequired">{{ $t('global:form.optional') }}</span>
    </p>

    <div
      class="uploader"
      :style="style"
    >
      <Tooltip>
        <template #activator="{ on }">
          <div
            v-if="canRemove && value != null && !round"
            class="uploader__remove"
            @mouseenter="on.mouseenter"
            @mouseleave="on.mouseleave"
            @click="removeFileModal = true"
          >
            <Icon
              name="delete"
              small
            />
          </div>
        </template>

        <span>{{ $t('global:upload.remove.tooltip') }}</span>
      </Tooltip>

      <label
        :for="'input-' + _uid"
        class="uploader-label"
      >
        <div
          v-if="!cropperImage && value === null && !outerLabel"
          class="uploader-label-content"
        >
          <Icon
            v-if="icon"
            :name="icon"
            class="uploader-label-icon icon-fill-1"
            :class="classIcon"
          />

          <span
            v-if="label"
            :class="{ 'outer-label-text': outerLabel }"
            class="uploader-label-text"
          >
            {{ getLabel() }}
          </span>
        </div>

        <slot
          v-if="(cropperImage || value) && !outerLabel"
          name="change"
        >
          <span class="uploader-label-change">{{ getLabelChange() }}</span>
        </slot>

        <div
          ref="canvasContainer"
          class="uploader-canvas-container"
        >
          <img
            v-if="imgCanvasContainer"
            :src="imgCanvasContainer"
          />

          <slot
            v-else
            name="image"
          ></slot>
        </div>

        <slot name="mask"></slot>
      </label>

      <input
        :id="'input-' + _uid"
        ref="input"
        :disabled="disabled"
        :accept="getAccept()"
        class="uploader-file"
        type="file"
        @change="onChange"
        @focus="updateFocus()"
        @blur="updateBlur()"
      />
    </div>

    <Tooltip>
      <template #activator="{ on }">
        <div
          v-if="canRemove && value != null && round"
          :style="{ width: style.width }"
          class="uploader__remove uploader__remove--rounded"
          @mouseenter="on.mouseenter"
          @mouseleave="on.mouseleave"
          @click="removeFileModal = true"
        >
          <Icon
            class="remove__icon"
            name="delete"
            small
          />
        </div>
      </template>

      <span>{{ $t('global:upload.remove.tooltip') }}</span>
    </Tooltip>

    <label
      v-if="outerLabel"
      :for="'input-' + _uid"
      class="uploader-label"
    >
      <div
        v-if="!cropperImage && value === null"
        class="uploader-label-content"
      >
        <Icon
          v-if="icon"
          :name="icon"
          class="uploader-label-icon icon-fill-1"
          :class="classIcon"
          pack="material"
        />

        <span
          v-if="label"
          class="uploader-label-text"
          :class="{ 'outer-label': outerLabel }"
        >
          {{ getLabel() }}
        </span>
      </div>

      <slot
        v-if="cropperImage || value"
        name="change"
      >
        <span
          class="uploader-label-change"
          :class="{ 'outer-label': outerLabel }"
        >
          {{ getLabelChange() }}
        </span>
      </slot>

      <slot name="mask"></slot>
    </label>

    <div
      v-if="hasValidation"
      class="form-input-details"
    >
      <ValidationMessage :validation="validation" />
    </div>

    <Modal
      :active="modalActive && cropper"
      :close-event="true"
      @close="closeModal"
    >
      <div class="cropper theme-dark">
        <div class="cropper-tools">
          <Action
            icon="swap-horizontal"
            type="button"
            wrapper
            @click="swapHorizontal"
          />

          <Action
            icon="swap-vertical"
            type="button"
            wrapper
            @click="swapVertical"
          />

          <Action
            type="button"
            icon="undo"
            wrapper
            @click="rotateLeft"
          />

          <Action
            type="button"
            icon="redo"
            wrapper
            @click="rotateRight"
          />

          <Action
            type="button"
            icon="restore"
            wrapper
            @click="restore"
          />
        </div>

        <div class="cropper-content">
          <div class="cropper-image-container">
            <img
              id="cropper-image"
              ref="cropperImage"
              src=""
            />
          </div>

          <Action
            :text="$t('global:form.save')"
            class="cropper-btn"
            type="button"
            primary
            @click="save"
          />
        </div>
      </div>
    </Modal>

    <ModalConfirm
      :title="$t('global:upload.remove.modal.title')"
      :active="removeFileModal"
      @close="removeFileModal = false"
      @confirm="removeFile"
    >
      <p class="text-color">{{ $t('global:upload.remove.modal.description') }}</p>
    </ModalConfirm>
  </div>
</template>

<style lang="scss">
@import 'Upload.scss';
</style>
