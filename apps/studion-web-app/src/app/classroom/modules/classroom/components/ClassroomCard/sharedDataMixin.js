import { getSessionStatus } from '@/support/utils/sessionStatusDefiner'

export default {
  computed: {
    imageWidth () {
      return !this.$media.mobile ? 339 : '100%'
    },
    imageHeight () {
      return !this.$media.mobile ? 226 : 230
    },
    actionsWidth () {
      return !this.$media.mobile ? 50 : 'auto'
    },
    actionsHeight () {
      return this.$media.mobile ? 50 : 'auto'
    },
    currentSessionStatus () {
      return getSessionStatus(this.type, this.startDate, this.endDate)
    },
    availabilityText () {
      if (this.currentSessionStatus === 'waiting' && this.endDate === undefined) {
        return this.$t(
          'global:solution.availability.from',
          { 'startDate': this.formatDate(this.startDate) }
        )
      }

      if (this.currentSessionStatus === 'waiting' && this.endDate !== undefined && this.endDate !== null) {
        return this.$t(
          'global:solution.availability.between',
          { 'startDate': this.formatDate(this.startDate), 'endDate': this.formatDate(this.endDate) }
        )
      }

      if (this.currentSessionStatus === 'inprogress' && this.endDate !== undefined && this.endDate !== null) {
        return this.$t(
          'global:solution.availability.until',
          { 'endDate': this.formatDate(this.endDate) }
        )
      }

      if (this.currentSessionStatus === 'closed') {
        return this.$t(
          'global:solution.availability.between',
          { 'startDate': this.formatDate(this.startDate), 'endDate': this.formatDate(this.endDate) }
        )
      }
    }
  }
}
