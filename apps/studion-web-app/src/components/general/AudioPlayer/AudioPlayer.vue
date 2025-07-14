<script>
import Action from '../Action'
import { mapState, mapActions } from 'vuex'
export default {
  components: {
    Action,
  },
  props: {
    url: {
      type: String,
      required: true,
    },
    playerid: {
      type: String,
      required: true,
    },
    startTime: {
      type: Number,
      default: 0,
    },
    alreadyPlaying: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      playbackTime: 0,
      audioDuration: 100,
      audioVolume: 50,
      audioLoaded: false,
      isPlaying: false,
      showVolumeControl: false,
      totalTimeText: '00:00',
      lastProgressSecond: 0,
    }
  },
  computed: {
    ...mapState(['audioVolumeStorage']),
    soundIcon() {
      if (+this.audioVolume === 0) return 'volume-mute'
      if (+this.audioVolume < 34) return 'volume-low'
      if (+this.audioVolume < 67) return 'volume-medium'
      else return 'volume-high'
    },
    playIcon() {
      if (this.isPlaying) return 'pause'
      else return 'play'
    },
    playbackTimeText() {
      if (this.playbackTime !== 0) return this.convertTime(Math.floor(this.playbackTime))
      return '00:00'
    },
  },
  watch: {
    audioVolume() {
      this.$refs.player.volume = this.audioVolume / 100
      this.setAudioVolumeStorage(this.audioVolume)
    },
  },
  mounted: function () {
    let volume = this.audioVolumeStorage
    if (volume) {
      this.audioVolume = +volume
      this.$refs.player.volume = this.audioVolume / 100
    } else this.$refs.player.volume = 0.5
    this.$nextTick(function () {
      const audio = this.$refs.player
      audio.addEventListener('loadedmetadata', this.loadmetadataHandler)

      audio.onended = this.endedAudio

      this.$watch('isPlaying', function () {
        if (this.isPlaying) {
          const audio = this.$refs.player
          this.initSlider()
          if (!this.listenerActive) {
            this.listenerActive = true
            audio.addEventListener('timeupdate', this.playbackListener)
          }
        }
      })

      this.$watch('playbackTime', function () {
        const diff = Math.abs(this.playbackTime - this.$refs.player.currentTime)
        if (diff > 0.01) {
          this.$refs.player.currentTime = this.playbackTime
        }
        if (
          Math.floor(this.playbackTime) % 5 === 0 &&
          Math.floor(this.playbackTime) !== this.lastProgressSecond
        ) {
          this.lastProgressSecond = Math.floor(this.playbackTime)
          this.$emit('audio-progress', this.playbackTime)
        }
      })
      this.playbackTime = this.startTime
      if (this.alreadyPlaying) {
        this.toggleAudio()
      }
    })
  },
  methods: {
    ...mapActions(['setAudioVolumeStorage']),
    getNewURL() {
      this.$emit('audio-expired', { time: this.playbackTime, isPlaying: this.isPlaying })
    },
    loadmetadataHandler() {
      this.initSlider()
      this.audioLoaded = true
    },
    hideVolumeControl() {
      this.showVolumeControl = false
    },
    initSlider() {
      const audio = this.$refs.player
      if (audio) {
        this.audioDuration = Math.round(audio.duration)
        this.totalTimeText = this.convertTime(audio.duration)
      }
    },
    convertTime(seconds) {
      const format = (val) => `0${Math.floor(val)}`.slice(-2)
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      if (hours === 0) return [minutes, seconds % 60].map(format).join(':')
      return [hours, minutes, seconds % 60].map(format).join(':')
    },
    playbackListener(e) {
      const audio = this.$refs.player
      if (audio) {
        this.playbackTime = audio.currentTime
        audio.addEventListener('ended', this.endListener)
        audio.addEventListener('pause', this.pauseListener)
      }
    },
    pauseListener() {
      this.isPlaying = false
      this.listenerActive = false
      this.cleanupListeners()
    },
    endListener() {
      this.isPlaying = false
      this.listenerActive = false
      this.cleanupListeners()
    },
    cleanupListeners() {
      const audio = this.$refs.player
      if (audio) {
        audio.removeEventListener('timeupdate', this.playbackListener)
        audio.removeEventListener('ended', this.endListener)
        audio.removeEventListener('pause', this.pauseListener)
      }
    },
    toggleAudio() {
      const audio = this.$refs.player
      if (audio.paused) {
        audio.play()
        this.isPlaying = true
      } else {
        audio.pause()
        this.isPlaying = false
      }
    },
    endedAudio() {
      this.$emit('audio-ended', this.audioDuration)
    },
    updateAudioVolumeByWheel({ deltaY }) {
      const VOLUME_STEP = 2

      if (deltaY < 0) {
        if (this.audioVolume >= 100 - VOLUME_STEP) {
          this.audioVolume = 100
          return
        }
        this.audioVolume = +this.audioVolume + VOLUME_STEP
        return
      }

      if (deltaY > 0) {
        if (this.audioVolume <= 0 + VOLUME_STEP) {
          this.audioVolume = 0
          return
        }
        this.audioVolume = +this.audioVolume - VOLUME_STEP
      }
    },
  },
}
</script>
<template>
  <div class="audio__wrapper">
    <div>
      <audio
        style="display: none"
        ref="player"
        :id="playerid"
        :volume="audioVolume / 10"
        @error="getNewURL()"
      >
        <source
          @error="getNewURL()"
          ref="source"
          :src="url"
          type="audio/mpeg"
        />
      </audio>
    </div>
    <div class="audio__row">
      <div id="button-div">
        <action
          class="audio__play"
          type="button"
          :dark="true"
          :icon="playIcon"
          @click="toggleAudio()"
        ></action>
      </div>
      <div class="audio__progress">
        <span
          class="progress__timer"
          v-html="playbackTimeText"
        ></span>
        <input
          class="slider"
          v-model="playbackTime"
          type="range"
          min="0"
          :max="audioDuration"
          id="position"
          name="position"
        />
        <span
          class="progress__timer"
          v-html="totalTimeText"
          v-show="audioLoaded"
        ></span>
        <div
          class="progress__loading"
          v-show="!audioLoaded"
        >
          {{ $t('classroom.lessons:podcast.loading') }}
        </div>
      </div>
      <div
        class="audio__volume"
        v-click-outside="hideVolumeControl"
        v-if="!$media.mobile"
      >
        <action
          type="button"
          :dark="true"
          :icon="soundIcon"
          @click="showVolumeControl = !showVolumeControl"
        ></action>
        <div
          class="volume__control"
          v-show="showVolumeControl"
        >
          <input
            class="slider"
            v-model="audioVolume"
            type="range"
            min="0"
            :max="100"
            id="position"
            name="position"
            @wheel.prevent="updateAudioVolumeByWheel"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import 'AudioPlayer.scss';
</style>
