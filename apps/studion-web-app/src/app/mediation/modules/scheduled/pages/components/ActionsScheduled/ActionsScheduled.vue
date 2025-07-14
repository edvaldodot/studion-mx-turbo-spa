<script>
import { defineComponent } from 'vue'

import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

export default defineComponent({
  name: 'ActionsScheduled',

  components: {
    Dropdown,
    DropdownLink,
  },

  props: {
    scheduled: {
      type: Object,
      default: () => ({}),
    },
  },
})
</script>

<template>
  <Dropdown icon="dots-vertical">
    <DropdownLink
      v-if="canWrite('mediation_plan:program_actions')"
      :text="$t('mediation:scheduled.action.btn.see.action')"
      @click="$emit('see', scheduled)"
    />
    <DropdownLink
      :text="$t('mediation.mediation:actions.report')"
      @click="$emit('report', scheduled)"
    />
    <DropdownLink
      :text="$t('mediation:scheduled.action.btn.preview')"
      @click="$emit('preview', scheduled)"
    />
  </Dropdown>
</template>
