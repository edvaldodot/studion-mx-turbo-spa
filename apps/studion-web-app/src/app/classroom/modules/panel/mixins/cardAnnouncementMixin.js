import { mapState } from 'vuex'
import { format, isAfter, isBefore, isWithinInterval, parseISO } from 'date-fns'

export const cardAnnouncementMixin = {
  props: {
    index: {
      type: Number,
      default: null
    },
    user: {
      type: Object,
      default: () => {}
    },
    title: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    startDate: {
      type: String,
      default: null
    },
    endDate: {
      type: String,
      default: null
    },
    archive: {
      type: Boolean,
      default: false
    },
    fixed: {
      type: Boolean,
      default: false
    },
    options: {
      type: Boolean,
      default: true
    },
    hideStatus: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState(['Account', 'accessibility']),
    status () {
      if (isWithinInterval(new Date(), { start: parseISO(this.startDate), end: parseISO(this.endDate) })) { return this.$t('classroom.panel.announcements:card.active') }
      if (isBefore(new Date(), parseISO(this.startDate))) { return this.$t('classroom.panel.announcements:card.scheduled') }
      if (isAfter(new Date(), parseISO(this.endDate))) { return this.$t('classroom.panel.announcements:card.closed') }
    },
    date () {
      if (isWithinInterval(new Date(), { start: parseISO(this.startDate), end: parseISO(this.endDate) })) { return this.$t('classroom.panel.announcements:card.active.date', {date: format(parseISO(this.endDate), 'dd/MM/yyyy')}) }
      if (isBefore(new Date(), parseISO(this.startDate))) { return this.$t('classroom.panel.announcements:card.scheduled.date', {date: format(parseISO(this.startDate), 'dd/MM/yyyy')}) }
      if (isAfter(new Date(), parseISO(this.endDate))) { return this.$t('classroom.panel.announcements:card.closed.date', {date: format(parseISO(this.endDate), 'dd/MM/yyyy')}) }
    },
    dateHour () {
      return format(parseISO(this.startDate), "dd/MM/yyyy 'às' HH:mm")
    }
  }
}
