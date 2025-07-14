<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TableDivCol',

  props: {
    tr: {
      type: Boolean,
      default: false,
    },
    noBorder: {
      type: Boolean,
      default: false,
    },
    breakOnMobile: {
      type: Boolean,
      default: false,
    },
  },
})
</script>
<template>
  <div
    :data-testid="$testId('table-div-line')"
    class="table-div__line"
    :class="{
      tr,
      'no-border': noBorder,
      'break-on-mobile ': breakOnMobile,
    }"
  >
    <slot></slot>
  </div>
</template>

<style lang="scss">
@import './TableDivLine.scss';
</style>
