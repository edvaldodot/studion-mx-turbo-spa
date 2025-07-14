<script>
import { defineComponent } from 'vue'

import Tabs from '@/components/general/Tabs'

export default defineComponent({
  name: 'ManagementMessages',

  components: {
    Tabs,
  },

  computed: {
    subTabLinks() {
      return [
        {
          text: 'global:menu.classroom.messages',
          location: {
            name: 'management.messages.index',
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
    <RouterView>
      <Tabs
        class="mb-4"
        :links="subTabLinks"
        show-bottom-border
      />
    </RouterView>
  </div>
</template>

<style lang="scss">
.management-messages {
  .filter {
    margin-bottom: 0;
  }
}

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
