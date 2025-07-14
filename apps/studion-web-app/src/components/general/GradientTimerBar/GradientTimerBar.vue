<script>
export default {
  name: 'GradientTimerBar',
  props: {
    timer: {
      type: [String, Number],
      default: 30,
    },

    freeze: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      progress: 0,
      timerInterval: null,
    }
  },
  watch: {
    freeze(val) {
      if (val === true) {
        clearInterval(this.timerInterval)
      }
    }
  },
  mounted() {
    this.startProgressBar()
  },
  methods: {
    startProgressBar() {
      const totalTime = parseInt(this.timer)
      const interval = 20
      const steps = (totalTime * 1000) / interval

      let currentStep = 0
      this.timerInterval = setInterval(() => {
        currentStep++
        this.progress = (currentStep / steps) * 100

        if (currentStep >= steps) {
          clearInterval(this.timerInterval)
        }
      }, interval)
    },
  },
}
</script>

<template>
  <div class="gradient-time-bar__container">
    <div
      class="gradient-line__accent"
      :style="{ width: `${progress}%` }"
    ></div>
  </div>
</template>

<style lang="scss">
@import './GradientTimerBar.scss';
</style>
