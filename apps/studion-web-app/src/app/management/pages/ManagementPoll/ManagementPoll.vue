<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ManagementPoll',

  computed: {
    subTabLinks() {
      return [
        {
          text: 'solutions:tools.poll',
          location: {
            name: 'management.poll.index',
          },
        },
      ]
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('management-messages')"
    class="management-messages"
  >
    <RouterView />
  </div>
</template>

<style lang="scss">
@media screen and (max-width: 1023px) {
  .management-messages {
    .filter .center {
      display: grid;

      .tabs-filter {
        order: 0;
      }

      .filter-options {
        order: 1;
      }
    }
  }
}
</style>
