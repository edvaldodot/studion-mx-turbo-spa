<script>
import { defineComponent } from 'vue'
import { mapState } from 'vuex'

import Icon from '@/components/general/Icon'
import TooltipSlot from '@/components/general/TooltipSlot'

export default defineComponent({
  name: 'ClassTimeTooltip',

  components: {
    Icon,
    TooltipSlot,
  },

  computed: {
    ...mapState({
      user: (state) => state.Account.user,
    }),

    workloadLimit() {
      return this.user && this.user.workload_limit
    },
  },
})
</script>

<template>
  <TooltipSlot
    :width="460"
    :arrow="!$media.mobile"
    shadow
    dark
  >
    <template #activator>
      <Icon
        class="tip__icon"
        size="small"
        name="help"
        wrapper
        dark
      />
    </template>

    <template #content>
      <div class="solution-create-class-time__tip">
        <p class="mb-1 solution-create-class-time__title">
          {{ $t('solutions.create:form.class.time.tooltip.1') }}
        </p>
        <p class="mb-1 solution-create-class-time__desc">
          {{ $t('solutions.create:form.class.time.tooltip.2') }}
        </p>
        <p class="mb-1">
          {{ $t('solutions.create:form.class.time.tooltip.3') }}:
          <span class="text-highlight">{{
            `${workloadLimit && workloadLimit.daily_minutes} ${$t(
              'global:minutes.min'
            ).toLowerCase()}`
          }}</span>
        </p>
        <p class="mb-1">
          {{ $t('solutions.create:form.class.time.tooltip.4') }}:
          <span class="text-highlight">{{
            `${workloadLimit && workloadLimit.uninterrupted_minutes} ${$t(
              'global:minutes.min'
            ).toLowerCase()}`
          }}</span>
        </p>
        <p class="text-color">
          {{ $t('solutions.create:form.class.time.tooltip.5') }}:
          <span class="text-highlight">{{
            `${workloadLimit && workloadLimit.break_time_minutes} ${$t(
              'global:minutes.min'
            ).toLowerCase()}`
          }}</span>
        </p>
      </div>
    </template>
  </TooltipSlot>
</template>
