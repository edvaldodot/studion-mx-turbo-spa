import * as faceapi from 'face-api.js'

const faceRecognitionMixin = {
  data() {
    return {
      intervalId: null,
      stream: null,
      detections: null,
    }
  },

  beforeDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  },

  methods: {
    async loadModels() {
      const MODEL_URL = process.env.BASE_URL + 'models'
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
    },

    onPlay() {
      this.intervalId = setInterval(async () => {
        const detections = await faceapi.detectAllFaces(
          this.video,
          new faceapi.TinyFaceDetectorOptions()
        )

        detections.forEach((detection) => {
          detection.isCentered = this.isInCentralRegion(detection)
        })

        this.detections = detections
        this.$emit('detections', detections)
      }, 250)
    },

    isInCentralRegion(detection) {
      const box = detection._box
      const imgDim = detection._imageDims

      const xCenter = box.x + box.width / 2
      const yCenter = box.y + box.height / 2

      const xCentered = xCenter > imgDim.width * 0.4 && xCenter < imgDim.width * 0.6
      const yCentered = yCenter > imgDim.height * 0.25 && yCenter < imgDim.height * 0.75

      return xCentered && yCentered
    },
  },
}

export default faceRecognitionMixin
