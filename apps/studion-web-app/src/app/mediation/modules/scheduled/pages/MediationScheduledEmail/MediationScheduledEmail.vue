<script>
import { defineComponent } from 'vue'

import MediationScheduled from '../components/MediationScheduled'

export default defineComponent({
  name: 'MediationScheduledEmail',

  components: {
    MediationScheduled,
  },

  computed: {},

  watch: {},

  created() {},

  methods: {},
})
</script>

<template>
  <div>
    <!-- TODO: add ações. -->
    <MediationScheduled type="email" />
    <RouterView />
  </div>
</template>
