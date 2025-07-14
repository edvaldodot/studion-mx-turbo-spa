import { mapActions } from 'vuex/dist/vuex.common.js'

export const previewMixin = {
  data() {
    return {
      item: null,
    }
  },

  computed: {
    title() {
      return this.$route.params.title
    },
    isAction() {
      return !!this.$route.params.scheduled
    },

    startTime() {
      if (!this.$route.params.startDate) {
        const date = Date.now()
        const starDate = new Date(date)
        return starDate.toISOString()
      }
      return this.$route.params.startDate
    },

    endTime() {
      const date = new Date(this.startTime)

      const duration = this.item && this.item.meta && this.item.meta.duration
      date.setDate(date.getDate() + duration)

      return date.toISOString()
    },
  },

  created() {
    this.loadPreviewAction()
  },

  methods: {
    ...mapActions(['attemptgetScheduledPreviewActions', 'setFetching', 'setFeedback']),

    loadPreviewAction() {
      const { id } = this.$route.params

      this.setFetching(true)
      this.attemptgetScheduledPreviewActions(id)
        .then(({ data }) => {
          this.item = data
        })
        .catch(() => {
          this.setFeedback({
            message: this.$t('global:error'),
            type: 'error',
          })
        })
        .finally(() => {
          this.setFetching(false)
        })
    },

    getProfileName(profile) {
      return profile.alias === 'agent' ? profile.name : this.$t(`global:${profile.alias}`)
    },

    isBack() {
      if (this.isAction) {
        this.$router.push({
          name: 'mediation.actions.day',
          params: {
            id: this.$route.params.id,
            day: this.$route.params.day,
            scheduled: this.$route.params.scheduled,
          },
        })
      } else {
        this.$router.back()
      }
    },
  },
}
