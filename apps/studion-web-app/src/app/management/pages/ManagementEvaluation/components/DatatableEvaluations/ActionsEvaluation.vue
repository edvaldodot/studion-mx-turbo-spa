<script>
import { defineComponent } from 'vue'

import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

export default defineComponent({
  name: 'ActionsEvaluation',

  components: {
    Dropdown,
    DropdownLink,
  },

  props: {
    evaluation: {
      type: Object,
      default: () => ({}),
    },
  },
})
</script>

<template>
  <Dropdown
    v-if="isUserAllowedInContext('classroom:examination', 'evaluate')"
    icon="dots-vertical"
  >
    <DropdownLink
      :text="$t('classroom.assessments.evaluation:correct')"
      @click="$emit('correct', evaluation)"
    />

    <DropdownLink
      :text="$t('classroom.assessments.evaluation:view.all.attempts')"
      @click="$emit('view:attempts', evaluation)"
    />
  </Dropdown>
</template>
