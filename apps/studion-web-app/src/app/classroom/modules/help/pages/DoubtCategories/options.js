import i18n from '@/support/i18n'

export const defaultFilterListOrderOptions = () => [
  {
    text: i18n.t('global:random.order.alphabetical'),
    value: 0,
    property: 'title',
    type: 'asc',
  },
]

export const defaultFilterListTagOptions = () => [
  {
    title: i18n.tc('global:category', 2),
    name: 'id',
    items: [],
  },
]
