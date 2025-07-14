<script>
/**
 * @typedef {Object} VimeoData
 * @property {Number} duration Video full duration
 * @property {Number} percent Percent watched
 * @property {Number} seconds Actual time in video
 */

import { defineComponent } from 'vue'

import Player from '@vimeo/player'

export default defineComponent({
  name: 'VimeoPlayerTracker',

  props: {
    source: {
      type: String,
      required: true,
    },
    height: {
      type: String,
      default: '400px',
    },
    width: {
      type: String,
      default: '100%',
    },
    canSkip: {
      type: Boolean,
      default: false,
    },
    consumeInterval: {
      type: Number,
      default: 5,
    },
    timeWatched: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      mutateTimeWatched: this.timeWatched,
      videoLastPositionConsumed: 0,
    }
  },

  methods: {
    /** Start vimeo controls */
    loadVideoPlayer() {
      if (!this.equalsProfile('student')) return

      this.videoLastPositionConsumed = 0

      this.videoPlayer = new Player(this.$refs.iframe_video)

      this.videoPlayer.off('timeupdate')
      this.videoPlayer.on('timeupdate', this.updateVideoTime)
      this.videoPlayer.off('seeked')
      this.videoPlayer.on('seeked', this.verifyVideoSeekedLock)
    },

    /**
     * Make sure the user can skip to a certain part of the video
     * @param {VimeoData} data
     */
    verifyVideoSeekedLock(data) {
      const canSeekForward = this.canSkip || this.mutateTimeWatched > data.seconds
      if (canSeekForward) return

      this.videoPlayer.setCurrentTime(Math.floor(this.mutateTimeWatched))
    },

    /**
     * Check video time and if consume is allowed
     * @param {VimeoData} data
     */
    updateVideoTime(data) {
      let consumptionAllowed = false

      const videoConsumeInterval = this.consumeInterval
      const currentVideoPosition = Math.round(data.seconds)
      const isEnded = data.percent === 1
      const executionTimeDiff = data.seconds - this.mutateTimeWatched
      const isSeekingForward = executionTimeDiff > 1
      const canUpdateTimeWatched = !isSeekingForward && data.seconds > this.mutateTimeWatched
      const canConsumeEvenSeeking = this.canSkip || !isSeekingForward
      const canConsume =
        currentVideoPosition > this.videoLastPositionConsumed &&
        currentVideoPosition - this.videoLastPositionConsumed >= videoConsumeInterval &&
        canConsumeEvenSeeking

      if (canUpdateTimeWatched) {
        this.mutateTimeWatched = data.seconds
      }

      if (
        canConsume ||
        (isEnded && canConsumeEvenSeeking) ||
        this.videoLastPositionConsumed === 0
      ) {
        consumptionAllowed = true
      }

      if (consumptionAllowed) {
        this.videoLastPositionConsumed = data.seconds
        this.$emit('consume', currentVideoPosition)
      }
    },
  },
})
</script>

<template>
  <div class="vimeo-player">
    <iframe
      ref="iframe_video"
      mozallowfullscreen
      webkitallowfullscreen
      allowfullscreen
      frameborder="0"
      class="iframe-video"
      :width="width"
      :height="height"
      :src="source"
      @load="loadVideoPlayer"
    />
  </div>
</template>
