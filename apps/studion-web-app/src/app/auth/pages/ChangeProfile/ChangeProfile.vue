<script>
import { mapState, mapActions } from 'vuex'
export default {
  props: {
    profileId: null,
    callback: null,
    userUuid: null,
  },

  computed: {
    ...mapState(['Account', 'accessibility']),
  },
  created() {
    this.setFetching(true)

    if (this.userUuid) {
      return this.attemptForcedProfileStudent(this.profileId, this.userUuid).then(() => {
        this.attemptUserAccountRetrieval()
          .then(() => {
            return this.callback()
          })
          .finally(() => {
            this.setFetching(false)
          })
      })
    }

    this.attemptChangeUserProfile(this.profileId).then(() => {
      this.attemptUserAccountRetrieval()
        .then(() => {
          this.$router.push({ name: 'index' })
        })
        .finally(() => {
          this.setFetching(false)
        })
    })
  },
  destroyed() {
    this.setFetching(false)
  },
  methods: {
    ...mapActions([
      'attemptChangeUserProfile',
      'attemptUserAccountRetrieval',
      'setFetching',
      'attemptForcedProfileStudent',
    ]),
  },
}
</script>

<template>
  <div class="main-content  dashboard">
    <router-view></router-view>
  </div>
</template>
