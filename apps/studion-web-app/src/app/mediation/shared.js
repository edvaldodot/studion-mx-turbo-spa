import config from '@/config'
import i18n from '@/support/i18n'

import { required, requiredIf } from 'vuelidate/lib/validators'
import minValueIf from '@/support/customValidators/minValueIf'
import { validateTime, validateTriggerTime, isEmailOrSms } from './utils'
import { forumInteractionValidator } from '../classroom/modules/forum/shared'
import sumAllFileSizes from '@/support/customValidators/sumAllFileSizes'

const { EMAIL_ATTACHMENT_LIMIT_SIZE_MB } = config
export const EMAIL_ATTACHMENT_SIZE_BYTES = (EMAIL_ATTACHMENT_LIMIT_SIZE_MB || 5) * 1024 * 1024

export const ALLOWED_IMAGE_TYPES = ['image/jpg', 'image/jpeg', 'image/png', 'image/gif']

export const ALLOWED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'docx',
  '.docx',
]

export const MAX_FILE_SIZE = 5242880

export const TRANSMISSION_TYPES = [
  {
    component: 'EmailForm',
    text: i18n.t('global:form.email'),
    shortText: i18n.t('global:form.email'),
    value: 'email',
  },
  {
    component: 'SmsForm',
    text: i18n.t('global:form.sms'),
    shortText: i18n.t('global:form.sms'),
    value: 'sms',
  },
  {
    component: 'AnnouncementForm',
    text: i18n.t('global:form.announcement'),
    shortText: i18n.t('mediation.actions:form.tools.availability:announcement'),
    value: 'announcement',
  },
  {
    component: 'ForumForm',
    text: i18n.t('global:form.forum'),
    shortText: i18n.t('mediation.actions:form.tools.availability:topic'),
    value: 'topic',
  },
  {
    component: 'CalendarForm',
    text: i18n.t('solutions:tools.calendar'),
    shortText: i18n.t('mediation.actions:form.tools.availability:calendar'),
    value: 'event',
  },
  {
    component: 'ChatroomForm',
    text: i18n.t('solutions:tools.chat'),
    shortText: i18n.t('solutions:tools.chat'),
    value: 'chat',
  },
  {
    component: 'PollForm',
    text: i18n.t('global:form.poll'),
    shortText: i18n.t('global:form.poll'),
    value: 'poll',
  },
  {
    component: 'MessageForm',
    text: i18n.t('global:form.message'),
    shortText: i18n.t('global:form.message'),
    value: 'message',
  },
]

export const DATE_REFERENCES = [
  {
    text: i18n.t('mediation.actions:reference.session_start_date'),
    value: 'session_start_date',
  },
]

export const POLL_KEYS = {
  multiplesChoices: null,
  choices: ['', ''],
}

export const META_KEYS = {
  triggerTime: null,
  duration: null,
  startTime: null,
  endTime: null,
  transmissionType: null,
  color: null,
  allUsers: null,
  image: null,
  poll: null,
  responsible: null,
  operator: null,
  numPosts: null,
  numComments: null,
  allowEditPost: true,
  allowDeletePost: true,
  showTimeLeft: false,
  fixed: false,
  multipleSessions: false,
  hidePeople: false,
}

export const CARD_KEYS = {
  transmissionType: null,
  message: null,
  referenceDate: null,
  period: 'after',
  files: [],
  tempFile: null,
  tempMediaFile: null,
  isHidden: false,
  daysSinceReferenceDate: 0,
  meta: {},
}

export const TOOLS_WITH_META = ['announcement', 'event', 'chat', 'poll', 'topic']

/**
 * Callback to tell if meta property is required based on transmission type.
 * @param {META_KEYS} nestedModel
 * @returns {string}
 */
function requiresMeta(nestedModel) {
  const transmissionType = nestedModel && nestedModel.transmissionType
  return TOOLS_WITH_META.find((type) => type === transmissionType)
}

export const ACTION_FORM_VALIDATION = {
  filterId: {
    required: requiredIf(function (nestedModel) {
      return !requiresMeta(nestedModel)
    }),
  },
  meta: {
    triggerTime: {
      required: requiredIf(function (nestedModel) {
        if (isEmailOrSms(nestedModel) || nestedModel === 'message') {
          return nestedModel.referenceDate !== 'enrollment_date'
        }
      }),
      invalidHour: validateTriggerTime,
    },
    duration: { required: requiredIf(requiresMeta) },
    startTime: {
      required: requiredIf(requiresMeta),
      differentTime: validateTime('equalTime'),
      invalidHour: validateTriggerTime,
    },
    endTime: {
      required: requiredIf(requiresMeta),
      differentTime: validateTime('equalTime'),
      moreEndTime: validateTime('lessEndTime'),
      invalidHour: validateTriggerTime,
    },
    color: {
      required: requiredIf(function (nestedModel) {
        return nestedModel.transmissionType === 'event'
      }),
    },
    multiplesChoices: {
      required: requiredIf(function (nestedModel) {
        return nestedModel.transmissionType === 'poll'
      }),
    },
    choices: {
      $each: {
        required: requiredIf(function (nestedModel) {
          return nestedModel.transmissionType === 'poll'
        }),
      },
    },
    responsible: {
      required: requiredIf(function (nestedModel) {
        return nestedModel.transmissionType !== 'event'
      }),
    },

    ...forumInteractionValidator(),

    max_grade: {
      required: requiredIf(function (nestedModel) {
        return nestedModel.avaliative
      }),
      valueBiggerZero: minValueIf(0.01, function () {
        return true
      }),
    },
  },
  transmissionType: { required },
  title: { required },
  message: { required },
  files: {
    maxSizeAllowed: sumAllFileSizes(EMAIL_ATTACHMENT_SIZE_BYTES),
  },
  referenceDate: { required },
  daysSinceReferenceDate: { required },
  period: {
    required: requiredIf(function (nestedModel) {
      return nestedModel.referenceDate === 'session_start_date'
    }),
  },
}

export const defaultFilterListTagOptions = () => [
  {
    name: 'applicability',
    title: i18n.t('global:form.applicability'),
    items: [
      {
        active: false,
        id: 'solution',
        property: 'applicability',
        text: i18n.t('global:form.solutions'),
      },
      {
        active: false,
        id: 'session',
        property: 'applicability',
        text: i18n.t('global:form.sessions'),
      },
    ],
  },
]

export const REFERENCE_PERIOD = [
  { text: i18n.t('global:before'), value: 'before' },
  { text: i18n.t('global:after'), value: 'after' },
]

export const defaultFilterListOrderOptions = () => [
  {
    text: i18n.t('global:order.name'),
    value: 0,
    property: 'name',
    type: 'asc',
  },
  {
    text: i18n.t('global:order.date.new'),
    value: 1,
    property: 'created_at',
    type: 'desc',
  },
  {
    text: i18n.t('global:order.date.old'),
    value: 2,
    property: 'created_at',
    type: 'asc',
  },
]
