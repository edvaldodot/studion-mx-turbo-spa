<script>
import Icon from '@/components/general/Icon'

export default {
  name: 'FlagFixed',

  components: {
    Icon,
  },

  props: {
    flagIcon: {
      type: String,
      default: null,
    },

    flagTitle: {
      type: String,
      default: null,
    },
  },
}
</script>

<template>
  <div class="flag-wrapper">
    <div class="flag-wrapper__area">
      <Icon
        :name="flagIcon"
        wrapper
        size="small"
      />
      <span class="flag-wrapper__title"> {{ $t(flagTitle) }}</span>
    </div>
  </div>
</template>

<style lang="scss">
@import 'FlagFixed.scss';
</style>
