import { mapActions, mapState } from 'vuex'
import { format, parseISO } from 'date-fns'

export const eventMixin = {
  computed: {
    ...mapState(['Classroom', 'Account', 'accessibility']),
    sessionUuid() {
      return this.$route.params.session_uuid
    },
    fullPermission() {
      return this.notEqualsProfile('student') && this.canWrite('classroom:event')
    },
  },
  methods: {
    ...mapActions([
      'setFetching','attemptClassroomCalendarEventRemoval',
    ]),
    editEvent(eventId) {
      this.openModalAddEvent({eventId})
      if (this.eventModal) {
        this.eventModal = false
      }
    },
    closeModalAddEvent() {
      this.modalAddEvent = false
    },
    openModalAddEvent (params = {}) {
      this.addParamsModal = params
      this.modalAddEvent = true
    },
    deleteEvent(eventId) {
      this.setFetching(true)
      this.attemptClassroomCalendarEventRemoval(eventId)
        .then(() => {
          this.updateEvents()
        })
        .finally(() => {
          this.setFetching(false)
        })
    },
  },
}
