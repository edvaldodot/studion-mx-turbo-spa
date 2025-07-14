import i18n from '@/support/i18n'

export const defaultFilterListOrderOptions = () => [
  {
    text: `${i18n.t('global:random.order.alphabetical')} (A-Z)`,
    value: 0,
    property: 'title',
    type: 'asc',
  },
  {
    text: `${i18n.t('global:random.order.alphabetical')} (Z-A)`,
    value: 1,
    property: 'title',
    type: 'desc',
  },
]
