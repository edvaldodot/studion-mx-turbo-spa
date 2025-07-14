<script>
import { defineComponent } from 'vue'

import Action from '@/components/general/Action'
import Tooltip from '@/components/general/Tooltip'

export default defineComponent({
  name: 'StartExaminationButton',

  components: {
    Action,
    Tooltip,
  },

  props: {
    disabled: {
      type: Boolean,
      default: false,
    },

    tooltip: {
      type: String,
      default: null,
    },
  },
})
</script>

<template>
  <div>
    <Tooltip
      v-if="disabled && tooltip"
      :uppercase="false"
      :bold-font="false"
      :width="250"
      vertical-align="top"
    >
      <template #activator="{ on }">
        <Action
          :text="$t('global:start')"
          type="button"
          primary
          large
          fixed-width
          disabled
          @mouseenter.native="on.mouseenter"
          @mouseleave.native="on.mouseleave"
        />
      </template>

      <span>{{ tooltip }}</span>
    </Tooltip>

    <Action
      v-else
      :text="$t('global:start')"
      type="button"
      primary
      large
      fixed-width
      :disabled="disabled"
      @click="$emit('click')"
    />
  </div>
</template>

<style></style>
