<script>
import MessageMandatory from './components/MessageMandatory.vue'
import TooltipMandatory from './components/TooltipMandatory.vue'

export default {
  name: 'CardMandatory',
  components: {
    MessageMandatory,
    TooltipMandatory,
  },
  props: {
    showTooltip: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<template>
  <div class="card__mandatory">
    <TooltipMandatory v-if="showTooltip">
      <slot name="tooltipContent" />
    </TooltipMandatory>
    <MessageMandatory v-else />
  </div>
</template>

<style lang="scss">
@import 'CardMandatory.scss';
</style>
