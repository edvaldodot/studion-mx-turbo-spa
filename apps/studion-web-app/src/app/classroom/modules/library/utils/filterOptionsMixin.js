const filterOptionsMixin = {
  computed: {
    filterListOrderOptions () {
      return [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: 'title',
          type: 'asc'
        },
        {
          text: this.$t('global:order.date.new'),
          value: 1,
          property: 'created_at',
          type: 'desc'
        },
        {
          text: this.$t('global:order.date.old'),
          value: 2,
          property: 'created_at',
          type: 'asc'
        }
      ]
    }
  }
}

export default filterOptionsMixin
