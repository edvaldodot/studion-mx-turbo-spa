<script>
import { formatFileSize } from '@/support/utils/storageUnit'
import ProgressBar from '../ProgressBar'

export default {
  name: 'DataStorageProgress',
  components: {
    ProgressBar,
  },
  props: ['used', 'usedPercent', 'total'],
  methods: {
    formatFileSize,
  },
}
</script>

<template>
  <div class="library-usage">
    <progress-bar
      :actual="used"
      :total="total"
    ></progress-bar>
    <span class="library-usage-used">{{
      $t('library:database.used', { num: formatFileSize(used) })
    }}</span>
    <span class="library-usage-total">{{
      $t('library:database.total', { num: formatFileSize(total) })
    }}</span>
  </div>
</template>

<style lang="scss">
@import 'DataStorageProgress.scss';
</style>
