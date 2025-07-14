<script>
import { defineComponent } from 'vue'
import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

export default defineComponent({
  name: 'DatatableBranchMetadataActions',

  components: {
    Dropdown,
    DropdownLink,
  },
})
</script>

<template>
  <Dropdown
    :data-testid="$testId('datatable-branch-metadata-actions')"
    icon="dots-vertical"
  >
    <DropdownLink
      :text="$t('global:edit')"
      @click="$emit('edit')"
    />
    <DropdownLink
      :text="$t('global:remove')"
      @click="$emit('delete')"
    />
  </Dropdown>
</template>
