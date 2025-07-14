<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ManagementAnnouncement',
})
</script>

<template>
  <div
    :data-testid="$testId('management-announcement')"
    class="management-announcement"
  >
    <RouterView />
  </div>
</template>

<style lang="scss">
@media screen and (max-width: 1023px) {
  .management-announcement {
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
