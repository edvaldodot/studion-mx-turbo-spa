<script>
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'DataTableCounter',
  props: {
    count: {
      type: Number,
      default: 0,
    },
    label: {
      type: String,
      default: '',
    },
  },
})
</script>
<template>
  <p class="datatable-counter">
    {{ label }}
    <span>{{ count }}</span>
  </p>
</template>

<style lang="scss">
@import 'DataTableCounter.scss';
</style>
