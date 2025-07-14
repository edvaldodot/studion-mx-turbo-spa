<script>
import NavHeader from '@/components/general/NavHeader'
import VimeoPlayerTracker from '@/components/general/VimeoPlayerTracker'

import { mapState, mapActions } from 'vuex'

export default {
  name: 'ConferenceRoomWatch',

  components: {
    NavHeader,
    VimeoPlayerTracker,
  },

  computed: {
    ...mapState(['Conferences']),
  },

  created() {
    if (this.$route.params.id !== this.Conferences.currentRecord.id) {
      this.$router.push({
        name: 'classroom.conference',
        params: { session_uuid: this.$route.params.session_uuid },
      })
    }
  },

  methods: {
    ...mapActions(['attemptConsumeRecording']),

    /**
     * Dispatch endpoint to record video consume
     * @param {Number} videoPosition in seconds
     */
    consume(videoPosition) {
      this.attemptConsumeRecording({
        consumedValue: videoPosition,
        id: this.$route.params.id,
      })
    },
  },
}
</script>

<template>
  <div class="cwatch">
    <NavHeader
      :title="Conferences.currentRecord.name"
      @back="$router.push({ name: 'classroom.conference' })"
    />

    <div class="cwatch-content">
      <div class="cwatch-content__video">
        <VimeoPlayerTracker
          :source="Conferences.currentRecord.url"
          :time-watched="0"
          :can-skip="Conferences.currentRecord.allowAdvance"
          @consume="consume"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import './ConferenceRoomWatch.scss';
</style>
