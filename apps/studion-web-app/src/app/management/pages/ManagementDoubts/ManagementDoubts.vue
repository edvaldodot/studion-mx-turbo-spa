<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ManagementDoubts',
})
</script>

<template>
  <div
    :data-testid="$testId('management-doubts')"
    class="management-doubts"
  >
    <RouterView />
  </div>
</template>

<style lang="scss">
@media screen and (max-width: 1023px) {
  .management-doubts {
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
