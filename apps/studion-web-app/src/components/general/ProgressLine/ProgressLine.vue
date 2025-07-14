<script>
export default {
  name: 'ProgressLine',
  props: {
    dark: Boolean,
    label: { type: String },
    value: Number,
    width: Number,
    prependLabel: String,
    appendLabel: String,
  },
  computed: {
    progressStyles() {
      return {
        width: `${this.value}%`,
      }
    },
  },
}
</script>

<template>
  <div
    class="progress-line"
    :class="{ '--dark': dark }"
    :style="{ width: width ? `${width}px` : '100%' }"
  >
    <label
      v-if="label"
      class="progress-line__label"
      >{{ label }}</label
    >
    <div class="progress-line__holder">
      <label
        v-if="prependLabel"
        class="progress-line__label --prepend"
        >{{ prependLabel }}</label
      >
      <div class="progress-line__background">
        <div
          class="progress-line__determinate"
          :style="progressStyles"
        ></div>
      </div>
      <label
        v-if="appendLabel"
        class="progress-line__label --append"
        >{{ appendLabel }}</label
      >
    </div>
  </div>
</template>

<style lang="scss">
@import 'ProgressLine';
</style>
