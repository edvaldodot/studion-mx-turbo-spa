<script>
import Modal from '../Modal'
import Action from '../Action'

import { previewModal } from './methods'

export default {
  name: 'ModalPreview',
  components: { Modal, Action },
  props: {
    media: {
      type: Object,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    previewTypes: {
      type: Array,
      default: () => ['image', 'pdf', 'video'],
    },
  },
  methods: {
    previewModal,
    closeModal() {
      this.$emit('close')
    },
    downloadFile() {
      this.$emit('download')
    },
  },
  computed: {},
}
</script>

<template>
  <modal
    :active="isActive"
    :cancel="false"
  >
    <div
      v-if="media"
      class="modal-preview clearfix"
    >
      <div class="modal-preview-content">
        <img
          v-if="media.type === 'image'"
          :src="media.url"
          :alt="media.description"
          class="modal-preview-image"
        />
        <iframe
          v-else-if="previewModal(previewTypes).accept(media.type)"
          :src="media.url"
          width="770"
          height="600"
          frameborder="0"
          class="modal-preview-iframe"
          webkitallowfullscreen
          mozallowfullscreen
          allowfullscreen
        ></iframe>
      </div>
      <div class="modal-preview-sidebar">
        <div class="modal-preview-header">
          <action
            type="button"
            icon="close"
            class="btn-close"
            @click="closeModal"
          />
          <action
            type="button"
            icon="download"
            download
            @click="downloadFile"
          />
        </div>

        <div class="modal-preview-sidebar-content">
          <h2 class="modal-preview-title">{{ media.title }}</h2>
          <div class="modal-preview-description">
            <p class="text-color">{{ media.description }}</p>
          </div>
          <div class="modal-preview-info">
            <span class="modal-preview-size">
              {{ media.size }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </modal>
</template>

<style lang="scss">
@import 'ModalPreview.scss';
</style>
