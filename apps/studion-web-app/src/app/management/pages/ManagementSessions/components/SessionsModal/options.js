import i18n from '@/support/i18n'

export const defaultFilterListOrderOptions = () => [
  {
    text: i18n.t('global:order.name'),
    value: 0,
    property: 'name',
    type: 'asc',
  },
  {
    text: i18n.t('global:order.date.initial.new'),
    value: 1,
    property: 'start_time',
    type: 'desc',
  },
  {
    text: i18n.t('global:order.date.initial.old'),
    value: 2,
    property: 'start_time',
    type: 'asc',
  },
]
