<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TableDiv',
  props: {
    dark: {
      type: Boolean,
      default: false,
    },
  },
})
</script>
<template>
  <div
    :data-testid="$testId('table-div')"
    class="table-div__table"
    :class="{ dark }"
    role="table"
  >
    <div class="table-div__header">
      <slot name="header"></slot>
    </div>

    <div class="table-div__body">
      <slot name="body"></slot>
    </div>
  </div>
</template>

<style lang="scss">
@import './TableDiv.scss';
</style>
