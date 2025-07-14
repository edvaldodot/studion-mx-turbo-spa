<template>
  <div class="mediation-actions">
    <RouterView @settings="showAISettings = $event" />
    <MediationAiSettings
      v-if="$mediationAiEnabled() && showAISettings"
      :active="true"
      @close="showAISettings = false"
    />
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import MediationAiSettings from '../../components/MediationIASettings'

export default {
  name: 'MediationActions',
  components: {
    MediationAiSettings,
  },
  data() {
    return {
      showAISettings: false,
    }
  },
  created() {
    /**
     * Setup filters for mediation.actions & mediation.actions.day
     */
    this.attemptGetMediationFilters(this.$route.params.id)
  },
  methods: {
    ...mapActions(['attemptGetMediationFilters']),
  },
}
</script>
