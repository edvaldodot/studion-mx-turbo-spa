<script>
import { defineComponent } from 'vue'

import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

export default defineComponent({
  name: 'ActionsForums',

  components: {
    Dropdown,
    DropdownLink,
  },

  props: {
    forum: {
      type: Object,
      default: () => ({}),
    },
  },
})
</script>

<template>
  <Dropdown icon="dots-vertical">
    <DropdownLink
      v-if="forum.status === 'active'"
      :text="$t('global:deactivate')"
      @click="$emit('deactivate', forum)"
    />
    <DropdownLink
      :text="$t('global:edit')"
      @click="$emit('edit', forum)"
    />
    <DropdownLink
      v-if="isUserAllowedInContext('classroom:forum', 'remove')"
      :text="$t('global:remove')"
      @click="$emit('remove', forum)"
    />
    <DropdownLink
      v-if="forum.status === 'inactive'"
      :text="$t('global:activate')"
      @click="$emit('activate', forum)"
    />
    <DropdownLink
      v-if="forum.status === 'active'"
      :text="$t('global:participate')"
      @click="$emit('participate', forum)"
    />
    <DropdownLink
      v-if="forum.avaliative"
      :text="$t('classroom.forum:evaluate.students')"
      @click="$emit('avaliative', forum)"
    />
    <DropdownLink
      v-if="forum.status === 'inactive' || forum.status === 'finished'"
      :text="$t('global:visualize')"
      @click="$emit('visualize', forum)"
    />
  </Dropdown>
</template>
