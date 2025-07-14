const sharedDataMixin = {
  computed: {
    preferenceColumnsList () {
      return [
        {
          label: this.$t('community.index:datatable.header.picture'),
          value: 'picture'
        },
        {
          label: this.$t('community.index:datatable.header.user'),
          value: 'user'
        },
        {
          label: this.$t('community.index:datatable.header.profile'),
          value: 'profile'
        },
        {
          label: this.$t('community.index:datatable.header.username'),
          value: 'username'
        },
        {
          label: this.$t('community.index:datatable.header.status'),
          value: 'status'
        },
        {
          label: this.$t('community.index:datatable.header.branch'),
          value: 'branch'
        },
        {
          label: this.$t('community.index:datatable.header.branch.upper'),
          value: 'upper_branch'
        },
        {
          label: this.$t('community.index:datatable.header.last.access'),
          value: 'last_access'
        }
      ]
    }
  }
}

export default sharedDataMixin
