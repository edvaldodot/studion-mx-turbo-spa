<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ModalBody',
})
</script>

<template>
  <div
    :data-testid="$testId('modal-body')"
    class="modal-form"
  >
    <slot></slot>
  </div>
</template>
