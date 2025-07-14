<script>
import { defineComponent } from 'vue'
import config from '@/config'
import Checkbox from '@/components/general/Checkbox'

const { CAN_READ_WHEN_UPPER_FLAG } = config

export default defineComponent({
  name: 'BranchSelectorOptions',

  components: {
    Checkbox,
  },

  props: {
    value: {
      type: Object,
      required: true,
    },
    data: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      mutableValue: this.value,
      CAN_READ_WHEN_UPPER_FLAG: CAN_READ_WHEN_UPPER_FLAG,
    }
  },
})
</script>

<template>
  <div
    v-if="CAN_READ_WHEN_UPPER_FLAG && data.length > 0"
    class="branch-selector-options"
  >
    <h3>{{ $t('branches.options:title') }}</h3>
    <p class="mt-2">
      {{ $t('branches.options:description') }}
    </p>
    <Checkbox
      v-model="mutableValue.canReadWhenUp"
      :items="[{ label: $t('branches.options:option'), value: true }]"
      :disabled="!canWrite('courses')"
      class="mt-4"
      switch-type
    />
  </div>
</template>

<style lang="scss">
.branch-selector-options {
  margin-top: 3em;

  h3,
  p {
    font-size: 1.6em;
  }
  h3 {
    text-transform: uppercase;
  }
}
</style>
