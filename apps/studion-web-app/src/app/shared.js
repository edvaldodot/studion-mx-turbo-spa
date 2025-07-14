import i18n from '@/support/i18n'

export const AUTO_GENERATE_OPTIONS = [
  {
    value: 'original_date',
    label: i18n.t('community.sessions.add:modal.add.auto.create.option.1'),
  },
  {
    value: 'actual_date',
    label: i18n.t('community.sessions.add:modal.add.auto.create.option.2'),
  },
]

export const makePreferenceColumns = () => [
  {
    label: i18n.t('trails.list:datatable.header.name'),
    value: 'name',
  },
  {
    label: i18n.t('trails.list:datatable.header.trail_type'),
    value: 'trail_type',
  },
  {
    label: i18n.t('trails.list:datatable.header.course_count'),
    value: 'course_count',
  },
  {
    label: i18n.t('trails.list:datatable.header.duration'),
    value: 'duration',
  },
  {
    label: i18n.t('trails.list:datatable.header.student_count'),
    value: 'student_count',
  },
  {
    label: i18n.t('trails.list:datatable.header.status'),
    value: 'status',
  },
  {
    label: i18n.t('trails.list:datatable.header.branch'),
    value: 'branch',
  },
]

export const makeDefaultPreferences = () => [
  'name',
  'trail_type',
  'course_count',
  'duration',
  'student_count',
  'status',
  'branch',
]
