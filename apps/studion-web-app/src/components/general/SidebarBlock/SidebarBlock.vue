<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SidebarBlock',
})
</script>

<template>
  <div
    class="sidebar-block__container"
    :test-id="$testId('sidebar-block')"
  >
    <slot></slot>
  </div>
</template>

<style lang="scss">
@import 'SidebarBlock.scss';
</style>
