<script>
import { defineComponent } from 'vue'
import MediationScheduled from '../components/MediationScheduled'

export default defineComponent({
  name: 'MediationScheduledChat',

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
  <!-- TODO: add ações. -->
  <div>
    <MediationScheduled type="chat" />
    <RouterView />
  </div>
</template>
