<script>
import { defineComponent } from 'vue'

import Checkbox from '@/components/general/Checkbox'
import Icon from '@/components/general/Icon'

export default defineComponent({
  name: 'StudentInfo',

  components: {
    Checkbox,
    Icon,
  },

  props: {
    name: {
      type: String,
      required: true,
    },

    photo: {
      type: String,
      default: null,
    },

    selected: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      default: null,
    },

    disabled: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <div class="user__user">
    <div class="user__photo">
      <img
        v-if="photo"
        :src="photo"
      />
      <Icon
        v-else
        class="text-4xl"
        name="account_circle"
        pack="material"
      />
    </div>

    <div class="user__info">
      <h3 class="user__name clamp-line text-base">
        {{ name }}
        <span v-if="role">{{ ` (${$t(`global:${role}`)})` }}</span>
      </h3>
    </div>

    <Checkbox
      :value="selected"
      :items="[{ value: true }]"
      :disabled="disabled"
      switch-type
      dark
      gray-bg
      @change="$emit('student:toggle', $event)"
    />
  </div>
</template>