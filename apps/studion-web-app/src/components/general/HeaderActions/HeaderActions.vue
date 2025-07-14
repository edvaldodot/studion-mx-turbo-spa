<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'HeaderActions',

  props: {
    title: {
      type: String,
      default: '',
    },
  },
})
</script>

<template>
  <div
    class="header-actions"
    :data-testid="$testId('header-actions')"
  >
    <div class="header-actions__left">
      <slot name="left" />
    </div>
    <p class="header-actions__center">{{ title }}</p>
    <div class="header-actions__right">
      <slot name="right" />
    </div>
  </div>
</template>

<style lang="scss">
.header-actions {
  padding: 2px 24px;
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  background: var(--surface-0);
  color: var(--text-color);
  box-shadow: 0px 2px 6px var(--black-500);
  gap: 24px;
  font-family: var(--font-family);
  align-items: center;
  font-weight: 500;
  p {
    flex: 1;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
  }
}
</style>
