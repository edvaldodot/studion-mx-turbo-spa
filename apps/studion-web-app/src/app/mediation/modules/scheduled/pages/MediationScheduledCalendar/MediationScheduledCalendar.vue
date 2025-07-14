<script>
import { defineComponent } from 'vue'
import MediationScheduled from '../components/MediationScheduled'

export default defineComponent({
  name: 'MediationScheduledCalendar',

  components: {
    MediationScheduled,
  },

  watch: {},

  created() {},

  methods: {},
})
</script>

<template>
  <!-- TODO: add ações. -->
  <div>
    <MediationScheduled type="event" />
    <RouterView />
  </div>
</template>
