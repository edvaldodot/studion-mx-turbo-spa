import i18n from '@/support/i18n'

export const defaultTabLinks = () => [
  {
    text: 'community:tab.link.5',
    location: { name: 'community.sessions' },
  },
  {
    text: 'community:tab.link.1',
    location: { name: 'community.users' },
  },
  {
    text: 'community:tab.link.2',
    location: { name: 'community.profiles' },
  },
  {
    text: 'community:tab.link.3',
    location: { name: 'community.groups' },
  },
  {
    text: 'community:tab.link.4',
    location: { name: 'community.metadata' },
  },
]

export const defaultFilterTagOptions = () => [
  {
    title: i18n.t('community.sessions.filters:categorie.class'),
    name: 'categories',
    items: [],
  },
  {
    title: i18n.t('community.sessions.filters:categorie.course'),
    name: 'course_categories',
    items: [],
  },
  {
    title: i18n.t('community.sessions.filters:type'),
    name: 'type',
    items: [
      { text: i18n.t('community.sessions.filters:type.open'), id: 'open', property: 'type' },
      { text: i18n.t('community.sessions.filters:type.closed'), id: 'closed', property: 'type' },
      {
        text: i18n.t('community.sessions.filters:type.individual'),
        id: 'individual',
        property: 'type',
      },
    ],
  },
  {
    title: i18n.t('community.sessions.filters:enrollments'),
    name: 'enrollments',
    items: [
      {
        text: i18n.t('community.sessions.filters:with.enrollments'),
        id: 'class_with_enrollments',
        property: 'class_with_enrollments',
      },
      {
        text: i18n.t('community.sessions.filters:without.enrollments'),
        id: 'class_without_enrollments',
        property: 'class_without_enrollments',
      },
    ],
  },
  {
    title: i18n.t('community.sessions.filters:link'),
    name: 'offering',
    items: [
      {
        text: i18n.t('community.sessions.filters:link.offering'),
        id: 'class_with_offering',
        property: 'class_with_offering',
      },
      {
        text: i18n.t('community.sessions.filters:link.solution'),
        id: 'class_without_offering',
        property: 'class_without_offering',
      },
    ],
  },
  {
    title: i18n.t('community.sessions.filters:status'),
    name: 'status',
    items: [
      {
        text: i18n.t('community.sessions.filters:status.in.progress'),
        id: 'in_progress',
        property: 'status',
      },
      { text: i18n.t('community.sessions.filters:status.ended'), id: 'ended', property: 'status' },
      {
        text: i18n.t('community.sessions.filters:status.not.started'),
        id: 'not_started',
        property: 'status',
      },
    ],
  },
  {
    title: i18n.t('community.sessions.filters:responsible'),
    name: 'responsible',
    items: [
      {
        text: i18n.t('community.sessions.filters:responsible.current'),
        id: 'current_user_in_session_team',
        property: 'current_user_in_session_team',
      },
    ],
  },
]

export const defaultFilterListOrderOptions = () => [
  {
    text: i18n.t('community.sessions.orders:enrollments.asc'),
    value: 0,
    property: 'enrollments',
    type: 'asc',
  },
  {
    text: i18n.t('community.sessions.orders:enrollments.desc'),
    value: 1,
    property: 'enrollments',
    type: 'desc',
  },
  {
    text: i18n.t('community.sessions.orders:created.desc'),
    value: 2,
    property: 'created_at',
    type: 'desc',
  },
  {
    text: i18n.t('community.sessions.orders:created.asc'),
    value: 3,
    property: 'created_at',
    type: 'asc',
  },
  {
    text: i18n.t('community.sessions.orders:name'),
    value: 4,
    property: 'name',
    type: 'asc',
  },
  {
    text: i18n.t('community.sessions.orders:start.time.asc'),
    value: 5,
    property: 'start_time',
    type: 'asc',
  },
  {
    text: i18n.t('community.sessions.orders:start.time.desc'),
    value: 6,
    property: 'start_time',
    type: 'desc',
  },
  {
    text: i18n.t('community.sessions.orders:end.time.asc'),
    value: 7,
    property: 'end_time',
    type: 'asc',
  },
  {
    text: i18n.t('community.sessions.orders:end.time.desc'),
    value: 8,
    property: 'end_time',
    type: 'desc',
  },
]

export const makePreferenceColumns = () => [
  {
    label: i18n.t('community.sessions:datatable.header.6'),
    value: 'offering',
  },
  {
    label: i18n.t('community.sessions:datatable.header.7'),
    value: 'solution',
  },
  {
    label: i18n.t('community.sessions:datatable.header.2'),
    value: 'session',
  },
  {
    label: i18n.t('global:slug.identity'),
    value: 'slug',
  },
  {
    label: i18n.t('community.sessions:datatable.header.8'),
    value: 'createdat',
  },
  {
    label: i18n.t('community.sessions:datatable.header.3'),
    value: 'vacancy',
  },
  {
    label: i18n.t('community.sessions:datatable.header.4'),
    value: 'start',
  },
  {
    label: i18n.t('community.sessions:datatable.header.5'),
    value: 'end',
  },
  {
    label: i18n.tc('global:branch', 1),
    value: 'branch',
  },
  {
    label: i18n.tc('global:category', 1),
    value: 'category',
  },
]

export const makeDefaultPreferences = () => [
  'offering',
  'solution',
  'session',
  'createdat',
  'vacancy',
  'branch',
  'category',
  'start',
  'end',
]
