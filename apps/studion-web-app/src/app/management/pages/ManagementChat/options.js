import i18n from '@/support/i18n'

export const defaultFilterListOrderOptions = () => [
  {
    text: i18n.t('global:order.date.new'),
    value: 0,
    property: 'start_time',
    type: 'desc',
  },
  {
    text: i18n.t('global:order.date.old'),
    value: 1,
    property: 'start_time',
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
        text: i18n.t('management:chat.status.active'),
        id: 'active',
        property: 'status',
      },
      {
        active: false,
        text: i18n.t('management:chat.status.inactive'),
        id: 'inactive',
        property: 'status',
      },
      {
        active: false,
        text: i18n.t('management:chat.status.finished'),
        id: 'finished',
        property: 'status',
      },
      {
        active: false,
        text: i18n.t('management:chat.status.not_started'),
        id: 'not_started',
        property: 'status',
      },
    ],
  },
]
