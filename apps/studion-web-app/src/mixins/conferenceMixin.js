import { mapActions } from 'vuex'
import { isSafariIOS } from '@/support/utils/browserIdentifiers'

export default {
  methods: {
    ...mapActions(['setFetching', 'setFeedback', 'attemptConferenceRoomAccess']),

    openConference(sessionUuid, conferenceRoomId, config = {}) {
      if (this.$isEnabledFeature('embedded_conference') && config.type === 'live' && this.equalsProfile('student')) {
        this.$router.push({
          name: 'classroom.conference.live',
          params: {
            session_uuid: sessionUuid,
            id: conferenceRoomId,
          },
        })
      } else {
        const windowReference = isSafariIOS() ? window.open() : null

        this.setFetching(true)
        this.attemptConferenceRoomAccess({
          sessionUuid,
          conferenceRoomId,
          accessType: config.type,
        })
          .then(({ data }) => {
            const URL = config.type === 'external' && config.url ? config.url : data.url

            if (windowReference) {
              windowReference.location = URL
              return
            }

            window.open(URL, '_blank')
          })
          .catch(({ response }) => {
            if (windowReference) windowReference.close()

            this.setFeedback({
              message: this.$t(`classroom.conference:recording.error:${response.data.message}`),
            })
          })
          .finally(() => {
            this.setFetching(false)
          })
      }
    },
  },
}
