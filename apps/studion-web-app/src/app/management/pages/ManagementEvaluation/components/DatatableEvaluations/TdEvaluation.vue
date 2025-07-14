<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'TdEvaluation',

  props: {
    label: {
      type: String,
      default: null,
    },
    disableSlotClasses: {
      type: Boolean,
      default: false,
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

    <span :class="{ 'td-text break-text clamp-line': !disableSlotClasses }">
      <slot />
    </span>
  </td>
</template>
