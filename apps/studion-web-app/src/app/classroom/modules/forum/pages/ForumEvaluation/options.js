import i18n from '@/support/i18n'

export const defaultFilterListOrderOptions = () => [
  {
    text: i18n.t('global:order.grade.add'),
    value: 0,
    property: 'grade',
    type: 'asc',
  },
  {
    text: i18n.t('global:order.grade.descending'),
    value: 1,
    property: 'grade',
    type: 'desc',
  },
  {
    text: i18n.t('global:order.name'),
    value: 2,
    property: 'name',
    type: 'asc',
  },
]

export const defaultFilterListTagOptions = () => [
  {
    title: i18n.t('global:grades'),
    name: 'status',
    items: [
      {
        active: false,
        text: i18n.t('classroom.forum:evaluate:rated'),
        id: 'evaluated',
        property: 'status',
      },
      {
        active: false,
        text: i18n.t('classroom.forum:evaluate:not.rated:plural'),
        id: 'not_evaluated',
        property: 'status',
      },
    ],
  },
]