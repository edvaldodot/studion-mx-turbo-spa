const sharedDataMixin = {
  data() {
    return {
      topicsTypesOptions: [
        {
          text: this.$t('solutions.create.classes:modal.type.class'),
          value: 'class',
        },
        {
          text: this.$t('solutions.create.classes:modal.type.examination'),
          value: 'examination',
        },
        {
          text: this.$t('solutions.create.classes:modal.type.research'),
          value: 'research',
        },
        {
          text: this.$t('solutions.create.classes:modal.type.competency'),
          value: 'competency',
        },
      ],
      filterListOrderOptions: [
        {
          text: this.$t('global:order.name'),
          value: 0,
          property: 'name',
          type: 'asc',
        },
        {
          text: this.$t('global:order.date.new'),
          value: 1,
          property: 'created_at',
          type: 'desc',
        },
        {
          text: this.$t('global:order.date.old'),
          value: 2,
          property: 'created_at',
          type: 'asc',
        },
      ],
    }
  },
}

export default sharedDataMixin
