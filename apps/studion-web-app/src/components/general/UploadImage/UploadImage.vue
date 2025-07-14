<script>
import Cropper from 'cropperjs'

import Icon from '../Icon'
import Action from '../Action'
import Modal from '../Modal'

export default {
  name: 'UploadImage',
  components: {
    Action,
    Icon,
    Modal,
  },
  props: {
    value: {
      type: Blob,
      default: () => null,
    },
    label: {
      type: String,
      default: () => null,
    },
    hint: {
      type: String,
      default: () => null,
    },
    instructions: {
      type: String,
      default: () => null,
    },
    // crop config
    freeCrop: {
      type: Boolean,
      default: () => false,
    },
    width: {
      type: Number,
      default: () => 480,
    },
    height: {
      type: Number,
      default: () => 160,
    },
    required: {
      type: Boolean,
      default: () => false,
    },
    disabled: {
      type: Boolean,
      default: () => false,
    },
  },
  data() {
    return {
      inDragOver: false,
      modalCropper: false,
      cropperConfig: {
        scaleX: 1,
        scaleY: 1,
      },
      cropperInstance: null,
      cropperImagePreview: null,
    }
  },
  computed: {
    componentId() {
      return `upload-file-${this._uid}`
    },
    classes() {
      return {
        '--disabled': this.disabled,
        '--in-drag-over': this.inDragOver,
      }
    },
    aspectRatio() {
      return this.freeCrop ? NaN : this.width / this.height
    },
    previewStyle() {
      return {
        backgroundImage: `url(${this.cropperImagePreview})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }
    },
    showImagePreview() {
      return this.cropperImagePreview
    },
  },
  methods: {
    handlerInput(value) {
      this.$emit('input', value)
    },
    handlerInputImageCropper() {
      this.imageToCropper()
    },
    addImage() {
      this.$refs.inputImage.click()
    },
    dropImage($event) {
      const { files } = $event.dataTransfer

      if (files.length) {
        this.$refs.inputImage.files = files
        this.inDragOver = false
        this.imageToCropper()
      }
    },
    dragoverImage() {
      this.inDragOver = true
    },
    dragleaveImage() {
      this.inDragOver = false
    },
    imageToCropper() {
      var reader = new FileReader()

      reader.onload = (event) => {
        this.showModalAndCropperOnLoadReader(event)
      }
      reader.readAsDataURL(this.$refs.inputImage.files[0])
    },
    showModalAndCropperOnLoadReader(event) {
      this.showModalCropper()
      this.$nextTick(() => {
        this.$refs.cropperImage.src = event.target.result
        this.newCropper()
      })
    },
    // cropper
    newCropper() {
      this.cropperInstance = new Cropper(this.$refs.cropperImage, {
        aspectRatio: this.aspectRatio,
        guides: false,
        center: true,
        highlight: false,
      })
    },
    showModalCropper() {
      this.modalCropper = !this.modalCropper
    },
    closeModalCropper() {
      this.modalCropper = !this.modalCropper
    },
    // actions image
    swapHorizontal() {
      this.cropperConfig.scaleX = this.cropperConfig.scaleX * -1
      this.cropperInstance.scale(this.cropperConfig.scaleX, this.cropperConfig.scaleY)
    },
    swapVertical() {
      this.cropperConfig.scaleY = this.cropperConfig.scaleY * -1
      this.cropperInstance.scale(this.cropperConfig.scaleX, this.cropperConfig.scaleY)
    },
    rotateLeft() {
      this.cropperInstance.rotate(-45)
    },
    rotateRight() {
      this.cropperInstance.rotate(45)
    },
    restore() {
      this.cropperConfig.scaleX = 1
      this.cropperConfig.scaleY = 1
      this.cropperInstance.reset()
    },
    save() {
      this.cropperImagePreview = this.cropperInstance
        .getCroppedCanvas({
          maxWidth: 3072,
          maxHeight: 3072,
        })
        .toDataURL()
      this.closeModalCropper()

      const canvas = this.cropperInstance.getCroppedCanvas({
        maxWidth: 3072,
        maxHeight: 3072,
      })

      canvas.toBlob((blob) => {
        this.handlerInput(blob)
      })
    },
  },
}
</script>
<template>
  <div
    :data-testid="$testId('upload-image')"
    :class="['upload-image', classes]"
  >
    <div class="upload-image__label">
      {{ label }}
      <span
        v-show="required"
        class="upload-image__required"
      >
        *
      </span>
    </div>
    <div
      class="upload-image__drop"
      @drop.prevent="dropImage($event)"
      @dragover.prevent="dragoverImage"
      @dragleave.prevent="dragleaveImage"
      @click="addImage"
    ></div>
    <div
      v-show="!showImagePreview"
      class="upload-image__wrapper"
    >
      <div class="upload-image__icon">
        <slot name="icon">
          <Icon
            pack="material"
            name="image"
          />
        </slot>
      </div>
      <div class="upload-image__hint">
        <slot name="hint">
          {{ hint }}
        </slot>
      </div>
      <div class="upload-image__instructions">
        <slot name="instructions">
          {{ instructions }}
        </slot>
      </div>
    </div>
    <div
      v-show="showImagePreview"
      class="upload-image__preview"
      :style="previewStyle"
    >
      <div class="upload-image__change-image">
        {{ $t('global:alter.image') }}
      </div>
    </div>
    <input
      :id="componentId"
      ref="inputImage"
      type="file"
      accept=".jpg,.jpeg,.png"
      :disabled="disabled"
      v-bind="$attrs"
      hidden
      v-on="{ ...$listeners, input: (event) => handlerInputImageCropper() }"
    />

    <!-- Modal cropper -->
    <Modal
      :active="modalCropper"
      :close-event="true"
      @close="closeModalCropper"
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
            dark
            @click="save"
          />
        </div>
      </div>
    </Modal>
  </div>
</template>
<style lang="scss">
@import 'UploadImage.scss';
</style>
