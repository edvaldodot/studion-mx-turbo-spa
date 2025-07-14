<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SimpleCounter',
  props: {
    count: {
      type: Number,
      default: 0,
    },
    small: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('simple-counter')"
    class="simple-counter__container"
    :class="{ small }"
  >
    <p class="text-color">
      <span>{{ count }}</span>
    </p>
  </div>
</template>

<style lang="scss">
@import 'SimpleCounter.scss';
</style>
