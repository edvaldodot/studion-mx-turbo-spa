<script>
import { RouterLink } from 'vue-router'

export default {
  name: 'Link',
  components: {
    RouterLink,
  },
  props: {
    severity: {
      type: String,
      default: 'primary',
    },
    to: {
      type: [String, Object],
      required: true,
    },
  },
  computed: {
    severityLink() {
      const severities = {
        primary: '--primary',
        secondary: '--secondary',
      }

      return severities[this.severity] || '--primary'
    },
  },
}
</script>

<template>
  <div :class="['link', severityLink]">
    <RouterLink
      :to="to"
      v-bind="$attrs"
    >
      <slot />
    </RouterLink>
  </div>
</template>
<style lang="scss">
@use './Link.scss';
</style>
