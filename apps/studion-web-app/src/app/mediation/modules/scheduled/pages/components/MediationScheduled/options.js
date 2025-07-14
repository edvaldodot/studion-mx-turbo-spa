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
  {
    text: i18n.t('mediation:scheduled.order.shooting.date.new'),
    value: 2,
    property: 'dispatchedAt',
    type: 'desc',
  },
  {
    text: i18n.t('mediation:scheduled.order.shooting.date.old'),
    value: 3,
    property: 'dispatchedAt',
    type: 'asc',
  },
  {
    text: i18n.t('global:random.order.alphabetical'),
    value: 4,
    property: 'title',
    type: 'desc',
  },
]

export const defaultFilterListOrderOptions2 = () => [
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
  {
    text: i18n.t('global:random.order.alphabetical'),
    value: 4,
    property: 'title',
    type: 'desc',
  },
]

export const defaultFilterListTagOptions = () => [
  {
    title: i18n.t('mediation:scheduled.filter.shooting.date'),
    name: 'dateShooting',
    items: [
      {
        active: false,
        text: i18n.t('mediation:scheduled.filter.shooting.no.date'),
        id: 'noDate',
        property: 'dateShooting',
      },
      {
        active: false,
        text: i18n.t('mediation:scheduled.filter.shooting.with.date'),
        id: 'withDispatchedDate',
        property: 'dateShooting',
      },
    ],
  },
]
