<script>
import { defineComponent } from 'vue'
import MediationScheduled from '../components/MediationScheduled'

export default defineComponent({
  name: 'MediationScheduledPoll',

  components: { MediationScheduled },

  computed: {},

  watch: {},

  created() {},

  methods: {},
})
</script>

<template>
  <!-- TODO: add ações. -->
  <div>
    <MediationScheduled type="poll" />
    <RouterView />
  </div>
</template>
