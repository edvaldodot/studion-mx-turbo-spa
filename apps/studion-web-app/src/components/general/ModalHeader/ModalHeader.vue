<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ModalHeader',

  props: {
    title: {
      type: String,
      default: '',
    },
    subTitle: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    isCapitalize: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <div :data-testid="$testId('modal-header')">
    <span
      v-if="subTitle"
      class="modal-subtitle"
      >{{ subTitle }}</span
    >

    <h2
      v-if="title"
      class="modal-title text-color text-color"
      :class="{ 'is-capitalize': isCapitalize }"
    >
      {{ title }}
    </h2>

    <div
      v-if="description || $slots.description"
      class="modal-description text-color text-color"
    >
      <p class="text-color">{{ description }}</p>
      <slot name="description"></slot>
    </div>

    <slot></slot>
  </div>
</template>
