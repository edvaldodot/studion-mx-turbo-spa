<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DifficultyLevel',

  props: {
    level: {
      type: Number,
      default: 0,
    },
  },
})
</script>

<template>
  <div class="difficulty-level">
    <div
      class="bar bar--1"
      :class="{ '--active': level > 0 }"
    ></div>
    <div
      class="bar bar--2"
      :class="{ '--active': level > 2 }"
    ></div>
    <div
      class="bar bar--3"
      :class="{ '--active': level > 4 }"
    ></div>
  </div>
</template>

<style lang="scss">
.difficulty-level {
  display: flex;
  align-items: flex-end;
  gap: 3px;

  .bar {
    width: 6px;
    border-radius: 2px;
    background-color: #dbdbdb;

    &.--active {
      background-color: var(--secondary-color);
    }

    &--1 {
      height: 10px;
    }
    &--2 {
      height: 20px;
    }
    &--3 {
      height: 30px;
    }
  }
}
</style>
