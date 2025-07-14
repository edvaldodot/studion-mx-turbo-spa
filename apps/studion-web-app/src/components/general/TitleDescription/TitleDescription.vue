<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TitleDescription',
  props: {
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    dark: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('title-description')"
    class="title-description__container"
    :class="{ dark }"
  >
    <h3
      v-if="title"
      class="title-description__title text-color"
    >
      {{ title }}
    </h3>
    <p
      v-if="description"
      class="title-description__description text-color"
    >
      {{ description }}
    </p>
    <div class="title-description__body text-color">
      <slot></slot>
    </div>
  </div>
</template>

<style lang="scss">
@import 'TitleDescription.scss';
</style>
