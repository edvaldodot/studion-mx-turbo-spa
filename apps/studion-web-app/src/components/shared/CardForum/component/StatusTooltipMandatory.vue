<script>
import { defineComponent } from 'vue'
import Icon from '@/components/general/Icon'

export default defineComponent({
  name: 'StatusTooltipMandatory',
  components: {
    Icon,
  },
  props: {
    checked: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    statusColor() {
      return this.checked ? 'text-success-900' : 'text-alert-900'
    },
  },
})
</script>

<template>
  <div class="status-tooltip-mandatory">
    <Icon
      :class="['icon-fill-1', statusColor]"
      :name="checked ? 'check_circle' : 'cancel'"
      pack="material"
    />
    <span>
      <slot />
    </span>
  </div>
</template>

<style lang="scss">
.status-tooltip-mandatory {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 5px;

  > span {
    font-size: 0.875rem;
  }
}
</style>
