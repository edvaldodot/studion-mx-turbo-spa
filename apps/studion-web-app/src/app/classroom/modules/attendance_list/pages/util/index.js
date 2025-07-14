import i18n from '@/support/i18n'

export const modalityListFactory = () => [
  {
    value: 'online',
    text: i18n.t('attendance.type.online'),
  },
  {
    value: 'hybrid',
    text: i18n.t('attendance.type.hybrid'),
  },
  {
    value: 'presential',
    text: i18n.t('attendance.type.presential'),
  },
]
