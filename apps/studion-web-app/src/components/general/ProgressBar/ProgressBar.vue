<script>
export default {
  name: 'ProgressBar',
  components: {},
  props: {
    total: {
      type: Number,
      required: true,
    },
    actual: {
      type: Number,
      required: true,
    },
    progressStyle: {
      type: String,
      default: 'default',
    },
  },
  computed: {
    progress: function () {
      if (this.total === 0) {
        return 100
      }
      return ((this.actual * 100) / this.total).toFixed(1)
    },
  },
}
</script>

<template>
  <div
    :class="progressStyle"
    class="progress-container"
  >
    <div
      class="progress-bar"
      :style="{ width: progress + '%' }"
    ></div>
  </div>
</template>

<style lang="scss">
@import 'ProgressBar.scss';
</style>
