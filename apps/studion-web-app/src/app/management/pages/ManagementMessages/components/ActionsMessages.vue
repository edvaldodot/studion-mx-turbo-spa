<script>
import { defineComponent } from 'vue'

import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

export default defineComponent({
  name: 'ActionsMessages',

  components: {
    Dropdown,
    DropdownLink,
  },

  props: {
    message: {
      type: Object,
      default: () => ({}),
    },
  },
})
</script>

<template>
  <Dropdown
    :data-testid="$testId('actions-messages')"
    icon="dots-vertical"
  >
    <DropdownLink
      :text="$t('global:access')"
      @click="$emit('access', message)"
    />
  </Dropdown>
</template>
