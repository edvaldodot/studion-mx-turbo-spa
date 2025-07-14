<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SectionBlock',

  props: {
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },

  data() {
    return {}
  },
})
</script>
<template>
  <div
    class="section-block"
    :data-testid="$testId('section-block')"
  >
    <div class="section-block__header">
      <div>
        <h2
          v-if="title"
          class="header__title"
        >
          {{ title }}
        </h2>
        <p
          v-if="description"
          class="header__description"
        >
          {{ description }}
        </p>
      </div>
      <div class="header__actions">
        <slot name="header-action"></slot>
      </div>
    </div>
    <div class="section-block__container">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.section-block {
  background-color: var(--black-500);
  border-radius: 8px;
  padding: 40px;

  &__header {
    color: var(--text-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 15px;

    .header__title {
      font-family: var(--font-family);
      font-weight: bold;
      font-size: 1.6em;
      color: var(--text-color);
      text-transform: uppercase;
      margin-bottom: 5px;
    }
  }

  &__container {
    color: var(--text-color);
  }

}
</style>
