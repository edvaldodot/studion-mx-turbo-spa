<template>
  <div class="webcam-container">
    <video
      ref="video"
      :class="{ '--invert': invert }"
      autoplay
      muted
    ></video>
    <canvas
      v-show="false"
      ref="canvas"
    ></canvas>
    <div
      v-if="error"
      class="webcam-container__error"
      @click="setupWebcam"
    >
      {{ $t(`app.camera:error.${error}`) }}
    </div>
  </div>
</template>

<script>
import faceRecognitionMixin from './faceRecognitionMixin'

export default {
  name: 'AppCamera',

  mixins: [faceRecognitionMixin],

  props: {
    faceRecognition: {
      type: Boolean,
      default: false,
    },
    invert: {
      type: Boolean,
      default: true,
    },
  },

  data() {
    return {
      video: null,
      photo: null,
      error: null,
    }
  },

  async mounted() {
    this.video = this.$refs.video

    if (this.faceRecognition) {
      await this.loadModels()
    }
    await this.setupWebcam()
  },

  beforeDestroy() {
    this.endStream()
  },

  methods: {
    setupWebcam() {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          this.stream = stream
          this.video.srcObject = this.stream

          if (this.faceRecognition) {
            this.video.addEventListener('play', () => {
              this.onPlay()
            })
          }

          this.error = null
        })
        .catch(this.errorHandler)
    },

    errorHandler(err) {
      this.error = 'GenericError'
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.error = 'PermissionDeniedError'
      }

      this.endStream()
    },

    endStream() {
      if (this.stream) {
        const tracks = this.stream.getTracks()
        tracks.forEach((track) => track.stop())
      }
      this.video.srcObject = null
      this.stream = null
    },

    takePhoto() {
      const video = this.$refs.video
      const canvas = this.$refs.canvas
      const context = canvas.getContext('2d')
      canvas.width = 460
      canvas.height = 310
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      const imageData = canvas.toDataURL('image/png')
      this.photo = imageData
      this.$emit('photo', imageData)
    },
  },
}
</script>

<style lang="scss">
@import './AppCamera.scss';
</style>
