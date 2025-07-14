<script>
import { defineComponent } from 'vue'

import Tabs from '@/components/general/Tabs'

export default defineComponent({
  name: 'ManagementEvaluation',

  components: {
    Tabs,
  },

  computed: {
    subTabLinks() {
      return [
        {
          text: 'classroom.assessments.tab.link.1',
          location: {
            name: 'management.evaluation.index',
          },
        },
        {
          text: 'global:menu.preproject',
          disabled: !this.$isEnabledFeature('pre_project_examination'),
          location: {
            name: 'management.evaluation.preproject',
          },
        },
      ]
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('management-evaluation')"
    class="management-evaluation"
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
@media screen and (max-width: 1023px) {
  .management-evaluation {
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