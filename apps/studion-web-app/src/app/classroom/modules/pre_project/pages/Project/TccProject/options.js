import i18n from '@/support/i18n'

export const defaultFilterListOrderOptions = () => [
  {
    text: i18n.t('global:random.order.alphabetical.a.z'),
    value: 0,
    property: 'title',
    type: 'asc',
  },
  {
    text: i18n.t('global:random.order.alphabetical.z.a'),
    value: 1,
    property: 'title',
    type: 'desc',
  },
  {
    text: i18n.t('global:order.date.new'),
    value: 2,
    property: 'schedule_period_start',
    type: 'asc',
  },
  {
    text: i18n.t('global:order.date.old'),
    value: 3,
    property: 'schedule_period_start',
    type: 'desc',
  },
]
