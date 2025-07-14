import i18n from '@/support/i18n'

/**
 * Map data from attemptCourseList
 * @param {Array<Object>} item
 * @returns {Array<Object>}
 */
export const mapSolutions = (item, isSelected = false) => {
  return {
    'id': item['course_id'],
    'name': item['course_name'],
    'image': item['course_image'],
    'mediaLength': item['course_media_length'],
    'type': {
      'name': item['course_type_name'],
      'alias': item['course_type_alias']
    },
    'author': {
      'name': item['author_name']
    },
    'active': item['course_active'],
    'topics_count': item['topics_count'],
    'media': [],
    'loading': false,
    'inOffer': isSelected,
    'course_created_at': item.course_created_at,
    'course_duration': item.course_duration,
    'conclusionCondition': item.conclusion_enrollment_condition
  }
}

export const TAG_OPTIONS = [
  {
    name: 'type',
    title: i18n.t('global:modality'),
    items: [
      {
        text: i18n.t('solutions.type:distance'),
        property: 'type',
        id: 'distance',
        active: false
      },
      {
        text: i18n.t('solutions.type:presential'),
        property: 'type',
        id: 'presential',
        active: false
      },
      {
        text: i18n.t('solutions.type:hybrid'),
        property: 'type',
        id: 'hybrid',
        active: false
      }
    ]
  }
]

export const defaultFilterListOrderOptions = () => [
  {
    text: i18n.t('global:order.name'),
    value: 0,
    property: 'name',
    type: 'asc'
  },
  {
    text: i18n.t('global:order.date.new'),
    value: 1,
    property: 'created_at',
    type: 'desc'
  },
  {
    text: i18n.t('global:order.date.old'),
    value: 2,
    property: 'created_at',
    type: 'asc'
  }
]
