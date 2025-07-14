<script setup>
import Tooltip from '../Tooltip'

const props = defineProps({
  slug: {
    type: String,
    default: '',
  },
  clampLine: {
    type: Boolean,
    default: true,
  },
  breakWord: {
    type: Boolean,
    default: true,
  },
  tdText: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <Tooltip
    :data-testid="$testId('slug-tooltip')"
    :uppercase="false"
    align="right"
    arrow
    shadow
  >
    <template #activator="{ on }">
      <span
        :class="{
          'td-text': props.tdText,
          'clamp-line': props.clampLine,
          'break-word': props.breakWord,
        }"
        @mouseenter="on.mouseenter"
        @mouseleave="on.mouseleave"
      >
        {{ props.slug || '-' }}
      </span>
    </template>

    <span v-if="props.slug">{{ props.slug }}</span>
  </Tooltip>
</template>
