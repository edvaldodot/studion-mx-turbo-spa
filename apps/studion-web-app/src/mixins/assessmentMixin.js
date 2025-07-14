export const assessmentMixin = {
  methods: {
    getGradeValue(item, property) {
      const { examination_status, last_attempt, last_grade, max_grade } = item

      if (examination_status === 'pending') {
        if (property === 'max_grade') {
          if (last_attempt > 1) {
            return this.getFormattedGrade(max_grade)
          }
        } else {
          return this.$t('classroom.assessments.evaluation:status.not.corrected')
        }
      } else {
        if (property === 'max_grade') {
          if (max_grade && last_attempt > 0) {
            return this.getFormattedGrade(max_grade)
          }
        } else {
          if (last_grade && last_attempt > 0) {
            return this.getFormattedGrade(last_grade)
          }
        }
      }

      return '-'
    },

    getFormattedGrade(grade) {
      return grade > 0 ? `${grade}`.replace('.', ',') : '0'
    },
  },
}
