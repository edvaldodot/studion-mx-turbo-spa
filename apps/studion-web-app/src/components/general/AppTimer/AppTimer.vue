<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AppTimer',

  props: {
    title: {
      type: String,
      default: '',
    },
    ifHasDaysShowOnly: {
      type: Boolean,
      default: false,
    },
    keepTimer: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      timer: null,
      totalSeconds: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  },

  computed: {
    getSeconds() {
      return this.formatTimeString(this.seconds)
    },

    getMinutes() {
      return this.formatTimeString(this.minutes)
    },

    getHours() {
      return this.formatTimeString(this.hours)
    },

    totalInDays() {
      return Math.floor(this.totalSeconds / 3600 / 24)
    },
  },

  watch: {
    '$route.path': {
      immediate: true,
      handler() {
        if (!this.keepTimer) this.stopTimer()
      },
    },
  },

  beforeDestroy() {
    if (this.timer) this.stopTimer()
  },

  methods: {
    startTimer() {
      if (this.timer) return

      this.timer = setInterval(() => {
        if (this.seconds > 0 || this.minutes > 0 || this.hours > 0) {
          this.decreaseTime()
        } else {
          if (this.timer) {
            this.$emit('end')
          }
          this.stopTimer()
        }
      }, 1000)
    },

    setTime(timeInSeconds) {
      this.calculateTime(timeInSeconds)
    },

    resetTimer() {
      clearInterval(this.timer)
      this.calculateTime(0)
      this.timer = null
    },

    stopTimer() {
      clearInterval(this.timer)
      this.timer = null
    },

    calculateTime(timeInSeconds) {
      this.totalSeconds = timeInSeconds
      timeInSeconds = Math.round(timeInSeconds)

      this.hours = Math.floor(timeInSeconds / 3600)
      this.minutes = Math.floor((timeInSeconds % 3600) / 60)
      this.seconds = timeInSeconds % 60
    },

    decreaseTime() {
      if (this.seconds > 0) {
        this.seconds--
      } else if (this.minutes > 0) {
        this.minutes--
        this.seconds = 59
      } else if (this.hours > 0) {
        this.hours--
        this.minutes = 59
        this.seconds = 59
      }

      this.totalSeconds -= 1
    },

    formatTimeString(time) {
      return time.toString().padStart(2, '0')
    },
  },
})
</script>

<template>
  <div class="app-timer">
    <p class="app-timer__title">{{ title }}</p>

    <template v-if="ifHasDaysShowOnly && totalInDays > 0">
      <div class="app-timer__column">
        <div class="app-timer__meter">{{ totalInDays }}</div>
        <div class="app-timer__timer">
          {{ $t(totalInDays === 1 ? 'global:day' : 'global:days') }}
        </div>
      </div>
    </template>

    <section v-else>
      <div class="app-timer__column">
        <div class="app-timer__meter">{{ getHours }}</div>
        <div class="app-timer__timer">{{ $t('global:hours') }}</div>
      </div>
      <div class="app-timer__divider">:</div>
      <div class="app-timer__column">
        <div class="app-timer__meter">{{ getMinutes }}</div>
        <div class="app-timer__timer">{{ $t('global:minutes') }}</div>
      </div>
      <div class="app-timer__divider">:</div>
      <div class="app-timer__column">
        <div class="app-timer__meter">{{ getSeconds }}</div>
        <div class="app-timer__timer">{{ $t('global:seconds') }}</div>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
@import './AppTimer.scss';
</style>
