<script>
import { defineComponent } from 'vue'
import MediationScheduled from '../components/MediationScheduled'

export default defineComponent({
  name: 'MediationScheduledAnnoucement',

  components: {
    MediationScheduled,
  },

  computed: {},

  watch: {},

  created() {},

  methods: {},
})
</script>
<!-- TODO: add ações. -->
<template>
  <div>
    <MediationScheduled type="announcement" />
    <RouterView />
  </div>
</template>
