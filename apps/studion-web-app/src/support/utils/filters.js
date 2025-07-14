import i18n from '@/support/i18n'

export const attendanceFilterListOrderOptions = () => [
  {
    text: `${i18n.t('global:order.name')}`,
    value: 0,
    property: 'title',
    type: 'asc',
  },
  {
    text: `${i18n.t('global:order.name')} (${i18n.t('global:desc')})`,
    value: 1,
    property: 'title',
    type: 'desc',
  },
  {
    text: `${i18n.t('global:form.date')}`,
    value: 2,
    property: 'attendance_list_date',
    type: 'asc',
  },
  {
    text: `${i18n.t('global:form.date')} (${i18n.t('global:desc')})`,
    value: 3,
    property: 'attendance_list_date',
    type: 'desc',
  },
]

export const attendanceFilterListTagOptions = [
  {
    name: 'modality',
    title: i18n.t('global:modality'),
    items: [
      {
        active: false,
        id: 'hybrid',
        property: 'modality',
        text: i18n.t('attendance.type.hybrid'),
      },
      {
        active: false,
        id: 'online',
        property: 'modality',
        text: i18n.t('attendance.type.online'),
      },
      {
        active: false,
        id: 'presential',
        property: 'modality',
        text: i18n.t('attendance.type.presential'),
      },
    ],
  },
]

export const userSheetsOrderOptions = () => [
  {
    text: i18n.t('global:order.name'),
    value: 0,
    property: 'name',
    type: 'asc',
  },
  {
    text: `${i18n.t('global:order.name')} (${i18n.t('global:desc')})`,
    value: 1,
    property: 'name',
    type: 'desc',
  },
]
