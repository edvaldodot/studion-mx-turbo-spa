<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TDEvaluationForum',

  props: {
    label: {
      type: String,
      default: null,
    },
  },
})
</script>

<template>
  <td class="td">
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