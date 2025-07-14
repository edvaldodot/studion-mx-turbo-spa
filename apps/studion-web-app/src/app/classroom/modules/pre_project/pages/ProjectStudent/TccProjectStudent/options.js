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
    property: 'create_at',
    type: 'asc',
  },
  {
    text: i18n.t('global:order.date.old'),
    value: 3,
    property: 'create_at',
    type: 'desc',
  },
]

export const defaultFilterListTagOptions = () => [
  {
    title: i18n.t('community.index:datatable.header.status'),
    name: 'status',
    items: [
      {
        active: false,
        text: i18n.t('classroom.assessments.evaluation:status.pending'),
        id: 'pending',
        property: 'status',
      },
      {
        active: false,
        text: i18n.t('classroom.assessments.evaluation:status.accomplished'),
        id: 'accomplished',
        property: 'status',
      },
      {
        active: false,
        text: i18n.t('classroom.assessments.evaluation:status.passed'),
        id: 'passed',
        property: 'status',
      },
      {
        active: false,
        text: i18n.t('classroom.assessments.evaluation:status.failed'),
        id: 'failed',
        property: 'status',
      },
      {
        active: false,
        text: i18n.t('classroom.assessments.evaluation:status.retake'),
        id: 'retake',
        property: 'status',
      },
      {
        active: false,
        text: i18n.t('classroom.assessments.evaluation:status.awaiting_correction'),
        id: 'awaiting_correction',
        property: 'status',
      },
      {
        active: false,
        text: i18n.t('classroom.assessments.evaluation:status.not_started'),
        id: 'not_started',
        property: 'status',
      },
    ],
  },
]