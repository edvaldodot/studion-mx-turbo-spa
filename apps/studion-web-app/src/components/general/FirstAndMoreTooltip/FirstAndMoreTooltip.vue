<script>
import TooltipSlot from '../TooltipSlot'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FirstAndMoreTooltip',
  components: {
    TooltipSlot,
  },
  props: {
    list: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    makeListFirstItemAndCount(list = []) {
      if (!list.length) return '-'
      if (list.length === 1) return list[0].name
      return `${list[0].name}, +${list.length - 1}`
    },

    makeTooltipListItems(list = []) {
      const items = list.map(({ name }) => name)
      return items.join(', ')
    },
  },
})
</script>

<template>
  <TooltipSlot
    :data-testid="$testId('first-and-more-tooltip')"
    :disable-content="list.length < 2"
    horizontal-align="right"
    class="tooltip__topic"
    arrow
    dark
    shadow
  >
    <template #activator>
      <span class="td-text">
        {{ makeListFirstItemAndCount(list) }}
      </span>
    </template>

    <template #content>
      {{ makeTooltipListItems(list) }}
    </template>
  </TooltipSlot>
</template>
