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
    name: 'is_lonely',
    items: [
      {
        active: false,
        text: i18n.t('pre.project.management.group.datatable.filter.2'),
        id: '0',
        property: 'is_lonely',
      },
      {
        active: false,
        text: i18n.t('pre.project.management.group.datatable.filter.1'),
        id: '1',
        property: 'is_lonely',
      },
    ],
  },
]
