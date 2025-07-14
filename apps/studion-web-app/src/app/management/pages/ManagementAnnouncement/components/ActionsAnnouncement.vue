<script>
import { defineComponent } from 'vue'

import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

export default defineComponent({
  name: 'ActionsAnnouncement',

  components: {
    Dropdown,
    DropdownLink,
  },

  props: {
    announcement: {
      type: Object,
      default: () => ({}),
    },
  },
})
</script>

<template>
  <Dropdown
    :data-testid="$testId('actions-announcement')"
    icon="dots-vertical"
  >
    <DropdownLink
      :text="$t('global:visualize')"
      @click="$emit('visualize', announcement)"
    />
    <DropdownLink
      :text="$t('global:edit')"
      @click="$emit('edit', announcement)"
    />
    <DropdownLink
      :text="$t('global:remove')"
      @click="$emit('remove', announcement)"
    />
  </Dropdown>
</template>
