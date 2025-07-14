<script>
import { defineComponent } from 'vue'

import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'

export default defineComponent({
  name: 'DatatableSessionsActions',

  components: {
    Dropdown,
    DropdownLink,
  },

  props: {
    props: {
      type: Object,
      required: true,
    },
  },
})
</script>

<template>
  <Dropdown
    v-if="notEqualsProfile('student')"
    icon="dots-vertical"
    right
  >
    <template v-if="canWrite('sessions')">
      <DropdownLink
        :text="$t('global:edit')"
        @click="$emit('open:modal')"
      />

      <DropdownLink
        :text="$t('global:remove')"
        @click="$emit('open:remove-modal')"
      />
    </template>

    <DropdownLink
      v-else
      :text="$t('global:view.more')"
      @click="$emit('open:modal')"
    />

    <DropdownLink
      v-if="canRead('classroom_access')"
      :text="$t('global:access')"
      @click="$emit('access:classroom')"
    />

    <DropdownLink
      v-if="canWrite('sessions') && props.item.type === 'closed'"
      :text="$t('community.sessions.timeline.session')"
      @click="$emit('open:timeline-modal')"
    />

    <DropdownLink
      v-if="
        $isEnabledFeature('allow_recovery_examination') &&
        props.item.isClosed &&
        canWrite('sessions') &&
        (props.item.isRecovery || props.item.recoveryExamination)
      "
      :text="$t('solutions.create.classes:modal.examination.recovery.title')"
      @click="$emit('open:recovery-modal')"
    />
  </Dropdown>
</template>
