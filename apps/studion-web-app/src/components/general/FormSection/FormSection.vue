<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FormSection',

  props: {
    title: {
      type: String,
      default: null,
    },
    subdescription: {
      type: String,
      default: null,
    },
    dark: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    }
  },
})
</script>

<template>
  <div
    :data-testid="$testId('form-section')"
    class="form-section"
    :class="{ 'theme-dark': dark, '--disabled': disabled }"
  >
    <div>
      <h3
        v-if="title"
        class="form-section-title text-color"
        v-html="title"
      ></h3>

      <p
        v-if="subdescription"
        class="form-section-subdescription text-color"
        v-html="subdescription"
      ></p>
    </div>

    <slot></slot>
  </div>
</template>

<style lang="scss">
.form-section {
  &-subdescription {
    font-size: 0.875rem;
    font-weight: 100;
    line-height: 1.4em;
    opacity: 0.7;
    margin-bottom: 20px;
  }
  &.--disabled {
    h3,
    p {
      color: rgba(255, 255, 255, 0.25);
    }
  }
}
</style>
