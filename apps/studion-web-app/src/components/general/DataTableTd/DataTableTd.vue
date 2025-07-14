<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'TDBatchData',
  props: {
    label: {
      type: String,
      default: null,
    },
  },
})
</script>
<template>
  <td class="td td__generic">
    <span
      v-if="$media.mobile && label"
      class="td-text-header clamp-line"
    >
      {{ $t(label) }}
    </span>
    <span class="td-text break-text clamp-line">
      <slot />
    </span>
  </td>
</template>
<style lang="scss">
@import 'DataTableTd.scss';
</style>
