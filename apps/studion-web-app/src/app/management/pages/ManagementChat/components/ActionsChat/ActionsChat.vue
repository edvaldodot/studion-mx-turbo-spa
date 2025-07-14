<script>
import { defineComponent } from 'vue'
import { format } from 'date-fns'

import Dropdown from '@/components/general/Dropdown'
import DropdownLink from '@/components/general/DropdownLink'
import DropdownLinkTooltip from '@/components/shared/DropdownLinkTooltip'

export default defineComponent({
  name: 'ActionsChat',

  components: {
    Dropdown,
    DropdownLink,
    DropdownLinkTooltip,
  },

  props: {
    chat: {
      type: Object,
      default: () => ({}),
    },
  },

  computed: {
    today() {
      return format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    },
    isChatInitiated() {
      const today = new Date(this.today).getTime()
      const initialTime = new Date(this.chat.start_time).getTime()

      return today > initialTime
    },
  },
})
</script>

<template>
  <Dropdown icon="dots-vertical">
    <DropdownLink
      v-if="chat.status === 'active'"
      :text="$t('global:deactivate')"
      @click="$emit('deactivate', chat)"
    />
    <DropdownLinkTooltip
      :dropdown-props="{
        text: $t('global:edit'),
        disabled: isChatInitiated,
      }"
      :tooltip="{
        condition: isChatInitiated,
        text: $t('classroom.chat:feedback.edit.error.1'),
        props: { uppercase: false },
      }"
      @click="$emit('edit', chat)"
    />
    <DropdownLink
      :text="$t('global:view.more')"
      @click="$emit('seemore', chat)"
    />
    <DropdownLink
      :text="$t('global:remove')"
      @click="$emit('remove', chat)"
    />
    <DropdownLink
      v-if="chat.status === 'inactive'"
      :text="$t('global:activate')"
      @click="$emit('activate', chat)"
    />

    <DropdownLink
      v-if="chat.status === 'active'"
      :text="$t('global:participate')"
      @click="$emit('participate', chat)"
    />
    <DropdownLink
      :text="`${$t('global:edit')} ${$t('classroom.chat:modal.nickname.form:nickname')}`"
      @click="$emit('editNickName')"
    />
    <DropdownLink
      v-if="chat.status === 'finished'"
      :text="$t('global:visualize')"
      @click="$emit('visualize', chat)"
    />
  </Dropdown>
</template>
