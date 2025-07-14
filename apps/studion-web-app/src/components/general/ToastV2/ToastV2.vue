<script>
import { defineComponent } from 'vue'

import Icon from '../Icon'

export default defineComponent({
  name: 'ToastV2',

  components: {
    Icon,
  },

  props: {
    active: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'warning',
    },
  },
})
</script>

<template>
  <div
    v-if="active"
    class="toast-v2"
  >
    <Icon
      :name="icon"
      pack="material"
    />
    <div class="toast-v2__content">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
    </div>
    <Icon
      name="close"
      wrapper
      @click="$emit('close')"
    />
  </div>
</template>

<style lang="scss">
@import 'ToastV2.scss';
</style>
