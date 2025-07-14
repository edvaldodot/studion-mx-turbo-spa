import i18n from '@/support/i18n'

export const defaultFilterListOrderOptions = () => [
  {
    text: i18n.t('global:random.order.alphabetical'),
    value: 0,
    property: 'name',
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
        text: i18n.t('global:solution.status.em_andamento'),
        id: 'em_andamento',
        property: 'status',
      },
      {
        active: false,
        text: i18n.t('classroom.assessments.evaluation:status.accomplished'),
        id: 'realizado',
        property: 'status',
      },

      {
        active: false,
        text: i18n.t('global:solution.status.expirado'),
        id: 'expirado',
        property: 'status',
      },
      {
        active: false,
        text: i18n.t('global:solution.status.desistente'),
        id: 'desistente',
        property: 'status',
      },
    ],
  },
]
