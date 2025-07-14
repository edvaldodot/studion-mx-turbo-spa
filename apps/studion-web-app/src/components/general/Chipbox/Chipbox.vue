<script>
import { defineComponent } from 'vue'

import Icon from '../Icon'

export default defineComponent({
  name: 'TheChipbox',
  components: {
    Icon,
  },
  props: {
    label: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: null,
    },
    colorVariant: {
      type: String,
      default: '',
    },
  },
})
</script>

<template>
  <div
    :data-testid="$testId('chipbox')"
    class="chipbox"
    :class="[colorVariant]"
  >
    <Icon
      v-if="icon"
      :name="icon"
    />

    <span v-if="label">
      {{ label }}
    </span>
  </div>
</template>

<style lang="scss">
@import './Chipbox.scss';
</style>
