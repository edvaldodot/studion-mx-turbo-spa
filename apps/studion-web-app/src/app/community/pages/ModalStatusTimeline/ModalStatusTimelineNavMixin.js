export default {
  computed: {
    fromTrail() {
      return this.$route.params.trailId
    },
  },

  created() {
    if (!this.name) return this.goBack()
  },

  methods: {
    goBack() {
      if (this.fromTrail) {
        return this.$router.push({
          name: 'trails.users',
          params: { id: this.$route.params.trailId },
        })
      }

      this.communityBackRoute()
    },

    changeStatus() {
      if (this.fromTrail) {
        return this.$router.push({
          name: 'session.enroll.change-status',
          params: { trailId: this.$route.params.trailId },
        })
      }

      this.communityBackRoute({ changeStatusOpen: this.$route.params.enrollmentId })
    },

    communityBackRoute(additionalParams) {
      return this.$router.push({
        name: 'community.sessions.enrollments',
        params: { ...this.$route.params, ...additionalParams },
      })
    },
  },
}
