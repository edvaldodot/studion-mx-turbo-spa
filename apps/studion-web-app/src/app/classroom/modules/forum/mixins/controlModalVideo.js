const controlModalVideo = {
  data() {
    return {
      modalAddVideo: false,
      refForRef: false,
    }
  },
  methods: {
    openModalAddVideo(videoForRef) {
      this.modalAddVideo = true
      if (videoForRef) {
        this.refForRef = true
      }
    },
    closeModalAddVideo() {
      this.modalAddVideo = false
    },
    addIFrame(url) {
      if (this.refForRef) {
        this.$refs.textForum.$refs.textField.addIFrame(url, { width: '100%' })
      } else {
        this.$refs.textField.addIFrame(url, { width: '100%' })
      }

      this.closeModalAddVideo()
    },
  },
}

export default controlModalVideo
