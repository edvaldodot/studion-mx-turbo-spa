<script>
import DropdownLink from '@/components/general/DropdownLink'
import Tooltip from '@/components/general/Tooltip'

export default {
  name: 'DropdownLinkTooltip',

  components: {
    DropdownLink,
    Tooltip,
  },

  props: {
    dropdownProps: {
      type: Object,
      default: () => ({}),
    },
    tooltip: {
      type: Object,
      default: () => ({
        condition: false,
        text: null,
        props: {},
      }),
    },
  },

  methods: {
    triggerClickEvent() {
      if (!this.dropdownProps.disabled) {
        this.$parent.toggleMenu()
        this.$emit('click')
      }
    },
  },
}
</script>

<template>
  <Tooltip
    v-if="tooltip.condition"
    v-bind="tooltip.props"
  >
    <template #activator="{ on }">
      <DropdownLink
        v-bind="{ ...dropdownProps, wrapper: true }"
        @mouseenter.native="on.mouseenter"
        @mouseleave.native="on.mouseleave"
        @click="triggerClickEvent"
      />
    </template>
    <span class="text">{{ tooltip.text }}</span>
  </Tooltip>

  <DropdownLink
    v-else
    v-bind="{ ...dropdownProps, wrapper: true }"
    @click="triggerClickEvent"
  />
</template>
