<script>
import { defineComponent } from 'vue'

import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

export default defineComponent({
  name: 'ActionsPoll',

  components: {
    Dropdown,
    DropdownLink,
  },

  props: {
    poll: {
      type: Object,
      default: () => ({}),
    },
  },
})
</script>

<template>
  <Dropdown
    :data-testid="$testId('actions-polls')"
    icon="dots-vertical"
  >
    <DropdownLink
      :text="$t('global:access')"
      @click="$emit('access', poll)"
    />

    <DropdownLink
      v-if="poll.status !== 'closed'"
      :text="$t('global:edit')"
      @click="$emit('edit', poll)"
    />

    <DropdownLink
      v-if="poll.status === 'waiting'"
      :text="$t('global:remove')"
      @click="$emit('remove', poll)"
    />
  </Dropdown>
</template>
