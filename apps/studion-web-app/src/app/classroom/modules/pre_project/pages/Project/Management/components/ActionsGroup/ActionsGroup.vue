<script>
import { defineComponent } from 'vue'

import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

export default defineComponent({
  name: 'ActionsGroup',

  components: {
    Dropdown,
    DropdownLink,
  },

  props: {
    item: {
      type: Array,
      default: () => [],
    },
  },
})
</script>

<template>
  <Dropdown icon="dots-vertical">
    <DropdownLink
      :text="$t('global:edit')"
      @click="$emit('edit')"
    />
    <DropdownLink
      :text="$t('global:remove')"
      @click="$emit('remove')"
    />

    <DropdownLink
      :text="$t('global:visualize')"
      @click="$emit('visualize')"
    />
  </Dropdown>
</template>
