<script>
import { defineComponent } from 'vue'

import Tabs from '@/components/general/Tabs'

export default defineComponent({
  name: 'ManagementSessions',

  components: {
    Tabs,
  },

  computed: {
    subTabLinks() {
      return []
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('management-session')"
    class="management-session"
  >
    <RouterView>
      <Tabs
        :links="subTabLinks"
        show-bottom-border
      />
    </RouterView>
  </div>
</template>

<style lang="scss">
@media screen and (max-width: 1023px) {
  .management-session {
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
