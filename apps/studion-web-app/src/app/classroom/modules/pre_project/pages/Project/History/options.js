import i18n from '@/support/i18n'

export const defaultFilterListOrderOptions = () => [
  {
    text: i18n.t('global:order.date.new'),
    value: 0,
    property: 'created_at',
    type: 'desc',
  },
  {
    text: i18n.t('global:order.date.old'),
    value: 1,
    property: 'created_at',
    type: 'asc',
  },
]

export const defaultFilterListTagOptions = () => [
  {
    title: i18n.t('community.index:datatable.header.status'),
    name: 'status',
    items: [
      {
        active: false,
        text: i18n.t('classroom.pre.project:history.datatable.filter.1'),
        id: 0,
        property: 'status',
      },
      {
        active: false,
        text: i18n.t('classroom.pre.project:history.datatable.filter.2'),
        id: 1,
        property: 'status',
      },
    ],
  },
]
