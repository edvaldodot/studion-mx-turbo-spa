<script>
import { defineComponent } from 'vue'
import NewMessage from '../../../../classroom/modules/messages/pages/New'

export default defineComponent({
  name: 'AddMessage',

  components: {
    NewMessage,
  },
})
</script>

<template>
  <NewMessage
    is-management
    class="management__messages"
  />
</template>

<style lang="scss">
.management__messages {
  .btn-back {
    font-size: 1.4em;
    color: var(--black-500);
    text-transform: uppercase;
    margin-left: -20px;
    margin-bottom: 20px;
  }
}
</style>
