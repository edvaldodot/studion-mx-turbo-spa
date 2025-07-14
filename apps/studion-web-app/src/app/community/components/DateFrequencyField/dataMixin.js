const dataMixin = {
  computed: {
    weekDays () {
      return [
        {
          value: 'monday',
          label: this.$t('global:abbreviation.monday')
        },
        {
          value: 'tuesday',
          label: this.$t('global:abbreviation.tuesday')
        },
        {
          value: 'wednesday',
          label: this.$t('global:abbreviation.wednesday')
        },
        {
          value: 'thursday',
          label: this.$t('global:abbreviation.thursday')
        },
        {
          value: 'friday',
          label: this.$t('global:abbreviation.friday')
        },
        {
          value: 'saturday',
          label: this.$t('global:abbreviation.saturday')
        },
        {
          value: 'sunday',
          label: this.$t('global:abbreviation.sunday')
        }
      ]
    },
    timeIntervals () {
      const amount = this.value.interval || 0
      return [
        {
          value: 'daily',
          text: this.$tc('global:day.plural', amount)
        },
        {
          value: 'weekly',
          text: this.$tc('global:week.plural', amount)
        },
        {
          value: 'monthly',
          text: this.$tc('global:month.plural', amount)
        },
        {
          value: 'yearly',
          text: this.$tc('global:year.plural', amount)
        }
      ]
    }
  }
}

export default dataMixin
