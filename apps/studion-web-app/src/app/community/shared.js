import i18n from '@/support/i18n'
import { DEFAULT_MIN_PASSWORD_SIZE } from '@/support/utils/passwordSize'

export const TOPICS = {
  user: {
    add: [
      { text: i18n.t('community.users.add.batch.topics.1') },
      { text: i18n.t('community.users.add.batch.topics.3') },
      { handler: 'password', text: i18n.t('community.users.add.batch.topics.4', { size: DEFAULT_MIN_PASSWORD_SIZE }) },
      { text: i18n.t('community.users.add.batch.topics.5') }
    ],
    edit: [
      { text: i18n.t('community.users.edit.batch.topics.1') },
      { text: i18n.t('community.users.edit.batch.topics.2') },
      { text: i18n.t('community.users.edit.batch.topics.3') },
      { handler: 'password', text: i18n.t('community.users.edit.batch.topics.4', { size: DEFAULT_MIN_PASSWORD_SIZE }) },
      { text: i18n.t('community.users.edit.batch.topics.5') },
      { text: i18n.t('community.users.edit.batch.topics.6') }
    ]
  },
  enroll: {
    add: [
      { text: i18n.t('community.sessions.add.batch.topics.1') },
      { text: i18n.t('community.sessions.add.batch.topics.2') },
      { text: i18n.t('community.sessions.add.batch.topics.3') }
    ],
    edit: [
      { text: i18n.t('community.sessions.edit.batch.topics.1') },
      { text: i18n.t('community.sessions.edit.batch.topics.2') },
      { text: i18n.t('community.sessions.edit.batch.topics.3') }
    ]
  }
}

export const makeDefaultPreferences = () => ['picture', 'user', 'profile', 'username', 'status']
