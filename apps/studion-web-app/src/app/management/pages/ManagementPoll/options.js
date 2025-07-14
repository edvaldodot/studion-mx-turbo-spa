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
    title: i18n.t('mediation:scheduled.filter.shooting.date'),
    name: 'status',
    items: [
      {
        active: false,
        text: i18n.t('management:polls.status.active', 1),
        id: 'active',
        property: 'status',
      },
      {
        active: false,
        text: i18n.t('management:polls.status.waiting', 1),
        id: 'waiting',
        property: 'status',
      },
      {
        active: false,
        text: i18n.t('management:polls.status.closed', 1),
        id: 'closed',
        property: 'status',
      },
    ],
  },
]
