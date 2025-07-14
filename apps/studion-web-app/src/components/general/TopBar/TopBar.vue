<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TopBar',
})
</script>

<template>
  <div class="top-bar__component">
    <slot></slot>
  </div>
</template>

<style lang="scss">
.top-bar__component {
  background: var(--surface-0);
  box-shadow: 0 2px 4px var(--black-500);
  padding: 0 10px;
  height: 40px;
}
</style>
