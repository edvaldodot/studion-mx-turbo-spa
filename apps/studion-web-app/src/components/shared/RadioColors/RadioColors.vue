<template>
  <radio
    class="radio-colors"
    v-model="value.color"
    :description="$t('global:form.select.color')"
    :items="colors"
    :validation="validation.color"
    :dark="dark"
    horizontal
    :disabled="disabled"
    label-as-class
    custom
  />
</template>

<script>
import Radio from '@/components/general/Radio'

import { COLORS } from './shared'

export default {
  name: 'RadioColors',

  components: {
    Radio
  },

  props: {
    dark: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    validation: {
      type: Object,
      default: () => {}
    },
    value: {
      type: Object,
      default: () => {}
    }
  },

  data () {
    return {
      colors: COLORS
    }
  }
}
</script>

<style lang="scss">
  @import "./RadioColors.scss";
</style>
