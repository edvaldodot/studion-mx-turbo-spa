import i18n from '@/support/i18n'

export const defaultFilterListOrderOptions = () => [
  {
    text: i18n.t('global:order.name'),
    value: 0,
    property: 'session_name',
    type: 'asc',
  },
  {
    text: i18n.t('global:order.date.new'),
    value: 1,
    property: 'session_start_date',
    type: 'desc',
  },
  {
    text: i18n.t('global:order.date.old'),
    value: 2,
    property: 'session_start_date',
    type: 'asc',
  },
]
