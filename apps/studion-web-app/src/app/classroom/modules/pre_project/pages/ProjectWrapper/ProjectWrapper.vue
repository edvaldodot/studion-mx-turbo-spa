<script>
import { defineComponent } from 'vue'
import { tabLinksAdmin, tabLinksStudent } from './utils'

export default defineComponent({
  name: 'ProjectWrapper',

  created() {
    let tabLinks = tabLinksAdmin

    if (this.equalsProfile('student')) {
      tabLinks = tabLinksStudent
    }

    this.$emit('change-header', { customClasses: { preProject: true }, tabLinks: [...tabLinks()] })
  },
})
</script>

<template>
  <div :data-testid="$testId('pre-project')">
    <RouterView />
  </div>
</template>
