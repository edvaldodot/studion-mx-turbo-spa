<script>
import { defineComponent } from 'vue'
import ConferenceRoomLive from '../../classroom/modules/conferences_rooms/pages/ConferenceRoomLive/ConferenceRoomLive.vue'

export default defineComponent({
  name: 'TestPage',

  components: {
    ConferenceRoomLive,
  },

  setup() {
    console.log("Look at me, i'm using setup() now!")
  },
})
</script>

<template>
  <div class="main-content">
    <div class="test__page">
      <ConferenceRoomLive />
    </div>
  </div>
</template>

<style lang="scss">
.test__page {
  display: flex;
  padding: 5em;
}
</style>
