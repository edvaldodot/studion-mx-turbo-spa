<script>
import { defineComponent } from 'vue'

import Chip from '@/components/general/Chip'
import Tooltip from '@/components/general/Tooltip'
import Loading from '@/components/general/Loading'

export default defineComponent({
  name: 'DraftSatusChip',
  components: {
    Chip,
    Tooltip,
    Loading,
  },
  props: {
    saving: {
      type: Boolean,
      default: false,
    },
    success: {
      type: Boolean,
      default: false,
    },
    showStatusText: {
      type: Boolean,
      default: false,
    },
    lastSave: {
      type: Object,
      default: () => ({ date: null, hour: null }),
    },
  },
  computed: {
    statusText() {
      if (!this.showStatusText) return ''
      if (this.saving) return this.$t('global:saving')
      return this.success ? this.$t('global:saved') : this.$t('global:save.error')
    },
    icon() {
      if (this.saving) return ''
      return this.success ? 'check-all' : 'close'
    },
    tooltipText() {
      if (this.saving) return this.$t('classroom.assessments.evaluation:saving')

      return this.success
        ? this.$t('global:saved.in', this.lastSave)
        : this.$t('classroom.assessments.evaluation:saving.error')
    },
  },
})
</script>

<template>
  <div
    class="draft__status"
    :class="{ error: !success }"
  >
    <Tooltip
      :uppercase="false"
      :bold-font="false"
    >
      <template #activator="{ on }">
        <Chip
          :text="statusText"
          color="inverted-success"
          :icon="icon"
          @mouseenter.native="on.mouseenter"
          @mouseleave.native="on.mouseleave"
        >
          <Loading v-show="saving" />
        </Chip>
      </template>

      <span>{{ tooltipText }}</span>
    </Tooltip>
  </div>
</template>

<style lang="scss">
.draft__status {
  &.error {
    .chip.--inverted-success svg {
      color: var(--feedback-is-wrong);
    }
  }
}
</style>