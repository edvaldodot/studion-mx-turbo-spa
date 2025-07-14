<script>
import { defineComponent } from 'vue'
import TooltipSlot from '../../TooltipSlot'
import MessageMandatory from './MessageMandatory.vue'

export default defineComponent({
  name: 'TooltipMandatory',
  components: {
    TooltipSlot,
    MessageMandatory,
  },
})
</script>

<template>
  <TooltipSlot
    :width="320"
    class="tooltip__topic"
    dark
    shadow
  >
    <template #activator>
      <MessageMandatory />
    </template>

    <template #content>
      <div class="tooltip__topic--content">
        <slot />
      </div>
    </template>
  </TooltipSlot>
</template>
