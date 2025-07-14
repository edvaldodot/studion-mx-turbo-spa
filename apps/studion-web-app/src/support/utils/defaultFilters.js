import i18n from '@/support/i18n'

export const defaultOrderFilters = (nameProp) => [
  {
    text: i18n.t('community.sessions.orders:created.desc'),
    value: 0,
    property: 'created_at',
    type: 'desc',
  },
  {
    text: i18n.t('community.sessions.orders:created.asc'),
    value: 1,
    property: 'created_at',
    type: 'asc',
  },
  {
    text: i18n.t('community.sessions.orders:name'),
    value: 2,
    property: nameProp,
    type: 'asc',
  },
]
