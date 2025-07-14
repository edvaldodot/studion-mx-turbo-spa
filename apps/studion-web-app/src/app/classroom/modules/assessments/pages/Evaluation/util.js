import i18n from '@/support/i18n'

export const defaultFilterTagOptions = () => [
  {
    title: i18n.t('community.sessions.filters:status'),
    name: 'status',
    items: [
      {
        text: i18n.t('classroom.assessments.evaluation:datatable.status.started'),
        id: 'started',
        property: 'status',
      },
      {
        text: i18n.t('classroom.assessments.evaluation:datatable.status.not.started'),
        id: 'not_started',
        property: 'status',
      },
      {
        text: i18n.t('classroom.assessments.evaluation:datatable.status.awaiting.correction'),
        id: 'awaiting_correction',
        property: 'status',
      },
      {
        text: i18n.t('classroom.assessments.evaluation:datatable.status.passed'),
        id: 'passed',
        property: 'status',
      },
      {
        text: i18n.t('classroom.assessments.evaluation:datatable.status.disapprove'),
        id: 'failed',
        property: 'status',
      },
    ],
  },
]

export const makePreferenceColumns = () => [
  {
    label: i18n.t('classroom.assessments.evaluation:datatable.header.1.1'),
    value: 'name',
  },
  {
    label: i18n.t('classroom.assessments.evaluation:datatable.header.2.1'),
    value: 'term',
  },
  {
    label: i18n.t('classroom.assessments.evaluation:datatable.header.11.1'),
    value: 'date',
  },
  {
    label: i18n.t('classroom.assessments.evaluation:datatable.header.16'),
    value: 'mandatory',
  },
  {
    label: i18n.t('classroom.assessments.evaluation:datatable.header.6'),
    value: 'attempts',
  },
  {
    label: i18n.t('classroom.assessments.evaluation:datatable.header.8'),
    value: 'grade',
  },
  {
    label: i18n.t('classroom.assessments.evaluation:datatable.header.9'),
    value: 'last-attempts',
  },
  {
    label: i18n.t('global:status'),
    value: 'status',
  },
]

export const makeDefaultPreferences = () => ['name', 'grade', 'status', 'mandatory']
