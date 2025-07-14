<script>
import { defineComponent } from 'vue'

import MediationScheduled from '../components/MediationScheduled'

export default defineComponent({
  name: 'MediationScheduledMessage',

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
    <MediationScheduled type="message" />
    <RouterView />
  </div>
</template>
