import { mapState } from 'vuex'
import { DEFAULT_TABS } from '@/app/classroom/modules/assessments/pages/Competency/CompetencyList/shared'

export default {
  computed: {
    ...mapState(['Classroom']),
  },

  methods: {
    addLTIEvaluationOnMenu(dataCourse, tabsLinks) {
      if (!this.$isEnabledFeature('lti_classroom')) return

      const hasLTI = dataCourse.find((course) => {
        return course.assets.find((a) => a.type.type === 'lti')
      })

      if (hasLTI) {
        tabsLinks.push(DEFAULT_TABS['lti'])
      }
    },
    checkExistingNotification(fieldName, id) {
      if (!this.$isEnabledFeature('classroom_notification')) return false
      return this.Classroom.notifications.find((notification) => notification[fieldName] === id)
    },

    hasExaminationNotification() {
      return this.Classroom.notifications.filter((notification) => {
        return Object.keys(notification).includes('examination_id')
      }).length
    },
    hasCompetencyNotification() {
      return this.Classroom.notifications.filter((notification) => {
        return Object.keys(notification).includes('competency_id')
      }).length
    },
    allowsCorrect(item) {
      return !['started', 'expired'].includes(item)
    },
  },
}
